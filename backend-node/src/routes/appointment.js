import express from "express";
import * as appointmentController from "../controllers/appointment.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Specific routes MUST come before generic routes
router.get("/doctor/:doctorId", appointmentController.getDoctorAppointments);
router.get("/patient/:patientId", appointmentController.getPatientAppointments);

// Generic routes
router.post("/", verifyToken, appointmentController.createAppointment);
router.get("/", appointmentController.getAppointments);
router.get("/:id", appointmentController.getAppointmentById);
router.patch("/:id", verifyToken, appointmentController.updateAppointment);

export default router;
