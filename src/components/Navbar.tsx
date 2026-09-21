import React from 'react';
import { Sparkles, Lock, RotateCcw, Database, ShieldCheck } from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-100 tracking-tight text-base">
                Flexiple AI Recruiter
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                Sourcing Loop
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Conversational Talent Sourcing & Adaptive Refinement
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-4 text-xs text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="flex items-center text-slate-300">
              <Database className="w-3.5 h-3.5 mr-1 text-cyan-400" />
              48 Profiles Pool
            </span>
            <span className="h-3 w-px bg-slate-700" />
            <span className="flex items-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Gemini 2.5 Flash
            </span>
            {currentRound > 0 && (
              <>
                <span className="h-3 w-px bg-slate-700" />
                <span className="text-indigo-400 font-medium">
                  Round {currentRound}
                </span>
              </>
            )}
          </div>

          {candidateCount > 0 && !isFrozen && (
            <button
              onClick={onFreezeToggle}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Freeze Search</span>
            </button>
          )}

          {candidateCount > 0 && (
            <button
              onClick={onResetSearch}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition cursor-pointer"
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
