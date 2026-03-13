import { apiClient } from './apiClient';
import type { User, CreateUserPayload, UpdateUserPayload } from '@/types/user.types';

/**
 * Users Service — CRUD operations for user accounts.
 */
class UsersService {
    /** Get all users */
    async getAll(): Promise<User[]> {
        return apiClient.get<User[]>('/api/users');
    }

    /** Get current authenticated user (cookie auth) */
    async getCurrentUser(): Promise<User> {
        return apiClient.get<User>('/api/me');
    }

    /** Get user by ID */
    async getById(id: string): Promise<User> {
        return apiClient.get<User>(`/api/users/${id}`);
    }

    /** Create new user */
    async create(payload: CreateUserPayload): Promise<User> {
        return apiClient.post<User>('/api/users', payload);
    }

    /**
     * Update existing user.
     * Accepts either a JSON payload or FormData (for photo/banner uploads).
     */
    async update(id: string, payload: UpdateUserPayload | FormData): Promise<User> {
        if (payload instanceof FormData) {
            return apiClient.putForm<User>(`/api/users/${id}`, payload);
        }
        return apiClient.put<User>(`/api/users/${id}`, payload);
    }

    /** Delete user by ID */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`/api/users/${id}`);
    }
}

export const usersService = new UsersService();
