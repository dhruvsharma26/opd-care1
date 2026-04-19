import { useEffect, useMemo, useState } from "react";
import {
  Activity,
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
import { aiAPI, appointmentAPI, doctorAPI, patientAPI } from "../../services/api";
import { buildLiveActivityLogs, downloadSimplePdf } from "../../lib/adminOps";

const logTone = {
  register: "bg-primary/10 text-primary",
  consult: "bg-sage/20 text-sage",
  book: "bg-accent/15 text-accent",
  doctor: "bg-primary/10 text-primary",
  authorize: "bg-accent/15 text-accent",
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
  const [analytics, setAnalytics] = useState(null);
  const [analyticsSource, setAnalyticsSource] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchLiveData = async () => {
      try {
        const [patientsRes, doctorsRes, appointmentsRes, analyticsRes] = await Promise.all([
          patientAPI.getAll(),
          doctorAPI.getAll(),
          appointmentAPI.getAll(),
          aiAPI.getAdminDashboardAnalytics(),
        ]);

        if (!mounted) return;
        setPatients(patientsRes.data || []);
        setDoctors(doctorsRes.data || []);
        setAppointments(appointmentsRes.data || []);
        setAnalytics(analyticsRes.data?.analytics || null);
        setAnalyticsSource(analyticsRes.data?.source || "");
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

  const liveActivityLogs = useMemo(
    () => buildLiveActivityLogs({ patients, doctors, appointments }).slice(0, 10),
    [appointments, doctors, patients],
  );

  const exportDailyReport = () => {
    const lines = [
      "OPD Care Daily Operations Report",
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      `Patients today: ${patients.length}`,
      `Doctors online: ${doctors.filter((doctor) => doctor.availableToday).length}`,
      `Pending cases: ${appointments.filter((appointment) => appointment.status !== "completed").length}`,
      `Average wait (AI): ${analytics?.overview?.avgWaitMinutes ?? 0} minutes`,
      `OPD headcount (AI): ${analytics?.overview?.opdHeadcount ?? patients.length}`,
      `Bottleneck department: ${analytics?.overview?.bottleneckDepartment || "General Medicine"}`,
      "",
      "Department occupancy",
      ...(analytics?.departmentLoad || []).map(
        (entry) => `${entry.name}: ${entry.patients} patients / capacity ${entry.capacity}`,
      ),
      "",
      "Hourly footfall",
      ...(analytics?.footfallByHour || []).map(
        (entry) => `${entry.h}: ${entry.count} arrivals`,
      ),
      "",
      "AI recommendations",
      ...((analytics?.recommendations || []).map((entry) => `- ${entry}`)),
      "",
      "Recent live activity",
      ...liveActivityLogs.flatMap((entry) => [
        `${entry.timestamp} | ${entry.user}`,
        entry.action,
      ]),
    ];

    downloadSimplePdf(
      `opd-daily-report-${new Date().toISOString().slice(0, 10)}.pdf`,
      lines,
    );
    toast.success("Daily report PDF downloaded");
  };

  const patientsToday = patients.length;
  const doctorsOnline = doctors.filter((doctor) => doctor.availableToday).length;
  const pendingCases = appointments.filter(
    (appointment) => appointment.status !== "completed",
  ).length;
  const averageWait = analytics?.overview?.avgWaitMinutes ?? "9.4";
  const aiHeadcount = analytics?.overview?.opdHeadcount ?? patientsToday;
  const departmentLoad = analytics?.departmentLoad || [];
  const footfallByHour = analytics?.footfallByHour || [];
  const recommendations = analytics?.recommendations || [];
  const bottleneckDepartment =
    analytics?.overview?.bottleneckDepartment || "General Medicine";

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
              Admin activity now refreshes from real patient, doctor, and appointment records.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportDailyReport} className="btn-primary text-sm flex items-center gap-2">
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
          value={`${averageWait}m`}
          note={`AI estimates pressure around ${bottleneckDepartment}`}
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
          value={aiHeadcount}
          note={analyticsSource ? `${analyticsSource} operations model` : "live operations model"}
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
              <BarChart data={departmentLoad} margin={{ left: -10, top: 10 }} barGap={6}>
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
              <LineChart data={footfallByHour} margin={{ left: -15, top: 10 }}>
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
                Auto-refreshing from real patient, doctor, and appointment records
              </p>
            </div>
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

        <div className="card-elev p-6 bg-gradient-to-br from-accent/10 to-sage/10 border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <p className="font-medium text-sm">Ops insight</p>
          </div>
          <div className="space-y-2">
            {recommendations.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                AI recommendations will appear here once live ops analysis is ready.
              </p>
            ) : (
              recommendations.map((item) => (
                <p key={item} className="text-xs text-muted-foreground">
                  {item}
                </p>
              ))
            )}
            <p className="text-[11px] text-muted-foreground/80">
              Source: {analyticsSource || "live"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
