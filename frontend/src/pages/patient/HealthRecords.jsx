import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search } from "lucide-react";
import { appointmentAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function HealthRecords() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.patientId) {
          const response = await appointmentAPI.getPatientAppointments(user.patientId);
          setAppointments(response.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.patientId]);

  const filtered = useMemo(
    () =>
      appointments.filter((appointment) =>
        `${appointment.doctorName} ${appointment.complaint} ${appointment.report?.diagnosis || ""}`
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [appointments, q],
  );

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Your history
          </p>
          <h2 className="font-display text-3xl">Health records</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Consultation history and notes connected to your patient account.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search records..."
            className="input-base pl-9 w-64"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="card-elev p-10 text-center text-sm text-muted-foreground">
            Loading records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-elev p-10 text-center text-sm text-muted-foreground">
            No records found yet. <Link to="/patient/appointments" className="text-accent">Book a consultation</Link>.
          </div>
        ) : (
          filtered.map((appointment) => (
            <div key={appointment._id} className="card-elev p-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{appointment.doctorName}</p>
                  <span className="chip text-[10px] capitalize">{appointment.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {appointment.specialty} · {appointment.date} · {appointment.time}
                </p>
                <p className="text-sm mt-2">{appointment.complaint}</p>
                {appointment.report?.diagnosis && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Diagnosis: {appointment.report.diagnosis}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
