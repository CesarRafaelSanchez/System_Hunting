import React, { useState } from 'react';

import { Edit2 } from 'lucide-react';

export const OpportunitiesTable: React.FC<{ cards: any[]; STAGES: string[]; onCardClick: (card: any) => void; companiesList?: any[]; onCompanyChange?: (cardId: string, companyId: string) => void; userRole?: string }> = ({ cards, STAGES, onCardClick, companiesList, onCompanyChange, userRole }) => {
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const totalPages = Math.ceil(cards.length / rowsPerPage) || 1;
  const currentCards = cards.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    const month = d.toLocaleString('es-ES', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const formatBool = (val: any) => {
    if (val === true || val === 'Sí' || val === 'Si' || val === 'SI') return 'Sí';
    if (val === false || val === 'No' || val === 'NO') return 'No';
    return val || '-';
  };

  return (
    <div className="flex flex-col h-full bg-white relative z-0">
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="p-3 w-12 text-center sticky left-0 bg-gray-50 z-30 shadow-[1px_0_0_0_#e5e7eb]"><input type="checkbox" className="rounded border-gray-300" /></th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider sticky left-12 bg-gray-50 z-30 shadow-[1px_0_0_0_#e5e7eb]">Proyecto / Edificio</th>
              
              {/* Empresa (Nueva Columna) */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-slate-100">Empresa</th>

              {/* Bloque Operativo */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">Cód OPP</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">Canal</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">Etapa Actual</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">Ejecutivo/Hunter</th>
              
              {/* Bloque Prospección */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-indigo-50/50">Resultado Visita</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-indigo-50/50">Detalle Visita</th>
              
              {/* Bloque Asignación */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-amber-50/50">Tipo Ingreso</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-amber-50/50">Tipo Edificio</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-amber-50/50">Estreno</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-amber-50/50">Dirección (Vía)</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-amber-50/50">Coordenadas</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-amber-50/50">Tipo Solicitud</th>

              {/* Bloque Contacto */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-green-50/50">Junta Directiva</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-green-50/50">Nombre Responsable</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-green-50/50">Cargo</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-green-50/50">Teléfono</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-green-50/50">Correo</th>

              {/* Bloque Técnico */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Dpto</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Provincia</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Distrito</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Urbanización</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Cod Postal</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Total Torres</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Total HPs</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Cl. Interesados</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Fecha Insp.</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-purple-50/50">Rango Horario</th>

              {/* Bloque Auditoría */}
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100/50">Creado El</th>
              <th className="p-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-100/50">Actualizado El</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {currentCards.map(c => {
              const p = c.property || {};
              const stageName = STAGES[c.stage] || 'Desconocido';
              const ownerName = p.ejecutivo || 'Hunter';
              
              const direccionCompleta = [p.tipoVia, p.nombreVia, p.numeroVia].filter(Boolean).join(' ');
              const totalTorres = p.numeroTorres || (c.towersData ? c.towersData.length : '-');
              const totalHps = p.totalHogares || p.numeroHogares || (c.towersData ? c.towersData.reduce((acc: number, t: any) => {
                const pisos = parseInt(t.pisos_torre) || 0;
                if (!t.hogares_por_piso) return acc;
                if (t.hogares_por_piso.includes(',')) {
                  return acc + t.hogares_por_piso.split(',').reduce((s: number, hp: string) => s + (parseInt(hp) || 0), 0);
                }
                return acc + (pisos * (parseInt(t.hogares_por_piso) || 0));
              }, 0) : '-');

              return (
                <tr key={c.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => onCardClick(c)}>
                  <td className="p-3 text-center sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 shadow-[1px_0_0_0_#e5e7eb]" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="p-3 font-bold text-gray-800 uppercase sticky left-12 bg-white group-hover:bg-blue-50/50 z-10 shadow-[1px_0_0_0_#e5e7eb] max-w-[200px] truncate" title={p.nombreProyecto || c.title}>
                    {p.nombreProyecto || c.title}
                  </td>
                  
                  {/* Empresa */}
                  <td className="p-3 min-w-[150px]">
                    {editingCompanyId === c.id ? (
                      <select 
                        className="text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none text-slate-700 w-full"
                        value={c.companyId}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          setEditingCompanyId(null);
                          if (onCompanyChange) onCompanyChange(c.id, e.target.value);
                        }}
                        onBlur={() => setEditingCompanyId(null)}
                      >
                        {companiesList?.map((comp: any) => <option key={comp.id} value={comp.id}>{comp.name}</option>)}
                      </select>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 truncate uppercase">
                          {companiesList?.find((comp: any) => comp.id === c.companyId)?.name || 'Sin Empresa'}
                        </span>
                        {(userRole === 'ADMIN' || userRole === 'BACKOFFICE') && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingCompanyId(c.id); }}
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Bloque Operativo */}
                  <td className="p-3 text-gray-600 font-mono">{c.code || '-'}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c.canalHunting === 'NOVACORE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {c.canalHunting || 'FUTURA'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 truncate max-w-[150px]" title={stageName}>
                      {stageName}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {getInitials(ownerName)}
                      </div>
                      <span className="truncate max-w-[120px]">{ownerName}</span>
                    </div>
                  </td>

                  {/* Bloque Prospección */}
                  <td className="p-3 text-gray-600 truncate max-w-[120px]" title={p.resultadoVisita}>{p.resultadoVisita || '-'}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[150px]" title={p.detalleVisita}>{p.detalleVisita || '-'}</td>

                  {/* Bloque Asignación */}
                  <td className="p-3 text-gray-600">{p.tipoIngreso || '-'}</td>
                  <td className="p-3 text-gray-600">{p.tipoEdificio || p.tipoProyecto || '-'}</td>
                  <td className="p-3 text-gray-600">{formatBool(p.estreno || p.tipoConstruccion === 'Estreno')}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[150px]" title={direccionCompleta}>{direccionCompleta || '-'}</td>
                  <td className="p-3 text-gray-600 font-mono text-[10px]">{p.coordenadas || '-'}</td>
                  <td className="p-3 text-gray-600">{p.tipoAsignacion || p.tipoSolicitud || 'Asignar'}</td>

                  {/* Bloque Contacto */}
                  <td className="p-3 text-gray-600">{formatBool(p.juntaDirectiva)}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[120px]" title={p.nombreResponsable}>{p.nombreResponsable || '-'}</td>
                  <td className="p-3 text-gray-600">{p.cargoResponsable || '-'}</td>
                  <td className="p-3 text-gray-600 font-mono">{p.telefonoResponsable || p.telefono || '-'}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[120px]" title={p.correoResponsable || p.correo}>{p.correoResponsable || p.correo || '-'}</td>

                  {/* Bloque Técnico */}
                  <td className="p-3 text-gray-600">{p.departamento || 'Lima'}</td>
                  <td className="p-3 text-gray-600">{p.provincia || 'Lima'}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[100px]" title={p.distrito}>{p.distrito || '-'}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[120px]" title={p.urbanizacion}>{p.urbanizacion || '-'}</td>
                  <td className="p-3 text-gray-600">{p.codigoPostal || '-'}</td>
                  <td className="p-3 text-gray-600 font-semibold text-center">{totalTorres}</td>
                  <td className="p-3 text-gray-600 font-semibold text-center">{totalHps}</td>
                  <td className="p-3 text-gray-600 font-semibold text-center">{p.clientesInteresados || '-'}</td>
                  <td className="p-3 text-gray-600">{p.fechaInspeccion || '-'}</td>
                  <td className="p-3 text-gray-600 truncate max-w-[100px]" title={p.rangoHorario || p.horarioInspeccion}>{p.rangoHorario || p.horarioInspeccion || '-'}</td>

                  {/* Bloque Auditoría */}
                  <td className="p-3 text-gray-400">{formatDate(c.createdAt)}</td>
                  <td className="p-3 text-gray-400">{formatDate(c.updatedAt || c.lastActivityAt || c.createdAt)}</td>
                </tr>
              );
            })}
            {currentCards.length === 0 && (
              <tr>
                <td colSpan={32} className="p-8 text-center text-gray-400 font-medium">
                  No hay oportunidades para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center text-sm text-gray-600 shrink-0">
        <div>Página {page} de {totalPages}</div>
        <div className="flex items-center gap-4">
          <select 
            className="border border-gray-300 rounded px-2 py-1 outline-none text-gray-700"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <div className="flex items-center gap-1">
            <button 
              className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded font-medium">{page}</span>
            <button 
              className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50" 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
