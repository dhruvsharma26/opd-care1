import bcrypt from "bcryptjs";
import { User, Patient, Doctor } from "../models/index.js";
import { generateToken } from "../utils/auth.js";

const doctorDefaults = {
  specialty: "General Physician",
  license_number: "DOC-GENERAL-0001",
  experience: 0,
  fee: 500,
  availableToday: true,
  nextSlot: "11:00 AM",
};

const createLicenseNumber = (email) =>
  `DOC-${email.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 12) || Date.now()}`;

const buildUserPayload = async (userId) => {
  const user = await User.findById(userId)
    .populate("patientId")
    .populate("doctorId")
    .lean();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone || "",
    patientId: user.patientId?._id?.toString() || user.patientId?.toString() || null,
    doctorId: user.doctorId?._id?.toString() || user.doctorId?.toString() || null,
    patient: user.patientId && typeof user.patientId === "object"
      ? {
          id: user.patientId._id.toString(),
          age: user.patientId.age ?? null,
          gender: user.patientId.gender || "",
          bloodGroup: user.patientId.bloodGroup || "",
          allergies: user.patientId.allergies || "",
          latestComplaint: user.patientId.latestComplaint || "",
        }
      : null,
    doctor: user.doctorId && typeof user.doctorId === "object"
      ? {
          id: user.doctorId._id.toString(),
          specialty: user.doctorId.specialty || "",
          experience: user.doctorId.experience ?? 0,
          fee: user.doctorId.fee ?? 0,
          availableToday: Boolean(user.doctorId.availableToday),
          nextSlot: user.doctorId.nextSlot || "",
        }
      : null,
  };
};

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, role = "patient", phone = "" } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: name.trim(),
      role,
      phone: phone.trim(),
    });

    if (role === "doctor") {
      const doctor = await Doctor.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        ...doctorDefaults,
        license_number: createLicenseNumber(user.email),
      });
      user.doctorId = doctor._id;
      await user.save();
    } else if (role === "patient") {
      const patient = await Patient.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });
      user.patientId = patient._id;
      await user.save();
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    const payload = await buildUserPayload(user._id);

    res.status(201).json({
      access_token: token,
      token_type: "bearer",
      user: payload,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    const payload = await buildUserPayload(user._id);

    res.json({
      access_token: token,
      token_type: "bearer",
      user: payload,
    });
  } catch (error) {
    next(error);
  }
};
