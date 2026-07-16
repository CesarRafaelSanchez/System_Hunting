import React, { useState, useEffect } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { useAuthStore } from '../../store/useAuthStore';
import { compressImage } from '../../utils/imageUtils';
import { addToSyncQueue } from '../../utils/indexedDB';
import { fetchApi } from '../../services/api.client';
import styles from './FormWizard.module.css';
import { toast } from 'sonner';

export const Form3FichaDatos: React.FC<{ opportunityId?: string, onComplete?: () => void }> = ({ opportunityId, onComplete }) => {
  const [step, setStep] = useState(1);
  const { saveDraft, getDraft, clearDraft } = useFormStore();
  const { user } = useAuthStore();
  const isPublic = !user;
  const [isUploading, setIsUploading] = useState(false);
  const [isLockedEstreno, setIsLockedEstreno] = useState(false);
  
  const [formData, setFormData] = useState({
    nombreCanal: '',
    ingreso: '',
    hunterReferido: '',
    nombreHunter: user?.id || '',
    nombreProyecto: '',
    tipoProyecto: 'Nuevo Predio',
    fuente: '',
    clasificacion: '',
    tipoConstruccion: '',
    fechaEntrega: '',
    fechaMontantes: '',
    fechaMecha: '',
    inmobiliaria: '',
    juntaDirectiva: '',
    cargoResponsable: '',
    nombreResponsable: '',
    telefonoResponsable: '',
    correoResponsable: '',
    visitaInspeccion: '',
    horarioVisita: '',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: '',
    urbanizacion: '',
    codigoPostal: '',
    tipoVia: '',
    nombreVia: '',
    numeracionVia: '',
    coordenadas: '',
    totalTorres: '',
    totalHogares: '',
    clientesInteresados: '',
    fotoEdificioUrl: '',
    fotoMontantesUrl: ''
  });

  const [towers, setTowers] = useState([{ nombre_torre: 'Torre 1', pisos_torre: '1', hogares_por_piso: [0] }]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState('');

  useEffect(() => {
    const fetchOpportunityData = async () => {
      const draft = getDraft(`form3-${opportunityId}`);
      if (draft) {
        let loadedData = draft.formData || formData;
        // Sanitize legacy draft data
        if (loadedData.ingreso === 'TERRENO') {
          loadedData.ingreso = 'Propio';
        }
        if (loadedData.nombreHunter === user?.id || !loadedData.nombreHunter || loadedData.nombreHunter.length === 36) { // length 36 is UUID length
          loadedData.nombreHunter = user?.fullName || 'Hunter';
        }
        
        setFormData(loadedData);
        setTowers(draft.towers || towers);
        return;
      }

      if (!opportunityId) return;

      try {
        const endpoint = isPublic ? `/public/opportunities/${opportunityId}` : '/opportunities';
        const res = await fetchApi<any>(endpoint);
        const opp = isPublic ? res : (Array.isArray(res) ? res.find((o: any) => o.id === opportunityId) : (res as any).data?.find((o: any) => o.id === opportunityId));
        if (opp && opp.property) {
          const prop = opp.property;
          const getCoordinates = () => {
            const gps = prop.coordenadasGps;
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

          setFormData(prev => ({
            ...prev,
            nombreCanal: opp.canalHunting || '',
            ingreso: (prop.origenProspeccion && prop.origenProspeccion !== 'TERRENO') ? prop.origenProspeccion : 'Propio',
            hunterReferido: opp.referredHunterName || '', 
            nombreHunter: user?.fullName || opp.currentOwnerUser?.fullName || user?.id || opp.currentOwnerUserId || '',
            nombreProyecto: prop.nombreProyecto || '',
            tipoProyecto: prop.tipoDesarrollo || 'Nuevo Predio',
            clasificacion: prop.clasificacionProyecto || '',
            tipoConstruccion: (prop.estadoConstruccion === 'Sí' || prop.estadoConstruccion === 'ESTRENO') ? 'Estreno' : (prop.estadoConstruccion || ''),
            fechaEntrega: prop.fechaEntrega ? new Date(prop.fechaEntrega).toISOString().split('T')[0] : '',
            fechaMontantes: prop.terminoMontantes ? new Date(prop.terminoMontantes).toISOString().split('T')[0] : '',
            fechaMecha: prop.terminoMecha ? new Date(prop.terminoMecha).toISOString().split('T')[0] : '',
            inmobiliaria: prop.inmobiliaria || '',
            juntaDirectiva: prop.juntaDirectiva || '',
            horarioVisita: prop.horarioVisita || '',
            departamento: prop.departamento || 'Lima',
            provincia: prop.provincia || 'Lima',
            distrito: prop.distrito || '',
            urbanizacion: prop.urbanizacionZona || '',
            codigoPostal: prop.codigoPostal || '',
            tipoVia: prop.tipoVia || '',
            nombreVia: prop.nombreVia || '',
            numeracionVia: prop.numeracionMunicipal || '',
            coordenadas: getCoordinates(),
            totalHogares: prop.totalHogares?.toString() || '',
            totalTorres: prop.totalTorres?.toString() || '1',
          }));

          if (prop.torres && prop.torres.length > 0) {
            const parsedTowers = prop.torres.map((t: any) => {
              const maxPiso = t.pisos && t.pisos.length > 0 ? Math.max(...t.pisos.map((p: any) => p.numeroPiso)) : 1;
              const hogaresPorPiso = Array(maxPiso).fill(0);
              if (t.pisos) {
                t.pisos.forEach((p: any) => {
                  if (p.numeroPiso > 0 && p.numeroPiso <= maxPiso) {
                    hogaresPorPiso[p.numeroPiso - 1] = p.hogaresCantidad || 0;
                  }
                });
              }
              return {
                nombre_torre: t.nombreTorre || 'Torre 1',
                pisos_torre: String(maxPiso),
                hogares_por_piso: hogaresPorPiso
              };
            });
            setTowers(parsedTowers);
          } else if (prop.totalHogares > 0) {
            setTowers([{
              nombre_torre: 'Torre 1',
              pisos_torre: '1',
              hogares_por_piso: [prop.totalHogares]
            }]);
          }

          if (prop.estadoConstruccion === 'ESTRENO' || prop.estadoConstruccion === 'Sí') {
            setIsLockedEstreno(true);
          }
        }
      } catch (e) {
        console.error('Error pre-filling Form3', e);
      }
    };

    fetchOpportunityData();
  }, [getDraft, opportunityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    saveDraft(`form3-${opportunityId}`, { formData: newFormData, towers });
  };

  const handleTowerChange = (index: number, field: string, value: any) => {
    const newTowers = [...towers];
    if (field === 'pisos_torre') {
      const num = parseInt(value, 10) || 1;
      newTowers[index].pisos_torre = num.toString();
      const currentHogares = newTowers[index].hogares_por_piso;
      if (num > currentHogares.length) {
        newTowers[index].hogares_por_piso = [...currentHogares, ...Array(num - currentHogares.length).fill(0)];
      } else if (num < currentHogares.length) {
        newTowers[index].hogares_por_piso = currentHogares.slice(0, num);
      }
    } else {
      newTowers[index] = { ...newTowers[index], [field]: value };
    }
    setTowers(newTowers);
    saveDraft(`form3-${opportunityId}`, { formData, towers: newTowers });
  };

  const handleHogaresChange = (towerIndex: number, floorIndex: number, value: string) => {
    const newTowers = [...towers];
    const val = parseInt(value, 10) || 0;
    newTowers[towerIndex].hogares_por_piso[floorIndex] = val;
    setTowers(newTowers);
    saveDraft(`form3-${opportunityId}`, { formData, towers: newTowers });
  };

  const addTower = () => {
    setTowers([...towers, { nombre_torre: `Torre ${towers.length + 1}`, pisos_torre: '1', hogares_por_piso: [0] }]);
  };

  const removeTower = (index: number) => {
    const newTowers = towers.filter((_, i) => i !== index);
    setTowers(newTowers);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const compressedFile = await compressImage(file, 1600, 1600, 0.8);
      
      const formDataUpload = new FormData();
      formDataUpload.append('file', compressedFile, file.name);
      // Required metadata fields for the backend
      formDataUpload.append('entityType', 'OPPORTUNITY');
      formDataUpload.append('entityId', opportunityId || '');
      formDataUpload.append('category', fieldName === 'fotoEdificioUrl' ? 'FACHADA' : 'MONTANTES');
      formDataUpload.append('fileName', file.name);
      formDataUpload.append('mimeType', file.type || 'image/jpeg');
      formDataUpload.append('mediaType', file.type?.startsWith('image/') ? 'IMAGE' : 'DOCUMENT');
      formDataUpload.append('fileSize', String(compressedFile.size || file.size));

      const { fetchApi } = await import('../../services/api.client');
      const res = await fetchApi<any>('/media/upload', { 
        method: 'POST',
        body: formDataUpload
      });
      const url = res.url || res.fileUrl;
      
      handleChange({ target: { name: fieldName, value: url } } as any);
      toast.success('Archivo comprimido y subido con éxito');
    } catch (error) {
      toast.error('Error procesando el archivo');
    } finally {
      setIsUploading(false);
    }
  };


  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-calculamos totales
    const totalTorres = towers.length;
    const totalHogares = towers.reduce((acc, t) => acc + t.hogares_por_piso.reduce((sum: number, h: number) => sum + h, 0), 0);
    const finalFormData = { ...formData, totalTorres: totalTorres.toString(), totalHogares: totalHogares.toString() };

    try {
      if (isPublic) {
        await fetchApi(`/public/opportunities/${opportunityId}/form`, {
          method: 'PATCH',
          body: JSON.stringify({
            ...finalFormData,
            _formType: 'FORM_FICHA_DATOS',
            towersData: towers
          })
        });
      } else {
        const { opportunitiesService } = await import('../../services/opportunities.service');
        
        // 1. Guardar datos del formulario en el backend (actualiza el predio + guarda submission)
        if (opportunityId) {
          await opportunitiesService.updateForms(opportunityId, {
            ...finalFormData,
            _formType: 'FORM_FICHA_DATOS',
            towersData: towers,
          } as any);
        }

        // 2. Transición de etapa: 12 → 13 (Form Ficha Datos Completado)
        await opportunitiesService.transitionStage(
          opportunityId || '',
          'S13',
          'Ficha de datos completada',
          false,
          towers
        );
      }

      toast.success('Ficha de Datos guardada y enviada a validación de Back Office.');
      clearDraft(`form3-${opportunityId}`);
      
      if (onComplete) {
        onComplete();
      }
      
    } catch (error: any) {
      setIsExporting(false);
      if (!navigator.onLine || error.message === 'Failed to fetch' || error.message?.includes('NetworkError')) {
        await addToSyncQueue(`/opportunities/${opportunityId}/stage`, 'PATCH', { 
          toStagePosition: 13, 
          reason: 'Ficha de datos completada', 
        });
        toast.warning('Sin conexión. Los datos se guardaron localmente y se enviarán automáticamente al recuperar la señal.');
        clearDraft(`form3-${opportunityId}`);
        if (onComplete) onComplete();
      } else {
        toast.error('Error enviando ficha técnica: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  if (exportSuccessUrl) {
    return (
      <div className={styles.wizardContainer} style={{ textAlign: 'center', padding: '50px' }}>
        <h2>¡Ficha Técnica Generada!</h2>
        <p>El reporte de WIN se ha creado exitosamente.</p>
        <button 
          onClick={() => { setExportSuccessUrl(''); if(onComplete) onComplete(); }}
          className={`${styles.button} ${styles.btnSubmit}`}
        >
          Continuar
        </button>
      </div>
    );
  }

  if (isExporting) {
    return (
      <div className={styles.wizardContainer} style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Generando Reporte...</h2>
        <p>Por favor espere mientras el Worker de Python procesa la ficha y emite el Excel/PDF.</p>
        <div style={{ marginTop: '20px', fontSize: '24px' }}>⏳</div>
      </div>
    );
  }

  return (
    <div className={styles.wizardContainer}>
      <h2>3. Registro de Ficha (WIN)</h2>
      <div className={styles.stepper}>
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`${styles.step} ${step >= s ? styles.active : ''} ${step > s ? styles.completed : ''}`}>{s}</div>
        ))}
      </div>

      <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        {step === 1 && (
          <div>
            <h3 className={styles.stepTitle}>Datos Generales</h3>

            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo (Edificio/Condominio) *</label>
              <input name="clasificacion" value={formData.clasificacion || 'Edificio'} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del (Edificio/Condominio) *</label>
              <input name="nombreProyecto" value={formData.nombreProyecto} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} required placeholder="Nombre del proyecto" />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Dirección *</label>
              <input value={`${formData.tipoVia} ${formData.nombreVia} ${formData.numeracionVia}`.trim()} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Distrito *</label>
              <input name="distrito" value={formData.distrito} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} required />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Coordenadas *</label>
              <input name="coordenadas" value={formData.coordenadas} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} required />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Para Estrenos: SI o NO *</label>
              {isLockedEstreno ? (
                <div style={{display:'flex', gap:'15px'}}>
                  <label><input type="radio" checked={true} readOnly /> SI</label>
                  <label><input type="radio" disabled /> NO</label>
                </div>
              ) : (
                <div style={{display:'flex', gap:'15px'}}>
                  <label><input type="radio" name="tipoConstruccion" value="Estreno" checked={formData.tipoConstruccion === 'Estreno'} onChange={handleChange} required /> SI</label>
                  <label><input type="radio" name="tipoConstruccion" value="Moderno" checked={formData.tipoConstruccion !== 'Estreno' && formData.tipoConstruccion !== ''} onChange={() => handleChange({ target: { name: 'tipoConstruccion', value: 'Moderno' } } as any)} required /> NO</label>
                </div>
              )}
            </div>

            {formData.tipoConstruccion === 'Estreno' && (
              <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginTop: '15px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: '14px' }}>Si es de estreno</h4>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha de entrega a propietarios *</label>
                  <input type="date" name="fechaEntrega" value={formData.fechaEntrega} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha término de montantes *</label>
                  <input type="date" name="fechaMontantes" value={formData.fechaMontantes} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha término de mecha *</label>
                  <input type="date" name="fechaMecha" value={formData.fechaMecha} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Inmobiliaria *</label>
                  <input type="text" name="inmobiliaria" value={formData.inmobiliaria} onChange={handleChange} className={styles.input} required placeholder="Nombre de la Inmobiliaria" />
                </div>
              </div>
            )}

            <div className={styles.formGroup} style={{marginTop: '20px'}}>
              <label className={styles.label}>Nombre de Canal *</label>
              <div style={{display:'flex', gap:'15px'}}>
                <label><input type="radio" name="nombreCanal" value="FUTURA" checked={formData.nombreCanal === 'FUTURA'} onChange={handleChange} required /> FUTURA</label>
                <label><input type="radio" name="nombreCanal" value="NOVACORE" checked={formData.nombreCanal === 'NOVACORE'} onChange={handleChange} required /> NOVACORE</label>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Fuente / Origen *</label>
              <input name="fuente" value={formData.ingreso} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} required />
            </div>

            {formData.ingreso === 'Referido' && (
              <div className={styles.formGroup}>
                <label className={styles.label}>Hunter Referido *</label>
                <input name="hunterReferido" value={formData.hunterReferido} readOnly className={`${styles.input} bg-gray-100 cursor-not-allowed`} required placeholder="No especificado" />
              </div>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del Hunter</label>
              <div className={`${styles.input} bg-gray-50 text-gray-600 flex items-center gap-2`} style={{cursor: 'default'}}>
                <span>👤</span>
                <span>{formData.nombreHunter || 'Hunter'}</span>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Proyecto *</label>
              <select name="tipoProyecto" value={formData.tipoProyecto} onChange={handleChange} className={styles.select} required>
                <option value="">Elegir el Tipo de Proyecto</option>
                <option value="Nuevo Predio">Nuevo Predio</option>
                <option value="Ampliación de Torre">Ampliación de Torre</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className={styles.stepTitle}>Responsables y Programación</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Junta Directiva *</label>
              <div style={{display:'flex', gap:'15px'}}>
                <label><input type="radio" name="juntaDirectiva" value="Si" checked={formData.juntaDirectiva === 'Si'} onChange={handleChange} required /> Si</label>
                <label><input type="radio" name="juntaDirectiva" value="No" checked={formData.juntaDirectiva === 'No'} onChange={handleChange} required /> No</label>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Cargo del Responsable *</label>
              <input name="cargoResponsable" value={formData.cargoResponsable} onChange={handleChange} className={styles.input} required placeholder="Escribir el Cargo del Responsable" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del Responsable *</label>
              <input name="nombreResponsable" value={formData.nombreResponsable} onChange={handleChange} className={styles.input} required placeholder="Escribir el Nombre de Responsable" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Teléfono - Móvil del Responsable *</label>
              <input name="telefonoResponsable" value={formData.telefonoResponsable} onChange={handleChange} className={styles.input} required placeholder="Escribir el Telefono del Responsable sin espacios" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo del Responsable *</label>
              <input type="email" name="correoResponsable" value={formData.correoResponsable} onChange={handleChange} className={styles.input} required placeholder="Escribir el Correo del Responsable" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Visita de Inspección Técnica *</label>
              <input type="date" name="visitaInspeccion" value={formData.visitaInspeccion} onChange={handleChange} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Rango de Horario de Visita *</label>
              <div style={{display:'flex', gap:'15px'}}>
                <label><input type="radio" name="horarioVisita" value="9 AM a 12 PM" checked={formData.horarioVisita === '9 AM a 12 PM' || formData.horarioVisita === '9 AM a 12 AM'} onChange={handleChange} required /> 9 AM a 12 PM</label>
                <label><input type="radio" name="horarioVisita" value="1 PM A 4 PM" checked={formData.horarioVisita === '1 PM A 4 PM'} onChange={handleChange} required /> 1 PM A 4 PM</label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className={styles.stepTitle}>Ubicación Geográfica</h3>
            <div className={styles.formGroup} style={{display:'flex', gap:'15px'}}>
              <div style={{flex:1}}>
                <label className={styles.label}>Departamento *</label>
                <input name="departamento" value="Lima" readOnly className={styles.input} style={{backgroundColor:'#eee'}}/>
              </div>
              <div style={{flex:1}}>
                <label className={styles.label}>Provincia *</label>
                <input name="provincia" value="Lima" readOnly className={styles.input} style={{backgroundColor:'#eee'}}/>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Urbanización *</label>
              <input name="urbanizacion" value={formData.urbanizacion} onChange={handleChange} className={styles.input} required placeholder="Escribir nombre de la Urbanización" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Código Postal *</label>
              <input name="codigoPostal" value={formData.codigoPostal} onChange={handleChange} className={styles.input} required placeholder="Colocar el codigo postal , Ejem: 15419" />
            </div>
            
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className={styles.stepTitle}>Estructura del Predio (Torres)</h3>
            <div className={styles.formGroup} style={{display:'flex', gap:'15px'}}>
              <div style={{flex:1}}>
                <label className={styles.label}>Total de Torres (Auto)</label>
                <input type="number" name="totalTorres" value={towers.length} readOnly className={styles.input} style={{backgroundColor:'#eee'}} />
              </div>
              <div style={{flex:1}}>
                <label className={styles.label}>Total de Hogares (Auto)</label>
                <input type="number" name="totalHogares" value={towers.reduce((acc, t) => acc + t.hogares_por_piso.reduce((sum, h) => sum + h, 0), 0)} readOnly className={styles.input} style={{backgroundColor:'#eee'}} />
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={styles.stepTitle} style={{marginBottom: 0}}>Matriz Dinámica de Torres</h3>
                <button type="button" onClick={addTower} className="text-blue-600 font-bold hover:underline text-sm">+ Agregar Torre</button>
              </div>
              
              {towers.map((tower, idx) => {
                return (
                  <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 relative shadow-sm">
                    {towers.length > 1 && (
                      <button type="button" onClick={() => removeTower(idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-bold">✖</button>
                    )}
                    <h4 className="font-bold text-gray-800 mb-4 text-md">Configuración {tower.nombre_torre || `Torre ${idx + 1}`}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">NOMBRE DE LA TORRE</label>
                        <input 
                          value={tower.nombre_torre} 
                          onChange={(e) => handleTowerChange(idx, 'nombre_torre', e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                          required 
                          placeholder="Ej: Torre 1"
                        />
                      </div>
                      
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">CANTIDAD DE PISOS</label>
                        <input 
                          type="number" 
                          value={tower.pisos_torre} 
                          onChange={(e) => handleTowerChange(idx, 'pisos_torre', e.target.value)} 
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" 
                          required 
                          min="1"
                          max="100"
                          placeholder="Ej: 5"
                        />
                      </div>
                      
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold mb-2">HOGARES POR PISO</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                          {tower.hogares_por_piso.map((hp, floorIdx) => (
                            <div key={floorIdx} className="flex flex-col items-center p-2 border rounded-md bg-gray-50">
                              <span className="text-[10px] font-bold text-gray-500 mb-1">Piso {floorIdx + 1}</span>
                              <input
                                type="number"
                                min="0"
                                value={hp.toString()}
                                onChange={(e) => handleHogaresChange(idx, floorIdx, e.target.value)}
                                className="w-full text-center border-b border-gray-300 bg-transparent text-sm font-semibold outline-none focus:border-blue-500"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Nro de Clientes Interesados *</label>
              <input type="number" name="clientesInteresados" value={formData.clientesInteresados} onChange={handleChange} className={styles.input} required placeholder="Colocar cantidad de clientes interesados" />
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className={styles.stepTitle}>Evidencias Fotográficas</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Foto del Edificio (Fachada) *</label>
              <div style={{border: '2px dashed #ccc', padding: '20px', textAlign: 'center', borderRadius: '5px', marginBottom: '10px'}}>
                <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'fotoEdificioUrl')} required={!formData.fotoEdificioUrl} />
                <p style={{fontSize:'0.85rem', color:'#666', marginTop:'10px'}}>Sube 1 archivo compatible (PNG, JPEG, JPG, PDF)</p>
                {formData.fotoEdificioUrl && <div style={{color: 'green', marginTop:'5px'}}>✓ Archivo adjuntado</div>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Foto de las Montantes y Acometida *</label>
              <div style={{border: '2px dashed #ccc', padding: '20px', textAlign: 'center', borderRadius: '5px'}}>
                <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, 'fotoMontantesUrl')} required={!formData.fotoMontantesUrl} />
                <p style={{fontSize:'0.85rem', color:'#666', marginTop:'10px'}}>Sube 1 archivo compatible (PNG, JPEG, JPG, PDF)</p>
                {formData.fotoMontantesUrl && <div style={{color: 'green', marginTop:'5px'}}>✓ Archivo adjuntado</div>}
              </div>
            </div>
            
            {isUploading && <p style={{color: 'blue'}}>Comprimiendo y subiendo imagen (HTML5 Canvas)...</p>}
          </div>
        )}

        <div className={styles.buttonGroup}>
          {step > 1 && <button type="button" onClick={prevStep} className={`${styles.button} ${styles.btnBack}`}>Atrás</button>}
          {step < 5 && <button type="submit" className={`${styles.button} ${styles.btnNext}`}>Siguiente</button>}
          {step === 5 && <button type="submit" className={`${styles.button} ${styles.btnSubmit}`} disabled={isUploading}>Enviar Ficha a WIN</button>}
        </div>
      </form>
    </div>
  );
};
