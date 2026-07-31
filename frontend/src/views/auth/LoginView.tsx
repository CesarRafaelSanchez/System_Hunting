import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi, ApiError } from '../../services/api.client';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, Loader2, Building2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);

  useEffect(() => {
    document.title = 'CRM Grupo Futura | Iniciar Sesión';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener Datos (access_token y user con membresías)
      const data = await fetchApi<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // 2. Actualizar Estado Global (Zustand persiste en localStorage)
      loginAction(data.access_token, data.user);

      const companies = data.user.companies || [];
      const isAgencyAdmin = data.user.globalRole === 'AGENCY_ADMIN';

      // 3. Redirección inteligente
      if (isAgencyAdmin) {
        if (companies.length > 0) {
          navigate('/workspaces');
        } else {
          navigate('/agency/dashboard');
        }
      } else if (companies.length > 1) {
        navigate('/workspaces');
      } else if (companies.length === 1) {
        const singleCompany = companies[0];
        if (singleCompany.role === 'HUNTER') {
          navigate('/hunter');
        } else if (singleCompany.role === 'BACKOFFICE' || singleCompany.role === 'SUPERVISOR_HUNTING') {
          navigate('/backoffice/oportunidades');
        } else if (['ASESOR_VENTAS', 'SUPERVISOR_VENTAS', 'BACKOFFICE_VENTAS', 'POSTVENTA'].includes(singleCompany.role)) {
          navigate('/sales/dashboard');
        } else {
          navigate('/admin');
        }
      } else {
        if (isAgencyAdmin) {
          navigate('/agency/dashboard');
        } else {
          setError('No tienes ninguna empresa asignada.');
        }
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.status === 401 ? 'Credenciales incorrectas' : `Fallo del Servidor (${err.status})`);
      } else {
        setError('Error de conexión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-100 p-8 max-w-md w-full relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-center">CRM Grupo Futura</h2>
            <p className="text-slate-500 text-sm mt-2 text-center px-4 font-medium">Plataforma Integrada de Gestión Comercial y Operaciones</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></div>
              {error}
            </div>
          )}
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="ejemplo@grupofutura.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 focus:ring-4 focus:ring-indigo-500/30 flex items-center justify-center gap-2 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Ingresando...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
        
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Grupo Futura. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};
