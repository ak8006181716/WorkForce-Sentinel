import React from 'react';

const Badge = ({ type = 'status', value }) => {
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (type === 'status') {
    switch (value) {
      case 'PENDING':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'ACKNOWLEDGED':
        styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'ESCALATED':
        styles = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse-glow';
        break;
      default:
        break;
    }
  } else if (type === 'severity') {
    switch (value) {
      case 'LOW':
        styles = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'MEDIUM':
        styles = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'HIGH':
        styles = 'bg-orange-50 text-orange-700 border-orange-200';
        break;
      case 'CRITICAL':
        styles = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
        break;
      default:
        break;
    }
  } else if (type === 'ppe') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (type === 'role') {
    styles = value === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      {value}
    </span>
  );
};

export default Badge;
