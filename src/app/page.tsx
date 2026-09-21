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
import { InfoTooltip } from '@/components/InfoTooltip';
import {
  FeedbackItem,
  ObjectiveFilters,
  RefinementRecord,
  ScoredCandidate,
  SubjectiveRubric,
} from '@/lib/types';
import { Bug, Sparkles, Users } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ObjectiveFilters | null>(null);
  const [rubric, setRubric] = useState<SubjectiveRubric | null>(null);
  const [candidates, setCandidates] = useState<ScoredCandidate[]>([]);
  const [refinements, setRefinements] = useState<RefinementRecord[]>([]);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [reactions, setReactions] = useState<Record<string, 'yes' | 'no'>>({});
  const [modifiedFilterKeys, setModifiedFilterKeys] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

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
      if (!res.ok) throw new Error(data.error || 'Failed to analyze requirements.');
      setFilters(data.filters);
      setRubric(data.rubric);
      setCandidates(data.candidates || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during search.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (recruiterMessage: string) => {
    if (!filters || !rubric) return;
    setIsRefining(true);
    setError(null);
    setLastAction('refine');

    const perProfileFeedback: FeedbackItem[] = Object.entries(reactions).map(
      ([candidate_id, rating]) => ({ candidate_id, rating })
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
      if (!res.ok) throw new Error(data.error || 'Failed to refine search.');
      setFilters(data.filters);
      setRubric(data.rubric);
      setCandidates(data.candidates || []);
      if (data.refinement_record) {
        setRefinements((prev) => [...prev, data.refinement_record]);
        const fm = data.refinement_record.changes_summary?.filters_modified || [];
        const rm = data.refinement_record.changes_summary?.rubric_modified || [];
        setModifiedFilterKeys([...fm, ...(rm.length ? ['rubric'] : []), ...(fm.length ? ['filters'] : [])]);
      }
      setReactions({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Refinement failed.');
    } finally {
      setIsRefining(false);
    }
  };

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
        body: JSON.stringify({ filters: updatedFilters, rubric: updatedRubric }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to re-rank candidates.');
      setCandidates(data.candidates || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Re-ranking failed.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCandidateReaction = (candidateId: string, rating: 'yes' | 'no') => {
    setReactions((prev) => {
      const current = prev[candidateId];
      if (current === rating) {
        const copy = { ...prev };
        delete copy[candidateId];
        return copy;
      }
      return { ...prev, [candidateId]: rating };
    });
  };

  const handleReset = () => {
    setQuery('');
    setFilters(null);
    setRubric(null);
    setCandidates([]);
    setRefinements([]);
    setIsFrozen(false);
    setReactions({});
    setError(null);
    setModifiedFilterKeys([]);
  };

  const handleSimulateFailure = () => {
    setError(
      'Rate limit exceeded (429: RESOURCE_EXHAUSTED). Auto-fallback heuristics triggered — retry to continue.'
    );
  };

  const hasResults = filters !== null && rubric !== null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] flex flex-col">
      <Navbar
        isFrozen={isFrozen}
        onFreezeToggle={() => setIsFrozen(!isFrozen)}
        onResetSearch={handleReset}
        candidateCount={candidates.length}
        currentRound={refinements.length}
      />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {error && (
          <ErrorBanner
            error={error}
            onRetry={() => {
              setError(null);
              if (lastAction === 'initial_search' && query) handleInitialSearch(query);
              else if (lastAction === 'refine') handleRefine('Retry previous refinement');
              else if (filters && rubric) handleUpdateCriteria(filters, rubric);
            }}
            onDismiss={() => setError(null)}
          />
        )}

        {!hasResults && !isLoading && (
          <SearchHero onSearch={handleInitialSearch} isLoading={isLoading} />
        )}

        {isLoading && (
          <ThinkingIndicator message="Extracting filters and rubric from your requirements…" />
        )}

        {hasResults && !isFrozen && (
          <div className="space-y-5 animate-fade-in w-full">
            {/* Active query bar — full width */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#141414] border border-[#2A2A2A]">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/25 shrink-0">
                  <Sparkles className="w-4 h-4 text-[#FF3333]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
                      Active Search Goal
                    </span>
                    <InfoTooltip text="Your original free-text query. Filters and rubric were generated from this." />
                  </div>
                  <p className="text-sm font-medium text-[#F5F5F5] truncate">&ldquo;{query}&rdquo;</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSimulateFailure}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#757575] hover:text-[#FFB300] bg-[#1E1E1E] border border-[#2A2A2A] transition cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <Bug className="w-3.5 h-3.5" />
                Simulate 429 Demo
              </button>
            </div>

            {/* Full-width workspace grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 xl:gap-6 items-start">
              {/* Left: criteria panel */}
              <div className="xl:col-span-4 xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
                <FilterRubricDrawer
                  filters={filters}
                  rubric={rubric}
                  onUpdateCriteria={handleUpdateCriteria}
                  isUpdating={isRefining}
                  modifiedFilters={modifiedFilterKeys}
                  isFrozen={isFrozen}
                  refinements={refinements}
                />
              </div>

              {/* Right: candidates + refinement */}
              <div className="xl:col-span-8 space-y-5 min-w-0">
                {isRefining && (
                  <ThinkingIndicator
                    isRefining
                    message="Applying your feedback — updating filters, rubric, and re-ranking…"
                  />
                )}

                {/* Candidates */}
                <section>
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#FF3333]" />
                      <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
                        Top Ranked Candidates ({candidates.length})
                      </h2>
                      <InfoTooltip text="4–5 profiles scored against your rubric with field-level citations. Rate them, then refine below." />
                    </div>
                    <span className="text-[11px] text-[#757575] hidden sm:block">
                      Ranked by Rubric Fit & Field Citations
                    </span>
                  </div>

                  {candidates.length > 0 ? (
                    <div className="space-y-4">
                      {candidates.map((candidate, index) => (
                        <CandidateCard
                          key={candidate.profile.id}
                          candidate={candidate}
                          index={index}
                          reaction={reactions[candidate.profile.id]}
                          onReaction={handleCandidateReaction}
                          isFrozen={isFrozen}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 rounded-xl bg-[#141414] border border-[#2A2A2A] text-center">
                      <p className="text-sm text-[#B3B3B3] mb-4">No profiles match current filters.</p>
                      <button
                        type="button"
                        onClick={() =>
                          filters &&
                          rubric &&
                          handleUpdateCriteria(
                            {
                              ...filters,
                              min_years_experience: null,
                              max_years_experience: null,
                              company_types: [],
                            },
                            rubric
                          )
                        }
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#FF0000] text-white cursor-pointer"
                      >
                        Loosen Filters
                      </button>
                    </div>
                  )}
                </section>

                {/* Refinement — sticky on large screens */}
                <section className="xl:sticky xl:bottom-4 xl:z-10">
                  <RefinementChat
                    refinements={refinements}
                    onRefine={handleRefine}
                    isLoading={isRefining}
                    pendingReactions={reactions}
                    isFrozen={isFrozen}
                  />
                </section>
              </div>
            </div>
          </div>
        )}

        {hasResults && isFrozen && filters && rubric && (
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
