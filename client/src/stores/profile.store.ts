import { create } from 'zustand';
import { usersService } from '@/services/users.service';
import { useAuthStore } from './auth.store';
import type { UpdateUserPayload } from '@/types/user.types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileData {
    name: string;
    title: string;
    role: string;
    location: string;
    email: string;
    jabatan: string;
    phone: string;
    website: string;
    joined: string;
    bio: string;
    address: string;
    avatarUrl: string;
    bannerUrl: string;
    bannerPositionX: number;
    bannerPositionY: number;
    avatarPositionX: number;
    avatarPositionY: number;
    isLoading: boolean;
    stats: { projects: string; followers: string; following: string };
}

interface SaveResult { success: boolean; error?: string }

interface ProfileState extends ProfileData {
    // ── Derived ──────────────────────────────────────────────────────────────
    displayName: () => string;
    displayEmail: () => string;
    displayRole: () => string;
    displayPhone: () => string;
    displayLocation: () => string;
    displayJabatan: () => string;
    displayJoined: () => string;

    // ── Actions ───────────────────────────────────────────────────────────────
    fetchFromApi: () => Promise<void>;
    saveToApi: (data: Partial<ProfileData> | FormData) => Promise<SaveResult>;
    initFromAuth: () => void;
    updateProfile: (data: Partial<ProfileData>) => void;
    resetToDefaults: () => void;
    switchUser: () => Promise<void>;
    updateAvatar: (url: string) => void;
    resetAvatar: () => void;
    updateBanner: (url: string) => void;
    resetBanner: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaults: ProfileData = {
    name: '',
    title: 'Senior Product Designer',
    role: '',
    location: 'Jakarta, Indonesia',
    email: '',
    phone: '+62 812-3456-7890',
    jabatan: 'Senior Product Designer',
    website: 'www.yourwebsite.com',
    joined: '',
    bio: 'Passionate about creating delightful user experiences and solving complex design challenges.',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    avatarUrl: '/images/faces/9.jpg',
    bannerUrl: '/images/media/media-3.jpg',
    bannerPositionX: 50,
    bannerPositionY: 50,
    avatarPositionX: 50,
    avatarPositionY: 50,
    isLoading: false,
    stats: { projects: '47', followers: '2.4K', following: '892' },
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileState>()((set, get) => ({
    ...defaults,

    // ── Derived ──────────────────────────────────────────────────────────────
    displayName: () => {
        const { name } = get();
        return name || useAuthStore.getState().currentUser?.name || 'User';
    },
    displayEmail: () => {
        const { email } = get();
        const u = useAuthStore.getState().currentUser;
        return email || u?.email || u?.username || '';
    },
    displayRole: () => useAuthStore.getState().currentUser?.role || 'User',
    displayPhone: () => get().phone || 'Belum diatur',
    displayLocation: () => get().location || 'Belum diatur',
    displayJabatan: () => get().jabatan || 'Belum diatur',
    displayJoined: () => {
        const authStore = useAuthStore.getState();
        return authStore.formattedJoinDate() || get().joined || 'Tidak diketahui';
    },

    // ── Actions ──────────────────────────────────────────────────────────────
    fetchFromApi: async () => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return;
        set({ isLoading: true });
        try {
            const userData = await usersService.getById(userId);
            set({
                name: userData.name || '',
                email: userData.email || '',
                jabatan: userData.jabatan || '',
                phone: userData.phone || '',
                location: userData.location || '',
                joined: userData.joined || '',
                avatarUrl: userData.photo || '/images/faces/9.jpg',
                bannerUrl: userData.banner || '/images/media/media-3.jpg',
            });
        } catch {
            get().initFromAuth();
        } finally {
            set({ isLoading: false });
        }
    },

    saveToApi: async (data) => {
        const userId = useAuthStore.getState().currentUser?.id;
        if (!userId) return { success: false, error: 'User not authenticated' };
        set({ isLoading: true });
        try {
            if (data instanceof FormData) {
                await usersService.update(userId, data);
                await get().fetchFromApi();
            } else {
                const payload: UpdateUserPayload = {
                    name: data.name ?? get().name,
                    email: data.email ?? get().email,
                    jabatan: data.jabatan ?? get().jabatan,
                    phone: data.phone ?? get().phone,
                    location: data.location ?? get().location,
                    photo: data.avatarUrl ?? get().avatarUrl,
                    banner: data.bannerUrl ?? get().bannerUrl,
                };
                await usersService.update(userId, payload);
                set(data as Partial<ProfileData>);
            }
            return { success: true };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to save profile';
            return { success: false, error: msg };
        } finally {
            set({ isLoading: false });
        }
    },

    initFromAuth: () => {
        const u = useAuthStore.getState().currentUser;
        if (u) {
            set({
                name: u.name || get().name,
                email: u.email || u.username || get().email,
                role: u.role || get().role,
            });
        }
    },

    updateProfile: (data) => set(data as Partial<ProfileData>),

    resetToDefaults: () => set(defaults),

    switchUser: async () => {
        get().resetToDefaults();
        await get().fetchFromApi();
    },

    updateAvatar: (url) => set({ avatarUrl: url }),
    resetAvatar: () => set({ avatarUrl: '/images/faces/9.jpg' }),
    updateBanner: (url) => set({ bannerUrl: url }),
    resetBanner: () => set({ bannerUrl: '/images/media/media-3.jpg' }),
}));
