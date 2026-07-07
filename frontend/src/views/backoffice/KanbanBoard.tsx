import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, LayoutGrid, List, Download, Upload, MoreVertical, Plus, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor, TouchSensor, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { OpportunitySplitView } from './OpportunitySplitView';
import { OpportunitiesTable } from './OpportunitiesTable';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'sonner';

const STAGES = [
  'Edificio Prospectado',
  'Prospecto Aceptado / Trabajable',
  'Prospecto Rechazado / No Trabajable',
  'Pendiente Envío de Formulario de Asignación',
  'Formulario de Asignación/Reasignación Completado',
  'Validación Back Office',
  'Solicitud de Asignación/Reasignación Enviada a WIN',
  'Esperando Respuesta WIN',
  'Asignación Aprobada',
  'Asignación Rechazada',
  'Pendiente Reasignación',
  'Pendiente Envío de Formulario Ficha de Datos',
  'Formulario de Ficha de Datos Completado',
  'Validación Back Office 2',
  'Ficha de Datos Enviada a WIN',
  'Pendiente Inicio de Habilitación (construcción)',
  'En Habilitación Técnica',
  'Standby por Accesos',
  'Habilitación Completa',
  'Hunting Perdido/ No Recuperable'
];

const CardContent = ({ card, role, onActionClick }: { card: any, role: string, onActionClick?: (type: string, id: string) => void }) => {
  const p = card.property || {};
  const titulo = p.nombreProyecto || card.title || 'SIN NOMBRE';
  const tipoConstruccion = p.tipoConstruccion || p.estreno || p.tipoEdificio || 'MODERNO';
  const canal = card.canalHunting || 'FUTURA';
  const distrito = p.distrito || '-';
  
  let totalHogares = p.numeroHogares || 0;
  if (!totalHogares && card.towersData) {
    totalHogares = card.towersData.reduce((acc: number, t: any) => {
      const pisos = parseInt(t.pisos_torre) || 0;
      if (!t.hogares_por_piso) return acc;
      if (t.hogares_por_piso.includes(',')) {
        return acc + t.hogares_por_piso.split(',').reduce((s: number, hp: string) => s + (parseInt(hp) || 0), 0);
      }
      return acc + (pisos * (parseInt(t.hogares_por_piso) || 0));
    }, 0);
  }

  const ownerName = p.ejecutivo || 'Hunter';
  const initial = ownerName[0]?.toUpperCase() || 'H';

  let hpColor = 'text-slate-800';
  let flameIcon = null;

  if (totalHogares > 75) {
    hpColor = 'text-amber-600';
    flameIcon = '🔥 ';
  }

  let badgeClasses = 'bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase';
  if (canal === 'FUTURA') {
    badgeClasses = 'bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase';
  } else if (canal === 'NOVACORE') {
    badgeClasses = 'bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase';
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fila Superior */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-base font-bold text-slate-900 leading-tight">{titulo}</span>
          <div>
            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase mt-1 inline-block">
              {tipoConstruccion}
            </span>
          </div>
        </div>
        <div className="shrink-0 ml-2 mt-0.5">
          <span className={badgeClasses}>
            {canal}
          </span>
        </div>
      </div>
      
      {/* Línea Divisoria */}
      <div className="border-t border-gray-100 my-2.5"></div>
      
      {/* Fila Media */}
      <div className="flex justify-between items-center text-xs text-slate-500 mb-2.5">
        <div className="truncate">
          Distrito: <span className="font-bold text-slate-800 uppercase">{distrito}</span>
        </div>
        <div className="shrink-0 ml-2">
          Hogares: <span className={`font-bold ${hpColor}`}>{flameIcon}{totalHogares}</span>
        </div>
      </div>
      
      {/* Fila Inferior */}
      <div className="flex items-center text-xs text-slate-500 mt-auto">
        <div className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 flex items-center justify-center mr-1.5 shrink-0">
          {initial}
        </div>
        <div className="truncate">
          Hunter: <span className="font-semibold text-slate-700">{ownerName}</span>
        </div>
      </div>
      {/* Acciones para Hunter */}
      {role === 'HUNTER' && (card.stage === 3 || card.stage === 11) && (
        <div className="mt-3 w-full">
          {card.stage === 3 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onActionClick && onActionClick('asignacion', card.id); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Llenar Asignación
            </button>
          )}
          {card.stage === 11 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onActionClick && onActionClick('ficha', card.id); }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Llenar Ficha
            </button>
          )}
        </div>
      )}
    </div>
  );
};

