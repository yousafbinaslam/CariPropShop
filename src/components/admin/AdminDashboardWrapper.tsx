import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthGuard from './AuthGuard';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import DataVisualization from './DataVisualization';
import AuditTrail from './AuditTrail';
import { useRealTimeNotifications } from './NotificationSystem';

const AdminDashboardWrapper: React.FC = () => {
  // Initialize real-time notifications
  useRealTimeNotifications();

  return (
    <AuthGuard>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/analytics" element={<DataVisualization />} />
        <Route path="/audit" element={<AuditTrail />} />
      </Routes>
    </AuthGuard>
  );
};

export default AdminDashboardWrapper;