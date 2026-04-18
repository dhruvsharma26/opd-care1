import { useState, useMemo } from "react";
import {
  Clock,
  Users,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  UserRound,
  ChevronRight,
  Timer,
  Activity,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PATIENT_APPOINTMENTS } from "../../lib/mockData";
import { useAuth } from "../../context/AuthContext";

const severityTone = {
  high: "bg-destructive/15 text-destructive border-destructive/30",
  moderate: "bg-accent/15 text-accent border-accent/30",
  low: "bg-sage/20 text-sage border-sage/30",
};

const statusTone = {
  upcoming: "bg-accent/15 text-accent border-accent/40",
  confirmed: "bg-primary/15 text-primary border-primary/40",
  completed: "bg-sage/20 text-sage border-sage/40",
};

function StatCard({ icon: Icon, label, value, delta, tone }) {
  return (
    <div className="card-elev p-5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl grid place-items-center ${tone}`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && (
          <span className="text-[11px] font-mono text-muted-foreground">
            {delta}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-4">
        {label}
      </p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(PATIENT_APPOINTMENTS);
  const [selected, setSelected] = useState(PATIENT_APPOINTMENTS[0]?.id);
  const [showReport, setShowReport] = useState(false);

  // Filter appointments for current doctor (default to Dr. Kabir for demo)
  const doctorAppointments = useMemo(() => {
    return appointments.filter(
      (a) => a.doctorId === user?.doctorId || a.doctorId === "d-011"
    );
  }, [appointments, user]);

  const counts = useMemo(
    () => ({
      upcoming: doctorAppointments.filter((a) => a.status === "upcoming")
        .length,
      confirmed: doctorAppointments.filter((a) => a.status === "confirmed")
        .length,
      completed: doctorAppointments.filter((a) => a.status === "completed")
        .length,
    }),
    [doctorAppointments]
  );

  const setStatus = (id, status) => {
    setAppointments((apps) =>
      apps.map((x) => (x.id === id ? { ...x, status } : x))
    );
    const names = { confirmed: "confirmed", upcoming: "scheduled", completed: "completed" };
    toast.success(`Appointment ${names[status]}`);
  };

  const nextAppointment = () => {
    const next = doctorAppointments.find((a) => a.status === "upcoming");
    if (!next) return toast("No upcoming appointments");
    setSelected(next.id);
    toast.success(`Next: ${next.patientName} at ${next.time}`);
  };

  const takeBreak = () =>
    toast("Short break started · calendar paused for 10 min", { icon: "☕" });

  const active = doctorAppointments.find((a) => a.id === selected);

  return (
    <div className="space-y-6 animate-enter">
      {/* Header */}
      <section className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Doctor console
          </p>
          <h2 className="font-display text-3xl">
            Good morning, {user?.name?.split(" ").slice(-1)[0]}.
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            You have{" "}
            <span className="text-foreground font-medium">
              {counts.upcoming}
            </span>{" "}
            upcoming appointments ·{" "}
            <span className="text-foreground font-medium">
              {counts.completed}
            </span>{" "}
            completed today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={takeBreak}
            className="btn-ghost text-sm"
            data-testid="break-btn"
          >
            <PauseCircle className="w-4 h-4 mr-1" /> Short break
          </button>
          <button
            onClick={nextAppointment}
            className="btn-primary text-sm flex items-center gap-2"
            data-testid="next-patient-btn"
          >
            <PlayCircle className="w-4 h-4" /> Next appointment
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={counts.upcoming}
          delta="+2 today"
          tone="bg-accent/15 text-accent"
        />
        <StatCard
          icon={Users}
          label="In progress"
          value={counts.confirmed}
          delta="live"
          tone="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={counts.completed}
          delta="today"
          tone="bg-sage/20 text-sage"
        />
        <StatCard
          icon={Timer}
          label="Avg. consult"
          value="12m"
          delta="+2m"
          tone="bg-accent/10 text-accent"
        />
      </section>

      {/* Appointments + Detail */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
        {/* Appointments List */}
        <div className="card-elev overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl">Your appointments</h3>
              <p className="text-xs text-muted-foreground">
                Scheduled by date & time
              </p>
            </div>
            <div className="flex gap-2 text-[11px]">
              <span className="chip">
                <span className="w-1.5 h-1.5 rounded-full bg-sage" />{" "}
                Completed
              </span>
              <span className="chip">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                Confirmed
              </span>
              <span className="chip">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />{" "}
                Upcoming
              </span>
            </div>
          </div>
          <ul className="divide-y divide-border" data-testid="appointments-list">
            {doctorAppointments.map((a) => (
              <li
                key={a.id}
                onClick={() => setSelected(a.id)}
                data-testid={`appointment-item-${a.id}`}
                className={`group p-5 cursor-pointer transition flex items-start gap-4 hover:bg-muted/40 ${
                  selected === a.id ? "bg-muted/50" : ""
                }`}
              >
                <div className="relative w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center font-display text-lg shrink-0">
                  <UserRound className="w-5 h-5" />
                  <span
                    className={`absolute -top-1 -right-1 font-mono text-[10px] rounded-full px-1.5 py-0.5 text-foreground border border-border ${
                      a.status === "completed"
                        ? "bg-sage/70 text-sage-foreground"
                        : a.status === "confirmed"
                          ? "bg-primary/70 text-primary-foreground"
                          : "bg-accent/70 text-accent-foreground"
                    }`}
                  >
                    {a.status[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{a.patientName}</p>
                    <span className="divider-dot" />
                    <span className="text-xs text-muted-foreground">
                      {a.age}y · {a.gender}
                    </span>
                    <span className="divider-dot" />
                    <span className="font-mono text-xs text-muted-foreground">
                      {a.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {a.complaint}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`chip text-[10px] border ${severityTone[a.severity]}`}
                    >
                      {a.severity}
                    </span>
                    <span
                      className={`chip text-[10px] border ${statusTone[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:translate-x-0.5 transition" />
              </li>
            ))}
          </ul>
        </div>

        {/* Detail Panel */}
        <div
          className="card-elev p-6 overflow-y-auto max-h-[600px]"
          data-testid="appointment-detail"
        >
          {!active ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Select an appointment to see details.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-sage text-primary-foreground grid place-items-center font-display text-xl">
                  {active.patientName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <p className="font-display text-2xl leading-tight">
                    {active.patientName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {active.patientId} · {active.age}y {active.gender} ·{" "}
                    {active.date} {active.time}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Severity
                  </p>
                  <p className="font-display text-base capitalize">
                    {active.severity}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Room
                  </p>
                  <p className="font-display text-base text-sm">{active.room}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>
                  <p className="font-display text-base capitalize">
                    {active.status}
                  </p>
                </div>
              </div>

              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Chief complaint
              </p>
              <p className="text-sm leading-relaxed p-4 bg-muted/40 rounded-xl border border-border italic mb-5">
                "{active.complaint}"
              </p>

              {/* View Report Button */}
              <button
                onClick={() => setShowReport(true)}
                className="w-full btn-secondary text-sm py-2 px-3 flex items-center justify-center gap-2 mb-5"
                data-testid="view-report-btn"
              >
                <FileText className="w-4 h-4" />
                View detailed patient report
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setStatus(active.id, "confirmed")}
                  data-testid="action-confirm"
                  className="btn-primary text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                </button>
                <button
                  onClick={() => setStatus(active.id, "completed")}
                  data-testid="action-complete"
                  className="btn-accent text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Complete
                </button>
                <button
                  onClick={() => setStatus(active.id, "upcoming")}
                  data-testid="action-reschedule"
                  className="btn-ghost text-xs py-2 px-2 flex items-center justify-center gap-1"
                >
                  <PauseCircle className="w-3.5 h-3.5" /> Reschedule
                </button>
              </div>

              <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-accent/10 to-sage/10 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium">Recommended action</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Review patient history and conduct vital signs check before
                  consultation.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Report Modal */}
      {showReport && active && (
        <div
          className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50"
          onClick={() => setShowReport(false)}
        >
          <div
            className="card-elev w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-card border-b border-border p-5 flex items-center justify-between">
              <h3 className="font-display text-xl">Patient Report</h3>
              <button
                onClick={() => setShowReport(false)}
                className="btn-ghost p-1"
                data-testid="close-report"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div>
                <h4 className="font-display text-lg mb-3">
                  Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Name
                    </p>
                    <p className="font-medium text-sm mt-1">
                      {active.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Age & Gender
                    </p>
                    <p className="font-medium text-sm mt-1">
                      {active.age} years · {active.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Patient ID
                    </p>
                    <p className="font-medium text-sm mt-1">
                      {active.patientId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Appointment
                    </p>
                    <p className="font-medium text-sm mt-1">
                      {active.date} at {active.time}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="border-t border-border pt-6">
                <h4 className="font-display text-lg mb-3">Chief Complaint</h4>
                <p className="text-sm text-muted-foreground italic p-4 bg-muted/40 rounded-xl border border-border">
                  "{active.complaint}"
                </p>
              </div>

              {/* Detailed Report */}
              {active.report && (
                <>
                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-lg mb-3">
                      Symptoms & Duration
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          Reported symptoms
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {active.report.symptoms.map((s) => (
                            <span
                              key={s}
                              className="chip bg-accent/10 text-accent border-accent/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium mt-1">
                          {active.report.duration}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-lg mb-3">
                      Detailed Description
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-muted/40 rounded-xl border border-border">
                      {active.report.description}
                    </p>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-lg mb-3">
                      Medical History
                    </h4>
                    <div className="space-y-2">
                      {active.report.medicalHistory.map((h, i) => (
                        <p
                          key={i}
                          className="text-sm text-muted-foreground flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                          {h}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-lg mb-3">
                      Current Medications
                    </h4>
                    {active.report.currentMedications.length > 0 ? (
                      <div className="space-y-2">
                        {active.report.currentMedications.map((m, i) => (
                          <p
                            key={i}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
                            {m}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No current medications
                      </p>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                    <h4 className="font-display text-lg mb-3">Allergies</h4>
                    <p
                      className={`text-sm font-medium p-3 rounded-lg ${
                        active.report.allergies ===
                        "No known drug allergies"
                          ? "bg-sage/10 text-sage border border-sage/30"
                          : "bg-destructive/10 text-destructive border border-destructive/30"
                      }`}
                    >
                      {active.report.allergies}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
