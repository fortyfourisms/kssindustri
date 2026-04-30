import { apiClient } from '@/services/apiClient';
import type { CurrentUser, UpdateUserPayload } from '@/types/user.types';

/**
 * Users service for self-service operations of the authenticated user.
 */
class UsersService {
    async getCurrentUser(): Promise<CurrentUser> {
        return apiClient.get<CurrentUser>('/api/me');
    }

    async updateCurrentUser(payload: UpdateUserPayload | FormData): Promise<CurrentUser> {
        if (payload instanceof FormData) {
            return apiClient.putForm<CurrentUser>('/api/me', payload);
        }
        return apiClient.put<CurrentUser>('/api/me', payload);
    }
}

export const usersService = new UsersService();
