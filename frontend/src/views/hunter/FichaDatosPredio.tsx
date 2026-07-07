import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Form3FichaDatos } from './Form3FichaDatos';
import { opportunitiesService } from '../../services/opportunities.service';
import { Search, Building2, MapPin, CheckCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const FichaDatosPredio: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showFormId, setShowFormId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [predios, setPredios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.targetId) {
      setShowFormId(location.state.targetId);
    }
  }, [location]);

  const fetchPredios = async () => {
    setLoading(true);
    try {
      const response = await opportunitiesService.getAll();
      const data = (response as any).data || response;
      const misOportunidades = Array.isArray(data) ? data : [];
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
    if (!showFormId) {
      fetchPredios();
    }
  }, [showFormId, user?.id]);

  // Stage 11 = Pendiente Envío de Formulario Ficha de Datos
  const pending = predios.filter(p => p.stage === 11);
  // Stage 12+ = Formulario de Ficha completado o más avanzado
  const completed = predios.filter(p => p.stage !== undefined && p.stage >= 12);

  const displayList = activeTab === 'pending' ? pending : completed;

  const filteredList = displayList.filter((p) => {
    const direccion = (p.property?.nombreVia || p.subtitle || '').toLowerCase();
    const nombre = (p.property?.nombreProyecto || p.title || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return direccion.includes(q) || nombre.includes(q);
  });

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto">
      {showFormId ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">Completar Ficha de Datos Técnicos</h2>
            <button 
              onClick={() => { setShowFormId(null); fetchPredios(); }}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              Volver a la lista
            </button>
          </div>
          <div className="max-w-2xl mx-auto">
            {/* The Form3 needs the opportunity ID. For this to work best, we should pass the id to Form3FichaDatos if it accepts it. */}
            <Form3FichaDatos />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Fichas de Datos Técnicos</h2>
            <p className="text-sm text-gray-500">Gestione la toma de datos técnicos de sus predios asignados.</p>
          </div>

          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'pending' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock className="w-4 h-4" />
              Por Completar ({pending.length})
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'completed' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('completed')}
            >
              <CheckCircle className="w-4 h-4" />
              Completados ({completed.length})
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
                  <th className="p-4 border-b border-gray-200 font-semibold text-center">Hogares</th>
                  <th className="p-4 border-b border-gray-200 font-semibold text-center rounded-tr-lg">Acción</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Cargando...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">No hay predios en esta categoría.</td></tr>
                ) : (
                  filteredList.map((p, i) => (
                    <tr key={p.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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
                      <td className="p-4 text-center font-medium text-gray-800">{p.property?.numeroHogares || 0}</td>
                      <td className="p-4 text-center">
                        {activeTab === 'pending' ? (
                          <button 
                            onClick={() => setShowFormId(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-4 rounded-lg shadow-sm text-xs transition-colors"
                          >
                            Llenar Ficha
                          </button>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                            Completado
                          </span>
                        )}
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
