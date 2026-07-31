import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useFormStore } from '../../store/useFormStore';
import { useAuthStore } from '../../store/useAuthStore';
import { addToSyncQueue } from '../../utils/indexedDB';
import { fetchApi } from '../../services/api.client';
import { UBIGEO_PERU } from '../../utils/ubigeo';
import styles from '../hunter/FormWizard.module.css';

export const FormVentaB2BGénesis: React.FC = () => {
  const [step, setStep] = useState(1);
  const { saveDraft, getDraft, clearDraft } = useFormStore();
  const { user } = useAuthStore();

  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [advisors, setAdvisors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    supervisorId: '',
    asesorId: '',
    tipoServicio: 'Fija',
    ruc: '',
    razonSocial: '',
    representanteLegal: '',
    dniRrll: '',
    celularRrll: '',
    correoElectronico: '',
    nombrePadreRrll: '',
    nombreMadreRrll: '',
    fechaNacimientoRrll: '',
    lugarNacimientoDep: 'LIMA',
    lugarNacimientoProv: 'LIMA',
    lugarNacimientoDist: '',
    lugarNacimientoDistOtro: '',
    tipoDomicilio: 'Casa',
    viaFiscal: '',
    numeroFiscal: '',
    urbanizacionFiscal: '',
    departamentoFiscal: 'LIMA',
    provinciaFiscal: 'LIMA',
    distritoFiscal: '',
    distritoFiscalOtro: '',
    viaInstalacion: '',
    numeroInstalacion: '',
    urbanizacionInstalacion: '',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: '',
    distritoOtro: '',
    referencia: '',
    coordenadas: '',
    tipoTecnologia: 'FTTH',
    tipoPlay: '1 Play Internet solo',
    velocidad: '200mbps',
    cargoFijoSinIgv: '',
    campana: 'FTTH Regular',
    adicionales: 'No aplica',
    observaciones: '',
    planoUrl: '',
    cantidadLineas: '',
    tipoMovil: 'Alta'
  });

  // Cargar lista de usuarios para los selectores comerciales
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const users = await fetchApi<any[]>('/users');
        if (Array.isArray(users)) {
          const sups = users.filter((u: any) => u.role === 'SUPERVISOR_VENTAS' && u.isActive !== false);
          setSupervisors(sups);
        }
      } catch (e) {
        console.error('Error fetching users for dropdowns', e);
      }
    };
    loadUsers();
  }, []);

  // Filtrar asesores cuando cambia el supervisor
  useEffect(() => {
    if (!formData.supervisorId) {
      setAdvisors([]);
      return;
    }
    const loadAdvisors = async () => {
      try {
        const users = await fetchApi<any[]>('/users');
        if (Array.isArray(users)) {
          const advs = users.filter((u: any) => 
            u.isActive !== false &&
            (u.supervisorId === formData.supervisorId || u.id === formData.supervisorId)
          );
          setAdvisors(advs);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadAdvisors();
  }, [formData.supervisorId]);

  // Cargar borrador y auto-completar supervisor/asesor según el rol de la sesión iniciada
  useEffect(() => {
    let baseData = {
      supervisorId: '',
      asesorId: '',
      tipoServicio: 'Fija',
      ruc: '',
      razonSocial: '',
      representanteLegal: '',
      dniRrll: '',
      celularRrll: '',
      correoElectronico: '',
      nombrePadreRrll: '',
      nombreMadreRrll: '',
      fechaNacimientoRrll: '',
      lugarNacimientoDep: 'LIMA',
      lugarNacimientoProv: 'LIMA',
      lugarNacimientoDist: '',
      lugarNacimientoDistOtro: '',
      tipoDomicilio: 'Casa',
      viaFiscal: '',
      numeroFiscal: '',
      urbanizacionFiscal: '',
      departamentoFiscal: 'LIMA',
      provinciaFiscal: 'LIMA',
      distritoFiscal: '',
      distritoFiscalOtro: '',
      viaInstalacion: '',
      numeroInstalacion: '',
      urbanizacionInstalacion: '',
      departamento: 'LIMA',
      provincia: 'LIMA',
      distrito: '',
      distritoOtro: '',
      referencia: '',
      coordenadas: '',
      tipoTecnologia: 'FTTH',
      tipoPlay: '1 Play Internet solo',
      velocidad: '200mbps',
      cargoFijoSinIgv: '',
      campana: 'FTTH Regular',
      adicionales: 'No aplica',
      observaciones: '',
      planoUrl: '',
      cantidadLineas: '',
      tipoMovil: 'Alta'
    };

    const draft = getDraft('form_venta_b2b_genesis_v2');
    if (draft) {
      baseData = { ...baseData, ...draft };
    }

    if (user) {
      if (user.role === 'SUPERVISOR_VENTAS') {
        baseData.supervisorId = user.id;
        baseData.asesorId = user.id;
      } else if (user.role === 'ASESOR_VENTAS') {
        baseData.supervisorId = user.supervisorId || '';
        baseData.asesorId = user.id;
      }
    }

    setFormData(baseData);
  }, [getDraft, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Al cambiar departamento o provincia, reiniciar hijos en cascada
    let extraChanges = {};
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

    const newFormData = { ...formData, [name]: value, ...extraChanges };
    setFormData(newFormData);
    saveDraft('form_venta_b2b_genesis_v2', newFormData);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Resolver campos compuestos para persistencia en backend
    const finalDistrito = formData.distrito === 'OTRO' ? formData.distritoOtro : formData.distrito;
    const finalDistritoFiscal = formData.distritoFiscal === 'OTRO' ? formData.distritoFiscalOtro : formData.distritoFiscal;
    const finalDistritoNac = formData.lugarNacimientoDist === 'OTRO' ? formData.lugarNacimientoDistOtro : formData.lugarNacimientoDist;

    const formattedPayload = {
      ...formData,
      nombrePadresRrll: `${formData.nombrePadreRrll} / ${formData.nombreMadreRrll}`,
      lugarNacimientoRrll: `${formData.lugarNacimientoDep} - ${formData.lugarNacimientoProv} - ${finalDistritoNac}`,
      direccionFiscal: `${formData.viaFiscal} ${formData.numeroFiscal}, ${formData.urbanizacionFiscal} - ${finalDistritoFiscal}, ${formData.provinciaFiscal}, ${formData.departamentoFiscal}`,
      direccionInstalacion: `${formData.viaInstalacion} ${formData.numeroInstalacion}, ${formData.urbanizacionInstalacion}`,
      distrito: finalDistrito,
    };

    try {
      await fetchApi('/ventas/fija', {
        method: 'POST',
        body: JSON.stringify(formattedPayload)
      });
      toast.success('Venta B2B registrada correctamente');
      clearDraft('form_venta_b2b_genesis_v2');
      setStep(1);
      setFormData({
        supervisorId: user?.role === 'SUPERVISOR_VENTAS' ? user.id : (user?.supervisorId || ''),
        asesorId: user?.role === 'ASESOR_VENTAS' || user?.role === 'SUPERVISOR_VENTAS' ? user.id : '',
        tipoServicio: 'Fija',
        ruc: '',
        razonSocial: '',
        representanteLegal: '',
        dniRrll: '',
        celularRrll: '',
        correoElectronico: '',
        nombrePadreRrll: '',
        nombreMadreRrll: '',
        fechaNacimientoRrll: '',
        lugarNacimientoDep: 'LIMA',
        lugarNacimientoProv: 'LIMA',
        lugarNacimientoDist: '',
        lugarNacimientoDistOtro: '',
        tipoDomicilio: 'Casa',
        viaFiscal: '',
        numeroFiscal: '',
        urbanizacionFiscal: '',
        departamentoFiscal: 'LIMA',
        provinciaFiscal: 'LIMA',
        distritoFiscal: '',
        distritoFiscalOtro: '',
        viaInstalacion: '',
        numeroInstalacion: '',
        urbanizacionInstalacion: '',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: '',
        distritoOtro: '',
        referencia: '',
        coordenadas: '',
        tipoTecnologia: 'FTTH',
        tipoPlay: '1 Play Internet solo',
        velocidad: '200mbps',
        cargoFijoSinIgv: '',
        campana: 'FTTH Regular',
        adicionales: 'No aplica',
        observaciones: '',
        planoUrl: '',
        cantidadLineas: '',
        tipoMovil: 'Alta'
      });
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || !navigator.onLine) {
        await addToSyncQueue('/ventas/fija', 'POST', formattedPayload);
        toast.warning('Sin conexión. Los datos se guardaron localmente y se enviarán automáticamente al recuperar la señal.');
        clearDraft('form_venta_b2b_genesis_v2');
        setStep(1);
      } else {
        toast.error('Error al registrar venta: ' + error.message);
      }
    }
  };

  const isAsesorOrSupervisor = user?.role === 'ASESOR_VENTAS' || user?.role === 'SUPERVISOR_VENTAS';

  return (
    <div className={styles.wizardContainer}>
      <h2>Registro de Venta B2B (FS)</h2>
      <div className={styles.stepper}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''} ${step > 1 ? styles.completed : ''}`}>1</div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''} ${step > 2 ? styles.completed : ''}`}>2</div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ''} ${step > 3 ? styles.completed : ''}`}>3</div>
        <div className={`${styles.step} ${step >= 4 ? styles.active : ''} ${step > 4 ? styles.completed : ''}`}>4</div>
      </div>

      <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        {/* STEP 1: ORGANIZACIÓN Y SERVICIO */}
        {step === 1 && (
          <div>
            <h3 className={styles.stepTitle}>Organización Comercial y Servicio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label}>Supervisor *</label>
                <select 
                  name="supervisorId" 
                  value={formData.supervisorId} 
                  onChange={handleChange} 
                  className={styles.select} 
                  required
                  disabled={isAsesorOrSupervisor && !!formData.supervisorId}
                >
                  <option value="">Seleccione Supervisor</option>
                  {supervisors.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Asesor *</label>
                <select 
                  name="asesorId" 
                  value={formData.asesorId} 
                  onChange={handleChange} 
                  className={styles.select} 
                  required
                  disabled={isAsesorOrSupervisor && !!formData.asesorId}
                >
                  <option value="">Seleccione Asesor</option>
                  {advisors.map(a => (
                    <option key={a.id} value={a.id}>{a.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`${styles.formGroup} mt-4`}>
              <label className={styles.label}>Servicio Comercial a Registrar *</label>
              <select name="tipoServicio" value={formData.tipoServicio} onChange={handleChange} className={styles.select} required>
                <option value="Fija">Fija</option>
                <option value="Movil">Móvil</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: DETALLE DEL CLIENTE */}
        {step === 2 && (
          <div>
            <h3 className={styles.stepTitle}>Detalle del Cliente Corporativo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label}>RUC *</label>
                <input name="ruc" value={formData.ruc} onChange={handleChange} className={styles.input} required maxLength={11} minLength={11} placeholder="11 dígitos" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Razón Social *</label>
                <input name="razonSocial" value={formData.razonSocial} onChange={handleChange} className={styles.input} required placeholder="Razón Social" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Representante Legal (RRLL) *</label>
                <input name="representanteLegal" value={formData.representanteLegal} onChange={handleChange} className={styles.input} required placeholder="Nombre completo" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>DNI RRLL *</label>
                <input name="dniRrll" value={formData.dniRrll} onChange={handleChange} className={styles.input} required maxLength={8} minLength={8} placeholder="8 dígitos" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Celular de RRLL *</label>
                <input name="celularRrll" value={formData.celularRrll} onChange={handleChange} className={styles.input} required placeholder="Celular" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Correo Electrónico *</label>
                <input type="email" name="correoElectronico" value={formData.correoElectronico} onChange={handleChange} className={styles.input} required placeholder="correo@empresa.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre del Padre (RRLL) *</label>
                <input name="nombrePadreRrll" value={formData.nombrePadreRrll} onChange={handleChange} className={styles.input} required placeholder="Nombre del Padre" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nombre de la Madre (RRLL) *</label>
                <input name="nombreMadreRrll" value={formData.nombreMadreRrll} onChange={handleChange} className={styles.input} required placeholder="Nombre de la Madre" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha Nacimiento *</label>
                <input type="date" name="fechaNacimientoRrll" value={formData.fechaNacimientoRrll} onChange={handleChange} className={styles.input} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Dep. Nacimiento *</label>
                <select name="lugarNacimientoDep" value={formData.lugarNacimientoDep} onChange={handleChange} className={styles.select} required>
                  {Object.keys(UBIGEO_PERU).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Prov. Nacimiento *</label>
                <select name="lugarNacimientoProv" value={formData.lugarNacimientoProv} onChange={handleChange} className={styles.select} required>
                  {Object.keys(UBIGEO_PERU[formData.lugarNacimientoDep] || {}).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Dist. Nacimiento *</label>
                <select name="lugarNacimientoDist" value={formData.lugarNacimientoDist} onChange={handleChange} className={styles.select} required>
                  <option value="">Seleccione Distrito</option>
                  {(UBIGEO_PERU[formData.lugarNacimientoDep]?.[formData.lugarNacimientoProv] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                  <option value="OTRO">OTRO (INGRESAR MANUAL)</option>
                </select>
              </div>
            </div>

            {formData.lugarNacimientoDist === 'OTRO' && (
              <div className={`${styles.formGroup} mt-2`}>
                <label className={styles.label}>Especificar Distrito de Nacimiento *</label>
                <input name="lugarNacimientoDistOtro" value={formData.lugarNacimientoDistOtro} onChange={handleChange} className={styles.input} required placeholder="Escriba el nombre del distrito" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Domicilio *</label>
                <select name="tipoDomicilio" value={formData.tipoDomicilio} onChange={handleChange} className={styles.select} required>
                  <option value="Casa">Casa</option>
                  <option value="Edificio de Oficinas">Edificio de Oficinas</option>
                  <option value="Edificio Residencial">Edificio Residencial</option>
                  <option value="Local">Local</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Vía Fiscal (Calle, Av, Jr) *</label>
                <input name="viaFiscal" value={formData.viaFiscal} onChange={handleChange} className={styles.input} required placeholder="Ej. Av. Paseo de la República" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Nro / Int / Mz y Lte (Fiscal) *</label>
                <input name="numeroFiscal" value={formData.numeroFiscal} onChange={handleChange} className={styles.input} required placeholder="Ej. 120, Dpto. 401" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Urb / Zone (Fiscal)</label>
                <input name="urbanizacionFiscal" value={formData.urbanizacionFiscal} onChange={handleChange} className={styles.input} placeholder="Ej. Urb. Limatambo" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className={styles.formGroup}>
                <label className={styles.label}>Dep. Fiscal *</label>
                <select name="departamentoFiscal" value={formData.departamentoFiscal} onChange={handleChange} className={styles.select} required>
                  {Object.keys(UBIGEO_PERU).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Prov. Fiscal *</label>
                <select name="provinciaFiscal" value={formData.provinciaFiscal} onChange={handleChange} className={styles.select} required>
                  {Object.keys(UBIGEO_PERU[formData.departamentoFiscal] || {}).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Dist. Fiscal *</label>
                <select name="distritoFiscal" value={formData.distritoFiscal} onChange={handleChange} className={styles.select} required>
                  <option value="">Seleccione Distrito</option>
                  {(UBIGEO_PERU[formData.departamentoFiscal]?.[formData.provinciaFiscal] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                  <option value="OTRO">OTRO (INGRESAR MANUAL)</option>
                </select>
              </div>
            </div>

            {formData.distritoFiscal === 'OTRO' && (
              <div className={`${styles.formGroup} mt-2`}>
                <label className={styles.label}>Especificar Distrito Fiscal *</label>
                <input name="distritoFiscalOtro" value={formData.distritoFiscalOtro} onChange={handleChange} className={styles.input} required placeholder="Escriba el nombre del distrito" />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DIRECCIÓN Y UBICACIÓN DE INSTALACIÓN */}
        {step === 3 && (
          <div>
            <h3 className={styles.stepTitle}>Ubicación y Dirección de Instalación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={styles.formGroup}>
                <label className={styles.label}>Dep. Instalación *</label>
                <select name="departamento" value={formData.departamento} onChange={handleChange} className={styles.select} required>
                  {Object.keys(UBIGEO_PERU).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Prov. Instalación *</label>
                <select name="provincia" value={formData.provincia} onChange={handleChange} className={styles.select} required>
                  {Object.keys(UBIGEO_PERU[formData.departamento] || {}).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Dist. Instalación *</label>
                <select name="distrito" value={formData.distrito} onChange={handleChange} className={styles.select} required>
                  <option value="">Seleccione Distrito</option>
                  {(UBIGEO_PERU[formData.departamento]?.[formData.provincia] || []).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                  <option value="OTRO">OTRO (INGRESAR MANUAL)</option>
                </select>
              </div>
            </div>

            {formData.distrito === 'OTRO' && (
              <div className={`${styles.formGroup} mt-2`}>
                <label className={styles.label}>Especificar Distrito de Instalación *</label>
                <input name="distritoOtro" value={formData.distritoOtro} onChange={handleChange} className={styles.input} required placeholder="Escriba el nombre del distrito" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className={styles.formGroup}>
                <label className={styles.label}>Vía Instalación (Calle, Av, Jr) *</label>
                <input name="viaInstalacion" value={formData.viaInstalacion} onChange={handleChange} className={styles.input} required placeholder="Ej. Calle Los Tulipanes" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Nro / Int / Piso / Mz y Lte *</label>
                <input name="numeroInstalacion" value={formData.numeroInstalacion} onChange={handleChange} className={styles.input} required placeholder="Ej. Mz K Lote 16, Piso 2" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Urb / Zone (Instalación)</label>
                <input name="urbanizacionInstalacion" value={formData.urbanizacionInstalacion} onChange={handleChange} className={styles.input} placeholder="Ej. Urb. El Bosque" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className={styles.formGroup}>
                <label className={styles.label}>Referencia de Instalación *</label>
                <input name="referencia" value={formData.referencia} onChange={handleChange} className={styles.input} required placeholder="Ej. Frente al Parque Principal, al costado de la Tienda X" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Coordenadas GPS *</label>
                <input name="coordenadas" value={formData.coordenadas} onChange={handleChange} className={styles.input} required placeholder="Latitud, Longitud (ej: -12.11, -76.99)" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: DETALLE DEL PLAN */}
        {step === 4 && (
          <div>
            {formData.tipoServicio === 'Fija' ? (
              <div>
                <h3 className={styles.stepTitle}>Detalle del Plan Fijo B2B</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de Tecnología *</label>
                    <select name="tipoTecnologia" value={formData.tipoTecnologia} onChange={handleChange} className={styles.select} required>
                      <option value="HFC">HFC</option>
                      <option value="FTTH">FTTH</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de Play a Contratar *</label>
                    <select name="tipoPlay" value={formData.tipoPlay} onChange={handleChange} className={styles.select} required>
                      <option value="1 Play Internet solo">1 Play Internet solo</option>
                      <option value="2 Play Internet + Cable">2 Play Internet + Cable</option>
                      <option value="2 Play Internet + Fijo">2 Play Internet + Fijo</option>
                      <option value="3 Play Internet + Fijo + Cable">3 Play Internet + Fijo + Cable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Velocidad *</label>
                    <select name="velocidad" value={formData.velocidad} onChange={handleChange} className={styles.select} required>
                      <option value="200mbps">200mbps</option>
                      <option value="300mbps">300mbps</option>
                      <option value="400mbps">400mbps</option>
                      <option value="800mbps">800mbps</option>
                      <option value="1000mbps">1000mbps</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cargo Fijo sin IGV (S/.) *</label>
                    <input type="number" name="cargoFijoSinIgv" value={formData.cargoFijoSinIgv} onChange={handleChange} className={styles.input} required placeholder="Monto en soles" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Campaña Seleccionada *</label>
                    <select name="campana" value={formData.campana} onChange={handleChange} className={styles.select} required>
                      <option value="FTTH Regular">FTTH Regular</option>
                      <option value="HFC Regular">HFC Regular</option>
                      <option value="1sol x 2 meses">1sol x 2 meses</option>
                      <option value="FTTH Empresas medio">FTTH Empresas medio</option>
                      <option value="Regular">Regular</option>
                      <option value="No aplica">No aplica</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Adicionales *</label>
                    <select name="adicionales" value={formData.adicionales} onChange={handleChange} className={styles.select} required>
                      <option value="Mesh">Mesh</option>
                      <option value="2 Decos Gratis">2 Decos Gratis</option>
                      <option value="Deco Gratis">Deco Gratis</option>
                      <option value="Mesh + Deco">Mesh + Deco</option>
                      <option value="2 Mesh Gratis">2 Mesh Gratis</option>
                      <option value="Mesh con costo">Mesh con costo</option>
                      <option value="Deco con costo">Deco con costo</option>
                      <option value="No aplica">No aplica</option>
                    </select>
                  </div>
                </div>

                <div className={`${styles.formGroup} mt-2`}>
                  <label className={styles.label}>URL Plano / Croquis</label>
                  <input name="planoUrl" value={formData.planoUrl} onChange={handleChange} className={styles.input} placeholder="Link de plano subido o referencia" />
                </div>

                <div className={`${styles.formGroup} mt-2`}>
                  <label className={styles.label}>Observaciones Fija</label>
                  <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className={styles.input} placeholder="Detalles de factibilidad o instalación" rows={3} />
                </div>
              </div>
            ) : (
              <div>
                <h3 className={styles.stepTitle}>Detalle del Plan Móvil B2B</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Cantidad de Líneas *</label>
                    <input type="number" name="cantidadLineas" value={formData.cantidadLineas} onChange={handleChange} className={styles.input} required placeholder="Ej. 5" min="1" />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de Movimiento *</label>
                    <select name="tipoMovil" value={formData.tipoMovil} onChange={handleChange} className={styles.select} required>
                      <option value="Alta">Alta</option>
                      <option value="Portabilidad">Portabilidad</option>
                    </select>
                  </div>
                </div>

                <div className={`${styles.formGroup} mt-2`}>
                  <label className={styles.label}>Observaciones Móvil</label>
                  <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} className={styles.input} placeholder="Especificar líneas, operadores origen o promociones" rows={3} />
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.buttonGroup}>
          {step > 1 && <button type="button" onClick={prevStep} className={`${styles.button} ${styles.btnBack}`}>Atrás</button>}
          {step < 4 && <button type="submit" className={`${styles.button} ${styles.btnNext}`}>Siguiente</button>}
          {step === 4 && <button type="submit" className={`${styles.button} ${styles.btnSubmit}`}>Registrar Venta B2B</button>}
        </div>
      </form>
    </div>
  );
};
