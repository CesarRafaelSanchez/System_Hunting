import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../../services/api.client';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, Users, ShieldAlert, ExternalLink, DollarSign, Target, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const AgencyDashboard: React.FC = () => {
  // const [, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>({ totalPipeline: 0, totalClosedWon: 0, totalPredios: 0, slaAlerts: 0 });
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { setActiveWorkspace } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        setLoading(true);
        const [, userData, kpiData, perfData] = await Promise.all([
          fetchApi<any[]>('/companies'),
          fetchApi<any[]>('/users'),
          fetchApi<any>('/agency-dashboard/kpis'),
          fetchApi<any[]>('/agency-dashboard/performance-matrix'),
        ]);
        setUsers(userData || []);
        setKpis(kpiData || { totalPipeline: 0, totalClosedWon: 0, totalPredios: 0, slaAlerts: 0 });
        setPerformanceData(perfData || []);
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
        <span className="ml-3 text-slate-400 font-medium">Cargando consola ejecutiva...</span>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(value);

  // Pie chart colors
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header Ejecutivo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg text-white">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Consola de Mando Ejecutiva (C-Level)
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Métricas globales agregadas para el grupo empresarial.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Acceso Total AGENCY_ADMIN</span>
        </div>
      </div>

      {/* KPI Cards C-Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Total</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{formatCurrency(kpis.totalPipeline)}</h3>
          <div className="mt-2 text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md inline-block">Valor Activo Global</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target className="w-16 h-16 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cierres (Won)</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{formatCurrency(kpis.totalClosedWon)}</h3>
          <div className="mt-2 text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-md inline-block">Rendimiento Histórico</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-16 h-16 text-indigo-600" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predios Habilitados</span>
          <h3 className="text-2xl font-extrabold text-slate-800 mt-2">{kpis.totalPredios}</h3>
          <div className="mt-2 text-xs font-medium text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md inline-block">Base Instalada</div>
        </div>

        <div className="p-5 rounded-2xl bg-red-50 border border-red-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-red-600" />
          </div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Alertas SLA Globales</span>
          <h3 className="text-2xl font-extrabold text-red-700 mt-2">{kpis.slaAlerts}</h3>
          <div className="mt-2 text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-md inline-block">Opp &gt; 5 días atascadas</div>
        </div>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Distribución del Pipeline por Empresa</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceData.filter(d => d.pipelineValue > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="pipelineValue"
                  nameKey="companyName"
                >
                  {performanceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-6">Volumen Activo vs Ganados (Cierres)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="companyName" tick={{fontSize: 12}} />
                <YAxis tick={{fontSize: 12}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar dataKey="activeOpportunitiesCount" name="Oportunidades Activas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wonCount" name="Cierres Exitosos" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Matriz de Rendimiento (Bottom) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Matriz de Rendimiento de Subcuentas</h3>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Users className="w-4 h-4" /> Usuarios Globales: {users.length} ({activeUsers} Activos)
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Empresa / Vertical</th>
                <th className="px-6 py-4 text-center">Volumen Activo</th>
                <th className="px-6 py-4 text-right">Pipeline (S/.)</th>
                <th className="px-6 py-4 text-center">Cierres</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm text-slate-600">
              {performanceData.map((data, idx) => (
                <tr key={data.companyId || idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{data.companyName}</div>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      data.tipoNegocio === 'VENTAS_B2B'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {data.tipoNegocio === 'VENTAS_B2B' ? 'Ventas B2B' : 'Hunting Fibra'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold">
                      {data.activeOpportunitiesCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                    {formatCurrency(data.pipelineValue)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-emerald-600">{data.wonCount}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleSwitchToLocation({ id: data.companyId, name: data.companyName, tipoNegocio: data.tipoNegocio, slug: data.companyName.toLowerCase().replace(/\s+/g, '-') })}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-500 text-slate-600 hover:text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group-hover:shadow"
                    >
                      <span>Ingresar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {performanceData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No hay datos de rendimiento disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
