/**
 * useIkasAssessmentSetup
 *
 * Fetches all four domain question arrays and all four jawaban arrays in
 * parallel from the backend, then:
 *  1. Transforms the questions into the `AssessmentData` shape used by
 *     `assessment.store.ts` (Domain → Category → SubCategory → Question[]).
 *  2. Builds an `AnswerMap` from existing jawaban records.
 *
 * Call this hook in `FormIkas` and push the results into the assessment store.
 */

import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';
import { ikasService } from '@/services/ikas.service';
import type {
    PertanyaanIdentifikasi, PertanyaanProteksi,
    PertanyaanDeteksi, PertanyaanGulih,
    JawabanIdentifikasi, JawabanProteksi,
    JawabanDeteksi, JawabanGulih,
    EmbeddedSubKategori,
} from '@/types/ikas.types';
import type { AssessmentData, Domain, Category, SubCategory, Question, AnswerMap, Answer } from '@/types/assessment.types';

// ─── Color mapping (API has no color field) ───────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
    identifikasi: '#00a2e8',
    proteksi: '#8e44ad',
    deteksi: '#f1c40f',
    gulih: '#27ae60',
};

/** Map API nama_domain → internal slug used by the store */
function toDomainSlug(namaDomain: string): string {
    const lower = namaDomain.toLowerCase();
    if (lower.includes('identifikasi')) return 'identifikasi';
    if (lower.includes('proteksi')) return 'proteksi';
    if (lower.includes('deteksi')) return 'deteksi';
    // "PENANGGULANGAN..." or "GULIH"
    return 'gulih';
}

/** Build a stable string ID from a numeric backend ID + prefix */
const subId = (prefix: string, id: number) => `${prefix}-${id}`;

// ─── Transform a single question array into Domain/Category/SubCategory tree ─

interface RawQ {
    id: number;
    text: string;
    index0: string; index1: string; index2: string;
    index3: string; index4: string; index5: string;
    ruang_lingkup: { id: number; nama_ruang_lingkup: string };
    sub_kategori: EmbeddedSubKategori;
}

function normalize(
    raw: any[],
    domainSlug: string,
    textField: string,
): RawQ[] {
    return raw.map(q => ({
        id: q.id,
        text: q[textField] ?? '',
        index0: q.index0 ?? '', index1: q.index1 ?? '', index2: q.index2 ?? '',
        index3: q.index3 ?? '', index4: q.index4 ?? '', index5: q.index5 ?? '',
        ruang_lingkup: q.ruang_lingkup,
        sub_kategori: q.sub_kategori,
    }));
}

function buildDomainTree(
    dominated: RawQ[],
    domainSlug: string,
): Domain {
    const catMap = new Map<number, { cat: EmbeddedSubKategori['kategori']; subs: Map<number, { sub: EmbeddedSubKategori; questions: Question[] }> }>();

    for (const q of dominated) {
        const subK = q.sub_kategori;
        const catId = subK.kategori.id;
        const subId_ = subK.id;

        if (!catMap.has(catId)) {
            catMap.set(catId, { cat: subK.kategori, subs: new Map() });
        }
        const catEntry = catMap.get(catId)!;

        if (!catEntry.subs.has(subId_)) {
            catEntry.subs.set(subId_, { sub: subK, questions: [] });
        }

        const scope = (q.ruang_lingkup?.nama_ruang_lingkup ?? 'Tata Kelola') as Question['scope'];
        const question: Question = {
            id: `${domainSlug}-${q.id}`,
            categoryId: subId(`cat`, catId),
            subCategoryId: subId(`sub`, subId_),
            text: q.text,
            scope,
            indexDescriptions: {
                0: q.index0, 1: q.index1, 2: q.index2,
                3: q.index3, 4: q.index4, 5: q.index5,
            },
        };

        catEntry.subs.get(subId_)!.questions.push(question);
    }

    const domNama = dominated[0]?.sub_kategori.kategori.domain.nama_domain ?? domainSlug.toUpperCase();
    const domId = subId('domain', dominated[0]?.sub_kategori.kategori.domain.id ?? 0) || domainSlug;

    const categories: Category[] = [];
    for (const { cat, subs } of Array.from(catMap.values())) {
        const catStrId = subId('cat', cat.id);
        const subCategories: SubCategory[] = [];
        for (const { sub, questions } of Array.from(subs.values())) {
            subCategories.push({
                id: subId('sub', sub.id),
                categoryId: catStrId,
                name: sub.nama_sub_kategori,
                questions,
            });
        }
        categories.push({
            id: catStrId,
            domainId: domId,
            name: cat.nama_kategori,
            subCategories,
        });
    }

    return {
        id: domainSlug,  // use slug as stable ID for navigation
        name: domNama,
        color: DOMAIN_COLORS[domainSlug] ?? '#64748b',
        categories,
    };
}

