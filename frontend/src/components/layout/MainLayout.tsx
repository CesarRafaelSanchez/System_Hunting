import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-ghl-surface font-sans">
      {/* Sidebar - Fija a la izquierda, sin scroll propio */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Contextual - fijo en la parte superior */}
        <Topbar />

        {/* Área de contenido — aquí SÍ se puede hacer scroll */}
        <main className="flex-1 overflow-y-auto p-6 bg-ghl-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
