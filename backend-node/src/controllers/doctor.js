import { Doctor } from "../models/index.js";

const serializeDoctor = (doctor) => {
  if (!doctor) return null;
  const data = doctor.toObject ? doctor.toObject() : doctor;
  return {
    ...data,
    _id: data._id?.toString?.() || data.id || "",
    id: data._id?.toString?.() || data.id || "",
    userId: data.userId?.toString?.() || data.userId || null,
  };
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
