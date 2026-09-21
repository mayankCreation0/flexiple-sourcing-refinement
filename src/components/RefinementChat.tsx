'use client';

import React, { useState } from 'react';
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

export const RefinementChat: React.FC<RefinementChatProps> = ({
  refinements,
  onRefine,
  isLoading,
  pendingReactions,
  isFrozen = false,
}) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(true);
  const reactionsCount = Object.keys(pendingReactions).length;
  const lastRefinement = refinements[refinements.length - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && reactionsCount === 0) || isLoading || isFrozen) return;
    onRefine(input.trim());
    setInput('');
  };

  if (isFrozen) {
    return (
      <div className="p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] text-center text-sm text-[#757575]">
        Search is frozen. Unfreeze from the header to refine further.
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-[#FF0000]/30 bg-[#141414] shadow-lg overflow-hidden">
      {/* Prominent header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#FF0000]/10 to-transparent border-b border-[#2A2A2A]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#FF3333]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
                Refine Search
                <InfoTooltip text="Tell the AI what to change — e.g. which candidates fit, adjust experience, or prioritize startup background. It updates filters & rubric, then re-ranks." />
              </h2>
              <p className="text-[11px] text-[#757575] mt-0.5">
                Feedback → AI adjusts filters & rubric → new ranked results
              </p>
            </div>
          </div>
          {refinements.length > 0 && (
            <span className="text-xs text-[#FF3333] font-medium whitespace-nowrap">
              {refinements.length} refinement{refinements.length !== 1 ? 's' : ''} done
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Latest refinement highlight */}
        {lastRefinement && (
          <div className="p-4 rounded-lg bg-[#00C853]/5 border border-[#00C853]/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#00C853]" />
              <span className="text-xs font-bold text-[#00C853] uppercase tracking-wide">
                Search Refined — Round {lastRefinement.round}
              </span>
            </div>
            <p className="text-xs text-[#B3B3B3] mb-2">{lastRefinement.explanation_of_changes}</p>
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

        {/* History toggle */}
        {refinements.length > 1 && (
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1 text-xs text-[#757575] hover:text-[#B3B3B3] transition"
          >
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showHistory ? 'Hide' : 'View'} refinement history ({refinements.length})
          </button>
        )}

        {showHistory && refinements.length > 0 && (
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {refinements.map((rec) => (
              <div
                key={rec.round}
                className="p-3 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-[#FF3333]">
                    <GitCommit className="w-3.5 h-3.5" />
                    Cycle {rec.round}
                  </span>
                  <span className="text-[10px] text-[#757575]">{rec.timestamp}</span>
                </div>
                <div className="flex gap-2">
                  <User className="w-3.5 h-3.5 text-[#757575] shrink-0 mt-0.5" />
                  <span className="text-[#B3B3B3]">
                    <strong className="text-[#F5F5F5]">You: </strong>
                    {rec.recruiter_input || 'Candidate reactions applied'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Bot className="w-3.5 h-3.5 text-[#FF3333] shrink-0 mt-0.5" />
                  <span className="text-[#B3B3B3]">{rec.explanation_of_changes}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Queued reactions */}
        {reactionsCount > 0 && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/25 text-xs">
            <span className="flex items-center gap-1.5 text-[#FF3333] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {reactionsCount} reaction{reactionsCount > 1 ? 's' : ''} queued — ready to refine
            </span>
          </div>
        )}

        {/* Quick prompts */}
        <div>
          <span className="text-[11px] text-[#757575] font-medium block mb-2">Quick prompts</span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(suggestion)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-[#1E1E1E] hover:bg-[#282828] text-[#B3B3B3] hover:text-[#F5F5F5] border border-[#404040] transition cursor-pointer disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757575]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder='e.g. "1 is too junior, 2 and 4 are right"'
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] text-[#F5F5F5] text-sm focus:outline-none focus:border-[#FF0000] disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={(!input.trim() && reactionsCount === 0) || isLoading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-[#FF0000] hover:bg-[#CC0000] text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-[0.98] shrink-0"
          >
            {isLoading ? 'Refining…' : 'Refine'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
