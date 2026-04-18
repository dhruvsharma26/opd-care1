import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Stethoscope,
  ShieldCheck,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  HeartPulse,
  ActivityIcon,
  Sparkles,
  Moon,
  Sun,
  Lock,
  Mail,
  Phone,
  UserCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ROLES = [
  {
    id: "patient",
    label: "Patient",
    tag: "Book · Track · Heal",
    icon: User,
    demo: "patient@opd.care",
    tint: "sage",
  },
  {
    id: "doctor",
    label: "Doctor",
    tag: "Queue · Consult · Note",
    icon: Stethoscope,
    demo: "doctor@opd.care",
    tint: "accent",
  },
  {
    id: "admin",
    label: "Admin",
    tag: "Monitor · Audit · Report",
    icon: ShieldCheck,
    demo: "admin@opd.care",
    tint: "sand",
  },
];

export default function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [role, setRole] = useState("patient");
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  const onChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "signup") {
        if (!form.name || !form.email)
          return setError("Please enter your name and email.");
        if (form.password !== form.confirm)
          return setError("Passwords do not match.");

        setLoading(true);
        await signUp({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role,
        });
        navigate(`/${role}`);
      } else {
        if (!form.email || !form.password)
          return setError("Please enter your email and password.");

        setLoading(true);
        await signIn({
          email: form.email,
          password: form.password,
        });
        navigate(`/${role}`);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    const picked = ROLES.find((r) => r.id === role);
    setForm((f) => ({
      ...f,
      email: picked.demo,
      password: "demo1234",
      confirm: "demo1234",
    }));
  };

  const quickLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const picked = ROLES.find((r) => r.id === role);
      await signIn({
        email: picked.demo,
        password: "demo1234",
      });
      navigate(`/${role}`);
    } catch (err) {
      setError("Demo login failed. Please use manual credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background mesh-bg relative overflow-hidden">
      {/* Ambient drifting orbs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-accent/15 blur-3xl animate-drift" />
      <div
        className="pointer-events-none absolute top-1/3 -right-32 w-[460px] h-[460px] rounded-full bg-primary/15 blur-3xl animate-drift"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 w-[380px] h-[380px] rounded-full bg-sage/20 blur-3xl animate-drift"
        style={{ animationDelay: "-14s" }}
      />

      {/* Top-bar mini */}
      <div className="absolute top-0 inset-x-0 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-soft">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg">
                OPD<span className="text-accent">.</span>care
              </p>
              <p className="text-[11px] tracking-widest uppercase text-muted-foreground">
                Smart OPD Assist
              </p>
            </div>
          </div>
          <button
            onClick={toggle}
            data-testid="login-theme-toggle"
            className="w-10 h-10 rounded-full border border-border bg-card/40 backdrop-blur-md grid place-items-center hover:bg-muted/50 transition"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="relative z-[5] min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* LEFT — Story panel */}
        <section className="hidden lg:flex flex-col justify-between px-12 xl:px-20 py-24">
          <div className="max-w-xl">
            <span className="chip mb-6" data-testid="hero-chip">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> New · Voice-first
              intake
            </span>
            <h1 className="font-display text-5xl xl:text-6xl leading-[1.02] tracking-tight">
              Hospitals that feel
              <br />
              <span className="italic text-accent">warmly</span> intelligent.
            </h1>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-md">
              A single, calm console for patients, clinicians and operations —
              powered by AI triage, live occupancy and thoughtful design that
              keeps the waiting-room human.
            </p>

            {/* feature chips */}
            <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
              {[
                {
                  icon: HeartPulse,
                  title: "Vitals timeline",
                  hint: "daily trend",
                },
                {
                  icon: ActivityIcon,
                  title: "Live headcount",
                  hint: "by department",
                },
                {
                  icon: Stethoscope,
                  title: "Smart queue",
                  hint: "severity-aware",
                },
                {
                  icon: ShieldCheck,
                  title: "HIPAA posture",
                  hint: "audit-ready",
                },
              ].map(({ icon: Ic, title, hint }) => (
                <div key={title} className="glass rounded-2xl p-4">
                  <Ic className="w-4 h-4 text-accent mb-2" />
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-[11px] text-muted-foreground">{hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Floating preview card */}
          <div className="relative max-w-md">
            <div className="glass rounded-3xl p-5 shadow-lift animate-float-soft">
              <div className="flex items-center justify-between mb-3">
                <span className="chip">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage" /> Live
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  OPD-A · 3F
                </span>
              </div>
              <p className="font-display text-xl leading-tight">
                Dr. Mehta is calling token{" "}
                <span className="text-accent">#12</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Average wait · 6 min · Severity aware ordering
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["KM", "SR", "MS"].map((t, i) => (
                    <span
                      key={t}
                      className="w-7 h-7 rounded-full border-2 border-background grid place-items-center text-[10px] font-semibold bg-primary/10 text-primary"
                      style={{ zIndex: 10 - i }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  3 doctors online
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — Auth panel */}
        <section className="flex items-center justify-center px-5 sm:px-10 py-24 lg:py-16">
          <div className="w-full max-w-md">
            <div
              className="glass rounded-[28px] p-6 sm:p-8 shadow-lift relative overflow-hidden grain"
              data-testid="login-card"
            >
              <div className="mb-6">
                <h2 className="font-display text-2xl">Welcome back</h2>
                <p className="text-sm text-muted-foreground">
                  Pick a role, sign in — we'll route you to the right dashboard.
                </p>
              </div>

              {/* Role toggle — the ACTUAL working one */}
              <div
                role="tablist"
                aria-label="Select role"
                className="relative grid grid-cols-3 bg-muted/60 p-1 rounded-full mb-5"
                data-testid="role-toggle"
              >
                {/* Moving pill */}
                <div
                  aria-hidden
                  className="absolute top-1 bottom-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-card shadow-soft border border-border transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                  style={{
                    left: `calc(${ROLES.findIndex((r) => r.id === role)} * (100% - 0.5rem)/3 + 0.25rem)`,
                  }}
                />
                {ROLES.map((r) => {
                  const Ic = r.icon;
                  const active = role === r.id;
                  return (
                    <button
                      key={r.id}
                      role="tab"
                      aria-selected={active}
                      type="button"
                      onClick={() => setRole(r.id)}
                      data-testid={`role-tab-${r.id}`}
                      className={`relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-colors ${
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Ic className="w-4 h-4" />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active role tag */}
              <div
                className="flex items-center justify-between mb-5 animate-enter"
                key={role}
              >
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Signing in as
                  </p>
                  <p className="font-display text-lg capitalize leading-tight">
                    {role}
                    <span className="text-muted-foreground font-sans text-sm">
                      {" "}
                      · {ROLES.find((r) => r.id === role).tag}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  data-testid="fill-demo-btn"
                  className="text-xs chip hover:border-ring cursor-pointer transition"
                >
                  Use demo
                </button>
              </div>

              {/* Mode switch */}
              <div className="grid grid-cols-2 mb-5 border-b border-border">
                {["signin", "signup"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    data-testid={`mode-${m}`}
                    className={`py-2 text-sm relative transition ${mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {m === "signin" ? "Sign in" : "Create account"}
                    <span
                      className={`absolute left-0 right-0 -bottom-px h-0.5 bg-accent transition-all ${mode === m ? "scale-x-100" : "scale-x-0"}`}
                    />
                  </button>
                ))}
              </div>

              <form
                onSubmit={submit}
                className="space-y-3"
                data-testid="auth-form"
              >
                {mode === "signup" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        required
                        placeholder="Full name"
                        value={form.name}
                        onChange={onChange("name")}
                        data-testid="input-name"
                        className="input-base pl-9"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        placeholder="Phone"
                        value={form.phone}
                        onChange={onChange("phone")}
                        data-testid="input-phone"
                        className="input-base pl-9"
                      />
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    required
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={onChange("email")}
                    data-testid="input-email"
                    className="input-base pl-9"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Password"
                    value={form.password}
                    onChange={onChange("password")}
                    data-testid="input-password"
                    className="input-base pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle password visibility"
                    data-testid="toggle-password"
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {mode === "signup" && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Confirm password"
                      value={form.confirm}
                      onChange={onChange("confirm")}
                      data-testid="input-confirm"
                      className="input-base pl-9"
                    />
                  </div>
                )}

                {error && (
                  <p
                    className="text-sm text-destructive"
                    data-testid="auth-error"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  data-testid="submit-btn"
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading
                    ? "Signing you in…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={quickLogin}
                  data-testid="quick-login-btn"
                  className="w-full btn-ghost text-sm"
                >
                  Skip — enter as demo {role}
                </button>
              </form>

              <p className="text-[11px] text-center text-muted-foreground mt-5">
                By continuing you agree to our{" "}
                <a href="#" className="link-underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="link-underline">
                  Privacy
                </a>
                . No real credentials needed — this is a demo.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
