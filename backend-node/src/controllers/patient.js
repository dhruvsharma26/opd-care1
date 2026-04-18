import { Patient, User } from "../models/index.js";

const createToken = () => `OPD-${Date.now().toString().slice(-6)}`;

const serializePatient = (patient) => {
  if (!patient) return null;
  const data = patient.toObject ? patient.toObject() : patient;
  return {
    ...data,
    _id: data._id?.toString?.() || data.id || "",
    id: data._id?.toString?.() || data.id || "",
    userId: data.userId?.toString?.() || data.userId || null,
  };
};

export const createPatient = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "patient" && user.role !== "admin") {
      return res.status(403).json({ error: "Only patients can update intake" });
    }

    const {
      age,
      gender,
      bloodGroup,
      complaint,
      medicalHistory = [],
      currentMedications = [],
      allergies = "No known drug allergies",
    } = req.body;

    if (!age || !gender) {
      return res.status(400).json({ error: "Age and gender are required" });
    }

    const updates = {
      name: user.name,
      email: user.email,
      phone: user.phone,
      age: Number(age),
      gender,
      bloodGroup: bloodGroup || "",
      latestComplaint: complaint || "",
      medicalHistory,
      currentMedications,
      allergies,
    };

    let patient;
    if (user.patientId) {
      patient = await Patient.findByIdAndUpdate(
        user.patientId,
        { ...updates, token: createToken() },
        { new: true, runValidators: true },
      );
    } else {
      patient = await Patient.create({
        userId: user._id,
        ...updates,
        token: createToken(),
      });
      user.patientId = patient._id;
      await user.save();
    }

    res.status(201).json({
      success: true,
      patientId: patient._id.toString(),
      token: patient.token,
      patient: serializePatient(patient),
      message: "Patient details saved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients.map(serializePatient).filter(Boolean));
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

    res.json(serializePatient(patient));
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
      updates,
      { new: true, runValidators: true },
    );

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      patient: serializePatient(patient),
    });
  } catch (error) {
    next(error);
  }
};
