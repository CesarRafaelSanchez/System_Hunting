import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Eye, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

export const TimeMark: React.FC = () => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'INACTIVE' | 'CHECKED_IN' | 'INCOMPLETE'>('INACTIVE');
  const [lastMark, setLastMark] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Camera stream states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null); // For Admin Modal Preview

  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchStatus = async () => {
    try {
      const { fetchApi } = await import('../../services/api.client');
      const data = await fetchApi<any[]>('/attendance/today');
      const mySession = data.find((s: any) => s.userId === user?.id);
      if (mySession) {
        setStatus(mySession.status);
        if (mySession.startedAt) {
          setLastMark(new Date(mySession.startedAt));
        }
      } else {
        setStatus('INACTIVE');
      }
    } catch (e) {
      console.warn('Could not fetch real attendance status, using local storage fallback', e);
      const savedStatus = localStorage.getItem('timemark_status');
      const savedDateStr = localStorage.getItem('timemark_date');
      if (savedStatus === 'CHECKED_IN' && savedDateStr) {
        const savedDate = new Date(savedDateStr);
        const today = new Date();
        if (savedDate.getDate() !== today.getDate() || savedDate.getMonth() !== today.getMonth()) {
          setStatus('INCOMPLETE');
        } else {
          setStatus('CHECKED_IN');
          setLastMark(savedDate);
        }
      }
    }
  };

  const fetchHistory = async () => {
    try {
      const { fetchApi } = await import('../../services/api.client');
      const data = await fetchApi<any[]>('/attendance/history');
      setHistoryData(data || []);
    } catch (e) {
      console.error('Error fetching attendance history', e);
    }
  };

  useEffect(() => {
    if (user?.role === 'HUNTER') {
      fetchStatus();
      fetchHistory();
    }
  }, [user]);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Native camera blocked or not supported, falling back to file input', err);
      setShowCamera(false);
      document.getElementById('selfieInput')?.click();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 480;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
            setCapturedFile(file);
            setPhoto(URL.createObjectURL(file));
            stopCamera();
            toast.success('Selfie capturada con éxito');
          }
        }, 'image/jpeg', 0.85);
      }
    }
  };

  const handleAction = async () => {
    if (!capturedFile) {
      toast.error('Debe tomar una selfie de evidencia antes de marcar su asistencia.');
      return;
    }

    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const { fetchApi } = await import('../../services/api.client');

      // 1. Upload file
      const formDataUpload = new FormData();
      formDataUpload.append('file', capturedFile);
      formDataUpload.append('entityType', 'ATTENDANCE');
      formDataUpload.append('category', 'SELFIE');

      const uploadRes = await fetchApi<any>('/media/upload', {
        method: 'POST',
        body: formDataUpload
      });
      const photoMediaId = uploadRes.id;

      // 2. Submit Check-In/Check-Out
      const isCheckIn = status === 'INACTIVE' || status === 'INCOMPLETE';
      const endpoint = isCheckIn ? '/attendance/check-in' : '/attendance/check-out';
      
      await fetchApi(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          photoMediaId
        })
      });

      const now = new Date();
      setLastMark(now);
      
      if (isCheckIn) {
        localStorage.setItem('timemark_status', 'CHECKED_IN');
        localStorage.setItem('timemark_date', now.toISOString());
        toast.success(`Check-In registrado exitosamente.`);
      } else {
        localStorage.removeItem('timemark_status');
        localStorage.removeItem('timemark_date');
        toast.success(`Check-Out registrado exitosamente.`);
      }
      setPhoto(null);
      setCapturedFile(null);
      await fetchStatus();
      await fetchHistory();
    } catch (error: any) {
      const msg = error.data?.message || error.message || 'Error registrando asistencia. Permita su ubicación y cámara.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCapturedFile(file);
      const url = URL.createObjectURL(file);
      setPhoto(url);
    }
  };

  // --- VISTA PARA BACKOFFICE / ADMIN ---
  if (user?.role === 'BACKOFFICE' || user?.role === 'ACCOUNT_ADMIN') {
    const [huntersData, setHuntersData] = useState<any[]>([]);

    useEffect(() => {
      const fetchHunters = async () => {
        try {
          const { fetchApi } = await import('../../services/api.client');
          const data = await fetchApi<any[]>('/attendance/today');
          setHuntersData(data || []);
        } catch (e) {
          console.error('Error fetching attendance data', e);
        }
      };
      fetchHunters();
    }, []);
    const filteredHunters = huntersData.filter(h => h.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Control de Asistencia</h2>
            <p className="text-gray-500 text-sm">Monitoreo en tiempo real del equipo en campo.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6 relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar Hunter..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ghl-lightBlue"
            />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-3 border-b border-gray-200">Hunter</th>
                  <th className="p-3 border-b border-gray-200 text-center">Selfie</th>
                  <th className="p-3 border-b border-gray-200">Hora Ingreso</th>
                  <th className="p-3 border-b border-gray-200 text-center">Estado Actual</th>
                  <th className="p-3 border-b border-gray-200 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredHunters.map(h => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 font-semibold text-gray-800">{h.name}</td>
                    <td className="p-3 text-center">
                      {h.hasPhoto && h.photoUrl ? (
                        <div 
                          onClick={() => setSelectedPhotoUrl(h.photoUrl)}
                          className="w-10 h-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center overflow-hidden border border-gray-300 cursor-pointer hover:opacity-85 transition-opacity"
                        >
                          <img src={h.photoUrl} alt="Selfie" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">Sin Foto</span>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 font-medium">{h.time}</td>
                    <td className="p-3 text-center">
                      {h.status === 'CHECKED_IN' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">En Ruta</span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Inactivo</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {h.photoUrl ? (
                        <button 
                          onClick={() => setSelectedPhotoUrl(h.photoUrl)} 
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 font-bold text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ver Foto
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredHunters.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">No se encontraron resultados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL PARA VER FOTO */}
        {selectedPhotoUrl && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setSelectedPhotoUrl(null)} 
                className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="p-6">
                <h3 className="font-bold text-gray-800 text-lg mb-4 text-center">Evidencia de Asistencia (Selfie)</h3>
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <img src={selectedPhotoUrl} alt="Selfie de asistencia" className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => setSelectedPhotoUrl(null)}
                  className="mt-6 w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA PARA HUNTER ---
  return (
    <>
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Registro de Asistencia</h2>
        
        {status === 'INCOMPLETE' && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3.5 text-xs font-medium leading-relaxed mb-4">
            ⚠️ Turno Incompleto: El sistema detectó que no registraste tu Check-Out en tu último turno. Esto es informativo para BackOffice. Puedes iniciar un nuevo turno hoy.
          </div>
        )}

        <div className="mb-6 text-center">
          <p className="text-gray-600 font-medium mb-2 flex items-center justify-center gap-2">
            Estado Actual: 
            {status === 'CHECKED_IN' ? (
              <span className="bg-green-50 text-green-600 border border-green-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">EN RUTA</span>
            ) : (
              <span className="bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">INACTIVO</span>
            )}
          </p>
          {lastMark && status === 'CHECKED_IN' && (
            <p className="text-sm text-gray-500">
              Último Check-In: {lastMark.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="mb-6 flex flex-col items-center">
          {showCamera && (
            <div className="flex flex-col items-center border p-4 rounded-2xl bg-gray-50 mb-4 w-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-xs h-64 object-cover rounded-xl mb-3 border bg-black"
              />
              <div className="flex gap-3 w-full max-w-xs">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                >
                  Capturar Foto
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {!showCamera && (
            <button 
              className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center border border-slate-200 transition-all w-full mb-3 gap-2"
              onClick={startCamera}
            >
              <Camera className="w-4 h-4" />
              {photo ? 'Cambiar Selfie' : 'Tomar Selfie de Asistencia'}
            </button>
          )}

          <input 
            id="selfieInput" 
            type="file" 
            accept="image/*" 
            capture="user" 
            className="hidden" 
            onChange={handlePhotoCapture} 
          />
          
          {photo && !showCamera && (
            <div className="mt-2">
              <img src={photo} alt="Selfie" className="w-24 h-24 object-cover rounded-full border-4 border-slate-100 shadow-sm" />
            </div>
          )}
        </div>

        <button 
          className={`font-bold py-3 px-4 rounded-xl text-sm shadow-sm transition-all w-full flex items-center justify-center gap-2 ${
            status === 'CHECKED_IN' 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          } ${(!photo) || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || !photo}
          onClick={handleAction}
        >
          <MapPin className="w-4 h-4" />
          {loading ? 'Procesando...' : (status === 'CHECKED_IN' ? 'Finalizar Turno (Check-Out)' : 'Iniciar Turno (Check-In)')}
        </button>
        
        {(!photo) && (
          <p className="text-[11px] text-gray-500 text-center mt-3">
            Debe tomar o subir una selfie para registrar su asistencia
          </p>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Historial de Asistencia</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-3 border-b border-gray-200">Fecha</th>
                <th className="p-3 border-b border-gray-200">Check-In</th>
                <th className="p-3 border-b border-gray-200">Check-Out</th>
                <th className="p-3 border-b border-gray-200">Horas Totales</th>
                <th className="p-3 border-b border-gray-200 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {historyData.map((h: any) => (
                <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-3 font-medium text-gray-800">{h.workDate}</td>
                  <td className="p-3 text-gray-600">{h.checkIn}</td>
                  <td className="p-3 text-gray-600">{h.checkOut}</td>
                  <td className="p-3 text-gray-600">{h.totalHours}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      h.status === 'Completado' ? 'bg-green-100 text-green-700' :
                      h.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>{h.status === 'CHECKED_IN' ? 'En Ruta' : h.status}</span>
                  </td>
                </tr>
              ))}
              {historyData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400">No hay registros de asistencia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
