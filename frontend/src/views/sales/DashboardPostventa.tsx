import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { 
  CheckCircle2, 
  PhoneCall, 
  Receipt, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  TrendingUp,
  FileCheck,
  Headphones
} from 'lucide-react';
import { ventasService } from '../../services/ventas.service';

export const DashboardPostventa: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    installedCount: 0,
    controlCallsCount: 0,
    recibo1Count: 0,
    recibo2Count: 0,
    recibo3Count: 0,
    bajaCount: 0,
    retentionRate: 100
  });

  const [postventaList, setPostventaList] = useState<any[]>([]);

  const today = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    const fetchPostventaMetrics = async () => {
      setLoading(true);
      try {
        const response = await ventasService.getAll();
        const list = Array.isArray(response) ? response : [];

        // Filtrar oportunidades en tramo de postventa (posicion >= 15 o stage >= 14)
        const pvOpps = list.filter((o: any) => {
          const pos = o.currentStage?.position || (o.stage !== undefined ? o.stage + 1 : 0);
          return pos >= 15;
        });

        const installed = pvOpps.filter((o: any) => o.currentStage?.name === '100% Instalación Completada');
        const controlCalls = pvOpps.filter((o: any) => o.currentStage?.name === 'Llamada de Control' || o.currentStage?.name === 'Llamada Postventa');
        const r1 = pvOpps.filter((o: any) => o.currentStage?.name === 'Recibo 1');
        const r2 = pvOpps.filter((o: any) => o.currentStage?.name === 'Recibo 2');
        const r3 = pvOpps.filter((o: any) => o.currentStage?.name === 'Recibo 3');
        const bajas = pvOpps.filter((o: any) => o.currentStage?.name === 'Baja de Cliente');

        const totalActivePv = pvOpps.length - bajas.length;
        const retRate = pvOpps.length > 0 ? (totalActivePv / pvOpps.length) * 100 : 100;

        setMetrics({
          installedCount: installed.length,
          controlCallsCount: controlCalls.length,
          recibo1Count: r1.length,
          recibo2Count: r2.length,
          recibo3Count: r3.length,
          bajaCount: bajas.length,
          retentionRate: Math.round(retRate * 10) / 10
        });

        setPostventaList(pvOpps);
      } catch (error) {
        console.error('Error al cargar métricas de Postventa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostventaMetrics();
  }, [user?.id]);

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-teal-800/30">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-500/30 uppercase tracking-widest">
              Control de Calidad & Retención
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
              Tramo Postventa (FS B2B)
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Consola de Postventa y Recibos 🎧</h1>
          <p className="text-slate-400 text-sm mt-1 capitalize font-medium">{today}</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Ejecutivo de Postventa</p>
            <p className="text-base font-bold text-white">{user?.fullName || 'Postventa FS'}</p>
          </div>
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CLIENTES INSTALADOS 100% */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instalación 100%</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{metrics.installedCount} Cuentas</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Listas para llamada de control</p>
            </div>
            <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-teal-600 font-bold gap-1">
            <FileCheck className="w-4 h-4" /> Pendientes de inducción
          </div>
        </div>

        {/* LLAMADAS DE CONTROL */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Llamadas de Control</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{metrics.controlCallsCount} En Gestión</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Validación de servicio activo</p>
            </div>
            <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-indigo-600 font-bold gap-1">
            <UserCheck className="w-4 h-4" /> Encuestas de satisfacción
          </div>
        </div>

        {/* RECAUDACIÓN DE RECIBOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Control de Recibos (R1-R3)</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                {metrics.recibo1Count + metrics.recibo2Count + metrics.recibo3Count} Recibos
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">R1: {metrics.recibo1Count} | R2: {metrics.recibo2Count} | R3: {metrics.recibo3Count}</p>
            </div>
            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-bold gap-1">
            <TrendingUp className="w-4 h-4" /> Tramo de cobranza activa
          </div>
        </div>

        {/* TASA DE RETENCIÓN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Índice de Retención</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{metrics.retentionRate}%</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Bajas registradas: {metrics.bajaCount}</p>
            </div>
            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600 font-bold gap-1">
            <Clock className="w-4 h-4" /> Cuentas corporativas vigentes
          </div>
        </div>
      </div>

      {/* TABLA DE CUENTAS EN POSTVENTA */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-teal-600" />
              Seguimiento de Cuentas Corporativas en Postventa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Oportunidades desde 100% Instalación Completada hasta Cobranza de Recibos</p>
          </div>
          <span className="text-xs bg-teal-50 text-teal-700 font-bold px-3 py-1 rounded-full border border-teal-200">
            {postventaList.length} Cuentas en Tramo
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400 text-sm">Cargando cuentas de postventa...</div>
        ) : postventaList.length === 0 ? (
          <div className="py-12 flex justify-center text-slate-400 text-sm">No hay cuentas en tramo de postventa actualmente.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Código / Cliente</th>
                  <th className="py-3 px-4">RUC</th>
                  <th className="py-3 px-4">Contacto RRLL</th>
                  <th className="py-3 px-4">Tecnología</th>
                  <th className="py-3 px-4 text-right">Cargo Fijo (S/)</th>
                  <th className="py-3 px-4 text-center">Etapa Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {postventaList.map((opp, idx) => {
                  const stageName = opp.currentStage?.name || 'Postventa';
                  const isBaja = stageName === 'Baja de Cliente';
                  const isR3 = stageName === 'Recibo 3';
                  
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {opp.ventaFija?.razonSocial || opp.title || opp.code}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{opp.ventaFija?.ruc || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {opp.ventaFija?.representanteLegal || 'Cliente'} ({opp.ventaFija?.celularRrll || '-'})
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{opp.ventaFija?.tipoTecnologia || '-'}</td>
                      <td className="py-3.5 px-4 text-right font-black text-teal-950">
                        S/ {parseFloat(opp.ventaFija?.cargoFijoSinIgv || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          isBaja 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : isR3 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}>
                          {stageName}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
