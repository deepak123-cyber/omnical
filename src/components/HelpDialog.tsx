import React from 'react';
import { X, Keyboard, HelpCircle } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpDialog: React.FC<HelpDialogProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Keyboard Shortcuts & Mathematical Syntax
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close help dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {/* Shortcuts table */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-2.5">
              Keyboard Controls
            </h3>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>0 – 9, .</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Digits / Decimal
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>+, -, *, /</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Basic Operators
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>^</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Power (xʸ)
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>%</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Modulo
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>!</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Factorial
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>( and )</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Parentheses
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>Enter or =</span>
                <kbd className="px-1.5 py-0.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 rounded border border-cyan-200 dark:border-cyan-800">
                  Calculate
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>Backspace</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  DEL (Delete)
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>Escape</span>
                <kbd className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-800">
                  AC (Clear)
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span>?</span>
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                  Toggle Help
                </kbd>
              </div>
            </div>
          </div>

          {/* Mathematical Syntax */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider mb-2.5">
              Implicit Multiplication & Advanced Functions
            </h3>
            <ul className="space-y-1.5 leading-relaxed">
              <li>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">Implicit multiplication:</span>{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">2π</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">3(4+5)</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">2sin(30)</code>
              </li>
              <li>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">Trigonometry:</span> respects current DEG/RAD mode.
                Inverse functions (<code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">asin</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">acos</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">atan</code>) output in the chosen angle mode.
              </li>
              <li>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">Multi-parameter:</span>{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">nthRoot(27, 3)</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">logBase(81, 3)</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">nCr(5, 2)</code>
              </li>
              <li>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">Constants:</span>{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">pi</code> (3.14159),{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">e</code> (2.71828),{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">phi</code> (1.61803),{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">c</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">g</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">h</code>,{' '}
                <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">NA</code>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
