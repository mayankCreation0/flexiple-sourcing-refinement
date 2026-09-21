'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import {
  MessageSquare,
  Bot,
  User,
  GitCommit,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { RefinementRecord } from '@/lib/types';
import { InfoTooltip } from '@/components/InfoTooltip';

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

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export const RefinementChat: React.FC<RefinementChatProps> = ({
  refinements,
  onRefine,
  isLoading,
  pendingReactions,
  isFrozen = false,
}) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isClient = useIsClient();
  const reactionsCount = Object.keys(pendingReactions).length;
  const lastRefinement = refinements[refinements.length - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && reactionsCount === 0) || isLoading || isFrozen) return;
    onRefine(input.trim());
    setInput('');
  };

  if (isFrozen || !isClient) return null;

  const panelContent = (
    <>
      <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-[#FF0000]/10 to-transparent border-b border-[#2A2A2A] shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#FF3333]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
                Refine Search
                <InfoTooltip text="Tell the AI what to change. It updates filters & rubric, then re-ranks." />
              </h2>
              <p className="text-[10px] sm:text-[11px] text-[#757575] mt-0.5">
                Feedback → AI adjusts → new results
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-[#1E1E1E] text-[#757575] hover:text-[#F5F5F5] transition cursor-pointer shrink-0"
            aria-label="Close refine panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {lastRefinement && (
          <div className="p-3 sm:p-4 rounded-lg bg-[#00C853]/5 border border-[#00C853]/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C853] shrink-0" />
              <span className="text-xs font-bold text-[#00C853] uppercase tracking-wide">
                Search Refined — Round {lastRefinement.round}
              </span>
            </div>
            <p className="text-xs text-[#B3B3B3] mb-2 line-clamp-3">
              {lastRefinement.explanation_of_changes}
            </p>
            {lastRefinement.changes_summary && (
              <div className="flex flex-wrap gap-1.5">
                {lastRefinement.changes_summary.filters_modified?.map((fm, i) => (
                  <span
                    key={`f-${i}`}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#1E1E1E] text-[#FF3333] border border-[#404040]"
                  >
                    ↗ {fm}
                  </span>
                ))}
                {lastRefinement.changes_summary.rubric_modified?.map((rm, i) => (
                  <span
                    key={`r-${i}`}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#1E1E1E] text-[#FFB300] border border-[#FFB300]/30"
                  >
                    ↗ {rm}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {refinements.length > 1 && (
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-xs text-[#757575] hover:text-[#B3B3B3] transition cursor-pointer"
          >
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showHistory ? 'Hide' : 'View'} history ({refinements.length})
          </button>
        )}

        {showHistory && refinements.length > 0 && (
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {refinements.map((rec) => (
              <div
                key={rec.round}
                className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 font-semibold text-[#FF3333]">
                    <GitCommit className="w-3 h-3" />
                    Cycle {rec.round}
                  </span>
                </div>
                <div className="flex gap-2">
                  <User className="w-3 h-3 text-[#757575] shrink-0 mt-0.5" />
                  <span className="text-[#B3B3B3] line-clamp-2">
                    {rec.recruiter_input || 'Reactions applied'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Bot className="w-3 h-3 text-[#FF3333] shrink-0 mt-0.5" />
                  <span className="text-[#B3B3B3] line-clamp-2">{rec.explanation_of_changes}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {reactionsCount > 0 && (
          <div className="flex items-center px-3 py-2 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/25 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF3333] shrink-0 mr-1.5" />
            <span className="text-[#FF3333] font-semibold">
              {reactionsCount} reaction{reactionsCount > 1 ? 's' : ''} queued
            </span>
          </div>
        )}

        <div>
          <span className="text-[11px] text-[#757575] font-medium block mb-2">Quick prompts</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(suggestion)}
                disabled={isLoading}
                className="px-2 py-1 rounded-lg text-[10px] sm:text-[11px] bg-[#1E1E1E] hover:bg-[#282828] text-[#B3B3B3] hover:text-[#F5F5F5] border border-[#404040] transition cursor-pointer disabled:opacity-50 text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative min-w-0">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder='e.g. "1 is too junior, 2 and 4 are right"'
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] text-sm focus:outline-none focus:border-[#FF0000] disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && reactionsCount === 0) || isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl text-sm font-bold bg-[#FF0000] hover:bg-[#CC0000] text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-[0.98] shrink-0"
          >
            {isLoading ? 'Refining…' : 'Refine'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );

  return createPortal(
    <>
      {/* Backdrop when panel open (mobile) */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close refine panel"
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Fixed bottom-right stack — portaled to body so parent transforms don't break position */}
      <div
        className="fixed z-[100] flex flex-col items-end gap-3 pointer-events-none"
        style={{
          bottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
          right: 'max(1rem, env(safe-area-inset-right, 0px))',
        }}
      >
        {/* Expanded panel — sits above the FAB */}
        {isOpen && (
          <div
            className="pointer-events-auto flex flex-col rounded-2xl border-2 border-[#FF0000]/30 bg-[#141414] shadow-2xl overflow-hidden animate-fade-in
              w-[min(420px,calc(100vw-2rem))] max-h-[min(70dvh,640px)]"
            role="dialog"
            aria-label="Refine search"
          >
            {panelContent}
          </div>
        )}

        {/* Always-visible FAB (Claude-style, bottom-right) */}
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Close refine search' : 'Open refine search'}
          aria-expanded={isOpen}
          className={`pointer-events-auto relative flex items-center justify-center gap-2 rounded-full shadow-xl transition-all active:scale-95 cursor-pointer border
            h-14 w-14 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5
            ${
              isOpen
                ? 'bg-[#1E1E1E] hover:bg-[#282828] text-[#F5F5F5] border-[#404040]'
                : 'bg-[#FF0000] hover:bg-[#CC0000] text-white border-[#FF3333]/50 shadow-black/50'
            }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-5 sm:h-5" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold hidden sm:inline">Refine</span>
            </>
          )}
          {!isOpen && reactionsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-[#00C853] text-[10px] font-bold flex items-center justify-center border-2 border-[#0A0A0A]">
              {reactionsCount}
            </span>
          )}
          {!isOpen && refinements.length > 0 && reactionsCount === 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00C853] border-2 border-[#0A0A0A]" />
          )}
        </button>
      </div>
    </>,
    document.body
  );
};
