import mongoose from "mongoose";

const genderOptions = ["Male", "Female", "Other", "Non-binary", "Prefer not to say"];
export const HOURLY_HEADCOUNT_BUCKETS = [
  "8a",
  "9a",
  "10a",
  "11a",
  "12p",
  "1p",
  "2p",
  "3p",
  "4p",
  "5p",
  "6p",
  "7p",
];

const createHourlyHeadcountDefaults = () =>
  HOURLY_HEADCOUNT_BUCKETS.map((h) => ({ h, count: 0 }));

const hourlyHeadcountSchema = new mongoose.Schema(
  {
    h: {
      type: String,
      required: true,
      trim: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

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

const doctorAuthorizationDocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    dataUrl: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const doctorAuthorizationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    fullName: {
      type: String,
      default: "",
      trim: true,
    },
    specialty: {
      type: String,
      default: "",
      trim: true,
    },
    highestQualification: {
      type: String,
      default: "",
      trim: true,
    },
    licenseNumber: {
      type: String,
      default: "",
      trim: true,
    },
    councilName: {
      type: String,
      default: "",
      trim: true,
    },
    registrationYear: {
      type: String,
      default: "",
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    institutionName: {
      type: String,
      default: "",
      trim: true,
    },
    governmentIdNumber: {
      type: String,
      default: "",
      trim: true,
    },
    practiceAddress: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
    },
    reviewerNote: {
      type: String,
      default: "",
      trim: true,
    },
    submittedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: String,
      default: "",
      trim: true,
    },
    documents: {
      type: [doctorAuthorizationDocumentSchema],
      default: [],
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
    authorization: {
      type: doctorAuthorizationSchema,
      default: () => ({}),
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

const dailyHeadcountSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    weekday: {
      type: String,
      required: true,
      trim: true,
    },
    totalHeadcount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    footfallByHour: {
      type: [hourlyHeadcountSchema],
      default: createHourlyHeadcountDefaults,
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
dailyHeadcountSchema.index({ dateKey: 1 }, { unique: true });
dailyHeadcountSchema.index({ date: -1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
export const Patient = mongoose.model("Patient", patientSchema);
export const Doctor = mongoose.model("Doctor", doctorSchema);
export const User = mongoose.model("User", userSchema);
export const DailyHeadcount = mongoose.model("DailyHeadcount", dailyHeadcountSchema);
