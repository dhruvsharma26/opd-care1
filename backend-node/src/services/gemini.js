const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const COMMON_SYMPTOMS = [
  "fever",
  "headache",
  "cough",
  "cold",
  "sore throat",
  "chest pain",
  "breathlessness",
  "shortness of breath",
  "abdominal pain",
  "nausea",
  "vomiting",
  "diarrhea",
  "dizziness",
  "fatigue",
  "body ache",
  "back pain",
  "rash",
  "itching",
  "palpitations",
  "weakness",
];

const KEYWORD_TO_DEPARTMENT = [
  { match: ["chest pain", "palpitations", "bp", "blood pressure"], department: "Cardiology" },
  { match: ["rash", "itching", "skin", "redness"], department: "Dermatology" },
  { match: ["back pain", "fracture", "joint", "knee", "shoulder"], department: "Orthopedic" },
  { match: ["headache", "migraine", "dizziness", "seizure", "numbness"], department: "Neurology" },
  { match: ["child", "baby", "infant", "pediatric"], department: "Pediatrics" },
];

const normalizeText = (value) => String(value || "").trim();

const extractTextResponse = (data) =>
  data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim() || "";

const keywordMatches = (text, keywords) =>
  keywords.filter((keyword) => text.includes(keyword));

const detectDepartment = (complaint) => {
  const text = normalizeText(complaint).toLowerCase();
  const match = KEYWORD_TO_DEPARTMENT.find(({ match: keywords }) =>
    keywords.some((keyword) => text.includes(keyword)),
  );
  return match?.department || "General Medicine";
};

const deriveUrgency = (complaint) => {
  const text = complaint.toLowerCase();
  if (
    /(chest pain|breathlessness|shortness of breath|severe bleeding|unconscious|stroke|seizure)/.test(
      text,
    )
  ) {
    return { level: "high", score: 88 };
  }
  if (/(fever|persistent|vomiting|dizziness|abdominal pain|palpitations)/.test(text)) {
    return { level: "moderate", score: 61 };
  }
  return { level: "low", score: 34 };
};

const buildHourlyBuckets = () =>
  ["8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p"].map((h) => ({
    h,
    count: 0,
  }));

const formatHourBucket = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  let hour = date.getHours();
  const suffix = hour >= 12 ? "p" : "a";
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}${suffix}`;
};

const summarizeOperationalData = ({ patients, doctors, appointments }) => {
  const departmentCounts = new Map();
  doctors.forEach((doctor) => {
    const specialty = normalizeText(doctor.specialty) || "General Medicine";
    if (!departmentCounts.has(specialty)) {
      departmentCounts.set(specialty, {
        name: specialty,
        patients: 0,
        doctorCount: 0,
      });
    }
    departmentCounts.get(specialty).doctorCount += 1;
  });

  appointments.forEach((appointment) => {
    const specialty =
      normalizeText(appointment.specialty)
      || detectDepartment(appointment.complaint)
      || "General Medicine";
    if (!departmentCounts.has(specialty)) {
      departmentCounts.set(specialty, {
        name: specialty,
        patients: 0,
        doctorCount: 0,
      });
    }
    departmentCounts.get(specialty).patients += 1;
  });

  const hourlyBuckets = buildHourlyBuckets();
  const hourlyMap = new Map(hourlyBuckets.map((entry) => [entry.h, entry]));
  [...patients, ...appointments].forEach((record) => {
    const bucket = formatHourBucket(record.createdAt);
    if (bucket && hourlyMap.has(bucket)) {
      hourlyMap.get(bucket).count += 1;
    }
  });

  return {
    patientsCount: patients.length,
    doctorsCount: doctors.length,
    pendingCases: appointments.filter((entry) => entry.status !== "completed").length,
    approvedDoctors: doctors.filter(
      (entry) => entry.authorization?.status === "approved",
    ).length,
    pendingAuthorizations: doctors.filter(
      (entry) => (entry.authorization?.status || "pending") === "pending",
    ).length,
    departmentCounts: Array.from(departmentCounts.values()),
    hourlyBuckets,
    recentComplaints: appointments.slice(0, 20).map((entry) => ({
      complaint: entry.complaint,
      specialty: entry.specialty,
      severity: entry.severity,
      status: entry.status,
    })),
  };
};

export const buildComplaintFallback = (complaint) => {
  const normalizedComplaint = normalizeText(complaint);
  const lowerComplaint = normalizedComplaint.toLowerCase();
  const urgency = deriveUrgency(lowerComplaint);
  const symptoms = keywordMatches(lowerComplaint, COMMON_SYMPTOMS).slice(0, 6);
  const specialty = detectDepartment(lowerComplaint);
  const riskFlags = [];

  if (urgency.level === "high") {
    riskFlags.push("Escalate triage priority and clinician review");
  }
  if (lowerComplaint.includes("fever")) {
    riskFlags.push("Check vitals and temperature history");
  }
  if (lowerComplaint.includes("breath") || lowerComplaint.includes("cough")) {
    riskFlags.push("Monitor respiratory distress indicators");
  }

  return {
    summary: normalizedComplaint
      ? `Reported symptoms suggest ${specialty.toLowerCase()} review may be appropriate.`
      : "No complaint text available for analysis.",
    urgency: urgency.level,
    urgencyScore: urgency.score,
    likelyDepartment: specialty,
    keySymptoms: symptoms,
    riskFlags,
    recommendations: [
      "Keep the complaint wording specific for faster triage.",
      "Mention duration, severity, and any worsening triggers.",
      "Seek urgent care immediately if symptoms intensify suddenly.",
    ],
    recommendedDoctors: [],
  };
};

export const buildAdminFallback = ({ patients, doctors, appointments }) => {
  const summary = summarizeOperationalData({ patients, doctors, appointments });
  const departmentLoad = summary.departmentCounts
    .sort((a, b) => b.patients - a.patients)
    .slice(0, 6)
    .map((entry) => ({
      name: entry.name,
      patients: entry.patients,
      capacity: Math.max(entry.patients + 4, entry.doctorCount * 14 || 12),
    }));

  const avgWaitMinutes =
    appointments.length > 0
      ? Math.min(45, Math.max(6, Math.round(summary.pendingCases * 3.5 + 6)))
      : 8;
  const opdHeadcount = Math.max(
    patients.length + summary.pendingCases + doctors.filter((entry) => entry.availableToday).length,
    patients.length,
  );

  const recommendations = [];
  if (departmentLoad[0]?.patients >= departmentLoad[0]?.capacity - 2) {
    recommendations.push(
      `Shift support staff toward ${departmentLoad[0].name} to ease near-capacity demand.`,
    );
  }
  if (summary.pendingAuthorizations > 0) {
    recommendations.push(
      `Review ${summary.pendingAuthorizations} pending clinician authorization request(s) to unlock queue capacity.`,
    );
  }
  if (summary.pendingCases > Math.max(3, Math.floor(appointments.length / 2))) {
    recommendations.push("Pending appointments are stacking up; prioritize the longest waiting cases.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Current OPD flow looks stable; keep monitoring queue conversions and specialty balance.");
  }

  return {
    overview: {
      avgWaitMinutes,
      opdHeadcount,
      bottleneckDepartment: departmentLoad[0]?.name || "General Medicine",
    },
    departmentLoad: departmentLoad.length > 0
      ? departmentLoad
      : [{ name: "General Medicine", patients: patients.length, capacity: Math.max(patients.length + 5, 12) }],
    footfallByHour: summary.hourlyBuckets,
    recommendations: recommendations.slice(0, 3),
  };
};

export const generateGeminiJson = async ({ prompt, schema, temperature = 0.4 }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(`${GEMINI_API_URL}/models/${DEFAULT_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Gemini request failed");
  }

  const text = extractTextResponse(payload);
  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return JSON.parse(text);
};

