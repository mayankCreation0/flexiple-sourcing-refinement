import React, { useState } from 'react';
import { ArrowRight, Sparkles, Terminal, CornerDownLeft } from 'lucide-react';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SAMPLE_QUERIES = [
  'RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore.',
  'Node.js & TypeScript backend engineers with early-stage startup experience in Bangalore.',
  'Senior Python engineers with 5+ years experience building distributed data pipelines.',
];

export const SearchHero: React.FC<SearchHeroProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    onSearch(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-8 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Flexiple AI Sourcing Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Who are you looking to hire?
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
          Type your requirements just like a Google search. The AI recruiter extracts
          objective filters, drafts a subjective rubric, and ranks candidates instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
        <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="e.g. RDS developers with 4-7 years of experience who have worked at startups, for a role based in Bangalore."
            rows={3}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base sm:text-lg focus:outline-none resize-none disabled:opacity-50"
          />

          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center">
              <CornerDownLeft className="w-3 h-3 mr-1" />
              Press <kbd className="mx-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Enter</kbd> to source
            </span>

            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer"
            >
              <span>Source Candidates</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      <div className="mt-8">
        <div className="flex items-center space-x-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Try an example assignment prompt</span>
        </div>
        <div className="space-y-2">
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQuery(sample);
              }}
              className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs sm:text-sm text-slate-300 hover:text-white transition flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{sample}</span>
              <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                Load prompt →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
