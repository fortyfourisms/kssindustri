import React, { useState } from 'react';
import type { KseQuestion } from '@/data/kse-data';
import { CheckCircle2, Lightbulb, Star, Check } from 'lucide-react';

interface KseQuestionCardProps {
  question: KseQuestion;
  selectedOption?: 'A' | 'B' | 'C' | null;
  readonly?: boolean;
  onAnswer: (questionNo: string, optionKey: 'A' | 'B' | 'C', bobot: number) => void;
}

const optionColors: Record<string, { bg: string; border: string; selectedBg: string; badge: string; shadow: string }> = {
  A: {
    bg: 'from-red-400 to-red-500',
    border: 'hover:border-red-300 hover:shadow-red-100',
    selectedBg: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
    badge: 'bg-gradient-to-br from-red-400 to-red-500 shadow-red-400/30',
    shadow: 'shadow-red-200/50',
  },
  B: {
    bg: 'from-amber-400 to-amber-500',
    border: 'hover:border-amber-300 hover:shadow-amber-100',
    selectedBg: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200',
    badge: 'bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-400/30',
    shadow: 'shadow-amber-200/50',
  },
  C: {
    bg: 'from-emerald-400 to-emerald-500',
    border: 'hover:border-emerald-300 hover:shadow-emerald-100',
    selectedBg: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200',
    badge: 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-400/30',
    shadow: 'shadow-emerald-200/50',
  },
};

export default function KseQuestionCard({
  question,
  selectedOption,
  readonly = false,
  onAnswer,
}: KseQuestionCardProps) {
  const handleSelect = (key: 'A' | 'B' | 'C', bobot: number) => {
    if (readonly) return;
    onAnswer(question.no, key, bobot);
  };

  const isAnswered = selectedOption != null;

  return (
    <div
      className={`relative bg-white rounded-2xl border overflow-hidden transition-all duration-400 mb-5
        ${isAnswered
          ? 'border-emerald-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)]'
          : 'border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-4px_rgba(0,0,0,0.08)]'
        }
        hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_16px_40px_-8px_rgba(0,0,0,0.12)]
      `}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-500
          ${isAnswered
            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[2px_0_12px_rgba(46,204,113,0.3)]'
            : 'bg-slate-200'
          }
        `}
      />

      <div className="p-4 md:p-5 pl-5 md:pl-7">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-extrabold text-blue-800 bg-blue-800/[0.06] px-3.5 py-1.5 rounded-[10px] tracking-tight">
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {question.no}
            </span>
            {isAnswered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-600/[0.08] px-3 py-1.5 rounded-full tracking-wide animate-in fade-in slide-in-from-left-2 duration-300">
                <CheckCircle2 className="w-3 h-3" /> Terjawab
              </span>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-4 md:mb-5 pl-0.5">
          <h6 className="text-[1rem] md:text-[1.05rem] font-bold text-slate-800 leading-relaxed tracking-tight mb-4">
            {question.pertanyaan}
          </h6>

          {/* Insight Box */}
          <div className="relative bg-gradient-to-br from-slate-50/90 to-slate-100/40 backdrop-blur-xl border border-slate-200/80 p-4 rounded-[14px] overflow-hidden">
            <div className="flex gap-3 items-start relative z-10">
              <div className="w-[34px] h-[34px] min-w-[34px] rounded-[10px] bg-white flex items-center justify-center text-blue-500 shadow-sm border border-black/[0.04]">
                <Lightbulb className="w-[17px] h-[17px]" />
              </div>
              <div>
                <small className="block text-[10px] font-bold text-blue-500 uppercase tracking-[0.08em] mb-1 opacity-80">
                  Insight &amp; Konteks
                </small>
                <p className="text-[13px] text-slate-500 leading-relaxed m-0 whitespace-pre-line">
                  {question.dataDukung}
                </p>
              </div>
            </div>
            {/* Decorative gradient */}
            <div className="absolute -top-[60%] -right-[15%] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] rounded-full z-0 pointer-events-none" />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {(Object.entries(question.options) as [string, { label: string; bobot: number }][]).map(
            ([key, option], idx) => {
              const k = key as 'A' | 'B' | 'C';
              const isSelected = selectedOption === k;
              const isNotSelected = selectedOption != null && selectedOption !== k;
              const colors = optionColors[k];

              return (
                <button
                  key={k}
                  type="button"
                  disabled={readonly}
                  onClick={() => handleSelect(k, option.bobot)}
                  className={`
                    relative flex items-center w-full p-4 rounded-[14px] border-[1.5px] text-left
                    transition-all duration-300 ease-out overflow-hidden
                    ${readonly ? 'cursor-default' : 'cursor-pointer'}
                    ${isSelected
                      ? `${colors.selectedBg} shadow-md -translate-y-0.5`
                      : isNotSelected
                        ? 'bg-white border-black/[0.06] opacity-55 scale-[0.98] hover:opacity-80 hover:scale-[0.99]'
                        : `bg-white border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.02)] ${!readonly ? colors.border + ' hover:-translate-y-0.5' : ''}`
                    }
                    ${!readonly ? 'active:scale-[0.98] active:transition-[100ms]' : ''}
                  `}
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex flex-row items-center gap-3 w-full relative z-10">
                    {/* Key Badge */}
                    <div
                      className={`
                        w-[36px] h-[36px] md:w-[42px] md:h-[42px] flex items-center justify-center rounded-xl font-extrabold text-white text-[14px] md:text-[15px] shrink-0
                        transition-all duration-400 ease-out
                        ${colors.badge}
                        ${isSelected ? 'scale-110 rotate-[5deg] shadow-lg' : ''}
                      `}
                    >
                      {k}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0 pr-1">
                      <span className="font-semibold text-slate-700 text-[13px] md:text-[14px] tracking-tight leading-snug">
                        {option.label}
                      </span>
                    </div>

                    {/* Right side indicators */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                      {/* Bobot */}
                      <span className="inline-flex items-center gap-1 text-[10px] md:text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {option.bobot}
                      </span>

                      {/* Check Circle */}
                      {isSelected && (
                        <div
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-white shrink-0 animate-in zoom-in-50 duration-300
                            ${k === 'A' ? 'bg-red-500' : k === 'B' ? 'bg-amber-500' : 'bg-emerald-500'}
                          `}
                        >
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
