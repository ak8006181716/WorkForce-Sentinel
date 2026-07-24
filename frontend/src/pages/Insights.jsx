import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Loader from '../components/common/Loader.jsx';
import { getInsights } from '../api/admin.api.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Calendar } from 'lucide-react';

const COLORS = ['#2563eb', '#0284c7', '#7c3aed', '#db2777', '#d97706', '#059669'];

const Insights = () => {
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await getInsights();
      if (res.success) {
        setInsightsData(res.data);
      }
    } catch (err) {
      console.error('Fetch insights error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <DashboardLayout onRefreshData={fetchInsights}>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Data Insights</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual statistics for PPE violations across sites, equipment types, and time trends.
          </p>
        </div>

        {loading ? (
          <Loader text="Generating charts..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-panel p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Violations by Site</h3>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insightsData?.violationsBySite || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="siteCode" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Violations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-panel p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <PieIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-base font-bold text-slate-900">Violations by PPE Type</h3>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={insightsData?.violationsByPPE || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="ppeType"
                    >
                      {(insightsData?.violationsByPPE || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-panel p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Daily Violations</h3>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insightsData?.dailyViolations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#059669" fillOpacity={1} fill="url(#colorCount)" name="Total Incidents" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card-panel p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <h3 className="text-base font-bold text-slate-900">Monthly Violations</h3>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insightsData?.monthlyViolations || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
                    />
                    <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} name="Monthly Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Insights;
