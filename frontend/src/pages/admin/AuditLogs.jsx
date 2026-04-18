import { useState, useMemo } from 'react';
import { ShieldCheck, Search, AlertTriangle, Info, Download } from 'lucide-react';
import { toast } from 'sonner';
import { AUDIT_LOGS } from '../../lib/extraMockData';

const sevIcon = { info: Info, warn: AlertTriangle };
const sevTone = {
  info: 'bg-primary/10 text-primary border-primary/20',
  warn: 'bg-accent/15 text-accent border-accent/30',
};

export default function AuditLogs() {
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('all');

  const filtered = useMemo(() => AUDIT_LOGS.filter((l) => {
    if (sev !== 'all' && l.severity !== sev) return false;
    if (q && !`${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, sev]);

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Security</p>
          <h2 className="font-display text-3xl">Audit logs</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} events · tamper-evident</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="audit-search" className="input-base pl-9 w-64" placeholder="Actor · action · target" />
          </div>
          <button onClick={() => toast.success('Audit logs exported (CSV)')} data-testid="audit-export" className="btn-primary text-sm flex items-center gap-2">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

      <div className="flex gap-2">
        {['all', 'info', 'warn'].map((s) => (
          <button
            key={s}
            onClick={() => setSev(s)}
            data-testid={`audit-sev-${s}`}
            className={`px-4 py-1.5 rounded-full text-sm border capitalize transition ${sev === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-ring/60'}`}
          >{s}</button>
        ))}
      </div>

      <div className="card-elev overflow-hidden" data-testid="audit-table">
        <div className="grid grid-cols-[auto_1fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 border-b border-border bg-muted/40 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
          <span>Sev</span><span>Timestamp</span><span>Actor</span><span>Action</span><span>Target</span>
        </div>
        {filtered.map((l) => {
          const Ic = sevIcon[l.severity];
          return (
            <div key={l.id} className="grid grid-cols-[auto_1fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 border-b border-border last:border-0 items-center hover:bg-muted/30 transition text-sm">
              <span className={`w-7 h-7 rounded-lg border grid place-items-center ${sevTone[l.severity]}`}><Ic className="w-3.5 h-3.5" /></span>
              <span className="font-mono text-xs text-muted-foreground">{l.ts}</span>
              <span className="truncate">{l.actor}</span>
              <span className="font-mono text-xs">{l.action}</span>
              <span className="text-muted-foreground truncate">{l.target}</span>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No events match.</div>}
      </div>

      <div className="card-elev p-4 flex items-center gap-3 bg-gradient-to-br from-sage/10 to-primary/10 border-sage/20">
        <ShieldCheck className="w-5 h-5 text-sage" />
        <p className="text-xs text-muted-foreground">Logs are append-only and hash-chained. Any tampering is immediately detected.</p>
      </div>
    </div>
  );
}
