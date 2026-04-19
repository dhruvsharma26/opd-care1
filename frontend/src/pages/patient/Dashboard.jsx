import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CalendarCheck2, Pill, FileText, ArrowRight,
  Sparkles, Stethoscope, MapPin, Clock3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, patientAPI } from '../../services/api';
import { DOCTORS } from '../../lib/mockData';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.patientId) {
          const patientRes = await patientAPI.getById(user.patientId);
          setPatientDetails(patientRes.data);
        }

        if (user?.patientId) {
          const appointmentsRes = await appointmentAPI.getPatientAppointments(user.patientId);
          setAppointments(appointmentsRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Failed to load appointment data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.patientId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const next = appointments.find((a) => a.status === 'confirmed' || a.status === 'upcoming');
  const scheduledAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'upcoming',
  );
  const recentAppointments = appointments.slice(0, 5);
  const healthRecommendations = [
    patientDetails?.latestComplaint
      ? `Keep tracking symptoms like "${patientDetails.latestComplaint}" and share any change in duration or intensity during your consult.`
      : 'If you notice new symptoms, describe them early so the care team can guide you sooner.',
    'Aim for regular sleep, enough water, and light movement every day to support general health.',
    'Choose balanced meals, reduce overly oily or sugary foods, and try to keep meal timing consistent.',
    'If fever, breathing trouble, chest pain, or sudden weakness gets worse, seek urgent care instead of waiting.',
  ];

  return (
    <div className="space-y-8 animate-enter">
      <section className="relative overflow-hidden rounded-3xl p-8 border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-sage/10">
        <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-accent/15 blur-3xl animate-drift" />
        <div className="relative flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Good morning</p>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight mt-1">
              {user?.name?.split(' ')[0] || 'Friend'},<br />
              <span className="italic">let&apos;s take it easy today.</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md text-sm">
              {next
                ? `You have ${scheduledAppointments.length} scheduled appointment${scheduledAppointments.length > 1 ? 's' : ''} coming up.`
                : 'No upcoming appointments right now.'}
            </p>
          </div>

          {next && (
            <div className="glass rounded-2xl p-5 min-w-[300px]" data-testid="next-appointment-card">
              <div className="flex items-center justify-between mb-3">
                <span className="chip"><CalendarCheck2 className="w-3 h-3 text-accent" /> Next consult</span>
                <span className="font-mono text-[11px] text-muted-foreground">{next._id?.slice(-6) || next.id}</span>
              </div>
              <p className="font-display text-xl leading-tight">{next.doctorName || 'Dr. Assigned'}</p>
              <p className="text-xs text-muted-foreground">{next.specialty || 'General Practice'}</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-muted-foreground" />{next.date} · {next.time}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{next.room || 'OPD-A'}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/patient/register" className="btn-primary text-xs py-1.5 px-3" data-testid="start-visit-btn">Start visit</Link>
                <button onClick={() => toast('Reschedule link sent to your phone')} className="btn-ghost text-xs py-1.5 px-3" data-testid="reschedule-btn">Reschedule</button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Scheduled appointments</h3>
              <p className="text-xs text-muted-foreground">Your confirmed and upcoming visits at a glance</p>
            </div>
            <Link to="/patient/appointments" className="text-xs text-accent flex items-center gap-1 link-underline">
              Manage schedule <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground">Loading schedule...</p>
          ) : scheduledAppointments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No scheduled appointments yet. Once you book a consult, it will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledAppointments.map((appointment) => (
                <div
                  key={appointment._id || appointment.id}
                  className="rounded-2xl border border-border p-4 flex flex-col md:flex-row md:items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                    <CalendarCheck2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{appointment.doctorName || 'Doctor assigned'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {appointment.specialty || 'General'} · {appointment.date || 'Date pending'} · {appointment.time || 'Time pending'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {appointment.room || 'Room will be shared before the visit'}
                    </p>
                    {appointment.complaint && (
                      <p className="text-sm mt-2">{appointment.complaint}</p>
                    )}
                  </div>
                  <span className={`chip text-[10px] uppercase tracking-wider ${
                    appointment.status === 'confirmed'
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">Appointments</h3>
            <Link to="/patient/appointments" className="text-xs text-accent flex items-center gap-1 link-underline" data-testid="view-all-appts">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : recentAppointments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No appointments yet. <Link to="/patient/appointments" className="text-accent">Book one</Link></p>
          ) : (
            <ul className="space-y-3" data-testid="appointments-list">
              {recentAppointments.map((a) => (
                <li key={a._id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-ring/60 transition">
                  <div className={`w-9 h-9 shrink-0 rounded-lg grid place-items-center text-xs font-semibold ${
                    a.status === 'confirmed' ? 'bg-accent/15 text-accent'
                    : a.status === 'upcoming' ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {a.date?.split('-')[2] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.doctorName || 'Doctor'}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.specialty || 'General'} · {a.time || 'TBA'}</p>
                  </div>
                  <span className={`chip text-[10px] ${
                    a.status === 'confirmed' ? 'bg-accent/15 text-accent border-accent/30'
                    : a.status === 'upcoming' ? 'bg-primary/10 text-primary border-primary/20'
                    : ''
                  }`}>{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card-elev p-6 bg-gradient-to-br from-accent/10 via-primary/5 to-sage/10 border-accent/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-accent" />
          <div>
            <h3 className="font-display text-xl">AI wellness recommendations</h3>
            <p className="text-xs text-muted-foreground">General health guidance for a better daily routine</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {healthRecommendations.map((item) => (
            <div key={item} className="rounded-2xl bg-background/70 border border-border p-4">
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl">Recommended for you</h3>
            <p className="text-xs text-muted-foreground">Based on your history & current symptoms</p>
          </div>
          <Link to="/patient/appointments" className="btn-ghost text-xs" data-testid="browse-doctors-btn">Browse all</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOCTORS.slice(0, 3).map((d) => (
            <div key={d.id} className="group relative rounded-2xl p-5 border border-border hover:border-ring/60 transition-all hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl grid place-items-center font-display text-lg ${
                  d.color === 'sage' ? 'bg-sage/20 text-sage'
                  : d.color === 'accent' ? 'bg-accent/15 text-accent'
                  : 'bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))]'
                }`}>{d.avatar}</div>
                {d.availableToday && <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-sage" /> Today</span>}
              </div>
              <p className="font-display text-lg leading-tight">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.specialty} · {d.exp} yrs</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Next slot</p>
                  <p className="text-sm font-medium">{d.nextSlot}</p>
                </div>
                <Link
                  to="/patient/appointments"
                  state={{ doctorId: d.id }}
                  className="btn-accent text-xs py-1.5 px-3"
                  data-testid={`book-doc-${d.id}`}
                >
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Stethoscope, title: 'Describe symptoms', hint: 'Voice or text', to: '/patient/register', testid: 'qa-register' },
          { icon: Pill, title: 'My prescriptions', hint: '2 active', to: '/patient/records', testid: 'qa-prescriptions' },
          { icon: FileText, title: 'Lab reports', hint: '5 available', to: '/patient/records', testid: 'qa-reports' },
        ].map((q) => (
          <Link
            key={q.title}
            to={q.to}
            data-testid={q.testid}
            className="card-elev p-5 flex items-center gap-4 hover:border-ring/70 transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <q.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{q.title}</p>
              <p className="text-xs text-muted-foreground">{q.hint}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition" />
          </Link>
        ))}
      </section>
    </div>
  );
}
