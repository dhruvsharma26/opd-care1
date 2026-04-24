import express from "express";

import {
  currentCount,
  totalFootfall,
  opdHeadcount,
  getWeeklyHeadcountHistory,
} from "../controllers/headcountwebsocket.js";

const router = express.Router();

router.get("/opdheadcount-stats", async (req, res) => {
  try {
    const weeklyHeadcount = await getWeeklyHeadcountHistory();

    res.json({
      currentCount,
      totalHeadcount: totalFootfall,
      footfallByHour: opdHeadcount,
      weeklyHeadcount,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to load headcount stats" });
  }
});
export default router;
