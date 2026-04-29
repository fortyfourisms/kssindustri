const BASE_URL = (window as any)._env_?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "";

function downloadBlob(fileName: string, blob: Blob) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function sanitizeFileName(value: string) {
    return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

function getFileNameFromDisposition(contentDisposition: string | null, fallback: string) {
    if (!contentDisposition) return fallback;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        try {
            return sanitizeFileName(decodeURIComponent(utf8Match[1]));
        } catch {
            return sanitizeFileName(utf8Match[1]);
        }
    }

    const asciiMatch = contentDisposition.match(/filename=\"?([^\"]+)\"?/i);
    if (asciiMatch?.[1]) {
        return sanitizeFileName(asciiMatch[1]);
    }

    return fallback;
}

async function downloadBackendPdf(path: string, fallbackFileName: string) {
    const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error(`Gagal mengunduh PDF (${response.status})`);
    }

    const blob = await response.blob();
    const fileName = getFileNameFromDisposition(response.headers.get("content-disposition"), fallbackFileName);
    downloadBlob(fileName, blob);
}

export async function exportKsePdf(companyName?: string) {
    await downloadBackendPdf("/api/se/export-pdf", `KSE-${companyName || "perusahaan"}.pdf`);
}

export async function exportCsirtPdf(companyName?: string) {
    await downloadBackendPdf("/api/csirt/export-pdf", `CSIRT-${companyName || "perusahaan"}.pdf`);
}
