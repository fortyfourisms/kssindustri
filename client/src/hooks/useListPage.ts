import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Avatar colour palette (matches Vue original exactly) ─────────────────────
const AVATAR_COLORS = [
    'avatar-blue', 'avatar-indigo', 'avatar-violet', 'avatar-purple',
    'avatar-teal', 'avatar-cyan', 'avatar-green', 'avatar-amber',
    'avatar-orange', 'avatar-red',
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationResult<T> {
    totalPages: number;
    displayData: T[];
    paginationInfo: string;
}

export interface UseListPageReturn {
    // Search / Filter
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    clearSearch: () => void;

    // Pagination
    currentPage: number;
    setCurrentPage: (p: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (n: number) => void;

    // Sort
    sortField: string;
    sortOrder: 'asc' | 'desc';
    toggleSort: (field: string) => void;

    // Toast notifications
    showToast: boolean;
    toastMessage: string;
    toastType: 'success' | 'error';
    showNotification: (msg: string, type?: 'success' | 'error') => void;

    // Avatar
    getAvatarColorClass: (letter: string) => string;

    // Pagination helper — call with your already-filtered data array
    makePagination: <T>(filteredData: T[]) => PaginationResult<T>;
}

/**
 * useListPage — React port of Vue's `useListPage` composable.
 * Handles: search, pagination, sort, toast notifications, avatar colour.
 *
 * @param initialSortField - default sort field (default: 'name')
 */
export function useListPage(initialSortField = 'name'): UseListPageReturn {
    const [searchQuery, setSearchQueryRaw] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPageRaw] = useState(10);
    const [sortField, setSortField] = useState(initialSortField);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Reset currentPage when searchQuery or itemsPerPage change (mirrors Vue watch) ──
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, itemsPerPage]);

    // ── Cleanup toast timer on unmount ────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (toastTimer.current) clearTimeout(toastTimer.current);
        };
    }, []);

    // ── Actions ───────────────────────────────────────────────────────────────

    const setSearchQuery = useCallback((q: string) => setSearchQueryRaw(q), []);

    const clearSearch = useCallback(() => {
        setSearchQueryRaw('');
        setCurrentPage(1);
    }, []);

    const setItemsPerPage = useCallback((n: number) => setItemsPerPageRaw(n), []);

    const toggleSort = useCallback((field: string) => {
        setSortField((prev) => {
            if (prev === field) {
                setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
                return prev;
            }
            setSortOrder('asc');
            return field;
        });
    }, []);

    const showNotification = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToastMessage(msg);
        setToastType(type);
        setShowToast(true);
        toastTimer.current = setTimeout(() => setShowToast(false), 3000);
    }, []);

    // ── Avatar ────────────────────────────────────────────────────────────────

    const getAvatarColorClass = useCallback((letter: string): string => {
        const code = letter.toUpperCase().charCodeAt(0) - 65;
        return AVATAR_COLORS[(code + AVATAR_COLORS.length) % AVATAR_COLORS.length];
    }, []);

    // ── Pagination ────────────────────────────────────────────────────────────

    const makePagination = useCallback(
        <T>(filteredData: T[]): PaginationResult<T> => {
            const total = filteredData.length;
            const totalPages = Math.ceil(total / itemsPerPage);
            const start = (currentPage - 1) * itemsPerPage;
            const displayData = filteredData.slice(start, start + itemsPerPage);

            let paginationInfo: string;
            if (!total) {
                paginationInfo = 'Tidak ada data';
            } else {
                const s = start + 1;
                const e = Math.min(currentPage * itemsPerPage, total);
                paginationInfo = `${s} - ${e} dari ${total}`;
            }

            return { totalPages, displayData, paginationInfo };
        },
        [currentPage, itemsPerPage],
    );

    return {
        searchQuery, setSearchQuery, clearSearch,
        currentPage, setCurrentPage,
        itemsPerPage, setItemsPerPage,
        sortField, sortOrder, toggleSort,
        showToast, toastMessage, toastType, showNotification,
        getAvatarColorClass,
        makePagination,
    };
}
