/**
 * useAuth.ts
 *
 * This file exports:
 * 1. `useUser` for legacy TanStack Query compatibility where components still read `/api/me`.
 * 2. `useLogout` and `useAuth` for current auth flows.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useAuthStore, type CurrentUser } from "@/stores/auth.store";
import type { LoginPayload, RegisterPayload } from "@/types/auth.types";
import { getDefaultAuthenticatedRoute } from "@/lib/access-control";

export function useUser() {
    const currentUser = useAuthStore((state) => state.currentUser);
    const authenticated = useAuthStore((state) => state.authenticated);

    return useQuery<CurrentUser>({
        queryKey: ["me"],
        queryFn: async () => api.getMe() as Promise<CurrentUser>,
        initialData: authenticated && currentUser ? currentUser : undefined,
        initialDataUpdatedAt: authenticated && currentUser ? Date.now() : undefined,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });
}

export function useLogout() {
    const navigate = useNavigate();
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

export function useAuth() {
    const store = useAuthStore();

    return {
        user: store.currentUser,
        isAuthenticated: store.authenticated,
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
