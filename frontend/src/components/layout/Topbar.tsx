import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Bell, Search, LogOut, ChevronRight, Users, ChevronLeft, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchApi } from '../../services/api.client';
import { toast } from 'sonner';

export const Topbar: React.FC = () => {
  const { user, logout, impersonate, restoreImpersonation, originalUser } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsImpersonating(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('registro')) return 'Registro de Predios';
    if (path.includes('asistencia')) return 'Control de Asistencia';
    if (path.includes('historial')) return 'Historial de Oportunidades';
    if (path === '/hunter') return 'Panel de Control';
    if (path === '/backoffice') return 'Tablero Kanban';
    if (path === '/admin') return 'Panel Administrativo';
    return 'Resumen';
  };

  const loadUsers = async () => {
    try {
      const data = await fetchApi<any[]>('/users');
      if (data) setUsersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImpersonateClick = () => {
    setIsImpersonating(true);
    loadUsers();
  };

  const handleImpersonateUser = async (targetUser: any) => {
    try {
      const data = await fetchApi<any>('/auth/impersonate', { 
        method: 'POST', 
        body: JSON.stringify({ userId: targetUser.id }) 
      });
      if (data && data.access_token) {
        impersonate(data.access_token, data.user);
        window.location.href = '/';
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al suplantar identidad');
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setShowLogoutModal(false);
    navigate('/login');
  };

  const filteredUsers = usersList.filter(u => u.fullName.toLowerCase().includes(searchUser.toLowerCase()));
  const initial = user?.fullName?.[0]?.toUpperCase() || 'U';

  const handleRestoreImpersonation = () => {
    restoreImpersonation();
    window.location.href = '/';
  };

  return (
    <>
      {originalUser && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[10000]">
          <div className="bg-blue-50 text-slate-700 px-6 py-2 rounded-full border border-blue-200 shadow-sm text-sm font-medium flex items-center">
            <span>Conectado como <span className="font-bold">{user?.fullName}</span> ({user?.email})</span>
            <button 
              onClick={handleRestoreImpersonation}
              className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer ml-2"
            >
              cambiar a mi cuenta
            </button>
          </div>
        </div>
      )}

      <header className="h-16 bg-white border-b border-ghl-border flex items-center justify-between px-6 shadow-sm relative z-50">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
            {getPageTitle()}
          </h2>
        </div>

        <div className="flex items-center gap-6">


          <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-3 border-l pl-6 border-gray-200 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-800">{user?.fullName || 'Usuario'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-ghl-blue text-white mt-0.5 font-medium tracking-wide shadow-sm">
                  {user?.role || 'INVITADO'}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-ghl-lightBlue flex items-center justify-center text-white shadow-md font-bold">
                {initial}
              </div>
            </div>

            {/* Menú Desplegable */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]">
                {!isImpersonating ? (
                  <>
                    <div className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-ghl-lightBlue flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {initial}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-gray-800 truncate">{user?.fullName || 'Usuario'}</span>
                        <span className="text-xs text-gray-500 truncate">{user?.email || 'correo@futura.pe'}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-100"></div>
                    
                    {user?.role === 'ADMIN' && (
                      <>
                        <button 
                          onClick={handleImpersonateClick}
                          className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-ghl-blue" />
                            <span>Iniciar sesión como...</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <div className="border-t border-gray-100"></div>
                      </>
                    )}

                    <button 
                      onClick={() => { setIsMenuOpen(false); setShowLogoutModal(true); }}
                      className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-red-50 transition-colors text-sm text-red-600 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col max-h-[400px]">
                    <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                      <button 
                        onClick={() => setIsImpersonating(false)}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-gray-700 text-sm">Cambiar Usuario</span>
                    </div>
                    <div className="p-3">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="Buscar usuarios..." 
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-ghl-lightBlue"
                        />
                      </div>
                    </div>
                    <div className="px-3 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      TODOS LOS USUARIOS
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-1 max-h-[250px]">
                      {filteredUsers.map(u => (
                        <button 
                          key={u.id}
                          onClick={() => handleImpersonateUser(u)}
                          className="w-full p-2 flex items-center gap-3 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100 text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0 group-hover:bg-blue-200 group-hover:text-blue-800 transition-colors">
                            {u.fullName[0]?.toUpperCase()}
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="font-semibold text-gray-800 text-sm truncate">{u.fullName}</span>
                            <span className="text-xs text-gray-500 truncate">{u.email}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-400">No se encontraron usuarios</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de Cierre de Sesión */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm m-4 transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cerrar sesión</h3>
            <p className="text-gray-600 mb-6 text-sm">¿Estás seguro que quieres salir?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-500 hover:bg-red-600 transition-colors text-sm"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
