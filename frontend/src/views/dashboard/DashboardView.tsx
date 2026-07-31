import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { opportunitiesService } from '../../services/opportunities.service';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const DashboardView: React.FC = () => {
  const { user } = useAuthStore();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await opportunitiesService.getAll();
        setOpportunities(data as any[]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ghl-blue"></div>
      </div>
    );
  }

  // --- MÉTTRICAS GLOBALES ---
  const totalOpps = opportunities.length;
  const totalHps = opportunities.reduce((sum, opp) => sum + (opp.data?.property?.totalHogares || 0), 0);
  const wonOpps = opportunities.filter(o => o.data?.status === 'WON').length;
  const lostOpps = opportunities.filter(o => o.data?.status === 'LOST').length;
  const winRate = totalOpps > 0 ? Math.round((wonOpps / totalOpps) * 100) : 0;

  // --- MÉTTRICAS ADMIN ---
  // Ranking de Hunters por HPs
  const hunterHpsMap: Record<string, number> = {};
  opportunities.forEach(opp => {
    const hunterName = opp.data?.currentOwnerUser?.fullName || opp.data?.currentOwnerUser?.email || 'Sin Asignar';
    const hps = opp.data?.property?.totalHogares || 0;
    hunterHpsMap[hunterName] = (hunterHpsMap[hunterName] || 0) + hps;
  });
  const hunterRankingData = Object.keys(hunterHpsMap).map(name => ({
    name,
    hps: hunterHpsMap[name]
  })).sort((a, b) => b.hps - a.hps);

  // Status Pie Chart
  const statusData = [
    { name: 'Abiertas', value: opportunities.filter(o => o.data?.status === 'OPEN').length },
    { name: 'Ganadas (WIN)', value: wonOpps },
    { name: 'Perdidas', value: lostOpps },
  ];
  const COLORS = ['#3b82f6', '#10b981', '#ef4444'];

  // Canal Pie Chart
  const canalData = [
    { name: 'FUTURA', value: opportunities.filter(o => (o.canalHunting || 'FUTURA') === 'FUTURA').length },
    { name: 'NOVACORE', value: opportunities.filter(o => o.canalHunting === 'NOVACORE').length },
  ];
  const CANAL_COLORS = ['#3b82f6', '#8b5cf6'];

  // --- MÉTTRICAS BACKOFFICE ---
  const boValidacionesAsignacion = opportunities.filter(o => o.stage === 4 || o.stage === 5).length; 
  const boValidacionesFicha = opportunities.filter(o => o.stage === 12 || o.stage === 13).length; 
  const esperandoWin = opportunities.filter(o => o.stage === 6 || o.stage === 7 || o.stage === 14 || o.stage === 21).length;
  
  const funnelData = [
    { stage: 'Registro', count: opportunities.filter(o => o.stage === 0).length },
    { stage: 'Asignado', count: opportunities.filter(o => o.stage === 1).length },
    { stage: 'Validación BO 1', count: opportunities.filter(o => o.stage === 4).length },
    { stage: 'Validación BO 2', count: opportunities.filter(o => o.stage === 12).length },
    { stage: 'Aprobados WIN', count: opportunities.filter(o => o.data?.status === 'WON').length },
  ];

  // --- MÉTTRICAS HUNTER ---
  // (La seguridad backend garantiza que opportunities = solo sus opps)
  const hunterFunnel = [
    { name: 'Nuevos', value: opportunities.filter(o => o.stage === 0).length },
    { name: 'Asignados', value: opportunities.filter(o => o.stage === 1 || o.stage === 2).length },
    { name: 'Ficha Levantada', value: opportunities.filter(o => o.stage === 3).length },
    { name: 'Ganados', value: wonOpps },
  ];

  const role = user?.role || 'HUNTER';

  const KpiCard = ({ title, value, subtitle }: { title: string, value: string | number, subtitle?: string }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-y-auto h-full pb-10">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">
          Dashboard Analítico
          <span className="ml-3 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
            Modo {role}
          </span>
        </h1>
      </div>

      {/* ADMIN / ACCOUNT_ADMIN DASHBOARD */}
      {(role === 'ADMIN' || role === 'ACCOUNT_ADMIN') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard title="Total Oportunidades" value={totalOpps} />
            <KpiCard title="Volumen Total HPs" value={totalHps.toLocaleString()} subtitle="Hogares Pasados Sistematizados" />
            <KpiCard title="Tasa de Cierre (Ganadas)" value={`${winRate}%`} />
            <KpiCard title="Perdidas / Descartadas" value={lostOpps} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-96">
              <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase">Rendimiento por Hunter/Asesor (HPs)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hunterRankingData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="hps" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total HPs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
              <div className="grid grid-rows-2 gap-6 col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-48">
                  <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Rendimiento por Canal</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={canalData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {canalData.map((_, index) => (
                          <Cell key={`cell-canal-${index}`} fill={CANAL_COLORS[index % CANAL_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={24}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-48">
                  <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase">Estado Global</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((_, index) => (
                          <Cell key={`cell-status-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={24}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
          </div>
        </>
      )}

      {/* BACKOFFICE / SUPERVISOR DASHBOARD */}
      {(role === 'BACKOFFICE' || role === 'BACKOFFICE_VENTAS' || role === 'POSTVENTA' || role === 'SUPERVISOR_HUNTING' || role === 'SUPERVISOR_VENTAS') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Asignaciones Pendientes" value={boValidacionesAsignacion} subtitle="Pendientes de Revisión" />
            <KpiCard title="Fichas Técnicas Pendientes" value={boValidacionesFicha} subtitle="Pendientes de Validación" />
            <KpiCard title="Esperando a WIN" value={esperandoWin} subtitle="Trámites en Curso" />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-96 mt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase">Embudo Operativo</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} width={120} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Oportunidades" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* HUNTER / ASESOR_VENTAS DASHBOARD */}
      {(role === 'HUNTER' || role === 'ASESOR_VENTAS') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <KpiCard title="Mis HPs / Ventas Prospectadas" value={totalHps.toLocaleString()} subtitle="Acumulado" />
            <KpiCard title="Mis Proyectos Ganados" value={wonOpps} />
            <KpiCard title="Tasa de Éxito Personal" value={`${winRate}%`} />
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-96 mt-6">
            <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase">Estado de Mis Proyectos</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hunterFunnel} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cantidad" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
