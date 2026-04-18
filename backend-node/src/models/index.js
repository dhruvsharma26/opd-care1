import mongoose from "mongoose";

const genderOptions = ["Male", "Female", "Other", "Non-binary", "Prefer not to say"];

const patientReportSchema = new mongoose.Schema(
  {
    symptoms: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    diagnosis: {
      type: String,
      default: "",
    },
    prescription: {
      type: String,
      default: "",
    },
    followUpDate: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    allergies: {
      type: String,
      default: "No known drug allergies",
    },
  },
  { _id: false },
);

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    age: Number,
    gender: {
      type: String,
      enum: genderOptions,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "confirmed", "completed", "cancelled"],
      default: "upcoming",
    },
    complaint: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ["high", "moderate", "low"],
      default: "moderate",
    },
    room: {
      type: String,
      default: "OPD-A - 3rd floor",
    },
    report: {
      type: patientReportSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    age: Number,
    gender: {
      type: String,
      enum: genderOptions,
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    currentMedications: {
      type: [String],
      default: [],
    },
    allergies: {
      type: String,
      default: "No known drug allergies",
    },
    latestComplaint: {
      type: String,
      default: "",
    },
    token: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    specialty: {
      type: String,
      required: true,
      trim: true,
    },
    license_number: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    experience: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 500,
    },
    avatar: {
      type: String,
      default: "",
    },
    availableToday: {
      type: Boolean,
      default: true,
    },
    nextSlot: {
      type: String,
      default: "11:00 AM",
    },
  },
  {
    timestamps: true,
  },
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  },
  {
    timestamps: true,
  },
);

appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ doctorId: 1, createdAt: -1 });
patientSchema.index({ email: 1 });
doctorSchema.index({ email: 1 });
userSchema.index({ email: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
export const Patient = mongoose.model("Patient", patientSchema);
export const Doctor = mongoose.model("Doctor", doctorSchema);
export const User = mongoose.model("User", userSchema);
