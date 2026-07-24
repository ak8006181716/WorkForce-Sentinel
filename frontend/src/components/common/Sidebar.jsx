import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, BellRing, BarChart3, AlertTriangle, FileSpreadsheet, ShieldCheck } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Supervisors', path: '/admin/supervisors', icon: Users },
    { name: 'Admin Alerts', path: '/admin/alerts', icon: BellRing, badge: '10m Escalations' },
    { name: 'Data Insights', path: '/admin/insights', icon: BarChart3 },
  ];

  const supervisorNav = [
    { name: 'Dashboard', path: '/supervisor/dashboard', icon: LayoutDashboard },
    { name: 'Violations', path: '/supervisor/violations', icon: AlertTriangle },
    { name: 'Reports Export', path: '/supervisor/reports', icon: FileSpreadsheet },
  ];

  const navItems = isAdmin ? adminNav : supervisorNav;

  return (
    <aside className="w-64 glass-sidebar min-h-[calc(100vh-61px)] p-4 hidden md:block flex-shrink-0">
      <div className="mb-6 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Portal: <strong className="text-blue-600">{user?.role}</strong></span>
        </div>
      </div>

      <nav className="space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-700 rounded border border-rose-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
