'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchHero } from '@/components/SearchHero';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { FilterRubricDrawer } from '@/components/FilterRubricDrawer';
import { CandidateCard } from '@/components/CandidateCard';
import { RefinementChat } from '@/components/RefinementChat';
import { FrozenShortlist } from '@/components/FrozenShortlist';
import { ErrorBanner } from '@/components/ErrorBanner';
import {
  FeedbackItem,
  ObjectiveFilters,
  RefinementRecord,
  ScoredCandidate,
  SubjectiveRubric,
} from '@/lib/types';
import { Bug, Sparkles, Users } from 'lucide-react';

export default function Home() {
  // State definitions
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search Session Data
  const [filters, setFilters] = useState<ObjectiveFilters | null>(null);
  const [rubric, setRubric] = useState<SubjectiveRubric | null>(null);
  const [candidates, setCandidates] = useState<ScoredCandidate[]>([]);
  const [refinements, setRefinements] = useState<RefinementRecord[]>([]);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [reactions, setReactions] = useState<Record<string, 'yes' | 'no'>>({});
  const [modifiedFilterKeys, setModifiedFilterKeys] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

  // 1. Initial Search Submission
  const handleInitialSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);
    setReactions({});
    setRefinements([]);
    setIsFrozen(false);
    setModifiedFilterKeys([]);
    setLastAction('initial_search');

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze requirements.');
      }

      setFilters(data.filters);
      setRubric(data.rubric);
      setCandidates(data.candidates || []);
    } catch (err: any) {
      setError(err?.message || 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Refinement Submission (Chat + Per-profile feedback)
  const handleRefine = async (recruiterMessage: string) => {
    if (!filters || !rubric) return;

    setIsRefining(true);
    setError(null);
    setLastAction('refine');

    // Convert reactions object into array
    const perProfileFeedback: FeedbackItem[] = Object.entries(reactions).map(
      ([candidate_id, rating]) => ({
        candidate_id,
        rating,
      })
    );

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_filters: filters,
          current_rubric: rubric,
          presented_candidates: candidates,
          recruiter_message: recruiterMessage,
          per_profile_feedback: perProfileFeedback,
          round: refinements.length + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to refine search.');
      }

      setFilters(data.filters);
      setRubric(data.rubric);
      setCandidates(data.candidates || []);
      if (data.refinement_record) {
        setRefinements((prev) => [...prev, data.refinement_record]);
        setModifiedFilterKeys(
          data.refinement_record.changes_summary?.filters_modified || ['filters']
        );
      }
      // Reset reactions after applying them
      setReactions({});
    } catch (err: any) {
      setError(err?.message || 'Refinement failed.');
    } finally {
      setIsRefining(false);
    }
  };

  // 3. Direct Edit of Filters / Rubric
  const handleUpdateCriteria = async (
    updatedFilters: ObjectiveFilters,
    updatedRubric: SubjectiveRubric
  ) => {
    setFilters(updatedFilters);
    setRubric(updatedRubric);
    setIsRefining(true);
    setError(null);
    setLastAction('rerank');

    try {
      const res = await fetch('/api/rerank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters: updatedFilters,
          rubric: updatedRubric,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to re-rank candidates.');
      }

      setCandidates(data.candidates || []);
    } catch (err: any) {
      setError(err?.message || 'Re-ranking failed.');
    } finally {
      setIsRefining(false);
    }
  };

  // 4. Per-profile candidate reaction toggler
  const handleCandidateReaction = (candidateId: string, rating: 'yes' | 'no') => {
    setReactions((prev) => {
      const current = prev[candidateId];
      if (current === rating) {
        // Toggle off if clicked again
        const copy = { ...prev };
        delete copy[candidateId];
        return copy;
      }
      return { ...prev, [candidateId]: rating };
    });
  };

  // 5. Reset Search
  const handleReset = () => {
    setQuery('');
    setFilters(null);
    setRubric(null);
    setCandidates([]);
    setRefinements([]);
    setIsFrozen(false);
    setReactions({});
    setError(null);
  };

  // 6. Demonstrate failure recovery for Loom video walkthrough requirement
  const handleSimulateFailure = () => {
    setError(
      'Rate limit exceeded (429: RESOURCE_EXHAUSTED). The Gemini API free tier quota was briefly exceeded. You can retry with exponential backoff.'
    );
  };

  const hasResults = filters !== null && rubric !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        isFrozen={isFrozen}
        onFreezeToggle={() => setIsFrozen(!isFrozen)}
        onResetSearch={handleReset}
        candidateCount={candidates.length}
        currentRound={refinements.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {error && (
          <ErrorBanner
            error={error}
            onRetry={() => {
              setError(null);
              if (lastAction === 'initial_search' && query) {
                handleInitialSearch(query);
              } else if (lastAction === 'refine') {
                handleRefine('Retry previous refinement');
              } else if (filters && rubric) {
                handleUpdateCriteria(filters, rubric);
              }
            }}
            onDismiss={() => setError(null)}
          />
        )}

        {/* State 1: Initial Empty / Search Landing View */}
        {!hasResults && !isLoading && (
          <SearchHero onSearch={handleInitialSearch} isLoading={isLoading} />
        )}

        {/* State 2: Initial Loading Thinking Indicator */}
        {isLoading && (
          <ThinkingIndicator message="Processing requirement through Gemini LLM..." />
        )}

        {/* State 3: Active Results & Sourcing Refinement Loop */}
        {hasResults && !isFrozen && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Query Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-900/60">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Active Search Goal
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-200 line-clamp-1">
                    "{query}"
                  </p>
                </div>
              </div>

              {/* Loom Simulation Shortcut */}
              <button
                type="button"
                onClick={handleSimulateFailure}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer self-start sm:self-auto"
                title="Trigger a simulated 429 rate limit to demo graceful recovery on Loom"
              >
                <Bug className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Loom Failure Demo</span>
              </button>
            </div>

            {/* 2-Column Split Screen: Left = Filters & Rubric, Right = Candidates & Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Filter & Rubric Drawer (4 cols on lg) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <FilterRubricDrawer
                  filters={filters}
                  rubric={rubric}
                  onUpdateCriteria={handleUpdateCriteria}
                  isUpdating={isRefining}
                  modifiedFilters={modifiedFilterKeys}
                  isFrozen={isFrozen}
                />
              </div>

              {/* Right Column: Candidates List + Refinement Chat (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Refinement in-progress indicator */}
                {isRefining && (
                  <ThinkingIndicator
                    isRefining={true}
                    message="Evaluating feedback and updating candidate scores..."
                  />
                )}

                {/* Candidate Cards List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                        Top Ranked Candidates ({candidates.length})
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400">
                      Ranked by Rubric Fit & Field Citations
                    </span>
                  </div>

                  {candidates.length > 0 ? (
                    candidates.map((candidate, index) => (
                      <CandidateCard
                        key={candidate.profile.id}
                        candidate={candidate}
                        index={index}
                        reaction={reactions[candidate.profile.id]}
                        onReaction={handleCandidateReaction}
                        isFrozen={isFrozen}
                      />
                    ))
                  ) : (
                    <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
                      <p className="text-sm text-slate-400">
                        No candidate profiles matched the current filters.
                      </p>
                      <button
                        onClick={() => {
                          if (filters && rubric) {
                            handleUpdateCriteria(
                              {
                                ...filters,
                                min_years_experience: null,
                                max_years_experience: null,
                                company_types: [],
                              },
                              rubric
                            );
                          }
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                      >
                        Loosen Strict Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Conversational Refinement Chat */}
                <RefinementChat
                  refinements={refinements}
                  onRefine={handleRefine}
                  isLoading={isRefining}
                  pendingReactions={reactions}
                  isFrozen={isFrozen}
                />
              </div>
            </div>
          </div>
        )}

        {/* State 4: Frozen Search Shortlist Summary */}
        {hasResults && isFrozen && (
          <FrozenShortlist
            candidates={candidates}
            filters={filters}
            rubric={rubric}
            onUnfreeze={() => setIsFrozen(false)}
            refinementRounds={refinements.length}
          />
        )}
      </main>
    </div>
  );
}
