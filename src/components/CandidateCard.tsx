import React from 'react';
import {
  Building2,
  MapPin,
  Clock,
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ScoredCandidate } from '@/lib/types';

interface CandidateCardProps {
  candidate: ScoredCandidate;
  index: number;
  reaction?: 'yes' | 'no' | null;
  onReaction: (candidateId: string, rating: 'yes' | 'no') => void;
  isFrozen?: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  index,
  reaction,
  onReaction,
  isFrozen = false,
}) => {
  const { profile, score } = candidate;

  const getScoreColor = (fitScore: number) => {
    if (fitScore >= 80) return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/80';
    if (fitScore >= 60) return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
    return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'strong_match':
        return 'Strong Fit';
      case 'potential_match':
        return 'Potential Fit';
      case 'weak_match':
      default:
        return 'Borderline';
    }
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 p-5 ${
        reaction === 'yes'
          ? 'bg-slate-900/95 border-emerald-600/70 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
          : reaction === 'no'
          ? 'bg-slate-900/60 border-rose-900/50 opacity-70'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl'
      }`}
    >
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-indigo-400 font-bold text-sm shadow-inner shrink-0">
            #{index + 1}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                {profile.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {profile.current_title}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
              <span className="flex items-center">
                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <strong className="text-slate-300 font-medium mr-1">
                  {profile.current_company}
                </strong>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-400 border border-indigo-900/60">
                  {profile.current_company_type}
                </span>
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {profile.years_experience} yrs exp
              </span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {profile.location}
              </span>
            </div>
          </div>
        </div>

        {/* FIT SCORE PILL */}
        <div
          className={`px-3 py-1 rounded-xl border flex flex-col items-end shrink-0 ${getScoreColor(
            score.fit_score
          )}`}
        >
          <div className="flex items-center space-x-1">
            <span className="text-base font-extrabold">{score.fit_score}%</span>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider">
            {getVerdictLabel(score.verdict)}
          </span>
        </div>
      </div>

      {/* WHY THIS PROFILE MATCHED (GROUNDED CITATION EXPLANATION) */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-950/60 mb-3 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Why this profile matches the rubric</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {score.explanation}
        </p>

        {/* STRUCTURED FIELD CITATIONS */}
        {score.cited_fields && (
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {score.cited_fields.company_fit && (
              <div className="flex items-start space-x-1 text-slate-400">
                <span className="font-semibold text-slate-300">🏢 Company:</span>
                <span className="truncate">{score.cited_fields.company_fit}</span>
              </div>
            )}
            {score.cited_fields.experience_fit && (
              <div className="flex items-start space-x-1 text-slate-400">
                <span className="font-semibold text-slate-300">⏱️ Experience:</span>
                <span className="truncate">{score.cited_fields.experience_fit}</span>
              </div>
            )}
            {score.cited_fields.skills_fit && (
              <div className="flex items-start space-x-1 text-slate-400">
                <span className="font-semibold text-slate-300">🛠️ Skills:</span>
                <span className="truncate">{score.cited_fields.skills_fit}</span>
              </div>
            )}
            {score.cited_fields.education_fit && (
              <div className="flex items-start space-x-1 text-slate-400">
                <span className="font-semibold text-slate-300">🎓 Education:</span>
                <span className="truncate">{score.cited_fields.education_fit}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CANDIDATE SKILLS & PAST COMPANIES */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50"
            >
              {skill}
            </span>
          ))}
        </div>

        {profile.past_companies.length > 0 && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
            <span className="text-slate-500 font-medium">Prior:</span>
            <span>
              {profile.past_companies
                .map((p) => `${p.company} (${p.company_type}, ${p.years}y)`)
                .join(' • ')}
            </span>
          </div>
        )}

        {profile.education && (
          <div className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
            <GraduationCap className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{profile.education}</span>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS: REACTION / FEEDBACK */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
        <div className="flex items-center space-x-2">
          {reaction === 'yes' ? (
            <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Marked as Good Match</span>
            </span>
          ) : reaction === 'no' ? (
            <span className="inline-flex items-center space-x-1 text-xs text-rose-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Marked as Not a Fit</span>
            </span>
          ) : (
            <span className="text-xs text-slate-500">
              Does Candidate #{index + 1} match?
            </span>
          )}
        </div>

        {!isFrozen && (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onReaction(profile.id, 'yes')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                reaction === 'yes'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Match</span>
            </button>
            <button
              type="button"
              onClick={() => onReaction(profile.id, 'no')}
              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                reaction === 'no'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>Skip</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
