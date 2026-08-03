import React, { useState, useEffect } from 'react';
import { Search, Filter, ClipboardCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { opportunitiesService } from '../../services/opportunities.service';
import { OpportunitySplitView as VentasB2BSplitView } from '../opportunities/b2b/B2BSplitView';
import { OpportunitySplitView as HuntingSplitView } from '../opportunities/hunting/HuntingSplitView';
import { toast } from 'sonner';

export const ValidacionExpedientes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PENDIENTES' | 'OBSERVADOS' | 'APROBADOS'>('PENDIENTES');
  const [searchTerm, setSearchTerm] = useState('');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);

  const fetchOpps = async () => {
    try {
      setLoading(true);
      const data = await opportunitiesService.getAll();
      setOpportunities(data as any[]);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const getStageNum = (o: any) => {
    if (typeof o.stage === 'number') return o.stage;
    if (o.currentStage?.position) return o.currentStage.position - 1;
    return 0;
  };

  const getFilteredData = () => {
    let filtered = opportunities;

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.title?.toLowerCase().includes(lowerSearch) || 
        o.property?.nombreProyecto?.toLowerCase().includes(lowerSearch)
      );
    }

    if (activeTab === 'PENDIENTES') {
      // Form 2 and Form 3 completed, waiting for BO validation
      return filtered.filter(o => [4, 5, 12, 13].includes(getStageNum(o)));
    }
    if (activeTab === 'OBSERVADOS') {
      // Rejected, returned
      return filtered.filter(o => [9, 10, 2].includes(getStageNum(o)));
    }
    if (activeTab === 'APROBADOS') {
      // Sent to WIN, approved, habilitation
      return filtered.filter(o => [6, 7, 8, 14, 15, 16, 17, 18].includes(getStageNum(o)));
    }
    
    return filtered;
  };

  const currentData = getFilteredData();

  return (
    <div className="flex flex-col relative bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Validación de Expedientes</h2>
        <p className="text-gray-500 text-sm">Auditoría centralizada de asignaciones y fichas técnicas enviadas por campo.</p>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-6 gap-4">
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-full md:w-auto">
            <button 
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'PENDIENTES' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('PENDIENTES')}
            >
              <ClipboardCheck className="w-4 h-4" />
              Pendientes
            </button>
            <button 
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'OBSERVADOS' ? 'bg-amber-50 text-amber-700 shadow-sm border border-amber-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('OBSERVADOS')}
            >
              <AlertTriangle className="w-4 h-4" />
              Observados
            </button>
            <button 
              className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'APROBADOS' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('APROBADOS')}
            >
              <CheckCircle2 className="w-4 h-4" />
              Aprobados
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar por predio..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-ghl-blue focus:ring-1 focus:ring-ghl-blue outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex-shrink-0">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-slate-50">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ghl-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.map(opp => {
              const stageNum = getStageNum(opp);
              const stageName = [4, 5, 9, 10, 6, 7].includes(stageNum) ? 'Formulario Asignación' : 
                               ([12, 13, 2, 14, 15].includes(stageNum) ? 'Ficha de Datos' : 'Otro');
              
              const isForm2 = [4, 5, 9, 10, 6, 7].includes(stageNum);
              
              return (
                <div key={opp.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide ${isForm2 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-purple-50 text-purple-700 border border-purple-100'}`}>
                      {stageName}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Hace 2 horas</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{opp.title || opp.property?.nombreProyecto || 'Sin Título'}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">{opp.subtitle || opp.property?.nombreVia || 'Sin dirección'}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {(opp.currentOwnerUser?.fullName?.[0] || opp.property?.ejecutivo?.[0] || 'H').toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {opp.currentOwnerUser?.fullName || opp.property?.ejecutivo || 'Hunter'}
                    </span>
                  </div>
                  
                  <button 
                    className="w-full py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    onClick={() => setSelectedCard({ ...opp, stage: stageNum })}
                  >
                    Revisar Expediente
                  </button>
                </div>
              );
            })}
            
            {currentData.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-40 text-gray-400">
                <ClipboardCheck className="w-12 h-12 mb-2 opacity-20" />
                <p>No hay expedientes en esta bandeja</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCard && (
        (!selectedCard.propertyId || selectedCard.company?.tipoNegocio === 'VENTAS_B2B') ? (
          <VentasB2BSplitView
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            onSave={() => {
              fetchOpps();
            }}
            onApprove={() => {}}
          />
        ) : (
          <HuntingSplitView 
            card={selectedCard} 
            onClose={() => setSelectedCard(null)} 
            onSave={() => {
              fetchOpps();
            }}
            onApprove={async (towersData) => {
              const currentStage = selectedCard.stage;
              let targetCode = '';
              if (currentStage === 4 || currentStage === 5 || currentStage === 6) targetCode = 'S7';
              else if (currentStage === 12 || currentStage === 13 || currentStage === 14) targetCode = 'S15';
              
              if (targetCode !== '') {
                try {
                  const { opportunitiesService } = await import('../../services/opportunities.service');
                  await opportunitiesService.transitionStage(
                    String(selectedCard.id), 
                    targetCode, 
                    'Aprobación y transición por Validación Back Office', 
                    true, 
                    towersData
                  );
                  toast.success('¡Expediente aprobado y enviado a WIN!');
                  fetchOpps();
                } catch (error) {
                  toast.error('Error de red al aprobar.');
                }
              }
              setSelectedCard(null);
            }}
          />
        )
      )}
    </div>
  );
};