function SortableCard({ id, card, onClick, isDragDisabled, isDragOverlay, role, onActionClick }: any) {
  const p = card.property || {};
  let totalHogares = p.numeroHogares || 0;
  if (!totalHogares && card.towersData) {
    totalHogares = card.towersData.reduce((acc: number, t: any) => {
      const pisos = parseInt(t.pisos_torre) || 0;
      if (!t.hogares_por_piso) return acc;
      if (t.hogares_por_piso.includes(',')) {
        return acc + t.hogares_por_piso.split(',').reduce((s: number, hp: string) => s + (parseInt(hp) || 0), 0);
      }
      return acc + (pisos * (parseInt(t.hogares_por_piso) || 0));
    }, 0);
  }

  let borderColor = '';
  if (totalHogares > 75) {
    borderColor = 'border-l-4 border-l-amber-500';
  } else if (totalHogares >= 31) {
    borderColor = 'border-l-4 border-l-blue-500';
  }

  const canal = card.canalHunting || 'FUTURA';
  let cardBgColor = 'bg-white';
  if (canal === 'FUTURA') cardBgColor = 'bg-sky-50/30';
  else if (canal === 'NOVACORE') cardBgColor = 'bg-indigo-50/30';

  if (isDragOverlay) {
    return (
      <div className={`${cardBgColor} p-3.5 rounded-xl shadow-2xl border-none w-full rotate-3 scale-105 cursor-grabbing z-50 opacity-90 ${borderColor}`}>
        <CardContent card={card} role={role} />
      </div>
    );
  }

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id, 
    data: { card },
    disabled: isDragDisabled 
  });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`${cardBgColor} p-3.5 rounded-xl shadow-sm border-none w-full cursor-pointer transition-all duration-300 ease-out mb-3 z-10 
        ${borderColor}
        ${isDragging ? 'opacity-40 border-dashed border-2 border-gray-300' : 'hover:shadow-md'}`}
      onClick={(e) => {
        // Aseguramos que el onClick se dispare ignorando drag si no hubo movimiento real
        e.stopPropagation();
        onClick(card);
      }}
    >
      <CardContent card={card} role={role} onActionClick={onActionClick} />
    </div>
  );
}

function KanbanColumn({ stageIndex, title, cards, onCardClick, role, onActionClick }: any) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);
  
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `col-${stageIndex}`, data: { stageIndex }, disabled: isCollapsed });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { rootMargin: '200px' });
    
    if (colRef.current) observer.observe(colRef.current);
    return () => observer.disconnect();
  }, []);

  const getHeaderStyles = (index: number) => {
    if ([18, 8].includes(index)) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if ([2, 9, 19].includes(index)) return 'bg-red-50 text-red-700 border-red-100';
    if ([5, 10, 13, 17].includes(index)) return 'bg-amber-50 text-amber-700 border-amber-100';
    if ([6, 7, 14].includes(index)) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  const headerStyles = getHeaderStyles(stageIndex);

  return (
    <div ref={colRef} className={`flex-shrink-0 flex flex-col rounded-xl transition-all duration-300 border-none overflow-hidden ${isCollapsed ? `w-14 h-full ${headerStyles}` : 'w-80 max-h-full bg-transparent'}`}>
      <div className={`p-3 flex justify-between items-center sticky top-0 z-10 ${isCollapsed ? 'bg-transparent' : `${headerStyles} rounded-xl mb-3`}`}>
        {!isCollapsed && <h3 className="font-semibold text-sm truncate pr-2" title={title}>{title}</h3>}
        
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 w-full pt-1' : 'gap-2'}`}>
          <span className="bg-white/60 text-current text-xs font-bold px-2 py-1 rounded-full">{cards.length}</span>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hover:opacity-70 transition-colors p-1 rounded-md" title={isCollapsed ? "Expandir" : "Contraer"}>
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {isVisible && !isCollapsed && (
        <div 
          ref={setDropRef} 
          className={`flex-1 overflow-y-auto transition-colors ${isOver ? 'bg-blue-50/50 rounded-xl' : 'bg-transparent'}`}
        >
          <SortableContext items={cards.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((c: any) => (
              <SortableCard key={c.id} id={c.id} card={c} onClick={onCardClick} isDragDisabled={onCardClick.isDragDisabled} role={role} onActionClick={onActionClick} />
            ))}
          </SortableContext>
        </div>
      )}
      {!isVisible && !isCollapsed && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
      )}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center w-full h-full overflow-hidden pb-8">
          <div className="[writing-mode:vertical-lr] rotate-180 font-semibold tracking-widest whitespace-nowrap text-sm uppercase">
            {title}
          </div>
        </div>
      )}
    </div>
  );
}

