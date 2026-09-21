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
  Zap,
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
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00FFFF', '#29AB87', '#FF00FF'],
      });
    } catch {
      // safe fallback
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
    <div className="space-y-6 animate-slide-up">
      {/* ── Celebratory Hero Banner ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          background: 'radial-gradient(ellipse at center, rgba(41,171,135,0.15) 0%, rgba(0,0,0,0.8) 100%)',
          border: '1px solid rgba(41,171,135,0.4)',
          boxShadow: '0 0 40px rgba(41,171,135,0.15)',
        }}
      >
        {/* Glow overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: '-50%', left: '-50%', right: '-50%', bottom: '-50%',
            background: 'conic-gradient(from 0deg, transparent, rgba(41,171,135,0.1), transparent)',
            animation: 'tribal-spin 20s linear infinite',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-pill)',
                background: 'rgba(41,171,135,0.15)', border: '1px solid #29AB87',
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#29AB87', letterSpacing: '0.1em',
              }}
            >
              <CheckCircle2 size={12} />
              <span>SEARCH FROZEN & FINALIZED</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: '#fff',
                textShadow: '0 0 20px rgba(41,171,135,0.5)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                lineHeight: 1.1,
              }}
            >
              Final Candidate Shortlist
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 600 }}>
              Criteria successfully refined across <strong style={{ color: '#00FFFF' }}>{refinementRounds}</strong> iteration{refinementRounds !== 1 ? 's' : ''}.
              Top <strong style={{ color: '#00FFFF' }}>{candidates.length}</strong> candidates ready for outreach.
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button onClick={handleCopy} className="btn-cyber-ghost" style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'var(--text-primary)' }}>
              {copied ? <Check size={14} color="#29AB87" /> : <Copy size={14} />}
              <span>{copied ? 'COPIED!' : 'COPY LIST'}</span>
            </button>
            <button onClick={handleExportJson} className="btn-cyber-solid" style={{ background: '#29AB87', borderColor: '#29AB87', color: '#000', boxShadow: '0 0 20px rgba(41,171,135,0.4)' }}>
              <Download size={14} />
              <span>EXPORT JSON</span>
            </button>
            <button onClick={onUnfreeze} className="btn-cyber-ghost" style={{ borderColor: '#FF4500', color: '#FF4500' }}>
              <Unlock size={14} />
              <span>UNFREEZE</span>
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem',
            marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(41,171,135,0.2)',
          }}
        >
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Shortlisted</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>{candidates.length}</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Top Match</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#29AB87' }}>{candidates[0]?.score.fit_score || 0}%</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>Refinements</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#00FFFF' }}>{refinementRounds}</span>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.5)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 4 }}>YoE Range</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff' }}>{filters.min_years_experience ?? 0}-{filters.max_years_experience ?? 30}y</span>
          </div>
        </div>
      </div>

      {/* ── Candidate List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {candidates.map((candidate, idx) => (
          <div
            key={candidate.profile.id}
            className="holo-card animate-slide-up"
            style={{ padding: '1.5rem', animationDelay: `${idx * 100}ms` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: '6px',
                    background: 'rgba(41,171,135,0.1)', border: '1px solid #29AB87',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: '#29AB87',
                  }}
                >
                  #{idx + 1}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                    {candidate.profile.name}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: 4, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{candidate.profile.current_title}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Building2 size={12} color="rgba(0,255,255,0.5)" />
                      {candidate.profile.current_company}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color="rgba(0,255,255,0.5)" />
                      {candidate.profile.years_experience}y
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)',
                  background: 'rgba(41,171,135,0.2)', border: '1px solid #29AB87',
                  fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 700, color: '#29AB87',
                }}
              >
                {candidate.score.fit_score}% FIT
              </div>
            </div>

            <div
              style={{
                marginTop: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-sm)',
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                <Zap size={12} color="#00FFFF" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#00FFFF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Verified Citation
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {candidate.score.explanation}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
              {candidate.profile.skills.map((s) => (
                <span key={s} className="pill-cyan" style={{ fontSize: '0.65rem' }}>
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
