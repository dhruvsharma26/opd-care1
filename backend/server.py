import os
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv
import jwt
import bcrypt
import logging
from pathlib import Path
from typing import List, Optional
from bson import ObjectId
from datetime import datetime, timedelta
from contextlib import asynccontextmanager

from models import (
    Patient, PatientCreate, PatientUpdate, PatientReport,
    Doctor, DoctorCreate,
    Appointment, AppointmentCreate, AppointmentUpdate,
    User, UserCreate, LoginRequest, LoginResponse,
    StatusCheck, StatusCheckCreate
)

# ==================== ENVIRONMENT & CONFIG ====================
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URI = os.getenv('MONGO_URI')
JWT_SECRET = os.getenv('JWT_SECRET', 'secret123')
PORT = int(os.getenv('PORT', 5000))
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
DB_NAME = os.getenv('DB_NAME', 'hospital_opd')

# ==================== LOGGING ====================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== DATABASE CONNECTION ====================
mongo_client: Optional[AsyncIOMotorClient] = None
database: Optional[AsyncIOMotorDatabase] = None


async def connect_db():
    global mongo_client, database
    try:
        mongo_client = AsyncIOMotorClient(MONGO_URI)
        database = mongo_client[DB_NAME]
        
        # Test connection
        await mongo_client.admin.command('ping')
        logger.info("✓ Connected to MongoDB")
        
        # Create collections if they don't exist
        collections = await database.list_collection_names()
        for collection_name in ['patients', 'doctors', 'appointments', 'users']:
            if collection_name not in collections:
                await database.create_collection(collection_name)
                logger.info(f"✓ Created collection: {collection_name}")
        
        # Create indexes for better queries
        await database['patients'].create_index('email', unique=True)
        await database['doctors'].create_index('email', unique=True)
        await database['users'].create_index('email', unique=True)
        await database['appointments'].create_index('patientId')
        await database['appointments'].create_index('doctorId')
        
    except Exception as e:
        logger.error(f"✗ Database connection failed: {e}")
        raise


async def disconnect_db():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        logger.info("✓ Disconnected from MongoDB")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await disconnect_db()


# ==================== PASSWORD HASHING ====================
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


