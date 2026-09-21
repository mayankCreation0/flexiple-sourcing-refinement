import React, { useState } from 'react';
import {
  Send,
  Bot,
  User,
  GitCommit,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { RefinementRecord } from '@/lib/types';

interface RefinementChatProps {
  refinements: RefinementRecord[];
  onRefine: (message: string) => void;
  isLoading: boolean;
  pendingReactions: Record<string, 'yes' | 'no'>;
  isFrozen?: boolean;
}

const QUICK_SUGGESTIONS = [
  '1 is too junior, 2 and 4 are right',
  'Require at least 5 years of experience',
  'Prioritize early-stage startup experience',
  'Must have strong AWS RDS and PostgreSQL',
];

export const RefinementChat: React.FC<RefinementChatProps> = ({
  refinements,
  onRefine,
  isLoading,
  pendingReactions,
  isFrozen = false,
}) => {
  const [input, setInput] = useState('');
  const reactionsCount = Object.keys(pendingReactions).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && reactionsCount === 0) || isLoading || isFrozen) return;
    onRefine(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className="cyber-card animate-slide-up"
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-cyan)',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="#00FFFF" />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
            }}
          >
            Refinement Console
          </h2>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--cyber-cyan)',
            opacity: 0.7,
            letterSpacing: '0.1em',
          }}
        >
          {refinements.length} ITERATION{refinements.length !== 1 ? 'S' : ''}
        </span>
      </div>

      {/* ── Refinement History / Audit Log ── */}
      {refinements.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            marginBottom: '1rem',
            maxHeight: 280,
            overflowY: 'auto',
            paddingRight: '0.25rem',
          }}
        >
          {refinements.map((rec) => (
            <div
              key={rec.round}
              className="holo-card"
              style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00FFFF', fontWeight: 600, fontSize: '0.75rem' }}>
                  <GitCommit size={14} />
                  <span>Cycle {rec.round} Sync</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                  {rec.timestamp}
                </span>
              </div>

              {/* Recruiter prompt */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem' }}>
                <div
                  style={{
                    width: 20, height: 20, borderRadius: '4px',
                    background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <User size={12} color="var(--text-secondary)" />
                </div>
                <div style={{ lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Operator: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{rec.recruiter_input || 'Reactions applied'}</span>
                </div>
              </div>

              {/* AI Explanation */}
              <div
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.15)',
                  borderRadius: 'var(--radius-sm)', padding: '0.5rem', fontSize: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: 20, height: 20, borderRadius: '4px',
                    background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}
                >
                  <Bot size={12} color="#00FFFF" />
                </div>
                <div style={{ lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#00FFFF' }}>System: </span>
                    <span style={{ color: 'var(--text-primary)' }}>{rec.explanation_of_changes}</span>
                  </div>

                  {/* Summary badges */}
                  {rec.changes_summary && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {rec.changes_summary.filters_modified?.map((fm, i) => (
                        <span key={i} className="pill-cyan">F: {fm}</span>
                      ))}
                      {rec.changes_summary.rubric_modified?.map((rm, i) => (
                        <span key={i} className="pill-magenta">R: {rm}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Active Input ── */}
      {!isFrozen ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Reaction status notice */}
          {reactionsCount > 0 && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.25)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#00FFFF', fontWeight: 600 }}>
                <CheckCircle2 size={12} />
                {reactionsCount} reaction{reactionsCount > 1 ? 's' : ''} queued
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                Submit with or without text
              </span>
            </div>
          )}

          {/* Quick Suggestions */}
          <div>
            <span
              style={{
                display: 'block', marginBottom: '0.4rem',
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em'
              }}
            >
              Quick Override:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  disabled={isLoading}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    color: 'var(--text-secondary)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.3rem 0.6rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.color = '#00FFFF';
                      e.currentTarget.style.borderColor = 'rgba(0,255,255,0.3)';
                      e.currentTarget.style.background = 'rgba(0,255,255,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
            {/* Scanline background for input */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.02) 2px, rgba(0,255,255,0.02) 4px)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder='> Input refinement params...'
              className="cyber-input"
              style={{ flex: 1, position: 'relative', zIndex: 1, fontFamily: 'var(--font-mono)' }}
            />
            <button
              type="submit"
              disabled={(!input.trim() && reactionsCount === 0) || isLoading}
              className="btn-cyber-solid"
              style={{
                position: 'relative', zIndex: 1, padding: '0 1.25rem',
                opacity: (!input.trim() && reactionsCount === 0) || isLoading ? 0.5 : 1,
                cursor: (!input.trim() && reactionsCount === 0) || isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                EXECUTE
                <Send size={12} />
              </span>
            </button>
          </form>
        </div>
      ) : (
        <div
          style={{
            padding: '0.75rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)',
            textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          [ SYSTEM FROZEN ] UNLOCK FROM HEADER TO RESUME REFINEMENT
        </div>
      )}
    </div>
  );
};
