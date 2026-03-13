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
    <div className="flex items-center justify-between pt-8 pb-4 bg-background mt-8">
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={onPrevious}
        className={`inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 border
          ${
            canGoPrevious
              ? 'bg-transparent text-foreground border-border hover:bg-muted hover:border-foreground/30'
              : 'opacity-0 pointer-events-none' // Hide instead of showing disabled if we want it super minimal, but let's keep it visible or 0 opacity. Actually, image shows it might just be hidden or faded. Let's make it faded. 'opacity-30 cursor-not-allowed bg-transparent text-foreground border-border'
          }
        `}
        style={{ opacity: !canGoPrevious ? 0 : 1, pointerEvents: !canGoPrevious ? 'none' : 'auto' }}
      >
        Previous
      </button>

      {/* The number indicator is mostly removed or moved to top bar in the new design. 
          But just in case we can hide it here since ProgressBar will show "3 of 15" */}
      <div className="hidden">
        {currentPage} / {totalPages}
      </div>

      <button
        type="button"
        disabled={isSubmitStep ? false : !canGoNext}
        onClick={isSubmitStep ? onSubmitStep : onNext}
        className={`inline-flex items-center justify-center px-8 py-3.5 rounded-2xl text-base font-semibold transition-all duration-200 border border-transparent
          ${
            (isSubmitStep || canGoNext)
              ? 'bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-md hover:shadow-lg hover:-translate-y-[1px]'
              : 'opacity-50 cursor-not-allowed bg-black text-white dark:bg-white dark:text-black'
          }
        `}
      >
        {isSubmitStep ? 'Submit' : 'Continue'}
      </button>
    </div>
  );
}
