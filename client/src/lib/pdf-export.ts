type KeyValueRow = {
    label: string;
    value: string | number | null | undefined;
};

type TableSection = {
    title: string;
    columns: string[];
    rows: Array<Array<string | number | null | undefined>>;
    emptyMessage?: string;
};

type SummarySection = {
    title: string;
    rows: KeyValueRow[];
};

type ExportDocumentConfig = {
    fileName: string;
    title: string;
    subtitle?: string;
    summarySections?: SummarySection[];
    tableSections?: TableSection[];
};

const BASE_URL = (window as any)._env_?.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "";

function formatValue(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
}

function formatDate(value?: string | null) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function wrapText(text: string, maxLength = 88) {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [""];

    const words = normalized.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length <= maxLength) {
            currentLine = candidate;
            continue;
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        if (word.length <= maxLength) {
            currentLine = word;
            continue;
        }

        let remaining = word;
        while (remaining.length > maxLength) {
            lines.push(remaining.slice(0, maxLength));
            remaining = remaining.slice(maxLength);
        }
        currentLine = remaining;
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

function escapePdfText(value: string) {
    return value
        .replaceAll("\\", "\\\\")
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)")
        .replace(/[^\x20-\x7E]/g, "?");
}

function buildDocumentLines({
    title,
    subtitle,
    summarySections = [],
    tableSections = [],
}: Omit<ExportDocumentConfig, "fileName">) {
    const generatedAt = formatDate(new Date().toISOString());
    const lines: string[] = [];

    lines.push(title.toUpperCase());
    if (subtitle) lines.push(subtitle);
    lines.push(`Dibuat pada: ${generatedAt}`);
    lines.push("");

    for (const section of summarySections) {
        lines.push(section.title.toUpperCase());
        for (const row of section.rows) {
            lines.push(...wrapText(`${row.label}: ${formatValue(row.value)}`));
        }
        lines.push("");
    }

    for (const section of tableSections) {
        lines.push(section.title.toUpperCase());
        lines.push(...wrapText(section.columns.join(" | ")));

        if (section.rows.length === 0) {
            lines.push(section.emptyMessage ?? "Tidak ada data.");
            lines.push("");
            continue;
        }

        section.rows.forEach((row, index) => {
            const joined = `${index + 1}. ${row.map((cell) => formatValue(cell)).join(" | ")}`;
            lines.push(...wrapText(joined));
        });
        lines.push("");
    }

    return lines;
}

function buildPdfContent(lines: string[]) {
    const pageWidth = 595;
    const pageHeight = 842;
    const top = 800;
    const left = 48;
    const lineHeight = 14;
    const maxLinesPerPage = 52;
    const pages: string[][] = [];

    for (let index = 0; index < lines.length; index += maxLinesPerPage) {
        pages.push(lines.slice(index, index + maxLinesPerPage));
    }

    if (pages.length === 0) {
        pages.push(["Dokumen kosong"]);
    }

    const objects: string[] = [];
    const pageObjectNumbers: number[] = [];
    const contentObjectNumbers: number[] = [];
    const fontObjectNumber = 3;

    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>";

    pages.forEach((pageLines, pageIndex) => {
        const pageObjectNumber = 4 + pageIndex * 2;
        const contentObjectNumber = pageObjectNumber + 1;
        pageObjectNumbers.push(pageObjectNumber);
        contentObjectNumbers.push(contentObjectNumber);

        const textCommands = pageLines
            .map((line, lineIndex) => {
                const y = top - lineIndex * lineHeight;
                return `BT /F1 10 Tf 1 0 0 1 ${left} ${y} Tm (${escapePdfText(line)}) Tj ET`;
            })
            .join("\n");

        const stream = `${textCommands}\n`;
        objects[contentObjectNumber] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
        objects[pageObjectNumber] =
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
    });

    objects[2] = `<< /Type /Pages /Count ${pageObjectNumbers.length} /Kids [${pageObjectNumbers.map((num) => `${num} 0 R`).join(" ")}] >>`;

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];

    for (let i = 1; i < objects.length; i += 1) {
        if (!objects[i]) continue;
        offsets[i] = pdf.length;
        pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length}\n`;
    pdf += "0000000000 65535 f \n";

    for (let i = 1; i < objects.length; i += 1) {
        const offset = offsets[i] ?? 0;
        pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return new Blob([pdf], { type: "application/pdf" });
}

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

    const asciiMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
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

function exportPdfDocument(config: ExportDocumentConfig) {
    const lines = buildDocumentLines(config);
    const pdfBlob = buildPdfContent(lines);
    downloadBlob(config.fileName, pdfBlob);
}

export async function exportKsePdf(companyName?: string) {
    await downloadBackendPdf("/api/se/export-pdf", `KSE-${companyName || "perusahaan"}.pdf`);
}

export async function exportCsirtPdf(companyName?: string) {
    await downloadBackendPdf("/api/csirt/export-pdf", `CSIRT-${companyName || "perusahaan"}.pdf`);
}

export function exportIkasPdf({
    companyName,
    selectedYear,
    totalCategory,
    totalScore,
    summaryRows,
    detailRows,
}: {
    companyName?: string;
    selectedYear: number;
    totalCategory: string;
    totalScore: string | number;
    summaryRows: KeyValueRow[];
    detailRows: Array<{
        domain: string;
        indikator: string;
        target: string | number | null | undefined;
        nilai: string | number | null | undefined;
        nilaiDomain: string | number | null | undefined;
        kategoriDomain: string | number | null | undefined;
    }>;
}) {
    exportPdfDocument({
        fileName: `IKAS-${companyName || "perusahaan"}-${selectedYear}.pdf`,
        title: "Laporan IKAS",
        subtitle: `${companyName ? `Perusahaan: ${companyName} | ` : ""}Tahun: ${selectedYear}`,
        summarySections: [
            {
                title: "Ringkasan IKAS",
                rows: [
                    { label: "Perusahaan", value: companyName || "-" },
                    { label: "Tahun Data", value: selectedYear },
                    { label: "Kategori Kematangan", value: totalCategory },
                    { label: "Nilai Kematangan", value: totalScore },
                    ...summaryRows,
                ],
            },
        ],
        tableSections: [
            {
                title: "Rincian Per Domain",
                columns: ["Domain", "Indikator", "Target", "Nilai", "Nilai Domain", "Kategori Domain"],
                rows: detailRows.map((row) => [
                    row.domain,
                    row.indikator,
                    row.target,
                    row.nilai,
                    row.nilaiDomain,
                    row.kategoriDomain,
                ]),
                emptyMessage: "Belum ada data IKAS untuk tahun ini.",
            },
        ],
    });
}
