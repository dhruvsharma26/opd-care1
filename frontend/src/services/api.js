import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "auth_token";
const USER_STORAGE_KEY = "opd:user";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  signup: (data) => apiClient.post("/auth/signup", data),
  login: (data) => apiClient.post("/auth/login", data),
};

export const patientAPI = {
  create: (data) => apiClient.post("/patients", data),
  getAll: () => apiClient.get("/patients"),
  getById: (id) => apiClient.get(`/patients/${id}`),
  update: (id, data) => apiClient.patch(`/patients/${id}`, data),
};

export const doctorAPI = {
  create: (data) => apiClient.post("/doctors", data),
  getAll: () => apiClient.get("/doctors"),
  getById: (id) => apiClient.get(`/doctors/${id}`),
  submitAuthorization: (id, data) =>
    apiClient.patch(`/doctors/${id}/authorization`, data),
  reviewAuthorization: (id, data) =>
    apiClient.patch(`/doctors/${id}/authorization/review`, data),
};

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

export const aiAPI = {
  analyzeComplaint: (data) => apiClient.post("/ai/complaint-analysis", data),
  getAdminDashboardAnalytics: () => apiClient.get("/ai/admin-dashboard"),
};

export default apiClient;
