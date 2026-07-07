import React, { useState, useEffect } from 'react';
import { Form1Registro } from './Form1Registro';
import { opportunitiesService } from '../../services/opportunities.service';
import { Search, Plus, Building2, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const RegistrarPredio: React.FC = () => {
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predios, setPredios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPredios = async () => {
    setLoading(true);
    try {
      const response = await opportunitiesService.getAll();
      const data = (response as any).data || response;
      const misOportunidades = Array.isArray(data) ? data : [];
      // Filtrar los del hunter logueado
      const filtered = user?.role === 'HUNTER' 
        ? misOportunidades.filter((o: any) => o.createdByUserId === user.id || o.currentOwnerUserId === user.id)
        : misOportunidades;
      setPredios(filtered);
    } catch (error) {
      console.error('Error fetching predios', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredios();
  }, [user?.id]);

  const filteredPredios = predios.filter((p) => {
    const direccion = (p.property?.nombreVia || p.subtitle || '').toLowerCase();
    const nombre = (p.property?.nombreProyecto || p.title || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return direccion.includes(q) || nombre.includes(q);
  });

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Registrar Nuevo Predio</h2>
            <button 
              onClick={() => { setShowForm(false); fetchPredios(); }}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Volver a la lista
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            <Form1Registro />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Mis Predios Registrados</h2>
              <p className="text-sm text-gray-500">Historial de prospección</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm transition-all flex items-center gap-2 text-sm w-full md:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              Registrar nuevo Predio
            </button>
          </div>

          <div className="relative mb-6">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por dirección o nombre..." 
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-ghl-lightBlue focus:ring-2 focus:ring-ghl-lightBlue outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 border-b border-gray-200 font-semibold rounded-tl-lg">Proyecto / Edificio</th>
                  <th className="p-4 border-b border-gray-200 font-semibold">Dirección</th>
                  <th className="p-4 border-b border-gray-200 font-semibold">Distrito</th>
                  <th className="p-4 border-b border-gray-200 font-semibold text-center">Hogares</th>
                  <th className="p-4 border-b border-gray-200 font-semibold rounded-tr-lg">Etapa</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando...</td></tr>
                ) : filteredPredios.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">No se encontraron predios.</td></tr>
                ) : (
                  filteredPredios.map((p, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{p.property?.nombreProyecto || p.title || 'Sin nombre'}</p>
                            <p className="text-xs text-gray-500 uppercase">{p.canalHunting || 'FUTURA'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[200px]">{p.property?.nombreVia || p.subtitle || '-'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 uppercase text-xs">{p.property?.distrito || '-'}</td>
                      <td className="p-4 text-center font-medium text-gray-800">{p.property?.numeroHogares || 0}</td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase truncate max-w-[150px] inline-block">
                          Etapa {p.stage !== undefined ? p.stage : 0}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
