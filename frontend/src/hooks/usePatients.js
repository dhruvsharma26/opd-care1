import { useState } from "react";
import { patientAPI } from "../services/api";

export const usePatients = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createPatient = async (patientData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await patientAPI.create(patientData);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to register patient";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPatient = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await patientAPI.getById(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch patient");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePatient = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await patientAPI.update(id, data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update patient");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPatient,
    getPatient,
    updatePatient,
    isLoading,
    error,
  };
};
