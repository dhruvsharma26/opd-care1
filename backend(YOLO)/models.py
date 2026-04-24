from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Literal
from datetime import datetime
from bson import ObjectId

# ==================== OBJECT ID HANDLING ====================
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError(f"Invalid ObjectId: {v}")
        return ObjectId(v)

    def __repr__(self):
        return f"ObjectId('{self}')"


# ==================== PATIENT MODELS ====================
class PatientReport(BaseModel):
    symptoms: List[str] = []
    duration: str = ""
    description: str = ""
    medicalHistory: List[str] = []
    currentMedications: List[str] = []
    allergies: str = "No known drug allergies"


class PatientBase(BaseModel):
    name: str
    email: str
    phone: str
    age: int
    gender: Literal["Male", "Female", "Other"]
    bloodGroup: Optional[str] = None
    medicalHistory: List[str] = []
    allergies: str = "No known drug allergies"


class PatientCreate(PatientBase):
    password: Optional[str] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    bloodGroup: Optional[str] = None
    medicalHistory: Optional[List[str]] = None
    allergies: Optional[str] = None


class Patient(PatientBase):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: PyObjectId = Field(alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "name": "Rajesh Kumar",
                "email": "rajesh@example.com",
                "phone": "+91 98120 44821",
                "age": 45,
                "gender": "Male",
                "bloodGroup": "O+",
                "medicalHistory": ["Hypertension"],
                "allergies": "No known drug allergies",
            }
        }


# ==================== DOCTOR MODELS ====================
class DoctorBase(BaseModel):
    name: str
    email: str
    specialty: str
    rating: float = 4.5
    experience: int
    fee: int
    avatar: str = ""
    availableToday: bool = True
    nextSlot: str = "11:00 AM"


class DoctorCreate(DoctorBase):
    password: Optional[str] = None


class Doctor(DoctorBase):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: PyObjectId = Field(alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439012",
                "name": "Dr. Kabir Mehta",
                "email": "kabir@hospital.com",
                "specialty": "General Physician",
                "rating": 4.9,
                "experience": 12,
                "fee": 600,
            }
        }


# ==================== APPOINTMENT MODELS ====================
class AppointmentCreate(BaseModel):
    patientId: str
    patientName: str
    doctorId: str
    date: str
    time: str
    complaint: str
    age: int
    gender: str
    severity: Literal["high", "moderate", "low"] = "moderate"


class AppointmentUpdate(BaseModel):
    status: Optional[Literal["upcoming", "confirmed", "completed"]] = None
    report: Optional[PatientReport] = None


class Appointment(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: PyObjectId = Field(alias="_id")
    patientId: str
    patientName: str
    age: int
    gender: str
    doctorId: str
    date: str
    time: str
    status: Literal["upcoming", "confirmed", "completed"] = "upcoming"
    complaint: str
    severity: Literal["high", "moderate", "low"] = "moderate"
    room: str = "OPD-A · 3rd floor"
    report: Optional[PatientReport] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439013",
                "patientId": "OPD-0241",
                "patientName": "Rajesh Kumar",
                "doctorId": "d-011",
                "date": "Today",
                "time": "11:20 AM",
                "status": "confirmed",
                "complaint": "Fever and headache for 3 days",
            }
        }


# ==================== USER MODELS (AUTH) ====================
class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: Literal["patient", "doctor", "admin"]
    phone: Optional[str] = None


class User(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    
    id: PyObjectId = Field(alias="_id")
    email: str
    name: str
    role: Literal["patient", "doctor", "admin"]
    phone: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


# ==================== STATUS CHECK MODELS ====================
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(ObjectId()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str
