import React, { useState, useEffect } from 'react';
import { Camera, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

export const TimeMark: React.FC = () => {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<'INACTIVE' | 'CHECKED_IN' | 'INCOMPLETE'>('INACTIVE');
  const [lastMark, setLastMark] = useState<Date | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedStatus = localStorage.getItem('timemark_status');
    const savedDateStr = localStorage.getItem('timemark_date');
    if (savedStatus === 'CHECKED_IN' && savedDateStr) {
      const savedDate = new Date(savedDateStr);
      const today = new Date();
      if (savedDate.getDate() !== today.getDate() || savedDate.getMonth() !== today.getMonth()) {
        setStatus('INCOMPLETE');
        localStorage.setItem('timemark_status', 'INCOMPLETE');
      } else {
        setStatus('CHECKED_IN');
        setLastMark(savedDate);
      }
    } else if (savedStatus === 'INCOMPLETE') {
      setStatus('INCOMPLETE');
    }
  }, []);

  const handleAction = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const coords = `${position.coords.latitude}, ${position.coords.longitude}`;

      const now = new Date();
      setLastMark(now);
      
      if (status === 'INACTIVE' || status === 'INCOMPLETE') {
        setStatus('CHECKED_IN');
        localStorage.setItem('timemark_status', 'CHECKED_IN');
        localStorage.setItem('timemark_date', now.toISOString());
        toast.success(`Check-In registrado exitosamente en: ${coords}`);
      } else {
        setStatus('INACTIVE');
        localStorage.setItem('timemark_status', 'INACTIVE');
        localStorage.removeItem('timemark_date');
        toast.success(`Check-Out registrado exitosamente en: ${coords}`);
      }
    } catch (error) {
      toast.error('Debe permitir el acceso a su ubicación para registrar la asistencia.');
    } finally {
      setLoading(false);
      setPhoto(null);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhoto(url);
    }
  };

  // --- VISTA PARA BACKOFFICE / ADMIN ---
  if (user?.role === 'BACKOFFICE' || user?.role === 'ADMIN') {
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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
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
                  <th className="p-3 border-b border-gray-200">Alertas</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredHunters.map(h => (
                  <tr key={h.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-3 font-semibold text-gray-800">{h.name}</td>
                    <td className="p-3 text-center">
                      {h.hasPhoto ? (
                        <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center overflow-hidden border border-gray-300">
                          {h.photoUrl ? <img src={h.photoUrl} alt="Selfie" className="w-full h-full object-cover" /> : <Camera className="w-4 h-4 text-gray-400" />}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
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
                    <td className="p-3">
                      {h.alert ? (
                        <span className="text-amber-600 text-xs font-semibold flex items-center gap-1">
                          ⚠️ {h.alert}
                        </span>
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
          <button 
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center border border-slate-200 transition-all w-full mb-3 gap-2"
            onClick={() => document.getElementById('selfieInput')?.click()}
          >
            <Camera className="w-4 h-4" />
            {photo ? 'Cambiar Selfie' : 'Tomar Selfie de Asistencia'}
          </button>
          <input 
            id="selfieInput" 
            type="file" 
            accept="image/*" 
            capture="user" 
            className="hidden" 
            onChange={handlePhotoCapture} 
          />
          
          {photo && (
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
          } ${(!photo && status !== 'CHECKED_IN') || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading || (!photo && status !== 'CHECKED_IN')}
          onClick={handleAction}
        >
          <MapPin className="w-4 h-4" />
          {loading ? 'Procesando...' : (status === 'CHECKED_IN' ? 'Finalizar Turno (Check-Out)' : 'Iniciar Turno (Check-In)')}
        </button>
        
        {(!photo && status !== 'CHECKED_IN') && (
          <p className="text-[11px] text-gray-500 text-center mt-3">
            Debe tomar una selfie para iniciar su turno
          </p>
        )}
      </div>

      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
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
              <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 font-medium text-gray-800">04/07/2026</td>
                <td className="p-3 text-gray-600">08:00 AM</td>
                <td className="p-3 text-gray-600">05:00 PM</td>
                <td className="p-3 text-gray-600">9h 0m</td>
                <td className="p-3 text-center">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Completado</span>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 font-medium text-gray-800">03/07/2026</td>
                <td className="p-3 text-gray-600">08:15 AM</td>
                <td className="p-3 text-gray-600">06:00 PM</td>
                <td className="p-3 text-gray-600">9h 45m</td>
                <td className="p-3 text-center">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Completado</span>
                </td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="p-3 font-medium text-gray-800">02/07/2026</td>
                <td className="p-3 text-gray-600">07:50 AM</td>
                <td className="p-3 text-gray-400 italic">No registrado</td>
                <td className="p-3 text-gray-400">-</td>
                <td className="p-3 text-center">
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-semibold">Incompleto</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
