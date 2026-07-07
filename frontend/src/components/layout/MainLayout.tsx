import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-ghl-surface font-sans overflow-hidden">
      {/* Sidebar - Fija a la izquierda */}
      <Sidebar />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Contextual */}
        <Topbar />

        {/* Área de contenido dinámica (Fija y sin scroll global) */}
        <main className="h-[calc(100vh-64px)] overflow-hidden p-6 bg-ghl-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
