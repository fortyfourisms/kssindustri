const GENERIC_ERROR_MESSAGE = "Terjadi kesalahan sistem. Silakan coba lagi beberapa saat lagi.";
const GENERIC_SERVER_ERROR_MESSAGE = "Server sedang mengalami kendala. Silakan coba lagi beberapa saat.";
const GENERIC_RATE_LIMIT_MESSAGE = "Terlalu banyak permintaan. Silakan coba lagi beberapa saat.";

const SAFE_ERROR_STATUSES = new Set([400, 401, 403, 404, 409, 422]);

function normalizeMessage(message: unknown): string | null {
    if (typeof message !== "string") return null;

    const normalized = message.replace(/\s+/g, " ").trim();
    return normalized || null;
}

function looksSensitive(message: string): boolean {
    return (
        message.startsWith("<") ||
        /<!doctype html/i.test(message) ||
        /\b(exception|stack trace|syntax error|sql|mysql|postgres|sequelize|prisma|mongodb)\b/i.test(message) ||
        /\bat\s+\S+\s+\(/.test(message)
    );
}

export function sanitizeApiErrorMessage(status: number | undefined, message: unknown): string {
    const normalized = normalizeMessage(message);

    if (status === 429) return GENERIC_RATE_LIMIT_MESSAGE;
    if (!normalized) {
        if (status && status >= 500) return GENERIC_SERVER_ERROR_MESSAGE;
        return GENERIC_ERROR_MESSAGE;
    }

    if (looksSensitive(normalized)) {
        return status && status >= 500 ? GENERIC_SERVER_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE;
    }

    if (status && SAFE_ERROR_STATUSES.has(status)) {
        return normalized;
    }

    if (status && status >= 500) {
        return GENERIC_SERVER_ERROR_MESSAGE;
    }

    return GENERIC_ERROR_MESSAGE;
}

export function getUserFacingErrorMessage(error: unknown, fallback = GENERIC_ERROR_MESSAGE): string {
    if (error instanceof Error) {
        return normalizeMessage(error.message) ?? fallback;
    }

    return fallback;
}
