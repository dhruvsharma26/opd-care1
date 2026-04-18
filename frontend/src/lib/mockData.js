// Mock data for the Smart OPD Assist application

export const DEMO_USERS = {
  patient: { id: 'p-001', name: 'Ananya Iyer', email: 'patient@opd.care', phone: '+91 98120 44821', role: 'patient', avatar: 'AI', bloodGroup: 'O+', age: 29, gender: 'Female' },
  doctor:  { id: 'd-011', name: 'Dr. Kabir Mehta', email: 'doctor@opd.care', phone: '+91 98230 11223', role: 'doctor', avatar: 'KM', specialty: 'General Physician', reg: 'MCI-44-2019', department: 'Internal Medicine' },
  admin:   { id: 'a-001', name: 'Rhea Kapoor', email: 'admin@opd.care', phone: '+91 90000 00001', role: 'admin', avatar: 'RK', department: 'Operations' },
};

export const DOCTORS = [
  { id: 'd-011', name: 'Dr. Kabir Mehta', specialty: 'General Physician', rating: 4.9, exp: 12, fee: 600, avatar: 'KM', color: 'sage', availableToday: true, nextSlot: '11:20 AM', tags: ['English', 'Hindi'] },
  { id: 'd-012', name: 'Dr. Sanya Rao', specialty: 'Cardiologist', rating: 4.8, exp: 15, fee: 1200, avatar: 'SR', color: 'accent', availableToday: true, nextSlot: '12:00 PM', tags: ['English', 'Kannada'] },
  { id: 'd-013', name: 'Dr. Farhan Qureshi', specialty: 'Dermatologist', rating: 4.7, exp: 9, fee: 900, avatar: 'FQ', color: 'sand', availableToday: false, nextSlot: 'Tomorrow 10:00 AM', tags: ['English', 'Urdu'] },
  { id: 'd-014', name: 'Dr. Meera Subramanian', specialty: 'Pediatrician', rating: 4.9, exp: 18, fee: 800, avatar: 'MS', color: 'sage', availableToday: true, nextSlot: '2:30 PM', tags: ['English', 'Tamil'] },
  { id: 'd-015', name: 'Dr. Arjun Nair', specialty: 'Orthopedic', rating: 4.6, exp: 11, fee: 1000, avatar: 'AN', color: 'accent', availableToday: true, nextSlot: '4:15 PM', tags: ['English', 'Malayalam'] },
  { id: 'd-016', name: 'Dr. Ishita Bose', specialty: 'Neurologist', rating: 4.9, exp: 20, fee: 1500, avatar: 'IB', color: 'sand', availableToday: false, nextSlot: 'Thu 9:00 AM', tags: ['English', 'Bengali'] },
];

export const PATIENT_QUEUE = [
  { id: 'OPD-0241', name: 'Rajesh Kumar', age: 45, gender: 'Male', complaint: 'Fever and headache for 3 days', time: '09:15', status: 'waiting', severity: 'moderate', token: 12 },
  { id: 'OPD-0242', name: 'Priya Sharma', age: 32, gender: 'Female', complaint: 'Recurring abdominal pain, mild nausea', time: '09:30', status: 'in-progress', severity: 'high', token: 13 },
  { id: 'OPD-0243', name: 'Amit Patel', age: 28, gender: 'Male', complaint: 'Persistent cough and cold, chest tightness', time: '09:45', status: 'waiting', severity: 'low', token: 14 },
  { id: 'OPD-0244', name: 'Lakshmi Devi', age: 67, gender: 'Female', complaint: 'BP fluctuation, occasional dizziness', time: '10:00', status: 'waiting', severity: 'high', token: 15 },
  { id: 'OPD-0245', name: 'Vikram Singh', age: 38, gender: 'Male', complaint: 'Lower back pain after lifting', time: '10:15', status: 'completed', severity: 'moderate', token: 16 },
  { id: 'OPD-0246', name: 'Neha Joshi', age: 24, gender: 'Female', complaint: 'Skin rash on forearms, mild itching', time: '10:30', status: 'waiting', severity: 'low', token: 17 },
];

export const PATIENT_APPOINTMENTS = [
  { id: 'A-1001', doctor: 'Dr. Kabir Mehta', specialty: 'General Physician', date: 'Today', time: '11:20 AM', status: 'confirmed', room: 'OPD-A · 3rd floor' },
  { id: 'A-1002', doctor: 'Dr. Meera Subramanian', specialty: 'Pediatrician', date: 'Sat, 18 Jan', time: '2:30 PM', status: 'upcoming', room: 'OPD-C · 2nd floor' },
  { id: 'A-0998', doctor: 'Dr. Sanya Rao', specialty: 'Cardiologist', date: 'Mon, 13 Jan', time: '10:00 AM', status: 'completed', room: 'Cardio Wing' },
];

export const VITALS_TREND = [
  { day: 'Mon', bp: 118, hr: 72, spo2: 98 },
  { day: 'Tue', bp: 122, hr: 76, spo2: 97 },
  { day: 'Wed', bp: 119, hr: 70, spo2: 99 },
  { day: 'Thu', bp: 124, hr: 78, spo2: 98 },
  { day: 'Fri', bp: 121, hr: 74, spo2: 98 },
  { day: 'Sat', bp: 117, hr: 71, spo2: 99 },
  { day: 'Sun', bp: 120, hr: 73, spo2: 98 },
];

export const DEPARTMENT_LOAD = [
  { name: 'General Med', patients: 42, capacity: 60 },
  { name: 'Cardiology', patients: 28, capacity: 40 },
  { name: 'Pediatrics', patients: 36, capacity: 50 },
  { name: 'Orthopedic', patients: 19, capacity: 30 },
  { name: 'Dermatology', patients: 15, capacity: 25 },
  { name: 'Neurology', patients: 12, capacity: 20 },
];

export const FOOTFALL_BY_HOUR = [
  { h: '8a', count: 12 }, { h: '9a', count: 28 }, { h: '10a', count: 42 }, { h: '11a', count: 55 },
  { h: '12p', count: 48 }, { h: '1p', count: 30 }, { h: '2p', count: 38 }, { h: '3p', count: 44 },
  { h: '4p', count: 52 }, { h: '5p', count: 36 }, { h: '6p', count: 22 }, { h: '7p', count: 14 },
];

export const ACTIVITY_LOGS = [
  { id: '1', timestamp: '10:45 AM', action: 'Patient registered — Rajesh Kumar (OPD-0241)', user: 'Reception · Anita', type: 'register' },
  { id: '2', timestamp: '10:30 AM', action: 'Consultation completed — Priya Sharma', user: 'Dr. Mehta', type: 'consult' },
  { id: '3', timestamp: '10:15 AM', action: 'Voice complaint analyzed — confidence 92%', user: 'AI Assistant', type: 'ai' },
  { id: '4', timestamp: '10:00 AM', action: 'Shift started — Morning', user: 'Dr. Mehta', type: 'shift' },
  { id: '5', timestamp: '09:55 AM', action: 'Occupancy alert cleared — Cardiology', user: 'System', type: 'alert' },
  { id: '6', timestamp: '09:42 AM', action: 'New appointment booked — Meera Subramanian', user: 'Patient · Ananya', type: 'book' },
  { id: '7', timestamp: '09:30 AM', action: 'Admin exported daily OPD report (PDF)', user: 'Admin · Rhea', type: 'export' },
];

export const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

export const SPECIALTIES = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist'];
