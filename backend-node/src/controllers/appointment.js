import { Appointment, Doctor, Patient, User } from "../models/index.js";

const populateAppointment = (query) =>
  query
    .populate("patientId")
    .populate("doctorId")
    .sort({ createdAt: -1 });

const serializeAppointment = (appointment) => {
  if (!appointment) return null;
  const data = appointment.toObject ? appointment.toObject() : appointment;
  const patient = data.patientId && typeof data.patientId === "object" ? data.patientId : null;
  const doctor = data.doctorId && typeof data.doctorId === "object" ? data.doctorId : null;

  return {
    ...data,
    _id: data._id?.toString?.() || data.id || "",
    id: data._id?.toString?.() || data.id || "",
    patientId: patient?._id?.toString() || data.patientId?.toString?.() || data.patientId,
    doctorId: doctor?._id?.toString() || data.doctorId?.toString?.() || data.doctorId,
    patient: patient
      ? {
        ...patient,
          _id: patient._id?.toString?.() || patient.id || "",
          id: patient._id?.toString?.() || patient.id || "",
        }
      : null,
    doctor: doctor
      ? {
        ...doctor,
          _id: doctor._id?.toString?.() || doctor.id || "",
          id: doctor._id?.toString?.() || doctor.id || "",
        }
      : null,
  };
};

export const createAppointment = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.patientId && user.role !== "admin") {
      return res
        .status(400)
        .json({ error: "Complete patient registration before booking" });
    }

    const {
      doctorId,
      date,
      time,
      complaint,
      severity = "moderate",
    } = req.body;

    if (!doctorId || !date || !time || !complaint) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const patient = user.patientId ? await Patient.findById(user.patientId) : null;
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    if (!patient) {
      return res.status(404).json({ error: "Patient profile not found" });
    }

    const appointment = await Appointment.create({
      patientId: patient._id,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      doctorId: doctor._id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      time,
      complaint,
      severity,
      status: "upcoming",
    });

    const savedAppointment = await populateAppointment(
      Appointment.findById(appointment._id),
    );

    res.status(201).json({
      success: true,
      appointmentId: appointment._id.toString(),
      appointment: serializeAppointment(savedAppointment),
      message: `Appointment booked with ${doctor.name}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await populateAppointment(Appointment.find());
    res.json(appointments.map(serializeAppointment).filter(Boolean));
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await populateAppointment(Appointment.findById(id));

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(serializeAppointment(appointment));
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const appointments = await populateAppointment(
      Appointment.find({ doctorId }),
    );
    res.json(appointments.map(serializeAppointment).filter(Boolean));
  } catch (error) {
    next(error);
  }
};

export const getPatientAppointments = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const appointments = await populateAppointment(
      Appointment.find({ patientId }),
    );
    res.json(appointments.map(serializeAppointment).filter(Boolean));
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, report } = req.body;

    const updates = {};
    if (status) {
      updates.status = status;
    }
    if (report) {
      updates.report = report;
    }

    const appointment = await Appointment.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const savedAppointment = await populateAppointment(
      Appointment.findById(appointment._id),
    );

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: serializeAppointment(savedAppointment),
    });
  } catch (error) {
    next(error);
  }
};
