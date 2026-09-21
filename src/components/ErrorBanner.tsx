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

  return (
    <div className="w-full max-w-4xl mx-auto my-4 p-4 rounded-2xl bg-rose-950/70 border border-rose-800/80 shadow-2xl backdrop-blur-md animate-fade-in text-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded-xl bg-rose-900/60 border border-rose-700/60 text-rose-300 shrink-0 mt-0.5">
            {isMissingApiKey ? (
              <Key className="w-5 h-5 text-amber-400" />
            ) : isRateLimit ? (
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {isMissingApiKey
                ? 'GEMINI_API_KEY Configuration Required'
                : isRateLimit
                ? 'LLM Rate Limit Reached (429 - Backoff & Recovery Active)'
                : 'Sourcing Pipeline Encountered an Issue'}
            </h4>
            <p className="text-xs text-rose-200/80 leading-relaxed max-w-2xl">
              {error}
            </p>
            {isMissingApiKey && (
              <div className="pt-2 text-xs text-amber-300/90 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-amber-900/40">
                To fix: Create <code className="text-amber-200 font-bold">.env.local</code> in the project root and add:{' '}
                <code className="text-emerald-300 font-bold">GEMINI_API_KEY=your_key_here</code>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-800 hover:bg-rose-700 text-white shadow-md shadow-rose-950/50 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>Retry</span>
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-rose-900/40 text-rose-400 hover:text-rose-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
