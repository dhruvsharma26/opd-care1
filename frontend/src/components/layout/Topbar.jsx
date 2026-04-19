import { Sun, Moon, Bell, Search, ChevronDown, LogOut, Stethoscope, X } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { initials } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import { NOTIFICATIONS } from "../../lib/extraMockData";
import { toast } from "sonner";

const SEARCH_INDEX = {
  patient: [
    { label: "Overview", path: "/patient" },
    { label: "Book appointment", path: "/patient/appointments" },
    { label: "New visit / describe symptoms", path: "/patient/register" },
    { label: "Health records", path: "/patient/records" },
  ],
  doctor: [
    { label: "Queue", path: "/doctor" },
    { label: "Schedule", path: "/doctor/schedule" },
    { label: "Authorization", path: "/doctor/authorization" },
    { label: "Patients seen", path: "/doctor/patients" },
    { label: "Consult notes", path: "/doctor/notes" },
  ],
  admin: [
    { label: "Operations overview", path: "/admin" },
    { label: "Authorize clinicians", path: "/admin/authorize" },
    { label: "Live headcount", path: "/admin/headcount" },
    { label: "Audit logs", path: "/admin/audit" },
  ],
};

export default function Topbar({ title, subtitle }) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFICATIONS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  const navigate = useNavigate();
  const userRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const onMouseDown = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const unread = notifs.filter((entry) => entry.unread).length;
  const results = useMemo(() => {
    if (!q) return [];
    const all = SEARCH_INDEX[user?.role] || [];
    return all
      .filter((entry) => entry.label.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 6);
  }, [q, user?.role]);

  const handleSignOut = () => {
    setUserOpen(false);
    setNotifOpen(false);
    setSearchOpen(false);
    signOut();
    navigate("/login", { replace: true });
    toast("Signed out");
  };

  const markAllRead = () => {
    setNotifs((current) => current.map((entry) => ({ ...entry, unread: false })));
    toast("All notifications marked as read");
  };

  const clearOne = (id) =>
    setNotifs((current) => current.filter((entry) => entry.id !== id));

  const go = (path) => {
    navigate(path);
    setSearchOpen(false);
    setQ("");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-display text-base">
            OPD<span className="text-accent">.</span>care
          </span>
        </div>

        <div className="hidden lg:block">
          {title && (
            <h1 className="font-display text-xl leading-tight" data-testid="page-title">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        <div className="flex-1 flex items-center justify-center px-4" ref={searchRef}>
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search pages..."
              value={q}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setQ(e.target.value);
                setSearchOpen(true);
              }}
              className="w-full pl-10 pr-14 py-2 rounded-full bg-muted/50 border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/70 transition"
            />

            {searchOpen && q && (
              <div className="absolute left-0 right-0 top-full mt-2 card-elev overflow-hidden animate-enter z-50">
                {results.length === 0 ? (
                  <div className="p-4 text-xs text-muted-foreground">
                    No matches for "{q}"
                  </div>
                ) : (
                  <ul>
                    {results.map((entry) => (
                      <li key={`${entry.label}-${entry.path}`}>
                        <button
                          onClick={() => go(entry.path)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/60 flex items-center justify-between transition"
                        >
                          <span>{entry.label}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {entry.path}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="relative w-10 h-10 rounded-full border border-border hover:bg-muted/60 transition grid place-items-center"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((open) => !open)}
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-full border border-border hover:bg-muted/60 transition grid place-items-center"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground grid place-items-center border-2 border-background">
                  {unread}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 card-elev overflow-hidden animate-enter z-50">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <p className="font-display text-base">Notifications</p>
                  <button onClick={markAllRead} className="text-xs text-accent link-underline">
                    Mark all read
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 && (
                    <li className="p-6 text-center text-xs text-muted-foreground">
                      You're all caught up.
                    </li>
                  )}
                  {notifs.map((entry) => (
                    <li
                      key={entry.id}
                      className={`p-4 border-b border-border last:border-0 flex items-start gap-3 ${
                        entry.unread ? "bg-muted/30" : ""
                      }`}
                    >
                      {entry.unread && (
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {entry.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {entry.time}
                        </p>
                      </div>
                      <button
                        onClick={() => clearOne(entry.id)}
                        className="p-1 hover:bg-muted/60 rounded-md text-muted-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen((open) => !open)}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:bg-muted/60 transition"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sage text-primary-foreground grid place-items-center font-semibold text-xs">
                {initials(user?.name || "") || "U"}
              </span>
              <span className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">
                  {user?.name?.split(" ")[0] || "Guest"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {user?.role}
                </span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {userOpen && (
              <div className="absolute right-0 mt-2 w-72 card-elev overflow-hidden animate-enter z-50">
                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/10 border-b border-border">
                  <p className="font-display text-base">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-3 text-xs text-muted-foreground border-b border-border">
                  Signed in as <span className="capitalize text-foreground">{user?.role}</span>
                </div>
                <div className="border-t border-border p-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
