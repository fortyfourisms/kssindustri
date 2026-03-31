/**
 * useAuth.ts
 *
 * This file exports BOTH:
 * 1. Legacy TanStack Query hooks (useUser, useLogin, useRegister, useMfaVerify, useLogout)
 *    — kept for backward compatibility with existing pages.
 * 2. New Zustand-based hooks (useAuth, useProfile) — for new user-side pages.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { useAuthStore } from "@/stores/auth.store";
import { useProfileStore } from "@/stores/profile.store";
import type { LoginPayload, RegisterPayload } from "@/types/auth.types";

// ─── Legacy compatibility (do NOT change — used by existing pages) ────────────

export function useUser() {
    return useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            const res = await api.getMe();
            // API returns an array based on the user's Swagger mapping note
            return Array.isArray(res) ? res[0] : res;
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
}

export function useLogin() {
    const [, navigate] = useLocation();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: { email: string; password: string }) => {
            return api.login(data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["me"] });
            navigate("/mfa");
        },
    });
}

export function useRegister() {
    const [, navigate] = useLocation();
    return useMutation({
        mutationFn: async (data: {
            name: string;
            email: string;
            password: string;
            perusahaanId: string;
        }) => {
            return api.register(data);
        },
        onSuccess: () => {
            navigate("/login");
        },
    });
}

export function useMfaVerify() {
    const [, navigate] = useLocation();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (token: string) => {
            return api.verifyMfa(token);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["me"] });
            navigate("/dashboard");
        },
    });
}

export function useLogout() {
    const [, navigate] = useLocation();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            return api.logout();
        },
        onSuccess: () => {
            qc.clear();
            navigate("/");
        },
    });
}

// ─── New Zustand-based hooks (for new user-side pages) ───────────────────────

/**
 * useAuth — ergonomic wrapper around useAuthStore.
 * Use this in new pages instead of the TanStack Query hooks above.
 */
export function useAuth() {
    const store = useAuthStore();

    return {
        user: store.currentUser,
        isAuthenticated: store.authenticated,
        isAdmin: store.isAdmin(),
        loading: store.loading,
        error: store.error,

        isMfaSetupRequired: store.isMfaSetupRequired(),
        isMfaVerifyRequired: store.isMfaVerifyRequired(),
        setupToken: store.setupToken,
        mfaToken: store.mfaToken,

        login: (payload: LoginPayload) => store.authenticateUser(payload),
        logout: () => store.logUserOut(),
        register: (payload: RegisterPayload) => store.registerUser(payload),
        completeMfaSetup: (response: unknown) => store.completeMfaSetup(response),
        completeMfaVerify: (response: unknown) => store.completeMfaVerify(response),
        clearMfaState: () => store.clearMfaState(),
        checkSession: () => store.rehydrateFromServer(),
        formattedJoinDate: store.formattedJoinDate(),
    };
}

/**
 * useProfile — ergonomic wrapper around useProfileStore.
 */
export function useProfile() {
    const store = useProfileStore();

    return {
        profile: store,
        isLoading: store.isLoading,
        displayName: store.displayName(),
        displayEmail: store.displayEmail(),
        displayRole: store.displayRole(),
        displayPhone: store.displayPhone(),
        displayLocation: store.displayLocation(),
        displayJabatan: store.displayJabatan(),
        displayJoined: store.displayJoined(),
        fetch: () => store.fetchFromApi(),
        save: (data: Parameters<typeof store.saveToApi>[0]) => store.saveToApi(data),
        update: (data: Parameters<typeof store.updateProfile>[0]) => store.updateProfile(data),
        switchUser: () => store.switchUser(),
        updateAvatar: (url: string) => store.updateAvatar(url),
        updateBanner: (url: string) => store.updateBanner(url),
        resetToDefaults: () => store.resetToDefaults(),
    };
}
