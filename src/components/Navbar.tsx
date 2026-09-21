'use client';

import React from 'react';
import { Lock, RotateCcw, Database, ShieldCheck, Zap } from 'lucide-react';

interface NavbarProps {
  isFrozen: boolean;
  onFreezeToggle?: () => void;
  onResetSearch?: () => void;
  candidateCount?: number;
  currentRound?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isFrozen,
  onFreezeToggle,
  onResetSearch,
  candidateCount = 0,
  currentRound = 0,
}) => {
  return (
    <header
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,255,255,0.15)',
        boxShadow: '0 1px 0 0 rgba(0,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 36, height: 36 }}
            aria-hidden="true"
          >
            <svg viewBox="0 0 36 36" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="18,3 33,10.5 33,25.5 18,33 3,25.5 3,10.5"
                stroke="#00FFFF"
                strokeWidth="1.2"
                fill="rgba(0,255,255,0.05)"
                className="animate-pulse-glow"
              />
              <polygon
                points="18,9 27,13.5 27,22.5 18,27 9,22.5 9,13.5"
                stroke="#00FFFF"
                strokeWidth="0.7"
                fill="none"
                opacity="0.5"
              />
              <circle cx="18" cy="18" r="4" fill="#00FFFF" opacity="0.8" />
            </svg>
          </div>

          <div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.9rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#00FFFF',
                textShadow: '0 0 10px rgba(0,255,255,0.6)',
              }}
              className="animate-neon-flicker"
            >
              FLEXIPLE
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                color: 'rgba(0,255,255,0.5)',
                display: 'block',
                marginTop: '-2px',
              }}
            >
              AI SOURCING
            </span>
          </div>
        </div>

        {/* Center status */}
        <div className="hidden md:flex items-center gap-3">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid rgba(0,255,255,0.15)',
              background: 'rgba(0,255,255,0.04)',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: 'rgba(0,255,255,0.7)',
              }}
            >
              <Database size={11} color="#00FFFF" />
              48 PROFILES
            </span>
            <span style={{ width: 1, height: 12, background: 'rgba(0,255,255,0.2)' }} />
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.08em',
                color: '#29AB87',
              }}
            >
              <ShieldCheck size={11} color="#29AB87" />
              GEMINI 2.5
            </span>
            {currentRound > 0 && (
              <>
                <span style={{ width: 1, height: 12, background: 'rgba(0,255,255,0.2)' }} />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    color: '#FF00FF',
                    textTransform: 'uppercase',
                  }}
                >
                  Round {currentRound}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid rgba(41,171,135,0.4)',
              background: 'rgba(41,171,135,0.07)',
            }}
            className="hidden sm:flex"
          >
            <Zap size={11} color="#29AB87" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                letterSpacing: '0.15em',
                color: '#29AB87',
              }}
            >
              LIVE
            </span>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#29AB87',
                boxShadow: '0 0 6px #29AB87',
                animation: 'pulse-glow 1.5s infinite alternate',
              }}
            />
          </div>

          {candidateCount > 0 && !isFrozen && (
            <button
              type="button"
              onClick={onFreezeToggle}
              className="btn-cyber-solid"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.6rem',
                background: '#29AB87',
                borderColor: '#29AB87',
                boxShadow: '0 0 15px rgba(41,171,135,0.35)',
              }}
            >
              <Lock size={11} />
              FREEZE
            </button>
          )}

          {candidateCount > 0 && (
            <button
              type="button"
              onClick={onResetSearch}
              className="btn-cyber"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.6rem' }}
              title="Start a new search"
            >
              <RotateCcw size={11} />
              <span className="hidden sm:inline">NEW</span>
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};
