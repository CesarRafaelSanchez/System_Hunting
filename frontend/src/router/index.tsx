import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { LoginView } from '../views/auth/LoginView';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardHunter } from '../views/hunter/DashboardHunter';
import { TimeMark } from '../views/hunter/TimeMark';
import { RegistrarPredio } from '../views/hunter/RegistrarPredio';
import { AsignacionPredio } from '../views/hunter/AsignacionPredio';
import { FichaDatosPredio } from '../views/hunter/FichaDatosPredio';
import { KanbanBoard } from '../views/backoffice/KanbanBoard';
import { UserManagement } from '../views/admin/UserManagement';
import { DashboardView } from '../views/dashboard/DashboardView';
import { ValidacionExpedientes } from '../views/backoffice/ValidacionExpedientes';
import { SyncManager } from '../components/SyncManager';

// --- GUARDS DE RUTAS ---

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated || !user || !user.role) {
    if (isAuthenticated) logout(); // Limpiar estado corrupto
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Si no tiene el rol adecuado, lo devolvemos a su panel correspondiente
    if (user.role === 'HUNTER') return <Navigate to="/hunter" replace />;
    if (user.role === 'BACKOFFICE') return <Navigate to="/backoffice" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    // Fallback de seguridad
    logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  if (isAuthenticated && user && user.role) {
    if (user.role === 'HUNTER') return <Navigate to="/hunter" replace />;
    if (user.role === 'BACKOFFICE') return <Navigate to="/backoffice" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    // Si el rol es desconocido, limpiamos
    logout();
  }
  
  return <>{children}</>;
};

// Componente Placeholder temporal para validación del contenido interno de layouts
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6 bg-white rounded-xl shadow-sm border border-ghl-border">
    <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
    <p className="text-gray-600">Área de contenido protegida renderizada correctamente.</p>
  </div>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <SyncManager />
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginView />
          </PublicRoute>
        } />

        {/* LAYOUT MAESTRO (Protegido por Role) */}
        <Route element={<MainLayout />}>
          {/* DASHBOARD GENERAL (Todos los roles) */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'BACKOFFICE', 'HUNTER']}>
              <DashboardView />
            </ProtectedRoute>
          } />

          {/* RUTAS HUNTER */}
          <Route path="/hunter" element={
            <ProtectedRoute allowedRoles={['HUNTER']}>
              <DashboardHunter />
            </ProtectedRoute>
          } />
          
          <Route path="/hunter/asistencia" element={
            <ProtectedRoute allowedRoles={['HUNTER']}>
              <div className="p-4 flex justify-center w-full">
                <TimeMark />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/hunter/registro" element={
            <ProtectedRoute allowedRoles={['HUNTER']}>
              <RegistrarPredio />
            </ProtectedRoute>
          } />

          <Route path="/hunter/pipeline" element={
            <ProtectedRoute allowedRoles={['HUNTER']}>
              <KanbanBoard />
            </ProtectedRoute>
          } />

          <Route path="/hunter/asignacion" element={
            <ProtectedRoute allowedRoles={['HUNTER']}>
              <AsignacionPredio />
            </ProtectedRoute>
          } />

          <Route path="/hunter/ficha" element={
            <ProtectedRoute allowedRoles={['HUNTER']}>
              <FichaDatosPredio />
            </ProtectedRoute>
          } />
          
          {/* RUTAS BACKOFFICE */}
          <Route path="/backoffice" element={
            <ProtectedRoute allowedRoles={['BACKOFFICE', 'ADMIN', 'HUNTER']}>
              <KanbanBoard />
            </ProtectedRoute>
          } />

          <Route path="/backoffice/validacion" element={
            <ProtectedRoute allowedRoles={['BACKOFFICE', 'ADMIN']}>
              <ValidacionExpedientes />
            </ProtectedRoute>
          } />

          <Route path="/backoffice/asistencia" element={
            <ProtectedRoute allowedRoles={['BACKOFFICE', 'ADMIN']}>
              <div className="p-4 flex justify-center w-full">
                <TimeMark />
              </div>
            </ProtectedRoute>
          } />

          <Route path="/backoffice/historial" element={
            <ProtectedRoute allowedRoles={['BACKOFFICE', 'ADMIN']}>
              <Placeholder title="Historial de Oportunidades" />
            </ProtectedRoute>
          } />

          {/* RUTAS ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Placeholder title="Configuraciones Globales" />
            </ProtectedRoute>
          } />

          <Route path="/admin/usuarios" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserManagement />
            </ProtectedRoute>
          } />
        </Route>

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
