import { useState } from 'react';
import { Plus, Save, X, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { CONSULT_NOTES } from '../../lib/extraMockData';

export default function ConsultNotes() {
  const [notes, setNotes] = useState(CONSULT_NOTES);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ patient: '', summary: '', tags: '' });

  const save = () => {
    if (!draft.patient || !draft.summary) {
      toast.error('Patient and summary are required.');
      return;
    }
    const entry = {
      id: `cn-${Date.now()}`,
      patient: draft.patient,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      summary: draft.summary,
      tags: draft.tags.split(',').map(s => s.trim()).filter(Boolean),
    };
    setNotes([entry, ...notes]);
    setDraft({ patient: '', summary: '', tags: '' });
    setComposing(false);
    toast.success('Note saved.');
  };

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Clinical journal</p>
          <h2 className="font-display text-3xl">Consult notes</h2>
          <p className="text-sm text-muted-foreground mt-1">{notes.length} notes</p>
        </div>
        {!composing && (
          <button onClick={() => setComposing(true)} data-testid="new-note-btn" className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New note
          </button>
        )}
      </header>

      {composing && (
        <div className="card-elev p-6 animate-enter" data-testid="note-composer">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">New consult note</h3>
            <button onClick={() => setComposing(false)} className="p-2 hover:bg-muted/60 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Patient name or ID"
              value={draft.patient}
              onChange={(e) => setDraft({ ...draft, patient: e.target.value })}
              className="input-base"
              data-testid="note-patient"
            />
            <textarea
              placeholder="Summary of consultation…"
              rows={4}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
              className="input-base resize-none"
              data-testid="note-summary"
            />
            <input
              placeholder="Tags (comma-separated)"
              value={draft.tags}
              onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
              className="input-base"
              data-testid="note-tags"
            />
            <div className="flex justify-end">
              <button onClick={save} data-testid="note-save" className="btn-primary text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Save note
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="notes-grid">
        {notes.map((n) => (
          <div key={n.id} className="card-elev p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary grid place-items-center"><FileText className="w-4 h-4" /></div>
              <div>
                <p className="font-medium leading-tight">{n.patient}</p>
                <p className="text-xs text-muted-foreground">{n.date}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">{n.summary}</p>
            <div className="flex gap-1 flex-wrap mt-3">
              {n.tags.map((t) => <span key={t} className="chip text-[10px]">{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
