import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  answered: number;
  total: number;
  currentPage: number;
  totalPages: number;
  title?: string;
}

export default function ProgressBar({
  answered,
  total,
  currentPage,
  totalPages,
  title = 'Assessment',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="w-full bg-background pt-4 pb-2 mb-8">
      {/* Header */}
      <div className="flex justify-start mb-2">
        <span className="text-sm font-bold text-foreground">
          {currentPage} of {totalPages}
        </span>
      </div>

      {/* Segments */}
      <div className="flex gap-2 w-full h-1.5">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const isCompleted = idx < currentPage; // or idx < answered if we want progress by answered questions, but image says 3 of 15 implies page progress
          return (
            <div
              key={idx}
              className={`flex-1 rounded-full transition-colors duration-300 ${
                isCompleted ? 'bg-[#10B981]' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
