import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Clock, ClipboardList, History, ChevronLeft, ChevronRight, Settings, BarChart3, Building2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const role = user?.role || 'HUNTER';

  // Navegación contextual por rol
  const getNavLinks = () => {
    switch (role) {
      case 'HUNTER':
        return [
          { name: 'Dashboard', path: '/hunter', icon: BarChart3 },
          { name: 'Pipeline', path: '/hunter/pipeline', icon: LayoutDashboard },
          { name: 'Asistencia', path: '/hunter/asistencia', icon: Clock },
          { name: 'Registro de Predio', path: '/hunter/registro', icon: ClipboardList },
          { name: 'Asignación de Predio', path: '/hunter/asignacion', icon: ClipboardList },
          { name: 'Ficha de Datos', path: '/hunter/ficha', icon: ClipboardList },
        ];
      case 'BACKOFFICE':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
          { name: 'Kanban', path: '/backoffice', icon: LayoutDashboard },
          { name: 'Validación Expedientes', path: '/backoffice/validacion', icon: ClipboardList },
          { name: 'Control Asistencia', path: '/backoffice/asistencia', icon: Clock },
          { name: 'Historial', path: '/backoffice/historial', icon: History },
        ];
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
          { name: 'Kanban', path: '/backoffice', icon: LayoutDashboard },
          { name: 'Validación Expedientes', path: '/backoffice/validacion', icon: ClipboardList },
          { name: 'Control Asistencia', path: '/backoffice/asistencia', icon: Clock },
          { name: 'Empresas', path: '/admin/empresas', icon: Building2 },
          { name: 'Usuarios', path: '/admin/usuarios', icon: ClipboardList },
          { name: 'Historial', path: '/backoffice/historial', icon: History },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <aside className={`bg-ghl-sidebar text-white flex flex-col h-full shadow-lg transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-16' : 'w-56'}`}>
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-800">
        {!isCollapsed ? (
          <h1 className="text-xl font-bold tracking-wider truncate w-full text-center">HUNTING</h1>
        ) : (
          <h1 className="text-xl font-bold tracking-wider truncate">H</h1>
        )}
      </div>
      
      <nav className="flex-1 py-6 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              title={isCollapsed ? link.name : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${isActive ? 'bg-ghl-lightBlue text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium text-[13px] tracking-wide truncate">{link.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto relative w-full p-4 border-t border-slate-800">
        <NavLink
          to="/settings"
          title={isCollapsed ? "Configuración" : undefined}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-gray-400 hover:bg-gray-800 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-[13px] tracking-wide truncate">Configuración</span>}
        </NavLink>
        
        {/* Botón flotante de colapso */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 rounded-full flex items-center justify-center bg-emerald-400 text-slate-900 shadow-md hover:bg-emerald-300 transition-colors"
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

    </aside>
  );
};
