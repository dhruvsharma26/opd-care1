import bcrypt from "bcryptjs";
import { User, Patient, Doctor } from "../models/index.js";
import { generateToken } from "../utils/auth.js";

export const signup = async (req, res, next) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "patient",
      phone,
    });

    await user.save();

    // Create corresponding Patient or Doctor record
    if (role === "doctor") {
      const doctor = new Doctor({
        userId: user._id,
        name,
        email,
        phone,
        specialty: "General Practitioner",
        experience: 0,
        fee: 500,
      });
      await doctor.save();
      user.doctorId = doctor._id;
    } else {
      const patient = new Patient({
        userId: user._id,
        name,
        email,
        phone,
      });
      await patient.save();
      user.patientId = patient._id;
    }

    await user.save();

    const token = generateToken(user._id.toString(), user.email);

    res.status(201).json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        patientId: user.patientId,
        doctorId: user.doctorId,
      },
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

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user._id.toString(), user.email);

    res.json({
      access_token: token,
      token_type: "bearer",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        patientId: user.patientId,
        doctorId: user.doctorId,
      },
    });
  } catch (error) {
    next(error);
  }
};
