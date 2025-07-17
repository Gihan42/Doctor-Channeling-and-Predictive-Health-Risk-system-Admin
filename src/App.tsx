import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
// Auth
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
// Layout
import AdminLayout from './components/layout/AdminLayout';
// Pages
import Dashboard from './pages/Dashboard';
import DoctorList from './pages/doctors/DoctorList';
import DoctorForm from './pages/doctors/DoctorForm';
import MedicalCenterList from './pages/medicalCenters/MedicalCenterList';
import MedicalCenterForm from './pages/medicalCenters/MedicalCenterForm';
import ScheduleManagement from './pages/scheduling/ScheduleManagement';
import PatientList from './pages/patients/PatientList';
import AdminList from './pages/admins/AdminList';
import AdminForm from './pages/admins/AdminForm';
import EmailSystem from './pages/email/EmailSystem';
import PasswordChange from './pages/profile/PasswordChange';
import JwtRedirect   from "./contexts/JwtRedirect.tsx";
export function App() {
  return <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>}>
            <Route path={"/"} element={<JwtRedirect />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="doctors">
              <Route index element={<DoctorList />} />
              <Route path="new" element={<DoctorForm />} />
              <Route path="edit/:id" element={<DoctorForm />} />
            </Route>
            <Route path="medical-centers">
              <Route index element={<MedicalCenterList />} />
              <Route path="new" element={<MedicalCenterForm />} />
              <Route path="edit/:id" element={<MedicalCenterForm />} />
            </Route>
            <Route path="scheduling" element={<ScheduleManagement />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="admins">
              <Route index element={<AdminList />} />
              <Route path="new" element={<AdminForm />} />
              <Route path="edit/:id" element={<AdminForm />} />
            </Route>
            <Route path="email" element={<EmailSystem />} />
            <Route path="change-password" element={<PasswordChange />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>;
}