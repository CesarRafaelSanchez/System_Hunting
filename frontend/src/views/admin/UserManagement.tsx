import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api.client';
import { Edit2, Power, PowerOff } from 'lucide-react';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchApi<User[]>('/users');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'BACKOFFICE':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'HUNTER':
        return 'bg-green-50 text-green-700 border border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos y roles de tu equipo de trabajo.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Cargando usuarios...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre Completo</th>
                  <th className="px-6 py-4 font-semibold">Correo Electrónico</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Array.isArray(users) && users.map((user) => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${!user.isActive ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar Rol"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className={`p-1.5 rounded-md transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={user.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {user.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
