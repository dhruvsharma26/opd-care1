import { useState } from "react";
import { appointmentAPI } from "../services/api";

export const useAppointments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createAppointment = async (appointmentData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appointmentAPI.create(appointmentData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to book appointment";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientAppointments = async (patientId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appointmentAPI.getPatientAppointments(patientId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorAppointments = async (doctorId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appointmentAPI.getDoctorAppointments(doctorId);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch appointments");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointment = async (appointmentId, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await appointmentAPI.update(appointmentId, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update appointment");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createAppointment,
    fetchPatientAppointments,
    fetchDoctorAppointments,
    updateAppointment,
    isLoading,
    error,
  };
};
