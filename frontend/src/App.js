import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/layout/AppShell';

import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/patient/Dashboard';
import PatientRegister from './pages/patient/Register';
import BookAppointment from './pages/patient/BookAppointment';
import HealthRecords from './pages/patient/HealthRecords';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorPatients from './pages/doctor/Patients';
import ConsultNotes from './pages/doctor/ConsultNotes';
import DoctorAuthorization from './pages/doctor/Authorization';
import AdminDashboard from './pages/admin/Dashboard';
import Headcount from './pages/admin/Headcount';
import AuditLogs from './pages/admin/AuditLogs';
import AdminAuthorize from './pages/admin/Authorize';

function RoleRedirect() {
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'font-sans',
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '14px',
                fontFamily: 'Manrope, sans-serif',
              },
            }}
          />
          <Routes>
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Patient */}
            <Route element={<AppShell allowedRoles={['patient']} title="Patient overview" subtitle="Your health at a glance" />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/appointments" element={<BookAppointment />} />
              <Route path="/patient/register" element={<PatientRegister />} />
              <Route path="/patient/records" element={<HealthRecords />} />
            </Route>

            {/* Doctor */}
            <Route element={<AppShell allowedRoles={['doctor']} title="Clinician console" subtitle="Queue & consults" />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/schedule" element={<DoctorSchedule />} />
              <Route path="/doctor/authorization" element={<DoctorAuthorization />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/notes" element={<ConsultNotes />} />
            </Route>

            {/* Admin */}
            <Route element={<AppShell allowedRoles={['admin']} title="Operations" subtitle="Hospital pulse" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/authorize" element={<AdminAuthorize />} />
              <Route path="/admin/headcount" element={<Headcount />} />
              <Route path="/admin/audit" element={<AuditLogs />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
