import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api.client';
import { Building2, X, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  ruc: string;
  slug: string;
  isActive: boolean;
  tipoNegocio?: 'HUNTING_EDIFICIOS' | 'VENTAS_B2B';
}

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const CompaniesManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Panel state
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Modal State
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [name, setName] = useState('');
  const [ruc, setRuc] = useState('');
  const [slug, setSlug] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState<'HUNTING_EDIFICIOS' | 'VENTAS_B2B'>('HUNTING_EDIFICIOS');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCompanies = async () => {
    try {
      const data = await fetchApi<Company[]>('/companies');
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Error al cargar la lista de empresas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleSelectCompany = async (company: Company) => {
    setSelectedCompany(company);
    setLoadingUsers(true);
    try {
      const data = await fetchApi<User[]>(`/companies/${company.id}/users`);
      setCompanyUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios de la empresa');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setName('');
    setRuc('');
    setSlug('');
    setTipoNegocio('HUNTING_EDIFICIOS');
    setIsActive(true);
    setIsOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, company: Company) => {
    e.stopPropagation();
    setEditingCompany(company);
    setName(company.name);
    setRuc(company.ruc);
    setSlug(company.slug);
    setTipoNegocio(company.tipoNegocio || 'HUNTING_EDIFICIOS');
    setIsActive(company.isActive);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCompany) {
        await fetchApi(`/companies/${editingCompany.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, ruc, slug, tipoNegocio, isActive }),
        });
        toast.success('Empresa actualizada correctamente');
      } else {
        await fetchApi('/companies/admin', {
          method: 'POST',
          body: JSON.stringify({ name, ruc, slug, tipoNegocio }),
        });
        toast.success('Empresa creada correctamente');
      }
      setIsOpen(false);
      loadCompanies();
    } catch (error: any) {
      toast.error(error.message || `Error al ${editingCompany ? 'actualizar' : 'crear'} la empresa`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full bg-gray-50/30 overflow-hidden relative">
      {/* Listado principal */}
      <div className={`flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${selectedCompany ? 'mr-96 lg:mr-[450px]' : ''}`}>
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Gestión de Empresas</h1>
              <p className="text-sm text-gray-500 mt-1">Administra las empresas registradas en el sistema.</p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Agregar Empresa
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wider">Empresa</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">RUC</th>
                    <th className="px-6 py-4 font-semibold tracking-wider">Slug</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-center">Estado</th>
                    <th className="px-6 py-4 font-semibold tracking-wider text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td>
                    </tr>
                  ) : companies.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay empresas registradas</td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr 
                        key={company.id} 
                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${selectedCompany?.id === company.id ? 'bg-indigo-50/30' : ''}`}
                        onClick={() => handleSelectCompany(company)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                              <Building2 size={20} />
                            </div>
                            <div className="font-medium text-gray-900">{company.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{company.ruc}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-mono">{company.slug}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${company.isActive ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-red-50 text-red-700 border-red-200/50'}`}>
                            {company.isActive ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={(e) => handleOpenEdit(e, company)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex"
                            title="Editar Empresa"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Panel lateral de la empresa */}
      {selectedCompany && (
        <div className="fixed inset-y-0 right-0 w-96 lg:w-[450px] bg-white shadow-2xl border-l border-gray-200 z-40 transform transition-transform duration-300 flex flex-col pt-16">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedCompany.name}</h2>
                <p className="text-sm text-gray-500 font-mono">RUC: {selectedCompany.ruc}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedCompany(null)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              Usuarios Registrados ({companyUsers.length})
            </h3>
            
            {loadingUsers ? (
              <div className="text-center py-8 text-sm text-gray-500">Cargando usuarios...</div>
            ) : companyUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                <p className="text-sm text-gray-500">No hay usuarios asignados a esta empresa.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {companyUsers.map(user => (
                  <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{user.fullName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'BACKOFFICE' || user.role === 'BACKOFFICE_VENTAS' || user.role === 'POSTVENTA' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Agregar Empresa */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editingCompany ? 'Editar Empresa' : 'Agregar Nueva Empresa'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. NovaCore S.A.C"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RUC</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm font-mono"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value)}
                    placeholder="20123456789"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Identificador corto)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm font-mono"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="novacore"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Negocio</label>
                  <select
                    value={tipoNegocio}
                    onChange={(e) => setTipoNegocio(e.target.value as 'HUNTING_EDIFICIOS' | 'VENTAS_B2B')}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-colors text-sm bg-white"
                  >
                    <option value="HUNTING_EDIFICIOS">Hunting Edificios</option>
                    <option value="VENTAS_B2B">Ventas B2B (FS)</option>
                  </select>
                </div>

                {editingCompany && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Empresa Activa</label>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submitting ? 'Guardando...' : editingCompany ? 'Guardar Cambios' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
