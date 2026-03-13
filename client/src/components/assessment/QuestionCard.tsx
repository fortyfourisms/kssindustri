import React from 'react';
import type { Question } from '@/types/assessment.types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  selectedIndex?: number;
  readOnly?: boolean;
  onAnswer: (questionId: string, index: number) => void;
}
const indexOptions = [0, 1, 2, 3, 4, 5];
export default function QuestionCard({
  question,
  questionNumber,
  selectedIndex,
  readOnly = false,
  onAnswer,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | undefined>(selectedIndex);

  React.useEffect(() => {
    setSelectedAnswer(selectedIndex);
  }, [selectedIndex]);

  const handleSelectIndex = (index: number) => {
    if (readOnly) return;
    setSelectedAnswer(index);
    onAnswer(question.id, index);
  };

  const selectedDescription = selectedAnswer !== undefined ? question.indexDescriptions[selectedAnswer] : null;

  const getEmojiForIndex = (index: number) => {
    switch (index) {
      case -1: return '🚫'; // Not Applicable
      case 0: return '😞';
      case 1: return '🙁';
      case 2: return '😐';
      case 3: return '🙂';
      case 4: return '😄';
      case 5: return '🤩';
      default: return '❓';
    }
  };

  const getLabelForIndex = (index: number) => {
    if (index === -1) return 'Not Applicable';
    return String(index);
  };

  return (
    <div className="w-full mx-auto rounded-xl overflow-hidden mt-6 mb-8 bg-transparent">
      <div className="p-2 sm:p-5">
        {/* Question Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-lg font-medium">Question {questionNumber}</span>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-100 m-0">{question.text}</h2>
        </div>

        {/* Index Options */}
        <div className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6 w-full mb-6">
            {indexOptions.filter(idx => idx === 0 || (question.indexDescriptions && question.indexDescriptions[idx])).map((index) => {
              const isActive = selectedAnswer === index;
              return (
                <button
                  key={index}
                  type="button"
                  disabled={readOnly}
                  onClick={() => handleSelectIndex(index)}
                  className={`relative flex flex-col items-center justify-center w-full p-4 sm:p-6 rounded-2xl transition-all
                    ${isActive
                      ? 'bg-[#FEF6E7] dark:bg-orange-900/20 border-2 border-orange-500 shadow-md transform scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                    }
                    ${readOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-4xl mb-3">{getEmojiForIndex(index)}</span>
                  <span className={`text-sm font-bold ${isActive ? 'text-orange-800 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {getLabelForIndex(index)}
                  </span>

                  {/* Active Checkmark Badge */}
                  {isActive && (
                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-7 h-7 flex items-center justify-center rounded-full border-[3px] border-white dark:border-slate-900 shadow-sm">
                      <i className="ri-check-line font-bold"></i>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Not Applicable Option */}
          <div className="flex justify-center w-full">
            {(() => {
              const index = -1;
              const isActive = selectedAnswer === index;
              return (
                <button
                  type="button"
                  disabled={readOnly}
                  onClick={() => handleSelectIndex(index)}
                  className={`relative flex items-center justify-center gap-4 w-full px-8 py-4 rounded-2xl transition-all
                    ${isActive
                      ? 'bg-[#FEF6E7] dark:bg-orange-900/20 border-2 border-orange-500 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                    }
                    ${readOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="text-2xl">{getEmojiForIndex(index)}</span>
                  <span className={`text-sm font-bold ${isActive ? 'text-orange-800 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {getLabelForIndex(index)}
                  </span>

                  {/* Active Checkmark Badge */}
                  {isActive && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                      <i className="ri-check-line font-bold text-xs"></i>
                    </div>
                  )}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Description Display */}
        {selectedDescription ? (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-6 rounded-2xl shadow-sm">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white text-xs font-bold mb-3 uppercase tracking-wider shadow-sm">
                Indeks {getLabelForIndex(selectedAnswer!)}
              </span>
              <p className="m-0 text-emerald-900 dark:text-emerald-100 text-base leading-relaxed">
                {selectedDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-32"></div> // Spacer to keep height consistent when no answer is selected
        )}
      </div>
    </div>
  );
}
