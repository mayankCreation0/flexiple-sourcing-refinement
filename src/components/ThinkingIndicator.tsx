import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Loader2, Sparkles, Filter, Award } from 'lucide-react';

interface ThinkingIndicatorProps {
  message?: string;
  isRefining?: boolean;
  compact?: boolean;
}

const SEARCH_STEPS = [
  { icon: Bot, text: 'Extracting objective filters…' },
  { icon: Award, text: 'Synthesizing fit rubric…' },
  { icon: Filter, text: 'Screening 48 profiles…' },
  { icon: Sparkles, text: 'Scoring with field citations…' },
];

const REFINE_STEPS = [
  { icon: Bot, text: 'Analyzing your feedback…' },
  { icon: Award, text: 'Adjusting filters & rubric…' },
  { icon: Filter, text: 'Re-filtering talent pool…' },
  { icon: Sparkles, text: 'Re-ranking candidates…' },
];

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  message,
  isRefining = false,
  compact = false,
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
    <div
      className={`w-full max-w-md mx-auto rounded-2xl bg-[#141414]/95 border border-[#404040] shadow-2xl backdrop-blur-xl animate-fade-in ${
        compact ? 'p-4' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-[#FF0000]/20 border border-[#FF0000]/30 flex items-center justify-center shrink-0">
          <Loader2 className="w-5 h-5 text-[#FF3333] animate-spin" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">
            {isRefining ? 'Refining Strategy' : 'AI Pipeline Running'}
          </h3>
          <p className="text-xs text-[#B3B3B3] line-clamp-2">
            {message || 'Orchestrating Gemini LLM calls…'}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;
          const IconComponent = step.icon;

          return (
            <div
              key={index}
              className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                isCurrent
                  ? 'text-white font-medium'
                  : isDone
                  ? 'text-[#B3B3B3]'
                  : 'text-[#757575]'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00C853] shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-[#FF3333] animate-spin shrink-0" />
              ) : (
                <IconComponent className="w-3.5 h-3.5 text-[#4D4D4D] shrink-0" />
              )}
              <span className="leading-snug">{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Centered wrapper for loading states */
export const ThinkingIndicatorCentered: React.FC<ThinkingIndicatorProps> = (props) => (
  <div className="flex justify-center items-center min-h-[40vh] px-4 py-8">
    <ThinkingIndicator key={props.isRefining ? 'refine' : 'search'} {...props} />
  </div>
);

/** Fixed overlay while refining during an active session */
export const ThinkingIndicatorOverlay: React.FC<ThinkingIndicatorProps> = (props) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <ThinkingIndicator key="refine-overlay" {...props} compact />
  </div>
);
