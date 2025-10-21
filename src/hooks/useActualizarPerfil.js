import { useApiMutation } from "./useApiMutation"; 
import { useQueryClient } from "@tanstack/react-query";
import { 
    updateDoctor, 
    addDoctorEstablishment, 
    removeDoctorEstablishment, 
    setActiveEstablishmentForDoctor 
} from "../services/doctorService";
import { toast } from 'react-toastify';
import { toBase64 } from "../utils/fileUtils.js";
import { useAuth } from "../context/AuthContext";

/**
 * Hook orquestador para manejar todas las mutaciones de guardado del perfil del doctor.
 */
export const useActualizarPerfil = (options = {}) => {
    const queryClient = useQueryClient();
    // 🟢 SOLUCIÓN DE SCOPE: Llamar a useAuth dentro del hook
    const { user } = useAuth(); 

    // ID del usuario del contexto, estable para las invalidaciones
    const currentDoctorId = user?.id;

    // Claves de invalidación definidas usando el ID estable del contexto
    const keysToInvalidate = [
        ['doctor', currentDoctorId], 
        ['doctorEstablishments', currentDoctorId]
    ];
    

    const mutationFn = async ({ 
        doctor, 
        initialDoctor, 
        draftEstablishments, 
        initialEstablishments, 
        selectedFile, 
        draftActiveEstablishment, 
        doctorId, // ID pasado desde el componente (debe coincidir con currentDoctorId)
        updateActiveEstablishment 
    }) => {
        // ... (lógica de archivos y mutaciones CRUD usa doctorId)
        // ...
        
        const apiCalls = [];
        let newDoctorState = { ...doctor };

        // 1. CAMBIO DE DATOS DEL DOCTOR (updateDoctor)
        if (JSON.stringify(doctor) !== JSON.stringify(initialDoctor) || selectedFile) {
            let firmaBase64 = doctor.FirmaImagen;
            if (selectedFile) {
                firmaBase64 = await toBase64(selectedFile);
                newDoctorState.FirmaImagen = firmaBase64;
            }

            const payload = {
                // ... payload building, que es correcto
                MedicoID: doctor.MedicoID,
                EspecialidadID: parseInt(doctor.EspecialidadID),
                DNI: doctor.DNI,
                Email: doctor.Email,
                Denominacion: doctor.Denominacion,
                Matricula: doctor.Matricula,
                FirmaTexto: doctor.FirmaTexto,
                FirmaImagen: firmaBase64 || "",
            };
            apiCalls.push(updateDoctor(payload));
        }

        // 2. CAMBIOS EN ESTABLECIMIENTOS (Añadir/Eliminar usan doctorId de variables)
        const added = draftEstablishments.filter(
            (e) => !initialEstablishments.some((i) => i.EstablecimientoID === e.EstablecimientoID)
        );
        added.forEach((e) => apiCalls.push(addDoctorEstablishment(doctorId, e.EstablecimientoID)));

        const removed = initialEstablishments.filter(
            (i) => !draftEstablishments.some((e) => e.EstablecimientoID === i.EstablecimientoID)
        );
        removed.forEach((e) => apiCalls.push(removeDoctorEstablishment(doctorId, e.EstablecimientoID)));

        await Promise.all(apiCalls);
        
        // 3. Establecer el establecimiento activo (PUT separado usa doctorId de variables)
        if (draftActiveEstablishment) {
            await setActiveEstablishmentForDoctor(doctorId, draftActiveEstablishment);
            updateActiveEstablishment(Number(draftActiveEstablishment)); 
        }

        return { newDoctorState };
    };

    return useApiMutation(
        'orchestration', 
        '/doctors/profile:save', 
        keysToInvalidate, // 👈 Usamos las claves estables definidas arriba
        {
            mutationFn: mutationFn,
            onSuccess: (result, variables, context) => {
                // Invalida explícitamente las queries (usando variables.doctorId es más directo aquí)
                queryClient.invalidateQueries({ queryKey: ["doctor", variables.doctorId] });
                queryClient.invalidateQueries({ queryKey: ["doctorEstablishments", variables.doctorId] });
                
                toast.success("Perfil guardado correctamente.");

                if (options.onSuccess) {
                    options.onSuccess(result, variables, context);
                }
            },
            ...options
        }
    );
};