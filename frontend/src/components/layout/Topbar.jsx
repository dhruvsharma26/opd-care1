import { Sun, Moon, Bell, Search, ChevronDown, LogOut, Stethoscope } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { initials } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ title, subtitle }) {
  const { user, signOut, switchRole } = useAuth();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSignOut = () => { signOut(); navigate('/login'); };
  const handleSwitch = (role) => {
    switchRole(role);
    navigate(`/${role}`);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 h-16">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-display text-base">OPD<span className="text-accent">.</span>care</span>
        </div>

        {/* Title */}
        <div className="hidden lg:block">
          {title && <h1 className="font-display text-xl leading-tight" data-testid="page-title">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>

        {/* Search */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              data-testid="global-search"
              placeholder="Search patients, doctors, tokens…"
              className="w-full pl-10 pr-14 py-2 rounded-full bg-muted/50 border border-border/80 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/70 transition"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] px-1.5 py-0.5 bg-card border border-border rounded-md text-muted-foreground">⌘K</kbd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            data-testid="theme-toggle"
            aria-label="Toggle theme"
            className="relative w-10 h-10 rounded-full border border-border hover:bg-muted/60 transition grid place-items-center"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            data-testid="notifications-btn"
            aria-label="Notifications"
            className="relative w-10 h-10 rounded-full border border-border hover:bg-muted/60 transition grid place-items-center"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
          </button>

          {/* User menu */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              data-testid="user-menu-trigger"
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border hover:bg-muted/60 transition"
            >
              <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sage text-primary-foreground grid place-items-center font-semibold text-xs">
                {initials(user?.name || '') || 'U'}
              </span>
              <span className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">{user?.name?.split(' ')[0] || 'Guest'}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{user?.role}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-72 card-elev overflow-hidden animate-enter" data-testid="user-menu">
                <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/10 border-b border-border">
                  <p className="font-display text-base">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-2">
                  <p className="px-2 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">Demo · switch role</p>
                  {['patient', 'doctor', 'admin'].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleSwitch(r)}
                      data-testid={`switch-role-${r}`}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize flex items-center justify-between hover:bg-muted/70 transition ${
                        user?.role === r ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      <span>{r}</span>
                      {user?.role === r && <span className="text-[10px] font-mono text-accent">current</span>}
                    </button>
                  ))}
                </div>
                <div className="border-t border-border p-2">
                  <button
                    onClick={handleSignOut}
                    data-testid="sign-out-btn"
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
