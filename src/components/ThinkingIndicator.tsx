import React, { useEffect, useState } from 'react';
import { Bot, CheckCircle2, Filter, Award, Cpu } from 'lucide-react';

interface ThinkingIndicatorProps {
  message?: string;
  isRefining?: boolean;
}

const SEARCH_STEPS = [
  { icon: Bot,    text: 'Extracting objective filters from requirements...' },
  { icon: Award,  text: 'Synthesizing subjective fit rubric and green flags...' },
  { icon: Filter, text: 'Scanning 48 candidate profiles against hard constraints...' },
  { icon: Cpu,    text: 'Scoring candidates with field-level evidence citations...' },
];

const REFINE_STEPS = [
  { icon: Bot,    text: 'Analyzing recruiter feedback and candidate reactions...' },
  { icon: Award,  text: 'Adjusting filters and recalibrating rubric weights...' },
  { icon: Filter, text: 'Re-filtering talent pool against revised parameters...' },
  { icon: Cpu,    text: 'Re-scoring top candidates and generating diff explanations...' },
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
    <div
      className="w-full max-w-xl mx-auto my-10 animate-slide-up"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(0,255,255,0.2)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(0,255,255,0.06)',
      }}
    >
      {/* Top glow line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, #00FFFF, transparent)',
          opacity: 0.5,
          animation: 'shimmer 2s linear infinite',
          backgroundSize: '200% 100%',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {/* Tribal mandala spinner */}
        <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" width="36" height="36" fill="none" aria-hidden="true">
            <polygon
              points="18,3 33,10.5 33,25.5 18,33 3,25.5 3,10.5"
              stroke="#00FFFF"
              strokeWidth="1"
              fill="rgba(0,255,255,0.05)"
              style={{ transformOrigin: '18px 18px', animation: 'tribal-spin 2s linear infinite' }}
            />
            <circle cx="18" cy="18" r="5" stroke="#00FFFF" strokeWidth="1" fill="rgba(0,255,255,0.15)" />
            <circle
              cx="18" cy="18" r="3"
              fill="#00FFFF"
              style={{ animation: 'pulse-glow 1s infinite alternate' }}
            />
          </svg>
        </div>

        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#00FFFF',
              textShadow: '0 0 10px rgba(0,255,255,0.5)',
            }}
          >
            {isRefining ? 'Refinement Loop Active' : 'AI Sourcing Pipeline'}
          </h3>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {message || 'Orchestrating Gemini LLM calls and profile evaluation...'}
          </p>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {steps.map((step, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;
          const IconComponent = step.icon;

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                transition: 'all 0.3s ease',
                opacity: isCurrent ? 1 : isDone ? 0.7 : 0.25,
                transform: isCurrent ? 'translateX(4px)' : 'none',
              }}
            >
              {isDone ? (
                <CheckCircle2 size={14} color="#29AB87" style={{ flexShrink: 0 }} />
              ) : isCurrent ? (
                <div
                  style={{
                    width: 14, height: 14,
                    borderRadius: '50%',
                    border: '2px solid #00FFFF',
                    borderTopColor: 'transparent',
                    flexShrink: 0,
                    animation: 'tribal-spin 0.7s linear infinite',
                  }}
                />
              ) : (
                <IconComponent size={14} color="rgba(0,255,255,0.25)" style={{ flexShrink: 0 }} />
              )}
              <span
                style={{
                  fontFamily: isCurrent ? 'var(--font-mono)' : 'var(--font-body)',
                  fontSize: '0.72rem',
                  color: isDone ? '#29AB87' : isCurrent ? '#00FFFF' : 'var(--text-muted)',
                  letterSpacing: isCurrent ? '0.03em' : 0,
                }}
              >
                {step.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