// ─── Build AnswerMap from all jawaban arrays ──────────────────────────────────

function buildAnswerMap(
    jawabanI: JawabanIdentifikasi[],
    jawabanP: JawabanProteksi[],
    jawabanD: JawabanDeteksi[],
    jawabanG: JawabanGulih[],
): AnswerMap {
    const map: AnswerMap = {};
    const now = Date.now();

    for (const j of jawabanI) {
        const qid = `identifikasi-${j.pertanyaan_identifikasi.id}`;
        map[qid] = { questionId: qid, index: j.jawaban_identifikasi, updatedAt: now };
    }
    for (const j of jawabanP) {
        const qid = `proteksi-${j.pertanyaan_proteksi.id}`;
        map[qid] = { questionId: qid, index: j.jawaban_proteksi, updatedAt: now };
    }
    for (const j of jawabanD) {
        const qid = `deteksi-${j.pertanyaan_deteksi.id}`;
        map[qid] = { questionId: qid, index: j.jawaban_deteksi, updatedAt: now };
    }
    for (const j of jawabanG) {
        const qid = `gulih-${j.pertanyaan_gulih.id}`;
        map[qid] = { questionId: qid, index: j.jawaban_gulih, updatedAt: now };
    }

    return map;
}

// ─── JawabanId lookup (for PUT vs POST when saving) ──────────────────────────

export interface JawabanIdMap {
    /** key = `${domainSlug}-${pertanyaan_id}`, value = jawaban record id */
    [key: string]: number;
}

