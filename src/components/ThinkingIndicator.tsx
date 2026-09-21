import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Loader2, Sparkles, Filter, Award } from 'lucide-react';

interface ThinkingIndicatorProps {
  message?: string;
  isRefining?: boolean;
}

const SEARCH_STEPS = [
  { icon: Bot, text: 'Extracting structured objective filters from requirement...' },
  { icon: Award, text: 'Synthesizing subjective fit rubric & green flags...' },
  { icon: Filter, text: 'Screening 48 candidate profiles against hard constraints...' },
  { icon: Sparkles, text: 'Scoring candidates against rubric with field-level citations...' },
];

const REFINE_STEPS = [
  { icon: Bot, text: 'Analyzing recruiter feedback and candidate reactions...' },
  { icon: Award, text: 'Adjusting objective filters and weighting subjective rubric...' },
  { icon: Filter, text: 'Re-filtering talent pool against revised parameters...' },
  { icon: Sparkles, text: 'Re-scoring top candidates and generating diff explanations...' },
];

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  message,
  isRefining = false,
}) => {
  const steps = isRefining ? REFINE_STEPS : SEARCH_STEPS;
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full my-8 p-6 rounded-2xl bg-[#141414]/95 border border-[#404040] shadow-2xl backdrop-blur-xl animate-fade-in">
      <div className="flex items-center space-x-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-[#FF3333] animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {isRefining ? 'Refining Sourcing Strategy' : 'AI Sourcing Pipeline Running'}
          </h3>
          <p className="text-xs text-[#B3B3B3]">
            {message || 'Orchestrating Gemini LLM calls and profile evaluations'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;
          const IconComponent = step.icon;

          return (
            <div
              key={index}
              className={`flex items-center space-x-3 text-xs sm:text-sm transition-all duration-300 ${
                isCurrent
                  ? 'text-white font-medium pl-1'
                  : isDone
                  ? 'text-[#B3B3B3]'
                  : 'text-[#757575]'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-[#FF3333] animate-spin shrink-0" />
              ) : (
                <IconComponent className="w-4 h-4 text-[#4D4D4D] shrink-0" />
              )}
              <span>{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
