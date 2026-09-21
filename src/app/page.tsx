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
import TribalBackground from '@/components/TribalBackground';

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
        setModifiedFilterKeys(data.refinement_record.changes_summary?.filters_modified || ['filters']);
      }
      setReactions({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Refinement failed.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleUpdateCriteria = async (updatedFilters: ObjectiveFilters, updatedRubric: SubjectiveRubric) => {
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
  };

  const handleSimulateFailure = () => {
    setError('Rate limit exceeded (429: RESOURCE_EXHAUSTED). Auto-fallback heuristics triggered.');
  };

  const hasResults = filters !== null && rubric !== null;

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        isFrozen={isFrozen}
        onFreezeToggle={() => setIsFrozen(!isFrozen)}
        onResetSearch={handleReset}
        candidateCount={candidates.length}
        currentRound={refinements.length}
      />

      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', position: 'relative', zIndex: 10 }}>
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

        {!hasResults && !isLoading && <SearchHero onSearch={handleInitialSearch} isLoading={isLoading} />}
        
        {isLoading && <ThinkingIndicator message="Connecting to neural net... extracting parameters..." />}

        {hasResults && !isFrozen && (
          <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Top Query Summary Bar */}
            <div
              style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,255,0.2)',
                boxShadow: '0 0 20px rgba(0,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,0,255,0.1)', border: '1px solid rgba(255,0,255,0.3)', color: '#FF00FF' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="section-label">Active Query</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: '#fff', marginTop: 4, fontFamily: 'var(--font-body)' }}>
                    &ldquo;{query}&rdquo;
                  </p>
                </div>
              </div>

              <button onClick={handleSimulateFailure} className="btn-cyber-ghost" style={{ padding: '0.35rem 0.85rem', borderColor: 'rgba(255,69,0,0.3)', color: '#FF4500' }}>
                <Bug size={12} />
                <span>Trigger 429 Demo</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', gap: '1.5rem', alignItems: 'flex-start' }}>
              <div className="lg:col-span-4 lg:sticky lg:top-24" style={{ gridColumn: 'span 12' }}>
                <div style={{ height: 'calc(100vh - 120px)', minHeight: 600 }}>
                  <FilterRubricDrawer
                    filters={filters}
                    rubric={rubric}
                    onUpdateCriteria={handleUpdateCriteria}
                    isUpdating={isRefining}
                    modifiedFilters={modifiedFilterKeys}
                    isFrozen={isFrozen}
                  />
                </div>
              </div>

              <div className="lg:col-span-8" style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {isRefining && <ThinkingIndicator isRefining={true} message="Recalibrating scores with AI feedback..." />}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="#00FFFF" />
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Ranked Matches ({candidates.length})
                      </h2>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                      Field-Level Citations
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
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)' }}>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No candidates match all strict parameters.</p>
                      <button
                        onClick={() => filters && rubric && handleUpdateCriteria({ ...filters, min_years_experience: null, max_years_experience: null, company_types: [] }, rubric)}
                        className="btn-cyber-solid"
                      >
                        Loosen Constraints
                      </button>
                    </div>
                  )}
                </div>

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

      {/* Decorative background mandala for the whole page */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 0, opacity: 0.05, pointerEvents: 'none' }}>
        <TribalBackground size={1000} color="#00FFFF" />
      </div>
    </div>
  );
}
