import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Calendar, Clock, MapPin, CheckCircle2, Filter } from 'lucide-react';
import { opportunitiesService } from '../../services/opportunities.service';

export const DashboardHunter: React.FC = () => {
  const { user } = useAuthStore();
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [metrics, setMetrics] = useState({ predios: 0, asignaciones: 0, horas: 0 });
  const [loading, setLoading] = useState(false);
  
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
        // Simular filtrado por hunter id si aplica.
        // Simulando carga de datos.
        const misOportunidades = Array.isArray(data) ? data : [];
        setMetrics({
          predios: misOportunidades.length,
          asignaciones: misOportunidades.filter((o: any) => o.etapa >= 2).length, // asumiendo etapa > 2 significa asignación
          horas: dateFilter === 'today' ? 4 : dateFilter === 'week' ? 24 : 96,
        });
      } catch (error) {
        console.error('Error fetching metrics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [dateFilter, user?.id]);

  return (
    <div className="p-4 md:p-8 w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Hola, {user?.fullName || 'Hunter'} 👋</h1>
          <p className="text-gray-500 mt-2 capitalize">{today}</p>
        </div>
        
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <Filter className="w-4 h-4 text-gray-400 ml-2 mr-1" />
          <select 
            className="bg-transparent border-none text-sm font-medium text-gray-600 focus:ring-0 py-1.5 pl-2 pr-6 cursor-pointer"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Predios Registrados</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '-' : metrics.predios}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Asignaciones Completadas</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '-' : metrics.asignaciones}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-gray-500 font-medium text-sm">Horas en Ruta</h3>
          <p className="text-3xl font-bold text-gray-800 mt-1">{loading ? '-' : `${metrics.horas}h 0m`}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">¡Todo listo para empezar!</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Recuerda registrar tu asistencia en el módulo <strong>Asistencia</strong> antes de comenzar tu ruta y utiliza <strong>Registro de Predio</strong> cuando estés en el lugar.
        </p>
      </div>
    </div>
  );
};
