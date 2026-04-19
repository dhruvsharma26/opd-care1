const formatTimestamp = (value) =>
  new Date(value || Date.now()).toLocaleString("en-IN");

const toAuditSeverity = (entry) =>
  entry.type === "authorize" || entry.type === "doctor" ? "warn" : "info";

export const buildLiveActivityLogs = ({ patients = [], doctors = [], appointments = [] }) => {
  const patientLogs = patients.map((patient, index) => ({
    id: `patient-${patient._id || index}`,
    type: "register",
    timestamp: formatTimestamp(patient.createdAt),
    action: `Patient profile created - ${patient.name || "Unnamed patient"}`,
    user: patient.email || patient.phone || "Patient",
    sortTime: new Date(patient.createdAt || 0).getTime(),
    actor: `patient.${(patient.name || "unknown").toLowerCase().replace(/\s+/g, "_")}`,
    auditAction: "PATIENT_REGISTERED",
    target: patient.latestComplaint || patient._id || "patient-profile",
    severity: "info",
  }));

  const doctorLogs = doctors.flatMap((doctor, index) => {
    const baseLogs = [
      {
        id: `doctor-${doctor._id || index}`,
        type: "doctor",
        timestamp: formatTimestamp(doctor.createdAt),
        action: `Doctor profile active - ${doctor.name || "Doctor"}`,
        user: doctor.email || doctor.phone || "Doctor",
        sortTime: new Date(doctor.createdAt || 0).getTime(),
        actor: `doctor.${(doctor.name || "unknown").toLowerCase().replace(/\s+/g, "_")}`,
        auditAction: "DOCTOR_PROFILE_ACTIVE",
        target: doctor.specialty || doctor._id || "doctor-profile",
        severity: "info",
      },
    ];

    if (doctor.authorization?.submittedAt) {
      baseLogs.push({
        id: `doctor-auth-submit-${doctor._id || index}`,
        type: "authorize",
        timestamp: formatTimestamp(doctor.authorization.submittedAt),
        action: `Authorization submitted - ${doctor.name || "Doctor"}`,
        user: doctor.email || "Doctor",
        sortTime: new Date(doctor.authorization.submittedAt).getTime(),
        actor: `doctor.${(doctor.name || "unknown").toLowerCase().replace(/\s+/g, "_")}`,
        auditAction: "AUTHORIZATION_SUBMITTED",
        target: doctor.authorization.status || "pending",
        severity: "warn",
      });
    }

    if (doctor.authorization?.reviewedAt) {
      baseLogs.push({
        id: `doctor-auth-review-${doctor._id || index}`,
        type: "authorize",
        timestamp: formatTimestamp(doctor.authorization.reviewedAt),
        action: `Authorization ${doctor.authorization.status} - ${doctor.name || "Doctor"}`,
        user: doctor.authorization.reviewedBy || "Admin",
        sortTime: new Date(doctor.authorization.reviewedAt).getTime(),
        actor: `admin.${String(doctor.authorization.reviewedBy || "admin").toLowerCase().replace(/\s+/g, "_")}`,
        auditAction: `AUTHORIZATION_${String(doctor.authorization.status || "pending").toUpperCase()}`,
        target: doctor.name || doctor._id || "doctor-authorization",
        severity: "warn",
      });
    }

    return baseLogs;
  });

  const appointmentLogs = appointments.map((appointment, index) => ({
    id: `appointment-${appointment._id || index}`,
    type: appointment.status === "completed" ? "consult" : "book",
    timestamp: formatTimestamp(appointment.createdAt),
    action:
      appointment.status === "completed"
        ? `Consultation completed - ${appointment.patientName}`
        : `Appointment booked - ${appointment.patientName} with ${appointment.doctorName}`,
    user: appointment.doctorName || appointment.patientName || "System",
    sortTime: new Date(appointment.createdAt || 0).getTime(),
    actor:
      appointment.status === "completed"
        ? `doctor.${String(appointment.doctorName || "doctor").toLowerCase().replace(/\s+/g, "_")}`
        : `patient.${String(appointment.patientName || "patient").toLowerCase().replace(/\s+/g, "_")}`,
    auditAction:
      appointment.status === "completed" ? "CONSULTATION_COMPLETED" : "APPOINTMENT_BOOKED",
    target: appointment.complaint || appointment._id || "appointment",
    severity: "info",
  }));

  const systemLog = {
    id: "system-dashboard-refresh",
    type: "system",
    timestamp: formatTimestamp(Date.now()),
    action: "Live dashboard refreshed from patient, doctor, and appointment records",
    user: "System",
    sortTime: Date.now(),
    actor: "system.live_sync",
    auditAction: "LIVE_DASHBOARD_REFRESH",
    target: "admin-dashboard",
    severity: "info",
  };

  return [systemLog, ...patientLogs, ...doctorLogs, ...appointmentLogs]
    .sort((a, b) => b.sortTime - a.sortTime);
};

export const buildAuditRows = (activityLogs = []) =>
  activityLogs.map((entry, index) => ({
    id: entry.id || `audit-${index}`,
    ts: entry.timestamp,
    actor: entry.actor || entry.user || "system",
    action: entry.auditAction || entry.type?.toUpperCase() || "EVENT",
    target: entry.target || entry.action || "live-activity",
    severity: entry.severity || toAuditSeverity(entry),
  }));

const escapePdfText = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

export const downloadSimplePdf = (filename, lines) => {
  const safeLines = (lines || []).map((line) => escapePdfText(line)).slice(0, 45);
  const contentLines = safeLines.map((line, index) => `BT /F1 11 Tf 48 ${780 - index * 16} Td (${line}) Tj ET`);
  const stream = contentLines.join("\n");
  const objects = [];

  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const pageId = addObject("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

  const objectBodies = [catalogId, pagesId, pageId, fontId, contentId];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objectBodies.forEach((_, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
