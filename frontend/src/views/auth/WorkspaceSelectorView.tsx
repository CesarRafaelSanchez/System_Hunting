import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore, type Workspace } from '../../store/useTenantStore';
import { useAuthStore } from '../../store/useAuthStore';
import styles from './LoginView.module.css';

export const WorkspaceSelectorView: React.FC = () => {
  const workspaces = useTenantStore(state => state.workspaces);
  const setActiveWorkspace = useTenantStore(state => state.setActiveWorkspace);
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  

  useEffect(() => {
    if (workspaces.length === 0) {
      if (user?.globalRole === 'AGENCY_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/login');
      }
    } else if (workspaces.length === 1) {
      handleSelect(workspaces[0]);
    }
  }, [workspaces, navigate, user]);

  const handleSelect = (workspace: Workspace) => {
    setActiveWorkspace(workspace);
    const role = workspace.role;
    if (role === 'HUNTER') navigate('/hunter');
    else if (role === 'BACKOFFICE') navigate('/backoffice');
    else if (role === 'ACCOUNT_ADMIN' || role === 'AGENCY_ADMIN') navigate('/admin');
    else navigate('/');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard} style={{ maxWidth: '500px' }}>
        <h2 className={styles.title}>Selecciona tu Espacio de Trabajo</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Hola {user?.fullName}, tienes acceso a múltiples empresas.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {workspaces.map(ws => (
            <button
              key={ws.companyId}
              onClick={() => handleSelect(ws)}
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: '#fff',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#007BFF'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ddd'}
            >
              <strong style={{ fontSize: '1.1rem' }}>{ws.name}</strong>
              <span style={{ fontSize: '0.85rem', color: '#888', background: '#f4f4f4', padding: '4px 8px', borderRadius: '4px' }}>
                Rol: {ws.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
