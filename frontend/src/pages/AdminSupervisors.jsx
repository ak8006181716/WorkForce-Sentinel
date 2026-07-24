import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/common/Loader.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { getSupervisors, createSupervisor, updateSupervisor, deleteSupervisor } from '../api/admin.api.js';
import { getSites } from '../api/supervisor.api.js';
import { Search, Edit2, Trash2, UserPlus, X, Shield } from 'lucide-react';

const AdminSupervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [sites, setSites] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupervisor, setEditingSupervisor] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', siteId: '', isActive: true });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSupervisors = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getSupervisors({ page, limit: 10, search });
      if (res.success) {
        setSupervisors(res.data.supervisors);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch supervisors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const res = await getSites();
      if (res.success) setSites(res.data || []);
    } catch (err) {
      console.error('Fetch sites error:', err);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSupervisors(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const openCreateModal = () => {
    setEditingSupervisor(null);
    setFormData({ name: '', email: '', password: '', siteId: '', isActive: true });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (sup) => {
    setEditingSupervisor(sup);
    setFormData({
      name: sup.name,
      email: sup.email,
      password: '',
      siteId: sup.siteId?._id || '',
      isActive: sup.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingSupervisor) {
        await updateSupervisor(editingSupervisor._id, formData);
      } else {
        if (!formData.password) {
          setFormError('Password is required for new accounts.');
          setSubmitting(false);
          return;
        }
        await createSupervisor(formData);
      }
      setModalOpen(false);
      fetchSupervisors(pagination.page);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete supervisor account '${name}'?`)) {
      try {
        await deleteSupervisor(id);
        fetchSupervisors(pagination.page);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete supervisor');
      }
    }
  };

  return (
    <DashboardLayout onRefreshData={() => fetchSupervisors(pagination.page)}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Supervisors</h1>
            <p className="text-xs text-slate-500 mt-1">Manage supervisor accounts and construction site assignments.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Supervisor</span>
          </button>
        </div>

        <div className="card-panel p-4 flex items-center space-x-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="card-panel p-6">
          {loading ? (
            <Loader text="Loading supervisors..." />
          ) : supervisors.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No supervisors found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="table-header">
                    <tr>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Assigned Site</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {supervisors.map((sup) => (
                      <tr key={sup._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{sup.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">{sup.email}</td>
                        <td className="py-3.5 px-4">
                          {sup.siteId ? (
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                              {sup.siteId.name} ({sup.siteId.code})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sup.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {sup.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">
                          {new Date(sup.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(sup)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-slate-200 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sup._id, sup.name)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-slate-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination pagination={pagination} onPageChange={(p) => fetchSupervisors(p)} />
            </div>
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 border border-slate-200 shadow-xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <h3 className="text-base font-bold text-slate-900">
                  {editingSupervisor ? 'Edit Supervisor' : 'New Supervisor'}
                </h3>
                <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.doe@workforce.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Password {editingSupervisor ? '(Leave blank if unchanged)' : ''}
                  </label>
                  <input
                    type="password"
                    required={!editingSupervisor}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assign Site</label>
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">-- Unassigned --</option>
                    {sites.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {editingSupervisor && (
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-blue-600 border-slate-300"
                    />
                    <label htmlFor="isActive" className="text-xs font-medium text-slate-700">
                      Active Account
                    </label>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingSupervisor ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSupervisors;
