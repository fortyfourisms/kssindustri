import React from 'react';

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
  title,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-2.5">
        <span className="text-sm font-bold text-foreground">
          {title && <span className="mr-2 opacity-70 font-semibold">{title}</span>}
          Terjawab {answered} dari {total}
        </span>
        <span className="text-xs font-bold text-[#10B981]">
          {percentage}%
        </span>
      </div>

      {/* Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#10B981] transition-all duration-500 ease-out rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
