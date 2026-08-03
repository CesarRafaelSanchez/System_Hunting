import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { PhoneCall, TrendingUp, DollarSign, Users, Award, Target, CheckCircle2, ChevronRight, PlusCircle, LayoutDashboard, Clock, AlertTriangle } from 'lucide-react';
import { ventasService } from '../../services/ventas.service';
import { useNavigate } from 'react-router-dom';

export const DashboardAsesor: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    registered: 0,
    won: 0,
    potentialRevenue: 0,
    closedRevenue: 0,
    monthlyGoal: 10000,
  });
  const [recentOpps, setRecentOpps] = useState<any[]>([]);

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await ventasService.getAll();
        const data = (response as any).data || response;
        const list = Array.isArray(data) ? data : [];
        
        // Filtrar oportunidades del asesor logueado
        const myOpps = list.filter((o: any) => o.createdByUserId === user?.id || o.currentOwnerUserId === user?.id);
        
        const wonOpps = myOpps.filter((o: any) => o.status === 'WON');
        
        // Sumar ingresos potenciales y ganados
        const potRev = myOpps.reduce((sum: number, o: any) => sum + (parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0), 0);
        const closedRev = wonOpps.reduce((sum: number, o: any) => sum + (parseFloat(o.ventaFija?.cargoFijoSinIgv) || 0), 0);

        setMetrics({
          registered: myOpps.length,
          won: wonOpps.length,
          potentialRevenue: potRev,
          closedRevenue: closedRev,
          monthlyGoal: 10000, // Goal placeholder
        });

        // Ordenar y sacar las más recientes (últimas 5)
        const sorted = [...myOpps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentOpps(sorted.slice(0, 5));

      } catch (error) {
        console.error('Error loading asesor metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [user?.id]);

  const goalPercentage = Math.min(Math.round((metrics.closedRevenue / metrics.monthlyGoal) * 100), 100);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER HERO */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="z-10 w-full md:w-auto mb-6 md:mb-0">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full mb-4">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold tracking-wider text-emerald-100 uppercase">Asesor Comercial B2B</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">¡Hola, {user?.fullName?.split(' ')[0] || 'Asesor'}! 👋</h1>
          <p className="text-slate-300 font-medium text-lg capitalize">{today}</p>
        </div>

        {/* METAS DEL ASESOR */}
        <div className="z-10 bg-white/10 backdrop-blur-lg p-5 rounded-2xl border border-white/15 w-full md:w-96 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Meta Mensual</span>
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
            <span className="text-slate-300 font-semibold">Cerrado: <strong className="text-white">S/ {metrics.closedRevenue.toLocaleString()}</strong></span>
            <span className="text-slate-400 font-medium">Objetivo: S/ {metrics.monthlyGoal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* PROSPECTOS TOTALES */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mis Prospectos</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{loading ? '-' : metrics.registered}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Oportunidades en gestión</p>
            </div>
            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* VENTAS GANADAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cierres Exitosos</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">{loading ? '-' : metrics.won}</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Ventas ganadas este mes</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* PIPELINE POTENCIAL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pipeline Potencial</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {loading ? '-' : `S/ ${metrics.potentialRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Valor total proyectado</p>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* INGRESOS CERRADOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ingresos Logrados</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-2">
                {loading ? '-' : `S/ ${metrics.closedRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Aporte a facturación real</p>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* DETALLES Y ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT OPPORTUNITIES */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Actividad Reciente</h2>
                <p className="text-xs text-slate-500 font-medium">Tus últimos registros y avances</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/sales/oportunidades')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors"
            >
              Ver Todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 p-0 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-48 text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
                Cargando historial...
              </div>
            ) : recentOpps.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-semibold">Empresa / Razón Social</th>
                    <th className="px-6 py-4 font-semibold">Ticket</th>
                    <th className="px-6 py-4 font-semibold">Distrito</th>
                    <th className="px-6 py-4 font-semibold text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOpps.map((opp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate('/sales/oportunidades')}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex flex-shrink-0 items-center justify-center font-bold text-slate-600 text-xs">
                            {opp.ventaFija?.razonSocial?.charAt(0)?.toUpperCase() || '#'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {opp.ventaFija?.razonSocial || opp.code}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              RUC: {opp.ventaFija?.ruc || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-slate-700">
                          S/ {parseFloat(opp.ventaFija?.cargoFijoSinIgv || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                        {opp.ventaFija?.distrito || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase ${
                          opp.status === 'WON' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          opp.status === 'LOST' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {opp.status === 'WON' ? 'Ganado' : opp.status === 'LOST' ? 'Perdido' : 'En Proceso'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center px-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-3">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-600">Aún no tienes oportunidades</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Registra tu primera venta para comenzar a medir tu rendimiento.</p>
              </div>
            )}
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Acciones Rápidas</h2>
            <p className="text-xs text-slate-500 font-medium">Accesos directos a tus herramientas</p>
          </div>

          <button 
            onClick={() => navigate('/sales/oportunidades/nueva', { state: { openForm: true } })}
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Registrar Venta</p>
                <p className="text-[11px] text-slate-500">Ingresar nueva B2B</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </button>

          <button 
            onClick={() => navigate('/sales/oportunidades')}
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Tablero Kanban</p>
                <p className="text-[11px] text-slate-500">Gestionar pipeline</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
          </button>

          {/* TIPS CARD */}
          <div className="mt-auto bg-amber-50 rounded-2xl p-5 border border-amber-100 relative overflow-hidden">
            <AlertTriangle className="absolute -right-4 -bottom-4 w-20 h-20 text-amber-500/10" />
            <h4 className="text-amber-800 font-bold text-sm mb-1 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Tip del Día
            </h4>
            <p className="text-xs text-amber-700/90 font-medium leading-relaxed relative z-10">
              Mantén tus oportunidades actualizadas en el Kanban para asegurar que operaciones apruebe rápidamente tus ventas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
