import React, { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, Building, Edit2, User, ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import { compressImage } from '../../../utils/imageUtils';


// Global configurations to prevent unmounting inputs and losing focus
let globalIsEditing = false;
let globalHandleChange: any = null;

const convertToInputDateFormat = (val: string) => {
  if (!val || val === '-') return '';
  // If format is "DD/MM/YYYY", convert to "YYYY-MM-DD"
  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const d = match[1].padStart(2, '0');
    const m = match[2].padStart(2, '0');
    const y = match[3];
    return `${y}-${m}-${d}`;
  }
  // If format is "D/M/YY", convert to "YYYY-MM-DD"
  const matchShort = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (matchShort) {
    const d = matchShort[1].padStart(2, '0');
    const m = matchShort[2].padStart(2, '0');
    const y = '20' + matchShort[3];
    return `${y}-${m}-${d}`;
  }
  return val;
};

const Field = ({ label, name, value, type = "text", colSpan = 1, options, isReadOnly }: { label: string, name: string, value: string, type?: string, colSpan?: number, options?: string[], isReadOnly?: boolean }) => (
  <div className={colSpan > 1 ? `col-span-${colSpan}` : ''}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {globalIsEditing && !isReadOnly ? (
      type === "textarea" ? (
        <textarea name={name} className="w-full border border-ghl-lightBlue rounded px-2 py-1 text-sm mt-1 outline-none focus:ring-1 focus:ring-ghl-blue" value={value} onChange={globalHandleChange} rows={2} />
      ) : type === "select" && options ? (
        <select name={name} className="w-full border border-ghl-lightBlue rounded px-2 py-1 text-sm mt-1 outline-none focus:ring-1 focus:ring-ghl-blue bg-white" value={value} onChange={globalHandleChange}>
          <option value="-">- Seleccionar -</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          name={name} 
          className="w-full border border-ghl-lightBlue rounded px-2 py-1 text-sm mt-1 outline-none focus:ring-1 focus:ring-ghl-blue" 
          value={type === 'date' ? convertToInputDateFormat(value) : value} 
          onChange={globalHandleChange} 
        />
      )
    ) : (
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '-'}</p>
    )}
  </div>
);

