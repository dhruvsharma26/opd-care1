export const NOTIFICATIONS = [
  { id: 'n1', type: 'appointment', title: 'Dr. Mehta is ready', body: 'Your 11:20 AM consultation is about to begin.', time: '2m ago', unread: true },
  { id: 'n2', type: 'lab', title: 'Lab report uploaded', body: 'Complete Blood Count — 7 Jan', time: '1h ago', unread: true },
  { id: 'n3', type: 'reminder', title: 'Take your evening medication', body: 'Metformin 500mg', time: '3h ago', unread: false },
  { id: 'n4', type: 'ops', title: 'Pediatrics nearing capacity', body: '36 of 50 beds occupied', time: 'Yesterday', unread: false },
];

export const HEALTH_RECORDS = [
  { id: 'hr-01', type: 'Lab', title: 'Complete Blood Count', doctor: 'Dr. Kabir Mehta', date: '07 Jan 2026', status: 'normal' },
  { id: 'hr-02', type: 'Imaging', title: 'Chest X-Ray (PA view)', doctor: 'Dr. Sanya Rao', date: '22 Dec 2025', status: 'review' },
  { id: 'hr-03', type: 'Prescription', title: 'Metformin 500mg · 30 days', doctor: 'Dr. Kabir Mehta', date: '07 Jan 2026', status: 'active' },
  { id: 'hr-04', type: 'Vaccination', title: 'Influenza booster', doctor: 'Dr. Meera S.', date: '12 Nov 2025', status: 'complete' },
  { id: 'hr-05', type: 'Lab', title: 'Lipid profile', doctor: 'Dr. Kabir Mehta', date: '18 Oct 2025', status: 'normal' },
];

export const DOCTOR_SCHEDULE = [
  { day: 'Mon', date: '13 Jan', slots: [{ t: '09:00', name: 'Rajesh Kumar' }, { t: '09:30', name: 'Priya Sharma' }, { t: '10:00', name: '—' }, { t: '10:30', name: 'Amit Patel' }] },
  { day: 'Tue', date: '14 Jan', slots: [{ t: '09:00', name: 'Lakshmi Devi' }, { t: '09:30', name: '—' }, { t: '10:00', name: 'Vikram Singh' }, { t: '10:30', name: 'Neha Joshi' }] },
  { day: 'Wed', date: '15 Jan', slots: [{ t: '09:00', name: '—' }, { t: '09:30', name: 'Sameer Khan' }, { t: '10:00', name: 'Riya Das' }, { t: '10:30', name: '—' }] },
  { day: 'Thu', date: '16 Jan', slots: [{ t: '09:00', name: 'Pooja Iyer' }, { t: '09:30', name: 'Rohan M.' }, { t: '10:00', name: '—' }, { t: '10:30', name: 'Asha K.' }] },
  { day: 'Fri', date: '17 Jan', slots: [{ t: '09:00', name: 'Kavya Rao' }, { t: '09:30', name: '—' }, { t: '10:00', name: 'Manoj P.' }, { t: '10:30', name: 'Ira S.' }] },
];

export const DOCTOR_PATIENTS = [
  { id: 'OPD-0232', name: 'Rajesh Kumar', last: '07 Jan 2026', diagnosis: 'Viral fever', visits: 3 },
  { id: 'OPD-0211', name: 'Priya Sharma', last: '02 Jan 2026', diagnosis: 'Gastritis', visits: 5 },
  { id: 'OPD-0199', name: 'Amit Patel', last: '28 Dec 2025', diagnosis: 'Bronchitis', visits: 2 },
  { id: 'OPD-0187', name: 'Lakshmi Devi', last: '20 Dec 2025', diagnosis: 'Hypertension', visits: 8 },
  { id: 'OPD-0172', name: 'Vikram Singh', last: '10 Dec 2025', diagnosis: 'Lumbar strain', visits: 1 },
  { id: 'OPD-0166', name: 'Neha Joshi', last: '02 Dec 2025', diagnosis: 'Contact dermatitis', visits: 2 },
];

