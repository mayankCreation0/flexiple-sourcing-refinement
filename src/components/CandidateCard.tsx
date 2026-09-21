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
  Zap,
} from 'lucide-react';
import { ScoredCandidate } from '@/lib/types';

interface CandidateCardProps {
  candidate: ScoredCandidate;
  index: number;
  reaction?: 'yes' | 'no' | null;
  onReaction: (candidateId: string, rating: 'yes' | 'no') => void;
  isFrozen?: boolean;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color =
    score >= 85 ? '#29AB87' :
    score >= 70 ? '#00FFFF' :
    '#FF4500';

  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
      {/* Track */}
      <circle cx="34" cy="34" r={radius} stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
      {/* Fill */}
      <circle
        cx="34" cy="34" r={radius}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`}
        strokeDashoffset={circumference * 0.25}
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
          animation: 'score-ring-fill 1s ease-out forwards',
          transition: 'stroke-dasharray 0.8s ease',
        }}
      />
      {/* Score label */}
      <text
        x="34" y="34"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          fontWeight: 700,
          fill: color,
          letterSpacing: '0.05em',
        }}
      >
        {score}
      </text>
    </svg>
  );
}

function getVerdictPill(verdict: string) {
  switch (verdict) {
    case 'strong_match':
      return { label: 'STRONG FIT', color: '#29AB87', bg: 'rgba(41,171,135,0.1)', border: 'rgba(41,171,135,0.3)' };
    case 'potential_match':
      return { label: 'POTENTIAL FIT', color: '#00FFFF', bg: 'rgba(0,255,255,0.08)', border: 'rgba(0,255,255,0.25)' };
    default:
      return { label: 'BORDERLINE', color: '#FF4500', bg: 'rgba(255,69,0,0.08)', border: 'rgba(255,69,0,0.25)' };
  }
}

function getCompanyTypePill(type: string) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    startup:    { color: '#FF00FF', bg: 'rgba(255,0,255,0.07)',   border: 'rgba(255,0,255,0.2)' },
    scaleup:    { color: '#BF00FF', bg: 'rgba(191,0,255,0.07)',   border: 'rgba(191,0,255,0.2)' },
    enterprise: { color: '#00FFFF', bg: 'rgba(0,255,255,0.07)',   border: 'rgba(0,255,255,0.2)' },
    agency:     { color: '#FF4500', bg: 'rgba(255,69,0,0.07)',    border: 'rgba(255,69,0,0.2)' },
  };
  return map[type] ?? { color: 'var(--text-muted)', bg: 'transparent', border: 'var(--border-subtle)' };
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  index,
  reaction,
  onReaction,
  isFrozen = false,
}) => {
  const { profile, score } = candidate;
  const verdict = getVerdictPill(score.verdict);
  const companyStyle = getCompanyTypePill(profile.current_company_type);

  const borderColor =
    reaction === 'yes' ? 'rgba(41,171,135,0.5)' :
    reaction === 'no'  ? 'rgba(255,69,0,0.3)' :
    'rgba(0,255,255,0.2)';

  const boxShadow =
    reaction === 'yes' ? '0 0 20px rgba(41,171,135,0.15)' :
    '0 0 0px transparent';

  return (
    <div
      className="cyber-card animate-slide-up"
      style={{
        padding: '1.25rem',
        border: `1px solid ${borderColor}`,
        boxShadow,
        opacity: reaction === 'no' ? 0.55 : 1,
        transition: 'all 0.3s ease',
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        {/* Left: rank + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          {/* Rank badge */}
          <div
            style={{
              width: 30, height: 30,
              borderRadius: '4px',
              border: '1px solid rgba(0,255,255,0.3)',
              background: 'rgba(0,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: '0.6rem',
              fontWeight: 700,
              color: '#00FFFF',
              flexShrink: 0,
              letterSpacing: '0.1em',
            }}
          >
            #{index + 1}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'var(--text-primary)',
                }}
              >
                {profile.name}
              </h3>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  padding: '1px 6px',
                }}
              >
                {profile.current_title}
              </span>
            </div>

            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <Building2 size={11} color="rgba(0,255,255,0.4)" />
                <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{profile.current_company}</strong>
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: companyStyle.color,
                  background: companyStyle.bg,
                  border: `1px solid ${companyStyle.border}`,
                  borderRadius: '3px',
                  padding: '1px 5px',
                }}
              >
                {profile.current_company_type}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <Clock size={10} color="rgba(0,255,255,0.3)" />
                {profile.years_experience}y
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                <MapPin size={10} color="rgba(0,255,255,0.3)" />
                {profile.location}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Score ring */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <ScoreRing score={score.fit_score} />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.52rem',
              letterSpacing: '0.1em',
              color: verdict.color,
              background: verdict.bg,
              border: `1px solid ${verdict.border}`,
              borderRadius: '3px',
              padding: '1px 6px',
              textTransform: 'uppercase',
            }}
          >
            {verdict.label}
          </span>
        </div>
      </div>

      {/* ── Why this profile ── */}
      <div
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(0,255,255,0.1)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          marginBottom: '0.75rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle top edge */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.25), transparent)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.4rem' }}>
          <Zap size={11} color="#00FFFF" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#00FFFF',
              opacity: 0.8,
            }}
          >
            Why this profile matches
          </span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {score.explanation}
        </p>

        {/* Field citations grid */}
        {score.cited_fields && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.4rem',
              marginTop: '0.6rem',
              paddingTop: '0.6rem',
              borderTop: '1px solid rgba(0,255,255,0.08)',
            }}
          >
            {score.cited_fields.company_fit && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Company: </span>
                {score.cited_fields.company_fit}
              </div>
            )}
            {score.cited_fields.experience_fit && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Experience: </span>
                {score.cited_fields.experience_fit}
              </div>
            )}
            {score.cited_fields.skills_fit && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Skills: </span>
                {score.cited_fields.skills_fit}
              </div>
            )}
            {score.cited_fields.education_fit && (
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Education: </span>
                {score.cited_fields.education_fit}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Skills ── */}
      <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {profile.skills.map((skill, i) => (
            <span
              key={skill}
              className={i % 3 === 0 ? 'pill-cyan' : i % 3 === 1 ? 'pill-cyan' : 'pill-cyan'}
              style={{
                opacity: i < 4 ? 1 : 0.6,
              }}
            >
              {skill}
            </span>
          ))}
        </div>

        {profile.past_companies.length > 0 && (
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', gap: 4 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Prior:</span>
            <span>
              {profile.past_companies.map((p) => `${p.company} (${p.company_type}, ${p.years}y)`).join(' · ')}
            </span>
          </div>
        )}

        {profile.education && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            <GraduationCap size={10} color="rgba(0,255,255,0.3)" />
            <span>{profile.education}</span>
          </div>
        )}
      </div>

      {/* ── Footer: Reaction ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(0,255,255,0.08)',
        }}
      >
        <div>
          {reaction === 'yes' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#29AB87' }}>
              <CheckCircle size={12} />
              Marked as Good Match
            </span>
          ) : reaction === 'no' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: '#FF4500' }}>
              <AlertCircle size={12} />
              Marked as Not a Fit
            </span>
          ) : (
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}
            >
              {'>'} Rate candidate #{index + 1}
            </span>
          )}
        </div>

        {!isFrozen && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              id={`match-btn-${profile.id}`}
              type="button"
              onClick={() => onReaction(profile.id, 'yes')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: reaction === 'yes' ? 'rgba(41,171,135,0.2)' : 'transparent',
                color: '#29AB87',
                border: `1px solid ${reaction === 'yes' ? '#29AB87' : 'rgba(41,171,135,0.3)'}`,
              }}
              aria-label={`Mark candidate ${profile.name} as a match`}
            >
              <ThumbsUp size={11} />
              Match
            </button>
            <button
              id={`skip-btn-${profile.id}`}
              type="button"
              onClick={() => onReaction(profile.id, 'no')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: reaction === 'no' ? 'rgba(255,69,0,0.12)' : 'transparent',
                color: '#FF4500',
                border: `1px solid ${reaction === 'no' ? '#FF4500' : 'rgba(255,69,0,0.3)'}`,
              }}
              aria-label={`Skip candidate ${profile.name}`}
            >
              <ThumbsDown size={11} />
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
