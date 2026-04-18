import { Patient } from "../models/index.js";

export const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      age,
      gender,
      bloodGroup,
      medicalHistory,
      allergies,
    } = req.body;

    if (!name || !email || !phone || !age || !gender) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Generate token
    const token = `OPD-${Date.now().toString().slice(-6)}`;

    const patient = new Patient({
      name,
      email,
      phone,
      age,
      gender,
      bloodGroup,
      medicalHistory: medicalHistory || [],
      allergies: allergies || "No known drug allergies",
      token,
    });

    await patient.save();

    res.status(201).json({
      success: true,
      patientId: patient._id,
      token,
      message: `Patient registered successfully. Token: ${token}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const patient = await Patient.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    next(error);
  }
};
