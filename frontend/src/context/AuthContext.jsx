import { createContext, useContext, useEffect, useState } from 'react';
import { DEMO_USERS } from '../lib/mockData';

const AuthContext = createContext(null);

const STORAGE_KEY = 'opd:user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  // Mock sign-in. Accepts role; creates a session using demo profile + overrides (name/email from form)
  const signIn = ({ role, email, name, phone }) => {
    const base = DEMO_USERS[role] || DEMO_USERS.patient;
    const merged = {
      ...base,
      email: email || base.email,
      name: name || base.name,
      phone: phone || base.phone,
    };
    setUser(merged);
    return merged;
  };

  const signUp = ({ role, email, name, phone }) => signIn({ role, email, name, phone });

  const signOut = () => setUser(null);

  const switchRole = (role) => {
    const base = DEMO_USERS[role] || DEMO_USERS.patient;
    setUser(base);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
