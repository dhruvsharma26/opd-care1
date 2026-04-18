import { useState, useEffect } from "react";
import { doctorAPI } from "../services/api";

export const useDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await doctorAPI.getAll();
        setDoctors(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch doctors");
        console.error("Error fetching doctors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const getDoctor = async (id) => {
    try {
      const response = await doctorAPI.getById(id);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch doctor");
      throw err;
    }
  };

  return { doctors, getDoctor, isLoading, error };
};