export const KanbanBoard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [closingCard, setClosingCard] = useState<any>(null);
  const [closingStage, setClosingStage] = useState<number | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeCardData, setActiveCardData] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const fetchCards = async () => {
    try {
      const { opportunitiesService } = await import('../../services/opportunities.service');
      const data = await opportunitiesService.getAll();
      const opps = data as any[];
      const mappedOpps = opps.map(o => {
        return {
          ...o,
          stage: o.stage !== undefined ? o.stage : (o.currentStageId ? 0 : 0),
          title: o.title || o.property?.nombreProyecto || o.code,
          subtitle: o.subtitle || o.property?.nombreVia || 'Sin dirección'
        };
      });
      
      const { useAuthStore } = await import('../../store/useAuthStore');
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser?.role === 'HUNTER') {
        setCards(mappedOpps.filter(c => c.createdByUserId === currentUser.id || c.currentOwnerUserId === currentUser.id));
      } else {
        setCards(mappedOpps);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    if (user?.role === 'HUNTER') return;
    setActiveCardData(event.active.data.current?.card);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCardData(null);
    if (user?.role === 'HUNTER') return;
    const { active, over } = event;
    if (!over) return;
    
    const overId = String(over.id);
    let targetStage = -1;

    if (overId.startsWith('col-')) {
      targetStage = parseInt(overId.split('-')[1]);
    } else {
      const overCard = cards.find(c => c.id === overId);
      if (overCard) targetStage = overCard.stage;
    }

    if (targetStage === -1) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard || activeCard.stage === targetStage) return;
    const originalStage = activeCard.stage;

    // Etapa 18 es "Habilitación Completa", Etapa 19 es "Hunting Perdido"
    if (targetStage === 18 || targetStage === 19) {
      setClosingCard(activeCard);
      setClosingStage(targetStage);
      return; 
    }

    setCards(cards.map(c => c.id === active.id ? { ...c, stage: targetStage } : c));

    try {
      const { opportunitiesService } = await import('../../services/opportunities.service');
      await opportunitiesService.transitionStage(String(active.id), targetStage);
      
      // Auto-refresh UI para reflejar transiciones automáticas del backend (delay ~5s)
      setTimeout(() => {
        fetchCards();
      }, 5500);
    } catch (error) {
      toast.error('Error de red. Revirtiendo cambio...');
      setCards(cards.map(c => c.id === active.id ? { ...c, stage: originalStage } : c));
    }
  };

  const confirmClosing = async () => {
    if (closingStage === 19 && !lostReason) {
      toast.error('Debe ingresar un motivo de caída');
      return;
    }

    const originalStage = closingCard.stage;
    setCards(cards.map(c => c.id === closingCard.id ? { ...c, stage: closingStage } : c));
    const currentCard = closingCard;
    const currentStage = closingStage;
    
    setClosingCard(null);
    setClosingStage(null);
    setLostReason('');

    try {
      const { opportunitiesService } = await import('../../services/opportunities.service');
      await opportunitiesService.transitionStage(String(currentCard.id), currentStage!, lostReason);
      if (currentStage === 18) {
        toast.success('Oportunidad Habilitada con Éxito.');
      } else {
        toast.success('Oportunidad marcada como Perdida.');
      }
    } catch (error) {
      toast.error('Error de red. Revirtiendo cierre...');
      setCards(cards.map(c => c.id === currentCard.id ? { ...c, stage: originalStage } : c));
    }
  };

  const handleActionClick = (type: string, id: string) => {
    if (type === 'asignacion') {
      navigate('/hunter/asignacion', { state: { targetId: id } });
    } else if (type === 'ficha') {
      navigate('/hunter/ficha', { state: { targetId: id } });
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar clientes potenciales" 
              className="pl-9 pr-4 py-1.5 border border-gray-200 bg-white rounded-2xl text-sm focus:border-ghl-lightBlue focus:ring-2 focus:ring-ghl-lightBlue outline-none transition-all w-64"
            />
          </div>
          <button className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-slate-700 flex items-center space-x-2 shadow-sm hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 text-gray-500" />
            <span>Filtros avanzados</span>
          </button>
          <button className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-slate-700 flex items-center space-x-2 shadow-sm hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <span>Ordenar</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          {/* Toggle Group */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-ghl-blue' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vista Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-ghl-blue' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vista Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-ghl-blue font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Download className="w-4 h-4" /> Importar
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-ghl-blue font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Upload className="w-4 h-4" /> Exportar
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4" /> Añadir oportunidad
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 scroll-smooth bg-slate-50">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full items-start">
              {STAGES.map((stage, i) => (
                <KanbanColumn 
                  key={i} 
                  stageIndex={i} 
                  title={stage} 
                  cards={cards.filter(c => c.stage === i)} 
                  onCardClick={Object.assign(setSelectedCard, { isDragDisabled: user?.role === 'HUNTER' })}
                  role={user?.role}
                  onActionClick={handleActionClick}
                />
              ))}
            </div>
            <DragOverlay>
              {activeCardData ? <SortableCard card={activeCardData} isDragOverlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <OpportunitiesTable 
            cards={cards} 
            STAGES={STAGES} 
            onCardClick={setSelectedCard} 
          />
        </div>
      )}

      {selectedCard && (
        <OpportunitySplitView 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
          onApprove={async (towersData) => {
            const currentStage = selectedCard.stage;
            let targetStage = currentStage;
            if (currentStage === 5) targetStage = 6; // Validación BO -> Solicitud Enviada a WIN
            else if (currentStage === 13) targetStage = 14; // Validación BO 2 -> Ficha de Datos Enviada a WIN
            
            if (targetStage !== currentStage) {
              const originalStage = currentStage;
              setCards(cards.map(c => c.id === selectedCard.id ? { ...c, stage: targetStage } : c));
              try {
                const { opportunitiesService } = await import('../../services/opportunities.service');
                await opportunitiesService.transitionStage(String(selectedCard.id), targetStage, towersData ? { towersData } as any : undefined, true);
                toast.success('¡Validación aprobada y enviada al proceso asíncrono!');
                
                setTimeout(() => {
                  fetchCards();
                }, 5500);
              } catch (error) {
                toast.error('Error de red. Revirtiendo validación...');
                setCards(cards.map(c => c.id === selectedCard.id ? { ...c, stage: originalStage } : c));
              }
            }
            setSelectedCard(null);
          }}
        />
      )}

      {closingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className={`text-xl font-bold mb-4 ${closingStage === 18 ? 'text-green-600' : 'text-red-600'}`}>
              {closingStage === 18 ? 'Confirmar Ganada' : 'Declarar Pérdida'}
            </h2>
            <p className="text-gray-600 mb-6">Estás a punto de cerrar la oportunidad <strong>{closingCard.property?.nombreProyecto || closingCard.title}</strong>.</p>
            
            {closingStage === 19 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo de Caída (Obligatorio)</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={lostReason} 
                  onChange={e => setLostReason(e.target.value)}
                >
                  <option value="">Seleccione un motivo...</option>
                  <option value="Inviable técnicamente">Inviable técnicamente</option>
                  <option value="Rechazo de Junta Directiva">Rechazo de Junta Directiva</option>
                  <option value="Demasiado caro">Demasiado caro</option>
                  <option value="Perdido a competencia">Perdido a competencia</option>
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                onClick={() => setClosingCard(null)}
              >
                Cancelar
              </button>
              <button 
                className={`px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm ${closingStage === 18 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={confirmClosing}
              >
                {closingStage === 18 ? 'Completar Habilitación' : 'Archivar Oportunidad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
