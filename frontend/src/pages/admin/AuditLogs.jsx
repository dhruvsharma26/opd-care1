import { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, Info, Download } from 'lucide-react';
import { toast } from 'sonner';
import { appointmentAPI, doctorAPI, patientAPI } from '../../services/api';
import { buildAuditRows, buildLiveActivityLogs, downloadSimplePdf } from '../../lib/adminOps';

const sevIcon = { info: Info, warn: AlertTriangle };
const sevTone = {
  info: 'bg-primary/10 text-primary border-primary/20',
  warn: 'bg-accent/15 text-accent border-accent/30',
};

export default function AuditLogs() {
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('all');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
          patientAPI.getAll(),
          doctorAPI.getAll(),
          appointmentAPI.getAll(),
        ]);

        if (!mounted) return;
        setPatients(patientsRes.data || []);
        setDoctors(doctorsRes.data || []);
        setAppointments(appointmentsRes.data || []);
      } catch (error) {
        toast.error('Failed to load live audit activity');
      }
    };

    fetchData();
    const intervalId = window.setInterval(fetchData, 15000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const auditRows = useMemo(() => {
    const activity = buildLiveActivityLogs({ patients, doctors, appointments });
    return buildAuditRows(activity);
  }, [appointments, doctors, patients]);

  const filtered = useMemo(() => auditRows.filter((l) => {
    if (sev !== 'all' && l.severity !== sev) return false;
    if (q && !`${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [auditRows, q, sev]);

  const exportPdf = () => {
    const lines = [
      'OPD Care Live Audit Logs',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      `Visible events: ${filtered.length}`,
      '',
      ...filtered.flatMap((entry) => [
        `${entry.ts} | ${entry.severity.toUpperCase()} | ${entry.actor}`,
        `${entry.action} -> ${entry.target}`,
        '',
      ]),
    ];
    downloadSimplePdf(`opd-live-audit-${new Date().toISOString().slice(0, 10)}.pdf`, lines);
    toast.success('Live audit log PDF downloaded');
  };

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Security</p>
          <h2 className="font-display text-3xl">Audit logs</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} live events from patient and doctor activity</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="audit-search" className="input-base pl-9 w-64" placeholder="Actor · action · target" />
          </div>
          <button onClick={exportPdf} data-testid="audit-export" className="btn-primary text-sm flex items-center gap-2">
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
        <p className="text-xs text-muted-foreground">Logs are generated from live patient registrations, doctor authorization activity, and appointment events.</p>
      </div>
    </div>
  );
}
