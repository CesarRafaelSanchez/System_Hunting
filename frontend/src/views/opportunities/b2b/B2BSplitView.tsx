import React, { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, Building, Edit2, User, MessageSquare, Clock, Send } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import { opportunitiesService } from '../../../services/opportunities.service';
import { UBIGEO_PERU } from '../../../utils/ubigeo';

const convertToInputDateFormat = (val: string) => {
  if (!val || val === '-') return '';
  const match = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const d = match[1].padStart(2, '0');
    const m = match[2].padStart(2, '0');
    const y = match[3];
    return `${y}-${m}-${d}`;
  }
  const matchShort = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (matchShort) {
    const d = matchShort[1].padStart(2, '0');
    const m = matchShort[2].padStart(2, '0');
    const y = '20' + matchShort[3];
    return `${y}-${m}-${d}`;
  }
  return val;
};

// Helper parsers
const parseParents = (str: string) => {
  if (!str) return { padre: '', madre: '' };
  const parts = str.split(' / ');
  return {
    padre: parts[0] || '',
    madre: parts[1] || ''
  };
};

const parseBirthPlace = (str: string) => {
  if (!str) return { dep: 'LIMA', prov: 'LIMA', dist: '', distOtro: '' };
  const parts = str.split(' - ');
  const dep = parts[0] || 'LIMA';
  const prov = parts[1] || 'LIMA';
  const distVal = parts[2] || '';
  const list = UBIGEO_PERU[dep]?.[prov] || [];
  const isStandard = list.includes(distVal);
  return {
    dep,
    prov,
    dist: isStandard ? distVal : (distVal ? 'OTRO' : ''),
    distOtro: isStandard ? '' : distVal
  };
};

const parseDireccionFiscal = (dir: string) => {
  const defaults = {
    viaFiscal: '',
    numeroFiscal: '',
    urbanizacionFiscal: '',
    departamentoFiscal: 'LIMA',
    provinciaFiscal: 'LIMA',
    distritoFiscal: '',
    distritoFiscalOtro: ''
  };
  if (!dir) return defaults;
  try {
    const commaParts = dir.split(', ');
    if (commaParts.length >= 3) {
      const dep = commaParts[commaParts.length - 1].trim();
      const prov = commaParts[commaParts.length - 2].trim();
      const firstPartsRejoined = commaParts.slice(0, commaParts.length - 2).join(', ');
      
      const dashIdx = firstPartsRejoined.lastIndexOf(' - ');
      if (dashIdx !== -1) {
        const addrPart = firstPartsRejoined.substring(0, dashIdx).trim();
        const dist = firstPartsRejoined.substring(dashIdx + 3).trim();
        
        const addrCommaParts = addrPart.split(', ');
        const viaNum = addrCommaParts[0] || '';
        const urb = addrCommaParts[1] || '';
        
        const lastSpaceIdx = viaNum.lastIndexOf(' ');
        let via = viaNum;
        let num = '';
        if (lastSpaceIdx !== -1) {
          via = viaNum.substring(0, lastSpaceIdx).trim();
          num = viaNum.substring(lastSpaceIdx + 1).trim();
        }
        
        const isStandard = UBIGEO_PERU[dep]?.[prov]?.includes(dist);
        return {
          viaFiscal: via,
          numeroFiscal: num,
          urbanizacionFiscal: urb,
          departamentoFiscal: dep,
          provinciaFiscal: prov,
          distritoFiscal: isStandard ? dist : (dist ? 'OTRO' : ''),
          distritoFiscalOtro: isStandard ? '' : dist
        };
      }
    }
  } catch (e) {
    console.error("Error parsing direccion fiscal:", e);
  }
  return { ...defaults, viaFiscal: dir };
};

const parseDireccionInstalacion = (dir: string) => {
  const defaults = {
    viaInstalacion: '',
    numeroInstalacion: '',
    urbanizacionInstalacion: ''
  };
  if (!dir) return defaults;
  try {
    const parts = dir.split(', ');
    const viaNum = parts[0] || '';
    const urb = parts[1] || '';
    
    const lastSpaceIdx = viaNum.lastIndexOf(' ');
    let via = viaNum;
    let num = '';
    if (lastSpaceIdx !== -1) {
      via = viaNum.substring(0, lastSpaceIdx).trim();
      num = viaNum.substring(lastSpaceIdx + 1).trim();
    }
    return {
      viaInstalacion: via,
      numeroInstalacion: num,
      urbanizacionInstalacion: urb
    };
  } catch (e) {
    console.error("Error parsing direccion instalacion:", e);
  }
  return { ...defaults, viaInstalacion: dir };
};

