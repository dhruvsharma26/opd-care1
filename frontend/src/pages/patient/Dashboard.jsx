import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CalendarCheck2, HeartPulse, Pill, FileText, ArrowRight,
  Activity, Droplets, Wind, Stethoscope, MapPin, Clock3
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { PATIENT_APPOINTMENTS, VITALS_TREND, DOCTORS } from '../../lib/mockData';

function Stat({ icon: Icon, label, value, unit, tone = 'primary' }) {
  const toneMap = {
    primary: 'text-primary bg-primary/10',
    accent: 'text-accent bg-accent/10',
    sage: 'text-sage bg-sage/10',
    sand: 'text-[hsl(var(--sand))] bg-[hsl(var(--sand))]/15',
  };
  return (
    <div className="card-elev p-5">
      <div className={`w-10 h-10 rounded-xl grid place-items-center mb-3 ${toneMap[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-display text-3xl mt-1">{value}<span className="text-sm text-muted-foreground font-sans ml-1">{unit}</span></p>
    </div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const next = PATIENT_APPOINTMENTS.find((a) => a.status === 'confirmed' || a.status === 'upcoming');

  return (
    <div className="space-y-8 animate-enter">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl p-8 border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-sage/10">
        <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-accent/15 blur-3xl animate-drift" />
        <div className="relative flex flex-col lg:flex-row lg:items-end gap-6 justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Good morning</p>
            <h2 className="font-display text-4xl sm:text-5xl leading-tight mt-1">
              {user?.name?.split(' ')[0] || 'Friend'},<br />
              <span className="italic">let's take it easy today.</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md text-sm">Your last vitals were gentle. You have one confirmed consultation this morning.</p>
          </div>

          {next && (
            <div className="glass rounded-2xl p-5 min-w-[300px]" data-testid="next-appointment-card">
              <div className="flex items-center justify-between mb-3">
                <span className="chip"><CalendarCheck2 className="w-3 h-3 text-accent" /> Next consult</span>
                <span className="font-mono text-[11px] text-muted-foreground">{next.id}</span>
              </div>
              <p className="font-display text-xl leading-tight">{next.doctor}</p>
              <p className="text-xs text-muted-foreground">{next.specialty}</p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-muted-foreground" />{next.date} · {next.time}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{next.room}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/patient/register" className="btn-primary text-xs py-1.5 px-3" data-testid="start-visit-btn">Start visit</Link>
                <button onClick={() => toast('Reschedule link sent to your phone (demo)')} className="btn-ghost text-xs py-1.5 px-3" data-testid="reschedule-btn">Reschedule</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Vital stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={HeartPulse} label="Heart rate" value="73" unit="bpm" tone="accent" />
        <Stat icon={Activity} label="Blood pressure" value="120/78" unit="mmHg" tone="primary" />
        <Stat icon={Droplets} label="SpO₂" value="98" unit="%" tone="sage" />
        <Stat icon={Wind} label="Respiration" value="16" unit="bpm" tone="sand" />
      </section>

      {/* Chart + Appts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Vitals · last 7 days</h3>
              <p className="text-xs text-muted-foreground">Auto-captured from your wearable</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-1))]" /> BP</span>
              <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--chart-2))]" /> HR</span>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VITALS_TREND} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Area type="monotone" dataKey="bp" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="hr" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">Appointments</h3>
            <Link to="/patient/appointments" className="text-xs text-accent flex items-center gap-1 link-underline" data-testid="view-all-appts">View all <ArrowRight className="w-3 h-3" /></Link>
          </div>
          <ul className="space-y-3" data-testid="appointments-list">
            {PATIENT_APPOINTMENTS.map((a) => (
              <li key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-ring/60 transition">
                <div className={`w-9 h-9 shrink-0 rounded-lg grid place-items-center text-xs font-semibold ${
                  a.status === 'confirmed' ? 'bg-accent/15 text-accent'
                  : a.status === 'upcoming' ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
                }`}>
                  {a.date.split(',')[0].slice(0,3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.doctor}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.specialty} · {a.time}</p>
                </div>
                <span className={`chip text-[10px] ${
                  a.status === 'confirmed' ? 'bg-accent/15 text-accent border-accent/30'
                  : a.status === 'upcoming' ? 'bg-primary/10 text-primary border-primary/20'
                  : ''
                }`}>{a.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Recommended doctors */}
      <section className="card-elev p-6">
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

      {/* Quick actions */}
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
