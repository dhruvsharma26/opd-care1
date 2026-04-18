import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";

export default function ConsultNotes() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState({
    diagnosis: "",
    prescription: "",
    notes: "",
    followUpDate: "",
  });

  useEffect(() => {
    const load = async () => {
      if (!user?.doctorId) return;
      const response = await appointmentAPI.getDoctorAppointments(user.doctorId);
      const data = response.data || [];
      setAppointments(data);
      const first = data[0];
      if (first) {
        setSelectedId(first._id);
        setDraft({
          diagnosis: first.report?.diagnosis || "",
          prescription: first.report?.prescription || "",
          notes: first.report?.notes || "",
          followUpDate: first.report?.followUpDate || "",
        });
      }
    };

    load();
  }, [user?.doctorId]);

  const selected = useMemo(
    () => appointments.find((appointment) => appointment._id === selectedId) || null,
    [appointments, selectedId],
  );

  useEffect(() => {
    if (!selected) return;
    setDraft({
      diagnosis: selected.report?.diagnosis || "",
      prescription: selected.report?.prescription || "",
      notes: selected.report?.notes || "",
      followUpDate: selected.report?.followUpDate || "",
    });
  }, [selected]);

  const save = async () => {
    if (!selected) return;

    try {
      const response = await appointmentAPI.update(selected._id, {
        report: {
          symptoms: selected.report?.symptoms || [],
          duration: selected.report?.duration || "",
          description: selected.report?.description || selected.complaint,
          medicalHistory: selected.report?.medicalHistory || [],
          currentMedications: selected.report?.currentMedications || [],
          allergies:
            selected.report?.allergies
            || selected.patient?.allergies
            || "No known drug allergies",
          ...draft,
        },
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment._id === selected._id ? response.data.appointment : appointment,
        ),
      );
      toast.success("Consult note saved");
    } catch (err) {
      toast.error("Failed to save consult note");
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Clinical journal
        </p>
        <h2 className="font-display text-3xl">Consult notes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Save diagnosis and treatment notes directly against each appointment.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="card-elev overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-display text-xl">Appointments</h3>
          </div>
          <ul className="divide-y divide-border">
            {appointments.map((appointment) => (
              <li key={appointment._id}>
                <button
                  onClick={() => setSelectedId(appointment._id)}
                  className={`w-full text-left p-4 transition ${
                    selectedId === appointment._id ? "bg-muted/50" : "hover:bg-muted/40"
                  }`}
                >
                  <p className="font-medium">{appointment.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.date} · {appointment.time}
                  </p>
                  <p className="text-xs mt-1 line-clamp-2">{appointment.complaint}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-elev p-6">
          {!selected ? (
            <div className="text-sm text-muted-foreground">
              Select an appointment to add notes.
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Patient
                </p>
                <h3 className="font-display text-2xl">{selected.patientName}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selected.complaint}</p>
              </div>

              <input
                value={draft.diagnosis}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, diagnosis: e.target.value }))
                }
                placeholder="Diagnosis"
                className="input-base"
              />
              <textarea
                rows={4}
                value={draft.prescription}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, prescription: e.target.value }))
                }
                placeholder="Prescription / treatment plan"
                className="input-base resize-none"
              />
              <textarea
                rows={5}
                value={draft.notes}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, notes: e.target.value }))
                }
                placeholder="Clinical notes"
                className="input-base resize-none"
              />
              <input
                type="date"
                value={draft.followUpDate}
                onChange={(e) =>
                  setDraft((current) => ({ ...current, followUpDate: e.target.value }))
                }
                className="input-base"
              />

              <div className="flex justify-end">
                <button onClick={save} className="btn-primary text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
