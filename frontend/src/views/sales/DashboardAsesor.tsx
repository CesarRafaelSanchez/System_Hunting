import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { PhoneCall, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { opportunitiesService } from '../../services/opportunities.service';

export const DashboardAsesor: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    registered: 0,
    won: 0,
    potentialRevenue: 0,
    closedRevenue: 0
  });

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
        const response = await opportunitiesService.getAll();
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
          closedRevenue: closedRev
        });
      } catch (error) {
        console.error('Error loading asesor metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [user?.id]);

  return (
    <div className="p-4 md:p-8 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Consola de Asesor 👋</h1>
          <p className="text-gray-500 mt-1 capitalize">{today}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
          <Award className="w-5 h-5" />
          <span className="text-sm font-bold">Asesor de Ventas Fijas B2B</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Prospectos Propios</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{loading ? '-' : metrics.registered}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Ventas Ganadas</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">{loading ? '-' : metrics.won}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5" />
          </div>
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Cartera Potencial</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {loading ? '-' : `S/. ${metrics.potentialRevenue.toLocaleString()}`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">Mensual Cerrado</h3>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {loading ? '-' : `S/. ${metrics.closedRevenue.toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <PhoneCall className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">¡Todo listo para gestionar la cartera B2B!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Utiliza el menú lateral para registrar nuevas ventas fijas comerciales o accede al Tablero Kanban para avanzar tus oportunidades.
        </p>
      </div>
    </div>
  );
};
