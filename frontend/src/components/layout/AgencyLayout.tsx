import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut } from 'lucide-react';

export const AgencyLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  // Protect route
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Only AGENCY_ADMIN or AGENCY_SUPPORT can access
  if (user?.globalRole !== 'AGENCY_ADMIN' && user?.globalRole !== 'AGENCY_SUPPORT') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-ghl-blue text-white flex items-center justify-center font-bold text-lg">
            A
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Agency Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
            <p className="text-xs text-gray-500 font-medium">{user.globalRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {user.fullName[0]?.toUpperCase()}
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
