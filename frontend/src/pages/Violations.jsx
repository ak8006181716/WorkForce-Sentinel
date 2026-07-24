import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { getViolations, acknowledgeViolation, getSites } from '../api/supervisor.api.js';
import { Search, Filter, Check, AlertTriangle, X } from 'lucide-react';

const PPE_TYPES = ['HELMET', 'VEST', 'GLOVES', 'SAFETY_GLASSES', 'BOOTS', 'HARNESS'];

const Violations = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [violations, setViolations] = useState([]);
  const [sites, setSites] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [ppeType, setPpeType] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(true);

  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchViolations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getViolations({ page, limit: 10, search, siteId, ppeType, status });
      if (res.success) {
        setViolations(res.data.violations || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch violations error:', err);
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
      fetchViolations(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, siteId, ppeType, status]);

  const openAckModal = (v) => {
    setSelectedViolation(v);
    setNotes('');
    setAckModalOpen(true);
  };

  const handleConfirmAcknowledge = async (e) => {
    e.preventDefault();
    if (!selectedViolation) return;

    setSubmitting(true);
    try {
      await acknowledgeViolation(selectedViolation._id, notes);
      setAckModalOpen(false);
      fetchViolations(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to acknowledge violation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout onRefreshData={() => fetchViolations(pagination.page)}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">PPE Violations</h1>
          <p className="text-xs text-slate-500 mt-1">Search, filter, and acknowledge site PPE violation logs.</p>
        </div>

        <div className="card-panel p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search worker or site..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
            >
              <option value="">All Sites</option>
              {sites.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={ppeType}
              onChange={(e) => setPpeType(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
            >
              <option value="">All PPE Types</option>
              {PPE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="ESCALATED">ESCALATED</option>
            </select>
          </div>
        </div>

        <div className="card-panel p-6">
          {loading ? (
            <Loader text="Loading violations..." />
          ) : violations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No violations match the current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="table-header">
                    <tr>
                      <th className="py-3.5 px-4">Worker</th>
                      <th className="py-3.5 px-4">Site</th>
                      <th className="py-3.5 px-4">PPE Type</th>
                      <th className="py-3.5 px-4">Severity</th>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {violations.map((v) => (
                      <tr key={v._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{v.worker?.name || 'Worker'}</div>
                          <div className="text-[10px] text-slate-400">
                            {v.worker?.employeeId} {v.worker?.jobProfile ? `• ${v.worker.jobProfile}` : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{v.site?.name}</td>
                        <td className="py-3.5 px-4">
                          <Badge type="ppe" value={v.ppeType} />
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge type="severity" value={v.severity} />
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {new Date(v.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge type="status" value={v.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {v.status === 'PENDING' ? (
                            <button
                              onClick={() => openAckModal(v)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center space-x-1 ml-auto transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Acknowledge</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              {v.status === 'ACKNOWLEDGED' ? `Ack by ${v.acknowledgedByUser?.name || 'Supervisor'}` : 'Escalated'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination pagination={pagination} onPageChange={(p) => fetchViolations(p)} />
            </div>
          )}
        </div>

        {ackModalOpen && selectedViolation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 border border-slate-200 shadow-xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-base font-bold text-slate-900">Acknowledge Violation</h3>
                <button onClick={() => setAckModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4 text-xs text-slate-600">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <p><strong>Worker:</strong> {selectedViolation.worker?.name} ({selectedViolation.worker?.employeeId})</p>
                  <p><strong>Site:</strong> {selectedViolation.site?.name}</p>
                  <p><strong>PPE Type:</strong> {selectedViolation.ppeType}</p>
                  <p><strong>Timestamp:</strong> {new Date(selectedViolation.timestamp).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes (Optional)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Issued hardhat on site..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAckModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAcknowledge}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Violations;
