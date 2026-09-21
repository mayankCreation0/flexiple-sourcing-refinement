import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Unlock,
  Building2,
  GraduationCap,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ObjectiveFilters, ScoredCandidate, SubjectiveRubric } from '@/lib/types';

interface FrozenShortlistProps {
  candidates: ScoredCandidate[];
  filters: ObjectiveFilters;
  rubric: SubjectiveRubric;
  onUnfreeze: () => void;
  refinementRounds: number;
}

export const FrozenShortlist: React.FC<FrozenShortlistProps> = ({
  candidates,
  filters,
  rubric,
  onUnfreeze,
  refinementRounds,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback if canvas not supported
    }
  }, []);

  const handleCopy = () => {
    const text = candidates
      .map(
        (c, idx) =>
          `#${idx + 1} ${c.profile.name} - ${c.profile.current_title} @ ${
            c.profile.current_company
          } (${c.profile.current_company_type})\n` +
          `Score: ${c.score.fit_score}% | ${c.profile.years_experience}y YoE | Location: ${c.profile.location}\n` +
          `Key Citation: ${c.score.explanation}\n`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExportJson = () => {
    const exportData = {
      frozen_at: new Date().toISOString(),
      refinement_rounds: refinementRounds,
      final_filters: filters,
      final_rubric: rubric,
      shortlist: candidates,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flexiple-shortlist-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* CELEBRATORY FROZEN HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Search Frozen & Finalized</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Final Candidate Shortlist
            </h2>
            <p className="text-sm text-slate-300">
              Criteria successfully refined across {refinementRounds} iteration{refinementRounds !== 1 ? 's' : ''}.
              Top {candidates.length} candidates ready for recruiter outreach.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportJson}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={onUnfreeze}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unfreeze</span>
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block mb-1">Shortlisted</span>
            <span className="text-xl font-bold text-white">{candidates.length} Profiles</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block mb-1">Top Match Score</span>
            <span className="text-xl font-bold text-emerald-400">
              {candidates[0]?.score.fit_score || 0}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block mb-1">Refinement Turns</span>
            <span className="text-xl font-bold text-indigo-400">{refinementRounds}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-500 block mb-1">Target YoE Range</span>
            <span className="text-xl font-bold text-white">
              {filters.min_years_experience ?? 0} - {filters.max_years_experience ?? 30} yrs
            </span>
          </div>
        </div>
      </div>

      {/* FINAL CANDIDATE LIST */}
      <div className="space-y-4">
        {candidates.map((candidate, idx) => (
          <div
            key={candidate.profile.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 font-extrabold flex items-center justify-center text-sm">
                  #{idx + 1}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {candidate.profile.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">
                      {candidate.profile.current_title}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {candidate.profile.current_company} ({candidate.profile.current_company_type})
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {candidate.profile.years_experience}y
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-sm">
                {candidate.score.fit_score}% Fit
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Match Explanation</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {candidate.score.explanation}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {candidate.profile.skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
