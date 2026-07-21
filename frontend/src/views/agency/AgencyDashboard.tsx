import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api.client';
import { useTenantStore } from '../../store/useTenantStore';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Activity, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const AgencyDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveWorkspace } = useTenantStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await fetchApi<any[]>('/companies');
      if (data) {
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error loading companies', error);
      toast.error('Error al cargar subcuentas');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToLocation = (company: any) => {
    // Mimic the GoHighLevel "Switch to Location"
    setActiveWorkspace({
      companyId: company.id,
      name: company.name,
      slug: company.slug,
      role: 'AGENCY_ADMIN'
    });
    // The WorkspaceSelector logic will redirect to / automatically when tenant is set, 
    // or we can explicitly redirect:
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ghl-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subcuentas (Locations)</h2>
          <p className="text-gray-500 mt-1">Gestiona todas las empresas y agencias desde tu panel maestro.</p>
        </div>
        <button className="bg-ghl-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Nueva Empresa
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-ghl-blue rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Subcuentas</p>
            <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Empresas Activas</p>
            <p className="text-2xl font-bold text-gray-900">{companies.filter(c => c.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">SaaS Status</p>
            <p className="text-xl font-bold text-gray-900">Online</p>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => (
          <div key={company.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 border border-gray-100 shadow-sm font-bold text-xl">
                  {company.name.substring(0, 2).toUpperCase()}
                </div>
                {company.isActive ? (
                  <span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Activa
                  </span>
                ) : (
                  <span className="bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Inactiva
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{company.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> /{company.slug}
              </p>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">RUC</span>
                  <span className="text-sm font-semibold text-gray-700">{company.ruc}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <button 
                onClick={() => handleSwitchToLocation(company)}
                className="w-full bg-white hover:bg-ghl-blue hover:text-white text-gray-700 border border-gray-200 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm group-hover:border-ghl-blue"
              >
                <span>Entrar a Subcuenta</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        ))}
        {companies.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No hay empresas</h3>
            <p className="text-gray-500 mt-1 text-sm">Aún no se han creado subcuentas en la plataforma.</p>
          </div>
        )}
      </div>
    </div>
  );
};
