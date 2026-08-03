import React, { useState, useEffect } from 'react';
import { FormVentaB2BGénesis } from './FormVentaB2BGénesis';
import { ventasService } from '../../services/ventas.service';
import { Search, Plus, Building2, MapPin, UserCheck, Users } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const RegistrarVenta: React.FC = () => {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'TEAM'>('PERSONAL');

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const response = await ventasService.getAll();
      const data = (response as any).data || response;
      const misOportunidades = Array.isArray(data) ? data : [];
      setVentas(misOportunidades);
    } catch (error) {
      console.error('Error fetching B2B sales', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
  }, [user?.id]);

  const isSupervisorOrAdmin = user?.role === 'SUPERVISOR_VENTAS' || user?.role === 'ACCOUNT_ADMIN' || user?.role === 'AGENCY_ADMIN';

  // Filtrado por Tab (Mis Ventas vs Equipo)
  const tabFilteredVentas = ventas.filter((o: any) => {
    const isOwnerOrCreator = o.createdByUserId === user?.id || o.currentOwnerUserId === user?.id;
    if (activeTab === 'PERSONAL') {
      return isOwnerOrCreator;
    }
    // Tab TEAM: Muestra las del equipo (excluye las directas si quiere enfocar el equipo, o todas si es supervisor)
    return true;
  });

  const filteredVentas = tabFilteredVentas.filter((p) => {
    const direccion = (p.subtitle || '').toLowerCase();
    const razonSocial = (p.title || '').toLowerCase();
    const distrito = (p.property?.distrito || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return direccion.includes(q) || razonSocial.includes(q) || distrito.includes(q);
  });

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6">
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col" style={{ maxHeight: 'calc(100vh - 130px)', overflow: 'hidden' }}>
          <div className="flex justify-between items-center border-b border-gray-100 p-6 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">Registrar Nueva Venta B2B</h2>
            <button 
              onClick={() => { setShowForm(false); fetchVentas(); }}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors cursor-pointer"
            >
              Volver a la lista
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <FormVentaB2BGénesis />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Historial de Ventas Registradas</h2>
              <p className="text-sm text-slate-500 font-medium">Gestión de expedientes y registros de Ventas Fijas B2B</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm w-full md:w-auto justify-center cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Registrar Nueva Venta B2B
            </button>
          </div>

          {/* TABS PARA SUPERVISOR / ADMIN */}
          {isSupervisorOrAdmin && (
            <div className="flex gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setActiveTab('PERSONAL')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PERSONAL'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Mis Ventas Directas ({ventas.filter(o => o.createdByUserId === user?.id || o.currentOwnerUserId === user?.id).length})
              </button>

              <button
                onClick={() => setActiveTab('TEAM')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'TEAM'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                Ventas de Mi Equipo ({ventas.length})
              </button>
            </div>
          )}

          {/* BUSCADOR */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por razón social, dirección o distrito..." 
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* TABLA DE VENTAS */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[11px] uppercase font-extrabold tracking-wider border-b border-slate-100">
                  <th className="p-4">Razón Social</th>
                  <th className="p-4">Distrito</th>
                  <th className="p-4">Dirección de Instalación</th>
                  <th className="p-4">Tecnología / Play</th>
                  <th className="p-4">Registrado Por</th>
                  <th className="p-4 text-center">Cargo Fijo</th>
                  <th className="p-4">Estado</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-medium">Cargando ventas B2B...</td></tr>
                ) : filteredVentas.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400 font-medium">No se encontraron ventas registradas en esta vista.</td></tr>
                ) : (
                  filteredVentas.map((p, i) => {
                    const isMyOwn = p.createdByUserId === user?.id || p.currentOwnerUserId === user?.id;
                    const registrantName = p.createdByUserName || p.currentOwnerUser?.fullName || p.property?.ejecutivo || 'Asesor Comercial';
                    const distritoName = p.ventaFija?.distrito || p.property?.distrito || '-';
                    const techInfo = `${p.property?.tipoTecnologia || p.ventaFija?.tipoTecnologia || '-'} / ${p.property?.tipoPlay || p.ventaFija?.tipoPlay || '-'}`;

                    return (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-snug">{p.title || p.ventaFija?.razonSocial || 'Sin Razón Social'}</p>
                              <p className="text-[11px] text-slate-400 font-semibold uppercase">RUC: {p.ventaFija?.ruc || 'SIN RUC'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="text-xs font-bold text-slate-700 uppercase bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 inline-block">
                            {distritoName}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px] text-xs font-medium" title={p.property?.direccionExacta || p.subtitle}>
                              {p.property?.direccionExacta || p.subtitle || '-'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 text-xs font-semibold text-slate-600 uppercase">
                          {techInfo}
                        </td>

                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                            isMyOwn 
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {isMyOwn ? '📌 Tú (Supervisor)' : `👤 ${registrantName}`}
                          </span>
                        </td>

                        <td className="p-4 text-center font-black text-slate-800 text-sm">
                          S/. {parseFloat(p.property?.totalHogares || p.ventaFija?.cargoFijoSinIgv || 0).toFixed(2)}
                        </td>

                        <td className="p-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase truncate max-w-[140px] inline-block border border-slate-200/60" title={p.currentStage?.name || ''}>
                            {p.currentStage?.name || `Etapa ${p.stage !== undefined ? p.stage + 1 : 1}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
