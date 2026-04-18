import mongoose from "mongoose";
import dotenv from "dotenv";
import { Doctor } from "./src/models/index.js";

dotenv.config();

const SAMPLE_DOCTORS = [
  {
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@hospital.com",
    specialty: "General Physician",
    rating: 4.8,
    experience: 12,
    fee: 500,
    availableToday: true,
    nextSlot: "11:00 AM",
  },
  {
    name: "Dr. Priya Sharma",
    email: "priya.sharma@hospital.com",
    specialty: "Cardiologist",
    rating: 4.9,
    experience: 15,
    fee: 800,
    availableToday: true,
    nextSlot: "10:30 AM",
  },
  {
    name: "Dr. Anuj Singh",
    email: "anuj.singh@hospital.com",
    specialty: "Dermatologist",
    rating: 4.6,
    experience: 8,
    fee: 600,
    availableToday: false,
    nextSlot: "3:00 PM",
  },
  {
    name: "Dr. Meena Gupta",
    email: "meena.gupta@hospital.com",
    specialty: "Pulmonologist",
    rating: 4.7,
    experience: 10,
    fee: 700,
    availableToday: true,
    nextSlot: "2:00 PM",
  },
  {
    name: "Dr. Vikram Patel",
    email: "vikram.patel@hospital.com",
    specialty: "Ophthalmologist",
    rating: 4.5,
    experience: 9,
    fee: 550,
    availableToday: true,
    nextSlot: "11:30 AM",
  },
  {
    name: "Dr. Sneha Joshi",
    email: "sneha.joshi@hospital.com",
    specialty: "Dentist",
    rating: 4.4,
    experience: 7,
    fee: 400,
    availableToday: true,
    nextSlot: "10:00 AM",
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✓ Connected to MongoDB");

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log("✓ Cleared existing doctors");

    // Insert sample doctors
    const inserted = await Doctor.insertMany(SAMPLE_DOCTORS);
    console.log(`✓ Inserted ${inserted.length} doctors`);

    console.log("\nSample doctors:");
    inserted.forEach((doc) => {
      console.log(`  - ${doc.name} (${doc.specialty}) - ₹${doc.fee}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
