import { ErrorBoundary } from '../components/common/ErrorBoundary';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { LoginView } from '../views/auth/LoginView';
import { WorkspaceSwitcher } from '../views/auth/WorkspaceSwitcher';
import { MainLayout } from '../components/layout/MainLayout';
import { Suspense } from 'react';

const DashboardHunter = React.lazy(() => import('../views/hunter/DashboardHunter').then(m => ({ default: m.DashboardHunter })));
const TimeMark = React.lazy(() => import('../views/hunter/TimeMark').then(m => ({ default: m.TimeMark })));
const RegistrarPredio = React.lazy(() => import('../views/hunter/RegistrarPredio').then(m => ({ default: m.RegistrarPredio })));
const AsignacionPredio = React.lazy(() => import('../views/hunter/AsignacionPredio').then(m => ({ default: m.AsignacionPredio })));
const FichaDatosPredio = React.lazy(() => import('../views/hunter/FichaDatosPredio').then(m => ({ default: m.FichaDatosPredio })));
const Form2Asignacion = React.lazy(() => import('../views/hunter/Form2Asignacion').then(m => ({ default: m.Form2Asignacion })));
const Form3FichaDatos = React.lazy(() => import('../views/hunter/Form3FichaDatos').then(m => ({ default: m.Form3FichaDatos })));
const RegistrarVenta = React.lazy(() => import('../views/sales/RegistrarVenta').then(m => ({ default: m.RegistrarVenta })));
const DashboardAsesor = React.lazy(() => import('../views/sales/DashboardAsesor').then(m => ({ default: m.DashboardAsesor })));
const DashboardSupervisor = React.lazy(() => import('../views/sales/DashboardSupervisor').then(m => ({ default: m.DashboardSupervisor })));

import { useParams } from 'react-router-dom';

const SalesDashboardRoute = () => {
  const { user } = useAuthStore();
  return (
    <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando dashboard...</div>}>
      {user?.role === 'SUPERVISOR_VENTAS' ? <DashboardSupervisor /> : <DashboardAsesor />}
    </Suspense>
  );
};

const PublicForm2Route = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  return (
    <div className="p-4 flex justify-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-sm">
        <Form2Asignacion opportunityId={opportunityId} />
      </div>
    </div>
  );
};

const PublicForm3Route = () => {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  return (
    <div className="p-4 flex justify-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-sm">
        <Form3FichaDatos opportunityId={opportunityId} />
      </div>
    </div>
  );
};

