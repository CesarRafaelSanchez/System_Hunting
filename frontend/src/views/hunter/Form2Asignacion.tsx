import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFormStore } from '../../store/useFormStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LIMA_DISTRITOS } from '../../utils/constants';
import { addToSyncQueue } from '../../utils/indexedDB';
import styles from './FormWizard.module.css';

export const Form2Asignacion: React.FC<{ opportunityId?: string, onComplete?: () => void }> = ({ opportunityId, onComplete }) => {
  const [step, setStep] = useState(1);
  const { saveDraft, getDraft, clearDraft } = useFormStore();
  const { user } = useAuthStore();
  

  const [formData, setFormData] = useState({
    nombreHunter: user?.id || '',
    ingreso: '',
    tipoEdificio: '',
    nombreProyecto: '',
    tipoVia: '',
    nombreVia: '',
    numeracionesVia: '',
    distrito: '',
    coordenadas: '',
    numeroHPs: '',
    esEstreno: 'No',
    fechaMontantes: '',
    fechaEntrega: '',
    inmobiliaria: '',
    asignarReasignar: ''
  });

  useEffect(() => {
    const fetchOpportunityData = async () => {
      const draft = getDraft(`form2-${opportunityId}`);
      if (draft) {
        setFormData(draft);
        return;
      }
      
      if (!opportunityId) return;

      try {
        const { fetchApi } = await import('../../services/api.client');
        const res = await fetchApi<any[]>('/opportunities');
        const opp = res.find((o: any) => o.id === opportunityId);
        if (opp && opp.property) {
          const prop = opp.property;
          const getCoordinates = () => {
            const gps = prop.coordenadasGps;
            if (!gps) return '';
            if (typeof gps === 'string') return gps.replace(/[()]/g, '');
            if (typeof gps === 'object' && gps.x !== undefined && gps.y !== undefined) {
              return `${gps.y}, ${gps.x}`;
            }
            return '';
          };

          setFormData(prev => ({
            ...prev,
            nombreProyecto: prop.nombreProyecto || '',
            tipoVia: prop.tipoVia || '',
            nombreVia: prop.nombreVia || '',
            numeracionesVia: prop.numeracionMunicipal || '',
            distrito: prop.distrito || '',
            coordenadas: getCoordinates(),
            numeroHPs: prop.totalHogares?.toString() || '',
            tipoEdificio: prop.clasificacionProyecto || '',
          }));
        }
      } catch (e) {
        console.error('Error pre-filling Form2', e);
      }
    };

    fetchOpportunityData();
  }, [getDraft, opportunityId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    if (e.target.name === 'esEstreno' && e.target.value === 'No') {
      newFormData.fechaMontantes = '';
      newFormData.fechaEntrega = '';
      newFormData.inmobiliaria = '';
    }
    setFormData(newFormData);
    saveDraft(`form2-${opportunityId}`, newFormData);
  };

  const captureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        handleChange({ target: { name: 'coordenadas', value: coords } } as any);
      }, (err) => {
        toast.error('Error capturando ubicación: ' + err.message);
      });
    } else {
      toast.error('Geolocalización no soportada por el navegador.');
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { opportunitiesService } = await import('../../services/opportunities.service');
      
      // 1. Guardar datos del formulario en el backend (actualiza el predio)
      if (opportunityId) {
        await opportunitiesService.updateForms(opportunityId, {
          ...formData,
          _formType: 'FORM_ASIGNACION',
        } as any);
      }

      // 2. Transición de etapa: 4 → 5 (Form Asignación Completado)
      // La función le suma +1, así que pasamos 4 para que llegue a posición 5
      await opportunitiesService.transitionStage(opportunityId || '', 4, 'Formulario de asignación completado');

      toast.success('Formulario de asignación completado.');
      clearDraft(`form2-${opportunityId}`);
      if (onComplete) onComplete();
    } catch (error: any) {
      if (!navigator.onLine || error.message === 'Failed to fetch' || error.message?.includes('NetworkError')) {
        await addToSyncQueue(`/opportunities/${opportunityId}/stage`, 'PATCH', { toStagePosition: 5, reason: 'Formulario de asignación completado' });
        toast.warning('Sin conexión. Se guardó localmente y se enviará al recuperar la señal.');
        clearDraft(`form2-${opportunityId}`);
        if (onComplete) onComplete();
      } else {
        toast.error('Error guardando asignación: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <h2>2. Asignación a WIN</h2>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>1</div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>2</div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''} ${step > 3 ? styles.completed : ''}`}>3</div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        {step === 1 && (
          <div>
            <h3 className={styles.stepTitle}>Datos Generales</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del Hunter</label>
              <div className={`${styles.input} bg-gray-50 text-gray-600 flex items-center gap-2`} style={{cursor: 'default'}}>
                <span>👤</span>
                <span>{user?.fullName || user?.email || 'Hunter'}</span>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ingreso *</label>
              <select name="ingreso" value={formData.ingreso} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccionar Tipo de Ingreso</option>
                <option value="Propio">Propio</option>
                <option value="Referido">Referido</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Edificio *</label>
              <select name="tipoEdificio" value={formData.tipoEdificio} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccionar el Tipo de Edificio</option>
                <option value="Estreno">Estreno</option>
                <option value="Moderno">Moderno</option>
                <option value="Antiguo">Antiguo</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del Proyecto/ Edificio/ Condominio *</label>
              <input name="nombreProyecto" value={formData.nombreProyecto} onChange={handleChange} className={styles.input} required placeholder="Escribir el Nombre del Proyecto" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className={styles.stepTitle}>Ubicación</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tipo de Vía *</label>
              <select name="tipoVia" value={formData.tipoVia} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccionar Tipo de Via</option>
                <option value="Avenida">Avenida</option>
                <option value="Calle">Calle</option>
                <option value="Jirón">Jirón</option>
                <option value="Pasaje">Pasaje</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre de Vía *</label>
              <input name="nombreVia" value={formData.nombreVia} onChange={handleChange} className={styles.input} required placeholder="Escribir el nombre de la Via" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Numeraciones de Vía *</label>
              <input name="numeracionesVia" value={formData.numeracionesVia} onChange={handleChange} className={styles.input} required placeholder="Escribir la Numeración de la Via (Ej. 428 )" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Distrito *</label>
              <select name="distrito" value={formData.distrito} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccionar Distrito</option>
                {LIMA_DISTRITOS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Coordenadas *</label>
              <div style={{display:'flex', gap:'10px'}}>
                <input name="coordenadas" value={formData.coordenadas} onChange={handleChange} className={styles.input} required placeholder="Escribir las coordenadas, solo números (Ej. -12.0397, -77.0372)" />
                <button type="button" onClick={captureLocation} className={`${styles.button} ${styles.btnBack}`} style={{margin:0, width:'auto', padding:'0 15px'}}>📍 GPS</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className={styles.stepTitle}>Detalles y Solicitud</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Número de Departamentos u Hogares (HPs) *</label>
              <input type="number" name="numeroHPs" value={formData.numeroHPs} onChange={handleChange} className={styles.input} required placeholder="Escribir solo números (Ej. 123)" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} style={{marginBottom: '5px'}}>¿Es Edificio de Estreno? *</label>
              <div style={{display: 'flex', gap: '15px'}}>
                <label><input type="radio" name="esEstreno" value="Sí" checked={formData.esEstreno === 'Sí'} onChange={handleChange} required /> Sí</label>
                <label><input type="radio" name="esEstreno" value="No" checked={formData.esEstreno === 'No'} onChange={handleChange} required /> No</label>
              </div>
            </div>
            {formData.esEstreno === 'Sí' && (
              <>
                <div className={styles.formGroup} style={{marginTop: '15px'}}>
                  <label className={styles.label}>Fecha de Montantes y Acometidas *</label>
                  <input type="date" name="fechaMontantes" value={formData.fechaMontantes} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha de Entrega a Propietarios *</label>
                  <input type="date" name="fechaEntrega" value={formData.fechaEntrega} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Inmobiliaria *</label>
                  <input type="text" name="inmobiliaria" value={formData.inmobiliaria} onChange={handleChange} className={styles.input} required placeholder="Escribir el Nombre de la Inmobiliaria" />
                </div>
              </>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label}>Asignar / Reasignar *</label>
              <select name="asignarReasignar" value={formData.asignarReasignar} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccionar Opción</option>
                <option value="Asignar">Asignar</option>
                <option value="Reasignar">Reasignar</option>
              </select>
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          {step > 1 && <button type="button" onClick={prevStep} className={`${styles.button} ${styles.btnBack}`}>Atrás</button>}
          {step < 3 && <button type="submit" className={`${styles.button} ${styles.btnNext}`}>Siguiente</button>}
          {step === 3 && <button type="submit" className={`${styles.button} ${styles.btnSubmit}`}>Enviar Formulario</button>}
        </div>
      </form>
    </div>
  );
};
