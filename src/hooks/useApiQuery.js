import { useQuery } from "@tanstack/react-query";
import api from "../services/apiAuthenticated";
import { toast } from "react-toastify";

const extractData = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.List)) return data.List;
    if (Array.isArray(data.data)) return data.data;
    return data;
};

export const useApiQuery = (endpoint, options = {}) => {
    const defaultStaleTime = 1000 * 60 * 5;

    return useQuery({
        queryKey: Array.isArray(endpoint) ? endpoint : [endpoint],
        
        queryFn: async () => {
            if (!endpoint) return [];
            const url = Array.isArray(endpoint) ? endpoint[endpoint.length - 1] : endpoint;
            const { data } = await api.get(url);
            return extractData(data);
        },
        
        onError: (err) => {
            const urlString = Array.isArray(endpoint) ? endpoint.join('/') : endpoint;
            console.error(`❌ Error al cargar ${urlString}:`, err);
            toast.error(`Error al cargar datos (${urlString})`);
        },
        
        retry: 2,
        refetchOnWindowFocus: false,
        staleTime: defaultStaleTime,
        ...options,
    });
};