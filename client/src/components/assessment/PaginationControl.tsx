import React from 'react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isSubmitStep?: boolean;
  onSubmitStep?: () => void;
}

export default function PaginationControl({
  currentPage,
  totalPages,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  isSubmitStep,
  onSubmitStep,
}: PaginationControlProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-5 border-t border-slate-100 mt-8">
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        className={`px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2
          ${
            canGoPrevious
              ? 'text-slate-600 hover:bg-slate-50'
              : 'opacity-0 pointer-events-none'
          }
        `}
        style={{ opacity: !canGoPrevious ? 0 : 1, pointerEvents: !canGoPrevious ? 'none' : 'auto' }}
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="hidden">
        {currentPage} / {totalPages}
      </div>

      <button
        type="button"
        disabled={isSubmitStep ? false : !canGoNext}
        onClick={isSubmitStep ? onSubmitStep : onNext}
        className={`px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2
          ${
            (isSubmitStep || canGoNext)
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-[1px]'
              : 'opacity-50 cursor-not-allowed bg-slate-400'
          }
        `}
      >
        {isSubmitStep ? 'Kirim' : 'Lanjut Berikutnya'}
        {!isSubmitStep && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}

import { ArrowLeft, ArrowRight } from "lucide-react";
