import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  DollarSign, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowUpRight, 
  Target,
  AlertTriangle,
  Flame,
  LayoutDashboard,
  TrendingUp,
  Filter
} from 'lucide-react';
import { ventasService } from '../../services/ventas.service';

export const DashboardSupervisor: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalOpps: 0,
    wonOpps: 0,
    mrrTotal: 0,
    mrrClosed: 0,
    staleOppsCount: 0,
    highTicketCount: 0,
    conversionRate: 0,
    avgTicket: 0,
    monthlyGoal: 15000 // Meta referencial del equipo en S/
  });

  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [techBreakdown, setTechBreakdown] = useState<{ name: string; count: number; value: number }[]>([]);

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchSupervisorMetrics = async () => {
      try {
        const response = await ventasService.getAll();
        const list = Array.isArray(response) ? response : [];
        
        const total = list.length;
        const won = list.filter((o: any) => o.status === 'WON');
        
        const mrrTotal = list.reduce((sum: number, o: any) => sum + (parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0), 0);
        const mrrClosed = won.reduce((sum: number, o: any) => sum + (parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0), 0);
        
        const convRate = total > 0 ? (won.length / total) * 100 : 0;
        const avgTicket = total > 0 ? mrrTotal / total : 0;

        // Oportunidades estancadas (> 10 días en la misma etapa)
        const tenDaysAgo = new Date().getTime() - 10 * 24 * 60 * 60 * 1000;
        const staleOpps = list.filter((o: any) => {
          if (!o.currentStageEnteredAt) return false;
          return new Date(o.currentStageEnteredAt).getTime() < tenDaysAgo;
        });

        // High Ticket (> S/ 1000)
        const highTickets = list.filter((o: any) => parseFloat(o.ventaFija?.cargoFijoSinIgv || 0) >= 1000);

        // Desglose por Tecnología de Servicio
        const techMap: Record<string, { count: number; value: number }> = {};
        list.forEach((o: any) => {
          const tech = o.ventaFija?.tipoTecnologia || 'Sin Especificar';
          const val = parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0;
          if (!techMap[tech]) techMap[tech] = { count: 0, value: 0 };
          techMap[tech].count += 1;
          techMap[tech].value += val;
        });
        const techList = Object.entries(techMap).map(([name, data]) => ({ name, ...data }));

        // Rendimiento por Asesor Comercial del Equipo
        const userPerformanceMap: Record<string, { name: string; count: number; value: number; wonCount: number; wonValue: number }> = {};
        list.forEach((o: any) => {
          const ownerName = o.createdByUserName || o.currentOwnerUser?.fullName || 'Asesor Sin Nombre';
          const val = parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0;
          if (!userPerformanceMap[ownerName]) {
            userPerformanceMap[ownerName] = { name: ownerName, count: 0, value: 0, wonCount: 0, wonValue: 0 };
          }
          userPerformanceMap[ownerName].count += 1;
          userPerformanceMap[ownerName].value += val;
          if (o.status === 'WON') {
            userPerformanceMap[ownerName].wonCount += 1;
            userPerformanceMap[ownerName].wonValue += val;
          }
        });

        const teamsList = Object.values(userPerformanceMap).sort((a, b) => b.value - a.value);

        setMetrics({
          totalOpps: total,
          wonOpps: won.length,
          mrrTotal,
          mrrClosed,
          staleOppsCount: staleOpps.length,
          highTicketCount: highTickets.length,
          conversionRate: Math.round(convRate * 10) / 10,
          avgTicket: Math.round(avgTicket * 100) / 100,
          monthlyGoal: 15000
        });

        setTeamPerformance(teamsList);
        setTechBreakdown(techList);
      } catch (error) {
        console.error('Error al cargar métricas del supervisor de FS', error);
      }
    };

    fetchSupervisorMetrics();
  }, [user?.id]);

  const goalPercentage = Math.min(100, Math.round((metrics.mrrClosed / (metrics.monthlyGoal || 1)) * 100));

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* HEADER PRINCIPAL ROYAL NAVY & COBALT WITH GOLD ACCENTS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-2xl border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="z-10 space-y-2">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <Award className="w-3.5 h-3.5 text-amber-400" /> Líder de Equipo Comercial
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              FS Ventas B2B
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">Consola de Supervisión 📊</h1>
          <p className="text-blue-200/80 text-sm capitalize font-medium">{today}</p>
        </div>

        {/* CUMPLIMIENTO DE META DEL EQUIPO */}
        <div className="z-10 bg-white/10 backdrop-blur-lg p-5 rounded-2xl border border-white/15 w-full lg:w-96 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Meta Mensual del Equipo</span>
            </div>
            <span className="text-sm font-black text-amber-400">{goalPercentage}%</span>
          </div>
          
          <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${goalPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-slate-300 font-semibold">Cerrado: <strong className="text-white">S/ {metrics.mrrClosed.toLocaleString()}</strong></span>
            <span className="text-slate-400 font-medium">Objetivo: S/ {metrics.monthlyGoal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* PIPELINE PROYECTADO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Proyectado</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">S/ {metrics.mrrTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Suma de ofertas activas en el equipo</p>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* INGRESOS GANADOS (CLOSED MRR) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Cierre Exitoso</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">S/ {metrics.mrrClosed.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">{metrics.wonOpps} ventas cerradas ganadas</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* WIN RATE Y TICKET PROMEDIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversión (Win Rate)</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900">{metrics.conversionRate}%</h3>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Promedio</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Ticket Prom.: <strong className="text-slate-700">S/ {metrics.avgTicket.toLocaleString()}</strong></p>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* OPORTUNIDADES EN RIESGO / ESTANCADAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Alertas Operativas</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className={`text-2xl font-black ${metrics.staleOppsCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {metrics.staleOppsCount}
                </h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">Sin avance (+10d)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">High Ticket (&gt;S/1k): <strong className="text-slate-800">{metrics.highTicketCount}</strong></p>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DETALLADA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEADERBOARD ASESORES DEL EQUIPO */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Leaderboard del Equipo Commercial</h2>
                <p className="text-xs text-slate-500 font-medium">Ranking de rendimiento y aporte de facturación</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sales/oportunidades')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
            >
              Ver Kanban <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="p-0 flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                  <th className="p-4 border-b border-slate-100">Posición / Asesor</th>
                  <th className="p-4 border-b border-slate-100">Gestiones</th>
                  <th className="p-4 border-b border-slate-100">Ventas Ganadas</th>
                  <th className="p-4 border-b border-slate-100 text-right">MRR Proyectado</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.length > 0 ? (
                  teamPerformance.map((team, idx) => {
                    const badgeMedals = ['🥇', '🥈', '🥉'];
                    const isTopThree = idx < 3;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors border-b border-slate-50 last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-base w-6 text-center font-bold">
                              {isTopThree ? badgeMedals[idx] : `#${idx + 1}`}
                            </span>
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shadow-sm border border-blue-200">
                              {team.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{team.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">Asesor Comercial FS</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                            {team.count} Opps
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <CheckCircle2 className="w-3.5 h-3.5" /> {team.wonCount} Cierres
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <p className="text-sm font-black text-slate-900">
                            S/ {team.value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-medium">
                      No hay miembros asignados a este equipo comercial.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DESGLOSE POR TECNOLOGÍA & ACCIONES */}
        <div className="space-y-6">
          {/* TECNOLOGÍAS */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shadow-sm">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Mix de Tecnologías</h2>
                <p className="text-xs text-slate-400">Distribución de servicios del equipo</p>
              </div>
            </div>

            <div className="space-y-3">
              {techBreakdown.length > 0 ? (
                techBreakdown.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-xs font-bold text-slate-800 uppercase">{t.name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{t.count} solicitudes</p>
                    </div>
                    <span className="text-xs font-black text-slate-900">
                      S/ {t.value.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">Sin datos de productos.</p>
              )}
            </div>
          </div>

          {/* ACCIONES DIRECTAS */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Accesos del Supervisor</h2>

            <button 
              onClick={() => navigate('/sales/oportunidades/nueva')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all group"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span>Registrar Nueva Venta B2B</span>
              </div>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button 
              onClick={() => navigate('/sales/oportunidades')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <span>Monitorear Kanban de Equipo</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
