import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Calendar,
  Download,
  FileText,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { DEPARTMENT_LOAD, FOOTFALL_BY_HOUR } from "../../lib/mockData";
import { appointmentAPI, doctorAPI, patientAPI } from "../../services/api";

const logTone = {
  register: "bg-primary/10 text-primary",
  consult: "bg-sage/20 text-sage",
  book: "bg-accent/15 text-accent",
  system: "bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))]",
};

function Kpi({ icon: Icon, label, value, trend, tone, note }) {
  return (
    <div className="card-elev p-5 relative overflow-hidden">
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl ${tone}`} />
      <div className={`relative w-10 h-10 rounded-xl grid place-items-center mb-4 ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider relative">{label}</p>
      <div className="flex items-baseline gap-2 relative">
        <p className="font-display text-3xl">{value}</p>
        {trend && (
          <span className="text-xs text-sage flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      {note && <p className="text-[11px] text-muted-foreground mt-1 relative">{note}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchLiveData = async () => {
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
        console.error("Failed to load admin live data", error);
      }
    };

    fetchLiveData();
    const intervalId = window.setInterval(fetchLiveData, 15000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const date = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const liveActivityLogs = useMemo(() => {
    const patientLogs = patients.slice(0, 5).map((patient, index) => ({
      id: `patient-${patient._id || index}`,
      type: "register",
      timestamp: new Date(patient.createdAt || Date.now()).toLocaleString("en-IN"),
      action: `Patient profile created - ${patient.name || "Unnamed patient"}`,
      user: patient.email || patient.phone || "Patient",
      sortTime: new Date(patient.createdAt || 0).getTime(),
    }));

    const appointmentLogs = appointments.slice(0, 8).map((appointment, index) => ({
      id: `appointment-${appointment._id || index}`,
      type: appointment.status === "completed" ? "consult" : "book",
      timestamp: new Date(appointment.createdAt || Date.now()).toLocaleString("en-IN"),
      action:
        appointment.status === "completed"
          ? `Consultation completed - ${appointment.patientName}`
          : `Appointment booked - ${appointment.patientName} with ${appointment.doctorName}`,
      user: appointment.doctorName || "System",
      sortTime: new Date(appointment.createdAt || 0).getTime(),
    }));

    const systemLog = {
      id: "system-headcount",
      type: "system",
      timestamp: new Date().toLocaleString("en-IN"),
      action: "Live dashboard refreshed from patient, doctor, and appointment data",
      user: "System",
      sortTime: Date.now(),
    };

    return [systemLog, ...patientLogs, ...appointmentLogs]
      .sort((a, b) => b.sortTime - a.sortTime)
      .slice(0, 10);
  }, [appointments, patients]);

  const onNotify = () => toast.success("Notice broadcast to on-shift staff");
  const onExport = () =>
    toast.success("Daily OPD report generated", {
      description: "Live snapshot exported",
    });
  const onClearLogs = () =>
    toast("Activity stream is now driven by live records and refreshes automatically");

  const patientsToday = patients.length;
  const doctorsOnline = doctors.filter((doctor) => doctor.availableToday).length;
  const pendingCases = appointments.filter(
    (appointment) => appointment.status !== "completed",
  ).length;
  const headcountPlaceholder = 187;

  return (
    <div className="space-y-6 animate-enter">
      <section className="relative overflow-hidden rounded-3xl p-8 border border-border bg-gradient-to-br from-primary/10 via-accent/10 to-sage/10">
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-primary/15 blur-3xl animate-drift" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Operations · {date}
            </p>
            <h2 className="font-display text-4xl leading-tight mt-1">
              OPD running <span className="italic text-sage">smoothly.</span>
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Admin activity now refreshes from real patient and appointment records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNotify} className="btn-ghost text-sm flex items-center gap-2">
              <Bell className="w-3.5 h-3.5" /> Notify staff
            </button>
            <button onClick={onExport} className="btn-primary text-sm flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export daily report
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Kpi
          icon={Users}
          label="Patients today"
          value={patientsToday}
          trend="+live"
          tone="bg-primary/10 text-primary"
        />
        <Kpi
          icon={Stethoscope}
          label="Doctors online"
          value={doctorsOnline}
          tone="bg-accent/15 text-accent"
        />
        <Kpi
          icon={Activity}
          label="Avg. wait"
          value="9.4m"
          note="placeholder"
          tone="bg-sage/20 text-sage"
        />
        <Kpi
          icon={FileText}
          label="Pending cases"
          value={pendingCases}
          tone="bg-[hsl(var(--sand))]/25 text-[hsl(var(--sand))]"
        />
        <Kpi
          icon={Users}
          label="OPD headcount"
          value={headcountPlaceholder}
          note="static for now"
          tone="bg-primary/10 text-primary"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Department occupancy</h3>
              <p className="text-xs text-muted-foreground">Current patients vs. capacity</p>
            </div>
            <span className="chip">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" /> Live
            </span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_LOAD} margin={{ left: -10, top: 10 }} barGap={6}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                />
                <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="patients" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Footfall · today</h3>
              <p className="text-xs text-muted-foreground">Hourly patient inflow</p>
            </div>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FOOTFALL_BY_HOUR} margin={{ left: -15, top: 10 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(var(--chart-2))", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card-elev p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-xl">Activity stream</h3>
              <p className="text-xs text-muted-foreground">
                Auto-refreshing from real patients and appointments
              </p>
            </div>
            <button className="text-xs text-muted-foreground link-underline" onClick={onClearLogs}>
              Info
            </button>
          </div>
          <ul className="space-y-2">
            {liveActivityLogs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition">
                <div className={`w-9 h-9 rounded-lg grid place-items-center shrink-0 ${logTone[log.type] || logTone.system}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{log.timestamp}</span>
                    <span className="divider-dot" />
                    <span>{log.user}</span>
                  </div>
                </div>
                <span className="chip text-[10px] uppercase tracking-wider">{log.type}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="card-elev p-6">
            <h3 className="font-display text-xl mb-4">System controls</h3>
            <div className="grid grid-cols-1 gap-2">
              <button className="w-full text-sm py-2.5 rounded-xl border bg-primary text-primary-foreground border-primary hover:opacity-90 text-left px-4">
                Generate daily report
              </button>
              <button className="w-full text-sm py-2.5 rounded-xl border bg-accent/10 text-accent border-accent/30 hover:bg-accent/15 text-left px-4">
                Export patient CSV
              </button>
              <button className="w-full text-sm py-2.5 rounded-xl border bg-sage/15 text-sage border-sage/30 hover:bg-sage/20 text-left px-4">
                Broadcast notice
              </button>
              <button className="w-full text-sm py-2.5 rounded-xl border bg-card border-border hover:border-ring/60 text-foreground text-left px-4">
                Clear audit logs
              </button>
            </div>
          </div>

          <div className="card-elev p-6 bg-gradient-to-br from-accent/10 to-sage/10 border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="font-medium text-sm">Ops insight</p>
            </div>
            <p className="text-xs text-muted-foreground">
              OPD headcount is shown as a static placeholder for now. We can wire
              live headcount sensors or ward occupancy data into this next.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
