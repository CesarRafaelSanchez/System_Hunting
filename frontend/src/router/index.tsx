import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '../store/useAuthStore';
import { LoginView } from '../views/auth/LoginView';
import { MainLayout } from '../components/layout/MainLayout';
import { Suspense } from 'react';

const DashboardHunter = React.lazy(() => import('../views/hunter/DashboardHunter').then(m => ({ default: m.DashboardHunter })));
const TimeMark = React.lazy(() => import('../views/hunter/TimeMark').then(m => ({ default: m.TimeMark })));
const RegistrarPredio = React.lazy(() => import('../views/hunter/RegistrarPredio').then(m => ({ default: m.RegistrarPredio })));
const AsignacionPredio = React.lazy(() => import('../views/hunter/AsignacionPredio').then(m => ({ default: m.AsignacionPredio })));
const FichaDatosPredio = React.lazy(() => import('../views/hunter/FichaDatosPredio').then(m => ({ default: m.FichaDatosPredio })));
const Form2Asignacion = React.lazy(() => import('../views/hunter/Form2Asignacion').then(m => ({ default: m.Form2Asignacion })));
const Form3FichaDatos = React.lazy(() => import('../views/hunter/Form3FichaDatos').then(m => ({ default: m.Form3FichaDatos })));

import { useParams } from 'react-router-dom';

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
const UserManagement = React.lazy(() => import('../views/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const CompaniesManagement = React.lazy(() => import('../views/admin/CompaniesManagement').then(m => ({ default: m.CompaniesManagement })));
const DashboardView = React.lazy(() => import('../views/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const ValidacionExpedientes = React.lazy(() => import('../views/backoffice/ValidacionExpedientes').then(m => ({ default: m.ValidacionExpedientes })));
import { SyncManager } from '../components/SyncManager';
const CompanySetupView = React.lazy(() => import('../views/auth/CompanySetupView').then(m => ({ default: m.CompanySetupView })));

// Agency Views
import { AgencyLayout } from '../components/layout/AgencyLayout';
const AgencyDashboard = React.lazy(() => import('../views/agency/AgencyDashboard').then(m => ({ default: m.AgencyDashboard })));

// --- GUARDS DE RUTAS ---

import { Outlet } from 'react-router-dom';
const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated || !user || !user.role) {
    if (isAuthenticated) logout(); // Limpiar estado corrupto
    return <Navigate to="/login" replace />;
  }

  // Si no tiene empresa asociada, y NO es super admin, redirigir obligatoriamente al onboarding
  if (!user.companyId) {
    if (user.globalRole === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_SUPPORT') {
      return <Navigate to="/agency/dashboard" replace />;
    }
    return <Navigate to="/setup-company" replace />;
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

  return children ? <>{children}</> : <Outlet />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  
  if (isAuthenticated && user && user.role) {
    if (!user.companyId) {
      if (user.globalRole === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_SUPPORT') {
        return <Navigate to="/agency/dashboard" replace />;
      }
      return <Navigate to="/setup-company" replace />;
    }
    if (user.role === 'HUNTER') return <Navigate to="/hunter" replace />;
    if (user.role === 'BACKOFFICE') return <Navigate to="/backoffice" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    // Si el rol es desconocido, limpiamos
    logout();
  }
  
  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario ya tiene una empresa, redirigir al CRM normal
  if (user.companyId) {
    if (user.globalRole === 'AGENCY_ADMIN' || user.globalRole === 'AGENCY_SUPPORT') {
      return <Navigate to="/agency/dashboard" replace />;
    }
    if (user.role === 'HUNTER') return <Navigate to="/hunter" replace />;
    if (user.role === 'BACKOFFICE') return <Navigate to="/backoffice" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    logout();
    return <Navigate to="/login" replace />;
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

        <Route path="/setup-company" element={
          <OnboardingRoute>
            <CompanySetupView />
          </OnboardingRoute>
        } />

        <Route element={<AgencyLayout />}>
          <Route path="/agency/dashboard" element={
            <Suspense fallback={<div className="p-8 flex justify-center text-gray-500">Cargando...</div>}>
              <AgencyDashboard />
            </Suspense>
          } />
        </Route>

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
                <KanbanBoard />
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
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
