export type KseEditRequestStatus = 'no_request' | 'pending_approval' | 'approved' | 'rejected';

export interface KseEditRequestRecord {
    id?: string | number;
    id_se?: string | number;
    se_id?: string | number;
    idSe?: string | number;
    id_user?: string | number;
    status?: string | null;
    edit_status?: string | null;
    request_status?: string | null;
    review_status?: string | null;
    catatan?: string | null;
    catatan_user?: string | null;
    nama_se?: string | null;
    nama_user?: string | null;
    data_perubahan?: Record<string, any> | null;
    created_at?: string;
    updated_at?: string;
    se?: {
        id?: string | number;
    };
}

const STATUS_ALIASES: Record<string, KseEditRequestStatus> = {
    no_request: 'no_request',
    pending: 'pending_approval',
    pending_approval: 'pending_approval',
    waiting_approval: 'pending_approval',
    menunggu_persetujuan_admin: 'pending_approval',
    approved: 'approved',
    disetujui: 'approved',
    rejected: 'rejected',
    ditolak: 'rejected',
};

function normalizeRawStatus(value: unknown): KseEditRequestStatus {
    const normalized = String(value ?? '').trim().toLowerCase();
    return STATUS_ALIASES[normalized] ?? 'no_request';
}

function getTimeValue(value?: string) {
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
}

export function getLatestKseEditRequest(
    se: Record<string, any> | null | undefined,
    editRequests?: KseEditRequestRecord[] | null,
): KseEditRequestRecord | null {
    const seId = String(se?.id ?? '');
    if (!seId || !editRequests?.length) {
        return null;
    }

    return editRequests
        .filter((request) => {
            const requestSeId = request?.id_se ?? request?.se_id ?? request?.idSe ?? request?.se?.id;
            return String(requestSeId ?? '') === seId;
        })
        .sort((a, b) => {
            const timeB = Math.max(getTimeValue(b.updated_at), getTimeValue(b.created_at));
            const timeA = Math.max(getTimeValue(a.updated_at), getTimeValue(a.created_at));
            return timeB - timeA;
        })[0] ?? null;
}

export function getKseEditRequestStatus(
    se: Record<string, any> | null | undefined,
    editRequests?: KseEditRequestRecord[] | null,
): KseEditRequestStatus {
    const directStatus = [
        se?.edit_request_status,
        se?.status_edit_request,
        se?.request_edit_status,
        se?.status_pengajuan_edit,
        se?.latest_edit_request?.status,
        se?.latest_edit_request?.edit_status,
        se?.latest_edit_request?.request_status,
    ].find(Boolean);

    if (directStatus) {
        return normalizeRawStatus(directStatus);
    }

    const seId = String(se?.id ?? '');
    if (!seId || !editRequests?.length) {
        return 'no_request';
    }

    const latestRequest = getLatestKseEditRequest(se, editRequests);

    return normalizeRawStatus(
        latestRequest?.status ??
        latestRequest?.edit_status ??
        latestRequest?.request_status ??
        latestRequest?.review_status,
    );
}

export function getKseEditStatusMeta(status: KseEditRequestStatus) {
    switch (status) {
        case 'pending_approval':
            return {
                label: 'Menunggu Persetujuan Admin',
                description: 'Pengajuan perubahan sedang direview admin. Data utama belum berubah.',
                badgeClassName: 'bg-amber-50 border border-amber-200 text-amber-700',
            };
        case 'approved':
            return {
                label: 'Perubahan Disetujui',
                description: 'Pengajuan terakhir sudah disetujui admin dan perubahan telah diterapkan.',
                badgeClassName: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
            };
        case 'rejected':
            return {
                label: 'Pengajuan Ditolak',
                description: 'Pengajuan terakhir ditolak. Data utama tetap sama sampai ada pengajuan baru yang disetujui.',
                badgeClassName: 'bg-rose-50 border border-rose-200 text-rose-700',
            };
        default:
            return {
                label: 'Belum Ada Pengajuan',
                description: 'User belum pernah mengajukan perubahan data.',
                badgeClassName: 'bg-slate-50 border border-slate-200 text-slate-600',
            };
    }
}
