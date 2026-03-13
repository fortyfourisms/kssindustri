import { apiClient } from './apiClient';
import type {
    Stakeholder,
    CreateStakeholderPayload,
    CreateStakeholderResponse,
} from '@/types/stakeholders.types';

/**
 * Stakeholders Service — handles data for Stakeholders/Perusahaan domain.
 */
export const stakeholdersService = {
    /** Get all stakeholders */
    async getAll(): Promise<Stakeholder[]> {
        return apiClient.get<Stakeholder[]>('/api/perusahaan');
    },

    /** Get stakeholder by ID */
    async getById(id: string): Promise<Stakeholder> {
        return apiClient.get<Stakeholder>(`/api/perusahaan/${id}`);
    },

    /** Create a new stakeholder (sends as FormData for file support) */
    async create(data: CreateStakeholderPayload): Promise<CreateStakeholderResponse> {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
        });
        return apiClient.postForm<CreateStakeholderResponse>('/api/perusahaan', formData);
    },

    /** Update a stakeholder (sends as FormData for file support) */
    async update(id: string, data: Partial<CreateStakeholderPayload>): Promise<Stakeholder> {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) formData.append(key, value);
        });
        return apiClient.putForm<Stakeholder>(`/api/perusahaan/${id}`, formData);
    },

    /** Delete a stakeholder */
    async delete(id: string): Promise<void> {
        return apiClient.delete(`/api/perusahaan/${id}`);
    },
};
