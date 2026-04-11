import { apiClient } from "./apiClient";
import { PICPerusahaan } from "@/types/pic.types";

export const picService = {
    getByPerusahaanId: (perusahaanId: string) => apiClient.get<PICPerusahaan[]>(`/api/pic/${perusahaanId}`),
    create: (data: any) => apiClient.post<PICPerusahaan>("/api/pic", data),
    update: (id: string, data: any) => apiClient.put<PICPerusahaan>(`/api/pic/${id}`, data),
    delete: (id: string) => apiClient.delete<any>(`/api/pic/${id}`),
};
