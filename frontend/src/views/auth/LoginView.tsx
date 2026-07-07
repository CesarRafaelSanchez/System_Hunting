import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi, ApiError } from '../../services/api.client';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './LoginView.module.css';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener Token
      const data = await fetchApi<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // 2. Decodificar payload manual con soporte para base64url
      const tokenParts = data.access_token.split('.');
      if (tokenParts.length !== 3) throw new Error('Token inválido');
      
      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const payload = JSON.parse(jsonPayload);
      
      // 3. Actualizar Estado Global (Zustand persiste en localStorage)
      loginAction(data.access_token, {
        id: payload.sub,
        email: payload.email,
        fullName: payload.fullName || 'Usuario',
        role: payload.role,
        companyId: payload.companyId
      });

      // Navegación imperativa directa (además del RouteGuard) para respuesta inmediata
      if (payload.role === 'HUNTER') {
        navigate('/hunter');
      } else if (payload.role === 'BACKOFFICE') {
        navigate('/backoffice');
      } else if (payload.role === 'ADMIN') {
        navigate('/admin');
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
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Hunting CRM</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Correo Electrónico</label>
            <input 
              type="email" 
              className={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña</label>
            <input 
              type="password" 
              className={styles.input}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};
