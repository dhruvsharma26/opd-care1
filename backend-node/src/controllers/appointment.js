import { Appointment } from "../models/index.js";

export const createAppointment = async (req, res, next) => {
  try {
    const {
      patientId,
      patientName,
      doctorId,
      doctorName,
      specialty,
      date,
      time,
      complaint,
      age,
      gender,
      severity,
    } = req.body;

    if (
      !patientId ||
      !patientName ||
      !doctorId ||
      !date ||
      !time ||
      !complaint
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const appointment = new Appointment({
      patientId,
      patientName,
      age,
      gender,
      doctorId,
      doctorName,
      specialty,
      date,
      time,
      complaint,
      severity: severity || "moderate",
      status: "upcoming",
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      appointmentId: appointment._id,
      message: `Appointment booked with ${patientName}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const appointments = await Appointment.find({ doctorId });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getPatientAppointments = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const appointments = await Appointment.find({ patientId });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, report } = req.body;

    const updates = {
      updatedAt: new Date(),
    };

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

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
