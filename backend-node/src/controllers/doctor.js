import { Doctor } from "../models/index.js";

export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
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

    const doctor = new Doctor({
      name,
      email,
      specialty,
      rating: rating || 4.5,
      experience,
      fee,
      avatar,
      availableToday: availableToday !== false,
      nextSlot: nextSlot || "11:00 AM",
    });

    await doctor.save();

    res.status(201).json({
      success: true,
      doctorId: doctor._id,
      message: "Doctor created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.json(doctors);
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id).select("-password");

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(doctor);
  } catch (error) {
    next(error);
  }
};
