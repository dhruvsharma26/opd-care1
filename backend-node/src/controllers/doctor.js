import { Doctor, User } from "../models/index.js";

const serializeDoctor = (doctor) => {
  if (!doctor) return null;
  const data = doctor.toObject ? doctor.toObject() : doctor;
  return {
    ...data,
    _id: data._id?.toString?.() || data.id || "",
    id: data._id?.toString?.() || data.id || "",
    userId: data.userId?.toString?.() || data.userId || null,
    authorization: {
      status: data.authorization?.status || "pending",
      fullName: data.authorization?.fullName || "",
      specialty: data.authorization?.specialty || data.specialty || "",
      highestQualification: data.authorization?.highestQualification || "",
      licenseNumber:
        data.authorization?.licenseNumber || data.license_number || "",
      councilName: data.authorization?.councilName || "",
      registrationYear: data.authorization?.registrationYear || "",
      yearsOfExperience:
        data.authorization?.yearsOfExperience ?? data.experience ?? 0,
      institutionName: data.authorization?.institutionName || "",
      governmentIdNumber: data.authorization?.governmentIdNumber || "",
      practiceAddress: data.authorization?.practiceAddress || "",
      bio: data.authorization?.bio || "",
      reviewerNote: data.authorization?.reviewerNote || "",
      submittedAt: data.authorization?.submittedAt || null,
      reviewedAt: data.authorization?.reviewedAt || null,
      reviewedBy: data.authorization?.reviewedBy || "",
      documents: (data.authorization?.documents || []).map((document) => ({
        _id: document._id?.toString?.() || document.id || "",
        id: document._id?.toString?.() || document.id || "",
        name: document.name || "",
        type: document.type || "",
        size: document.size || 0,
        dataUrl: document.dataUrl || "",
        uploadedAt: document.uploadedAt || null,
      })),
    },
  };
};

const getActor = async (req) => {
  const userId = req.user?.userId;
  if (!userId) return null;
  return User.findById(userId);
};

export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      specialty,
      rating,
      experience,
      fee,
      avatar,
      availableToday,
      nextSlot,
    } = req.body;

    if (!name || !email || !specialty) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const licenseNumber =
      req.body.license_number ||
      `DOC-${email.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 12) || Date.now()}`;

    const doctor = await Doctor.create({
      name,
      email,
      phone,
      specialty,
      license_number: licenseNumber,
      rating: rating || 4.5,
      experience: experience || 0,
      fee: fee || 500,
      avatar: avatar || "",
      availableToday: availableToday !== false,
      nextSlot: nextSlot || "11:00 AM",
    });

    res.status(201).json({
      success: true,
      doctorId: doctor._id.toString(),
      doctor: serializeDoctor(doctor),
      message: "Doctor created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.json(doctors.map(serializeDoctor).filter(Boolean));
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(serializeDoctor(doctor));
  } catch (error) {
    next(error);
  }
};

export const submitAuthorization = async (req, res, next) => {
  try {
    const actor = await getActor(req);
    if (!actor) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const isOwner =
      actor.role === "doctor"
      && actor.doctorId
      && actor.doctorId.toString() === doctor._id.toString();

    if (!isOwner && actor.role !== "admin") {
      return res.status(403).json({ error: "Not allowed to update this authorization form" });
    }

    const {
      fullName,
      specialty,
      highestQualification,
      licenseNumber,
      councilName,
      registrationYear,
      yearsOfExperience,
      institutionName,
      governmentIdNumber,
      practiceAddress,
      bio,
      documents = [],
    } = req.body;

    if (
      !fullName
      || !specialty
      || !highestQualification
      || !licenseNumber
      || !councilName
      || !registrationYear
      || !institutionName
      || !governmentIdNumber
      || !practiceAddress
      || !Array.isArray(documents)
      || documents.length === 0
    ) {
      return res.status(400).json({
        error: "Complete the eligibility form and upload at least one credential document",
      });
    }

    doctor.name = fullName;
    doctor.specialty = specialty;
    doctor.license_number = licenseNumber;
    doctor.experience = Number(yearsOfExperience) || 0;
    doctor.authorization = {
      status: "pending",
      fullName,
      specialty,
      highestQualification,
      licenseNumber,
      councilName,
      registrationYear,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      institutionName,
      governmentIdNumber,
      practiceAddress,
      bio: bio || "",
      reviewerNote: "",
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: "",
      documents: documents.map((document) => ({
        name: document.name || "Credential",
        type: document.type || "",
        size: Number(document.size) || 0,
        dataUrl: document.dataUrl || "",
      })),
    };

    await doctor.save();

    res.json({
      success: true,
      message: "Authorization form submitted for admin review",
      doctor: serializeDoctor(doctor),
    });
  } catch (error) {
    next(error);
  }
};

export const reviewAuthorization = async (req, res, next) => {
  try {
    const actor = await getActor(req);
    if (!actor || actor.role !== "admin") {
      return res.status(403).json({ error: "Only admins can review doctor authorization" });
    }

    const { id } = req.params;
    const { status, reviewerNote = "" } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be approved or rejected" });
    }

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    doctor.authorization = {
      ...(doctor.authorization?.toObject?.() || doctor.authorization || {}),
      status,
      reviewerNote,
      reviewedAt: new Date(),
      reviewedBy: actor.name || actor.email,
    };

    await doctor.save();

    res.json({
      success: true,
      message: `Doctor authorization ${status}`,
      doctor: serializeDoctor(doctor),
    });
  } catch (error) {
    next(error);
  }
};
