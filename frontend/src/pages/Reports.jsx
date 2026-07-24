import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { exportReport, getSites } from '../api/supervisor.api.js';
import { FileSpreadsheet, Download, Calendar, Filter, CheckCircle2 } from 'lucide-react';

const Reports = () => {
  const [sites, setSites] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [siteId, setSiteId] = useState('');
  const [status, setStatus] = useState('');
  const [exporting, setExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await getSites();
        if (res.success) setSites(res.data || []);
      } catch (err) {
        console.error('Fetch sites error:', err);
      }
    };
    fetchSites();
  }, []);

  const handleExportCSV = async (e) => {
    e.preventDefault();
    setExporting(true);
    setSuccessMessage('');

    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (siteId) params.siteId = siteId;
      if (status) params.status = status;

      const blobData = await exportReport(params);

      const url = window.URL.createObjectURL(new Blob([blobData], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ppe_violations_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccessMessage('CSV Audit Report downloaded successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to export CSV report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports Export</h1>
          <p className="text-xs text-slate-500 mt-1">Export violation logs, acknowledgments, and escalations to CSV format.</p>
        </div>

        <div className="card-panel p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Export CSV Report</h2>
              <p className="text-xs text-slate-500">Configure report filters below</p>
            </div>
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleExportCSV} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Filter by Site</label>
                <div className="relative">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Filter by Status</label>
                <div className="relative">
                  <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                    <option value="ESCALATED">ESCALATED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={exporting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center space-x-2 transition disabled:opacity-50 shadow-2xs"
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? 'Generating CSV...' : 'Download CSV'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