export const OpportunitySplitView: React.FC<{
  card: any;
  onClose: () => void;
  onApprove: (towersData?: any[]) => void;
  onSave?: () => void | Promise<void>;
}> = ({ card, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic_info');
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const { user } = useAuthStore();
  const isBackOfficeOrAdmin = user?.role === 'BACKOFFICE' || user?.role === 'BACKOFFICE_VENTAS' || user?.role === 'POSTVENTA' || user?.role === 'ACCOUNT_ADMIN' || user?.role === 'ADMIN';
  const canEditB2BSale = user?.role === 'SUPERVISOR_VENTAS' || user?.role === 'ACCOUNT_ADMIN' || user?.role === 'AGENCY_ADMIN' || user?.role === 'ADMIN';
  
  const vf = card.ventaFija || card.data?.ventaFija || {};

  const [formData, setFormData] = useState<any>(() => {
    const parents = parseParents(vf.nombrePadresRrll);
    const birthPlace = parseBirthPlace(vf.lugarNacimientoRrll);
    const fiscalAddr = parseDireccionFiscal(vf.direccionFiscal);
    const instAddr = parseDireccionInstalacion(vf.direccionInstalacion);
    
    return {
      companyId: card.companyId || '',
      reasignarUserId: card.currentOwnerUserId || '',
      notesPostventa: vf.notasPostventa || '',
      ruc: vf.ruc || '',
      razonSocial: vf.razonSocial || '',
      representanteLegal: vf.representanteLegal || '',
      dniRrll: vf.dniRrll || '',
      celularRrll: vf.celularRrll || '',
      correoElectronico: vf.correoElectronico || '',
      fechaNacimientoRrll: vf.fechaNacimientoRrll || '',
      tipoDomicilio: vf.tipoDomicilio || 'Casa',
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
      
      nombrePadreRrll: parents.padre,
      nombreMadreRrll: parents.madre,
      
      lugarNacimientoDep: birthPlace.dep,
      lugarNacimientoProv: birthPlace.prov,
      lugarNacimientoDist: birthPlace.dist,
      lugarNacimientoDistOtro: birthPlace.distOtro,
      
      viaFiscal: fiscalAddr.viaFiscal,
      numeroFiscal: fiscalAddr.numeroFiscal,
      urbanizacionFiscal: fiscalAddr.urbanizacionFiscal,
      departamentoFiscal: fiscalAddr.departamentoFiscal,
      provinciaFiscal: fiscalAddr.provinciaFiscal,
      distritoFiscal: fiscalAddr.distritoFiscal,
      distritoFiscalOtro: fiscalAddr.distritoFiscalOtro,
      
      viaInstalacion: instAddr.viaInstalacion,
      numeroInstalacion: instAddr.numeroInstalacion,
      urbanizacionInstalacion: instAddr.urbanizacionInstalacion,
      departamento: vf.departamento || 'LIMA',
      provincia: vf.provincia || 'LIMA',
      distrito: vf.distrito || '',
      distritoOtro: '',
      direccionFiscal: vf.direccionFiscal || '',
      direccionInstalacion: vf.direccionInstalacion || '',
      nombrePadresRrll: vf.nombrePadresRrll || '',
      lugarNacimientoRrll: vf.lugarNacimientoRrll || ''
    };
  });

  useEffect(() => {
    const parents = parseParents(vf.nombrePadresRrll);
    const birthPlace = parseBirthPlace(vf.lugarNacimientoRrll);
    const fiscalAddr = parseDireccionFiscal(vf.direccionFiscal);
    const instAddr = parseDireccionInstalacion(vf.direccionInstalacion);
    
    setFormData({
      companyId: card.companyId || '',
      reasignarUserId: card.currentOwnerUserId || '',
      notasPostventa: vf.notasPostventa || '',
      ruc: vf.ruc || '',
      razonSocial: vf.razonSocial || '',
      representanteLegal: vf.representanteLegal || '',
      dniRrll: vf.dniRrll || '',
      celularRrll: vf.celularRrll || '',
      correoElectronico: vf.correoElectronico || '',
      fechaNacimientoRrll: vf.fechaNacimientoRrll || '',
      tipoDomicilio: vf.tipoDomicilio || 'Casa',
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
      
      nombrePadreRrll: parents.padre,
      nombreMadreRrll: parents.madre,
      
      lugarNacimientoDep: birthPlace.dep,
      lugarNacimientoProv: birthPlace.prov,
      lugarNacimientoDist: birthPlace.dist,
      lugarNacimientoDistOtro: birthPlace.distOtro,
      
      viaFiscal: fiscalAddr.viaFiscal,
      numeroFiscal: fiscalAddr.numeroFiscal,
      urbanizacionFiscal: fiscalAddr.urbanizacionFiscal,
      departamentoFiscal: fiscalAddr.departamentoFiscal,
      provinciaFiscal: fiscalAddr.provinciaFiscal,
      distritoFiscal: fiscalAddr.distritoFiscal,
      distritoFiscalOtro: fiscalAddr.distritoFiscalOtro,
      
      viaInstalacion: instAddr.viaInstalacion,
      numeroInstalacion: instAddr.numeroInstalacion,
      urbanizacionInstalacion: instAddr.urbanizacionInstalacion,
      departamento: vf.departamento || 'LIMA',
      provincia: vf.provincia || 'LIMA',
      distrito: vf.distrito || '',
      distritoOtro: (UBIGEO_PERU[vf.departamento || 'LIMA']?.[vf.provincia || 'LIMA']?.includes(vf.distrito) ? '' : vf.distrito) || '',
      direccionFiscal: vf.direccionFiscal || '',
      direccionInstalacion: vf.direccionInstalacion || '',
      nombrePadresRrll: vf.nombrePadresRrll || '',
      lugarNacimientoRrll: vf.lugarNacimientoRrll || ''
    });
    setIsEditing(false);
  }, [card]);

  useEffect(() => {
    if (isBackOfficeOrAdmin) {
      const fetchCompanies = async () => {
        try {
          const { fetchApi } = await import('../../../services/api.client');
          const data = await fetchApi<any[]>('/companies');
          setCompaniesList(data);
          
          const users = await fetchApi<any[]>('/users');
          setUsersList(users.filter(u => u.role === 'ASESOR_VENTAS' || u.role === 'SUPERVISOR_VENTAS'));
        } catch (e) {
          console.error('Error fetching companies or users', e);
        }
      };
      fetchCompanies();
    }
  }, [isBackOfficeOrAdmin]);

  const loadNotesAndHistory = async () => {
    try {
      setIsLoadingNotes(true);
      setIsLoadingHistory(true);
      const [fetchedNotes, fetchedHistory] = await Promise.all([
        opportunitiesService.getNotes(card.id),
        opportunitiesService.getHistory(card.id)
      ]);
      setNotes(fetchedNotes as any[]);
      setHistory(fetchedHistory as any[]);
    } catch (e) {
      console.error('Error loading notes/history', e);
    } finally {
      setIsLoadingNotes(false);
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (card.id) {
      loadNotesAndHistory();
    }
  }, [card.id]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await opportunitiesService.addNote(card.id, newNote);
      setNewNote('');
      const updatedNotes = await opportunitiesService.getNotes(card.id);
      setNotes(updatedNotes as any[]);
      toast.success('Nota agregada exitosamente');
    } catch (e) {
      toast.error('Error al guardar la nota');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let extraChanges: any = {};
    if (name === 'departamento') {
      const firstProv = Object.keys(UBIGEO_PERU[value] || {})[0] || '';
      const firstDist = (UBIGEO_PERU[value]?.[firstProv] || [])[0] || '';
      extraChanges = { provincia: firstProv, distrito: firstDist, distritoOtro: '' };
    } else if (name === 'provincia') {
      const firstDist = (UBIGEO_PERU[formData.departamento]?.[value] || [])[0] || '';
      extraChanges = { distrito: firstDist, distritoOtro: '' };
    } else if (name === 'departamentoFiscal') {
      const firstProv = Object.keys(UBIGEO_PERU[value] || {})[0] || '';
      const firstDist = (UBIGEO_PERU[value]?.[firstProv] || [])[0] || '';
      extraChanges = { provinciaFiscal: firstProv, distritoFiscal: firstDist, distritoFiscalOtro: '' };
    } else if (name === 'provinciaFiscal') {
      const firstDist = (UBIGEO_PERU[formData.departamentoFiscal]?.[value] || [])[0] || '';
      extraChanges = { distritoFiscal: firstDist, distritoFiscalOtro: '' };
    } else if (name === 'lugarNacimientoDep') {
      const firstProv = Object.keys(UBIGEO_PERU[value] || {})[0] || '';
      const firstDist = (UBIGEO_PERU[value]?.[firstProv] || [])[0] || '';
      extraChanges = { lugarNacimientoProv: firstProv, lugarNacimientoDist: firstDist, lugarNacimientoDistOtro: '' };
    } else if (name === 'lugarNacimientoProv') {
      const firstDist = (UBIGEO_PERU[formData.lugarNacimientoDep]?.[value] || [])[0] || '';
      extraChanges = { lugarNacimientoDist: firstDist, lugarNacimientoDistOtro: '' };
    }

    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
      ...extraChanges
    }));
  };

  const getReadonlyValue = (val: any) => {
    return val && val !== '-' ? val : '-';
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[85%] max-w-7xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle de la Venta B2B</p>
          <h2 className="text-2xl font-black text-gray-900 leading-none">{formData.razonSocial || card.title || 'Venta Sin Nombre'}</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel principal de contenido */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-gray-50 overflow-hidden">
          
          {/* Navegación por Pestañas */}
          <div className="flex border-b border-gray-200 bg-white overflow-x-auto">
            <button className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'basic_info' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('basic_info')}>
              INFORMACIÓN BÁSICA
            </button>
            <button className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'b2b_client' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('b2b_client')}>
              DETALLE DEL CLIENTE
            </button>
            <button className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'b2b_service' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('b2b_service')}>
              DATOS DEL SERVICIO
            </button>
            <button className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'notes' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('notes')}>
              NOTAS Y SEGUIMIENTO
            </button>
            <button className={`px-6 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTab === 'history' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('history')}>
              HISTORIAL Y LOGS
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Pestaña: INFORMACIÓN BÁSICA */}
            {activeTab === 'basic_info' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-8">
                
                {/* Resumen para Contrato por Voz */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                    <FileText className="w-5 h-5 text-blue-900" /> Datos Básicos para Contrato por Voz
                  </h4>
                  <div className="overflow-x-auto border border-gray-300 rounded-lg">
                    <table className="w-full text-left border-collapse text-sm text-gray-900" style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #d1d5db' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Número de RUC</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">{getReadonlyValue(formData.ruc)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Razón Social</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">{getReadonlyValue(formData.razonSocial) || getReadonlyValue(card.title)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Nombres y apellidos completos</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">{getReadonlyValue(formData.representanteLegal)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Tipo y número de documento de identidad</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">{formData.dniRrll ? `DNI - ${formData.dniRrll}` : '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Lugar y fecha de nacimiento</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">
                            {formData.lugarNacimientoDist ? `${formData.lugarNacimientoDist}, ${formData.lugarNacimientoProv}, ${formData.lugarNacimientoDep}` : '-'} / {getReadonlyValue(formData.fechaNacimientoRrll)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Nombre de sus padres</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">
                            Padre: {getReadonlyValue(formData.nombrePadreRrll)}<br/>
                            Madre: {getReadonlyValue(formData.nombreMadreRrll)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Número de contacto</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">{getReadonlyValue(formData.celularRrll)}</td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Dirección de instalación</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">
                            {formData.direccionInstalacion ? formData.direccionInstalacion : 
                             `${formData.viaInstalacion || ''} ${formData.numeroInstalacion || ''} ${formData.urbanizacionInstalacion || ''}, ${formData.distrito || ''}, ${formData.provincia || ''}, ${formData.departamento || ''}`.trim().replace(/^[,\s]+|[,\s]+$/g, '') || '-'}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', fontWeight: 'bold', padding: '8px' }} className="w-1/3 bg-gray-100 font-bold p-3">Correo electrónico del cliente</td>
                          <td style={{ border: '1px solid #d1d5db', padding: '8px' }} className="p-3">{getReadonlyValue(formData.correoElectronico)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">Sombree el cuadro completo, presione Ctrl+C y luego péguelo en Word para mantener la cuadrícula.</p>
                </div>

                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2"><Building className="w-5 h-5 text-blue-900"/> Detalles Adicionales de la Oportunidad</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Razón Social / Cliente</label>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-100">{formData.razonSocial || card.title || '-'}</p>
                  </div>
                  
                  {isBackOfficeOrAdmin && (
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Empresa Asignada</label>
                      {isEditing ? (
                        <select 
                          name="companyId" 
                          className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-900 bg-white" 
                          value={formData.companyId || ''} 
                          onChange={handleChange}
                        >
                          <option value="">- Seleccionar Empresa -</option>
                          {companiesList.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-100 flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {companiesList.find(c => c.id === formData.companyId)?.name || card.company?.name || 'Sin Asignar'}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Asesor Comercial</label>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {card.currentOwnerUser?.fullName || 'Sin Asignar'}
                    </p>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Distrito de Instalación</label>
                    <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-100 uppercase">{formData.distrito || '-'}</p>
                  </div>

                  {/* Notas Postventa */}
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
                        placeholder="Ingrese notas de seguimiento de postventa"
                        rows={4}
                      />
                    ) : (
                      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 min-h-[100px] text-sm text-slate-700 whitespace-pre-wrap">
                        {formData.notasPostventa || 'No hay notas postventa registradas aún.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: DETALLE DEL CLIENTE */}
            {activeTab === 'b2b_client' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                
                {/* 1. Datos Corporativos */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-900"/> Datos Corporativos de la Empresa
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">RUC *</label>
                      {isEditing ? (
                        <input name="ruc" value={formData.ruc} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required maxLength={11} minLength={11} />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.ruc)}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Razón Social *</label>
                      {isEditing ? (
                        <input name="razonSocial" value={formData.razonSocial} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.razonSocial)}</p>
                      )}
                    </div>
                    
                    {/* Dirección Fiscal en Modo Edición Compuesta */}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Dirección Fiscal</label>
                      {isEditing ? (
                        <div className="mt-2 space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Vía (Av, Calle, Jr) *</label>
                              <input name="viaFiscal" value={formData.viaFiscal} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" required />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Número / Int *</label>
                              <input name="numeroFiscal" value={formData.numeroFiscal} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" required />
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Urb / Zona</label>
                              <input name="urbanizacionFiscal" value={formData.urbanizacionFiscal} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Dep. Fiscal *</label>
                              <select name="departamentoFiscal" value={formData.departamentoFiscal} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" required>
                                {Object.keys(UBIGEO_PERU).map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Prov. Fiscal *</label>
                              <select name="provinciaFiscal" value={formData.provinciaFiscal} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" required>
                                {Object.keys(UBIGEO_PERU[formData.departamentoFiscal] || {}).map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Dist. Fiscal *</label>
                              <select name="distritoFiscal" value={formData.distritoFiscal} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" required>
                                <option value="">Seleccione Distrito</option>
                                {(UBIGEO_PERU[formData.departamentoFiscal]?.[formData.provinciaFiscal] || []).map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                <option value="OTRO">OTRO</option>
                              </select>
                            </div>
                          </div>
                          {formData.distritoFiscal === 'OTRO' && (
                            <div>
                              <label className="block text-[10px] text-gray-500 font-bold uppercase">Especificar Distrito Fiscal *</label>
                              <input name="distritoFiscalOtro" value={formData.distritoFiscalOtro} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs bg-white outline-none" required />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.direccionFiscal)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Representante Legal */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-900"/> Representante Legal (RRLL)
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Nombre del Representante *</label>
                      {isEditing ? (
                        <input name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.representanteLegal)}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">DNI del RRLL *</label>
                      {isEditing ? (
                        <input name="dniRrll" value={formData.dniRrll} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required maxLength={8} minLength={8} />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.dniRrll)}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Celular de Contacto *</label>
                      {isEditing ? (
                        <input name="celularRrll" value={formData.celularRrll} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.celularRrll)}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Correo Electrónico *</label>
                      {isEditing ? (
                        <input type="email" name="correoElectronico" value={formData.correoElectronico} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.correoElectronico)}</p>
                      )}
                    </div>
                    
                    {/* Padres del RRLL (Compuesto) */}
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Padres del RRLL</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <label className="block text-[10px] text-gray-400 font-bold uppercase">Nombre del Padre *</label>
                            <input name="nombrePadreRrll" value={formData.nombrePadreRrll} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none bg-white" required />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 font-bold uppercase">Nombre de la Madre *</label>
                            <input name="nombreMadreRrll" value={formData.nombreMadreRrll} onChange={handleChange} className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs outline-none bg-white" required />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.nombrePadresRrll)}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Fecha de Nacimiento *</label>
                      {isEditing ? (
                        <input type="date" name="fechaNacimientoRrll" value={convertToInputDateFormat(formData.fechaNacimientoRrll)} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.fechaNacimientoRrll)}</p>
                      )}
                    </div>
                    
                    {/* Lugar Nacimiento (Compuesto) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Lugar de Nacimiento</label>
                      {isEditing ? (
                        <div className="mt-1 space-y-2 p-2 bg-gray-50 rounded border border-gray-200">
                          <div className="grid grid-cols-3 gap-1">
                            <select name="lugarNacimientoDep" value={formData.lugarNacimientoDep} onChange={handleChange} className="border text-xs rounded p-1.5 bg-white outline-none" required>
                              {Object.keys(UBIGEO_PERU).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select name="lugarNacimientoProv" value={formData.lugarNacimientoProv} onChange={handleChange} className="border text-xs rounded p-1.5 bg-white outline-none" required>
                              {Object.keys(UBIGEO_PERU[formData.lugarNacimientoDep] || {}).map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <select name="lugarNacimientoDist" value={formData.lugarNacimientoDist} onChange={handleChange} className="border text-xs rounded p-1.5 bg-white outline-none" required>
                              <option value="">Distrito</option>
                              {(UBIGEO_PERU[formData.lugarNacimientoDep]?.[formData.lugarNacimientoProv] || []).map(dist => <option key={dist} value={dist}>{dist}</option>)}
                              <option value="OTRO">OTRO</option>
                            </select>
                          </div>
                          {formData.lugarNacimientoDist === 'OTRO' && (
                            <input name="lugarNacimientoDistOtro" value={formData.lugarNacimientoDistOtro} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none" placeholder="Especificar distrito" required />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.lugarNacimientoRrll)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Ubicación e Instalación */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-900"/> Dirección de Instalación
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Dirección Exacta (Vía e Instalación)</label>
                      {isEditing ? (
                        <div className="grid grid-cols-3 gap-2 mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold">Vía (Av, Calle, Jr) *</label>
                            <input name="viaInstalacion" value={formData.viaInstalacion} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none" required />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold">Nro / Int / Mz y Lte *</label>
                            <input name="numeroInstalacion" value={formData.numeroInstalacion} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none" required />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500 font-bold">Urb / Zona</label>
                            <input name="urbanizacionInstalacion" value={formData.urbanizacionInstalacion} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none" />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.direccionInstalacion)}</p>
                      )}
                    </div>
                    
                    {/* Ubigeo de Instalación */}
                    <div className="col-span-2 grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Departamento *</label>
                        {isEditing ? (
                          <select name="departamento" value={formData.departamento} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                            {Object.keys(UBIGEO_PERU).map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        ) : (
                          <p className="text-sm font-medium text-gray-900 mt-0.5 uppercase">{getReadonlyValue(formData.departamento)}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Provincia *</label>
                        {isEditing ? (
                          <select name="provincia" value={formData.provincia} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                            {Object.keys(UBIGEO_PERU[formData.departamento] || {}).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        ) : (
                          <p className="text-sm font-medium text-gray-900 mt-0.5 uppercase">{getReadonlyValue(formData.provincia)}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Distrito *</label>
                        {isEditing ? (
                          <select name="distrito" value={formData.distrito} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                            <option value="">Seleccione Distrito</option>
                            {(UBIGEO_PERU[formData.departamento]?.[formData.provincia] || []).map(dist => <option key={dist} value={dist}>{dist}</option>)}
                            <option value="OTRO">OTRO</option>
                          </select>
                        ) : (
                          <p className="text-sm font-medium text-gray-900 mt-0.5 uppercase">{getReadonlyValue(formData.distrito)}</p>
                        )}
                      </div>
                    </div>

                    {formData.distrito === 'OTRO' && isEditing && (
                      <div className="col-span-2">
                        <label className="block text-[10px] text-gray-500 font-bold uppercase">Especificar Distrito de Instalación *</label>
                        <input name="distritoOtro" value={formData.distritoOtro} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white outline-none" required />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Tipo de Domicilio *</label>
                      {isEditing ? (
                        <select name="tipoDomicilio" value={formData.tipoDomicilio} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                          <option value="Casa">Casa</option>
                          <option value="Edificio de Oficinas">Edificio de Oficinas</option>
                          <option value="Edificio Residencial">Edificio Residencial</option>
                          <option value="Local">Local</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.tipoDomicilio)}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Referencia *</label>
                      {isEditing ? (
                        <input name="referencia" value={formData.referencia} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.referencia)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: DATOS DEL SERVICIO */}
            {activeTab === 'b2b_service' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div>
                  <h4 className="font-bold text-gray-800 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-900"/> Datos del Plan / Servicio Contratado
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Tipo de Servicio *</label>
                      {isEditing ? (
                        <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                          <option value="Fija">Fija</option>
                          <option value="Movil">Móvil</option>
                        </select>
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.tipoServicio)}</p>
                      )}
                    </div>
                    
                    {formData.tipoServicio === 'Fija' ? (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Tecnología *</label>
                          {isEditing ? (
                            <select name="tipoTecnologia" value={formData.tipoTecnologia} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                              <option value="FTTH">FTTH</option>
                              <option value="HFC">HFC</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.tipoTecnologia)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Plan (Play) *</label>
                          {isEditing ? (
                            <select name="tipoPlay" value={formData.tipoPlay} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                              <option value="1 Play Internet solo">1 Play Internet solo</option>
                              <option value="2 Play Internet + Cable">2 Play Internet + Cable</option>
                              <option value="2 Play Internet + Fijo">2 Play Internet + Fijo</option>
                              <option value="3 Play Internet + Fijo + Cable">3 Play Internet + Fijo + Cable</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.tipoPlay)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Velocidad Contratada *</label>
                          {isEditing ? (
                            <select name="velocidad" value={formData.velocidad} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                              <option value="200mbps">200mbps</option>
                              <option value="300mbps">300mbps</option>
                              <option value="400mbps">400mbps</option>
                              <option value="800mbps">800mbps</option>
                              <option value="1000mbps">1000mbps</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.velocidad)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Cargo Fijo Mensual (Sin IGV) (S/.) *</label>
                          {isEditing ? (
                            <input type="number" name="cargoFijoSinIgv" value={formData.cargoFijoSinIgv} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required />
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5 font-bold">S/. {formData.cargoFijoSinIgv ? parseFloat(formData.cargoFijoSinIgv).toFixed(2) : '0.00'}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Campaña Aplicada *</label>
                          {isEditing ? (
                            <select name="campana" value={formData.campana} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                              <option value="FTTH Regular">FTTH Regular</option>
                              <option value="HFC Regular">HFC Regular</option>
                              <option value="1sol x 2 meses">1sol x 2 meses</option>
                              <option value="FTTH Empresas medio">FTTH Empresas medio</option>
                              <option value="Regular">Regular</option>
                              <option value="No aplica">No aplica</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.campana)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Servicios Adicionales *</label>
                          {isEditing ? (
                            <select name="adicionales" value={formData.adicionales} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                              <option value="Mesh">Mesh</option>
                              <option value="2 Decos Gratis">2 Decos Gratis</option>
                              <option value="Deco Gratis">Deco Gratis</option>
                              <option value="Mesh + Deco">Mesh + Deco</option>
                              <option value="2 Mesh Gratis">2 Mesh Gratis</option>
                              <option value="Mesh con costo">Mesh con costo</option>
                              <option value="Deco con costo">Deco con costo</option>
                              <option value="No aplica">No aplica</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.adicionales)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Código de Plano / Croquis</label>
                          {isEditing ? (
                            <input name="planoUrl" value={formData.planoUrl} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" />
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.planoUrl)}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Cantidad de Líneas *</label>
                          {isEditing ? (
                            <input type="number" name="cantidadLineas" value={formData.cantidadLineas} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" required min="1" />
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.cantidadLineas)}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Tipo Móvil *</label>
                          {isEditing ? (
                            <select name="tipoMovil" value={formData.tipoMovil} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 bg-white outline-none" required>
                              <option value="Alta">Alta</option>
                              <option value="Portabilidad">Portabilidad</option>
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900 mt-0.5">{getReadonlyValue(formData.tipoMovil)}</p>
                          )}
                        </div>
                      </>
                    )}
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider font-bold">Observaciones de la Venta</label>
                      {isEditing ? (
                        <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className="w-full border border-blue-900 rounded px-2.5 py-1.5 text-sm mt-1 outline-none bg-white" rows={3} />
                      ) : (
                        <p className="text-sm font-medium text-gray-900 mt-0.5 whitespace-pre-wrap">{getReadonlyValue(formData.observaciones)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: NOTAS Y SEGUIMIENTO */}
            {activeTab === 'notes' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <MessageSquare className="w-5 h-5 text-blue-900" /> Notas y Seguimiento
                </h4>
                
                <div className="flex flex-col gap-3">
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Escribe una nota o actualización sobre esta venta..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-900 outline-none resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <button 
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" /> Agregar Nota
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {isLoadingNotes ? (
                    <p className="text-sm text-gray-500 text-center py-4">Cargando notas...</p>
                  ) : notes.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4 italic">No hay notas registradas.</p>
                  ) : (
                    notes.map((n) => (
                      <div key={n.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {n.user?.fullName?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-gray-800">{n.user?.fullName || 'Usuario'}</span>
                            <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Pestaña: HISTORIAL Y LOGS */}
            {activeTab === 'history' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                  <Clock className="w-5 h-5 text-blue-900" /> Historial de Movimientos
                </h4>
                
                {isLoadingHistory ? (
                  <p className="text-sm text-gray-500 text-center py-4">Cargando historial...</p>
                ) : history.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4 italic">No hay registros en el historial.</p>
                ) : (
                  <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 py-4">
                    {history.map((h) => (
                      <div key={h.id} className="relative pl-6">
                        <div className="absolute w-4 h-4 bg-white border-2 border-blue-900 rounded-full -left-[9px] top-1"></div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-800">Transición de Etapa</span>
                              <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <User className="w-3 h-3" /> {h.changedByUser?.fullName || 'Sistema'}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-blue-900 bg-blue-50 px-2 py-1 rounded">
                              {new Date(h.changedAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-3">
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">{h.fromStage?.name || 'Creación'}</span>
                            <span className="text-gray-400">➔</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">{h.toStage?.name || 'Desconocido'}</span>
                          </div>
                          {h.reason && (
                            <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-100">
                              <span className="font-bold">Motivo:</span> {h.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Panel lateral izquierdo de acciones */}
        {(isBackOfficeOrAdmin || canEditB2BSale) && (
          <div className="w-[300px] xl:w-[350px] p-6 bg-gray-50 border-l border-gray-200 flex flex-col flex-shrink-0">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-900" />
              Acciones
            </h3>

            <div className="flex-1 flex flex-col space-y-4 pt-4">
              {canEditB2BSale && (
                <button 
                  className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${isEditing ? 'border-green-600 text-green-600 bg-green-50 hover:bg-green-100' : 'border-blue-900 text-blue-900 hover:bg-blue-50'}`}
                  onClick={async () => {
                    if (isEditing) {
                      try {
                        const { ventasService } = await import('../../../services/ventas.service');
                        
                        let payload: any = {};
                        if (user?.role === 'POSTVENTA') {
                          payload = {
                            notasPostventa: formData.notasPostventa,
                          };
                        } else {
                          const finalDistrito = formData.distrito === 'OTRO' ? formData.distritoOtro : formData.distrito;
                          const finalDistritoFiscal = formData.distritoFiscal === 'OTRO' ? formData.distritoFiscalOtro : formData.distritoFiscal;
                          const finalDistritoNac = formData.lugarNacimientoDist === 'OTRO' ? formData.lugarNacimientoDistOtro : formData.lugarNacimientoDist;

                          payload = {
                            companyId: formData.companyId,
                            ruc: formData.ruc,
                            razonSocial: formData.razonSocial,
                            representanteLegal: formData.representanteLegal,
                            dniRrll: formData.dniRrll,
                            celularRrll: formData.celularRrll,
                            correoElectronico: formData.correoElectronico,
                            nombrePadresRrll: `${formData.nombrePadreRrll} / ${formData.nombreMadreRrll}`,
                            fechaNacimientoRrll: formData.fechaNacimientoRrll,
                            lugarNacimientoRrll: `${formData.lugarNacimientoDep} - ${formData.lugarNacimientoProv} - ${finalDistritoNac}`,
                            tipoDomicilio: formData.tipoDomicilio,
                            direccionFiscal: `${formData.viaFiscal} ${formData.numeroFiscal}, ${formData.urbanizacionFiscal} - ${finalDistritoFiscal}, ${formData.provinciaFiscal}, ${formData.departamentoFiscal}`,
                            direccionInstalacion: `${formData.viaInstalacion} ${formData.numeroInstalacion}, ${formData.urbanizacionInstalacion}`,
                            departamento: formData.departamento,
                            provincia: formData.provincia,
                            distrito: finalDistrito,
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
                        }

                        await ventasService.updateForms(card.id, payload);
                        toast.success('Datos actualizados correctamente');
                        setIsEditing(false);
                        if (onSave) await onSave();
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
              )}
              
              {user?.role === 'ACCOUNT_ADMIN' && (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">Reasignar Propietario</p>
                  <select 
                    name="reasignarUserId"
                    value={formData.reasignarUserId}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-2 mb-3 outline-none focus:border-blue-900 bg-white"
                  >
                    <option value="">- Seleccionar Asesor -</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))}
                  </select>
                  <button 
                    className="w-full py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
                    disabled={!formData.reasignarUserId || formData.reasignarUserId === card.currentOwnerUserId}
                    onClick={async () => {
                      try {
                        const { ventasService } = await import('../../../services/ventas.service');
                        await ventasService.updateForms(card.id, { currentOwnerUserId: formData.reasignarUserId });
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

              {/* Widget de Métricas de Tiempo SLA */}
              <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mt-4">
                <p className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Métricas de Tiempo
                </p>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Creación</p>
                    <p className="text-sm font-medium text-gray-900">{card.createdAt ? new Date(card.createdAt).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tiempo en Etapa Actual</p>
                    <p className="text-sm font-bold text-blue-900">
                      {(() => {
                        if (!card.currentStageEnteredAt) return '-';
                        const timeMs = Date.now() - new Date(card.currentStageEnteredAt).getTime();
                        const d = Math.floor(timeMs / (1000 * 60 * 60 * 24));
                        const h = Math.floor((timeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        return d > 0 ? `${d}d ${h}h` : `${h}h`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
