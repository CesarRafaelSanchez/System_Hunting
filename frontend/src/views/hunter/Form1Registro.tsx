import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFormStore } from '../../store/useFormStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LIMA_DISTRITOS } from '../../utils/constants';
import { addToSyncQueue } from '../../utils/indexedDB';
import { fetchApi } from '../../services/api.client';
import styles from './FormWizard.module.css';

export const Form1Registro: React.FC = () => {
  const [step, setStep] = useState(1);
  const { saveDraft, getDraft, clearDraft } = useFormStore();
  const { user } = useAuthStore();
  const [hunters, setHunters] = useState<any[]>([]);
  const isPublic = !user;

  const [formData, setFormData] = useState({
    ejecutivo: user?.id || '',
    nombreProyecto: '',
    direccion: '',
    distrito: '',
    departamento: 'Lima',
    provincia: 'Lima',
    numeroHPs: '',
    resultadoVisita: '',
    detalle: ''
  });

  useEffect(() => {
    const draft = getDraft('form1');
    if (draft) setFormData(draft);

    if (isPublic) {
      fetchApi('/public/hunters').then((data: any) => setHunters(data)).catch(console.error);
    }
  }, [getDraft, isPublic]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const newFormData = { ...formData, [e.target.name]: e.target.value };
    setFormData(newFormData);
    saveDraft('form1', newFormData);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isPublic) {
        await fetchApi('/public/registro-predio', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      } else {
        const { prediosService } = await import('../../services/predios.service');
        await prediosService.createPredio(formData as any);
      }
      toast.success('Predio registrado correctamente');
      clearDraft('form1');
      setStep(1);
      setFormData({ ejecutivo: user?.id || '', nombreProyecto: '', direccion: '', distrito: '', departamento: 'Lima', provincia: 'Lima', numeroHPs: '', resultadoVisita: '', detalle: '' });
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || !navigator.onLine) {
        await addToSyncQueue('/predios', 'POST', formData);
        toast.warning('Sin conexión. Los datos se guardaron localmente y se enviarán automáticamente al recuperar la señal.');
        clearDraft('form1');
        setStep(1);
        setFormData({ ejecutivo: user?.id || '', nombreProyecto: '', direccion: '', distrito: '', departamento: 'Lima', provincia: 'Lima', numeroHPs: '', resultadoVisita: '', detalle: '' });
      } else {
        toast.error('Error al registrar predio: ' + error.message);
      }
    }
  };

  return (
    <div className={styles.wizardContainer}>
      <h2>1. Registro de Predio (Génesis)</h2>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>1</div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>2</div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''} ${step > 3 ? styles.completed : ''}`}>3</div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        {step === 1 && (
          <div>
            <h3 className={styles.stepTitle}>Datos Básicos</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Ejecutivo</label>
              {isPublic ? (
                <select 
                  name="ejecutivo" 
                  value={formData.ejecutivo} 
                  onChange={handleChange} 
                  className={styles.select} 
                  required
                >
                  <option value="">Seleccione su nombre</option>
                  {hunters.map(h => (
                    <option key={h.id} value={h.id}>{h.fullName}</option>
                  ))}
                </select>
              ) : (
                <div className={`${styles.input} bg-gray-50 text-gray-600 flex items-center gap-2`} style={{cursor: 'default'}}>
                  <span>👤</span>
                  <span>{user?.fullName || user?.email || 'Hunter'}</span>
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del edificio *</label>
              <input name="nombreProyecto" value={formData.nombreProyecto} onChange={handleChange} className={styles.input} required />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className={styles.stepTitle}>Ubicación</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Dirección *</label>
              <input name="direccion" value={formData.direccion} onChange={handleChange} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Distrito *</label>
              <select name="distrito" value={formData.distrito} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccione Distrito...</option>
                {LIMA_DISTRITOS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Número de HPs *</label>
              <input type="number" name="numeroHPs" value={formData.numeroHPs} onChange={handleChange} className={styles.input} required min="1" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className={styles.stepTitle}>Resultado</h3>
            <div className={styles.formGroup}>
              <label className={styles.label}>Resultado de visita *</label>
              <select name="resultadoVisita" value={formData.resultadoVisita} onChange={handleChange} className={styles.select} required>
                <option value="">Seleccione...</option>
                <option value="VISITA EFECTIVA (HUBO ATENCION POR PARTE DEL PREDIO)">VISITA EFECTIVA (HUBO ATENCION POR PARTE DEL PREDIO)</option>
                <option value="VISITA NO EFECTIVA (NO HUBO ATENCION / NO TRABAJABLE)">VISITA NO EFECTIVA (NO HUBO ATENCION / NO TRABAJABLE)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Detalle de la Visita (Qué Sucedió) *</label>
              <textarea name="detalle" value={formData.detalle} onChange={handleChange} className={styles.textarea} required />
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          {step > 1 && <button type="button" onClick={prevStep} className={`${styles.button} ${styles.btnBack}`}>Atrás</button>}
          {step < 3 && <button type="submit" className={`${styles.button} ${styles.btnNext}`}>Siguiente</button>}
          {step === 3 && <button type="submit" className={`${styles.button} ${styles.btnSubmit}`}>Registrar Predio</button>}
        </div>
      </form>
    </div>
  );
};