const KanbanBoard = React.lazy(() => import('../views/backoffice/KanbanBoard').then(m => ({ default: m.KanbanBoard })));
const HuntingKanbanBoard = React.lazy(() => import('../views/opportunities/hunting/HuntingKanbanBoard').then(m => ({ default: m.KanbanBoard })));
const B2BKanbanBoard = React.lazy(() => import('../views/opportunities/b2b/B2BKanbanBoard').then(m => ({ default: m.KanbanBoard })));
const UserManagement = React.lazy(() => import('../views/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const CompaniesManagement = React.lazy(() => import('../views/admin/CompaniesManagement').then(m => ({ default: m.CompaniesManagement })));
const DashboardView = React.lazy(() => import('../views/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const ValidacionExpedientes = React.lazy(() => import('../views/backoffice/ValidacionExpedientes').then(m => ({ default: m.ValidacionExpedientes })));
import { SyncManager } from '../components/SyncManager';
const AgencyDashboard = React.lazy(() => import('../views/admin/AgencyDashboard').then(m => ({ default: m.AgencyDashboard })));

// --- GUARDS DE RUTAS ---

import { Outlet } from 'react-router-dom';
const ProtectedRoute = ({ children, allowedRoles, bypassWorkspaceCheck }: { children?: React.ReactNode, allowedRoles?: string[], bypassWorkspaceCheck?: boolean }) => {
  const { isAuthenticated, user, activeWorkspace, logout } = useAuthStore();

  if (!isAuthenticated || !user || !user.role) {
    if (isAuthenticated) logout(); // Limpiar estado corrupto
    return <Navigate to="/login" replace />;
  }

  // Si no tiene empresa asociada y no es AGENCY_ADMIN, redirigir al login (usuario huérfano)
  if (!user.companyId && !activeWorkspace && user.globalRole !== 'AGENCY_ADMIN') {
    logout();
    return <Navigate to="/login" replace />;
  }

  // Si no ha seleccionado un workspace y no se permite bypass
  if (!activeWorkspace && !bypassWorkspaceCheck && user.globalRole !== 'AGENCY_ADMIN') {
    return <Navigate to="/workspaces" replace />;
  }

  if (allowedRoles) {
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    const isLocalAdmin = user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN';

    // Normalizar roles permitidos para los roles de Ventas
    const extendedAllowedRoles = [...allowedRoles];
    if (allowedRoles.includes('HUNTER')) extendedAllowedRoles.push('ASESOR_VENTAS');
    if (allowedRoles.includes('BACKOFFICE')) {
      extendedAllowedRoles.push('SUPERVISOR_HUNTING');
      extendedAllowedRoles.push('SUPERVISOR_VENTAS');
      extendedAllowedRoles.push('ACCOUNT_ADMIN');
      extendedAllowedRoles.push('BACKOFFICE_VENTAS');
      extendedAllowedRoles.push('POSTVENTA');
    }
    if (allowedRoles.includes('ADMIN')) {
      extendedAllowedRoles.push('ACCOUNT_ADMIN');
      extendedAllowedRoles.push('AGENCY_ADMIN');
    }

    if (!extendedAllowedRoles.includes(user.role) && !isAgencyAdmin) {
      if (user.role === 'HUNTER') return <Navigate to="/hunter" replace />;
      if (user.role === 'ASESOR_VENTAS' || user.role === 'SUPERVISOR_VENTAS' || user.role === 'BACKOFFICE_VENTAS' || user.role === 'POSTVENTA') return <Navigate to="/sales/dashboard" replace />;
      if (['BACKOFFICE', 'SUPERVISOR_HUNTING'].includes(user.role)) return <Navigate to="/backoffice/oportunidades" replace />;
      if (isLocalAdmin) return <Navigate to="/admin" replace />;
      logout();
      return <Navigate to="/login" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, activeWorkspace, logout } = useAuthStore();
  
  if (isAuthenticated && user && user.role) {
    const isAgencyAdmin = user.globalRole === 'AGENCY_ADMIN' || user.role === 'AGENCY_ADMIN';
    if (!user.companyId && !activeWorkspace && !isAgencyAdmin) {
      logout();
      return <Navigate to="/login" replace />;
    }
    if (!activeWorkspace && !isAgencyAdmin) {
      return <Navigate to="/workspaces" replace />;
    }
    if (user.role === 'HUNTER') return <Navigate to="/hunter" replace />;
    if (user.role === 'ASESOR_VENTAS' || user.role === 'SUPERVISOR_VENTAS' || user.role === 'BACKOFFICE_VENTAS' || user.role === 'POSTVENTA') return <Navigate to="/sales/dashboard" replace />;
    if (['BACKOFFICE', 'SUPERVISOR_HUNTING'].includes(user.role)) return <Navigate to="/backoffice/oportunidades" replace />;
    if (user.role === 'ACCOUNT_ADMIN' || user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    
    if (isAgencyAdmin && !activeWorkspace) {
      if (user.companies && user.companies.length > 0) {
        return <Navigate to="/workspaces" replace />;
      }
      return <Navigate to="/agency/dashboard" replace />;
    }
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
      <ErrorBoundary>
      <Routes>
        {/* ROOT REDIRECT */}
        <Route path="/" element={
          <PublicRoute>
            <Navigate to="/login" replace />
          </PublicRoute>
        } />
        {/* RUTAS PÚBLICAS */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginView />
          </PublicRoute>
        } />
        <Route path="/workspaces" element={
          <ProtectedRoute bypassWorkspaceCheck={true}>
            <WorkspaceSwitcher />
          </ProtectedRoute>
        } />


        <Route path="/public/registro-predio" element={
          <div className="p-4 flex justify-center w-full min-h-screen bg-gray-50">
            <RegistrarPredio />
          </div>
        } />
        
        <Route path="/public/oportunidades/asignacion/:opportunityId" element={
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando formulario...</div>}>
            <PublicForm2Route />
          </Suspense>
        } />
        
        <Route path="/public/oportunidades/ficha-tecnica/:opportunityId" element={
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando formulario...</div>}>
            <PublicForm3Route />
          </Suspense>
        } />



        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={
            <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
              <ProtectedRoute allowedRoles={['ADMIN', 'BACKOFFICE', 'HUNTER']}>
                <DashboardView />
              </ProtectedRoute>
            </Suspense>
          } />

          <Route element={<ProtectedRoute allowedRoles={['HUNTER']} />}>
            <Route path="/hunter" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <DashboardHunter />
              </Suspense>
            } />
            <Route path="/hunter/asistencia" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <TimeMark />
              </Suspense>
            } />
            <Route path="/hunter/oportunidades/nueva" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <RegistrarPredio />
              </Suspense>
            } />
            <Route path="/hunter/oportunidades" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <HuntingKanbanBoard />
              </Suspense>
            } />
            <Route path="/hunter/oportunidades/asignacion" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <AsignacionPredio />
              </Suspense>
            } />
            <Route path="/hunter/oportunidades/ficha-tecnica" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <FichaDatosPredio />
              </Suspense>
            } />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ASESOR_VENTAS', 'SUPERVISOR_VENTAS', 'BACKOFFICE_VENTAS', 'POSTVENTA', 'ACCOUNT_ADMIN', 'HUNTER']} />}>
            <Route path="/sales/oportunidades/nueva" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <RegistrarVenta />
              </Suspense>
            } />
            <Route path="/sales/oportunidades" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <B2BKanbanBoard />
              </Suspense>
            } />
            <Route path="/sales/dashboard" element={<SalesDashboardRoute />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['BACKOFFICE', 'ADMIN']} />}>
            <Route path="/backoffice/oportunidades" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando tablero...</div>}>
                <KanbanBoard />
              </Suspense>
            } />
            <Route path="/backoffice/auditoria" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando validación...</div>}>
                <ValidacionExpedientes />
              </Suspense>
            } />
            <Route path="/backoffice/asistencia" element={
              <div className="p-4 flex justify-center w-full">
                <TimeMark />
              </div>
            } />
            <Route path="/backoffice/historial" element={
              <Placeholder title="Historial de Oportunidades" />
            } />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={
              <Placeholder title="Configuraciones Globales" />
            } />
            <Route path="/admin/usuarios" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <UserManagement />
              </Suspense>
            } />
            <Route path="/admin/empresas" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
                <CompaniesManagement />
              </Suspense>
            } />
            <Route path="/agency/dashboard" element={
              <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando consola...</div>}>
                <AgencyDashboard />
              </Suspense>
            } />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};
