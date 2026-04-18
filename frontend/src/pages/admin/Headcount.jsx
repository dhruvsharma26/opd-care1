import { Activity, Users, Zap } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { DEPARTMENT_LOAD } from '../../lib/mockData';

const toPct = (d) => Math.round((d.patients / d.capacity) * 100);

export default function Headcount() {
  const totalPatients = DEPARTMENT_LOAD.reduce((s, d) => s + d.patients, 0);
  const totalCap = DEPARTMENT_LOAD.reduce((s, d) => s + d.capacity, 0);
  const overall = Math.round((totalPatients / totalCap) * 100);

  return (
    <div className="space-y-6 animate-enter">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Live monitor</p>
        <h2 className="font-display text-3xl">Headcount</h2>
        <p className="text-sm text-muted-foreground mt-1">Real-time occupancy across wings</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-elev p-6 flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall occupancy</p>
          <div className="relative w-48 h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={16} data={[{ v: overall, fill: 'hsl(var(--chart-1))' }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="v" cornerRadius={12} background={{ fill: 'hsl(var(--muted))' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <p className="font-display text-5xl leading-none">{overall}<span className="text-xl text-muted-foreground">%</span></p>
                <p className="text-xs text-muted-foreground mt-1">{totalPatients} / {totalCap}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-sage">
            <Activity className="w-3.5 h-3.5" /> Healthy load
          </div>
        </div>

        <div className="lg:col-span-2 card-elev p-6">
          <h3 className="font-display text-xl mb-4">By department</h3>
          <ul className="space-y-4">
            {DEPARTMENT_LOAD.map((d) => {
              const pct = toPct(d);
              const tone = pct > 80 ? 'bg-destructive' : pct > 60 ? 'bg-accent' : 'bg-sage';
              return (
                <li key={d.name} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{d.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{d.patients} / {d.capacity} · {pct}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${tone} rounded-full transition-all`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Current patients', v: totalPatients },
          { icon: Activity, label: 'Capacity', v: totalCap },
          { icon: Zap, label: 'Peak today', v: '74%' },
        ].map((x) => (
          <div key={x.label} className="card-elev p-5">
            <x.icon className="w-5 h-5 text-accent mb-3" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{x.label}</p>
            <p className="font-display text-3xl mt-1">{x.v}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
