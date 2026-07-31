import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type CompanyData } from '../../store/useAuthStore';

export const WorkspaceSwitcher: React.FC = () => {
  const { user, setActiveWorkspace, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSelect = (workspace: CompanyData) => {
    setActiveWorkspace(workspace);
    navigate('/admin');
  };

  const handleGoToAgency = () => {
    setActiveWorkspace(null); // Contexto global
    navigate('/agency/dashboard');
  };

  const isAgencyAdmin = user?.globalRole === 'AGENCY_ADMIN' || user?.role === 'AGENCY_ADMIN';
  const companies = user?.companies || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent mb-2">
            Selecciona tu Espacio de Trabajo
          </h1>
          <p className="text-slate-400">
            Elige la subcuenta o rol con el que deseas trabajar en esta sesión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Agency Admin Portal Card */}
          {isAgencyAdmin && (
            <div
              onClick={handleGoToAgency}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-500/70 transition-all duration-300 backdrop-blur-md flex flex-col justify-between hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            >
              <div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Global
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2 group-hover:text-indigo-400 transition-colors">
                  Panel de Agencia
                </h3>
                <p className="text-sm text-slate-400">
                  Acceso general a todas las subcuentas, métricas del ecosistema y control administrativo global.
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                Entrar al Panel Global &rarr;
              </div>
            </div>
          )}

          {/* Companies Workspace Cards */}
          {companies.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => handleSelect(workspace)}
              className="group cursor-pointer p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-md flex flex-col justify-between hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                  workspace.tipoNegocio === 'VENTAS_B2B'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {workspace.tipoNegocio === 'VENTAS_B2B' ? 'Ventas B2B' : 'Hunting Fibra'}
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2 group-hover:text-blue-400 transition-colors">
                  {workspace.name}
                </h3>
                <p className="text-sm text-slate-400">
                  Rol asignado: <span className="text-slate-300 font-semibold">{workspace.role}</span>
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                Acceder a Workspace &rarr;
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={logout}
            className="px-6 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 transition-all text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
