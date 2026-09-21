import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  GitCommit,
  CheckCircle2,
} from 'lucide-react';
import { FeedbackItem, RefinementRecord } from '@/lib/types';

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
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Conversational Refinement Loop
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          {refinements.length} round{refinements.length !== 1 ? 's' : ''} completed
        </span>
      </div>

      {/* REFINEMENT HISTORY / AUDIT LOG */}
      {refinements.length > 0 && (
        <div className="space-y-4 mb-4 max-h-72 overflow-y-auto pr-1">
          {refinements.map((rec) => (
            <div
              key={rec.round}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 font-bold text-indigo-400">
                  <GitCommit className="w-3.5 h-3.5" />
                  <span>Round {rec.round} Refinement</span>
                </span>
                <span className="text-[10px] text-slate-500">{rec.timestamp}</span>
              </div>

              {/* Recruiter prompt */}
              <div className="flex items-start space-x-2 text-slate-300">
                <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3 h-3 text-slate-400" />
                </div>
                <div className="leading-snug">
                  <span className="font-semibold text-slate-200">Recruiter: </span>
                  <span>{rec.recruiter_input || 'Reactions applied to candidates'}</span>
                </div>
              </div>

              {/* AI Explanation of what changed and why */}
              <div className="flex items-start space-x-2 text-indigo-200 bg-indigo-950/30 p-2.5 rounded-lg border border-indigo-900/40">
                <div className="w-5 h-5 rounded-md bg-indigo-900/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="leading-snug space-y-1">
                  <span className="font-semibold text-indigo-300">AI Adjustment: </span>
                  <p className="text-slate-300">{rec.explanation_of_changes}</p>

                  {/* Summary badges */}
                  {rec.changes_summary && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {rec.changes_summary.filters_modified?.map((fm, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-800"
                        >
                          Filter: {fm}
                        </span>
                      ))}
                      {rec.changes_summary.rubric_modified?.map((rm, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800"
                        >
                          Rubric: {rm}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACTIVE INPUT / REACTION SECTION */}
      {!isFrozen ? (
        <div className="space-y-3">
          {/* Reaction status notice if buttons clicked */}
          {reactionsCount > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs">
              <span className="flex items-center text-indigo-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                {reactionsCount} profile reaction{reactionsCount > 1 ? 's' : ''} queued
              </span>
              <span className="text-[11px] text-slate-400">
                Submit with or without additional instructions
              </span>
            </div>
          )}

          {/* Quick Suggestions Chips */}
          <div>
            <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">
              Quick Refinement Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder='e.g. "1 is too junior, 2 and 4 are right" or "Only startup background"'
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={(!input.trim() && reactionsCount === 0) || isLoading}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/30 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer active:scale-95"
            >
              <span>Refine</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
          This sourcing search has been frozen. Unfreeze from the header to refine further.
        </div>
      )}
    </div>
  );
};