export const OpportunitySplitView: React.FC<{ card: any; onClose: () => void; onApprove: (towersData?: any[]) => void; onSave?: () => void | Promise<void> }> = ({ card, onClose, onApprove, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic_info'); // basic_info, form_2, form_3, photos
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<string | null>(null);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  
  const { user } = useAuthStore();
  const isBackOfficeOrAdmin = user?.role === 'BACKOFFICE' || user?.role === 'BACKOFFICE_VENTAS' || user?.role === 'POSTVENTA' || user?.role === 'ACCOUNT_ADMIN' || user?.role === 'ADMIN';
  const isB2B = false;
  

  const getCoordinates = () => {
    const gps = card.property?.coordenadasGps;
    if (!gps) return '';
    if (typeof gps === 'string') {
      const parts = gps.replace(/[()]/g, '').split(',');
      if (parts.length === 2) {
        // Postgres returns (x,y) -> (lng,lat). We want lat,lng -> y,x
        return `${parts[1].trim()}, ${parts[0].trim()}`;
      }
      return gps.replace(/[()]/g, '');
    }
    if (typeof gps === 'object' && gps.x !== undefined && gps.y !== undefined) {
      return `${gps.y}, ${gps.x}`;
    }
    return '';
  };

  const formatDateString = (dateVal: any) => {
    if (!dateVal) return '-';
    const str = typeof dateVal === 'string' ? dateVal : dateVal.toISOString ? dateVal.toISOString() : '';
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '-';
      const userTimezoneOffset = d.getTimezoneOffset() * 60000;
      const localDate = new Date(d.getTime() + userTimezoneOffset);
      return localDate.toLocaleDateString();
    } catch (e) {
      return '-';
    }
  };

  // Determine if Form 2 and Form 3 have been completed based on the current stage index (0-19)
  const hasForm2 = card.stage >= 5;
  const hasForm3 = card.stage >= 12;

  const vf = card.ventaFija || card.data?.ventaFija || {};

  // Data State - mapped from specifications
  const [formData, setFormData] = useState<any>({
    companyId: card.companyId || card.property?.companyId || '',
    reasignarUserId: card.currentOwnerUserId || '',
    notasPostventa: vf.notasPostventa || '',
    // VentaFija B2B fields
    ruc: vf.ruc || '',
    razonSocial: vf.razonSocial || '',
    representanteLegal: vf.representanteLegal || '',
    dniRrll: vf.dniRrll || '',
    celularRrll: vf.celularRrll || '',
    correoElectronico: vf.correoElectronico || '',
    nombrePadresRrll: vf.nombrePadresRrll || '',
    fechaNacimientoRrll: vf.fechaNacimientoRrll || '',
    lugarNacimientoRrll: vf.lugarNacimientoRrll || '',
    tipoDomicilio: vf.tipoDomicilio || 'Casa',
    direccionFiscal: vf.direccionFiscal || '',
    direccionInstalacion: vf.direccionInstalacion || '',
    departamento: vf.departamento || '',
    provincia: vf.provincia || '',
    distrito: vf.distrito || '',
    referencia: vf.referencia || '',
    tipoTecnologia: vf.tipoTecnologia || '',
    tipoPlay: vf.tipoPlay || '',
    velocidad: vf.velocidad || '',
    cargoFijoSinIgv: vf.cargoFijoSinIgv || '',
    campana: vf.campana || '',
    adicionales: vf.adicionales || '',
    tipoServicio: vf.tipoServicio || 'Fija',
    cantidadLineas: vf.cantidadLineas || '',
    tipoMovil: vf.tipoMovil || '',
    planoUrl: vf.planoUrl || '',
    observaciones: vf.observaciones || '',
    // Form 1
    ejecutivoF1: card.isReferral 
      ? card.referredHunterName 
      : ((card.property?.ejecutivo?.length === 36 ? card.currentOwnerUser?.fullName : card.property?.ejecutivo) || card.currentOwnerUser?.fullName || 'Sin Asignar'),
    isReferralF1: card.isReferral,
    partnerSupervisorF1: card.partnerSupervisor?.fullName || '-',
    resultadoVisitaF1: card.property?.resultadoVisita || '-',
    detalleVisitaF1: card.property?.detalleVisita || '-',
    direccionExactaF1: card.property?.direccionExacta || '-',
    
    // Form 2
    hunterF2: card.isReferral 
      ? card.referredHunterName 
      : ((card.property?.ejecutivo?.length === 36 ? card.currentOwnerUser?.fullName : card.property?.ejecutivo) || card.currentOwnerUser?.fullName || 'Sin Asignar'),
    ingresoF2: hasForm2 ? (card.property?.origenProspeccion === 'TERRENO' ? 'Propio' : (card.property?.origenProspeccion || '-')) : '-',
    tipoEdificioF2: hasForm2 ? (card.property?.clasificacionProyecto || '-') : '-',
    nombreProyectoF2: card.property?.nombreProyecto || card.title || '-',
    tipoViaF2: card.property?.tipoVia || '-',
    nombreViaF2: card.property?.nombreVia || '-',
    numeracionViaF2: card.property?.numeracionMunicipal || '-',
    distritoF2: card.property?.distrito?.nombre || card.property?.distrito || '-',
    coordenadasF2: getCoordinates(),
    numeroHpsF2: card.property?.totalHogares?.toString() || '-',
    estrenoF2: hasForm2 
      ? (['SÍ', 'SI', 'Sí', 'Si', 'EN_CONSTRUCCION', 'ESTRENO'].includes(card.property?.estadoConstruccion) ? 'SÍ' : 'NO') 
      : '-',
    fechaMontantesF2: hasForm2 ? formatDateString(card.property?.terminoMontantes) : '-',
    fechaEntregaF2: hasForm2 ? formatDateString(card.property?.fechaEntrega) : '-',
    inmobiliariaF2: card.property?.inmobiliaria || '-',
    asignarF2: 'Asignar',

    // Form 3
    nombreCanalF3: hasForm3 ? (card.canalHunting || '-') : '-',
    ingresoF3: hasForm3 ? (card.property?.origenProspeccion === 'TERRENO' ? 'Propio' : (card.property?.origenProspeccion || '-')) : '-',
    hunterF3: card.isReferral 
      ? card.referredHunterName 
      : ((card.property?.ejecutivo?.length === 36 ? card.currentOwnerUser?.fullName : card.property?.ejecutivo) || card.currentOwnerUser?.fullName || 'Sin Asignar'),
    nombreProyectoF3: card.property?.nombreProyecto || card.title || '-',
    tipoProyectoF3: hasForm3 ? (card.property?.tipoDesarrollo || '-') : '-',
    origenF3: hasForm3 ? (card.property?.origenProspeccion === 'TERRENO' ? 'Propio' : (card.property?.origenProspeccion || '-')) : '-',
    clasificacionF3: hasForm3 ? (card.property?.clasificacionProyecto || '-') : '-',
    tipoConstruccionF3: hasForm3 ? (card.property?.estadoConstruccion || '-') : '-',
    juntaDirectivaF3: hasForm3 ? (card.property?.juntaDirectiva || '-') : '-',
    cargoResponsableF3: hasForm3 ? (card.property?.cargoResponsable || '-') : '-',
    nombreResponsableF3: hasForm3 ? (card.property?.nombreResponsable || '-') : '-',
    telefonoResponsableF3: hasForm3 ? (card.property?.telefonoResponsable || '-') : '-',
    correoResponsableF3: hasForm3 ? (card.property?.correoResponsable || '-') : '-',
    visitaInspeccionF3: hasForm3 ? formatDateString(card.property?.fechaVisitaTecnica) : '-',

    horarioVisitaF3: hasForm3 ? (card.property?.horarioVisita || '-') : '-',
    departamentoF3: hasForm3 ? (card.property?.departamento || '-') : '-',
    provinciaF3: hasForm3 ? (card.property?.provincia || '-') : '-',
    distritoF3: hasForm3 ? (card.property?.distrito || '-') : '-',
    urbanizacionF3: hasForm3 ? (card.property?.urbanizacionZona || '-') : '-',
    codigoPostalF3: hasForm3 ? (card.property?.codigoPostal || '-') : '-',
    tipoViaF3: card.property?.tipoVia || '-',
    nombreViaF3: card.property?.nombreVia || '-',
    numeracionViaF3: card.property?.numeracionMunicipal || '-',
    coordenadasF3: getCoordinates(),
    totalTorresF3: card.property?.totalTorres?.toString() || '-',
    totalHogaresF3: hasForm3 ? (card.property?.totalHogares?.toString() || '-') : '-',
    clientesInteresadosF3: hasForm3 ? (card.property?.clientesInteresados?.toString() || '-') : '-',
    inmobiliariaF3: card.property?.inmobiliaria || '-',
    fechaEntregaF3: hasForm3 ? formatDateString(card.property?.fechaEntrega) : '-',
    fechaMontantesF3: hasForm3 ? formatDateString(card.property?.terminoMontantes) : '-',
    fechaMechaF3: hasForm3 ? formatDateString(card.property?.terminoMecha) : '-'
  });

  const [towers, setTowers] = useState<any[]>(
    card.property?.torres?.slice().sort((a: any, b: any) => a.nombreTorre.localeCompare(b.nombreTorre)).map((t: any) => ({
      nombre_torre: t.nombreTorre,
      pisos_torre: t.pisos?.length?.toString() || '0',
      hogares_por_piso: t.pisos?.slice().sort((p1: any, p2: any) => p1.numeroPiso - p2.numeroPiso).map((p: any) => p.hogaresCantidad).join(',') || '0'
    })) || []
  );

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { fetchApi } = await import('../../../services/api.client');
        const submissions = await fetchApi<any[]>(`/hunting/opportunities/${card.id}/submissions`);
        if (submissions && submissions.length > 0) {
          setFormData((prev: any) => {
            const newFormData = { ...prev };
            submissions.forEach((sub: any) => {
              const payload = sub.raw_payload_json;
              if (sub.form_code === 'FORM_ASIGNACION') {
                newFormData.inmobiliariaF2 = payload.inmobiliaria || '-';
              }
              else if (sub.form_code === 'FORM_FICHA_DATOS') {
                newFormData.cargoResponsableF3 = payload.cargoResponsable || '-';
                newFormData.nombreResponsableF3 = payload.nombreResponsable || '-';
                newFormData.telefonoResponsableF3 = payload.telefonoResponsable || '-';
                newFormData.correoResponsableF3 = payload.correoResponsable || '-';
                newFormData.inmobiliariaF3 = payload.inmobiliaria || '-';
                newFormData.fechaEntregaF3 = payload.fechaEntrega ? formatDateString(payload.fechaEntrega) : '-';
                newFormData.fechaMontantesF3 = payload.fechaMontantes ? formatDateString(payload.fechaMontantes) : '-';
                newFormData.fechaMechaF3 = payload.fechaMecha ? formatDateString(payload.fechaMecha) : '-';
              }
            });
            return newFormData;
          });
        }
      } catch (e) {
        console.error('Error loading submissions', e);
      }
    };
    
    fetchSubmissions();
  }, [card.id]);

  // Load media assets for the photos tab
  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { fetchApi } = await import('../../../services/api.client');
        const assets = await fetchApi<any[]>(`/media/assets/${card.id}`);
        if (Array.isArray(assets)) setMediaAssets(assets);
      } catch (e) {
        // Silently fail - photos tab just shows empty
        console.warn('No se pudieron cargar los media assets', e);
      }
    };
    fetchMedia();
  }, [card.id]);

  useEffect(() => {
    if (isBackOfficeOrAdmin) {
      const fetchCompanies = async () => {
        try {
          const { fetchApi } = await import('../../../services/api.client');
          const data = await fetchApi<any[]>('/companies');
          setCompaniesList(data);
          
          const users = await fetchApi<any[]>('/users');
          setUsersList(users.filter(u => u.role === 'HUNTER'));
        } catch (e) {
          console.error('Error fetching companies or users', e);
        }
      };
      fetchCompanies();
    }
  }, [isBackOfficeOrAdmin]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingPhoto(category);
    try {
      const file = e.target.files[0];
      const compressedFile = await compressImage(file, 1600, 1600, 0.8);
      const formDataUpload = new FormData();
      formDataUpload.append('file', compressedFile, file.name);
      formDataUpload.append('entityType', 'OPPORTUNITY');
      formDataUpload.append('entityId', card.id);
      formDataUpload.append('category', category);
      formDataUpload.append('fileName', file.name);
      formDataUpload.append('mimeType', file.type || 'image/jpeg');
      formDataUpload.append('mediaType', file.type?.startsWith('image/') ? 'IMAGE' : 'DOCUMENT');
      formDataUpload.append('fileSize', String(compressedFile.size || file.size));


      const { fetchApi } = await import('../../../services/api.client');
      const saved = await fetchApi<any>('/media/upload', { method: 'POST', body: formDataUpload });
      // Refresh assets
      setMediaAssets(prev => [
        ...prev.filter(a => a.category !== category),
        { ...saved, url: saved.url || saved.fileUrl }
      ]);
      toast.success('Imagen actualizada correctamente');
    } catch (err) {
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploadingPhoto(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTowerChange = (index: number, field: string, value: string) => {
    const newTowers = [...towers];
    newTowers[index] = { ...newTowers[index], [field]: value };
    setTowers(newTowers);
  };

  const addTower = () => {
    setTowers([...towers, { nombre_torre: `Torre ${towers.length + 1}`, pisos_torre: '', hogares_por_piso: '' }]);
  };

  const removeTower = (index: number) => {
    setTowers(towers.filter((_, i) => i !== index));
  };

  const isValidationStage = [4, 5, 6, 12, 13, 14].includes(card.stage);
  const isForm3Stage = [12, 13, 14].includes(card.stage);

  globalIsEditing = isEditing;
  globalHandleChange = handleChange;

  return (
    <div className="fixed inset-y-0 right-0 w-[85%] max-w-7xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-ghl-surface">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{isB2B ? 'Detalle de la Venta B2B' : 'Detalle del Predio'}</p>
          <h2 className="text-2xl font-black text-gray-900 leading-none">{card.title || card.property?.nombreProyecto || 'Oportunidad Sin Nombre'}</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel 1: Contenido con Tabs */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-50 overflow-hidden">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
            {isB2B ? (
              <>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'basic_info' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('basic_info')}>
                  INFORMACIÓN BÁSICA
                </button>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'b2b_client' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('b2b_client')}>
                  DETALLE DEL CLIENTE
                </button>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'b2b_service' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('b2b_service')}>
                  DATOS DEL SERVICIO
                </button>
              </>
            ) : (
              <>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'basic_info' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('basic_info')}>
                  INFORMACIÓN BÁSICA
                </button>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'form_1' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('form_1')}>
                  REGISTRO DE PREDIO
                </button>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'form_2' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('form_2')}>
                  FORM. ASIGNACIÓN
                </button>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'form_3' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('form_3')}>
                  FICHA DE DATOS
                </button>
                <button className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'photos' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('photos')}>
                  FOTOS
                </button>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {activeTab === 'basic_info' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-ghl-lightBlue"/> Detalles de la Oportunidad</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{isB2B ? 'Razón Social / Cliente' : 'Nombre del Proyecto / Predio'}</label>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">{card.title || card.property?.nombreProyecto || '-'}</p>
                  </div>
                  
                  {isBackOfficeOrAdmin && (
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Empresa Asignada</label>
                      {isEditing ? (
                        <select 
                          name="companyId" 
                          className="w-full border border-ghl-lightBlue rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ghl-blue bg-white" 
                          value={formData.companyId || ''} 
                          onChange={handleChange}
                        >
                          <option value="">- Seleccionar Empresa -</option>
                          {companiesList.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {companiesList.find(c => c.id === formData.companyId)?.name || 'Sin Asignar'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{isB2B ? 'Asesor Comercial' : 'Hunter Asignado'}</label>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {card.currentOwnerUser?.fullName || card.property?.ejecutivo || 'Sin Asignar'}
                    </p>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Distrito</label>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">{isB2B ? (formData.distrito || '-') : formData.distritoF2}</p>
                  </div>

                  {/* Notas Postventa (Solo visibles si es B2B / Ventas) */}
                  {(!card.propertyId || card.company?.tipoNegocio === 'VENTAS_B2B') && (
                    <div className="col-span-2 mt-4 border-t border-gray-100 pt-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Notas Postventa (Seguimiento de la venta)
                      </label>
                      {isEditing ? (
                        <textarea
                          name="notasPostventa"
                          className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                          value={formData.notasPostventa || ''}
                          onChange={handleChange}
                          placeholder="Ingrese notas de seguimiento de postventa (ej: fecha de llamadas, confirmación de recibos, etc.)"
                          rows={4}
                        />
                      ) : (
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 min-h-[100px] text-sm text-slate-700 whitespace-pre-wrap">
                          {formData.notasPostventa || 'No hay notas postventa registradas aún.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isB2B && activeTab === 'b2b_client' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Building className="w-5 h-5 text-ghl-lightBlue"/> Datos Corporativos de la Empresa
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="RUC" name="ruc" value={formData.ruc} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Razón Social" name="razonSocial" value={formData.razonSocial} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Dirección Fiscal" name="direccionFiscal" value={formData.direccionFiscal} colSpan={2} isReadOnly={user?.role === 'POSTVENTA'} />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-ghl-lightBlue"/> Representante Legal (RRLL)
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="Nombre del Representante" name="representanteLegal" value={formData.representanteLegal} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="DNI del RRLL" name="dniRrll" value={formData.dniRrll} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Celular de Contacto" name="celularRrll" value={formData.celularRrll} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Correo Electrónico" name="correoElectronico" value={formData.correoElectronico} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Nombre de Padre y Madre" name="nombrePadresRrll" value={formData.nombrePadresRrll} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Fecha de Nacimiento" name="fechaNacimientoRrll" value={formData.fechaNacimientoRrll} type="date" isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Lugar de Nacimiento" name="lugarNacimientoRrll" value={formData.lugarNacimientoRrll} isReadOnly={user?.role === 'POSTVENTA'} />
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Building className="w-5 h-5 text-ghl-lightBlue"/> Dirección de Instalación
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="Dirección Exacta" name="direccionInstalacion" value={formData.direccionInstalacion} colSpan={2} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Departamento" name="departamento" value={formData.departamento} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Provincia" name="provincia" value={formData.provincia} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Distrito" name="distrito" value={formData.distrito} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Tipo de Domicilio" name="tipoDomicilio" value={formData.tipoDomicilio} type="select" options={['Casa', 'Oficina', 'Local Comercial', 'Departamento', 'Otro']} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Referencia" name="referencia" value={formData.referencia} colSpan={2} isReadOnly={user?.role === 'POSTVENTA'} />
                  </div>
                </div>
              </div>
            )}

            {isB2B && activeTab === 'b2b_service' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ghl-lightBlue"/> Datos del Plan / Servicio Contratado
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="Tipo de Servicio" name="tipoServicio" value={formData.tipoServicio} type="select" options={['Fija', 'Movil']} isReadOnly={user?.role === 'POSTVENTA'} />
                    
                    {formData.tipoServicio === 'Fija' ? (
                      <>
                        <Field label="Tecnología" name="tipoTecnologia" value={formData.tipoTecnologia} type="select" options={['FTTH', 'HFC']} isReadOnly={user?.role === 'POSTVENTA'} />
                        <Field label="Plan (Play)" name="tipoPlay" value={formData.tipoPlay} type="select" options={['1Play', '2Play', '3Play']} isReadOnly={user?.role === 'POSTVENTA'} />
                        <Field label="Velocidad Contratada" name="velocidad" value={formData.velocidad} isReadOnly={user?.role === 'POSTVENTA'} />
                        <Field label="Cargo Fijo Mensual (Sin IGV)" name="cargoFijoSinIgv" value={formData.cargoFijoSinIgv} isReadOnly={user?.role === 'POSTVENTA'} />
                        <Field label="Campaña Aplicada" name="campana" value={formData.campana} isReadOnly={user?.role === 'POSTVENTA'} />
                      </>
                    ) : (
                      <>
                        <Field label="Tipo Móvil" name="tipoMovil" value={formData.tipoMovil} type="select" options={['Alta', 'Portabilidad']} isReadOnly={user?.role === 'POSTVENTA'} />
                        <Field label="Cantidad de Líneas" name="cantidadLineas" value={formData.cantidadLineas} isReadOnly={user?.role === 'POSTVENTA'} />
                      </>
                    )}
                    
                    <Field label="Servicios Adicionales" name="adicionales" value={formData.adicionales} type="textarea" colSpan={2} isReadOnly={user?.role === 'POSTVENTA'} />
                    <Field label="Observaciones de la Venta" name="observaciones" value={formData.observaciones} type="textarea" colSpan={2} isReadOnly={user?.role === 'POSTVENTA'} />
                  </div>
                </div>

                {formData.planoUrl && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-ghl-lightBlue"/> Croquis o Plano de Instalación
                    </h4>
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Archivo Adjunto</p>
                        <a 
                          href={formData.planoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all"
                        >
                          Descargar Croquis / Plano
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'form_1' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-ghl-lightBlue"/> Génesis / Registro de Predio</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Tipo de Hunter" name="isReferralF1" value={formData.isReferralF1 ? 'Referido Externo' : 'Hunter Interno'} />
                  {formData.isReferralF1 ? (
                    <>
                      <Field label="Hunter Referido" name="ejecutivoF1" value={formData.ejecutivoF1} />
                      <Field label="Socio Comercial (Supervisor)" name="partnerSupervisorF1" value={formData.partnerSupervisorF1} />
                    </>
                  ) : (
                    <Field label="Ejecutivo Interno" name="ejecutivoF1" value={formData.ejecutivoF1} />
                  )}
                  <Field label="Resultado de Visita" name="resultadoVisitaF1" value={formData.resultadoVisitaF1} />
                  <Field label="Detalle de la Visita" name="detalleVisitaF1" value={formData.detalleVisitaF1} type="textarea" colSpan={2} />
                  <Field label="Distrito" name="distritoF2" value={formData.distritoF2} />
                  <Field label="Número de HPs" name="numeroHpsF2" value={formData.numeroHpsF2} type="number" />
                  <Field label="Dirección Exacta" name="direccionExactaF1" value={formData.direccionExactaF1} colSpan={2} />
                </div>
              </div>
            )}

            {activeTab === 'form_2' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">Campos de Asignación (Form 2) {isEditing && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded ml-2">Edición</span>}</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Nombre del Hunter" name="hunterF2" value={formData.hunterF2} />
                  <Field label="Ingreso" name="ingresoF2" value={formData.ingresoF2} type="select" options={['Propio', 'Referido']} />
                  <Field label="Tipo de Edificio" name="tipoEdificioF2" value={formData.tipoEdificioF2} type="select" options={['Estreno', 'Moderno', 'Antiguo']} />
                  <Field label="Nombre del Proyecto" name="nombreProyectoF2" value={formData.nombreProyectoF2} isReadOnly />
                  <Field label="Tipo de Vía" name="tipoViaF2" value={formData.tipoViaF2} type="select" options={['Avenida', 'Calle', 'Jirón', 'Pasaje', 'Alameda', 'Malecón', 'Prolongación', 'Carretera', 'Autopista', 'Otro']} />
                  <Field label="Nombre de Vía" name="nombreViaF2" value={formData.nombreViaF2} />
                  <Field label="Numeraciones de Vía" name="numeracionViaF2" value={formData.numeracionViaF2} />
                  <Field label="Distrito" name="distritoF2" value={formData.distritoF2} isReadOnly />
                  <Field label="Coordenadas" name="coordenadasF2" value={formData.coordenadasF2} />
                  <Field label="Número de HPs" name="numeroHpsF2" value={formData.numeroHpsF2} type="number" isReadOnly />
                  <Field label="¿Edificio Estreno?" name="estrenoF2" value={formData.estrenoF2} type="select" options={['SÍ', 'NO']} />
                  {formData.estrenoF2 === 'SÍ' && (
                    <>
                      <Field label="Fecha Montantes" name="fechaMontantesF2" value={formData.fechaMontantesF2} type="date" />
                      <Field label="Fecha Entrega" name="fechaEntregaF2" value={formData.fechaEntregaF2} type="date" />
                      <Field label="Inmobiliaria" name="inmobiliariaF2" value={formData.inmobiliariaF2} />
                    </>
                  )}
                  <Field label="Asignar/Reasignar" name="asignarF2" value={formData.asignarF2} type="select" options={['Asignar', 'Reasignar']} />
                </div>
              </div>
            )}

            {activeTab === 'form_3' && (
              <div className="space-y-6">
                
                {/* 1. Canal y Asignación */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    Canal y Asignación
                  </h4>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Nombre Canal" name="nombreCanalF3" value={formData.nombreCanalF3} />
                    <Field label="Ingreso" name="ingresoF3" value={formData.ingresoF3} type="select" options={['Propio', 'Referido']} />
                    <Field label="Hunter / Gestor" name="hunterF3" value={formData.hunterF3} isReadOnly />
                  </div>
                </div>

                {/* 2. Ubicación y Dirección */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    Ubicación y Dirección
                  </h4>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Nombre Proyecto" name="nombreProyectoF3" value={formData.nombreProyectoF3} colSpan={2} isReadOnly />
                    <Field label="Clasificación" name="clasificacionF3" value={formData.clasificacionF3} isReadOnly />

                    <Field label="Tipo Vía" name="tipoViaF3" value={formData.tipoViaF3} isReadOnly />
                    <Field label="Nombre Vía" name="nombreViaF3" value={formData.nombreViaF3} isReadOnly />
                    <Field label="Numeración" name="numeracionViaF3" value={formData.numeracionViaF3} isReadOnly />

                    <Field label="Distrito" name="distritoF3" value={formData.distritoF3} isReadOnly />
                    <Field label="Urbanización" name="urbanizacionF3" value={formData.urbanizacionF3} />
                    <Field label="Cod. Postal" name="codigoPostalF3" value={formData.codigoPostalF3} />

                    <Field label="Departamento" name="departamentoF3" value={formData.departamentoF3} />
                    <Field label="Provincia" name="provinciaF3" value={formData.provinciaF3} />
                    <Field label="Coordenadas GPS" name="coordenadasF3" value={formData.coordenadasF3} isReadOnly />
                  </div>
                </div>

                {/* 3. Edificación e Inspección */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                    Edificación e Inspección
                  </h4>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Tipo Construcción" name="tipoConstruccionF3" value={formData.tipoConstruccionF3} type="select" options={['ESTRENO', 'MODERNO', 'ANTIGUO']} />
                    <Field label="Total Torres" name="totalTorresF3" value={formData.totalTorresF3} type="number" isReadOnly />
                    <Field label="Total Hogares" name="totalHogaresF3" value={formData.totalHogaresF3} type="number" isReadOnly />

                    <Field label="Fecha Inspección" name="visitaInspeccionF3" value={formData.visitaInspeccionF3} type="date" />
                    <Field label="Horario Visita" name="horarioVisitaF3" value={formData.horarioVisitaF3} />
                    <Field label="Clientes Interesados" name="clientesInteresadosF3" value={formData.clientesInteresadosF3} type="number" />
                    
                    <Field label="Junta Directiva" name="juntaDirectivaF3" value={formData.juntaDirectivaF3} type="select" options={['Sí', 'No']} />
                  </div>
                </div>

                {/* 4. Información de Estreno (Condicional) */}
                {(formData.tipoConstruccionF3 === 'Estreno' || formData.tipoConstruccionF3 === 'ESTRENO' || formData.tipoConstruccionF3 === 'EN_CONSTRUCCION') && (
                  <div className="bg-blue-50/50 p-5 rounded-xl shadow-sm border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-4 pb-2 border-b border-blue-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      Información de Estreno
                    </h4>
                    <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                      <Field label="Inmobiliaria" name="inmobiliariaF3" value={formData.inmobiliariaF3} />
                      <Field label="Fecha Entrega" name="fechaEntregaF3" value={formData.fechaEntregaF3} type="date" />
                      <Field label="Fecha Término Montantes" name="fechaMontantesF3" value={formData.fechaMontantesF3} type="date" />
                      <Field label="Fecha Término Mecha" name="fechaMechaF3" value={formData.fechaMechaF3} type="date" />
                    </div>
                  </div>
                )}

                {/* 5. Responsable del Predio */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Responsable del Predio
                  </h4>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Nombre Responsable" name="nombreResponsableF3" value={formData.nombreResponsableF3} />
                    <Field label="Cargo Responsable" name="cargoResponsableF3" value={formData.cargoResponsableF3} />
                    <Field label="Teléfono Resp." name="telefonoResponsableF3" value={formData.telefonoResponsableF3} />
                    <Field label="Correo Resp." name="correoResponsableF3" value={formData.correoResponsableF3} colSpan={3} />
                  </div>
                </div>

                {/* 6. Matriz de Torres Dinámica */}
                <div className="bg-gray-50 p-5 rounded-xl shadow-inner border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold text-gray-800 flex items-center gap-2">
                      <Building className="w-5 h-5 text-gray-500" />
                      Matriz Dinámica de Torres
                    </h5>
                    {isEditing && <button onClick={addTower} className="text-blue-600 font-bold hover:underline text-sm">+ Agregar Torre</button>}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {towers.map((tower, idx) => {
                      const numPisos = parseInt(tower.pisos_torre, 10) || 0;
                      let hasError = false;
                      let errorMsg = '';
                      if (isEditing && tower.hogares_por_piso) {
                        if (tower.hogares_por_piso.includes(',')) {
                          const parts = tower.hogares_por_piso.split(',');
                          if (parts.length !== numPisos) {
                            hasError = true;
                            errorMsg = `Debe coincidir con los ${numPisos} pisos (ingresados: ${parts.length}).`;
                          }
                        } else if (!/^\d+$/.test(tower.hogares_por_piso.replace(/,/g, ''))) {
                          hasError = true;
                          errorMsg = 'Use números enteros separados por comas.';
                        }
                      }

                      // Parse distribution for preview when not in edit mode
                      const distribution = tower.hogares_por_piso
                        ? tower.hogares_por_piso.split(',').map((val: string) => parseInt(val.trim(), 10) || 0)
                        : [];

                      return (
                        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 relative shadow-sm hover:shadow-md transition-shadow">
                          {isEditing && towers.length > 1 && (
                            <button type="button" onClick={() => removeTower(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 text-sm">✖</button>
                          )}
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                              T{idx + 1}
                            </span>
                            <h4 className="font-bold text-gray-800 text-sm">
                              {tower.nombre_torre || `Torre ${idx + 1}`}
                            </h4>
                          </div>
                          
                          <div className="space-y-3">
                            {isEditing ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1">Nombre de la Torre</label>
                                  <input 
                                    value={tower.nombre_torre} 
                                    onChange={(e) => handleTowerChange(idx, 'nombre_torre', e.target.value)} 
                                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ghl-blue" 
                                    placeholder="Ej: Torre 1"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1">Pisos</label>
                                    <input 
                                      type="number" 
                                      value={tower.pisos_torre} 
                                      onChange={(e) => handleTowerChange(idx, 'pisos_torre', e.target.value)} 
                                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ghl-blue" 
                                      min="1"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1">Hogares/Piso (Comas)</label>
                                    <input 
                                      type="text" 
                                      value={tower.hogares_por_piso} 
                                      onChange={(e) => handleTowerChange(idx, 'hogares_por_piso', e.target.value)} 
                                      className={`w-full border rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 ${hasError ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-ghl-blue'}`} 
                                      placeholder="Ej: 4,4,4"
                                    />
                                  </div>
                                </div>
                                {hasError && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errorMsg}</p>}
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Total Pisos:</span>
                                  <span className="font-bold text-gray-700">{numPisos}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>Total Hogares:</span>
                                  <span className="font-bold text-gray-700">
                                    {distribution.reduce((acc: number, curr: number) => acc + curr, 0)} HP
                                  </span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <label className="block text-[9px] text-gray-400 uppercase font-bold mb-1">Distribución por Piso</label>
                                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pt-1">
                                    {distribution.map((h: number, pIdx: number) => (
                                      <span key={pIdx} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        P{pIdx + 1}: {h} HP
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                {(['FACHADA', 'MONTANTES'] as const).map((category) => {
                  const asset = mediaAssets.find(a => a.category === category);
                  const imgUrl = asset?.url || asset?.fileUrl;
                  const label = category === 'FACHADA' ? 'Foto Fachada' : 'Foto Montantes y Acometida';
                  return (
                    <div key={category}>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <ImageIcon className="w-5 h-5"/> {label}
                      </h4>
                      <div className="w-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 rounded overflow-hidden" style={{minHeight:'180px'}}>
                        {imgUrl ? (
                          <img src={imgUrl} alt={label} className="max-w-full max-h-64 object-contain" />
                        ) : (
                          <span className="text-gray-400 text-sm">Sin imagen</span>
                        )}
                      </div>
                      {isBackOfficeOrAdmin && isEditing && (
                        <div className="mt-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded border border-blue-200 transition-colors">
                            {isUploadingPhoto === category ? '⏳ Subiendo...' : '📷 ' + (imgUrl ? 'Reemplazar imagen' : 'Subir imagen')}
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              className="hidden"
                              disabled={isUploadingPhoto !== null}
                              onChange={(e) => handlePhotoUpload(e, category)}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Panel 2 (Ahora único panel lateral izquierdo de acciones) */}
        {isBackOfficeOrAdmin && (
          <div className="w-[300px] xl:w-[350px] p-6 bg-gray-50 border-l border-gray-200 flex flex-col flex-shrink-0">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-ghl-lightBlue" />
              Acciones
            </h3>

            <div className="flex-1 flex flex-col space-y-4 pt-4">
              <button 
                className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 rounded-lg font-bold text-sm transition-colors ${isEditing ? 'border-green-600 text-green-600 bg-green-50' : 'border-ghl-blue text-ghl-blue hover:bg-blue-50'}`}
                onClick={async () => {
                  if (isEditing) {
                    try {
                      const { opportunitiesService } = await import('../../../services/opportunities.service');
                      
                      let payload: any = {};
                      if (user?.role === 'POSTVENTA') {
                        payload = {
                          notasPostventa: formData.notasPostventa,
                        };
                      } else if (isB2B) {
                        payload = {
                          companyId: formData.companyId,
                          ruc: formData.ruc,
                          razonSocial: formData.razonSocial,
                          representanteLegal: formData.representanteLegal,
                          dniRrll: formData.dniRrll,
                          celularRrll: formData.celularRrll,
                          correoElectronico: formData.correoElectronico,
                          nombrePadresRrll: formData.nombrePadresRrll,
                          fechaNacimientoRrll: formData.fechaNacimientoRrll,
                          lugarNacimientoRrll: formData.lugarNacimientoRrll,
                          tipoDomicilio: formData.tipoDomicilio,
                          direccionFiscal: formData.direccionFiscal,
                          direccionInstalacion: formData.direccionInstalacion,
                          departamento: formData.departamento,
                          provincia: formData.provincia,
                          distrito: formData.distrito,
                          referencia: formData.referencia,
                          tipoTecnologia: formData.tipoTecnologia,
                          tipoPlay: formData.tipoPlay,
                          velocidad: formData.velocidad,
                          cargoFijoSinIgv: formData.cargoFijoSinIgv,
                          campana: formData.campana,
                          adicionales: formData.adicionales,
                          tipoServicio: formData.tipoServicio,
                          cantidadLineas: formData.cantidadLineas,
                          tipoMovil: formData.tipoMovil,
                          observaciones: formData.observaciones,
                          notasPostventa: formData.notasPostventa,
                        };
                      } else {
                        payload = {
                          companyId: formData.companyId,
                        };

                        if (activeTab === 'form_3') {
                          payload.nombreProyecto = formData.nombreProyectoF3;
                          payload.tipoVia = formData.tipoViaF3;
                          payload.nombreVia = formData.nombreViaF3;
                          payload.numeracionMunicipal = formData.numeracionViaF3;
                          payload.coordenadas = formData.coordenadasF3;
                          payload.tipoConstruccion = formData.tipoConstruccionF3;
                          payload.juntaDirectiva = formData.juntaDirectivaF3;
                          payload.cargoResponsable = formData.cargoResponsableF3;
                          payload.nombreResponsable = formData.nombreResponsableF3;
                          payload.telefonoResponsable = formData.telefonoResponsableF3;
                          payload.correoResponsable = formData.correoResponsableF3;
                          payload.visitaInspeccion = formData.visitaInspeccionF3;
                          payload.horarioVisita = formData.horarioVisitaF3;
                          payload.departamento = formData.departamentoF3;
                          payload.provincia = formData.provinciaF3;
                          payload.urbanizacionZona = formData.urbanizacionF3;
                          payload.codigoPostal = formData.codigoPostalF3;
                          payload.clientesInteresados = formData.clientesInteresadosF3 ? parseInt(formData.clientesInteresadosF3, 10) : undefined;
                          payload.inmobiliaria = formData.inmobiliariaF3;
                          payload.fechaEntrega = formData.fechaEntregaF3;
                          payload.fechaMontantes = formData.fechaMontantesF3;
                          payload.fechaMecha = formData.fechaMechaF3;
                          payload.towersData = towers;
                        } else {
                          payload.nombreProyecto = formData.nombreProyectoF2;
                          payload.tipoVia = formData.tipoViaF2;
                          payload.nombreVia = formData.nombreViaF2;
                          payload.numeracionMunicipal = formData.numeracionViaF2;
                          payload.numeroHogares = formData.numeroHpsF2 ? parseInt(formData.numeroHpsF2, 10) : undefined;
                          payload.estadoConstruccion = formData.estrenoF2;
                          payload.terminoMontantes = formData.fechaMontantesF2;
                          payload.fechaEntrega = formData.fechaEntregaF2;
                          payload.inmobiliaria = formData.inmobiliariaF2;
                        }
                      }

                      await opportunitiesService.updateForms(card.id, payload);
                      toast.success('Datos actualizados correctamente');
                      setIsEditing(false);
                      if (onSave) onSave();
                    } catch (e) {
                      toast.error('Error al actualizar datos');
                      console.error(e);
                    }
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? <CheckCircle className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'Guardar Cambios' : 'Editar Datos'}
              </button>

              {isValidationStage && (
                <button 
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                  onClick={() => {
                    if (isForm3Stage) {
                      for (let t of towers) {
                        const numPisos = parseInt(t.pisos_torre, 10) || 0;
                        let hogaresStr = t.hogares_por_piso;
                        if (hogaresStr && !hogaresStr.includes(',') && /^\d+$/.test(hogaresStr)) {
                          const parts = hogaresStr.split(',');
                          if (parts.length > 1 && parts.length !== numPisos) {
                            toast.error(`Torre ${t.nombre_torre}: Los hogares por piso deben coincidir con el número de pisos.`);
                            return;
                          }
                        } else if (hogaresStr && hogaresStr.includes(',')) {
                          const parts = hogaresStr.split(',');
                          if (parts.length !== numPisos) {
                            toast.error(`Torre ${t.nombre_torre}: Los hogares por piso deben coincidir con el número de pisos.`);
                            return;
                          }
                        }
                      }
                    }

                    const expandedTowers = towers.map(tower => {
                      const numPisos = parseInt(tower.pisos_torre, 10) || 0;
                      let hogaresStr = tower.hogares_por_piso;
                      if (hogaresStr && !hogaresStr.includes(',') && /^\d+$/.test(hogaresStr)) {
                        hogaresStr = Array(numPisos).fill(hogaresStr).join(',');
                      }
                      return { ...tower, hogares_por_piso: hogaresStr };
                    });

                    onApprove(expandedTowers);
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprobar
                </button>
              )}

              {card.stage === 0 && (
                <div className="flex flex-col space-y-3 pt-2">
                  <button 
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    onClick={async () => {
                      try {
                        const { opportunitiesService } = await import('../../../services/opportunities.service');
                        await opportunitiesService.transitionStage(card.id, 'S2');
                        toast.success('Prospecto marcado como Aceptado');
                        // Add a small delay to ensure DB transaction is fully committed and visible to subsequent queries
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (onSave) await onSave();
                        onClose(); // Automatically close the modal so user can see it move
                      } catch (e) {
                        toast.error('Error al actualizar etapa');
                      }
                    }}
                  >
                    Prospecto Aceptado / Trabajable
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
                    onClick={async () => {
                      try {
                        const { opportunitiesService } = await import('../../../services/opportunities.service');
                        await opportunitiesService.transitionStage(card.id, 'S3');
                        toast.success('Prospecto marcado como Rechazado');
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (onSave) await onSave();
                        onClose(); // Automatically close the modal so user can see it move
                      } catch (e) {
                        toast.error('Error al actualizar etapa');
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                    Prospecto Rechazado / No Trabajable
                  </button>
                </div>
              )}
              
              {user?.role === 'ADMIN' && (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">Reasignar Propietario</p>
                  <select 
                    name="reasignarUserId"
                    value={formData.reasignarUserId}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-2 mb-3 outline-none focus:border-ghl-blue bg-white"
                  >
                    <option value="">- Seleccionar Hunter -</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                  <button 
                    className="w-full py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900 transition-colors disabled:opacity-50"
                    disabled={!formData.reasignarUserId || formData.reasignarUserId === card.currentOwnerUserId}
                    onClick={async () => {
                      try {
                        const { opportunitiesService } = await import('../../../services/opportunities.service');
                        await opportunitiesService.updateForms(card.id, { currentOwnerUserId: formData.reasignarUserId });
                        const userSelected = usersList.find(u => u.id === formData.reasignarUserId);
                        toast.success(`Propietario reasignado a: ${userSelected?.fullName || 'Desconocido'}`);
                        if (onSave) onSave();
                      } catch (e) {
                        toast.error('Error al reasignar propietario');
                        console.error(e);
                      }
                    }}
                  >
                    Confirmar Reasignación
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
