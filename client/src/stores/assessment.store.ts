import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    AnswerMap,
    Answer,
    AssessmentProgress,
    RespondentProfile,
    AssessmentData,
} from '@/types/assessment.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
    RESPONDENT_PROFILES: 'respondent_profiles_map',
    ASSESSMENT_ANSWERS: 'assessment_answers_map',
    ASSESSMENT_PROGRESS: 'assessment_progress_map',
} as const;

const EMPTY_ASSESSMENT_DATA: AssessmentData = { domains: [] };

function createDefaultProgress(assessmentData?: AssessmentData): AssessmentProgress {
    const firstDomain = assessmentData?.domains[0];
    const firstCat = firstDomain?.categories[0];
    const firstSub = firstCat?.subCategories[0];
    return {
        currentDomainId: firstDomain?.id ?? 'identifikasi',
        currentCategoryId: firstCat?.id ?? '',
        currentSubCategoryId: firstSub?.id ?? '',
        currentPage: 1,
        status: 'IN_PROGRESS',
        lastUpdated: Date.now(),
    };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentState {
    currentStakeholderSlug: string;
    respondentProfilesMap: Record<string, RespondentProfile>;
    answersMap: Record<string, AnswerMap>;
    progressMap: Record<string, AssessmentProgress>;
    initialized: boolean;
    existingIkasId: string | null;

    /** Dynamic assessment data loaded from API (replaces static assessment-data.ts) */
    assessmentStructure: AssessmentData;

    // ── Derived ──────────────────────────────────────────────────────────────
    respondentProfile: () => RespondentProfile | null;
    answers: () => AnswerMap;
    progress: () => AssessmentProgress;
    hasRespondentProfile: () => boolean;
    isCompleted: () => boolean;
    isLocked: () => boolean;
    getBreadcrumbPath: () => string[];
    getCurrentDomain: () => any;
    getCurrentCategory: () => any;
    getCurrentSubCategory: () => any;
    getCurrentPageQuestions: () => any[];
    getAnswer: (questionId: string) => Answer | undefined;
    answeredQuestions: () => number;
    totalQuestions: () => number;
    totalPagesInSubCategory: () => number;
    goToNextPage: () => void;
    goToPreviousPage: () => void;

    // ── Actions ───────────────────────────────────────────────────────────────
    setCurrentStakeholder: (slug: string) => void;
    setExistingIkasId: (id: string | null) => void;
    initialize: () => void;

    /** Set dynamic assessment structure from API data */
    setAssessmentStructure: (data: AssessmentData) => void;

    /** Hydrate answersMap with pre-existing answers from the database */
    hydrateAnswers: (answerMap: AnswerMap) => void;

    saveRespondentProfile: (profile: RespondentProfile) => void;
    saveAnswer: (questionId: string, index: number) => void;
    updateProgress: (domainId: string, categoryId: string, subCategoryId: string, page: number) => void;
    completeAssessment: () => void;
    unlockAssessment: () => void;
    jumpTo: (domainId: string, categoryId: string, subCategoryId: string, page?: number) => void;
    clearCurrentStakeholder: () => void;
    clearAll: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAssessmentStore = create<AssessmentState>()(
    persist(
        (set, get) => ({
            currentStakeholderSlug: '',
            respondentProfilesMap: {},
            answersMap: {},
            progressMap: {},
            initialized: false,
            existingIkasId: null,
            assessmentStructure: EMPTY_ASSESSMENT_DATA,

            // ── Helpers ────────────────────────────────────────────────────────────
            _data: () => get().assessmentStructure.domains.length > 0
                ? get().assessmentStructure
                : EMPTY_ASSESSMENT_DATA,

            // ── Derived ────────────────────────────────────────────────────────────
            respondentProfile: () => {
                const { currentStakeholderSlug, respondentProfilesMap } = get();
                return currentStakeholderSlug ? (respondentProfilesMap[currentStakeholderSlug] ?? null) : null;
            },
            answers: () => {
                const { currentStakeholderSlug, answersMap } = get();
                return currentStakeholderSlug ? (answersMap[currentStakeholderSlug] ?? {}) : {};
            },
            progress: () => {
                const { currentStakeholderSlug, progressMap } = get();
                return currentStakeholderSlug
                    ? (progressMap[currentStakeholderSlug] ?? createDefaultProgress(get().assessmentStructure))
                    : createDefaultProgress(get().assessmentStructure);
            },
            hasRespondentProfile: () => get().respondentProfile() !== null,
            isCompleted: () => get().progress().status === 'COMPLETED',
            isLocked: () => get().isCompleted(),
            getBreadcrumbPath: () => {
                const { progress, assessmentStructure } = get();
                const current = progress();
                const d = assessmentStructure.domains.find((d: any) => d.id === current.currentDomainId);
                const c = d?.categories.find((c: any) => c.id === current.currentCategoryId);
                const s = c?.subCategories.find((s: any) => s.id === current.currentSubCategoryId);
                if (!d || !c || !s) return [];
                return [d.name, c.name, s.name];
            },
            getCurrentDomain: () => {
                const dId = get().progress().currentDomainId;
                return get().assessmentStructure.domains.find((d: any) => d.id === dId);
            },
            getCurrentCategory: () => {
                const p = get().progress();
                const d = get().assessmentStructure.domains.find((d: any) => d.id === p.currentDomainId);
                return d?.categories.find((c: any) => c.id === p.currentCategoryId);
            },
            getCurrentSubCategory: () => {
                const p = get().progress();
                const d = get().assessmentStructure.domains.find((d: any) => d.id === p.currentDomainId);
                const c = d?.categories.find((c: any) => c.id === p.currentCategoryId);
                return c?.subCategories.find((s: any) => s.id === p.currentSubCategoryId);
            },
            getCurrentPageQuestions: () => {
                const s = get().getCurrentSubCategory();
                if (!s) return [];
                const page = get().progress().currentPage;
                const QUESTIONS_PER_PAGE = 1;
                const startIndex = (page - 1) * QUESTIONS_PER_PAGE;
                return s.questions.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);
            },
            getAnswer: (questionId: string) => {
                const answers = get().answers();
                return answers[questionId];
            },
            answeredQuestions: () => {
                const answers = get().answers();
                return Object.keys(answers).length;
            },
            totalQuestions: () => {
                let total = 0;
                get().assessmentStructure.domains.forEach((d: any) => {
                    d.categories.forEach((c: any) => {
                        c.subCategories.forEach((sc: any) => {
                            total += sc.questions.length;
                        });
                    });
                });
                return total;
            },
            totalPagesInSubCategory: () => {
                const s = get().getCurrentSubCategory();
                if (!s) return 1;
                return s.questions.length;
            },

            // ── Actions ────────────────────────────────────────────────────────────
            setCurrentStakeholder: (slug) => {
                set((state) => ({
                    currentStakeholderSlug: slug,
                    answersMap: {
                        ...state.answersMap,
                        [slug]: state.answersMap[slug] ?? {},
                    },
                    progressMap: {
                        ...state.progressMap,
                        [slug]: state.progressMap[slug] ?? createDefaultProgress(state.assessmentStructure),
                    },
                }));
            },

            setExistingIkasId: (id) => set({ existingIkasId: id }),

            initialize: () => {
                if (get().initialized) return;
                const oldKeys = ['respondent_profile', 'assessment_answers', 'assessment_progress'];
                oldKeys.forEach((key) => localStorage.removeItem(key));

                const load = <T>(key: string): T | null => {
                    try {
                        const raw = localStorage.getItem(key);
                        return raw ? JSON.parse(raw) : null;
                    } catch { return null; }
                };

                set({
                    respondentProfilesMap: load<Record<string, RespondentProfile>>(STORAGE_KEYS.RESPONDENT_PROFILES) ?? {},
                    answersMap: load<Record<string, AnswerMap>>(STORAGE_KEYS.ASSESSMENT_ANSWERS) ?? {},
                    progressMap: load<Record<string, AssessmentProgress>>(STORAGE_KEYS.ASSESSMENT_PROGRESS) ?? {},
                    initialized: true,
                });
            },

            setAssessmentStructure: (data: AssessmentData) => {
                set((state) => {
                    // If no current progress for this stakeholder, initialize it with the
                    // new structure so navigation starts at the first domain/category/sub
                    const slug = state.currentStakeholderSlug;
                    const hasProgress = slug && !!state.progressMap[slug];
                    const progressMap = hasProgress ? state.progressMap : {
                        ...state.progressMap,
                        ...(slug ? { [slug]: createDefaultProgress(data) } : {}),
                    };
                    return { assessmentStructure: data, progressMap };
                });
            },

            hydrateAnswers: (answerMap: AnswerMap) => {
                const { currentStakeholderSlug } = get();
                if (!currentStakeholderSlug) return;
                set((state) => {
                    const existing = state.answersMap[currentStakeholderSlug] ?? {};
                    // API answers override localStorage drafts
                    const merged = { ...existing, ...answerMap };
                    const map = { ...state.answersMap, [currentStakeholderSlug]: merged };
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_ANSWERS, JSON.stringify(map));
                    return { answersMap: map };
                });
            },

            saveRespondentProfile: (profile) => {
                const { currentStakeholderSlug } = get();
                if (!currentStakeholderSlug) return;
                const now = Date.now();
                const updated = { ...profile, updatedAt: now, createdAt: profile.createdAt ?? now };
                set((state) => {
                    const map = { ...state.respondentProfilesMap, [currentStakeholderSlug]: updated };
                    localStorage.setItem(STORAGE_KEYS.RESPONDENT_PROFILES, JSON.stringify(map));
                    return { respondentProfilesMap: map };
                });
            },

            saveAnswer: (questionId, index) => {
                const { currentStakeholderSlug, isLocked } = get();
                if (!currentStakeholderSlug || isLocked()) return;
                const answer: Answer = { questionId, index, updatedAt: Date.now() };
                set((state) => {
                    const map = {
                        ...state.answersMap,
                        [currentStakeholderSlug]: {
                            ...(state.answersMap[currentStakeholderSlug] ?? {}),
                            [questionId]: answer,
                        },
                    };
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_ANSWERS, JSON.stringify(map));
                    return { answersMap: map };
                });
            },

            updateProgress: (domainId, categoryId, subCategoryId, page) => {
                const { currentStakeholderSlug, progressMap } = get();
                if (!currentStakeholderSlug) return;
                const newProgress: AssessmentProgress = {
                    currentDomainId: domainId,
                    currentCategoryId: categoryId,
                    currentSubCategoryId: subCategoryId,
                    currentPage: page,
                    status: progressMap[currentStakeholderSlug]?.status ?? 'IN_PROGRESS',
                    lastUpdated: Date.now(),
                };
                set((state) => {
                    const map = { ...state.progressMap, [currentStakeholderSlug]: newProgress };
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_PROGRESS, JSON.stringify(map));
                    return { progressMap: map };
                });
            },

            completeAssessment: () => {
                const { currentStakeholderSlug, progress } = get();
                if (!currentStakeholderSlug) return;
                const p = { ...progress(), status: 'COMPLETED' as const, lastUpdated: Date.now() };
                set((state) => {
                    const map = { ...state.progressMap, [currentStakeholderSlug]: p };
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_PROGRESS, JSON.stringify(map));
                    return { progressMap: map };
                });
            },

            unlockAssessment: () => {
                const { currentStakeholderSlug, progress } = get();
                if (!currentStakeholderSlug) return;
                const p = { ...progress(), status: 'IN_PROGRESS' as const, lastUpdated: Date.now() };
                set((state) => {
                    const map = { ...state.progressMap, [currentStakeholderSlug]: p };
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_PROGRESS, JSON.stringify(map));
                    return { progressMap: map };
                });
            },

            jumpTo: (domainId, categoryId, subCategoryId, page = 1) => {
                get().updateProgress(domainId, categoryId, subCategoryId, page);
            },

            goToNextPage: () => {
                const p = get().progress();
                const s = get().getCurrentSubCategory();
                const data = get().assessmentStructure;
                if (!s) return;

                const totalPages = get().totalPagesInSubCategory();
                if (p.currentPage < totalPages) {
                    get().updateProgress(p.currentDomainId, p.currentCategoryId, p.currentSubCategoryId, p.currentPage + 1);
                } else {
                    const d = data.domains.find((d: any) => d.id === p.currentDomainId);
                    const c = d?.categories.find((c: any) => c.id === p.currentCategoryId);
                    if (d && c) {
                        const sIdx = c.subCategories.findIndex((sub: any) => sub.id === p.currentSubCategoryId);
                        if (sIdx < c.subCategories.length - 1) {
                            get().jumpTo(d.id, c.id, c.subCategories[sIdx + 1].id, 1);
                        } else {
                            const cIdx = d.categories.findIndex((cat: any) => cat.id === p.currentCategoryId);
                            if (cIdx < d.categories.length - 1) {
                                get().jumpTo(d.id, d.categories[cIdx + 1].id, d.categories[cIdx + 1].subCategories[0].id, 1);
                            } else {
                                const dIdx = data.domains.findIndex((dom: any) => dom.id === p.currentDomainId);
                                if (dIdx < data.domains.length - 1) {
                                    const nextD = data.domains[dIdx + 1];
                                    get().jumpTo(nextD.id, nextD.categories[0].id, nextD.categories[0].subCategories[0].id, 1);
                                }
                            }
                        }
                    }
                }
            },

            goToPreviousPage: () => {
                const p = get().progress();
                const data = get().assessmentStructure;
                if (p.currentPage > 1) {
                    get().updateProgress(p.currentDomainId, p.currentCategoryId, p.currentSubCategoryId, p.currentPage - 1);
                } else {
                    const d = data.domains.find((d: any) => d.id === p.currentDomainId);
                    const c = d?.categories.find((c: any) => c.id === p.currentCategoryId);
                    if (d && c) {
                        const sIdx = c.subCategories.findIndex((sub: any) => sub.id === p.currentSubCategoryId);
                        if (sIdx > 0) {
                            const prevS = c.subCategories[sIdx - 1];
                            get().jumpTo(d.id, c.id, prevS.id, prevS.questions.length);
                        } else {
                            const cIdx = d.categories.findIndex((cat: any) => cat.id === p.currentCategoryId);
                            if (cIdx > 0) {
                                const prevC = d.categories[cIdx - 1];
                                const prevS = prevC.subCategories[prevC.subCategories.length - 1];
                                get().jumpTo(d.id, prevC.id, prevS.id, prevS.questions.length);
                            } else {
                                const dIdx = data.domains.findIndex((dom: any) => dom.id === p.currentDomainId);
                                if (dIdx > 0) {
                                    const prevD = data.domains[dIdx - 1];
                                    const prevC = prevD.categories[prevD.categories.length - 1];
                                    const prevS = prevC.subCategories[prevC.subCategories.length - 1];
                                    get().jumpTo(prevD.id, prevC.id, prevS.id, prevS.questions.length);
                                }
                            }
                        }
                    }
                }
            },

            clearCurrentStakeholder: () => {
                const { currentStakeholderSlug } = get();
                if (!currentStakeholderSlug) return;
                set((state) => {
                    const profiles = { ...state.respondentProfilesMap };
                    const answers = { ...state.answersMap };
                    const progress = { ...state.progressMap };
                    delete profiles[currentStakeholderSlug];
                    delete answers[currentStakeholderSlug];
                    delete progress[currentStakeholderSlug];
                    localStorage.setItem(STORAGE_KEYS.RESPONDENT_PROFILES, JSON.stringify(profiles));
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_ANSWERS, JSON.stringify(answers));
                    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_PROGRESS, JSON.stringify(progress));
                    return { respondentProfilesMap: profiles, answersMap: answers, progressMap: progress };
                });
            },

            clearAll: () => {
                Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
                set({
                    respondentProfilesMap: {},
                    answersMap: {},
                    progressMap: {},
                    currentStakeholderSlug: '',
                    assessmentStructure: EMPTY_ASSESSMENT_DATA,
                });
            },
        }),
        {
            name: 'assessment-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                currentStakeholderSlug: state.currentStakeholderSlug,
                respondentProfilesMap: state.respondentProfilesMap,
                answersMap: state.answersMap,
                progressMap: state.progressMap,
                initialized: state.initialized,
                // NOTE: assessmentStructure is NOT persisted — always re-fetched from API
            }),
        }
    )
);
