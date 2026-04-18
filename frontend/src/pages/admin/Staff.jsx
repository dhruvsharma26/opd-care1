import { useState, useMemo } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { STAFF } from '../../lib/extraMockData';
import { initials } from '../../lib/utils';

export default function Staff() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => STAFF.filter(s => {
    if (filter !== 'all' && s.status !== filter) return false;
    if (q && !`${s.name} ${s.role} ${s.dept}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, filter]);

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Directory</p>
          <h2 className="font-display text-3xl">Staff</h2>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} members</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} data-testid="staff-search" className="input-base pl-9 w-64" placeholder="Search name, dept…" />
          </div>
          <button onClick={() => toast('Invite link copied to clipboard (demo)')} data-testid="staff-invite" className="btn-primary text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Invite
          </button>
        </div>
      </header>

      <div className="flex gap-2">
        {[{ k: 'all', l: 'All' }, { k: 'online', l: 'Online' }, { k: 'offline', l: 'Offline' }].map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            data-testid={`staff-filter-${f.k}`}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${filter === f.k ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:border-ring/60'}`}
          >{f.l}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="staff-grid">
        {filtered.map((s) => (
          <div key={s.id} className="card-elev p-5">
            <div className="flex items-start gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-sage text-primary-foreground grid place-items-center font-display">
                {initials(s.name)}
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card ${s.status === 'online' ? 'bg-sage' : 'bg-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.role}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.dept}</span>
              <span className="chip text-[10px]">{s.shift}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => toast('Messaging ' + s.name.split(' ')[0])} className="btn-ghost text-xs" data-testid={`msg-${s.id}`}>Message</button>
              <button onClick={() => toast.success('Shift updated for ' + s.name.split(' ')[0])} className="btn-primary text-xs" data-testid={`shift-${s.id}`}>Edit shift</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
