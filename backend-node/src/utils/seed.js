import bcrypt from "bcryptjs";
import { Doctor, Patient, User } from "../models/index.js";

const defaultDoctors = [
  {
    name: "Dr. Kabir Mehta",
    email: "doctor@opd.care",
    phone: "+91 98230 11223",
    specialty: "General Physician",
    license_number: "DOC-KABIRMEHTA",
    experience: 12,
    fee: 600,
    rating: 4.9,
    availableToday: true,
    nextSlot: "11:20 AM",
  },
  {
    name: "Dr. Sanya Rao",
    email: "sanya.rao@opd.care",
    phone: "+91 99888 10203",
    specialty: "Cardiologist",
    license_number: "DOC-SANYARAO",
    experience: 15,
    fee: 1200,
    rating: 4.8,
    availableToday: true,
    nextSlot: "12:00 PM",
  },
  {
    name: "Dr. Farhan Qureshi",
    email: "farhan.qureshi@opd.care",
    phone: "+91 99771 11108",
    specialty: "Dermatologist",
    license_number: "DOC-FARHANQURES",
    experience: 9,
    fee: 900,
    rating: 4.7,
    availableToday: false,
    nextSlot: "Tomorrow 10:00 AM",
  },
  {
    name: "Dr. Meera Subramanian",
    email: "meera.subramanian@opd.care",
    phone: "+91 90001 23045",
    specialty: "Pediatrician",
    license_number: "DOC-MEERASUBRAM",
    experience: 18,
    fee: 800,
    rating: 4.9,
    availableToday: true,
    nextSlot: "2:30 PM",
  },
];

const ensureUserWithProfile = async ({
  email,
  password,
  name,
  phone,
  role,
  patient,
  doctor,
}) => {
  let user = await User.findOne({ email });
  const hashedPassword = await bcrypt.hash(password, 10);

  if (!user) {
    user = await User.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role,
    });
  }

  if (role === "patient") {
    let patientDoc = await Patient.findOne({ userId: user._id });
    if (!patientDoc) {
      patientDoc = await Patient.create({
        userId: user._id,
        name,
        email,
        phone,
        ...patient,
      });
    }
    if (!user.patientId || user.patientId.toString() !== patientDoc._id.toString()) {
      user.patientId = patientDoc._id;
      await user.save();
    }
  }

  if (role === "doctor") {
    let doctorDoc =
      (await Doctor.findOne({ userId: user._id })) ||
      (await Doctor.findOne({ email }));
    if (!doctorDoc) {
      doctorDoc = await Doctor.create({
        userId: user._id,
        name,
        email,
        phone,
        ...doctor,
      });
    } else if (!doctorDoc.userId) {
      doctorDoc.userId = user._id;
      await doctorDoc.save();
    }
    if (!user.doctorId || user.doctorId.toString() !== doctorDoc._id.toString()) {
      user.doctorId = doctorDoc._id;
      await user.save();
    }
  }
};

export const seedDemoData = async () => {
  for (const doctor of defaultDoctors) {
    const existing = await Doctor.findOne({ email: doctor.email });
    if (!existing) {
      await Doctor.create(doctor);
    }
  }

  await ensureUserWithProfile({
    email: "patient@opd.care",
    password: "demo1234",
    name: "Ananya Iyer",
    phone: "+91 98120 44821",
    role: "patient",
    patient: {
      age: 29,
      gender: "Female",
      bloodGroup: "O+",
      allergies: "No known drug allergies",
      latestComplaint: "Recurring headache with mild fever",
      token: "OPD-240001",
    },
  });

  await ensureUserWithProfile({
    email: "doctor@opd.care",
    password: "demo1234",
    name: "Dr. Kabir Mehta",
    phone: "+91 98230 11223",
    role: "doctor",
    doctor: {
      specialty: "General Physician",
      license_number: "DOC-KABIRMEHTA-USER",
      experience: 12,
      fee: 600,
      rating: 4.9,
      availableToday: true,
      nextSlot: "11:20 AM",
    },
  });

  const admin = await User.findOne({ email: "admin@opd.care" });
  if (!admin) {
    await User.create({
      email: "admin@opd.care",
      password: await bcrypt.hash("demo1234", 10),
      name: "Rhea Kapoor",
      phone: "+91 90000 00001",
      role: "admin",
    });
  }
};
