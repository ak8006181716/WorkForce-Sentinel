import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import StatCard from '../components/common/StatCard.jsx';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import { getDashboard, getAlerts } from '../api/admin.api.js';
import { Users, HardHat, AlertOctagon, BellRing, ArrowUpRight, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, alertsRes] = await Promise.all([
        getDashboard(),
        getAlerts({ page: 1, limit: 5 }),
      ]);

      if (dashRes.success) setMetrics(dashRes.data);
      if (alertsRes.success) setRecentAlerts(alertsRes.data.alerts || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DashboardLayout onRefreshData={fetchData}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Overview of workers, supervisors, violations, and escalations.</p>
          </div>
          <button
            onClick={() => navigate('/admin/alerts')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
          >
            <BellRing className="w-4 h-4" />
            <span>Escalated Alerts</span>
          </button>
        </div>

        {loading ? (
          <Loader text="Loading dashboard metrics..." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Workers"
                value={metrics?.totalWorkers || 0}
                icon={HardHat}
                color="blue"
                subtitle="Equipped with IoT devices"
              />
              <StatCard
                title="Total Supervisors"
                value={metrics?.totalSupervisors || 0}
                icon={Users}
                color="emerald"
                subtitle="Active site leads"
              />
              <StatCard
                title="Total Violations"
                value={metrics?.totalViolations || 0}
                icon={AlertOctagon}
                color="amber"
                subtitle="All logged incidents"
              />
              <StatCard
                title="Active Escalated Alerts"
                value={metrics?.activeAlertsCount || 0}
                icon={BellRing}
                color="red"
                subtitle="Unacknowledged > 10m"
                cursorPointer
                onClick={() => navigate('/admin/alerts')}
              />
            </div>

            <div className="card-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Escalated Alerts (&gt; 10 Mins)</h2>
                  <p className="text-xs text-slate-500">Violations unacknowledged for more than 10 minutes.</p>
                </div>
                <button
                  onClick={() => navigate('/admin/alerts')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No pending escalated alerts.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="table-header">
                      <tr>
                        <th className="py-3 px-4">Worker</th>
                        <th className="py-3 px-4">Site</th>
                        <th className="py-3 px-4">PPE Type</th>
                        <th className="py-3 px-4">Severity</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentAlerts.map((alert) => (
                        <tr key={alert._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{alert.worker?.name || 'Worker'}</div>
                            <div className="text-[10px] text-slate-400">{alert.worker?.employeeId}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{alert.site?.name}</td>
                          <td className="py-3 px-4">
                            <Badge type="ppe" value={alert.ppeType} />
                          </td>
                          <td className="py-3 px-4">
                            <Badge type="severity" value={alert.severity} />
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono">
                            {new Date(alert.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge type="status" value={alert.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
