'use client';

import React from 'react';
import { Sparkles, Lock, RotateCcw, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { InfoTooltip } from '@/components/InfoTooltip';

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
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md ${
        isFrozen
          ? 'border-[#00C853]/40 bg-[#0A0A0A]/98'
          : 'border-[#2A2A2A] bg-[#0A0A0A]/95'
      }`}
    >
      <div className="w-full px-3 sm:px-6 lg:px-8 min-h-14 sm:min-h-16 py-2 sm:py-0 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
              isFrozen
                ? 'bg-[#00C853]/20 border border-[#00C853]/50'
                : 'bg-gradient-to-br from-[#FF0000] to-[#CC0000]'
            }`}
          >
            {isFrozen ? (
              <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
            ) : (
              <Sparkles className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-semibold text-[#F5F5F5] tracking-tight text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
                {isFrozen ? 'Search Frozen' : 'Flexiple AI Recruiter'}
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full border ${
                  isFrozen
                    ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/40'
                    : 'bg-[#1E1E1E] text-[#FF3333] border-[#404040]'
                }`}
              >
                {isFrozen ? 'Final Shortlist' : 'Sourcing Loop'}
              </span>
            </div>
            <p className="text-xs text-[#B3B3B3] hidden sm:block truncate">
              {isFrozen
                ? `Final shortlist · ${candidateCount} candidate${candidateCount !== 1 ? 's' : ''}`
                : 'Conversational Talent Sourcing & Adaptive Refinement'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {!isFrozen && (
            <div className="hidden md:flex items-center space-x-4 text-xs text-[#B3B3B3] px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A]">
              <span className="flex items-center text-[#B3B3B3]">
                <Database className="w-3.5 h-3.5 mr-1 text-[#FF3333]" />
                48 Profiles Pool
              </span>
              <span className="h-3 w-px bg-[#404040]" />
              <span className="flex items-center text-[#00C853]">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Gemini 2.5 Flash
              </span>
              {currentRound > 0 && (
                <>
                  <span className="h-3 w-px bg-[#404040]" />
                  <span className="text-[#FF3333] font-medium">Round {currentRound}</span>
                </>
              )}
              <InfoTooltip text="The app filters 48 local sample profiles, scores them with Gemini against your rubric, and refines based on your feedback." />
            </div>
          )}

          {candidateCount > 0 && !isFrozen && (
            <button
              type="button"
              onClick={onFreezeToggle}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#00C853] hover:bg-[#00B248] text-white shadow-md shadow-black/20 transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Freeze Search</span>
            </button>
          )}

          {candidateCount > 0 && isFrozen && (
            <button
              type="button"
              onClick={onFreezeToggle}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#1E1E1E] hover:bg-[#282828] text-[#B3B3B3] border border-[#404040] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Unfreeze</span>
            </button>
          )}

          {candidateCount > 0 && (
            <button
              type="button"
              onClick={onResetSearch}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-[#B3B3B3] hover:text-[#F5F5F5] bg-[#141414] hover:bg-[#1E1E1E] border border-[#2A2A2A] transition cursor-pointer"
              title="Start a new search"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Search</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
