import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleReturn = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'HUNTER') {
      navigate('/hunter');
    } else if (
      user.role === 'ASESOR_VENTAS' ||
      user.role === 'SUPERVISOR_VENTAS' ||
      user.role === 'POSTVENTA'
    ) {
      navigate('/sales/dashboard');
    } else if (user.role === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_ADMIN') {
      navigate('/agency/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Página no encontrada</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Lo sentimos, la página que estás buscando no existe o ha sido movida. Verifica que la URL sea correcta.
        </p>
        <button
          onClick={handleReturn}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <Home className="w-5 h-5" />
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};
