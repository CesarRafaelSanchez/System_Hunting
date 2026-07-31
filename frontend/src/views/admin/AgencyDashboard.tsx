import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../services/api.client';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, Users, ShieldAlert, ExternalLink, Activity } from 'lucide-react';
import { toast } from 'sonner';

export const AgencyDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveWorkspace } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        setLoading(true);
        const [compData, userData] = await Promise.all([
          fetchApi<any[]>('/companies'),
          fetchApi<any[]>('/users'),
        ]);
        setCompanies(compData || []);
        setUsers(userData || []);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar datos globales de la agencia');
      } finally {
        setLoading(false);
      }
    };
    loadGlobalData();
  }, []);

  const handleSwitchToLocation = (company: any) => {
    setActiveWorkspace({
      id: company.id,
      name: company.name,
      slug: company.slug,
      role: 'ACCOUNT_ADMIN', // Bypass as local administrator
      tipoNegocio: company.tipoNegocio || 'HUNTING_EDIFICIOS',
    });
    toast.success(`Ingresando a subcuenta: ${company.name}`);
    
    // Redirect according to business vertical
    if (company.tipoNegocio === 'VENTAS_B2B') {
      navigate('/backoffice/oportunidades');
    } else {
      navigate('/admin');
    }
  };

  const activeUsers = users.filter(u => u.isActive).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-slate-400 font-medium">Cargando consola global...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consola de Control de Agencia</h1>
          <p className="text-sm text-slate-400 mt-1">
            Supervisa la facturación, los usuarios globales y las verticales comerciales del grupo.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Acceso Global SuperAdmin</span>
        </div>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subcuentas / Empresas</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{companies.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuarios Globales</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{users.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sesiones Activas</span>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{activeUsers}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Companies List Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Ecosistema de Subcuentas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
                <th className="px-6 py-3">Razón Social</th>
                <th className="px-6 py-3">RUC</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Vertical Comercial</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800">{company.name}</td>
                  <td className="px-6 py-4">{company.ruc}</td>
                  <td className="px-6 py-4 font-mono text-xs">{company.slug}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      company.tipoNegocio === 'VENTAS_B2B'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {company.tipoNegocio === 'VENTAS_B2B' ? 'Ventas B2B' : 'Hunting Fibra'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSwitchToLocation(company)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Entrar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
