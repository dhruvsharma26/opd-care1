import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  PlayCircle,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { appointmentAPI } from "../../services/api";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.doctorId) {
          const response = await appointmentAPI.getDoctorAppointments(user.doctorId);
          setAppointments(response.data || []);
          setSelectedId(response.data?.[0]?._id || null);
        }
      } catch (err) {
        toast.error("Failed to load doctor appointments");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.doctorId]);

  const counts = useMemo(
    () => ({
      upcoming: appointments.filter((entry) => entry.status === "upcoming").length,
      confirmed: appointments.filter((entry) => entry.status === "confirmed").length,
      completed: appointments.filter((entry) => entry.status === "completed").length,
    }),
    [appointments],
  );

  const activeAppointment = appointments.find((entry) => entry._id === selectedId);

  const updateStatus = async (appointmentId, status) => {
    try {
      const response = await appointmentAPI.update(appointmentId, { status });
      setAppointments((current) =>
        current.map((entry) =>
          entry._id === appointmentId ? response.data.appointment : entry,
        ),
      );
      toast.success(`Appointment marked ${status}`);
    } catch (err) {
      toast.error("Failed to update appointment");
    }
  };

  return (
    <div className="space-y-6 animate-enter">
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Doctor console
          </p>
          <h2 className="font-display text-3xl">
            {user?.name || "Doctor"}'s real-time queue
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Appointments on this page are pulled from MongoDB for your doctor ID.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: "Upcoming", value: counts.upcoming },
          { icon: PlayCircle, label: "Confirmed", value: counts.confirmed },
          { icon: CheckCircle2, label: "Completed", value: counts.completed },
          { icon: UserRound, label: "Total", value: appointments.length },
        ].map((card) => (
          <div key={card.label} className="card-elev p-5">
            <card.icon className="w-5 h-5 text-accent mb-3" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider mt-4">
              {card.label}
            </p>
            <p className="font-display text-3xl">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="card-elev overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-display text-xl">Your appointments</h3>
            <p className="text-xs text-muted-foreground">
              Patients who booked this doctor account
            </p>
          </div>
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              No appointments booked yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {appointments.map((appointment) => (
                <li
                  key={appointment._id}
                  onClick={() => setSelectedId(appointment._id)}
                  className={`p-5 cursor-pointer transition flex items-start gap-4 hover:bg-muted/40 ${
                    selectedId === appointment._id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center font-display text-lg shrink-0">
                    <UserRound className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{appointment.patientName}</p>
                      <span className="divider-dot" />
                      <span className="text-xs text-muted-foreground">
                        {appointment.age || "-"}y · {appointment.gender || "-"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {appointment.complaint}
                    </p>
                    <p className="text-xs mt-2">
                      {appointment.date} · {appointment.time}
                    </p>
                  </div>
                  <span className="chip text-[10px] capitalize">{appointment.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card-elev p-6 overflow-y-auto max-h-[600px]">
          {!activeAppointment ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Select an appointment to see details.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sage text-primary-foreground grid place-items-center font-display text-xl">
                  {activeAppointment.patientName
                    .split(" ")
                    .map((entry) => entry[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-display text-2xl leading-tight">
                    {activeAppointment.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeAppointment.date} · {activeAppointment.time}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Complaint
                  </p>
                  <p className="mt-1">{activeAppointment.complaint}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Patient details
                  </p>
                  <p className="mt-1">
                    {activeAppointment.patient?.age || activeAppointment.age || "-"}y ·{" "}
                    {activeAppointment.patient?.gender || activeAppointment.gender || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Blood group: {activeAppointment.patient?.bloodGroup || "-"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateStatus(activeAppointment._id, "confirmed")}
                  className="btn-primary text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                </button>
                <button
                  onClick={() => updateStatus(activeAppointment._id, "completed")}
                  className="btn-accent text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Complete
                </button>
                <button
                  onClick={() => toast("Open Consult Notes to save diagnosis and notes")}
                  className="btn-ghost text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Notes
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
