import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppShell from './components/layout/AppShell';

import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/patient/Dashboard';
import PatientRegister from './pages/patient/Register';
import BookAppointment from './pages/patient/BookAppointment';
import DoctorDashboard from './pages/doctor/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Headcount from './pages/admin/Headcount';

function ComingSoon({ title }) {
  return (
    <div className="card-elev p-10 text-center animate-enter">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">Coming soon</p>
      <h2 className="font-display text-3xl mt-2">{title}</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">We're polishing this view — check back shortly. Meanwhile, explore the live dashboards.</p>
    </div>
  );
}

function RoleRedirect() {
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Patient */}
            <Route element={<AppShell allowedRoles={['patient']} title="Patient overview" subtitle="Your health at a glance" />}>
              <Route path="/patient" element={<PatientDashboard />} />
              <Route path="/patient/appointments" element={<BookAppointment />} />
              <Route path="/patient/register" element={<PatientRegister />} />
              <Route path="/patient/records" element={<ComingSoon title="Health records" />} />
            </Route>

            {/* Doctor */}
            <Route element={<AppShell allowedRoles={['doctor']} title="Clinician console" subtitle="Queue & consults" />}>
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/schedule" element={<ComingSoon title="My schedule" />} />
              <Route path="/doctor/patients" element={<ComingSoon title="Patients I've seen" />} />
              <Route path="/doctor/notes" element={<ComingSoon title="Consult notes" />} />
            </Route>

            {/* Admin */}
            <Route element={<AppShell allowedRoles={['admin']} title="Operations" subtitle="Hospital pulse" />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/headcount" element={<Headcount />} />
              <Route path="/admin/staff" element={<ComingSoon title="Staff directory" />} />
              <Route path="/admin/departments" element={<ComingSoon title="Departments" />} />
              <Route path="/admin/audit" element={<ComingSoon title="Audit logs" />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
