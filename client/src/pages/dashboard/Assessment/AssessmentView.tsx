import React, { useState } from 'react';
import { useAssessmentStore } from '@/stores/assessment.store';
import QuestionCard from '@/components/assessment/QuestionCard';
import ProgressBar from '@/components/assessment/ProgressBar';
import PaginationControl from '@/components/assessment/PaginationControl';
import { useToast } from '@/hooks/use-toast';
import { ikasService } from '@/services/ikas.service';
import type { DomainSlug } from '@/types/ikas.types';
import type { JawabanIdMap } from '@/hooks/useIkasAssessmentSetup';

interface AssessmentViewProps {
  onBack: () => void;
  onEdit: () => void;
  embedded?: boolean;
  /** Map of questionId → existing jawabanId; used for PUT vs POST when saving */
  jawabanIdMap?: JawabanIdMap;
}

export default function AssessmentView({
  onBack,
  onEdit,
  embedded = false,
  jawabanIdMap = {},
}: AssessmentViewProps) {
  const store = useAssessmentStore();
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derived from dynamic store
  const assessmentData = store.assessmentStructure;

  // Compute if domain is current
  const isCurrentDomain = (domainId: string) =>
    store.progress().currentDomainId === domainId;

  // Compute if sub-category is current
  const isCurrentSubCategory = (
    domainId: string,
    categoryId: string,
    subCategoryId: string
  ) => (
    store.progress().currentDomainId === domainId &&
    store.progress().currentCategoryId === categoryId &&
    store.progress().currentSubCategoryId === subCategoryId
  );

  // Get answered count for a sub-category
  const getSubCategoryProgress = (
    domainId: string,
    categoryId: string,
    subCategoryId: string
  ) => {
    const domain = assessmentData.domains.find((d) => d.id === domainId);
    const category = domain?.categories.find((c) => c.id === categoryId);
    const subCategory = category?.subCategories.find((sc) => sc.id === subCategoryId);
    if (!subCategory) return { answered: 0, total: 0 };
    const total = subCategory.questions.length;
    const answered = subCategory.questions.filter(
      (q) => store.getAnswer(q.id) !== undefined
    ).length;
    return { answered, total };
  };

  const jumpToSubCategory = (
    domainId: string,
    categoryId: string,
    subCategoryId: string
  ) => store.jumpTo(domainId, categoryId, subCategoryId, 1);

  // Check if we are on the very last page of the entire assessment
  const isLastPage = (() => {
    const totalPages = store.totalPagesInSubCategory();
    const isLastPageInSub = store.progress().currentPage === totalPages;
    const d = store.getCurrentDomain();
    const c = store.getCurrentCategory();
    const s = store.getCurrentSubCategory();
    if (!d || !c || !s) return false;
    const domains = assessmentData.domains;
    const categories = d.categories;
    const subCategories = c.subCategories;
    const isLastDom = d.id === domains[domains.length - 1]?.id;
    const isLastCat = c.id === categories[categories.length - 1]?.id;
    const isLastSub = s.id === subCategories[subCategories.length - 1]?.id;
    return isLastDom && isLastCat && isLastSub && isLastPageInSub;
  })();

  const canGoPrevious = (() => {
    const isFirstDomain = assessmentData.domains[0]?.id === store.progress().currentDomainId;
    const domain = store.getCurrentDomain();
    const isFirstCategory = domain?.categories[0]?.id === store.progress().currentCategoryId;
    const category = store.getCurrentCategory();
    const isFirstSubCategory = category?.subCategories[0]?.id === store.progress().currentSubCategoryId;
    const isFirstPage = store.progress().currentPage === 1;
    if (!domain || !category) return true;
    return !(isFirstDomain && isFirstCategory && isFirstSubCategory && isFirstPage);
  })();

  const canGoNext = !isLastPage;

  /** Save all answers to the appropriate jawaban-{domain} endpoints */
  const handleSaveAction = async () => {
    if (isSaving) return;
    setIsSaving(true);
    const allAnswered = store.answeredQuestions() === store.totalQuestions();
    const profile = store.respondentProfile();
    const existingId = store.existingIkasId;

    try {
      const answersMap = store.answers();

      // Group answers by domain and call saveJawaban for each
      const savePromises = Object.values(answersMap).map(async (ans) => {
        const qid = ans.questionId; // format: "identifikasi-3" | "proteksi-7" etc.
        const parts = qid.split('-');
        const domainSlug = parts[0] as DomainSlug;
        const pertanyaanId = parseInt(parts[1], 10);

        if (!pertanyaanId || isNaN(pertanyaanId)) return;

        const existingJawabanId = jawabanIdMap[qid] ?? null;

        await ikasService.saveJawaban(domainSlug, existingJawabanId, {
          pertanyaan_id: pertanyaanId,
          jawaban: ans.index,
        });
      });

      await Promise.all(savePromises);

      store.completeAssessment();
      toast({
        title: 'Berhasil',
        description: allAnswered
          ? existingId ? 'Data assessment berhasil diperbarui' : 'Assessment berhasil disimpan'
          : 'Data berhasil disimpan sementara',
        variant: 'default',
      });
      setTimeout(() => onBack(), 1500);
    } catch (err: any) {
      const msg = err?.message || 'Gagal menyimpan data ke server';
      toast({ title: 'Gagal Menyimpan', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditData = () => {
    store.unlockAssessment();
    toast({ title: 'Info', description: 'Mode edit aktif. Silakan ubah data.' });
  };

  const allQuestionsAnswered = store.answeredQuestions() === store.totalQuestions();

  // Build missing questions list for the last page warning
  let missingQuestionsList: Array<{ domain: string; category: string; sub: string; qNum: number }> = [];
  if (isLastPage && !allQuestionsAnswered) {
    let globalQNum = 1;
    assessmentData.domains.forEach((d: any) => {
      d.categories.forEach((c: any) => {
        c.subCategories.forEach((s: any) => {
          s.questions.forEach((q: any) => {
            if (store.getAnswer(q.id) === undefined) {
              missingQuestionsList.push({ domain: d.name, category: c.name, sub: s.name, qNum: globalQNum });
            }
            globalQNum++;
          });
        });
      });
    });
  }

  const breadcrumbPath = store.getBreadcrumbPath();
  const currentPageQuestions = store.getCurrentPageQuestions();

  // Show loading state if no assessment structure loaded yet
  if (assessmentData.domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
        <i className="ri-loader-4-line text-4xl animate-spin" />
        <p className="text-sm font-medium">Memuat struktur pertanyaan dari server...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 font-sans">
      {/* Sticky Progress Row */}
      <div className="sticky top-20 z-50 -mt-2 pb-5 mb-4">
        <div className="w-full">
          <ProgressBar
            answered={store.answeredQuestions()}
            total={store.totalQuestions()}
            currentPage={store.progress().currentPage}
            totalPages={store.totalPagesInSubCategory()}
            title="IKAS"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'md:w-16' : 'md:w-1/4'} transition-all duration-300 flex-shrink-0`}>
          <div className="sticky top-[100px] max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar pb-8">
            <div className="flex justify-between items-center mb-6 px-2">
              {!sidebarCollapsed && (
                <h6 className="m-0 font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide uppercase">
                  Assessment
                </h6>
              )}
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand' : 'Collapse'}
              >
                <i className={sidebarCollapsed ? 'ri-menu-unfold-line text-lg' : 'ri-menu-fold-line text-lg'} />
              </button>
            </div>

            {/* Save Action Block */}
            {!sidebarCollapsed && (
              <div className="mb-8 px-2">
                {!embedded ? (
                  !store.isLocked() ? (
                    <button
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${allQuestionsAnswered
                        ? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                      }`}
                      onClick={handleSaveAction}
                      disabled={isSaving}
                    >
                      {isSaving ? <i className="ri-loader-4-line animate-spin text-lg" /> : <i className="ri-save-line text-lg" />}
                      {isSaving ? 'Menyimpan...' : allQuestionsAnswered ? 'Submit Assessment' : 'Save Draft'}
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      onClick={handleEditData}
                    >
                      <i className="ri-edit-line text-lg" />
                      Edit Responses
                    </button>
                  )
                ) : (
                  !store.isLocked() ? (
                    <>
                      <button
                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mb-3 ${allQuestionsAnswered
                          ? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                        }`}
                        onClick={handleSaveAction}
                        disabled={isSaving}
                      >
                        {isSaving ? <i className="ri-loader-4-line animate-spin text-lg" /> : <i className="ri-save-line text-lg" />}
                        {isSaving ? 'Menyimpan...' : allQuestionsAnswered ? 'Submit Assessment' : 'Save Draft'}
                      </button>
                      {allQuestionsAnswered && (
                        <button
                          className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                          onClick={onEdit}
                        >
                          <i className="ri-edit-line text-lg" />
                          Edit Data
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                      onClick={handleEditData}
                    >
                      <i className="ri-edit-line text-lg" />
                      Edit Data
                    </button>
                  )
                )}

                {!store.isLocked() && !embedded && (
                  <div className="text-center mt-3">
                    {!allQuestionsAnswered ? (
                      <small className="text-slate-400 font-medium text-xs">
                        {store.answeredQuestions()} / {store.totalQuestions()} Answered
                      </small>
                    ) : (
                      <small className="text-emerald-500 font-bold text-xs flex items-center justify-center gap-1">
                        <i className="ri-checkbox-circle-fill" /> Ready to Submit
                      </small>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Accordion List */}
            {!sidebarCollapsed && (
              <div className="flex flex-col gap-2 px-2">
                {assessmentData.domains.map((domain) => (
                  <div key={domain.id} className="mb-2">
                    <button
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center transition-all ${isCurrentDomain(domain.id) ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      onClick={() => {
                        if (!isCurrentDomain(domain.id)) {
                          jumpToSubCategory(domain.id, domain.categories[0]?.id, domain.categories[0]?.subCategories[0]?.id);
                        }
                      }}
                    >
                      <span className={`font-bold text-sm truncate flex-1 ${isCurrentDomain(domain.id) ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {domain.name}
                      </span>
                    </button>

                    {/* Accordion Body */}
                    <div className={`overflow-hidden transition-all duration-300 ${isCurrentDomain(domain.id) ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                      <div className="pl-3 border-l-2 border-slate-100 dark:border-slate-800 ml-3 flex flex-col gap-4">
                        {domain.categories.map((category) => (
                          <div key={category.id} className="flex flex-col gap-1.5">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                              {category.name}
                            </div>
                            {category.subCategories.map((subCategory) => {
                              const isActive = isCurrentSubCategory(domain.id, category.id, subCategory.id);
                              const progress = getSubCategoryProgress(domain.id, category.id, subCategory.id);
                              const isSubCompleted = progress.answered === progress.total && progress.total > 0;
                              return (
                                <button
                                  key={subCategory.id}
                                  onClick={() => jumpToSubCategory(domain.id, category.id, subCategory.id)}
                                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all flex justify-between items-center group ${isActive
                                    ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                                  }`}
                                >
                                  <span className={`truncate mr-2 ${isActive ? 'text-slate-900 dark:text-white' : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
                                    {subCategory.name}
                                  </span>
                                  {isSubCompleted ? (
                                    <i className="ri-check-line text-emerald-500 font-bold" />
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                      {progress.answered}/{progress.total}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className={`${sidebarCollapsed ? 'md:w-11/12' : 'md:w-3/4'} transition-all duration-300 mt-0 sm:mt-8`}>
          <div className="w-full mx-auto">
            {/* Back button */}
            <div className="flex justify-end mb-8">
              <button
                onClick={onBack}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-semibold flex items-center transition-colors px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Kembali ke Ringkasan IKAS"
              >
                <i className="ri-arrow-left-line mr-2" />
                Back to Summary
              </button>
            </div>

            <div className="px-2 sm:px-8 pb-16">
              {/* Locked State Message */}
              {store.isLocked() && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-xl p-4 mb-8 flex items-start shadow-sm mx-auto">
                  <i className="ri-lock-2-line text-2xl mr-4 mt-1 text-yellow-500" />
                  <div>
                    <h6 className="font-bold text-base mb-1">Assessment Selesai</h6>
                    <p className="text-sm m-0 opacity-90 leading-relaxed">
                      Data ini telah dikunci. Anda dapat mengubah kembali dengan menekan tombol "Edit Responses" pada sidebar.
                    </p>
                  </div>
                </div>
              )}

              {/* Questions */}
              {currentPageQuestions.length > 0 ? (
                <div className="space-y-6 mb-8">
                  {currentPageQuestions.map((question: any, index: number) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      questionNumber={(store.progress().currentPage - 1) * 5 + index + 1}
                      selectedIndex={store.getAnswer(question.id)?.index}
                      readOnly={store.isLocked()}
                      onAnswer={(questionId, val) => store.saveAnswer(questionId, val)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border mb-8">
                  <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-file-list-2-line text-3xl" />
                  </div>
                  <h5 className="font-semibold text-foreground mb-2">Tidak ada pertanyaan</h5>
                  <p className="text-muted-foreground text-sm">Silakan pilih domain dan kategori dari sidebar.</p>
                </div>
              )}

              {/* Missing Questions Warning */}
              {isLastPage && !allQuestionsAnswered && missingQuestionsList.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 mb-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                      <i className="ri-error-warning-fill text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-red-800 font-bold text-base mb-1.5 mt-2">Assessment Belum Lengkap</h3>
                      <p className="text-red-700 text-sm mb-4">
                        Terdapat <span className="font-bold">{missingQuestionsList.length}</span> pertanyaan yang belum dijawab:
                      </p>
                      <div className="max-h-64 overflow-y-auto pr-2 rounded-lg bg-white/50 p-3 border border-red-100">
                        <ul className="space-y-2 text-sm text-red-700">
                          {missingQuestionsList.map((m, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="font-bold shrink-0 w-24">Soal {m.qNum}</span>
                              <span className="opacity-90">{m.domain} — {m.sub}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <PaginationControl
                currentPage={store.progress().currentPage}
                totalPages={store.totalPagesInSubCategory()}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                onPrevious={() => store.goToPreviousPage()}
                onNext={() => store.goToNextPage()}
                isSubmitStep={isLastPage && allQuestionsAnswered}
                onSubmitStep={handleSaveAction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
