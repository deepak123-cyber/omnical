import React, { useRef, useEffect } from 'react';
import { Copy, Check, AlertCircle, Loader2 } from 'lucide-react';

interface DisplayProps {
  expression: string;
  result: string;
  angleMode: 'deg' | 'rad';
  memory: number;
  isSecondMode: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onExpressionChange?: (val: string) => void;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  result,
  angleMode,
  memory,
  isSecondMode,
  isLoading,
  errorMessage,
}) => {
  const [copied, setCopied] = React.useState(false);
  const exprContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to end of expression as user types
  useEffect(() => {
    if (exprContainerRef.current) {
      exprContainerRef.current.scrollLeft = exprContainerRef.current.scrollWidth;
    }
  }, [expression]);

  const handleCopy = async () => {
    try {
      const textToCopy = result !== '0' ? result : expression;
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="relative w-full rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm transition-all duration-200">
      {/* Top telemetry / status indicators */}
      <div className="flex items-center justify-between text-xs font-mono font-medium tracking-wide text-slate-400 dark:text-slate-500 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] uppercase transition-colors ${
              angleMode === 'deg'
                ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 font-semibold'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold'
            }`}
          >
            {angleMode.toUpperCase()}
          </span>

          {isSecondMode && (
            <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-semibold uppercase">
              2nd
            </span>
          )}

          {memory !== 0 && (
            <span
              title={`Memory active: ${memory}`}
              className="px-1.5 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              M
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[11px] rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Copy result"
            aria-label="Copy result"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expression line */}
      <div
        ref={exprContainerRef}
        className="w-full overflow-x-auto whitespace-nowrap scrollbar-none font-mono text-right text-base md:text-xl text-slate-500 dark:text-slate-400 min-h-[1.75rem] select-all py-1"
      >
        {expression || <span className="opacity-30">0</span>}
      </div>

      {/* Main result & inline error status */}
      <div className="mt-2 flex items-center justify-end min-h-[3rem] md:min-h-[3.75rem]">
        {errorMessage ? (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm md:text-base font-medium animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-[280px] md:max-w-md">{errorMessage}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {isLoading && (
              <Loader2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin shrink-0" />
            )}
            <div
              className={`font-mono text-3xl md:text-5xl font-bold tracking-tight select-all tabular-nums text-slate-900 dark:text-slate-50 transition-opacity ${
                isLoading ? 'opacity-50' : 'opacity-100'
              }`}
            >
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
