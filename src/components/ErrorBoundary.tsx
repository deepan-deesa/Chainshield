import React, { useState, useEffect } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error('[ChainShield ErrorBoundary] Captured unhandled error:', event.error);
      setHasError(true);
      setError(event.error || new Error(event.message));
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4 bg-[#161B22]/60 rounded-xl border border-red-900/40 m-4">
        <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-400">
          <svg className="w-8 h-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-[#F0F6FC]">Module Execution Exception</h3>
          <p className="text-xs text-gray-400 font-mono mt-1 max-w-md">
            {error?.message || 'An unexpected rendering error occurred in this workspace view.'}
          </p>
        </div>
        <button
          onClick={() => { setHasError(false); setError(null); }}
          className="px-4 py-2 bg-[#1F6FEB] hover:bg-[#1F6FEB]/90 text-white rounded-lg text-xs font-mono font-semibold transition-all duration-200"
        >
          Retry Module Render
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
