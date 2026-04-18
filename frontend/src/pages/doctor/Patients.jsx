import { useEffect, useMemo, useState } from "react";
import { Search, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";

export default function DoctorPatients() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!user?.doctorId) return;
      const response = await appointmentAPI.getDoctorAppointments(user.doctorId);
      setAppointments(response.data || []);
    };

    load();
  }, [user?.doctorId]);

  const patients = useMemo(() => {
    const grouped = new Map();

    for (const appointment of appointments) {
      const key = appointment.patientId;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: key,
          name: appointment.patientName,
          age: appointment.patient?.age || appointment.age,
          gender: appointment.patient?.gender || appointment.gender,
          bloodGroup: appointment.patient?.bloodGroup || "",
          latestComplaint: appointment.complaint,
          visits: 0,
          lastVisit: appointment.date,
        });
      }

      const current = grouped.get(key);
      current.visits += 1;
      current.lastVisit = appointment.date;
      current.latestComplaint = appointment.complaint;
    }

    return Array.from(grouped.values()).filter((patient) =>
      `${patient.name} ${patient.latestComplaint}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  }, [appointments, q]);

  return (
    <div className="space-y-6 animate-enter">
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Patient history
          </p>
          <h2 className="font-display text-3xl">Patients linked to your bookings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {patients.length} patient records
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients..."
            className="input-base pl-9 w-72"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.map((patient) => (
          <div key={patient.id} className="card-elev p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <UserRound className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-xs text-muted-foreground">
                  {patient.age || "-"}y · {patient.gender || "-"} · {patient.visits} visits
                </p>
              </div>
            </div>
            <p className="text-sm">{patient.latestComplaint}</p>
            <p className="text-xs text-muted-foreground mt-3">
              Blood group: {patient.bloodGroup || "-"} · Last visit: {patient.lastVisit}
            </p>
          </div>
        ))}
        {patients.length === 0 && (
          <div className="card-elev p-10 text-center text-sm text-muted-foreground">
            No matching patients found.
          </div>
        )}
      </div>
    </div>
  );
}
