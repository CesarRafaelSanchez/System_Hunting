import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { prediosService } from '../../services/predios.service';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';

interface NewVentaB2BModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companiesList?: { id: string, name: string }[];
}

export const NewVentaB2BModal: React.FC<NewVentaB2BModalProps> = ({ isOpen, onClose, onSuccess, companiesList }) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombreEdificio: '',
    tipoVia: 'AV.',
    direccion: '',
    numeracionMunicipal: '',
    distrito: '',
    companyId: user?.companyId || ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreEdificio || !formData.direccion || !formData.distrito) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    setLoading(true);
    try {
      await prediosService.createPredio({
        ejecutivo: user?.fullName || 'BACKOFFICE',
        nombreEdificio: formData.nombreEdificio,
        direccion: `${formData.tipoVia} ${formData.direccion} ${formData.numeracionMunicipal}`.trim(),
        distrito: formData.distrito,
        numeroHPs: 0,
        resultadoVisita: 'CREACIÓN MANUAL',
        detalle: 'Creado desde panel Back Office',
        tipoVia: formData.tipoVia,
        numeracionMunicipal: formData.numeracionMunicipal,
        companyId: formData.companyId,
        initialStageCode: 'S4'
      } as any);

      toast.success('Oportunidad creada exitosamente');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error al crear la oportunidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-ghl-blue" />
            Nueva Oportunidad
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="new-opp-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Nombre del Proyecto / Edificio <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.nombreEdificio}
                onChange={e => setFormData({...formData, nombreEdificio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="Ej. Edificio Las Palmas"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5 col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tipo Vía</label>
                <select 
                  value={formData.tipoVia}
                  onChange={e => setFormData({...formData, tipoVia: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  <option value="AV.">AV.</option>
                  <option value="CALLE">CALLE</option>
                  <option value="JR.">JR.</option>
                  <option value="PJE.">PJE.</option>
                  <option value="ALAM.">ALAM.</option>
                </select>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Nombre Vía <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Ej. Arequipa"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Numeración</label>
                <input 
                  type="text" 
                  value={formData.numeracionMunicipal}
                  onChange={e => setFormData({...formData, numeracionMunicipal: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Ej. 1234"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Distrito <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.distrito}
                  onChange={e => setFormData({...formData, distrito: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Ej. Miraflores"
                  required
                />
              </div>
            </div>

            {user?.role === 'ACCOUNT_ADMIN' && companiesList && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Empresa Asignada</label>
                <select 
                  value={formData.companyId}
                  onChange={e => setFormData({...formData, companyId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white"
                >
                  <option value="">Seleccione una empresa</option>
                  {companiesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="new-opp-form"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Creando...' : 'Crear Oportunidad'}
          </button>
        </div>
      </div>
    </div>
  );
};
