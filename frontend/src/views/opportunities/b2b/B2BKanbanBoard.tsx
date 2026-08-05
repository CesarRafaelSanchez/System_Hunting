import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, LayoutGrid, List, Download, Upload, MoreVertical, Plus, Search, Filter, SlidersHorizontal, Trash2, Save, AlertCircle, Settings, Layers, Edit2 } from 'lucide-react';
import { DndContext, closestCorners, useSensor, useSensors, PointerSensor, TouchSensor, DragOverlay } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { OpportunitySplitView } from './B2BSplitView';
import { OpportunitiesTable } from '../../backoffice/OpportunitiesTable';
import { useAuthStore } from '../../../store/useAuthStore';
import { toast } from 'sonner';
import { fetchApi } from '../../../services/api.client';
import { NewVentaB2BModal } from '../../../components/opportunities/NewVentaB2BModal';
import { ImportExportExcelModal } from '../../../components/opportunities/ImportExportExcelModal';
import * as XLSX from 'xlsx';

// Componente Tarjeta Sortable
function SortableCard({ id, card, onClick, isDragDisabled, role, onActionClick, companiesList, onCompanyChange }: any) {
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: isDragDisabled,
    data: { card }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragDisabled ? 'pointer' : 'grab'
  };

  
  const vf = card.ventaFija || {};
  const districtName = typeof vf.distrito === 'string' ? vf.distrito : vf.distrito?.nombre || '-';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...(!isDragDisabled ? listeners : {})} 
      {...(!isDragDisabled ? attributes : {})}
      onClick={() => onClick(card)}
      className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all mb-3 text-slate-800 ${isDragging ? 'z-50 ring-2 ring-blue-500/20' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[200px]" title={vf.razonSocial || card.title}>
            {vf.razonSocial || card.title || 'SIN RAZÓN SOCIAL'}
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">
              RUC: {vf.ruc || 'SIN RUC'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide truncate max-w-[150px]">
              Servicio: {vf.tipoTecnologia || '-'} / {vf.tipoPlay || '-'}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isEditingCompany ? (
            <select 
              className="text-[10px] bg-slate-50 border border-slate-200 mt-0.5 rounded px-1 py-0.5 outline-none text-slate-600" 
              value={card.companyId}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                 setIsEditingCompany(false);
                 if (onCompanyChange) onCompanyChange(card.id, e.target.value);
              }}
              onBlur={() => setIsEditingCompany(false)}
            >
               {companiesList?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          ) : (
            <div className="flex items-center gap-1">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                card.companyId || card.company?.name
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
                {companiesList?.find((c: any) => c.id === card.companyId)?.name || card.company?.name || 'SIN EMPRESA'}
              </span>
              {(role === 'ACCOUNT_ADMIN' || role === 'BACKOFFICE' || role === 'BACKOFFICE_VENTAS') && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingCompany(true); }}
                  className="text-slate-400 hover:text-blue-500"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-50 my-2"></div>

      <div className="flex flex-wrap gap-1 mb-2">
        {(role === 'SUPERVISOR_VENTAS' || role === 'ACCOUNT_ADMIN' || role === 'BACKOFFICE' || role === 'BACKOFFICE_VENTAS') && (
          <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-100 truncate max-w-[170px]" title={card.createdByUserName || card.currentOwnerUser?.fullName}>
            👤 {card.createdByUserName || card.currentOwnerUser?.fullName || 'Asesor'}
          </span>
        )}
        {parseFloat(vf.cargoFijoSinIgv || 0) >= 1000 && (
          <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">
            ⭐ High-Ticket
          </span>
        )}
        {(() => {
          if (!card.currentStageEnteredAt) return null;
          const timeMs = new Date().getTime() - new Date(card.currentStageEnteredAt).getTime();
          const d = Math.floor(timeMs / (1000 * 60 * 60 * 24));
          const h = Math.floor((timeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const isStuck = d >= 5;
          return (
            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${isStuck ? 'bg-red-100 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              ⏱️ {d > 0 ? `${d}d ${h}h` : `${h}h`}
            </span>
          );
        })()}
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500">
        <div>Distrito: <span className="font-semibold text-slate-700 uppercase">{districtName}</span></div>
        <div className="font-semibold text-slate-800">
          S/. {parseFloat(vf.cargoFijoSinIgv || 0).toFixed(2)}
        </div>
      </div>

      {role === 'HUNTER' && (card.stage === 3 || card.stage === 11) && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick('asignacion', card.id);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-[10px] transition-colors uppercase tracking-wider"
          >
            Llenar Formulario
          </button>
        </div>
      )}

      {/* Botón Dar de Baja para el tramo postventa (etapa >= 14 y < 20) */}
      {role !== 'HUNTER' && card.stage >= 14 && card.stage < 20 && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActionClick('baja', card);
            }}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-1.5 rounded-lg text-[10px] transition-colors uppercase tracking-wider"
          >
            Dar de Baja
          </button>
        </div>
      )}
    </div>
  );
}

