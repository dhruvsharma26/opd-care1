import { useState, useMemo } from 'react';
import { Download, FileText, Pill, Beaker, Syringe, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { HEALTH_RECORDS } from '../../lib/extraMockData';

const typeIcon = { Lab: Beaker, Imaging: ImageIcon, Prescription: Pill, Vaccination: Syringe };
const statusTone = {
  normal: 'bg-sage/20 text-sage border-sage/30',
  review: 'bg-accent/15 text-accent border-accent/30',
  active: 'bg-primary/10 text-primary border-primary/25',
  complete: 'bg-muted text-muted-foreground border-border',
};

const TYPES = ['All', 'Lab', 'Imaging', 'Prescription', 'Vaccination'];

export default function HealthRecords() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('All');

  const filtered = useMemo(() => HEALTH_RECORDS.filter(r => {
    if (type !== 'All' && r.type !== type) return false;
    if (q && !`${r.title} ${r.doctor}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, type]);

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Your history</p>
          <h2 className="font-display text-3xl">Health records</h2>
          <p className="text-sm text-muted-foreground mt-1">All labs, prescriptions and reports in one place.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="records-search" placeholder="Search records…" className="input-base pl-9 w-64" />
          </div>
          <button onClick={() => toast.success('Records exported to PDF (demo).')} data-testid="records-export" className="btn-ghost text-sm flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            data-testid={`records-type-${t}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${type === t ? 'bg-primary text-primary-foreground border-primary shadow-soft' : 'bg-card border-border hover:border-ring/60'}`}
          >{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3" data-testid="records-list">
        {filtered.map((r) => {
          const Ic = typeIcon[r.type] || FileText;
          return (
            <div key={r.id} className="card-elev p-5 flex items-center gap-4 hover:border-ring/60 transition">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <Ic className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{r.title}</p>
                  <span className={`chip text-[10px] border ${statusTone[r.status]}`}>{r.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.type} · {r.doctor} · {r.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toast('Opening ' + r.title + ' (demo)')} data-testid={`record-view-${r.id}`} className="btn-ghost text-xs">View</button>
                <button onClick={() => toast.success('Downloaded ' + r.title)} data-testid={`record-dl-${r.id}`} className="btn-primary text-xs">Download</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="card-elev p-10 text-center text-sm text-muted-foreground">No records match your filters.</div>
        )}
      </div>
    </div>
  );
}
