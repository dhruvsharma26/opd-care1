import mongoose from "mongoose";

const patientReportSchema = new mongoose.Schema({
  symptoms: [String],
  duration: String,
  description: String,
  medicalHistory: [String],
  currentMedications: [String],
  allergies: {
    type: String,
    default: "No known drug allergies",
  },
});

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  patientName: String,
  age: Number,
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  doctorName: String,
  specialty: String,
  date: String,
  time: String,
  status: {
    type: String,
    enum: ["upcoming", "confirmed", "completed"],
    default: "upcoming",
  },
  complaint: String,
  severity: {
    type: String,
    enum: ["high", "moderate", "low"],
    default: "moderate",
  },
  room: {
    type: String,
    default: "OPD-A · 3rd floor",
  },
  report: patientReportSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: String,
  age: Number,
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
  },
  bloodGroup: String,
  medicalHistory: [String],
  allergies: {
    type: String,
    default: "No known drug allergies",
  },
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: String,
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  specialty: String,
  rating: {
    type: Number,
    default: 4.5,
  },
  experience: Number,
  fee: Number,
  avatar: String,
  availableToday: {
    type: Boolean,
    default: true,
  },
  nextSlot: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: String,
  password: String,
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient",
  },
  phone: String,
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
patientSchema.index({ email: 1 });
patientSchema.index({ userId: 1 });
doctorSchema.index({ email: 1 });
doctorSchema.index({ userId: 1 });
userSchema.index({ email: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
export const Patient = mongoose.model("Patient", patientSchema);
export const Doctor = mongoose.model("Doctor", doctorSchema);
export const User = mongoose.model("User", userSchema);
