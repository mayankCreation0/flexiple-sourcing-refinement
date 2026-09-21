import React from 'react';
import { AlertTriangle, RefreshCw, Key, ShieldAlert, X } from 'lucide-react';

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
}) => {
  const isMissingApiKey =
    error.includes('GEMINI_API_KEY') ||
    error.includes('API key') ||
    error.includes('MISSING_API_KEY');

  const isRateLimit =
    error.includes('429') ||
    error.includes('RESOURCE_EXHAUSTED') ||
    error.includes('rate limit');

  const accentColor = isMissingApiKey ? '#FF4500' : isRateLimit ? '#FF00FF' : '#FF4500';
  const accentColorRgb = isMissingApiKey ? '255,69,0' : isRateLimit ? '255,0,255' : '255,69,0';

  return (
    <div
      className="w-full max-w-4xl mx-auto my-4 animate-slide-up"
      style={{
        background: `rgba(0,0,0,0.8)`,
        border: `1px solid rgba(${accentColorRgb}, 0.4)`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        boxShadow: `0 0 20px rgba(${accentColorRgb}, 0.12)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.6,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        {/* Left: icon + text */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.4rem',
              border: `1px solid rgba(${accentColorRgb}, 0.4)`,
              borderRadius: 'var(--radius-sm)',
              background: `rgba(${accentColorRgb}, 0.07)`,
              flexShrink: 0,
            }}
          >
            {isMissingApiKey ? (
              <Key size={16} color="#FF4500" />
            ) : isRateLimit ? (
              <ShieldAlert size={16} color="#FF00FF" />
            ) : (
              <AlertTriangle size={16} color="#FF4500" />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h4
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: accentColor,
              }}
            >
              {isMissingApiKey
                ? 'API Key Configuration Required'
                : isRateLimit
                ? 'LLM Rate Limit — Auto-fallback Active'
                : 'Sourcing Pipeline Error'}
            </h4>
            <p
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                fontFamily: 'var(--font-mono)',
                maxWidth: 560,
              }}
            >
              {error}
            </p>
            {isMissingApiKey && (
              <div
                style={{
                  marginTop: '0.5rem',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#29AB87',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(41,171,135,0.2)',
                }}
              >
                {'>'} Create <strong style={{ color: '#00FFFF' }}>.env.local</strong> →{' '}
                <strong style={{ color: '#29AB87' }}>GEMINI_API_KEY=your_key_here</strong>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {onRetry && (
            <button
              id="error-retry-btn"
              onClick={onRetry}
              disabled={isRetrying}
              className="btn-cyber"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.6rem',
                opacity: isRetrying ? 0.5 : 1,
                cursor: isRetrying ? 'not-allowed' : 'pointer',
              }}
              aria-label="Retry failed request"
            >
              <RefreshCw
                size={11}
                style={{ animation: isRetrying ? 'tribal-spin 0.7s linear infinite' : 'none' }}
              />
              RETRY
            </button>
          )}
          {onDismiss && (
            <button
              id="error-dismiss-btn"
              onClick={onDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '0.35rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4500'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