# ==================== JWT UTILITIES ====================
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== AUTHENTICATION DEPENDENCY ====================
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    user = await database['users'].find_one({'email': email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ==================== FASTAPI APP ====================
app = FastAPI(
    title="OPD Care API",
    description="Hospital OPD Management System Backend",
    version="1.0.0",
    lifespan=lifespan
)

# ==================== CORS MIDDLEWARE ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== API ROUTER ====================
api_router = APIRouter(prefix="/api", tags=["API"])


# ==================== HEALTH CHECK ====================
@api_router.get("/health")
async def health_check():
    """Check API health"""
    try:
        await mongo_client.admin.command('ping')
        return {
            "status": "online",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except:
        return {
            "status": "online",
            "database": "disconnected",
            "timestamp": datetime.utcnow().isoformat()
        }


# ==================== AUTH ENDPOINTS ====================
@api_router.post("/auth/signup", response_model=LoginResponse)
async def signup(user_data: UserCreate):
    """Register new user (patient/doctor)"""
    # Check if user already exists
    existing = await database['users'].find_one({'email': user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user_doc = {
        'email': user_data.email,
        'name': user_data.name,
        'password': hashed_password,
        'role': user_data.role,
        'phone': user_data.phone,
        'createdAt': datetime.utcnow(),
    }
    
    result = await database['users'].insert_one(user_doc)
    user_doc['_id'] = result.inserted_id
    
    # Create token
    access_token = create_access_token({"sub": user_data.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(result.inserted_id),
            "email": user_data.email,
            "name": user_data.name,
            "role": user_data.role,
            "phone": user_data.phone,
        }
    }


@api_router.post("/auth/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login user"""
    user = await database['users'].find_one({'email': credentials.email})
    
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    access_token = create_access_token({"sub": credentials.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user['_id']),
            "email": user['email'],
            "name": user['name'],
            "role": user['role'],
            "phone": user.get('phone'),
        }
    }


# ==================== PATIENT ENDPOINTS ====================
@api_router.post("/patients", response_model=dict)
async def create_patient(patient: PatientCreate, current_user = Depends(get_current_user)):
    """Register new patient intake"""
    try:
        # Generate token ID
        token = f"OPD-{ObjectId()}"[:10]
        
        patient_doc = patient.dict(exclude_unset=True)
        patient_doc['token'] = token
        patient_doc['createdAt'] = datetime.utcnow()
        patient_doc['updatedAt'] = datetime.utcnow()
        
        result = await database['patients'].insert_one(patient_doc)
        
        return {
            "success": True,
            "patientId": str(result.inserted_id),
            "token": token,
            "message": f"Patient registered successfully. Token: {token}"
        }
    except Exception as e:
        logger.error(f"Error creating patient: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/patients/{patient_id}")
async def get_patient(patient_id: str, current_user = Depends(get_current_user)):
    """Get patient details"""
    try:
        patient = await database['patients'].find_one({'_id': ObjectId(patient_id)})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient['_id'] = str(patient['_id'])
        return patient
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/patients")
async def list_patients(current_user = Depends(get_current_user)):
    """List all patients"""
    try:
        patients = await database['patients'].find().to_list(100)
        for p in patients:
            p['_id'] = str(p['_id'])
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/patients/{patient_id}")
async def update_patient(patient_id: str, patient_update: PatientUpdate, current_user = Depends(get_current_user)):
    """Update patient details"""
    try:
        update_data = patient_update.dict(exclude_unset=True)
        update_data['updatedAt'] = datetime.utcnow()
        
        result = await database['patients'].update_one(
            {'_id': ObjectId(patient_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        return {"success": True, "message": "Patient updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== DOCTOR ENDPOINTS ====================
@api_router.post("/doctors", response_model=dict)
async def create_doctor(doctor: DoctorCreate):
    """Create doctor (admin only)"""
    try:
        doctor_doc = doctor.dict(exclude_unset=True)
        if doctor_doc.get('password'):
            doctor_doc['password'] = hash_password(doctor_doc['password'])
        doctor_doc['createdAt'] = datetime.utcnow()
        
        result = await database['doctors'].insert_one(doctor_doc)
        
        return {
            "success": True,
            "doctorId": str(result.inserted_id),
            "message": "Doctor created successfully"
        }
    except Exception as e:
        logger.error(f"Error creating doctor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/doctors")
async def list_doctors():
    """List all doctors"""
    try:
        doctors = await database['doctors'].find().to_list(100)
        for d in doctors:
            d['_id'] = str(d['_id'])
            d.pop('password', None)  # Remove password from response
        return doctors
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    """Get doctor details"""
    try:
        doctor = await database['doctors'].find_one({'_id': ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        doctor['_id'] = str(doctor['_id'])
        doctor.pop('password', None)
        return doctor
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== APPOINTMENT ENDPOINTS ====================
@api_router.post("/appointments", response_model=dict)
async def create_appointment(appointment: AppointmentCreate, current_user = Depends(get_current_user)):
    """Book new appointment"""
    try:
        appointment_doc = appointment.dict()
        appointment_doc['status'] = 'upcoming'
        appointment_doc['createdAt'] = datetime.utcnow()
        appointment_doc['updatedAt'] = datetime.utcnow()
        
        result = await database['appointments'].insert_one(appointment_doc)
        
        return {
            "success": True,
            "appointmentId": str(result.inserted_id),
            "message": f"Appointment booked with {appointment.patientName}"
        }
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/appointments/{appointment_id}")
async def get_appointment(appointment_id: str, current_user = Depends(get_current_user)):
    """Get appointment details"""
    try:
        appointment = await database['appointments'].find_one({'_id': ObjectId(appointment_id)})
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        appointment['_id'] = str(appointment['_id'])
        return appointment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/appointments")
async def list_appointments(current_user = Depends(get_current_user)):
    """List all appointments"""
    try:
        appointments = await database['appointments'].find().to_list(100)
        for a in appointments:
            a['_id'] = str(a['_id'])
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/doctors/{doctor_id}/appointments")
async def get_doctor_appointments(doctor_id: str, current_user = Depends(get_current_user)):
    """Get all appointments for a specific doctor"""
    try:
        appointments = await database['appointments'].find({
            'doctorId': doctor_id
        }).to_list(100)
        
        for a in appointments:
            a['_id'] = str(a['_id'])
        
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/patients/{patient_id}/appointments")
async def get_patient_appointments(patient_id: str, current_user = Depends(get_current_user)):
    """Get all appointments for a specific patient"""
    try:
        appointments = await database['appointments'].find({
            'patientId': patient_id
        }).to_list(100)
        
        for a in appointments:
            a['_id'] = str(a['_id'])
        
        return appointments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.put("/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, appointment_update: AppointmentUpdate, current_user = Depends(get_current_user)):
    """Update appointment status or add report"""
    try:
        update_data = {}
        if appointment_update.status:
            update_data['status'] = appointment_update.status
        if appointment_update.report:
            update_data['report'] = appointment_update.report.dict()
        
        update_data['updatedAt'] = datetime.utcnow()
        
        result = await database['appointments'].update_one(
            {'_id': ObjectId(appointment_id)},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        return {"success": True, "message": "Appointment updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== STATUS CHECK (DEMO) ====================
@api_router.post("/status", response_model=dict)
async def create_status_check(status_check: StatusCheckCreate):
    """Demo endpoint - Create status check"""
    try:
        doc = {
            'client_name': status_check.client_name,
            'timestamp': datetime.utcnow().isoformat(),
        }
        result = await database['status_checks'].insert_one(doc)
        return {
            "id": str(result.inserted_id),
            "client_name": status_check.client_name,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@api_router.get("/status")
async def get_status_checks():
    """Demo endpoint - Get status checks"""
    try:
        checks = await database['status_checks'].find().to_list(1000)
        for c in checks:
            c['id'] = str(c.pop('_id', ''))
        return checks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ROOT ENDPOINT ====================
@api_router.get("/")
async def root():
    """API Info"""
    return {
        "message": "OPD Care API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "auth": ["/api/auth/login", "/api/auth/signup"],
            "patients": "/api/patients",
            "doctors": "/api/doctors",
            "appointments": "/api/appointments",
        }
    }


# ==================== INCLUDE ROUTER ====================
app.include_router(api_router)