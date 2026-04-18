# OPD Care API - Complete Endpoint Reference

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints

### Sign Up

```
POST /auth/signup
Content-Type: application/json

Request:
{
  "email": "patient@example.com",
  "password": "password123",
  "name": "Rajesh Kumar",
  "role": "patient",          // "patient" | "doctor" | "admin"
  "phone": "+91 98120 44821"
}

Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f...",
    "email": "patient@example.com",
    "name": "Rajesh Kumar",
    "role": "patient",
    "phone": "+91 98120 44821"
  }
}
```

### Login

```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "patient@example.com",
  "password": "password123"
}

Response: Same as Sign Up
```

---

## 👥 Patient Endpoints

### Register Patient Intake

```
POST /patients
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91 98120 44821",
  "age": 45,
  "gender": "Male",                    // "Male" | "Female" | "Other"
  "bloodGroup": "O+",
  "medicalHistory": ["Hypertension"],
  "allergies": "No known drug allergies"
}

Response:
{
  "success": true,
  "patientId": "507f1f77bcf86cd799439011",
  "token": "OPD-507f1f",
  "message": "Patient registered successfully. Token: OPD-507f1f"
}
```

### Get All Patients

```
GET /patients
Authorization: Bearer {token}

Response:
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "phone": "+91 98120 44821",
    "age": 45,
    "gender": "Male",
    "bloodGroup": "O+",
    "medicalHistory": ["Hypertension"],
    "allergies": "No known drug allergies",
    "token": "OPD-507f1f",
    "createdAt": "2024-04-18T10:30:00",
    "updatedAt": "2024-04-18T10:30:00"
  }
]
```

### Get Patient by ID

```
GET /patients/{patient_id}
Authorization: Bearer {token}

Response: Single patient object (same structure as above)
```

### Update Patient

```
PUT /patients/{patient_id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "age": 46,
  "bloodGroup": "A+",
  "medicalHistory": ["Hypertension", "Diabetes"]
}

Response:
{
  "success": true,
  "message": "Patient updated successfully"
}
```

---

## 👨‍⚕️ Doctor Endpoints

### Create Doctor

```
POST /doctors
Content-Type: application/json

Request:
{
  "name": "Dr. Kabir Mehta",
  "email": "kabir@hospital.com",
  "specialty": "General Physician",
  "rating": 4.9,
  "experience": 12,
  "fee": 600,
  "avatar": "KM",
  "availableToday": true,
  "nextSlot": "11:20 AM",
  "password": "secure123"
}

Response:
{
  "success": true,
  "doctorId": "507f1f77bcf86cd799439012",
  "message": "Doctor created successfully"
}
```

### Get All Doctors

```
GET /doctors

Response:
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dr. Kabir Mehta",
    "email": "kabir@hospital.com",
    "specialty": "General Physician",
    "rating": 4.9,
    "experience": 12,
    "fee": 600,
    "avatar": "KM",
    "availableToday": true,
    "nextSlot": "11:20 AM",
    "createdAt": "2024-04-18T10:00:00"
  }
]
```

### Get Doctor by ID

```
GET /doctors/{doctor_id}

Response: Single doctor object
```

---

## 📅 Appointment Endpoints

### Book Appointment

```
POST /appointments
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "patientId": "507f1f77bcf86cd799439011",
  "patientName": "Rajesh Kumar",
  "doctorId": "507f1f77bcf86cd799439012",
  "date": "Today",
  "time": "11:20 AM",
  "complaint": "Fever and headache for 3 days",
  "age": 45,
  "gender": "Male",
  "severity": "moderate"              // "high" | "moderate" | "low"
}

Response:
{
  "success": true,
  "appointmentId": "507f1f77bcf86cd799439013",
  "message": "Appointment booked with Rajesh Kumar"
}
```

### Get All Appointments

```
GET /appointments
Authorization: Bearer {token}

Response:
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "patientId": "507f1f77bcf86cd799439011",
    "patientName": "Rajesh Kumar",
    "age": 45,
    "gender": "Male",
    "doctorId": "507f1f77bcf86cd799439012",
    "date": "Today",
    "time": "11:20 AM",
    "status": "upcoming",              // "upcoming" | "confirmed" | "completed"
    "complaint": "Fever and headache for 3 days",
    "severity": "moderate",
    "room": "OPD-A · 3rd floor",
    "report": null,
    "createdAt": "2024-04-18T10:35:00",
    "updatedAt": "2024-04-18T10:35:00"
  }
]
```