function buildJawabanIdMap(
    jawabanI: JawabanIdentifikasi[],
    jawabanP: JawabanProteksi[],
    jawabanD: JawabanDeteksi[],
    jawabanG: JawabanGulih[],
): JawabanIdMap {
    const map: JawabanIdMap = {};
    for (const j of jawabanI) map[`identifikasi-${j.pertanyaan_identifikasi.id}`] = j.id;
    for (const j of jawabanP) map[`proteksi-${j.pertanyaan_proteksi.id}`] = j.id;
    for (const j of jawabanD) map[`deteksi-${j.pertanyaan_deteksi.id}`] = j.id;
    for (const j of jawabanG) map[`gulih-${j.pertanyaan_gulih.id}`] = j.id;
    return map;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useIkasAssessmentSetup() {
    const results = useQueries({
        queries: [
            // Questions
            { queryKey: ['pertanyaan-identifikasi'], queryFn: () => ikasService.getPertanyaanIdentifikasi(), staleTime: 1000 * 60 * 10 },
            { queryKey: ['pertanyaan-proteksi'],     queryFn: () => ikasService.getPertanyaanProteksi(),     staleTime: 1000 * 60 * 10 },
            { queryKey: ['pertanyaan-deteksi'],      queryFn: () => ikasService.getPertanyaanDeteksi(),      staleTime: 1000 * 60 * 10 },
            { queryKey: ['pertanyaan-gulih'],        queryFn: () => ikasService.getPertanyaanGulih(),        staleTime: 1000 * 60 * 10 },
            // Answers
            { queryKey: ['jawaban-identifikasi'], queryFn: () => ikasService.getJawabanIdentifikasi(), staleTime: 1000 * 60 * 2 },
            { queryKey: ['jawaban-proteksi'],     queryFn: () => ikasService.getJawabanProteksi(),     staleTime: 1000 * 60 * 2 },
            { queryKey: ['jawaban-deteksi'],      queryFn: () => ikasService.getJawabanDeteksi(),      staleTime: 1000 * 60 * 2 },
            { queryKey: ['jawaban-gulih'],        queryFn: () => ikasService.getJawabanGulih(),        staleTime: 1000 * 60 * 2 },
        ],
    });

    const [
        qI, qP, qD, qG,
        jI, jP, jD, jG,
    ] = results;

    const isLoadingQuestions = qI.isLoading || qP.isLoading || qD.isLoading || qG.isLoading;
    const isLoadingAnswers   = jI.isLoading || jP.isLoading || jD.isLoading || jG.isLoading;
    const isLoading = isLoadingQuestions || isLoadingAnswers;

    const isError = qI.isError || qP.isError || qD.isError || qG.isError;

    /** Full AssessmentData built from API — null while loading */
    const assessmentData: AssessmentData | null = useMemo(() => {
        const rawI = qI.data as PertanyaanIdentifikasi[] | undefined;
        const rawP = qP.data as PertanyaanProteksi[] | undefined;
        const rawD = qD.data as PertanyaanDeteksi[] | undefined;
        const rawG = qG.data as PertanyaanGulih[] | undefined;

        if (!rawI || !rawP || !rawD || !rawG) return null;
        if (!rawI.length && !rawP.length && !rawD.length && !rawG.length) return null;

        const nI = normalize(rawI, 'identifikasi', 'pertanyaan_identifikasi');
        const nP = normalize(rawP, 'proteksi',     'pertanyaan_proteksi');
        const nD = normalize(rawD, 'deteksi',      'pertanyaan_deteksi');
        const nG = normalize(rawG, 'gulih',        'pertanyaan_gulih');

        const domains: Domain[] = [];
        if (nI.length) domains.push(buildDomainTree(nI, 'identifikasi'));
        if (nP.length) domains.push(buildDomainTree(nP, 'proteksi'));
        if (nD.length) domains.push(buildDomainTree(nD, 'deteksi'));
        if (nG.length) domains.push(buildDomainTree(nG, 'gulih'));

        return { domains };
    }, [qI.data, qP.data, qD.data, qG.data]);

    /** AnswerMap from existing jawaban — empty object while loading */
    const answerMap: AnswerMap = useMemo(() => {
        const jawabanI = (jI.data ?? []) as JawabanIdentifikasi[];
        const jawabanP = (jP.data ?? []) as JawabanProteksi[];
        const jawabanD = (jD.data ?? []) as JawabanDeteksi[];
        const jawabanG = (jG.data ?? []) as JawabanGulih[];
        return buildAnswerMap(jawabanI, jawabanP, jawabanD, jawabanG);
    }, [jI.data, jP.data, jD.data, jG.data]);

    /** Map of questionId → existing jawabanId (for PUT vs POST logic) */
    const jawabanIdMap: JawabanIdMap = useMemo(() => {
        const jawabanI = (jI.data ?? []) as JawabanIdentifikasi[];
        const jawabanP = (jP.data ?? []) as JawabanProteksi[];
        const jawabanD = (jD.data ?? []) as JawabanDeteksi[];
        const jawabanG = (jG.data ?? []) as JawabanGulih[];
        return buildJawabanIdMap(jawabanI, jawabanP, jawabanD, jawabanG);
    }, [jI.data, jP.data, jD.data, jG.data]);

    const hasExistingAnswers = Object.keys(answerMap).length > 0;

    return {
        assessmentData,
        answerMap,
        jawabanIdMap,
        hasExistingAnswers,
        isLoading,
        isLoadingQuestions,
        isLoadingAnswers,
        isError,
    };
}
