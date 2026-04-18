import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DOCTOR_SCHEDULE } from '../../lib/extraMockData';

export default function DoctorSchedule() {
  const [week, setWeek] = useState('This week');

  const handleBlock = (day, t) => toast.success(`Blocked ${day} · ${t}`);
  const handleConfirm = (day, t) => toast(`Confirmed ${day} · ${t}`);

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Roster</p>
          <h2 className="font-display text-3xl">My schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">5-day view · click any slot to manage</p>
        </div>
        <div className="flex items-center gap-1 card-elev px-2 py-1">
          <button onClick={() => setWeek('Last week')} data-testid="week-prev" className="p-2 rounded-lg hover:bg-muted/60 transition"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm px-2">{week}</span>
          <button onClick={() => setWeek('Next week')} data-testid="week-next" className="p-2 rounded-lg hover:bg-muted/60 transition"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" data-testid="schedule-grid">
        {DOCTOR_SCHEDULE.map((day) => (
          <div key={day.day} className="card-elev p-4">
            <div className="flex items-baseline justify-between mb-3">
              <p className="font-display text-lg">{day.day}</p>
              <p className="text-xs text-muted-foreground">{day.date}</p>
            </div>
            <ul className="space-y-2">
              {day.slots.map((s) => {
                const empty = s.name === '—';
                return (
                  <li
                    key={s.t}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      empty ? 'border-dashed border-border hover:border-ring/70 text-muted-foreground' : 'border-border hover:border-accent/50'
                    }`}
                    onClick={() => empty ? handleBlock(day.day, s.t) : handleConfirm(day.day, s.t)}
                    data-testid={`slot-${day.day}-${s.t}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs flex items-center gap-1.5"><Clock className="w-3 h-3" /> {s.t}</span>
                      {!empty && <span className="chip text-[10px] bg-accent/10 text-accent border-accent/30">booked</span>}
                    </div>
                    <p className={`text-sm mt-1 ${empty ? '' : 'font-medium'}`}>{empty ? 'Available · click to block' : s.name}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