### Get Appointment by ID

```
GET /appointments/{appointment_id}
Authorization: Bearer {token}

Response: Single appointment object
```

### Get Doctor's Appointments

```
GET /doctors/{doctor_id}/appointments
Authorization: Bearer {token}

Response: List of doctor's appointments only
```

### Get Patient's Appointments

```
GET /patients/{patient_id}/appointments
Authorization: Bearer {token}

Response: List of patient's appointments only
```

### Update Appointment (Status + Report)

```
PUT /appointments/{appointment_id}
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "status": "confirmed",              // Change to "completed" after consultation
  "report": {
    "symptoms": ["Fever", "Headache", "Body ache"],
    "duration": "3 days",
    "description": "High fever in evenings, recurring headache, severe body ache. Self-medication with paracetamol not helping much.",
    "medicalHistory": ["Hypertension (controlled)", "Occasional migraines"],
    "currentMedications": ["Amlodipine 5mg daily"],
    "allergies": "No known drug allergies"
  }
}

Response:
{
  "success": true,
  "message": "Appointment updated successfully"
}
```

---

## 🏥 Health Check

### API Health Status

```
GET /health

Response:
{
  "status": "online",
  "database": "connected",
  "timestamp": "2024-04-18T10:30:00"
}
```

### API Info

```
GET /

Response:
{
  "message": "OPD Care API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs",
  "endpoints": {
    "health": "/api/health",
    "auth": ["/api/auth/login", "/api/auth/signup"],
    "patients": "/api/patients",
    "doctors": "/api/doctors",
    "appointments": "/api/appointments"
  }
}
```

---

## 📊 Demo/Test Endpoints

### Create Status Check

```
POST /status
Content-Type: application/json

Request:
{
  "client_name": "Frontend Test"
}

Response:
{
  "id": "507f1f77bcf86cd799439014",
  "client_name": "Frontend Test",
  "timestamp": "2024-04-18T10:30:00"
}
```

### Get All Status Checks

```
GET /status

Response: Array of status check objects
```

---

## Headers & Authentication

### Required Headers

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Getting Token

1. Call `/auth/signup` or `/auth/login`
2. Copy the `access_token` from response
3. Add to all authenticated requests: `Authorization: Bearer {token}`

---

## Status Codes

| Code | Meaning                        |
| ---- | ------------------------------ |
| 200  | Success                        |
| 201  | Created                        |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (invalid token)   |
| 404  | Not Found                      |
| 500  | Server Error                   |

---

## Error Responses

```json
{
  "detail": "Error message describing what went wrong"
}
```

Examples:

- Invalid token: `{"detail": "Token expired"}`
- Duplicate email: `{"detail": "Email already registered"}`
- Wrong password: `{"detail": "Invalid email or password"}`

---

## Interactive API Documentation

Once backend is running, visit:

- **Swagger UI:** http://localhost:5000/docs
- **ReDoc:** http://localhost:5000/redoc

(Auto-generated from FastAPI)

---

## Common Workflows

### 1. Patient Registration & Appointment Booking Flow

```
1. POST /auth/signup                 → Get access_token
2. POST /patients                    → Register patient intake, get token ID
3. GET /doctors                      → Browse available doctors
4. POST /appointments                → Book appointment with selected doctor
5. PUT /appointments/{id}            → Doctor confirms appointment + adds notes
```

### 2. Doctor Dashboard Flow

```
1. POST /auth/login                  → Get access_token
2. GET /doctors/{id}/appointments    → Get today's appointments
3. GET /appointments/{id}            → View appointment details & patient report
4. PUT /appointments/{id}            → Update status (confirm/complete) + add report
```

### 3. Patient Medical History Flow

```
1. GET /patients/{id}                → View own profile
2. GET /patients/{id}/appointments   → View all past & upcoming appointments
3. Appointments contain report       → See doctor's consultation notes
```

---

**API Version:** 1.0.0  
**Last Updated:** April 18, 2024  
**Status:** ✅ Ready for Testing
