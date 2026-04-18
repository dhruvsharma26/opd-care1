import { useState, useMemo } from 'react';
import { Clock, Users, CheckCircle2, PlayCircle, PauseCircle, UserRound, ChevronRight, Timer, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { PATIENT_QUEUE } from '../../lib/mockData';
import { useAuth } from '../../context/AuthContext';

const severityTone = {
  high: 'bg-destructive/15 text-destructive border-destructive/30',
  moderate: 'bg-accent/15 text-accent border-accent/30',
  low: 'bg-sage/20 text-sage border-sage/30',
};

const statusTone = {
  'waiting': 'bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))] border-[hsl(var(--sand))]/40',
  'in-progress': 'bg-accent/15 text-accent border-accent/40',
  'completed': 'bg-sage/20 text-sage border-sage/40',
};

function StatCard({ icon: Icon, label, value, delta, tone }) {
  return (
    <div className="card-elev p-5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${tone}`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && <span className="text-[11px] font-mono text-muted-foreground">{delta}</span>}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-4">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState(PATIENT_QUEUE);
  const [selected, setSelected] = useState(PATIENT_QUEUE[0]?.id);

  const counts = useMemo(() => ({
    waiting: patients.filter(p => p.status === 'waiting').length,
    inProgress: patients.filter(p => p.status === 'in-progress').length,
    completed: patients.filter(p => p.status === 'completed').length,
  }), [patients]);

  const setStatus = (id, status) => {
    setPatients(p => p.map(x => x.id === id ? { ...x, status } : x));
    const names = { 'in-progress': 'started', 'completed': 'completed', 'waiting': 'placed on hold' };
    toast.success(`Patient ${names[status]}`);
  };

  const nextPatient = () => {
    const next = patients.find(p => p.status === 'waiting');
    if (!next) return toast('No patients waiting');
    setPatients(p => p.map(x => x.id === next.id ? { ...x, status: 'in-progress' } : x));
    setSelected(next.id);
    toast.success(`Calling ${next.name} · Token #${next.token}`);
  };

  const takeBreak = () => toast('Short break started · queue paused for 10 min', { icon: '☕' });

  const active = patients.find(p => p.id === selected);

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Clinician console</p>
          <h2 className="font-display text-3xl">Good morning, {user?.name?.split(' ').slice(-1)[0]}.</h2>
          <p className="text-sm text-muted-foreground mt-1">You have <span className="text-foreground font-medium">{counts.waiting}</span> patients waiting · average wait <span className="text-foreground font-medium">6 min</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={takeBreak} className="btn-ghost text-sm" data-testid="break-btn"><PauseCircle className="w-4 h-4 mr-1" /> Short break</button>
          <button onClick={nextPatient} className="btn-primary text-sm flex items-center gap-2" data-testid="next-patient-btn"><PlayCircle className="w-4 h-4" /> Next patient</button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Waiting" value={counts.waiting} delta="+2 from 9am" tone="bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))]" />
        <StatCard icon={Users} label="In progress" value={counts.inProgress} delta="live" tone="bg-accent/15 text-accent" />
        <StatCard icon={CheckCircle2} label="Completed" value={counts.completed} delta="today" tone="bg-sage/20 text-sage" />
        <StatCard icon={Timer} label="Avg. consult" value="8.4m" delta="-0.6m" tone="bg-primary/10 text-primary" />
      </section>

      {/* Queue + Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Queue */}
        <div className="card-elev overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl">Patient queue</h3>
              <p className="text-xs text-muted-foreground">Severity-aware ordering</p>
            </div>
            <div className="flex gap-2 text-[11px]">
              <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> High</span>
              <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-accent" /> Mod</span>
              <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-sage" /> Low</span>
            </div>
          </div>
          <ul className="divide-y divide-border" data-testid="queue-list">
            {patients.map((p) => (
              <li
                key={p.id}
                onClick={() => setSelected(p.id)}
                data-testid={`queue-item-${p.id}`}
                className={`group p-5 cursor-pointer transition flex items-start gap-4 hover:bg-muted/40 ${selected === p.id ? 'bg-muted/50' : ''}`}
              >
                <div className="relative w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center font-display text-lg shrink-0">
                  <UserRound className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 font-mono text-[10px] bg-background border border-border rounded-full px-1.5 py-0.5 text-foreground">#{p.token}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{p.name}</p>
                    <span className="divider-dot" />
                    <span className="text-xs text-muted-foreground">{p.age}y · {p.gender}</span>
                    <span className="divider-dot" />
                    <span className="font-mono text-xs text-muted-foreground">{p.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{p.complaint}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`chip text-[10px] border ${severityTone[p.severity]}`}>{p.severity}</span>
                    <span className={`chip text-[10px] border ${statusTone[p.status]}`}>{p.status}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:translate-x-0.5 transition" />
              </li>
            ))}
          </ul>
        </div>

        {/* Detail */}
        <div className="card-elev p-6" data-testid="patient-detail">
          {!active ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Select a patient to see details.</div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sage text-primary-foreground grid place-items-center font-display text-xl">
                  {active.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div>
                  <p className="font-display text-2xl leading-tight">{active.name}</p>
                  <p className="text-xs text-muted-foreground">{active.id} · Token #{active.token} · {active.age}y {active.gender}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Severity</p>
                  <p className="font-display text-base capitalize">{active.severity}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Arrived</p>
                  <p className="font-display text-base">{active.time}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
                  <p className="font-display text-base capitalize">{active.status.replace('-', ' ')}</p>
                </div>
              </div>

              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Chief complaint</p>
              <p className="text-sm leading-relaxed p-4 bg-muted/40 rounded-xl border border-border italic">"{active.complaint}"</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStatus(active.id, 'in-progress')}
                  data-testid="action-start"
                  className="btn-accent text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Start
                </button>
                <button
                  onClick={() => setStatus(active.id, 'completed')}
                  data-testid="action-complete"
                  className="btn-primary text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                </button>
                <button
                  onClick={() => setStatus(active.id, 'waiting')}
                  data-testid="action-hold"
                  className="btn-ghost text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Hold
                </button>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-sage/10 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium">AI suggestion</p>
                </div>
                <p className="text-xs text-muted-foreground">Order a CBC + basic metabolic panel. Consider chest X-ray if respiratory symptoms persist {'>'}48h.</p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