export const analyzeComplaintWithGemini = async (complaint, doctors = []) => {
  const prompt = [
    "You are assisting OPD triage for a patient intake form.",
    "Analyze the symptom text and return only JSON.",
    "Do not diagnose diseases. Infer urgency, likely department, symptom tags, and safe next-step recommendations.",
    "Set urgencyScore on a 0 to 100 scale where higher means more urgent.",
    "Recommend doctors only from the provided list. Use exact ids and names from that list.",
    `Available doctors: ${JSON.stringify(doctors)}`,
    `Complaint text: ${normalizeText(complaint)}`,
  ].join("\n");

  return generateGeminiJson({
    prompt,
    schema: {
      type: "OBJECT",
      properties: {
        summary: { type: "STRING" },
        urgency: {
          type: "STRING",
          enum: ["low", "moderate", "high"],
        },
        urgencyScore: { type: "INTEGER" },
        likelyDepartment: { type: "STRING" },
        keySymptoms: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        riskFlags: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        recommendations: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        recommendedDoctors: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              name: { type: "STRING" },
              specialty: { type: "STRING" },
              reason: { type: "STRING" },
            },
            required: ["id", "name", "specialty", "reason"],
          },
        },
      },
      required: [
        "summary",
        "urgency",
        "urgencyScore",
        "likelyDepartment",
        "keySymptoms",
        "riskFlags",
        "recommendations",
        "recommendedDoctors",
      ],
    },
  });
};

export const analyzeAdminDashboardWithGemini = async ({ patients, doctors, appointments }) => {
  const operationalSummary = summarizeOperationalData({ patients, doctors, appointments });
  const prompt = [
    "You are an OPD operations analyst helping an admin dashboard.",
    "Use the supplied live data summary to produce operational chart data and concise recommendations.",
    "Keep all output grounded in the provided numbers. When estimating, be conservative and internally consistent.",
    "Return only JSON.",
    `Live operations summary: ${JSON.stringify(operationalSummary)}`,
  ].join("\n");

  return generateGeminiJson({
    prompt,
    schema: {
      type: "OBJECT",
      properties: {
        overview: {
          type: "OBJECT",
          properties: {
            avgWaitMinutes: { type: "INTEGER" },
            opdHeadcount: { type: "INTEGER" },
            bottleneckDepartment: { type: "STRING" },
          },
          required: ["avgWaitMinutes", "opdHeadcount", "bottleneckDepartment"],
        },
        departmentLoad: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              patients: { type: "INTEGER" },
              capacity: { type: "INTEGER" },
            },
            required: ["name", "patients", "capacity"],
          },
        },
        footfallByHour: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              h: { type: "STRING" },
              count: { type: "INTEGER" },
            },
            required: ["h", "count"],
          },
        },
        recommendations: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
      },
      required: ["overview", "departmentLoad", "footfallByHour", "recommendations"],
    },
    temperature: 0.3,
  });
};