export const CONSULT_NOTES = [
  { id: 'cn-01', patient: 'Rajesh Kumar', date: '07 Jan 2026', summary: 'Viral fever, hydration + rest, follow-up in 3 days if persists.', tags: ['fever', 'OTC'] },
  { id: 'cn-02', patient: 'Priya Sharma', date: '02 Jan 2026', summary: 'Mild gastritis. Prescribed PPI for 14 days. Avoid spicy food.', tags: ['gastritis', 'PPI'] },
  { id: 'cn-03', patient: 'Amit Patel', date: '28 Dec 2025', summary: 'Bronchitis, antibiotics (amoxicillin 500mg BID × 5d).', tags: ['antibiotic'] },
];

export const STAFF = [
  { id: 's-01', name: 'Dr. Kabir Mehta', role: 'General Physician', dept: 'Internal Medicine', status: 'online', shift: 'Morning' },
  { id: 's-02', name: 'Dr. Sanya Rao', role: 'Cardiologist', dept: 'Cardiology', status: 'online', shift: 'Morning' },
  { id: 's-03', name: 'Dr. Meera Subramanian', role: 'Pediatrician', dept: 'Pediatrics', status: 'online', shift: 'Morning' },
  { id: 's-04', name: 'Dr. Farhan Qureshi', role: 'Dermatologist', dept: 'Dermatology', status: 'offline', shift: 'Evening' },
  { id: 's-05', name: 'Dr. Arjun Nair', role: 'Orthopedic', dept: 'Orthopedics', status: 'online', shift: 'Morning' },
  { id: 's-06', name: 'Anita Varghese', role: 'Head Nurse', dept: 'OPD Reception', status: 'online', shift: 'Morning' },
  { id: 's-07', name: 'Sandeep Iyer', role: 'Pharmacist', dept: 'Pharmacy', status: 'online', shift: 'Day' },
];

export const DEPARTMENTS_META = [
  { name: 'Internal Medicine', head: 'Dr. Kabir Mehta', staff: 14, beds: 60, occupancy: 70 },
  { name: 'Cardiology', head: 'Dr. Sanya Rao', staff: 9, beds: 40, occupancy: 70 },
  { name: 'Pediatrics', head: 'Dr. Meera Subramanian', staff: 11, beds: 50, occupancy: 72 },
  { name: 'Orthopedics', head: 'Dr. Arjun Nair', staff: 7, beds: 30, occupancy: 63 },
  { name: 'Dermatology', head: 'Dr. Farhan Qureshi', staff: 5, beds: 25, occupancy: 60 },
  { name: 'Neurology', head: 'Dr. Ishita Bose', staff: 6, beds: 20, occupancy: 60 },
];

export const AUDIT_LOGS = [
  { id: 'al-01', ts: '2026-01-18 10:45:02', actor: 'admin.rhea', action: 'EXPORT_REPORT', target: 'daily_opd_18jan.pdf', severity: 'info' },
  { id: 'al-02', ts: '2026-01-18 10:30:44', actor: 'doctor.mehta', action: 'CONSULT_COMPLETE', target: 'OPD-0242', severity: 'info' },
  { id: 'al-03', ts: '2026-01-18 10:15:10', actor: 'system.ai', action: 'VOICE_ANALYZED', target: 'session-9182', severity: 'info' },
  { id: 'al-04', ts: '2026-01-18 09:55:00', actor: 'system', action: 'ALERT_CLEARED', target: 'cardiology_capacity', severity: 'warn' },
  { id: 'al-05', ts: '2026-01-18 09:42:12', actor: 'patient.ananya', action: 'APPT_BOOKED', target: 'Dr. Meera S.', severity: 'info' },
  { id: 'al-06', ts: '2026-01-18 08:59:01', actor: 'admin.rhea', action: 'SHIFT_OPENED', target: 'morning', severity: 'info' },
  { id: 'al-07', ts: '2026-01-17 21:14:55', actor: 'system', action: 'BACKUP_COMPLETE', target: 'db-snapshot-17jan', severity: 'info' },
  { id: 'al-08', ts: '2026-01-17 18:03:22', actor: 'security', action: 'LOGIN_FAIL_THRESHOLD', target: 'unknown.ip.118', severity: 'warn' },
];
