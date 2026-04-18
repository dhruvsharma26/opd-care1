import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  signup: (data) => apiClient.post("/auth/signup", data),
  login: (data) => apiClient.post("/auth/login", data),
};

// Patient API
export const patientAPI = {
  create: (data) => apiClient.post("/patients", data),
  getAll: () => apiClient.get("/patients"),
  getById: (id) => apiClient.get(`/patients/${id}`),
  update: (id, data) => apiClient.patch(`/patients/${id}`, data),
};

// Doctor API
export const doctorAPI = {
  create: (data) => apiClient.post("/doctors", data),
  getAll: () => apiClient.get("/doctors"),
  getById: (id) => apiClient.get(`/doctors/${id}`),
};

// Appointment API
export const appointmentAPI = {
  create: (data) => apiClient.post("/appointments", data),
  getAll: () => apiClient.get("/appointments"),
  getById: (id) => apiClient.get(`/appointments/${id}`),
  getDoctorAppointments: (doctorId) =>
    apiClient.get(`/appointments/doctor/${doctorId}`),
  getPatientAppointments: (patientId) =>
    apiClient.get(`/appointments/patient/${patientId}`),
  update: (id, data) => apiClient.patch(`/appointments/${id}`, data),
};

export default apiClient;
