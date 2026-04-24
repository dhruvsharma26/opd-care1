import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Stethoscope, Users2, ClipboardList,
  FileText, ShieldCheck, Gauge, HeartPulse,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const MENUS = {
  patient: [
    { to: '/patient', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/patient/appointments', label: 'Book Appointment', icon: Calendar },
    { to: '/patient/register', label: 'New Visit', icon: ClipboardList },
    { to: '/patient/records', label: 'Health Records', icon: HeartPulse },
  ],
  doctor: [
    { to: '/doctor', label: 'Queue', icon: LayoutDashboard, end: true },
    { to: '/doctor/schedule', label: 'Schedule', icon: Calendar },
    { to: '/doctor/authorization', label: 'Authorization', icon: ShieldCheck },
    { to: '/doctor/patients', label: 'Patients', icon: Users2 },
    { to: '/doctor/notes', label: 'Consult Notes', icon: FileText },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: Gauge, end: true },
    { to: '/admin/authorize', label: 'Authorize', icon: ShieldCheck },
    { to: '/admin/audit', label: 'Audit Logs', icon: ShieldCheck },
  ],
};

export default function Sidebar({ role }) {
  const items = MENUS[role] || MENUS.patient;

  return (
    <aside
      data-testid="sidebar"
      className="hidden lg:flex lg:flex-col w-64 shrink-0 border-r border-border bg-card/40 backdrop-blur-md"
    >
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-soft">
            <Stethoscope className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse-ring" />
          </div>
          <div>
            <p className="font-display text-lg leading-none">OPD<span className="text-accent">.</span>care</p>
            <p className="text-[11px] text-muted-foreground tracking-wider uppercase mt-0.5">Smart OPD Assist</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1" data-testid="sidebar-nav">
        <p className="px-3 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {role === 'doctor' ? 'Clinician' : role === 'admin' ? 'Operations' : 'Patient'}
        </p>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
