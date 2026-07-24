import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminSupervisors from './pages/AdminSupervisors';
import AdminAlerts from './pages/AdminAlerts';
import Insights from './pages/Insights';

import SupervisorDashboard from './pages/SupervisorDashboard';
import Violations from './pages/Violations';
import Reports from './pages/Reports';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return user?.role === 'ADMIN' ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/supervisor/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/supervisors" element={<AdminSupervisors />} />
            <Route path="/admin/alerts" element={<AdminAlerts />} />
            <Route path="/admin/insights" element={<Insights />} />
          </Route>

          {/* Supervisor Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SUPERVISOR', 'ADMIN']} />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/violations" element={<Violations />} />
            <Route path="/supervisor/reports" element={<Reports />} />
          </Route>

          {/* Root Redirect & Catch-All */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
