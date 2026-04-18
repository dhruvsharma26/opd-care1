import { createContext, useContext, useEffect, useState } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "opd:user";
const TOKEN_KEY = "auth_token";

const normalizeUser = (userData) => {
  if (!userData) return null;

  return {
    ...userData,
    patientId: userData.patientId || userData.patient?.id || null,
    doctorId: userData.doctorId || userData.doctor?.id || null,
    age: userData.patient?.age ?? userData.age ?? null,
    gender: userData.patient?.gender ?? userData.gender ?? "",
    bloodGroup: userData.patient?.bloodGroup ?? userData.bloodGroup ?? "",
    allergies: userData.patient?.allergies ?? userData.allergies ?? "",
    latestComplaint:
      userData.patient?.latestComplaint ?? userData.latestComplaint ?? "",
    specialty: userData.doctor?.specialty ?? userData.specialty ?? "",
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeUser(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const signUp = async ({ email, password, name, role = "patient", phone }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.signup({
        email,
        password,
        name,
        role,
        phone,
      });
      const userData = normalizeUser(response.data.user);
      setUser(userData);
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login({ email, password });
      const userData = normalizeUser(response.data.user);
      setUser(userData);
      localStorage.setItem(TOKEN_KEY, response.data.access_token);
      return userData;
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates) => {
    setUser((current) => normalizeUser({ ...current, ...updates }));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        getToken,
        updateUser,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
