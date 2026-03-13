// ─── Assessment Types ─────────────────────────────────────────────────────────

export type QuestionScope = 'Tata Kelola' | 'Sumber Daya Manusia' | 'Teknologi';

export type AnswerIndex = 0 | 1 | 2 | 3 | 4 | 5;

export interface IndexDescription {
    [key: number]: string;
}

export interface Question {
    id: string;
    categoryId: string;
    subCategoryId: string;
    text: string;
    scope: QuestionScope;
    indexDescriptions: IndexDescription;
}

export interface SubCategory {
    id: string;
    categoryId: string;
    name: string;
    questions: Question[];
}

export interface Category {
    id: string;
    domainId: string;
    name: string;
    subCategories: SubCategory[];
}

export interface Domain {
    id: string;
    name: string;
    color: string;
    categories: Category[];
}

export interface AssessmentData {
    domains: Domain[];
}

// ─── Answer Storage ───────────────────────────────────────────────────────────

export interface Answer {
    questionId: string;
    index: number;
    updatedAt: number;
}

export interface AnswerMap {
    [questionId: string]: Answer;
}

// ─── Progress Tracking ────────────────────────────────────────────────────────

export interface AssessmentProgress {
    currentDomainId: string;
    currentCategoryId: string;
    currentSubCategoryId: string;
    currentPage: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
    lastUpdated: number;
}

// ─── Respondent Profile ───────────────────────────────────────────────────────

export interface RespondentProfile {
    instansi: string;
    namaSistem: string;
    jenisSistem: 'IT' | 'OT' | 'IT & OT';
    sektor: string;
    alamat: string;
    email: string;
    nomorTelepon: string;
    namaResponden: string;
    jabatanResponden: string;
    tahunPengukuran: string;
    targetLevel: 1 | 2 | 3 | 4 | 5;
    targetNilai: string;
    acuanManajemenRisiko: string;
    acuanKeamananSiber: string;
    tanggalPengisian: string;
    createdAt: number;
    updatedAt: number;
}

// ─── Results ──────────────────────────────────────────────────────────────────

export interface SubCategoryResult {
    subCategoryId: string;
    average: number | null;
    totalQuestions: number;
    answeredQuestions: number;
}

export interface CategoryResult {
    categoryId: string;
    average: number | null;
    subCategoryResults: SubCategoryResult[];
}

export interface DomainResult {
    domainId: string;
    average: number | null;
    categoryResults: CategoryResult[];
}

export interface AssessmentResult {
    overallAverage: number | null;
    maturityLevel: string;
    domainResults: DomainResult[];
    totalQuestions: number;
    answeredQuestions: number;
    completionPercentage: number;
}
