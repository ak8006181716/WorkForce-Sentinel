import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import StatCard from '../components/common/StatCard.jsx';
import Loader from '../components/common/Loader.jsx';
import Badge from '../components/common/Badge.jsx';
import { getSupervisorDashboard, getViolations, acknowledgeViolation } from '../api/supervisor.api.js';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, Check } from 'lucide-react';

const SupervisorDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [pendingViolations, setPendingViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acknowledgingId, setAcknowledgingId] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, violationsRes] = await Promise.all([
        getSupervisorDashboard(),
        getViolations({ status: 'PENDING', limit: 5 }),
      ]);

      if (dashRes.success) setMetrics(dashRes.data);
      if (violationsRes.success) setPendingViolations(violationsRes.data.violations || []);
    } catch (err) {
      console.error('Supervisor dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledge = async (id) => {
    try {
      setAcknowledgingId(id);
      await acknowledgeViolation(id, 'Acknowledged by supervisor');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to acknowledge violation');
    } finally {
      setAcknowledgingId(null);
    }
  };

  return (
    <DashboardLayout onRefreshData={fetchData}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Supervisor Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Review site violations and acknowledge pending incidents.</p>
          </div>
          <button
            onClick={() => navigate('/supervisor/violations')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition"
          >
            <span>View All Violations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <Loader text="Loading metrics..." />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                title="Today's Violations"
                value={metrics?.todaysViolations || 0}
                icon={Clock}
                color="blue"
                subtitle="Reported last 24 hours"
              />
              <StatCard
                title="Pending Violations"
                value={metrics?.pendingViolations || 0}
                icon={AlertTriangle}
                color="amber"
                subtitle="Requires acknowledgment"
                cursorPointer
                onClick={() => navigate('/supervisor/violations?status=PENDING')}
              />
              <StatCard
                title="Acknowledged Violations"
                value={metrics?.acknowledgedViolations || 0}
                icon={CheckCircle2}
                color="emerald"
                subtitle="Reviewed by supervisors"
              />
            </div>

            <div className="card-panel p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Pending Violations (&lt; 10 Mins)</h2>
                  <p className="text-xs text-slate-500">Acknowledge violations before 10 minutes to prevent escalation.</p>
                </div>
                <button
                  onClick={() => navigate('/supervisor/violations')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              {pendingViolations.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No pending violations.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="table-header">
                      <tr>
                        <th className="py-3.5 px-4">Worker</th>
                        <th className="py-3.5 px-4">Site</th>
                        <th className="py-3.5 px-4">PPE Type</th>
                        <th className="py-3.5 px-4">Severity</th>
                        <th className="py-3.5 px-4">Timestamp</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingViolations.map((v) => (
                        <tr key={v._id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{v.worker?.name || 'Worker'}</div>
                            <div className="text-[10px] text-slate-400">{v.worker?.employeeId}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">{v.site?.name}</td>
                          <td className="py-3.5 px-4">
                            <Badge type="ppe" value={v.ppeType} />
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge type="severity" value={v.severity} />
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {new Date(v.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleAcknowledge(v._id)}
                              disabled={acknowledgingId === v._id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs flex items-center space-x-1 ml-auto transition disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{acknowledgingId === v._id ? 'Saving...' : 'Acknowledge'}</span>
                            </button>
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

export default SupervisorDashboard;
