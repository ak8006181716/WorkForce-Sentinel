import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, onClick, cursorPointer = false }) => {
  const colorMap = {
    blue: 'bg-blue-50/50 border-blue-100 text-blue-600',
    amber: 'bg-amber-50/50 border-amber-100 text-amber-600',
    emerald: 'bg-emerald-50/50 border-emerald-100 text-emerald-600',
    red: 'bg-rose-50/50 border-rose-100 text-rose-600',
    purple: 'bg-purple-50/50 border-purple-100 text-purple-600',
  };

  const badgeStyle = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`glass-card bg-white rounded-xl p-6 transition-all duration-200 hover:shadow-md ${
        cursorPointer ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${badgeStyle}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
