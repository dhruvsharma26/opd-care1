import { Appointment, Doctor, Patient, User } from "../models/index.js";
import {
  analyzeAdminDashboardWithGemini,
  analyzeComplaintWithGemini,
  buildAdminFallback,
  buildComplaintFallback,
} from "../services/gemini.js";

const normalizeComplaintAnalysis = (analysis, fallback) => ({
  summary: analysis?.summary || fallback.summary,
  urgency: ["low", "moderate", "high"].includes(analysis?.urgency)
    ? analysis.urgency
    : fallback.urgency,
  urgencyScore:
    Number.isFinite(Number(analysis?.urgencyScore))
    && Number(analysis?.urgencyScore) >= 0
    && Number(analysis?.urgencyScore) <= 100
      ? Number(analysis.urgencyScore)
      : fallback.urgencyScore,
  likelyDepartment: analysis?.likelyDepartment || fallback.likelyDepartment,
  keySymptoms:
    Array.isArray(analysis?.keySymptoms) && analysis.keySymptoms.length > 0
      ? analysis.keySymptoms.slice(0, 6)
      : fallback.keySymptoms,
  riskFlags:
    Array.isArray(analysis?.riskFlags) && analysis.riskFlags.length > 0
      ? analysis.riskFlags.slice(0, 4)
      : fallback.riskFlags,
  recommendations:
    Array.isArray(analysis?.recommendations) && analysis.recommendations.length > 0
      ? analysis.recommendations.slice(0, 4)
      : fallback.recommendations,
  recommendedDoctors:
    Array.isArray(analysis?.recommendedDoctors) && analysis.recommendedDoctors.length > 0
      ? analysis.recommendedDoctors.slice(0, 3)
      : fallback.recommendedDoctors,
});

const normalizeAdminAnalytics = (analytics, fallback) => ({
  overview: {
    avgWaitMinutes:
      Number.isFinite(Number(analytics?.overview?.avgWaitMinutes))
      && Number(analytics?.overview?.avgWaitMinutes) >= 0
        ? Number(analytics.overview.avgWaitMinutes)
        : fallback.overview.avgWaitMinutes,
    opdHeadcount:
      Number.isFinite(Number(analytics?.overview?.opdHeadcount))
      && Number(analytics?.overview?.opdHeadcount) >= 0
        ? Number(analytics.overview.opdHeadcount)
        : fallback.overview.opdHeadcount,
    bottleneckDepartment:
      analytics?.overview?.bottleneckDepartment || fallback.overview.bottleneckDepartment,
  },
  departmentLoad:
    Array.isArray(analytics?.departmentLoad) && analytics.departmentLoad.length > 0
      ? analytics.departmentLoad.slice(0, 6)
      : fallback.departmentLoad,
  footfallByHour:
    Array.isArray(analytics?.footfallByHour) && analytics.footfallByHour.length > 0
      ? analytics.footfallByHour.slice(0, 12)
      : fallback.footfallByHour,
  recommendations:
    Array.isArray(analytics?.recommendations) && analytics.recommendations.length > 0
      ? analytics.recommendations.slice(0, 4)
      : fallback.recommendations,
});

export const analyzeComplaint = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const actor = await User.findById(userId);
    if (!actor) {
      return res.status(404).json({ error: "User not found" });
    }

    const complaint = String(req.body?.complaint || "").trim();
    if (complaint.length < 8) {
      return res.status(400).json({ error: "Please enter a fuller symptom description" });
    }

    const fallback = buildComplaintFallback(complaint);
    const doctors = await Doctor.find({
      "authorization.status": "approved",
    }).sort({ availableToday: -1, rating: -1, experience: -1 }).lean();

    const doctorOptions = doctors.map((doctor) => ({
      id: doctor._id?.toString() || "",
      name: doctor.name || "Doctor",
      specialty: doctor.specialty || "General Medicine",
      experience: doctor.experience || 0,
      rating: doctor.rating || 0,
      availableToday: Boolean(doctor.availableToday),
      nextSlot: doctor.nextSlot || "",
      fee: doctor.fee || 0,
    }));

    const pickFallbackDoctors = () => {
      const targetDepartment = fallback.likelyDepartment.toLowerCase();
      const sortedDoctors = [...doctorOptions].sort((a, b) => {
        const aMatch = a.specialty.toLowerCase().includes(targetDepartment) ? 1 : 0;
        const bMatch = b.specialty.toLowerCase().includes(targetDepartment) ? 1 : 0;
        if (aMatch !== bMatch) return bMatch - aMatch;
        if (a.availableToday !== b.availableToday) return Number(b.availableToday) - Number(a.availableToday);
        if ((b.rating || 0) !== (a.rating || 0)) return (b.rating || 0) - (a.rating || 0);
        return (b.experience || 0) - (a.experience || 0);
      });

      return sortedDoctors.slice(0, 3).map((doctor) => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        reason: doctor.specialty.toLowerCase().includes(targetDepartment)
          ? `Matches the likely department for these symptoms and has relevant OPD availability.`
          : `Available doctor who can review these symptoms and redirect if specialist escalation is needed.`,
        availableToday: doctor.availableToday,
        nextSlot: doctor.nextSlot,
        fee: doctor.fee,
        rating: doctor.rating,
        experience: doctor.experience,
      }));
    };

    fallback.recommendedDoctors = pickFallbackDoctors();
    try {
      const analysis = normalizeComplaintAnalysis(
        await analyzeComplaintWithGemini(complaint, doctorOptions),
        fallback,
      );
      const recommendedDoctors = (analysis.recommendedDoctors || [])
        .map((entry) => {
          const matchedDoctor = doctorOptions.find((doctor) => doctor.id === entry.id)
            || doctorOptions.find((doctor) => doctor.name === entry.name);
          if (!matchedDoctor) return null;
          return {
            id: matchedDoctor.id,
            name: matchedDoctor.name,
            specialty: matchedDoctor.specialty,
            reason: entry.reason,
            availableToday: matchedDoctor.availableToday,
            nextSlot: matchedDoctor.nextSlot,
            fee: matchedDoctor.fee,
            rating: matchedDoctor.rating,
            experience: matchedDoctor.experience,
          };
        })
        .filter(Boolean);

      return res.json({
        success: true,
        source: "gemini",
        analysis: {
          ...analysis,
          recommendedDoctors:
            recommendedDoctors.length > 0 ? recommendedDoctors : fallback.recommendedDoctors,
        },
      });
    } catch (error) {
      return res.json({
        success: true,
        source: "fallback",
        analysis: fallback,
        note: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const actor = await User.findById(userId);
    if (!actor || actor.role !== "admin") {
      return res.status(403).json({ error: "Only admins can access AI dashboard analytics" });
    }

    const [patients, doctors, appointments] = await Promise.all([
      Patient.find().sort({ createdAt: -1 }).lean(),
      Doctor.find().sort({ createdAt: -1 }).lean(),
      Appointment.find().sort({ createdAt: -1 }).lean(),
    ]);

    const fallback = buildAdminFallback({ patients, doctors, appointments });
    try {
      const analytics = normalizeAdminAnalytics(
        await analyzeAdminDashboardWithGemini({
          patients,
          doctors,
          appointments,
        }),
        fallback,
      );
      return res.json({ success: true, source: "gemini", analytics });
    } catch (error) {
      return res.json({
        success: true,
        source: "fallback",
        analytics: fallback,
        note: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};
