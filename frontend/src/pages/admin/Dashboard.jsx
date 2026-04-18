import { Users, Activity, Calendar, FileText, TrendingUp, Download, Bell, Stethoscope, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { DEPARTMENT_LOAD, FOOTFALL_BY_HOUR, ACTIVITY_LOGS } from '../../lib/mockData';

const logTone = {
  register: 'bg-primary/10 text-primary',
  consult: 'bg-sage/20 text-sage',
  ai: 'bg-accent/15 text-accent',
  shift: 'bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))]',
  alert: 'bg-destructive/15 text-destructive',
  book: 'bg-primary/10 text-primary',
  export: 'bg-muted text-muted-foreground',
};

function Kpi({ icon: Icon, label, value, trend, tone }) {
  return (
    <div className="card-elev p-5 relative overflow-hidden">
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl ${tone}`} />
      <div className={`relative w-10 h-10 rounded-xl grid place-items-center mb-4 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider relative">{label}</p>
      <div className="flex items-baseline gap-2 relative">
        <p className="font-display text-3xl">{value}</p>
        {trend && <span className="text-xs text-sage flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" />{trend}</span>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 animate-enter">
      {/* Hero strip */}
      <section className="relative overflow-hidden rounded-3xl p-8 border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-sage/10">
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-drift" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Operations · {date}</p>
            <h2 className="font-display text-4xl leading-tight mt-1">OPD running <span className="italic text-sage">smoothly.</span></h2>
            <p className="text-muted-foreground mt-2 text-sm">Occupancy 68% · 3 departments above threshold · no critical alerts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm flex items-center gap-2" data-testid="notify-all-btn"><Bell className="w-3.5 h-3.5" /> Notify staff</button>
            <button className="btn-primary text-sm flex items-center gap-2" data-testid="export-report-btn"><Download className="w-3.5 h-3.5" /> Export daily report</button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Users} label="Patients today" value="142" trend="+12%" tone="bg-primary/10 text-primary" />
        <Kpi icon={Stethoscope} label="Doctors online" value="11" trend="+2" tone="bg-accent/15 text-accent" />
        <Kpi icon={Activity} label="Avg. wait" value="9.4m" trend="-1.2m" tone="bg-sage/20 text-sage" />
        <Kpi icon={FileText} label="Pending cases" value="08" tone="bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))]" />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Department occupancy</h3>
              <p className="text-xs text-muted-foreground">Current patients vs. capacity</p>
            </div>
            <span className="chip"><span className="w-1.5 h-1.5 rounded-full bg-sage" /> Live</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_LOAD} margin={{ left: -10, top: 10 }} barGap={6}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: 'hsl(var(--muted) / 0.5)' }}
                />
                <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="patients" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Footfall · today</h3>
              <p className="text-xs text-muted-foreground">Hourly patient inflow</p>
            </div>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FOOTFALL_BY_HOUR} margin={{ left: -15, top: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2.5}
                  dot={{ fill: 'hsl(var(--chart-2))', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Activity + Controls */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Activity stream</h3>
              <p className="text-xs text-muted-foreground">System-wide recent events</p>
            </div>
            <button className="text-xs text-muted-foreground link-underline" data-testid="clear-logs-btn">Clear</button>
          </div>
          <ul className="space-y-2" data-testid="activity-logs">
            {ACTIVITY_LOGS.map((log) => (
              <li key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition">
                <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${logTone[log.type]}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{log.timestamp}</span><span className="divider-dot" /><span>{log.user}</span>
                  </div>
                </div>
                <span className="chip text-[10px] uppercase tracking-wider">{log.type}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="card-elev p-6">
            <h3 className="font-display text-xl mb-4">System controls</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Generate daily report', tone: 'primary', testid: 'ctrl-report' },
                { label: 'Export patient CSV', tone: 'accent', testid: 'ctrl-export' },
                { label: 'Broadcast notice', tone: 'sage', testid: 'ctrl-broadcast' },
                { label: 'Clear audit logs', tone: 'ghost', testid: 'ctrl-clear' },
              ].map((b) => (
                <button
                  key={b.label}
                  data-testid={b.testid}
                  className={`w-full text-sm py-2.5 rounded-xl border transition text-left px-4 ${
                    b.tone === 'primary' ? 'bg-primary text-primary-foreground border-primary hover:opacity-90' :
                    b.tone === 'accent' ? 'bg-accent/10 text-accent border-accent/30 hover:bg-accent/15' :
                    b.tone === 'sage' ? 'bg-sage/15 text-sage border-sage/30 hover:bg-sage/20' :
                    'bg-card border-border hover:border-ring/60 text-foreground'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card-elev p-6 bg-gradient-to-br from-accent/10 to-sage/10 border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="font-medium text-sm">Ops insight</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Pediatrics load spikes at 11am on weekdays. Consider adding a float nurse between 10:30–12:30 to reduce wait times by ~35%.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
