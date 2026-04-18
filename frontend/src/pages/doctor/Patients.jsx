import { useState, useMemo } from 'react';
import { Search, ChevronRight, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { DOCTOR_PATIENTS } from '../../lib/extraMockData';

export default function DoctorPatients() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => DOCTOR_PATIENTS.filter((p) =>
    !q || `${p.name} ${p.id} ${p.diagnosis}`.toLowerCase().includes(q.toLowerCase())
  ), [q]);

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Patient history</p>
          <h2 className="font-display text-3xl">Patients I've seen</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} records</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="patients-search" placeholder="Name · ID · diagnosis…" className="input-base pl-9 w-72" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="card-elev overflow-hidden" data-testid="patients-list">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => { setSelected(p.id); toast(`Opened ${p.name}'s chart`); }}
              data-testid={`patient-row-${p.id}`}
              className={`p-4 flex items-center gap-4 cursor-pointer border-b border-border last:border-0 transition hover:bg-muted/40 ${selected === p.id ? 'bg-muted/50' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><UserRound className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.id} · Last seen {p.last}</p>
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm">{p.diagnosis}</p>
                <p className="text-xs text-muted-foreground">{p.visits} visits</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
          {filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No matches.</div>}
        </div>

        <div className="card-elev p-6 h-fit" data-testid="patient-chart">
          {!selected ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Select a patient to preview their chart.</div>
          ) : (
            <>
              {(() => {
                const p = DOCTOR_PATIENTS.find(x => x.id === selected);
                return (
                  <>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Chart</p>
                    <p className="font-display text-2xl leading-tight mt-1">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.id}</p>

                    <div className="grid grid-cols-3 gap-3 mt-5">
                      <div className="p-3 rounded-xl bg-muted/50"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Diagnosis</p><p className="font-display text-base">{p.diagnosis}</p></div>
                      <div className="p-3 rounded-xl bg-muted/50"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Visits</p><p className="font-display text-base">{p.visits}</p></div>
                      <div className="p-3 rounded-xl bg-muted/50"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last</p><p className="font-display text-base">{p.last}</p></div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <button onClick={() => toast.success('Opened full history')} className="btn-ghost text-xs" data-testid="chart-view-history">View history</button>
                      <button onClick={() => toast('Invitation sent')} className="btn-primary text-xs" data-testid="chart-follow-up">Send follow-up</button>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
