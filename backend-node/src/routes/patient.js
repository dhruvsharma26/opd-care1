import express from "express";
import * as patientController from "../controllers/patient.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", patientController.createPatient);
router.get("/", patientController.getPatients);
router.get("/:id", patientController.getPatientById);
router.patch("/:id", verifyToken, patientController.updatePatient);

export default router;