// Componente Columna del Kanban
function KanbanColumn({ stageIndex, title, stageObj, isDraggingActive, cards, onCardClick, role, onActionClick, companiesList, onCompanyChange }: any) {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);

  const checkPermission = (position: number, r: string) => {
    const isVendedor = r === 'ASESOR_VENTAS' || r === 'HUNTER';
    const isSupervisor = r === 'SUPERVISOR_VENTAS';
    const isPostventa = r === 'POSTVENTA';
    const isBO = r === 'BACKOFFICE' || r === 'BACKOFFICE_VENTAS';
    const isAdmin = r === 'ACCOUNT_ADMIN' || r === 'ADMIN' || r === 'AGENCY_ADMIN';

    const matrix: Record<number, string[]> = {
      0: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      1: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      2: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      3: ['BO', 'Admin'],
      4: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      5: ['Vendedor', 'Supervisor', 'BO', 'Admin'],
      6: ['BO', 'Admin'],
      7: ['BO', 'Admin'],
      8: ['BO', 'Admin'],
      9: ['BO', 'Admin'],
      10: ['BO', 'Admin'],
      11: ['BO', 'Admin'],
      12: ['Supervisor', 'BO', 'Admin'],
      13: ['BO', 'Admin'],
      14: ['BO', 'Admin'],
      15: ['Postventa', 'BO', 'Admin'],
      16: ['Postventa', 'BO', 'Admin'],
      17: ['Postventa', 'BO', 'Admin'],
      18: ['Postventa', 'BO', 'Admin'],
      19: ['Postventa', 'BO', 'Admin'],
      20: ['Postventa', 'BO', 'Admin'],
    };

    const allowedRoles = matrix[position] || [];
    if (isVendedor && allowedRoles.includes('Vendedor')) return true;
    if (isSupervisor && allowedRoles.includes('Supervisor')) return true;
    if (isPostventa && allowedRoles.includes('Postventa')) return true;
    if (isBO && allowedRoles.includes('BO')) return true;
    if (isAdmin && allowedRoles.includes('Admin')) return true;
    return false;
  };

  let hasPermission = false;
  if (role === 'HUNTER') {
    hasPermission = false;
  } else {
    hasPermission = checkPermission(stageIndex, role || '');
  }
  
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `col-${stageIndex}`, data: { stageIndex }, disabled: isCollapsed || (isDraggingActive && !hasPermission) });

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { rootMargin: '200px' });
    
    if (colRef.current) observer.observe(colRef.current);
    return () => observer.disconnect();
  }, []);

  const getHeaderStyles = (index: number) => {
    if ([0, 1, 2, 4, 5].includes(index)) return 'bg-blue-50/80 border-t-4 border-blue-500';
    if ([3, 6, 7, 8, 9, 10, 11, 13, 14].includes(index)) return 'bg-purple-50/80 border-t-4 border-purple-500';
    if ([12].includes(index)) return 'bg-amber-50/80 border-t-4 border-amber-500';
    if (index >= 15 && index <= 20) return 'bg-emerald-50/80 border-t-4 border-emerald-500';
    return 'bg-gray-50/80 border-t-4 border-gray-400';
  };

  const getDropZoneStyle = () => {
    if (!isDraggingActive) return 'bg-transparent';
    if (!hasPermission) return 'opacity-30 cursor-not-allowed bg-slate-100/50';
    if (isOver) return 'border-2 border-dashed border-emerald-400 bg-emerald-50/50 rounded-xl';
    return 'border-2 border-dashed border-emerald-300/50 bg-emerald-50/20 rounded-xl';
  };

  const headerStyles = getHeaderStyles(stageIndex);

  return (
    <div ref={colRef} className={`flex-shrink-0 flex flex-col rounded-xl transition-all duration-300 border-none overflow-hidden ${isCollapsed ? `w-14 h-full ${headerStyles}` : 'w-80 h-full bg-transparent'}`}>
      <div className={`p-3 flex flex-col gap-2 sticky top-0 z-10 ${isCollapsed ? 'bg-transparent' : `${headerStyles} rounded-xl mb-3 shadow-sm`}`}>
        <div className="flex justify-between items-center">
          {!isCollapsed && <h3 className="font-bold text-slate-800 text-sm truncate pr-2" title={title}>{title}</h3>}
          <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2 w-full pt-1' : 'gap-2'}`}>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-white text-slate-700 shadow-sm text-xs">{cards.length}</span>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="hover:opacity-70 transition-colors p-1 rounded-md text-slate-500" title={isCollapsed ? "Expandir" : "Contraer"}>
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col gap-1 items-start mt-1">
            {hasPermission ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1"><span className="text-[10px]">🔓</span> Permitido</span>
            ) : (
              <span className="bg-slate-200 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-slate-300 flex items-center gap-1"><span className="text-[10px]">🔒</span> Solo Lectura</span>
            )}
            { (stageObj?.code === 'S7' || stageObj?.code === 'S15') && (
               <span className="bg-red-50 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Requiere Validación BO</span>
            )}
            { (stageObj?.isLost || title === 'Sin Factibilidad 1') && (
               <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Motivo Obligatorio</span>
            )}
          </div>
        )}
      </div>
      
      {isVisible && !isCollapsed && (
        <div 
          ref={setDropRef} 
          className={`flex-1 overflow-y-auto transition-colors ${getDropZoneStyle()}`}
        >
          <SortableContext items={cards.map((c: any) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((c: any) => (
              <SortableCard key={c.id} id={c.id} card={c} onClick={onCardClick} isDragDisabled={onCardClick.isDragDisabled} role={role} onActionClick={onActionClick} companiesList={companiesList} onCompanyChange={onCompanyChange} />
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
  const [closingStageIndex, setClosingStageIndex] = useState<number | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [activeCardData, setActiveCardData] = useState<any>(null);
  const [companiesList, setCompaniesList] = useState<any[]>([]);

  // Estados del Pipeline
  const [activePipeline, setActivePipeline] = useState<any | null>(null);
  const [loadingPipeline, setLoadingPipeline] = useState<boolean>(true);
  const [isEditingPipeline, setIsEditingPipeline] = useState<boolean>(false);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineCode, setPipelineCode] = useState('');
  const [pipelineDesc, setPipelineDesc] = useState('');
  const [pipelineStages, setPipelineStages] = useState<any[]>([]);
  const [savingPipeline, setSavingPipeline] = useState(false);

  // Modales de Oportunidad
  const [showNewOppModal, setShowNewOppModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Estados para búsqueda, filtros avanzados y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    canal: '',
    distrito: '',
    tipoConstruccion: '',
    rangoHogares: '',
    hunterName: ''
  });
  const [sortOption, setSortOption] = useState<string>('');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const filtersRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  const loadActivePipeline = async () => {
    try {
      setLoadingPipeline(true);
      const data = await fetchApi<any | null>('/pipelines/active');
      if (data) {
        setActivePipeline(data);
        setPipelineName(data.name);
        setPipelineCode(data.code);
        setPipelineDesc(data.description || '');
        setPipelineStages(data.stages);
      } else {
        setActivePipeline(null);
        setPipelineName('');
        setPipelineCode('');
        setPipelineDesc('');
        // Inicializar con un template mínimo para onboarding cómodo
        setPipelineStages([
          { name: 'Edificio Prospectado', code: 'PROS', position: 1, stageType: 'STANDARD', isInitial: true, isFinal: false, isWon: false, isLost: false },
          { name: 'Validación Back Office', code: 'VAL', position: 2, stageType: 'STANDARD', isInitial: false, isFinal: false, isWon: false, isLost: false },
          { name: 'Habilitación Completa', code: 'HAB', position: 3, stageType: 'WON', isInitial: false, isFinal: true, isWon: true, isLost: false },
          { name: 'Hunting Perdido', code: 'PERD', position: 4, stageType: 'LOST', isInitial: false, isFinal: true, isWon: false, isLost: true }
        ]);
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
      toast.error('Error al cargar la configuración del embudo');
    } finally {
      setLoadingPipeline(false);
    }
  };

  useEffect(() => {
    loadActivePipeline();
    const loadCompanies = async () => {
      try {
        const res = await fetchApi<any[]>('/companies');
        setCompaniesList(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error('Error loading companies', err);
      }
    };
    if (user?.role === 'ACCOUNT_ADMIN' || user?.role === 'BACKOFFICE' || user?.role === 'BACKOFFICE_VENTAS' || user?.role === 'POSTVENTA') {
      loadCompanies();
    }
  }, []);

  useEffect(() => {
    if (activePipeline) {
      fetchCards();
    }
  }, [activePipeline]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFiltersDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false);
      }
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Extraer valores únicos dinámicamente de las tarjetas
  const uniqueDistritos = React.useMemo(() => {
    const distritos = new Set<string>();
    cards.forEach(c => {
      const vf = c.ventaFija || {};
      const dist = vf.distrito;
      if (dist) {
        if (typeof dist === 'string') distritos.add(dist);
        else if (dist.nombre) distritos.add(dist.nombre);
      }
    });
    return Array.from(distritos).sort();
  }, [cards]);

  const uniqueHunters = React.useMemo(() => {
    const hunters = new Set<string>();
    cards.forEach(c => {
      const vf = c.ventaFija || {};
      const name = vf.ejecutivo || c.createdByUserName; // fallback
      if (name) hunters.add(name);
    });
    return Array.from(hunters).sort();
  }, [cards]);

  // Lógica de filtrado y ordenado
  const filteredAndSortedCards = React.useMemo(() => {
    let result = [...cards];

    // 1. Búsqueda
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(card => {
        const vf = card.ventaFija || {};
        const title = (vf.nombreProyecto || card.title || '').toLowerCase();
        const code = (card.code || '').toLowerCase();
        const address = `${vf.tipoVia || ''} ${vf.nombreVia || ''} ${vf.numeracionMunicipal || vf.numeroVia || ''}`.toLowerCase();
        const ejecutivo = (vf.ejecutivo || '').toLowerCase();
        const dist = vf.distrito;
        const distrito = (typeof dist === 'string' ? dist : dist?.nombre || '').toLowerCase();
        return title.includes(term) || code.includes(term) || address.includes(term) || ejecutivo.includes(term) || distrito.includes(term);
      });
    }

    // 2. Filtros avanzados
    if (filters.canal) {
      result = result.filter(card => (card.canalHunting || 'FUTURA') === filters.canal);
    }
    if (filters.distrito) {
      result = result.filter(card => {
        const dist = card.property?.distrito;
        const distName = typeof dist === 'string' ? dist : dist?.nombre || '';
        return distName.toLowerCase() === filters.distrito.toLowerCase();
      });
    }
    if (filters.tipoConstruccion) {
      result = result.filter(card => {
        const vf = card.ventaFija || {};
        const tipo = vf.tipoConstruccion || vf.estreno || vf.tipoEdificio || 'MODERNO';
        return tipo.toLowerCase() === filters.tipoConstruccion.toLowerCase();
      });
    }
    if (filters.rangoHogares) {
      result = result.filter(card => {
        const vf = card.ventaFija || {};
        let totalHogares = vf.totalHogares || vf.numeroHogares || 0;
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

        if (filters.rangoHogares === '0-50') return vf.cargoFijoSinIgv <= 50;
        if (filters.rangoHogares === '51-100') return vf.cargoFijoSinIgv >= 51 && vf.cargoFijoSinIgv <= 100;
        if (filters.rangoHogares === '101+') return vf.cargoFijoSinIgv > 100;
        return true;
      });
    }
    if (filters.hunterName) {
      result = result.filter(card => {
        const vf = card.ventaFija || {};
        const name = vf.ejecutivo || card.createdByUserName;
        return (name || '').toLowerCase() === filters.hunterName.toLowerCase();
      });
    }

    // 3. Ordenación
    if (sortOption) {
      result.sort((a, b) => {
        const vfA = a.ventaFija || {};
        const vfB = b.ventaFija || {};

        if (sortOption === 'name_asc') {
          const titleA = (vfA.razonSocial || a.title || '').toLowerCase();
          const titleB = (vfB.razonSocial || b.title || '').toLowerCase();
          return titleA.localeCompare(titleB);
        }
        if (sortOption === 'name_desc') {
          const titleA = (vfA.razonSocial || a.title || '').toLowerCase();
          const titleB = (vfB.razonSocial || b.title || '').toLowerCase();
          return titleB.localeCompare(titleA);
        }
        if (sortOption === 'cargo_desc' || sortOption === 'cargo_asc') {
          const getHogares = (card: any) => {
            const vf = card.ventaFija || {};
            let total = vf.totalHogares || vf.numeroHogares || 0;
            if (!total && card.towersData) {
              total = card.towersData.reduce((acc: number, t: any) => {
                const pisos = parseInt(t.pisos_torre) || 0;
                if (!t.hogares_por_piso) return acc;
                if (t.hogares_por_piso.includes(',')) {
                  return acc + t.hogares_por_piso.split(',').reduce((s: number, hp: string) => s + (parseInt(hp) || 0), 0);
                }
                return acc + (pisos * (parseInt(t.hogares_por_piso) || 0));
              }, 0);
            }
            return Number(total) || 0;
          };
          const hogaresA = getHogares(a);
          const hogaresB = getHogares(b);
          return sortOption === 'cargo_desc' ? hogaresB - hogaresA : hogaresA - hogaresB;
        }
        if (sortOption === 'date_desc') {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        }
        if (sortOption === 'date_asc') {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateA - dateB;
        }
        return 0;
      });
    }

    return result;
  }, [cards, searchTerm, filters, sortOption]);

  const handleExport = () => {
    if (filteredAndSortedCards.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    const exportData = filteredAndSortedCards.map(c => {
      const vf = c.ventaFija || {};
      const s = activePipeline?.stages?.[c.stage] || { name: 'Desconocido' };
      const company = companiesList.find(comp => comp.id === c.companyId);
      
      return {
        'Código': c.code,
        'Proyecto': vf.nombreProyecto || c.title || '-',
        'Dirección': `${vf.tipoVia || ''} ${vf.nombreVia || ''} ${vf.numeracionMunicipal || ''}`.trim(),
        'Distrito': typeof vf.distrito === 'string' ? vf.distrito : vf.distrito?.nombre || '-',
        'Etapa': s.name,
        'Empresa Asignada': company?.name || '-',
        'Canal': c.canalHunting || '-',
        'Responsable': vf.hunterPrincipal?.firstName ? `${vf.hunterPrincipal.firstName} ${vf.hunterPrincipal.lastName}` : 'No asignado',
        'Fecha Creación': new Date(c.createdAt).toLocaleDateString()
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Oportunidades");
    XLSX.writeFile(wb, `Oportunidades_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Archivo descargado correctamente');
  };

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
    if (!activePipeline) return;
    try {
      const { ventasService } = await import('../../../services/ventas.service');
      const data = await ventasService.getAll();
      const opps = data as any[];
      const mappedOpps = opps.map(o => {
        const stg = activePipeline.stages.find((s: any) => s.id === o.currentStageId);
        const stageIndex = stg ? stg.position - 1 : 0;
        return {
          ...o,
          stage: stageIndex,
          title: o.title || o.ventaFija?.razonSocial || o.code,
          subtitle: o.subtitle || o.ventaFija?.ruc || 'Sin RUC'
        };
      });
      
      const { useAuthStore } = await import('../../../store/useAuthStore');
      const currentUser = useAuthStore.getState().user;
      
      if (currentUser?.role === 'HUNTER' || currentUser?.role === 'ASESOR_VENTAS') {
        setCards(mappedOpps.filter(c => c.createdByUserId === currentUser.id || c.currentOwnerUserId === currentUser.id));
      } else if (currentUser?.role === 'POSTVENTA') {
        setCards(mappedOpps.filter(c => (c.currentStage?.position >= 15) || (c.stage >= 14)));
      } else {
        setCards(mappedOpps);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    }
  };

  const handleCompanyChange = async (cardId: string, newCompanyId: string) => {
    try {
      const { ventasService } = await import('../../../services/ventas.service');
      await ventasService.updateForms(cardId, { companyId: newCompanyId });
      toast.success('Empresa actualizada');
      fetchCards();
    } catch (e) {
      toast.error('Error al cambiar empresa');
    }
  };

  useEffect(() => {
    if (activePipeline) {
      fetchCards();
    }
  }, [activePipeline]);

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

    if (targetStage === -1 || !activePipeline) return;

    const targetStageObj = activePipeline.stages[targetStage];
    if (!targetStageObj) return;

    const activeCard = cards.find(c => c.id === active.id);
    if (!activeCard || activeCard.stage === targetStage) return;
    const originalStage = activeCard.stage;

    // Etapa Ganada / Perdida detectada dinámicamente por bandera
    if (targetStageObj.isWon || targetStageObj.isLost || targetStageObj.name === 'Sin Factibilidad 1') {
      setClosingCard(activeCard);
      setClosingStageIndex(targetStage);
      return; 
    }

    setCards(cards.map(c => c.id === active.id ? { ...c, stage: targetStage } : c));

    try {
      const { ventasService } = await import('../../../services/ventas.service');
      await ventasService.transitionStage(String(active.id), targetStageObj.id);
      
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
    if (!activePipeline || closingStageIndex === null) return;
    const targetStageObj = activePipeline.stages[closingStageIndex];
    if (!targetStageObj) return;

    if ((targetStageObj.isLost || targetStageObj.name === 'Sin Factibilidad 1') && !lostReason) {
      toast.error('Debe ingresar un motivo de caída');
      return;
    }

    const originalStage = closingCard.stage;
    setCards(cards.map(c => c.id === closingCard.id ? { ...c, stage: closingStageIndex } : c));
    const currentCard = closingCard;
    
    setClosingCard(null);
    setClosingStageIndex(null);
    setLostReason('');

    try {
      const { ventasService } = await import('../../../services/ventas.service');
      await ventasService.transitionStage(String(currentCard.id), targetStageObj.id, lostReason);
      if (targetStageObj.isWon) {
        toast.success('Oportunidad Habilitada con Éxito.');
      } else {
        toast.success('Oportunidad marcada como Perdida.');
      }
    } catch (error) {
      toast.error('Error de red. Revirtiendo cierre...');
      setCards(cards.map(c => c.id === currentCard.id ? { ...c, stage: originalStage } : c));
    }
  };

  const handleActionClick = (type: string, data: any) => {
    if (type === 'asignacion') {
      navigate('/hunter/oportunidades/asignacion', { state: { targetId: data } });
    } else if (type === 'ficha') {
      navigate('/hunter/oportunidades/ficha-tecnica', { state: { targetId: data } });
    } else if (type === 'baja') {
      const card = data;
      if (activePipeline) {
        // Encontrar la etapa que tiene isLost=true y posición >= 15 (Baja de Cliente)
        const bajaStageIndex = activePipeline.stages.findIndex((s: any) => s.isLost && s.position >= 15);
        if (bajaStageIndex !== -1) {
          setClosingCard(card);
          setClosingStageIndex(bajaStageIndex);
        } else {
          toast.error('No se encontró la etapa de baja en el embudo.');
        }
      }
    }
  };

  // Lógica del Formulario de Pipeline
  const handleAddStage = (index: number) => {
    const newStage = {
      name: '',
      code: '',
      position: index + 1,
      stageType: 'STANDARD',
      isInitial: false,
      isFinal: false,
      isWon: false,
      isLost: false
    };
    const updated = [...pipelineStages];
    updated.splice(index, 0, newStage);
    updated.forEach((s, i) => s.position = i + 1);
    setPipelineStages(updated);
  };

  const handleRemoveStage = (index: number) => {
    if (pipelineStages.length <= 1) {
      toast.error('El embudo debe tener al menos una etapa.');
      return;
    }
    const updated = pipelineStages.filter((_, i) => i !== index);
    updated.forEach((s, i) => s.position = i + 1);
    setPipelineStages(updated);
  };

  const handleStageFieldChange = (index: number, field: string, value: any) => {
    const updated = [...pipelineStages];
    const stage = { ...updated[index] };

    if (field === 'isInitial') {
      updated.forEach((s, i) => s.isInitial = i === index ? value : false);
    } else if (field === 'isWon') {
      updated.forEach((s, i) => s.isWon = i === index ? value : false);
      if (value) {
        stage.isLost = false;
        stage.isFinal = true;
      }
    } else if (field === 'isLost') {
      stage.isLost = value;
      if (value) {
        stage.isWon = false;
        stage.isFinal = true;
      }
    } else {
      (stage as any)[field] = value;
    }

    if (field !== 'isInitial' && field !== 'isWon') {
      updated[index] = stage;
    }

    setPipelineStages(updated);
  };

  const handleSavePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pipelineName.trim() || !pipelineCode.trim()) {
      toast.error('El nombre y código del pipeline son obligatorios.');
      return;
    }

    for (let i = 0; i < pipelineStages.length; i++) {
      if (!pipelineStages[i].name.trim() || !pipelineStages[i].code.trim()) {
        toast.error(`La etapa ${i + 1} debe tener nombre y código.`);
        return;
      }
    }

    const initials = pipelineStages.filter(s => s.isInitial);
    const wons = pipelineStages.filter(s => s.isWon);
    const losts = pipelineStages.filter(s => s.isLost);

    if (initials.length !== 1) {
      toast.error('Debe configurar exactamente UNA etapa inicial (Génesis).');
      return;
    }
    if (wons.length !== 1) {
      toast.error('Debe configurar exactamente UNA etapa de Éxito/Ganada.');
      return;
    }
    if (losts.length < 1) {
      toast.error('Debe configurar al menos UNA etapa de Pérdida.');
      return;
    }

    setSavingPipeline(true);
    try {
      if (activePipeline) {
        // Actualizar
        await fetchApi(`/pipelines/${activePipeline.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pipelineName,
            code: pipelineCode,
            description: pipelineDesc,
            stages: pipelineStages.map(s => ({
              ...s,
              name: s.name.trim(),
              code: s.code.trim().toUpperCase()
            }))
          })
        });
        toast.success('Embudo comercial actualizado correctamente');
      } else {
        // Crear
        await fetchApi('/pipelines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pipelineName,
            code: pipelineCode.toUpperCase(),
            description: pipelineDesc,
            stages: pipelineStages.map(s => ({
              ...s,
              name: s.name.trim(),
              code: s.code.trim().toUpperCase()
            }))
          })
        });
        toast.success('Embudo comercial creado exitosamente');
      }
      setIsEditingPipeline(false);
      loadActivePipeline();
    } catch (error: any) {
      const msg = error.data?.message || error.message || 'Error al guardar la configuración';
      toast.error(msg);
    } finally {
      setSavingPipeline(false);
    }
  };

  if (loadingPipeline) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm animate-pulse">Cargando configuración del embudo comercial...</div>
      </div>
    );
  }

  const hasPipeline = !!activePipeline;
  const showConfigForm = !hasPipeline || isEditingPipeline;

  // RENDERIZAR FORMULARIO DE CONFIGURACIÓN / EDICIÓN
  if (showConfigForm) {
    if (!hasPipeline && user?.role !== 'ACCOUNT_ADMIN') {
      return (
        <div className="p-12 bg-white rounded-2xl shadow-sm border border-gray-200 text-center max-w-lg mx-auto mt-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-blue-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Embudo comercial no configurado</h2>
          <p className="text-gray-500 text-sm">
            Actualmente no hay ningún pipeline de ventas activo en el sistema. Por favor, póngase en contacto con el administrador para que realice la primera configuración.
          </p>
        </div>
      );
    }

    return (
      <div className="p-6 bg-slate-50 min-h-full max-w-4xl mx-auto rounded-2xl border border-gray-200 mt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-500/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {!hasPipeline ? 'Configurar Primer Embudo de Ventas (Pipeline)' : 'Editar Estructura de Embudo Comercial'}
            </h1>
            <p className="text-gray-500 text-xs mt-1">
              {!hasPipeline 
                ? 'Define la estructura de etapas de venta para comenzar a prospectar predios.'
                : 'Administra, añade, reordena o elimina las etapas del flujo comercial.'}
            </p>
          </div>
        </div>

        {!hasPipeline && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <span className="font-bold">Primera vez en el CRM:</span> Para poder registrar predios e iniciar el Kanban, debes crear tu embudo de ventas. Hemos pre-cargado un diseño base, pero puedes modificarlo libremente antes de guardarlo.
            </div>
          </div>
        )}

        <form onSubmit={handleSavePipeline} className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              Detalles Generales del Embudo
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nombre del Embudo</label>
                <input
                  type="text"
                  value={pipelineName}
                  onChange={(e) => setPipelineName(e.target.value)}
                  placeholder="Ej. Embudo Comercial Principal"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Código / Prefijo</label>
                <input
                  type="text"
                  value={pipelineCode}
                  onChange={(e) => setPipelineCode(e.target.value)}
                  placeholder="Ej. ECP"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  required
                  maxLength={10}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Descripción (Opcional)</label>
              <textarea
                value={pipelineDesc}
                onChange={(e) => setPipelineDesc(e.target.value)}
                placeholder="Describe el propósito o alcance de este embudo comercial..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all h-16 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                Secuencia de Etapas
              </h2>
              <button
                type="button"
                onClick={() => handleAddStage(pipelineStages.length)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-1.5 px-3 rounded-lg text-[11px] transition-all flex items-center gap-1.5 border border-blue-100"
              >
                <Plus className="w-3 h-3" />
                Añadir Etapa al Final
              </button>
            </div>

            <div className="space-y-2 relative">
              {pipelineStages.map((stage, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <div className="group relative flex justify-center -my-1 h-3 z-10">
                      <button
                        type="button"
                        onClick={() => handleAddStage(idx)}
                        className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 shadow-md transition-all scale-75 group-hover:scale-100"
                        title="Insertar etapa aquí"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <div className="w-full border-t border-dashed border-gray-200 group-hover:border-blue-400 self-center"></div>
                    </div>
                  )}

                  <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm flex items-center gap-3 hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs shrink-0">
                      {stage.position}
                    </div>

                    <div className="grid grid-cols-4 gap-3 flex-grow">
                      <div>
                        <input
                          type="text"
                          value={stage.name}
                          onChange={(e) => handleStageFieldChange(idx, 'name', e.target.value)}
                          placeholder="Nombre Etapa"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={stage.code}
                          onChange={(e) => handleStageFieldChange(idx, 'code', e.target.value)}
                          placeholder="Código"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          maxLength={10}
                        />
                      </div>
                      <div>
                        <select
                          value={stage.stageType}
                          onChange={(e) => handleStageFieldChange(idx, 'stageType', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="STANDARD">Estándar</option>
                          <option value="WON">Ganado / Éxito</option>
                          <option value="LOST">Perdido / Caído</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-3 justify-around">
                        <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                          <span className="text-[8px] font-bold text-gray-400 uppercase">Inicial</span>
                          <input
                            type="checkbox"
                            checked={stage.isInitial}
                            onChange={(e) => handleStageFieldChange(idx, 'isInitial', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </label>

                        <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                          <span className="text-[8px] font-bold text-gray-400 uppercase">Éxito</span>
                          <input
                            type="checkbox"
                            checked={stage.isWon}
                            onChange={(e) => handleStageFieldChange(idx, 'isWon', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-green-600 focus:ring-green-500 border-gray-300"
                          />
                        </label>

                        <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none">
                          <span className="text-[8px] font-bold text-gray-400 uppercase">Perdida</span>
                          <input
                            type="checkbox"
                            checked={stage.isLost}
                            onChange={(e) => handleStageFieldChange(idx, 'isLost', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-red-600 focus:ring-red-500 border-gray-300"
                          />
                        </label>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStage(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar Etapa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {hasPipeline && (
              <button
                type="button"
                onClick={() => setIsEditingPipeline(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-6 rounded-xl text-xs transition-all"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={savingPipeline}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {savingPipeline ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // RENDERIZAR TABLERO KANBAN
  return (
    <div className="flex flex-col relative bg-white rounded-xl border border-gray-200 shadow-sm h-[calc(100vh-112px)] overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center z-30">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar clientes potenciales" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-200 bg-white rounded-2xl text-sm focus:border-ghl-lightBlue focus:ring-2 focus:ring-ghl-lightBlue outline-none transition-all w-64"
            />
          </div>
          
          {/* Filtros avanzados */}
          <div className="relative" ref={filtersRef}>
            <button 
              onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
              className={`rounded-full border px-4 py-1.5 text-sm flex items-center space-x-2 shadow-sm transition-colors ${
                Object.values(filters).some(Boolean) 
                  ? 'border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100' 
                  : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 text-current" />
              <span>Filtros avanzados</span>
              {Object.values(filters).some(Boolean) && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
            {showFiltersDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200/80 p-4 z-50 space-y-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Canal de Prospección</label>
                  <select 
                    value={filters.canal} 
                    onChange={e => setFilters({ ...filters, canal: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-1.5 bg-white outline-none"
                  >
                    <option value="">Todos los canales</option>
                    <option value="FUTURA">FUTURA</option>
                    <option value="NOVACORE">NOVACORE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Distrito</label>
                  <select 
                    value={filters.distrito} 
                    onChange={e => setFilters({ ...filters, distrito: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-1.5 bg-white outline-none"
                  >
                    <option value="">Todos los distritos</option>
                    {uniqueDistritos.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Responsable (Hunter)</label>
                  <select 
                    value={filters.hunterName} 
                    onChange={e => setFilters({ ...filters, hunterName: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-lg p-1.5 bg-white outline-none"
                  >
                    <option value="">Todos los responsables</option>
                    {uniqueHunters.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setFilters({ canal: '', distrito: '', tipoConstruccion: '', rangoHogares: '', hunterName: '' });
                      setShowFiltersDropdown(false);
                    }}
                    className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ordenación */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`rounded-full border px-4 py-1.5 text-sm flex items-center space-x-2 shadow-sm transition-colors ${
                sortOption 
                  ? 'border-blue-200 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100' 
                  : 'border-gray-200 bg-white text-slate-700 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-current" />
              <span>Ordenar</span>
              {sortOption && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
            {showSortDropdown && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in duration-200">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ordenar por</div>
                <div className="space-y-0.5">
                  {[
                    { value: '', label: 'Por defecto' },
                    { value: 'name_asc', label: 'Nombre Proyecto (A-Z)' },
                    { value: 'name_desc', label: 'Nombre Proyecto (Z-A)' },
                    { value: 'hogares_desc', label: 'Hogares (Mayor a menor)' },
                    { value: 'hogares_asc', label: 'Hogares (Menor a mayor)' },
                    { value: 'date_desc', label: 'Fecha de creación (Reciente)' },
                    { value: 'date_asc', label: 'Fecha de creación (Antiguo)' }
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortOption(opt.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        sortOption === opt.value 
                          ? 'bg-blue-50 text-blue-700 font-semibold' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {sortOption === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
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

          <button onClick={() => setShowImportModal(true)} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-ghl-blue font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Download className="w-4 h-4" /> Importar
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-ghl-blue font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Upload className="w-4 h-4" /> Exportar
          </button>
          <button onClick={() => navigate('/sales/oportunidades/nueva', { state: { openForm: true } })} className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm">
            <Plus className="w-4 h-4" /> Añadir oportunidad
          </button>

          {/* Menú de Tres Puntos (Solo para ADMIN) */}
          <div className="relative animate-in fade-in" ref={adminMenuRef}>
            <button 
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showAdminMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">Acciones del Embudo</div>
                {user?.role === 'ACCOUNT_ADMIN' ? (
                  <button
                    onClick={() => {
                      setIsEditingPipeline(true);
                      setShowAdminMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Configurar Embudo</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 text-[11px] text-gray-400 italic">Sin acciones disponibles</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 scroll-smooth bg-slate-50">
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full items-start">
              {activePipeline.stages
                .filter((stage: any) => user?.role !== 'POSTVENTA' || stage.position >= 15)
                .map((stage: any) => {
                  const absoluteStageIndex = activePipeline.stages.findIndex((s: any) => s.id === stage.id);
                  return (
                    <KanbanColumn 
                      key={stage.id} 
                      stageIndex={absoluteStageIndex} 
                      title={stage.name} 
                      stageObj={stage}
                      isDraggingActive={!!activeCardData}
                      cards={filteredAndSortedCards.filter(c => c.stage === absoluteStageIndex)} 
                      onCardClick={Object.assign(setSelectedCard, { isDragDisabled: user?.role === 'HUNTER' })}
                      role={user?.role}
                      onActionClick={handleActionClick}
                      companiesList={companiesList}
                      onCompanyChange={handleCompanyChange}
                    />
                  );
                })}
            </div>
            <DragOverlay>
              {activeCardData ? <SortableCard card={activeCardData} isDragOverlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <OpportunitiesTable 
            cards={filteredAndSortedCards} 
            STAGES={activePipeline.stages
              .filter((stage: any) => user?.role !== 'POSTVENTA' || stage.position >= 15)
              .map((s: any) => s.name)} 
            onCardClick={setSelectedCard} 
            companiesList={companiesList}
            onCompanyChange={handleCompanyChange}
            userRole={user?.role}
          />
        </div>
      )}

      {selectedCard && (
        <OpportunitySplitView 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
          onSave={() => {
            fetchCards();
          }}
          onApprove={async (towersData) => {
            const currentStage = selectedCard.stage;
            let targetStage = currentStage;
            if (currentStage === 4 || currentStage === 5 || currentStage === 6) targetStage = 6;
            else if (currentStage === 12 || currentStage === 13 || currentStage === 14) targetStage = 14;
            
            if (targetStage !== currentStage && activePipeline) {
              const originalStage = currentStage;
              setCards(cards.map(c => c.id === selectedCard.id ? { ...c, stage: targetStage } : c));
              try {
                const { ventasService } = await import('../../../services/ventas.service');
                const targetStageObj = activePipeline.stages[targetStage];
                await ventasService.transitionStage(
                  String(selectedCard.id), 
                  targetStageObj.id, 
                  'Aprobación y transición por Validación Back Office', 
                  true, 
                  towersData
                );
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

      {closingCard && closingStageIndex !== null && activePipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className={`text-xl font-bold mb-4 ${activePipeline.stages[closingStageIndex].isWon ? 'text-green-600' : 'text-red-600'}`}>
              {activePipeline.stages[closingStageIndex].isWon ? 'Confirmar Ganada' : 'Declarar Pérdida'}
            </h2>
            <p className="text-gray-600 mb-6">Estás a punto de cerrar la oportunidad <strong>{closingCard.property?.nombreProyecto || closingCard.title}</strong>.</p>
            
            { (activePipeline.stages[closingStageIndex].isLost || activePipeline.stages[closingStageIndex].name === 'Sin Factibilidad 1') && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {activePipeline.stages[closingStageIndex].name === 'Baja de Cliente' ? 'Motivo de Baja (Obligatorio)' : 'Motivo de Caída (Obligatorio)'}
                </label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  value={lostReason} 
                  onChange={e => setLostReason(e.target.value)}
                >
                  <option value="">Seleccione un motivo...</option>
                  {activePipeline.stages[closingStageIndex].name === 'Baja de Cliente' ? (
                    <>
                      <option value="Cliente no paga">Cliente no paga</option>
                      <option value="Insatisfacción con el servicio">Insatisfacción con el servicio</option>
                      <option value="Se mudó / Cambio de dirección">Se mudó / Cambio de dirección</option>
                      <option value="Cancelación voluntaria">Cancelación voluntaria</option>
                      <option value="Problema técnico recurrente">Problema técnico recurrente</option>
                      <option value="Otro">Otro</option>
                    </>
                  ) : activePipeline.stages[closingStageIndex].name === 'Sin Factibilidad 1' ? (
                    <>
                      <option value="Caja saturada">Caja saturada</option>
                      <option value="Sin cobertura">Sin cobertura</option>
                      <option value="Fuera de zona">Fuera de zona</option>
                      <option value="Otro">Otro</option>
                    </>
                  ) : activePipeline.stages[closingStageIndex].name === 'Rechazo Oferta' ? (
                    <>
                      <option value="Cliente desiste de la compra.">Cliente desiste de la compra.</option>
                      <option value="Cliente contrató con otro operador.">Cliente contrató con otro operador.</option>
                      <option value="Cliente prefiere mantener su operador actual.">Cliente prefiere mantener su operador actual.</option>
                      <option value="Cliente no tiene interés en este momento.">Cliente no tiene interés en este momento.</option>
                      <option value="Cliente no responde el seguimiento.">Cliente no responde el seguimiento.</option>
                      <option value="Cliente solicita volver a contactar más adelante.">Cliente solicita volver a contactar más adelante.</option>
                      <option value="El cliente solicita una promoción no vigente.">El cliente solicita una promoción no vigente.</option>
                      <option value="Error en la propuesta enviada.">Error en la propuesta enviada.</option>
                    </>
                  ) : (
                    <>
                      <option value="Inviable técnicamente">Inviable técnicamente</option>
                      <option value="Rechazo de Junta Directiva">Rechazo de Junta Directiva</option>
                      <option value="Demasiado caro">Demasiado caro</option>
                      <option value="Perdido a competencia">Perdido a competencia</option>
                    </>
                  )}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                onClick={() => {
                  setClosingCard(null);
                  setClosingStageIndex(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className={`px-4 py-2 text-white rounded-lg transition-colors font-medium shadow-sm ${activePipeline.stages[closingStageIndex].isWon ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                onClick={confirmClosing}
              >
                {activePipeline.stages[closingStageIndex].isWon ? 'Completar Habilitación' : 'Archivar Oportunidad'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showNewOppModal && (
        <NewVentaB2BModal 
          isOpen={showNewOppModal} 
          onClose={() => setShowNewOppModal(false)} 
          onSuccess={() => fetchCards()} 
          companiesList={companiesList} 
        />
      )}

      {showImportModal && (
        <ImportExportExcelModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)} 
          onSuccess={() => fetchCards()} 
          companiesList={companiesList} 
        />
      )}
    </div>
  );
};
