import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Download,
  Copy,
  Check,
  Unlock,
  Building2,
  Clock,
} from 'lucide-react';
import { ObjectiveFilters, ScoredCandidate, SubjectiveRubric } from '@/lib/types';
import { InfoTooltip } from '@/components/InfoTooltip';

interface FrozenShortlistProps {
  candidates: ScoredCandidate[];
  filters: ObjectiveFilters;
  rubric: SubjectiveRubric;
  onUnfreeze: () => void;
  refinementRounds: number;
}

const weightLabel: Record<string, string> = {
  critical: '40%',
  high: '30%',
  medium: '20%',
};

export const FrozenShortlist: React.FC<FrozenShortlistProps> = ({
  candidates,
  filters,
  rubric,
  onUnfreeze,
  refinementRounds,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#00C853', '#F5F5F5'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  const handleCopy = () => {
    const text = candidates
      .map(
        (c, idx) =>
          `#${idx + 1} ${c.profile.name} — ${c.score.fit_score}% fit\n` +
          `${c.profile.current_title} @ ${c.profile.current_company}\n` +
          `${c.score.explanation}\n`
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
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flexiple-shortlist-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Frozen banner */}
      <div className="p-6 rounded-xl bg-[#00C853]/5 border border-[#00C853]/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C853]/15 border border-[#00C853]/40 text-[#00C853] text-xs font-bold uppercase tracking-wide mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Search Frozen
            </div>
            <h2 className="text-2xl font-bold text-[#F5F5F5]">Final Candidate Shortlist</h2>
            <p className="text-sm text-[#B3B3B3] mt-1">
              {refinementRounds} refinement round{refinementRounds !== 1 ? 's' : ''} ·{' '}
              {candidates.length} candidates ready for outreach
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E1E1E] border border-[#404040] text-[#F5F5F5] hover:bg-[#282828] transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#00C853]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy List'}
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#FF0000] hover:bg-[#CC0000] text-white transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              type="button"
              onClick={onUnfreeze}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#1E1E1E] border border-[#404040] text-[#B3B3B3] hover:text-[#F5F5F5] transition cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              Unfreeze
            </button>
          </div>
        </div>
      </div>

      {/* Three-column summary: Final Search | Final Rubric | Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* FINAL SEARCH */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#2A2A2A]">
            <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
              Final Search
            </h3>
            <InfoTooltip text="Objective filters applied to the 48-profile talent pool." />
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-[10px] text-[#757575] uppercase">Experience</dt>
              <dd className="text-[#F5F5F5] font-medium">
                {filters.min_years_experience ?? 'Any'} – {filters.max_years_experience ?? 'Any'} years
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-[#757575] uppercase">Locations</dt>
              <dd className="text-[#F5F5F5]">
                {filters.locations.length ? filters.locations.join(', ') : 'Any'}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-[#757575] uppercase">Company Types</dt>
              <dd className="flex flex-wrap gap-1 mt-0.5">
                {(filters.company_types.length ? filters.company_types : ['any']).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[11px] bg-[#1E1E1E] border border-[#404040] capitalize">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] text-[#757575] uppercase">Skills</dt>
              <dd className="flex flex-wrap gap-1 mt-0.5">
                {filters.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[11px] bg-[#FF0000]/10 text-[#FF3333] border border-[#FF0000]/25">
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </div>

        {/* FINAL RUBRIC */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#2A2A2A]">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#2A2A2A]">
            <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
              Final Rubric
            </h3>
            <InfoTooltip text="Subjective scoring criteria used to rank filtered candidates." />
          </div>
          <p className="text-xs text-[#B3B3B3] mb-3 line-clamp-2">{rubric.role_summary}</p>
          <ul className="space-y-2">
            {rubric.core_competencies.map((comp, idx) => (
              <li key={idx} className="flex items-center justify-between text-xs">
                <span className="text-[#F5F5F5]">{comp.name}</span>
                <span className="text-[#FFB300] font-semibold">
                  {weightLabel[comp.weight] ?? comp.weight}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary stats */}
        <div className="p-5 rounded-xl bg-[#141414] border border-[#2A2A2A] grid grid-cols-2 gap-3 content-start">
          <div>
            <span className="text-[10px] text-[#757575] uppercase block">Shortlisted</span>
            <span className="text-2xl font-bold text-[#F5F5F5]">{candidates.length}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#757575] uppercase block">Top Score</span>
            <span className="text-2xl font-bold text-[#00C853]">
              {candidates[0]?.score.fit_score ?? 0}%
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#757575] uppercase block">Refinements</span>
            <span className="text-2xl font-bold text-[#FF3333]">{refinementRounds}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#757575] uppercase block">YoE Range</span>
            <span className="text-lg font-bold text-[#F5F5F5]">
              {filters.min_years_experience ?? 0}–{filters.max_years_experience ?? 30}y
            </span>
          </div>
        </div>
      </div>

      {/* FINAL SHORTLIST */}
      <div>
        <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider mb-4 flex items-center gap-2">
          Final Shortlist
          <InfoTooltip text="Ranked by rubric fit score with field-level citations from each profile." />
        </h3>
        <div className="space-y-3">
          {candidates.map((candidate, idx) => (
            <div
              key={candidate.profile.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-[#141414] border border-[#2A2A2A] hover:border-[#404040] transition"
            >
              <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 border border-[#00C853]/30 flex items-center justify-center text-[#00C853] font-bold shrink-0">
                #{idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#F5F5F5]">{candidate.profile.name}</span>
                  <span className="text-xs text-[#757575]">{candidate.profile.current_title}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[#757575]">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {candidate.profile.current_company}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {candidate.profile.years_experience}y
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xl font-extrabold text-[#00C853]">
                  {candidate.score.fit_score}%
                </span>
                <span className="block text-[10px] text-[#757575] uppercase">Fit</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
