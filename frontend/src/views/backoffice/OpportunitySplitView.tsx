import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, FileText, Building, Edit2, User, ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';
import { compressImage } from '../../utils/imageUtils';


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

const Field = ({ label, name, value, type = "text", colSpan = 1, options }: { label: string, name: string, value: string, type?: string, colSpan?: number, options?: string[] }) => (
  <div className={colSpan > 1 ? `col-span-${colSpan}` : ''}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
    {globalIsEditing ? (
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

export const OpportunitySplitView: React.FC<{ card: any; onClose: () => void; onApprove: (towersData?: any[]) => void; onSave?: () => void }> = ({ card, onClose, onApprove, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic_info'); // basic_info, form_2, form_3, photos
  const [mediaAssets, setMediaAssets] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const isBackOfficeOrAdmin = user?.role === 'BACKOFFICE' || user?.role === 'ADMIN';

  const getCoordinates = () => {
    const gps = card.property?.coordenadasGps;
    if (!gps) return '';
    if (typeof gps === 'string') return gps.replace(/[()]/g, '');
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

  // Data State - mapped from specifications
  const [formData, setFormData] = useState<any>({
    // Form 1
    ejecutivoF1: card.property?.ejecutivo || card.currentOwnerUser?.fullName || 'Sin Asignar',
    resultadoVisitaF1: '-',
    detalleVisitaF1: '-',
    
    // Form 2
    hunterF2: card.property?.ejecutivo || card.currentOwnerUser?.fullName || 'Sin Asignar',
    ingresoF2: hasForm2 ? (card.property?.origenProspeccion || '-') : '-',
    tipoEdificioF2: hasForm2 ? (card.property?.clasificacionProyecto || '-') : '-',
    nombreProyectoF2: card.property?.nombreProyecto || card.title || '-',
    tipoViaF2: hasForm2 ? (card.property?.tipoVia || '-') : '-',
    nombreViaF2: card.property?.nombreVia || '-',
    numeracionViaF2: card.property?.numeracionMunicipal || '-',
    distritoF2: card.property?.distrito || '-',
    coordenadasF2: getCoordinates(),
    numeroHpsF2: card.property?.totalHogares?.toString() || '-',
    estrenoF2: hasForm2 
      ? (card.property?.estadoConstruccion === 'EN_CONSTRUCCION' || card.property?.estadoConstruccion === 'SÍ' || card.property?.estadoConstruccion === 'SI' ? 'SÍ' : 'NO') 
      : '-',
    fechaMontantesF2: hasForm2 ? formatDateString(card.property?.terminoMontantes) : '-',
    fechaEntregaF2: hasForm2 ? formatDateString(card.property?.fechaEntrega) : '-',
    inmobiliariaF2: '-',
    asignarF2: 'Asignar',

    // Form 3
    nombreCanalF3: hasForm3 ? (card.canalHunting || '-') : '-',
    ingresoF3: hasForm3 ? (card.property?.origenProspeccion || '-') : '-',
    hunterF3: card.property?.ejecutivo || card.currentOwnerUser?.fullName || 'Sin Asignar',
    nombreProyectoF3: card.property?.nombreProyecto || card.title || '-',
    tipoProyectoF3: hasForm3 ? (card.property?.tipoDesarrollo || '-') : '-',
    origenF3: hasForm3 ? (card.property?.origenProspeccion || '-') : '-',
    clasificacionF3: hasForm3 ? (card.property?.clasificacionProyecto || '-') : '-',
    tipoConstruccionF3: hasForm3 
      ? (card.property?.estadoConstruccion === 'EN_CONSTRUCCION' || card.property?.estadoConstruccion === 'SÍ' || card.property?.estadoConstruccion === 'SI' ? 'SÍ' : 'NO') 
      : '-',
    juntaDirectivaF3: hasForm3 ? (card.property?.juntaDirectiva || '-') : '-',
    cargoResponsableF3: '-',
    nombreResponsableF3: '-',
    telefonoResponsableF3: '-',
    correoResponsableF3: '-',
    visitaInspeccionF3: hasForm3 ? formatDateString(card.property?.fechaVisitaTecnica) : '-',

    horarioVisitaF3: hasForm3 ? (card.property?.horarioVisita || '-') : '-',
    departamentoF3: hasForm3 ? (card.property?.departamento || '-') : '-',
    provinciaF3: hasForm3 ? (card.property?.provincia || '-') : '-',
    distritoF3: hasForm3 ? (card.property?.distrito || '-') : '-',
    urbanizacionF3: hasForm3 ? (card.property?.urbanizacionZona || '-') : '-',
    codigoPostalF3: hasForm3 ? (card.property?.codigoPostal || '-') : '-',
    tipoViaF3: hasForm3 ? (card.property?.tipoVia || '-') : '-',
    nombreViaF3: hasForm3 ? (card.property?.nombreVia || '-') : '-',
    numeracionViaF3: hasForm3 ? (card.property?.numeracionMunicipal || '-') : '-',
    coordenadasF3: getCoordinates(),
    totalTorresF3: hasForm3 ? (card.property?.totalTorres?.toString() || '-') : '-',
    totalHogaresF3: hasForm3 ? (card.property?.totalHogares?.toString() || '-') : '-',
    clientesInteresadosF3: hasForm3 ? (card.property?.clientesInteresados?.toString() || '-') : '-'
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
        const { fetchApi } = await import('../../services/api.client');
        const submissions = await fetchApi<any[]>(`/opportunities/${card.id}/submissions`);
        if (submissions && submissions.length > 0) {
          const newFormData = { ...formData };

          submissions.forEach((sub: any) => {
            const payload = sub.raw_payload_json;
            if (sub.form_code === 'FORM_REGISTRO_PREDIO') {
              newFormData.resultadoVisitaF1 = payload.resultadoVisita || '-';
              newFormData.detalleVisitaF1 = payload.detalle || '-';
            }
            else if (sub.form_code === 'FORM_ASIGNACION') {
              newFormData.inmobiliariaF2 = payload.inmobiliaria || '-';
            }
            else if (sub.form_code === 'FORM_FICHA_DATOS') {
              newFormData.cargoResponsableF3 = payload.cargoResponsable || '-';
              newFormData.nombreResponsableF3 = payload.nombreResponsable || '-';
              newFormData.telefonoResponsableF3 = payload.telefonoResponsable || '-';
              newFormData.correoResponsableF3 = payload.correoResponsable || '-';
            }
          });

          setFormData(newFormData);
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
        const { fetchApi } = await import('../../services/api.client');
        const assets = await fetchApi<any[]>(`/media/assets/${card.id}`);
        if (Array.isArray(assets)) setMediaAssets(assets);
      } catch (e) {
        // Silently fail - photos tab just shows empty
        console.warn('No se pudieron cargar los media assets', e);
      }
    };
    fetchMedia();
  }, [card.id]);

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


      const { fetchApi } = await import('../../services/api.client');
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

  const isForm2Stage = card.stage === 5;
  const isForm3Stage = card.stage === 13;

  const stagesList = [
    { label: 'Registro de Predio', index: 0 },
    { label: 'Formulario Asignación', index: 4 },
    { label: 'Validación Back Office', index: 5 },
    { label: 'Ficha de Datos', index: 12 },
    { label: 'Validación Back Office 2', index: 13 }
  ];

  globalIsEditing = isEditing;
  globalHandleChange = handleChange;

  return (
    <div className="fixed inset-y-0 right-0 w-[85%] max-w-7xl bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="h-16 px-6 border-b border-gray-200 flex items-center justify-between bg-ghl-surface">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Detalle del Predio</p>
          <h2 className="text-2xl font-black text-gray-900 leading-none">{card.title || card.property?.nombreProyecto || 'Oportunidad Sin Nombre'}</h2>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Panel 1: Contenido con Tabs */}
        <div className="w-3/5 flex flex-col border-r border-gray-200 bg-gray-50">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200 bg-white">
            <button className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'basic_info' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('basic_info')}>
              INFORMACIÓN BÁSICA
            </button>
            <button className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'form_2' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('form_2')}>
              FORM. ASIGNACIÓN
            </button>
            <button className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'form_3' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('form_3')}>
              FICHA DE DATOS
            </button>
            <button className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'photos' ? 'border-ghl-blue text-ghl-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab('photos')}>
              FOTOS
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {activeTab === 'basic_info' && (
              <>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><User className="w-5 h-5 text-ghl-lightBlue"/> Génesis / Registro de Predio</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="Ejecutivo" name="ejecutivoF1" value={formData.ejecutivoF1} />
                    <Field label="Resultado de Visita" name="resultadoVisitaF1" value={formData.resultadoVisitaF1} />
                    <Field label="Detalle de la Visita" name="detalleVisitaF1" value={formData.detalleVisitaF1} type="textarea" colSpan={2} />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-ghl-lightBlue"/> Datos Generales</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <Field label="Nombre Proyecto" name="nombreProyectoF2" value={formData.nombreProyectoF2} />
                    <Field label="Hunter Asignado" name="hunterF2" value={formData.hunterF2} />
                    <Field label="Origen / Canal" name="origenF3" value={formData.origenF3} />
                    <Field label="Distrito" name="distritoF2" value={formData.distritoF2} />
                    <Field label="Dirección Exacta" name="nombreViaF2" value={formData.nombreViaF2} colSpan={2} />
                    <Field label="Coordenadas" name="coordenadasF2" value={formData.coordenadasF2} colSpan={2} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'form_2' && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">Campos de Asignación (Form 2) {isEditing && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded ml-2">Edición</span>}</h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <Field label="Nombre del Hunter" name="hunterF2" value={formData.hunterF2} />
                  <Field label="Ingreso" name="ingresoF2" value={formData.ingresoF2} type="select" options={['Propio', 'Referido']} />
                  <Field label="Tipo de Edificio" name="tipoEdificioF2" value={formData.tipoEdificioF2} type="select" options={['Estreno', 'Moderno', 'Antiguo']} />
                  <Field label="Nombre del Proyecto" name="nombreProyectoF2" value={formData.nombreProyectoF2} />
                  <Field label="Tipo de Vía" name="tipoViaF2" value={formData.tipoViaF2} type="select" options={['Avenida', 'Calle', 'Jirón', 'Pasaje']} />
                  <Field label="Nombre de Vía" name="nombreViaF2" value={formData.nombreViaF2} />
                  <Field label="Numeraciones de Vía" name="numeracionViaF2" value={formData.numeracionViaF2} />
                  <Field label="Distrito" name="distritoF2" value={formData.distritoF2} />
                  <Field label="Coordenadas" name="coordenadasF2" value={formData.coordenadasF2} />
                  <Field label="Número de HPs" name="numeroHpsF2" value={formData.numeroHpsF2} type="number" />
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
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4">Ficha Técnica (Form 3) {isEditing && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded ml-2">Edición</span>}</h4>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                    <Field label="Nombre Canal" name="nombreCanalF3" value={formData.nombreCanalF3} />
                    <Field label="Ingreso" name="ingresoF3" value={formData.ingresoF3} type="select" options={['Propio', 'Referido']} />
                    <Field label="Hunter" name="hunterF3" value={formData.hunterF3} />
                    
                    <Field label="Nombre Proyecto" name="nombreProyectoF3" value={formData.nombreProyectoF3} colSpan={2} />
                    <Field label="Tipo Proyecto" name="tipoProyectoF3" value={formData.tipoProyectoF3} type="select" options={['Estreno', 'Moderno', 'Antiguo']} />
                    
                    <Field label="Fuente / Origen" name="origenF3" value={formData.origenF3} />
                    <Field label="Clasificación" name="clasificacionF3" value={formData.clasificacionF3} />
                    <Field label="Tipo Construcción" name="tipoConstruccionF3" value={formData.tipoConstruccionF3} />
                    
                    <Field label="Junta Directiva" name="juntaDirectivaF3" value={formData.juntaDirectivaF3} type="select" options={['Sí', 'No']} />
                    <Field label="Cargo Responsable" name="cargoResponsableF3" value={formData.cargoResponsableF3} />
                    <Field label="Nombre Responsable" name="nombreResponsableF3" value={formData.nombreResponsableF3} />
                    
                    <Field label="Teléfono Resp." name="telefonoResponsableF3" value={formData.telefonoResponsableF3} />
                    <Field label="Correo Resp." name="correoResponsableF3" value={formData.correoResponsableF3} colSpan={2} />
                    
                    <Field label="Fecha Inspección" name="visitaInspeccionF3" value={formData.visitaInspeccionF3} type="date" />
                    <Field label="Horario Visita" name="horarioVisitaF3" value={formData.horarioVisitaF3} colSpan={2} />

                    <Field label="Departamento" name="departamentoF3" value={formData.departamentoF3} />
                    <Field label="Provincia" name="provinciaF3" value={formData.provinciaF3} />
                    <Field label="Distrito" name="distritoF3" value={formData.distritoF3} />

                    <Field label="Urbanización" name="urbanizacionF3" value={formData.urbanizacionF3} colSpan={2} />
                    <Field label="Cod. Postal" name="codigoPostalF3" value={formData.codigoPostalF3} />

                    <Field label="Tipo Vía" name="tipoViaF3" value={formData.tipoViaF3} />
                    <Field label="Nombre Vía" name="nombreViaF3" value={formData.nombreViaF3} />
                    <Field label="Numeración" name="numeracionViaF3" value={formData.numeracionViaF3} />

                    <Field label="Coordenadas" name="coordenadasF3" value={formData.coordenadasF3} colSpan={3} />
                    
                    <Field label="Total Torres" name="totalTorresF3" value={formData.totalTorresF3} type="number" />
                    <Field label="Total Hogares" name="totalHogaresF3" value={formData.totalHogaresF3} type="number" />
                    <Field label="Nro Interesados" name="clientesInteresadosF3" value={formData.clientesInteresadosF3} type="number" />
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-lg shadow-inner border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h5 className="font-bold text-gray-800">Matriz Dinámica de Torres</h5>
                    {isEditing && <button onClick={addTower} className="text-blue-600 font-bold hover:underline text-sm">+ Agregar Torre</button>}
                  </div>
                  
                  <div className="flex flex-col gap-0">
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

                      return (
                        <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 relative shadow-sm">
                          {isEditing && towers.length > 1 && (
                            <button type="button" onClick={() => removeTower(idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-bold">✖</button>
                          )}
                          <h4 className="font-bold text-gray-800 mb-4 text-md">Configuración {tower.nombre_torre || `Torre ${idx + 1}`}</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-1 md:col-span-2">
                              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">NOMBRE DE LA TORRE</label>
                              {isEditing ? (
                                <input 
                                  value={tower.nombre_torre} 
                                  onChange={(e) => handleTowerChange(idx, 'nombre_torre', e.target.value)} 
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ghl-blue" 
                                  placeholder="Ej: Torre 1"
                                />
                              ) : (
                                <p className="text-sm font-medium">{tower.nombre_torre}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">PISOS</label>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  value={tower.pisos_torre} 
                                  onChange={(e) => handleTowerChange(idx, 'pisos_torre', e.target.value)} 
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ghl-blue" 
                                  min="1"
                                  placeholder="Ej: 5"
                                />
                              ) : (
                                <p className="text-sm font-medium">{tower.pisos_torre}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">HOGARES POR PISO</label>
                              {isEditing ? (
                                <div>
                                  <input 
                                    type="text" 
                                    value={tower.hogares_por_piso} 
                                    onChange={(e) => handleTowerChange(idx, 'hogares_por_piso', e.target.value)} 
                                    className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 ${hasError ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-ghl-blue'}`} 
                                    placeholder="Ej: 4,4,4,2"
                                  />
                                  {hasError && <p className="text-red-500 text-xs mt-1 font-semibold">{errorMsg}</p>}
                                </div>
                              ) : (
                                <p className="text-sm font-medium">{tower.hogares_por_piso}</p>
                              )}
                            </div>
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

        {/* Panel 2: Timeline */}
        <div className="w-1/5 p-6 border-r border-gray-200 bg-white flex flex-col">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ghl-lightBlue" />
            Historial
          </h3>
          <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 flex-1">
            {stagesList.map((stageItem) => {
              const isPast = card.stage > stageItem.index;
              const isCurrent = card.stage === stageItem.index;
              
              let dotColor = "bg-gray-300";
              let textColor = "text-gray-400";
              let statusText = "Pendiente";
              
              if (isPast) {
                dotColor = "bg-green-500";
                textColor = "text-gray-800";
                statusText = "Completado";
              } else if (isCurrent) {
                dotColor = "bg-ghl-lightBlue animate-pulse";
                textColor = "text-ghl-blue";
                statusText = "En progreso";
              }

              return (
                <div key={stageItem.index} className="relative pl-6">
                  <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${dotColor}`}></span>
                  <p className={`text-sm font-bold ${textColor} leading-tight`}>{stageItem.label}</p>
                  <p className={`text-xs font-semibold ${textColor === 'text-gray-800' ? 'text-gray-500' : textColor} mt-1`}>{statusText}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 3: Acciones Condicionales */}
        {isBackOfficeOrAdmin && (
          <div className="w-1/5 p-6 bg-gray-50 flex flex-col">
            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-ghl-lightBlue" />
              Acciones
            </h3>

            <div className="flex-1 flex flex-col space-y-4 pt-4">
              {(isForm2Stage || isForm3Stage) ? (
                <>
                  <p className="text-xs text-gray-600 mb-2 text-center font-medium">
                    Requiere validación de Back Office para continuar.
                  </p>
                  <button 
                    className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 border-2 rounded-lg font-bold text-sm transition-colors ${isEditing ? 'border-green-600 text-green-600 bg-green-50' : 'border-ghl-blue text-ghl-blue hover:bg-blue-50'}`}
                    onClick={async () => {
                      if (isEditing) {
                        try {
                          const { opportunitiesService } = await import('../../services/opportunities.service');
                          
                          // Map fields back to the payload expected by updateForms
                          const payload = {
                            nombreProyecto: formData.nombreProyectoF2,
                            tipoVia: formData.tipoViaF2,
                            nombreVia: formData.nombreViaF2,
                            numeracionesVia: formData.numeracionViaF2,
                            distrito: formData.distritoF2,
                            coordenadas: formData.coordenadasF2,
                            numeroHPs: formData.numeroHpsF2,
                            tipoEdificio: formData.tipoEdificioF2,
                            fechaEntrega: formData.fechaEntregaF2,
                            fechaMontantes: formData.fechaMontantesF2,
                            inmobiliaria: formData.inmobiliariaF2,
                            
                            // Form 3 fields too
                            nombreCanal: formData.nombreCanalF3,
                            tipoProyecto: formData.tipoProyectoF3,
                            fuente: formData.origenF3,
                            clasificacion: formData.clasificacionF3,
                            tipoConstruccion: formData.tipoConstruccionF3,
                            juntaDirectiva: formData.juntaDirectivaF3,
                            visitaInspeccion: formData.visitaInspeccionF3,
                            horarioVisita: formData.horarioVisitaF3,
                            departamento: formData.departamentoF3,
                            provincia: formData.provinciaF3,
                            urbanizacion: formData.urbanizacionF3,
                            codigoPostal: formData.codigoPostalF3,
                            totalTorres: formData.totalTorresF3,
                            totalHogares: formData.totalHogaresF3,
                            clientesInteresados: formData.clientesInteresadosF3,
                            towersData: towers
                          };

                          await opportunitiesService.updateForms(card.id, payload as any);
                          toast.success('Datos actualizados correctamente en el servidor.');
                          if (onSave) onSave();
                        } catch (e: any) {
                          toast.error('Error al guardar datos: ' + (e.message || 'Error de red'));
                          return; // Don't exit edit mode if save failed
                        }
                      }
                      setIsEditing(!isEditing);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditing ? 'Guardar' : 'Editar Datos'}
                  </button>

                  <button 
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-sm"
                    onClick={() => {
                      // Validation before approving
                      for (const tower of towers) {
                        const numPisos = parseInt(tower.pisos_torre, 10) || 0;
                        if (tower.hogares_por_piso && tower.hogares_por_piso.includes(',')) {
                          if (tower.hogares_por_piso.split(',').length !== numPisos) {
                            toast.error(`Error en ${tower.nombre_torre || 'Torre'}: La cantidad de hogares separados por comas no coincide con el número de pisos (${numPisos}).`);
                            return;
                          }
                        }
                      }

                      // Parser Case A (Expansion)
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
                </>
              ) : (
                <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg bg-white mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-gray-500 font-semibold">Oportunidad en flujo normal.</p>
                </div>
              )}
              
              {user?.role === 'ADMIN' && (
                <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                  <p className="text-xs font-bold text-gray-700 uppercase mb-2">Reasignar Propietario</p>
                  <input 
                    type="text" 
                    name="hunterF2"
                    value={formData.hunterF2}
                    onChange={handleChange}
                    placeholder="ID / Nombre del Hunter"
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 mb-2 outline-none focus:border-ghl-blue"
                  />
                  <button 
                    className="w-full py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900 transition-colors"
                    onClick={async () => {
                      try {
                        const { opportunitiesService } = await import('../../services/opportunities.service');
                        await opportunitiesService.updateForms(card.id, { currentOwnerUserId: formData.hunterF2 });
                        toast.success(`Propietario reasignado a: ${formData.hunterF2}`);
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
