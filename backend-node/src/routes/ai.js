import express from "express";
import * as aiController from "../controllers/ai.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/complaint-analysis", verifyToken, aiController.analyzeComplaint);
router.get("/admin-dashboard", verifyToken, aiController.getAdminDashboardAnalytics);

export default router;
