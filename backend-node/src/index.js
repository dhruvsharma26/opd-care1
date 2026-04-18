import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import patientRoutes from "./routes/patient.js";
import doctorRoutes from "./routes/doctor.js";
import appointmentRoutes from "./routes/appointment.js";
import { errorHandler } from "./middleware/auth.js";
import { seedDemoData } from "./utils/seed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "http://localhost:3000").split(","),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

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

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    await seedDemoData();
    console.log("Demo data ready");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(
        `CORS enabled for: ${process.env.CORS_ORIGINS || "http://localhost:3000"}`,
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

export default app;
