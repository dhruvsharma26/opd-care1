import { useEffect, useState } from "react";
import { doctorAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function useDoctorAuthorization(doctorId, options = {}) {
  const { updateUser } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      setDoctor(null);
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    const refreshMs = options.refreshMs ?? 5000;

    const load = async () => {
      try {
        const response = await doctorAPI.getById(doctorId);
        const doctorData = response.data || null;
        if (!mounted) return;
        setDoctor(doctorData);
        updateUser({
          specialty: doctorData?.specialty || "",
          doctor: {
            id: doctorData?._id || doctorId,
            specialty: doctorData?.specialty || "",
            authorizationStatus: doctorData?.authorization?.status || "pending",
            reviewerNote: doctorData?.authorization?.reviewerNote || "",
          },
          authorizationStatus: doctorData?.authorization?.status || "pending",
          reviewerNote: doctorData?.authorization?.reviewerNote || "",
        });
      } catch {
        if (mounted) {
          setDoctor(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    const intervalId = window.setInterval(load, refreshMs);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [doctorId, options.refreshMs, updateUser]);

  return {
    doctor,
    setDoctor,
    loading,
    authorizationStatus: doctor?.authorization?.status || "pending",
    reviewerNote: doctor?.authorization?.reviewerNote || "",
    isApproved: doctor?.authorization?.status === "approved",
  };
}
