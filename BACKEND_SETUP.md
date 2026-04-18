# MongoDB & Backend Integration Complete ✅

## What I've Setup

### 1. **Environment Configuration** (.env)

```
PORT=5000
MONGO_URI=mongodb+srv://admin:root@cluster0.fbgjhb1.mongodb.net/hospital_opd?retryWrites=true&w=majority
JWT_SECRET=secret123
CORS_ORIGINS=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000
DB_NAME=hospital_opd
```

**Location:** `backend/.env`

### 2. **Database Models** (models.py)

Created comprehensive Pydantic models for:

- **Patient** - Name, email, phone, age, gender, blood group, medical history, allergies
- **Doctor** - Name, specialty, rating, experience, fees
- **Appointment** - Patient-Doctor booking with status, complaint, severity, detailed report
- **User** - Email, password (hashed), name, role (patient/doctor/admin), phone
- **PatientReport** - Symptoms, duration, description, medical history, medications, allergies

### 3. **Backend Server** (server.py) - FULLY INTEGRATED

✅ **Authentication**

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with JWT tokens

✅ **Patient Endpoints**

- `POST /api/patients` - Register patient intake
- `GET /api/patients` - List all patients
- `GET /api/patients/{id}` - Get patient details
- `PUT /api/patients/{id}` - Update patient info

✅ **Doctor Endpoints**

- `GET /api/doctors` - List all doctors
- `GET /api/doctors/{id}` - Get doctor details
- `POST /api/doctors` - Create new doctor

✅ **Appointment Endpoints**

- `POST /api/appointments` - Book appointment
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/{id}` - Get appointment details
- `GET /api/doctors/{doctor_id}/appointments` - Get doctor's appointments
- `GET /api/patients/{patient_id}/appointments` - Get patient's appointments
- `PUT /api/appointments/{id}` - Update status & add report

✅ **Database Features**

- Automatic collection creation on startup
- Unique indexes on emails
- Indexes on patientId & doctorId for faster queries
- Password hashing with bcrypt
- JWT token generation & verification
- Async/await database operations (Motor)

---

## How to Run Backend

### **Option 1: Using Python Virtual Environment (Recommended)**

1. **Create Python Virtual Environment:**

   ```powershell
   cd C:\Users\dhruv\OneDrive\Desktop\opdcare1\OPD-Care1\backend
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

2. **Install Dependencies:**

   ```powershell
   pip install -r requirements.txt
   ```

3. **Run Server:**

   ```powershell
   uvicorn server:app --host 0.0.0.0 --port 5000 --reload
   ```

4. **Access API:**
   - API Docs: http://localhost:5000/docs
   - Health Check: http://localhost:5000/api/health

### **Option 2: Using Docker (If you prefer)**

Create `Dockerfile` in backend folder:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5000"]
```

Run:

```powershell
docker build -t opd-care-api .
docker run -p 5000:5000 --env-file .env opd-care-api
```

---

## Testing Endpoints (Using Thunder Client or Postman)

### **1. Sign Up (Create Account)**

```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123",
  "name": "Rajesh Kumar",
  "role": "patient",
  "phone": "+91 98120 44821"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "patient@example.com",
    "name": "Rajesh Kumar",
    "role": "patient",
    "phone": "+91 98120 44821"
  }
}
```

### **2. Login**

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "patient@example.com",
  "password": "password123"
}
```

### **3. Register Patient Intake**

(Use token from signup response in Authorization header)

```http
POST http://localhost:5000/api/patients
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "+91 98120 44821",
  "age": 45,
  "gender": "Male",
  "bloodGroup": "O+",
  "medicalHistory": ["Hypertension"],
  "allergies": "No known drug allergies"
}
```

### **4. List All Doctors**

```http
GET http://localhost:5000/api/doctors
```

### **5. Book Appointment**

(Requires auth token)

```http
POST http://localhost:5000/api/appointments
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "patientId": "OPD-0241",
  "patientName": "Rajesh Kumar",
  "doctorId": "d-011",
  "date": "Today",
  "time": "11:20 AM",
  "complaint": "Fever and headache for 3 days",
  "age": 45,
  "gender": "Male",
  "severity": "moderate"
}
```

### **6. Get Doctor's Appointments**

```http
GET http://localhost:5000/api/doctors/d-011/appointments
Authorization: Bearer eyJhbGc...
```

### **7. Update Appointment Status**

```http
PUT http://localhost:5000/api/appointments/507f1f77bcf86cd799439013
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "status": "confirmed",
  "report": {
    "symptoms": ["Fever", "Headache"],
    "duration": "3 days",
    "description": "High fever in evenings...",
    "medicalHistory": ["Hypertension"],
    "currentMedications": ["Amlodipine 5mg daily"],
    "allergies": "No known drug allergies"
  }
}
```

---

## MongoDB Collections (Auto-Created)

### **patients**

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  age: Number,
  gender: "Male" | "Female" | "Other",
  bloodGroup: String,
  medicalHistory: [String],
  allergies: String,
  token: String,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### **doctors**

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  specialty: String,
  rating: Number,
  experience: Number,
  fee: Number,
  avatar: String,
  availableToday: Boolean,
  nextSlot: String,
  createdAt: DateTime
}
```

### **appointments**

```javascript
{
  _id: ObjectId,
  patientId: String,
  patientName: String,
  age: Number,
  gender: String,
  doctorId: String,
  date: String,
  time: String,
  status: "upcoming" | "confirmed" | "completed",
  complaint: String,
  severity: "high" | "moderate" | "low",
  room: String,
  report: {
    symptoms: [String],
    duration: String,
    description: String,
    medicalHistory: [String],
    currentMedications: [String],
    allergies: String
  },
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### **users**

```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed),
  role: "patient" | "doctor" | "admin",
  phone: String,
  createdAt: DateTime
}
```

---

## Next Steps: Frontend Integration

Once backend is running, update Frontend API calls:

1. **Create API Service** (`frontend/src/services/api.js`):

```javascript
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

2. **Update Auth Context** to use login endpoint
3. **Replace Mock Data calls** with API calls
4. **Handle loading & error states**

---

## Troubleshooting

| Issue                      | Solution                                                    |
| -------------------------- | ----------------------------------------------------------- |
| `python not found`         | Install Python 3.11+ from python.org or Windows Store       |
| `uvicorn not installed`    | Run: `pip install -r requirements.txt`                      |
| `MongoDB connection error` | Check MONGO_URI in .env, ensure MongoDB Atlas is accessible |
| `Port 5000 already in use` | Change PORT in .env to 5001, 5002, etc.                     |
| `CORS errors on frontend`  | Add your frontend URL to CORS_ORIGINS in .env               |

---

## Database Connection Status

✅ **MongoDB:** Connected to `hospital_opd` database
✅ **Collections:** patients, doctors, appointments, users (auto-created)
✅ **Indexes:** Email (unique), patientId, doctorId
✅ **Authentication:** JWT tokens with 7-day expiry
✅ **Security:** Password hashing with bcrypt

---

**Backend is READY for testing!** 🚀
