import { useState, useEffect } from "react";
import {
  getDoctorById,
  getDoctorEstablishments,
  getAllEstablishments,
  getAllSpecialties
} from "../services/doctorService";

const cache = new Map();

export const useDoctorProfileData = (doctorId, options = {}) => {
  const { ttl = 300000, debounceMs = 300 } = options;
  const [profile, setProfile] = useState(null);
  const [doctorEstablishments, setDoctorEstablishments] = useState([]);
  const [allEstablishments, setAllEstablishments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useDoctorProfileData: doctorId actual:', doctorId);
    if (!doctorId) return;

    const cacheKey = `doctor_profile_${doctorId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log("Cargando perfil del cache:", cacheKey);
      setProfile(cached.profile);
      setDoctorEstablishments(cached.doctorEstablishments);
      setAllEstablishments(cached.allEstablishments);
      setSpecialties(cached.specialties);
      setLoading(false);
      return;
    }

    let timeoutId;

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log("Cargando datos del perfil del doctor:", doctorId);

        const [profileRes, doctorEstRes, allEstRes, specialtiesRes] =
          await Promise.all([
            getDoctorById(doctorId),
            getDoctorEstablishments(doctorId),
            getAllEstablishments(),
            getAllSpecialties(),
          ]);

        const result = {
          profile: profileRes,
          doctorEstablishments: doctorEstRes,
          allEstablishments: allEstRes,
          specialties: specialtiesRes,
        };

        setProfile(result.profile);
        setDoctorEstablishments(result.doctorEstablishments);
        setAllEstablishments(result.allEstablishments);
        setSpecialties(result.specialties);

        cache.set(cacheKey, { ...result, timestamp: Date.now() });
      } catch (err) {
        console.error("Error al obtener el perfil del doctor:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    timeoutId = setTimeout(fetchData, debounceMs);
    return () => clearTimeout(timeoutId);

  }, [doctorId, ttl, debounceMs]);

  return { profile, doctorEstablishments, allEstablishments, specialties, loading, error };
};
