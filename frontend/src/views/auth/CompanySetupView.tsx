import React, { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Landmark, Tag } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const CompanySetupView: React.FC = () => {
  const { updateUser } = useAuthStore();
  const [name, setName] = useState('');
  const [ruc, setRuc] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ruc || !slug) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (ruc.length !== 11 || !/^\d+$/.test(ruc)) {
      toast.error('El RUC debe tener 11 dígitos numéricos');
      return;
    }

    if (slug.length < 3 || !/^[a-z0-9-]+$/.test(slug)) {
      toast.error('El Slug debe tener al menos 3 caracteres y contener solo letras minúsculas, números o guiones');
      return;
    }

    setLoading(true);
    try {
      const { fetchApi } = await import('../../services/api.client');
      const response = await fetchApi<any>('/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ruc, slug })
      });

      toast.success(response.message || 'Empresa creada exitosamente');
      // Actualizar el token y datos de usuario en Zustand
      updateUser(response.access_token, response.user);
    } catch (err: any) {
      const msg = err.data?.message || err.message || 'Error al configurar la empresa';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Configuración de la Empresa</h2>
          <p className="text-sm text-gray-500 mt-2">
            Es la primera vez que ingresas. Completa los datos para crear tu primera organización en el CRM.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Nombre de la Empresa
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Building2 className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Conection Futura S.A.C."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              RUC (11 dígitos)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Landmark className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={ruc}
                onChange={(e) => setRuc(e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="20600000001"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Slug / Identificador Corto
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Tag className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="conection-futura"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                required
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
              * Se utiliza para generar las rutas del sistema y subdominios. Solo minúsculas, números y guiones.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Creando organización...' : 'Comenzar a usar el CRM'}
          </button>
        </form>
      </div>
    </div>
  );
};
