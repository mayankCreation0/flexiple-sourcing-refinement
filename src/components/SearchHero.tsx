'use client';

import { useState, useRef } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import TribalBackground from './TribalBackground';

const EXAMPLE_QUERIES = [
  'Senior React engineer, 5+ yrs, startup background, remote-first',
  'Python backend lead with AWS and ML pipeline experience',
  'Full-stack TypeScript dev with Node.js, 3-6 yrs, agile team',
  'DevOps/SRE with Kubernetes and CI/CD ownership, scaling experience',
];

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchHero({ onSearch, isLoading }: SearchHeroProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    textareaRef.current?.focus();
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 0',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,255,255,0.06) 0%, transparent 70%)',
      }}
    >
      {/* Tribal decoration — top-left */}
      <TribalBackground
        className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/4"
        opacity={0.12}
        size={400}
        color="#00FFFF"
      />

      {/* Tribal decoration — bottom-right (magenta) */}
      <TribalBackground
        className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/4"
        opacity={0.08}
        size={350}
        color="#FF00FF"
      />

      {/* Horizontal scan line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '40%',
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,255,255,0.12), transparent)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        {/* Label */}
        <div
          className="flex items-center justify-center gap-2 mb-6 animate-slide-up"
          style={{ animationDelay: '0ms' }}
        >
          <div
            style={{
              width: 24,
              height: 1,
              background: 'linear-gradient(90deg, transparent, #00FFFF)',
            }}
          />
          <span className="section-label">AI Sourcing Engine v2.0</span>
          <div
            style={{
              width: 24,
              height: 1,
              background: 'linear-gradient(90deg, #00FFFF, transparent)',
            }}
          />
        </div>

        {/* Headline */}
        <h1
          className="text-center animate-slide-up"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            animationDelay: '80ms',
          }}
        >
          <span
            style={{
              color: '#00FFFF',
              textShadow: '0 0 30px rgba(0,255,255,0.5), 0 0 80px rgba(0,255,255,0.2)',
            }}
          >
            Source Smarter
          </span>
          <br />
          <span
            style={{
              color: 'rgba(232,250,255,0.75)',
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              fontWeight: 500,
              letterSpacing: '0.12em',
              display: 'block',
              marginTop: '0.5rem',
            }}
          >
            Hire with precision intelligence
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-center animate-slide-up"
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            maxWidth: 580,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            animationDelay: '160ms',
          }}
        >
          Describe your ideal hire in plain language. Our AI extracts objective filters,
          builds a subjective evaluation rubric, and scores candidates with cited evidence.
        </p>

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="animate-slide-up"
          style={{ animationDelay: '240ms' }}
          aria-label="Candidate search form"
        >
          <div
            className="relative"
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0,255,255,0.3)',
              background: 'rgba(0,0,0,0.6)',
              boxShadow: isLoading
                ? '0 0 30px rgba(0,255,255,0.25), 0 0 60px rgba(0,255,255,0.1)'
                : '0 0 0px rgba(0,255,255,0)',
              transition: 'box-shadow 0.4s ease',
            }}
          >
            {/* Search icon */}
            <div
              style={{
                position: 'absolute',
                top: '1.1rem',
                left: '1rem',
                color: isLoading ? '#00FFFF' : 'rgba(0,255,255,0.5)',
                transition: 'color 0.3s',
              }}
            >
              <Search size={18} />
            </div>

            <textarea
              ref={textareaRef}
              id="search-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="e.g. Senior React engineer, 5+ years, startup background, remote-first with strong TypeScript skills..."
              rows={3}
              disabled={isLoading}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '1.1rem 5.5rem 1.1rem 3rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                resize: 'none',
                borderRadius: 'var(--radius-md)',
              }}
              aria-label="Describe the candidate you are looking for"
            />

            {/* Submit button */}
            <button
              id="search-submit-btn"
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn-cyber-solid"
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '0.75rem',
                padding: '0.5rem 1.1rem',
                fontSize: '0.65rem',
                opacity: isLoading || !query.trim() ? 0.5 : 1,
                cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
              }}
              aria-label="Search candidates"
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      border: '2px solid #000',
                      borderTopColor: 'transparent',
                      display: 'inline-block',
                      animation: 'tribal-spin 0.6s linear infinite',
                    }}
                  />
                  SCANNING
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  SEARCH
                  <ChevronRight size={12} />
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Example queries */}
        <div
          className="animate-slide-up"
          style={{ animationDelay: '320ms', marginTop: '1.5rem' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
              textAlign: 'center',
            }}
          >
            Quick examples
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((example, i) => (
              <button
                key={i}
                id={`example-query-${i}`}
                type="button"
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.03em',
                  color: 'rgba(0,255,255,0.55)',
                  background: 'rgba(0,255,255,0.04)',
                  border: '1px solid rgba(0,255,255,0.15)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '0.3rem 0.75rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isLoading ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.color = '#00FFFF';
                    e.currentTarget.style.borderColor = 'rgba(0,255,255,0.4)';
                    e.currentTarget.style.background = 'rgba(0,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(0,255,255,0.55)';
                  e.currentTarget.style.borderColor = 'rgba(0,255,255,0.15)';
                  e.currentTarget.style.background = 'rgba(0,255,255,0.04)';
                }}
                aria-label={`Use example: ${example}`}
              >
                {example.length > 55 ? example.slice(0, 55) + '…' : example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
