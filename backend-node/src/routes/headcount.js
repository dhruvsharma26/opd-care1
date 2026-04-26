import express from "express";

import {
  currentCount,
  totalFootfall,
  opdHeadcount,
  getWeeklyHeadcountHistory,
  getHeadcountDebugSnapshot,
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

router.get("/opdheadcount-debug", (req, res) => {
  try {
    res.json({
      ok: true,
      debug: getHeadcountDebugSnapshot(),
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to load headcount debug snapshot" });
  }
});
export default router;
