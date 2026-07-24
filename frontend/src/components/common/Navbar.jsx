import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Shield, LogOut, PlusCircle, Bell } from 'lucide-react';
import { triggerSimulation, forceEscalation } from '../../api/supervisor.api.js';

const Navbar = ({ onRefreshData }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSimulate = async () => {
    try {
      setLoading(true);
      const res = await triggerSimulation({});
      showToast(`Violation logged (${res.data?.ppeType})`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showToast('Failed to log violation');
    } finally {
      setLoading(false);
    }
  };

  const handleForceEscalate = async () => {
    try {
      setLoading(true);
      const res = await forceEscalation();
      showToast(`Escalation check complete (${res.data?.escalatedCount || 0} updated)`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      showToast('Escalation check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-600 text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Workforce Safety</h1>
            <p className="text-xs text-slate-500">PPE Monitoring System</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Log Violation</span>
            </button>
            <button
              onClick={handleForceEscalate}
              disabled={loading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition"
            >
              <Bell className="w-3.5 h-3.5 text-rose-600" />
              <span>Check Escalations</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs font-medium text-blue-600">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="absolute top-16 right-6 z-50 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium shadow-xl">
          {toast}
        </div>
      )}
    </header>
  );
};

export default Navbar;
