import { getMaturityLabel } from "@/data/ikas-data";
import type {
    IkasViewData,
    IkasViewDomainData,
    JawabanDeteksi,
    JawabanGulih,
    JawabanIdentifikasi,
    JawabanProteksi,
} from "@/types/ikas.types";

type AnyJawaban =
    | JawabanIdentifikasi
    | JawabanProteksi
    | JawabanDeteksi
    | JawabanGulih;

type DomainKey = "identifikasi" | "proteksi" | "deteksi" | "gulih";

const EMPTY_DOMAIN_VIEW: IkasViewDomainData = {
    nilai: 0,
    kategori: "-",
    nilai_subdomain1: 0,
    nilai_subdomain2: 0,
    nilai_subdomain3: 0,
    nilai_subdomain4: 0,
    nilai_subdomain5: 0,
    nilai_subdomain6: 0,
};

function toSafeNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function roundTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
}

function average(values: number[]): number {
    if (!values.length) return 0;
    return roundTwoDecimals(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function formatDomainCategory(score: number): string {
    return score > 0 ? getMaturityLabel(score) : "-";
}

const CATEGORY_ORDER_BY_DOMAIN: Record<DomainKey, string[]> = {
    identifikasi: [
        "mengidentifikasi peran dan tanggung jawab organisasi",
        "menyusun strategi, kebijakan, dan prosedur keamanan siber",
        "mengelola aset informasi",
        "menilai dan mengelola risiko keamanan siber",
        "mengelola risiko rantai pasok",
    ],
    proteksi: [
        "mengelola identitas, autentikasi, dan kendali akses",
        "melindungi aset fisik",
        "melindungi data",
        "melindungi aplikasi",
        "melindungi jaringan",
        "melindungi sumber daya manusia",
    ],
    deteksi: [
        "mengelola deteksi peristiwa siber",
        "menganalisis anomali dan peristiwa siber",
        "memantau peristiwa siber berkelanjutan",
    ],
    gulih: [
        "menyusun perencanaan penanggulangan dan pemulihan insiden siber",
        "menganalisis dan melaporkan insiden siber",
        "melaksanakan penanggulangan dan pemulihan insiden siber",
        "meningkatkan keamanan setelah terjadinya insiden siber",
    ],
};

function normalizeLabel(value: string | null | undefined): string {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function getQuestion(item: AnyJawaban) {
    return (
        (item as JawabanIdentifikasi).pertanyaan_identifikasi ??
        (item as JawabanProteksi).pertanyaan_proteksi ??
        (item as JawabanDeteksi).pertanyaan_deteksi ??
        (item as JawabanGulih).pertanyaan_gulih
    );
}

function getCategoryId(item: AnyJawaban): number | null {
    const question = getQuestion(item);
    const rawId = question?.sub_kategori?.kategori?.id;
    const id = Number(rawId);
    return Number.isFinite(id) ? id : null;
}

function getCategoryName(item: AnyJawaban): string {
    return normalizeLabel(getQuestion(item)?.sub_kategori?.kategori?.nama_kategori);
}

function getJawabanValue(item: AnyJawaban): number {
    return toSafeNumber(
        (item as JawabanIdentifikasi).jawaban_identifikasi ??
        (item as JawabanProteksi).jawaban_proteksi ??
        (item as JawabanDeteksi).jawaban_deteksi ??
        (item as JawabanGulih).jawaban_gulih
    );
}

function buildDomainView(items: AnyJawaban[], domainKey: DomainKey, subdomainCount: number): IkasViewDomainData {
    if (!items.length) return { ...EMPTY_DOMAIN_VIEW };

    const grouped = new Map<string, { categoryId: number; values: number[] }>();
    for (const item of items) {
        const categoryId = getCategoryId(item);
        const categoryName = getCategoryName(item);
        if (categoryId === null && !categoryName) continue;

        const key = categoryName || `id:${categoryId}`;
        const entry = grouped.get(key) ?? {
            categoryId: categoryId ?? Number.MAX_SAFE_INTEGER,
            values: [],
        };
        entry.values.push(getJawabanValue(item));
        grouped.set(key, entry);
    }

    const desiredOrder = CATEGORY_ORDER_BY_DOMAIN[domainKey];
    const categoryScores = Array.from(grouped.entries())
        .sort(([keyA, entryA], [keyB, entryB]) => {
            const orderA = desiredOrder.indexOf(keyA);
            const orderB = desiredOrder.indexOf(keyB);
            const resolvedOrderA = orderA === -1 ? Number.MAX_SAFE_INTEGER : orderA;
            const resolvedOrderB = orderB === -1 ? Number.MAX_SAFE_INTEGER : orderB;

            if (resolvedOrderA !== resolvedOrderB) {
                return resolvedOrderA - resolvedOrderB;
            }

            return entryA.categoryId - entryB.categoryId;
        })
        .map(([, entry]) => average(entry.values));

    const limitedScores = categoryScores.slice(0, subdomainCount);
    const domainScore = average(limitedScores);

    return {
        nilai: domainScore,
        kategori: formatDomainCategory(domainScore),
        nilai_subdomain1: limitedScores[0] ?? 0,
        nilai_subdomain2: limitedScores[1] ?? 0,
        nilai_subdomain3: limitedScores[2] ?? 0,
        nilai_subdomain4: limitedScores[3] ?? 0,
        nilai_subdomain5: limitedScores[4] ?? 0,
        nilai_subdomain6: limitedScores[5] ?? 0,
    };
}

export function buildIkasViewFromJawaban(params: {
    identifikasi?: JawabanIdentifikasi[];
    proteksi?: JawabanProteksi[];
    deteksi?: JawabanDeteksi[];
    gulih?: JawabanGulih[];
}): IkasViewData | null {
    const identifikasi = buildDomainView(params.identifikasi ?? [], "identifikasi", 5);
    const proteksi = buildDomainView(params.proteksi ?? [], "proteksi", 6);
    const deteksi = buildDomainView(params.deteksi ?? [], "deteksi", 3);
    const gulih = buildDomainView(params.gulih ?? [], "gulih", 4);

    const domainScores = [
        identifikasi.nilai,
        proteksi.nilai,
        deteksi.nilai,
        gulih.nilai,
    ].filter((value) => value > 0);

    if (domainScores.length === 0) return null;

    const total = average(domainScores);

    return {
        identifikasi,
        proteksi,
        deteksi,
        gulih,
        total_rata_rata: total,
        total_kategori: getMaturityLabel(total),
    };
}
