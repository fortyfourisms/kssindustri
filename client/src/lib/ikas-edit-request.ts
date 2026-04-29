export type IkasEditRequestStatus = 'no_request' | 'pending_approval' | 'approved' | 'rejected';

const STATUS_ALIASES: Record<string, IkasEditRequestStatus> = {
    no_request: 'no_request',
    pending: 'pending_approval',
    pending_approval: 'pending_approval',
    waiting_approval: 'pending_approval',
    waiting: 'pending_approval',
    submitted: 'pending_approval',
    requested: 'pending_approval',
    menunggu_persetujuan_admin: 'pending_approval',
    'menunggu persetujuan admin': 'pending_approval',
    approved: 'approved',
    disetujui: 'approved',
    accepted: 'approved',
    rejected: 'rejected',
    ditolak: 'rejected',
    declined: 'rejected',
};

function normalizeRawStatus(value: unknown): IkasEditRequestStatus {
    const normalized = String(value ?? '').trim().toLowerCase();
    return STATUS_ALIASES[normalized] ?? 'no_request';
}

export function getLatestIkasEditRequest(ikas: Record<string, any> | null | undefined) {
    return (
        ikas?.latest_edit_request ??
        ikas?.last_edit_request ??
        ikas?.edit_request ??
        ikas?.request_edit ??
        ikas?.latest_request_edit ??
        null
    );
}

export function getIkasEditRequestStatus(ikas: Record<string, any> | null | undefined): IkasEditRequestStatus {
    const latestRequest = getLatestIkasEditRequest(ikas);
    const directStatus = [
        ikas?.edit_request_status,
        ikas?.status_edit_request,
        ikas?.request_edit_status,
        ikas?.status_request_edit,
        ikas?.status_pengajuan_edit,
        ikas?.approval_status,
        ikas?.status_approval,
        ikas?.latest_request_edit_status,
        latestRequest?.status,
        latestRequest?.edit_status,
        latestRequest?.request_status,
        latestRequest?.review_status,
        latestRequest?.approval_status,
        latestRequest?.status_approval,
    ].find(Boolean);

    if (!directStatus) return 'no_request';
    return normalizeRawStatus(directStatus);
}

export function getIkasEditStatusMeta(status: IkasEditRequestStatus) {
    switch (status) {
        case 'pending_approval':
            return {
                label: 'Menunggu Persetujuan Admin',
                description: 'Pengajuan perubahan data sedang direview admin. Data IKAS belum bisa diedit.',
                badgeClassName: 'bg-amber-50 border border-amber-200 text-amber-700',
            };
        case 'approved':
            return {
                label: 'Perubahan Disetujui',
                description: 'Pengajuan perubahan disetujui admin. User dapat melanjutkan edit data IKAS.',
                badgeClassName: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
            };
        case 'rejected':
            return {
                label: 'Pengajuan Ditolak',
                description: 'Pengajuan perubahan ditolak. User belum dapat mengedit sampai ada persetujuan admin.',
                badgeClassName: 'bg-rose-50 border border-rose-200 text-rose-700',
            };
        default:
            return {
                label: 'Belum Ada Pengajuan',
                description: 'Belum ada pengajuan perubahan data untuk record IKAS ini.',
                badgeClassName: 'bg-slate-50 border border-slate-200 text-slate-600',
            };
    }
}
