import { Building2, Users, BedDouble, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { DEPARTMENTS_META } from '../../lib/extraMockData';

export default function Departments() {
  return (
    <div className="space-y-6 animate-enter">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Org chart</p>
        <h2 className="font-display text-3xl">Departments</h2>
        <p className="text-sm text-muted-foreground mt-1">6 departments · tap a card to drill in</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="departments-grid">
        {DEPARTMENTS_META.map((d) => (
          <button
            key={d.name}
            onClick={() => toast(`Opening ${d.name} details (demo)`)}
            data-testid={`dept-${d.name.replace(/\s+/g, '-')}`}
            className="card-elev p-5 text-left hover:border-ring/60 hover:-translate-y-0.5 transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-accent/15 text-accent grid place-items-center">
                <Building2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition" />
            </div>
            <p className="font-display text-xl leading-tight">{d.name}</p>
            <p className="text-xs text-muted-foreground">Head · {d.head}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {d.staff} staff</span>
              <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" /> {d.beds} beds</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Occupancy</span>
                <span className="font-mono">{d.occupancy}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div style={{ width: `${d.occupancy}%` }} className={`h-full rounded-full ${d.occupancy > 80 ? 'bg-destructive' : d.occupancy > 65 ? 'bg-accent' : 'bg-sage'}`} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
