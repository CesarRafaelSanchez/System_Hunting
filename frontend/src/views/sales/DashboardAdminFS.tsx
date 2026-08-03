import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award, 
  Building2, 
  CheckCircle2, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Target,
  FileSpreadsheet,
  Zap,
  Briefcase
} from 'lucide-react';
import { ventasService } from '../../services/ventas.service';

export const DashboardAdminFS: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalOpps: 0,
    wonOpps: 0,
    mrrTotal: 0,
    mrrClosed: 0,
    conversionRate: 0,
    avgTicket: 0
  });

  const [techDistribution, setTechDistribution] = useState<Record<string, number>>({});
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [topOpportunities, setTopOpportunities] = useState<any[]>([]);

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchAdminMetrics = async () => {
      setLoading(true);
      try {
        const response = await ventasService.getAll();
        const list = Array.isArray(response) ? response : [];
        
        const total = list.length;
        const won = list.filter((o: any) => o.status === 'WON');
        
        const mrrTotal = list.reduce((sum: number, o: any) => sum + (parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0), 0);
        const mrrClosed = won.reduce((sum: number, o: any) => sum + (parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0), 0);
        
        const convRate = total > 0 ? (won.length / total) * 100 : 0;
        const avgTicket = total > 0 ? mrrTotal / total : 0;

        // Distribución por tecnología de servicio
        const techMap: Record<string, number> = {};
        list.forEach((o: any) => {
          const tech = o.ventaFija?.tipoTecnologia || 'No Especificado';
          techMap[tech] = (techMap[tech] || 0) + 1;
        });

        // Top 5 oportunidades de mayor valor corporativo
        const sortedByValue = [...list].sort((a: any, b: any) => {
          const valA = parseFloat(a.ventaFija?.cargoFijoSinIgv) || 0;
          const valB = parseFloat(b.ventaFija?.cargoFijoSinIgv) || 0;
          return valB - valA;
        }).slice(0, 5);

        // Rendimiento por Equipo / Asesor
        const userPerformanceMap: Record<string, { name: string; count: number; value: number; wonCount: number }> = {};
        list.forEach((o: any) => {
          const ownerName = o.createdByUserName || o.currentOwnerUser?.fullName || 'Asesor Sin Nombre';
          if (!userPerformanceMap[ownerName]) {
            userPerformanceMap[ownerName] = { name: ownerName, count: 0, value: 0, wonCount: 0 };
          }
          userPerformanceMap[ownerName].count += 1;
          userPerformanceMap[ownerName].value += parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0;
          if (o.status === 'WON') userPerformanceMap[ownerName].wonCount += 1;
        });

        const teamsList = Object.values(userPerformanceMap).sort((a, b) => b.value - a.value);

        setMetrics({
          totalOpps: total,
          wonOpps: won.length,
          mrrTotal,
          mrrClosed,
          conversionRate: Math.round(convRate * 10) / 10,
          avgTicket: Math.round(avgTicket * 100) / 100
        });

        setTechDistribution(techMap);
        setTopOpportunities(sortedByValue);
        setTeamPerformance(teamsList);
      } catch (error) {
        console.error('Error al cargar métricas del administrador de FS', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminMetrics();
  }, [user?.id]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest">
              Panel Ejecutivo Corporativo
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              Empresa: FS (Ventas B2B)
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard General de Administración 💼</h1>
          <p className="text-slate-400 text-sm mt-1 capitalize font-medium">{today}</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Administrador Activo</p>
            <p className="text-base font-bold text-white">{user?.fullName || 'Admin FS'}</p>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR POTENCIAL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facturación MRR Potencial</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">S/ {metrics.mrrTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Suma total de cargos fijos sin IGV</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-bold gap-1">
            <ArrowUpRight className="w-4 h-4" /> En pipeline comercial activo
          </div>
        </div>

        {/* VENTAS CERRADAS (WON) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">MRR Ganado / Cerrado</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">S/ {metrics.mrrClosed.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{metrics.wonOpps} Contratos cerrados</p>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-blue-600 font-bold gap-1">
            <Zap className="w-4 h-4" /> {metrics.wonOpps} de {metrics.totalOpps} oportunidades
          </div>
        </div>

        {/* TASA DE CONVERSIÓN B2B */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tasa de Conversión B2B</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{metrics.conversionRate}%</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Efectividad de cierre global</p>
            </div>
            <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-purple-600 font-bold gap-1">
            <Target className="w-4 h-4" /> Ratio Lead vs. Cierre
          </div>
        </div>

        {/* TICKET PROMEDIO B2B */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio B2B</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">S/ {metrics.avgTicket.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Valor promedio por contrato</p>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600 font-bold gap-1">
            <Award className="w-4 h-4" /> Valor medio corporativo
          </div>
        </div>
      </div>

      {/* DASHBOARD SECTIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SECCIÓN RENDIMIENTO DE ASESORES Y EQUIPOS */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Rendimiento por Asesor y Equipo Comercial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Oportunidades gestionadas e ingresos asignados</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 font-bold px-3 py-1 rounded-full">
                {teamPerformance.length} Ejecutivos
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-slate-400 text-sm">Cargando métricas de ejecutivos...</div>
            ) : teamPerformance.length === 0 ? (
              <div className="py-12 flex justify-center text-slate-400 text-sm">No hay registros de asesores aún.</div>
            ) : (
              <div className="space-y-4">
                {teamPerformance.map((team, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{team.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{team.count} Oportunidades ({team.wonCount} Ganadas)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold block">Valor Gestionado</span>
                        <span className="text-sm font-black text-indigo-950">S/ {team.value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN DISTRIBUCIÓN POR TECNOLOGÍA & SERVICIOS */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-purple-600" />
                  Servicios Corporativos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Distribución por Tipo de Tecnología</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center text-slate-400 text-sm">Cargando distribución...</div>
            ) : Object.keys(techDistribution).length === 0 ? (
              <div className="py-12 flex justify-center text-slate-400 text-sm">No hay servicios registrados.</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(techDistribution).map(([tech, count], idx) => {
                  const percentage = metrics.totalOpps > 0 ? Math.round((count / metrics.totalOpps) * 100) : 0;
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{tech}</span>
                        <span className="text-purple-700">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center gap-3">
            <Zap className="w-5 h-5 text-purple-600 shrink-0" />
            <p className="text-xs text-purple-900 font-medium">
              Los servicios de Fibra Óptica e Internet Dedicado representan el mayor volumen de facturación recurrente en FS.
            </p>
          </div>
        </div>
      </div>

      {/* TABLA DE TOP OPORTUNIDADES CORPORATIVAS */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Top Contratos B2B de Mayor Valor
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Oportunidades principales clasificadas por cargo fijo mensual</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400 text-sm">Cargando contratos principales...</div>
        ) : topOpportunities.length === 0 ? (
          <div className="py-12 flex justify-center text-slate-400 text-sm">No hay contratos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Código / Cliente</th>
                  <th className="py-3 px-4">RUC</th>
                  <th className="py-3 px-4">Ejecutivo / Asesor</th>
                  <th className="py-3 px-4">Tecnología</th>
                  <th className="py-3 px-4 text-right">Cargo Fijo (S/)</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {topOpportunities.map((opp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {opp.ventaFija?.razonSocial || opp.title || opp.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{opp.ventaFija?.ruc || '-'}</td>
                    <td className="py-3.5 px-4 text-slate-700">{opp.createdByUserName || opp.currentOwnerUser?.fullName || 'Asesor'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{opp.ventaFija?.tipoTecnologia || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-black text-indigo-950">
                      S/ {parseFloat(opp.ventaFija?.cargoFijoSinIgv || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        opp.status === 'WON' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {opp.status === 'WON' ? 'Ganado / Cerrado' : 'En Gestión'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
