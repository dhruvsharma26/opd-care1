import express from "express";
import * as doctorController from "../controllers/doctor.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyToken, doctorController.createDoctor);
router.get("/", doctorController.getDoctors);
router.patch("/:id/authorization", verifyToken, doctorController.submitAuthorization);
router.patch("/:id/authorization/review", verifyToken, doctorController.reviewAuthorization);
router.get("/:id", doctorController.getDoctorById);

export default router;
