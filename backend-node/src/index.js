import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patient.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentRoutes from "./routes/appointment.js";
import { errorHandler } from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// Root endpoints
const apiInfo = {
  message: "OPD Care Backend API",
  version: "1.0.0",
  endpoints: {
    auth: "/api/auth",
    patients: "/api/patients",
    doctors: "/api/doctors",
    appointments: "/api/appointments",
  },
};

app.get("/", (req, res) => {
  res.json(apiInfo);
});

app.get("/api", (req, res) => {
  res.json(apiInfo);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler middleware
app.use(errorHandler);

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✓ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(
        `✓ CORS enabled for: ${process.env.CORS_ORIGINS || "http://localhost:3000"}`,
      );
    });
  })
  .catch((error) => {
    console.error("✗ MongoDB connection failed:", error.message);
    process.exit(1);
  });

export default app;
