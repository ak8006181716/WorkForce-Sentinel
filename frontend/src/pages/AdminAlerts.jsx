import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import Pagination from '../components/common/Pagination.jsx';
import { getAlerts } from '../api/admin.api.js';
import { getSites } from '../api/supervisor.api.js';
import { Search, Filter, ShieldCheck, Clock } from 'lucide-react';

const AdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [sites, setSites] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await getAlerts({ page, limit: 10, search, siteId });
      if (res.success) {
        setAlerts(res.data.alerts || []);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Admin alerts fetch error:', err);
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
      fetchAlerts(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, siteId]);

  const getTimeElapsedMinutes = (timestamp) => {
    const minutes = Math.floor((new Date() - new Date(timestamp)) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <DashboardLayout onRefreshData={() => fetchAlerts(pagination.page)}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900">Admin Alerts</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              &gt; 10m Escalations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Violations automatically escalated to admin because they were unacknowledged by site supervisors within 10 minutes.
          </p>
        </div>

        <div className="card-panel p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 flex items-center space-x-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by worker, employee ID, or site..."
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
        </div>

        <div className="card-panel p-6">
          {loading ? (
            <Loader text="Loading escalated alerts..." />
          ) : alerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">No Escalated Alerts</h3>
              <p className="text-xs text-slate-500 mt-1">Supervisors are acknowledging safety violations within 10 minutes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="table-header">
                    <tr>
                      <th className="py-3.5 px-4">Worker & ID</th>
                      <th className="py-3.5 px-4">Site</th>
                      <th className="py-3.5 px-4">PPE Type</th>
                      <th className="py-3.5 px-4">Severity</th>
                      <th className="py-3.5 px-4">Time Elapsed</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alerts.map((alert) => (
                      <tr key={alert._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{alert.worker?.name || 'Worker'}</div>
                          <div className="text-[10px] text-slate-400">
                            {alert.worker?.employeeId} | {alert.worker?.iotDeviceId}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{alert.site?.name}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge type="ppe" value={alert.ppeType} />
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge type="severity" value={alert.severity} />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1 text-rose-600 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{getTimeElapsedMinutes(alert.timestamp)}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge type="status" value={alert.status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                          {alert.notes || 'IoT anomaly signal'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination pagination={pagination} onPageChange={(p) => fetchAlerts(p)} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAlerts;
