import { apiClient } from "./apiClient";
import { PICPerusahaan } from "@/types/pic.types";

export const picService = {
    getByPerusahaanId: async (perusahaanId: string) => {
        try {
            return await apiClient.get<PICPerusahaan[]>(`/api/pic?perusahaanId=${perusahaanId}`);
        } catch (error: any) {
            if (error?.status === 404 || error?.response?.status === 404) {
                return [];
            }
            throw error;
        }
    },
    create: (data: any) => apiClient.post<PICPerusahaan>("/api/pic", data),
    update: (id: string, data: any) => apiClient.put<PICPerusahaan>(`/api/pic/${id}`, data),
    delete: (id: string) => apiClient.delete<any>(`/api/pic/${id}`),
};
