import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";

export default function DoctorSchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.doctorId) return;
      const response = await appointmentAPI.getDoctorAppointments(user.doctorId);
      setAppointments(response.data || []);
    };

    load();
  }, [user?.doctorId]);

  const grouped = useMemo(() => {
    const buckets = new Map();
    for (const appointment of appointments) {
      if (!buckets.has(appointment.date)) {
        buckets.set(appointment.date, []);
      }
      buckets.get(appointment.date).push(appointment);
    }
    return Array.from(buckets.entries());
  }, [appointments]);

  return (
    <div className="space-y-6 animate-enter">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Roster
        </p>
        <h2 className="font-display text-3xl">My schedule</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This view groups all appointments assigned to your doctor account.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {grouped.map(([date, items]) => (
          <div key={date} className="card-elev p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-accent" />
              <p className="font-display text-lg">{date}</p>
            </div>
            <ul className="space-y-2">
              {items.map((appointment) => (
                <li key={appointment._id} className="p-3 rounded-xl border border-border">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{appointment.patientName}</span>
                    <span className="chip text-[10px] capitalize">{appointment.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {appointment.time}
                  </p>
                  <p className="text-sm mt-2">{appointment.complaint}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {grouped.length === 0 && (
          <div className="card-elev p-10 text-center text-sm text-muted-foreground">
            No appointments are scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
}
