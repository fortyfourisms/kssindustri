import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
    AnswerMap,
    Answer,
    AssessmentProgress,
    RespondentProfile,
} from '@/types/assessment.types';
import { assessmentData } from '@/data/assessment-data';

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
    RESPONDENT_PROFILES: 'respondent_profiles_map',
    ASSESSMENT_ANSWERS: 'assessment_answers_map',
    ASSESSMENT_PROGRESS: 'assessment_progress_map',
} as const;

const createDefaultProgress = (): AssessmentProgress => ({
    currentDomainId: 'identifikasi',
    currentCategoryId: 'peran-tanggung-jawab',
    currentSubCategoryId: 'peran-keamanan',
    currentPage: 1,
    status: 'IN_PROGRESS',
    lastUpdated: Date.now(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssessmentState {
    currentStakeholderSlug: string;
    respondentProfilesMap: Record<string, RespondentProfile>;
    answersMap: Record<string, AnswerMap>;
    progressMap: Record<string, AssessmentProgress>;
    initialized: boolean;
    existingIkasId: string | null;

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
                    ? (progressMap[currentStakeholderSlug] ?? createDefaultProgress())
                    : createDefaultProgress();
            },
            hasRespondentProfile: () => get().respondentProfile() !== null,
            isCompleted: () => get().progress().status === 'COMPLETED',
            isLocked: () => get().isCompleted(),
            getBreadcrumbPath: () => {
                const { progress } = get();
                const current = progress();
                const d = assessmentData.domains.find((d: any) => d.id === current.currentDomainId);
                const c = d?.categories.find((c: any) => c.id === current.currentCategoryId);
                const s = c?.subCategories.find((s: any) => s.id === current.currentSubCategoryId);
                if (!d || !c || !s) return [];
                return [d.name, c.name, s.name];
            },
            getCurrentDomain: () => {
                const dId = get().progress().currentDomainId;
                return assessmentData.domains.find((d: any) => d.id === dId);
            },
            getCurrentCategory: () => {
                const p = get().progress();
                const d = assessmentData.domains.find((d: any) => d.id === p.currentDomainId);
                return d?.categories.find((c: any) => c.id === p.currentCategoryId);
            },
            getCurrentSubCategory: () => {
                const p = get().progress();
                const d = assessmentData.domains.find((d: any) => d.id === p.currentDomainId);
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
                assessmentData.domains.forEach((d: any) => {
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
                        [slug]: state.progressMap[slug] ?? createDefaultProgress(),
                    },
                }));
            },

            setExistingIkasId: (id) => set({ existingIkasId: id }),

            initialize: () => {
                if (get().initialized) return;
                // Clean up old global (non-per-stakeholder) keys from previous implementation
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

                if (!s) return;

                const totalPages = get().totalPagesInSubCategory();

                if (p.currentPage < totalPages) {
                    get().updateProgress(p.currentDomainId, p.currentCategoryId, p.currentSubCategoryId, p.currentPage + 1);
                } else {
                    // Navigate to next subcategory logic here if needed, or disable 'Next' on last page.
                    // For now, AssessmentView disables Next on the very last page of the app.
                    // This implements a simple jump to next sub-category
                    const d = assessmentData.domains.find((d: any) => d.id === p.currentDomainId);
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
                                const dIdx = assessmentData.domains.findIndex((dom: any) => dom.id === p.currentDomainId);
                                if (dIdx < assessmentData.domains.length - 1) {
                                    const nextD = assessmentData.domains[dIdx + 1];
                                    get().jumpTo(nextD.id, nextD.categories[0].id, nextD.categories[0].subCategories[0].id, 1);
                                }
                            }
                        }
                    }
                }
            },

            goToPreviousPage: () => {
                const p = get().progress();
                if (p.currentPage > 1) {
                    get().updateProgress(p.currentDomainId, p.currentCategoryId, p.currentSubCategoryId, p.currentPage - 1);
                } else {
                    // Navigate to previous subcategory
                    const d = assessmentData.domains.find((d: any) => d.id === p.currentDomainId);
                    const c = d?.categories.find((c: any) => c.id === p.currentCategoryId);

                    if (d && c) {
                        const sIdx = c.subCategories.findIndex((sub: any) => sub.id === p.currentSubCategoryId);
                        if (sIdx > 0) {
                            const prevS = c.subCategories[sIdx - 1];
                            const prevSTotalPages = prevS.questions.length;
                            get().jumpTo(d.id, c.id, prevS.id, prevSTotalPages);
                        } else {
                            const cIdx = d.categories.findIndex((cat: any) => cat.id === p.currentCategoryId);
                            if (cIdx > 0) {
                                const prevC = d.categories[cIdx - 1];
                                const prevS = prevC.subCategories[prevC.subCategories.length - 1];
                                const prevSTotalPages = prevS.questions.length;
                                get().jumpTo(d.id, prevC.id, prevS.id, prevSTotalPages);
                            } else {
                                const dIdx = assessmentData.domains.findIndex((dom: any) => dom.id === p.currentDomainId);
                                if (dIdx > 0) {
                                    const prevD = assessmentData.domains[dIdx - 1];
                                    const prevC = prevD.categories[prevD.categories.length - 1];
                                    const prevS = prevC.subCategories[prevC.subCategories.length - 1];
                                    const prevSTotalPages = prevS.questions.length;
                                    get().jumpTo(prevD.id, prevC.id, prevS.id, prevSTotalPages);
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
                });
            },
        }),
        {
            name: 'assessment-store',
            storage: createJSONStorage(() => localStorage),
            // Persist all maps so data survives page reload
            partialize: (state) => ({
                currentStakeholderSlug: state.currentStakeholderSlug,
                respondentProfilesMap: state.respondentProfilesMap,
                answersMap: state.answersMap,
                progressMap: state.progressMap,
                initialized: state.initialized,
            }),
        }
    )
);
