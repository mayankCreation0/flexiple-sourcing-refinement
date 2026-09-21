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
  Check,
} from 'lucide-react';
import { ScoredCandidate } from '@/lib/types';
import { InfoTooltip } from '@/components/InfoTooltip';

interface CandidateCardProps {
  candidate: ScoredCandidate;
  index: number;
  reaction?: 'yes' | 'no' | null;
  onReaction: (candidateId: string, rating: 'yes' | 'no') => void;
  isFrozen?: boolean;
}

function shortenExplanation(text: string, maxLen = 150): string {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim() + '…';
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
    if (fitScore >= 80) return 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/40';
    if (fitScore >= 60) return 'text-[#FFB300] bg-[#FFB300]/10 border-[#FFB300]/40';
    return 'text-[#E53935] bg-[#E53935]/10 border-[#E53935]/40';
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'strong_match':
        return 'Strong Fit';
      case 'potential_match':
        return 'Potential Fit';
      default:
        return 'Borderline';
    }
  };

  const evidenceItems = [
    score.cited_fields?.skills_fit && { label: score.cited_fields.skills_fit, type: 'skill' },
    score.cited_fields?.experience_fit && { label: score.cited_fields.experience_fit, type: 'exp' },
    score.cited_fields?.company_fit && { label: score.cited_fields.company_fit, type: 'company' },
    score.cited_fields?.education_fit && { label: score.cited_fields.education_fit, type: 'edu' },
    { label: profile.location, type: 'location' },
  ].filter(Boolean) as { label: string; type: string }[];

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 p-5 ${
        reaction === 'yes'
          ? 'bg-[#141414] border-[#00C853]/50 ring-1 ring-[#00C853]/20'
          : reaction === 'no'
          ? 'bg-[#141414]/80 border-[#E53935]/30 opacity-75'
          : 'bg-[#141414] border-[#2A2A2A] hover:border-[#404040]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1E1E1E] border border-[#404040] text-[#FF3333] font-bold text-sm shrink-0">
            #{index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#F5F5F5]">{profile.name}</h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#1E1E1E] text-[#B3B3B3] border border-[#404040]">
                {profile.current_title}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-[#B3B3B3]">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#757575]" />
                <strong className="text-[#F5F5F5] font-medium">{profile.current_company}</strong>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#FF0000]/10 text-[#FF3333] border border-[#FF0000]/25">
                  {profile.current_company_type}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#757575]" />
                {profile.years_experience} yrs
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#757575]" />
                {profile.location}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`px-3 py-1.5 rounded-lg border flex flex-col items-end shrink-0 ${getScoreColor(
            score.fit_score
          )}`}
        >
          <span className="text-lg font-extrabold leading-none">{score.fit_score}%</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5">
            {getVerdictLabel(score.verdict)}
          </span>
        </div>
      </div>

      {/* Why this matches — concise */}
      <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#FF3333] uppercase tracking-wide">
            Why this matches
          </span>
          <InfoTooltip text="Short explanation tied to this profile's actual fields — skills, experience, company, and location. Used for rubric-based ranking." />
        </div>
        <p className="text-sm text-[#B3B3B3] leading-relaxed line-clamp-3">
          {shortenExplanation(score.explanation)}
        </p>

        {/* Scannable evidence */}
        {evidenceItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
            <span className="text-[10px] font-semibold text-[#757575] uppercase tracking-wider block mb-2">
              Evidence
            </span>
            <div className="flex flex-wrap gap-2">
              {evidenceItems.map((item, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1E1E1E] border border-[#404040] text-[11px] text-[#B3B3B3]"
                >
                  <Check className="w-3 h-3 text-[#00C853] shrink-0" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills & meta */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {profile.skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1E1E1E] text-[#B3B3B3] border border-[#404040]/60"
            >
              {skill}
            </span>
          ))}
        </div>
        {profile.education && (
          <div className="text-[11px] text-[#757575] flex items-center gap-1">
            <GraduationCap className="w-3 h-3 shrink-0" />
            <span className="truncate">{profile.education}</span>
          </div>
        )}
      </div>

      {/* Match / Skip feedback */}
      {!isFrozen && (
        <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A] gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {reaction === 'yes' ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#00C853] font-medium">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Marked as Good Match
              </span>
            ) : reaction === 'no' ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#E53935] font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Marked as Not a Fit
              </span>
            ) : (
              <span className="text-xs text-[#757575]">Does Candidate #{index + 1} match?</span>
            )}
            <InfoTooltip text="Rate candidates with Match or Skip, then use Refine Search below. Your feedback updates filters and rubric, then re-ranks results." />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onReaction(profile.id, 'yes')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                reaction === 'yes'
                  ? 'bg-[#00C853] text-white'
                  : 'bg-[#1E1E1E] hover:bg-[#282828] text-[#B3B3B3] border border-[#404040]'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              Match
            </button>
            <button
              type="button"
              onClick={() => onReaction(profile.id, 'no')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                reaction === 'no'
                  ? 'bg-[#E53935] text-white'
                  : 'bg-[#1E1E1E] hover:bg-[#282828] text-[#B3B3B3] border border-[#404040]'
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
