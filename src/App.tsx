import React, { useState, useEffect } from 'react';
import { useCalculator } from './hooks/useCalculator.js';
import { useHistory } from './hooks/useHistory.js';
import { useTheme } from './hooks/useTheme.js';
import { checkExplainStatus, requestExplanation } from './api/client.js';
import { Display } from './components/Display.js';
import { Keypad } from './components/Keypad.js';
import { HistoryPanel } from './components/HistoryPanel.js';
import { HelpDialog } from './components/HelpDialog.js';
import { ExplainModal } from './components/ExplainModal.js';
import { GraphPanel } from './components/GraphPanel.js';
import {
  History,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Sparkles,
  Calculator,
  LineChart,
} from 'lucide-react';

export default function App() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { history, addHistoryItem, clearHistory, removeHistoryItem } = useHistory();

  const calc = useCalculator({ onAddHistory: addHistoryItem });

  const [activeTab, setActiveTab] = useState<'calc' | 'graph'>('calc');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Gemini AI Explanation state
  const [isAiAvailable, setIsAiAvailable] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);

  // Check if Gemini API is available on the server
  useEffect(() => {
    checkExplainStatus().then((available) => setIsAiAvailable(available));
  }, []);

  // Global Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is focused (e.g. in graphing mode)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (activeTab !== 'calc') return;

      if (e.key >= '0' && e.key <= '9') {
        calc.inputToken(e.key);
      } else if (e.key === '.') {
        calc.inputToken('.');
      } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '^' || e.key === '%') {
        calc.inputToken(e.key);
      } else if (e.key === '!') {
        calc.inputToken('!');
      } else if (e.key === '(' || e.key === ')') {
        calc.inputToken(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calc.calculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        calc.deleteToken();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        calc.clearAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, calc]);

  const handleExplainClick = async () => {
    if (!calc.lastEvaluated) return;
    setIsExplainOpen(true);
    setExplainLoading(true);
    setExplanation(null);
    setExplainError(null);

    try {
      const text = await requestExplanation(
        calc.lastEvaluated.expression,
        calc.lastEvaluated.formatted
      );
      setExplanation(text);
    } catch (err: any) {
      setExplainError(err.message || 'Failed to explain expression');
    } finally {
      setExplainLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar adhering to Top Bar Contract */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-4 md:px-8 py-3.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center text-white shadow-xs">
            <span className="font-mono font-bold text-base">fx</span>
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 whitespace-nowrap">
            OmniCalc Scientific
          </span>
        </div>

        {/* Zone 2: Navigation / Mode Switch */}
        <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'calc'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'graph'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Graphing Studio</span>
          </button>
        </nav>

        {/* Zone 3: Utility Actions & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Keyboard shortcuts & syntax (?)"
            aria-label="Keyboard shortcuts and syntax help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsHistoryOpen(true)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Calculation History"
            aria-label="Toggle calculation history panel"
          >
            <History className="w-4 h-4" />
            {history.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500" />
            )}
          </button>

          {/* Theme switcher */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'light'
                  ? 'bg-white text-amber-600 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Light Mode"
              aria-label="Light mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-900 text-cyan-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Dark Mode"
              aria-label="Dark mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-md transition-colors ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="System Theme"
              aria-label="System theme"
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col items-center justify-start">
        {activeTab === 'calc' ? (
          <div className="w-full max-w-xl flex flex-col gap-3">
            {/* Display Area */}
            <Display
              expression={calc.expression}
              result={calc.result}
              angleMode={calc.angleMode}
              memory={calc.memory}
              isSecondMode={calc.isSecondMode}
              isLoading={calc.isLoading}
              errorMessage={calc.errorMessage}
            />

            {/* AI Explanation Bar (When Gemini is available and an expression is evaluated) */}
            {isAiAvailable && calc.lastEvaluated && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-transparent dark:from-cyan-950/30 rounded-xl border border-cyan-500/20 text-xs animate-fadeIn">
                <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain calculation steps with AI</span>
                </div>
                <button
                  onClick={handleExplainClick}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium text-xs shadow-2xs transition-colors"
                >
                  Explain
                </button>
              </div>
            )}

            {/* Keypad Area */}
            <Keypad
              onInput={calc.inputToken}
              onDelete={calc.deleteToken}
              onClear={calc.clearAll}
              onCalculate={calc.calculate}
              onToggleAngleMode={calc.toggleAngleMode}
              onToggleSecondMode={calc.toggleSecondMode}
              onMemoryClear={calc.memoryClear}
              onMemoryRecall={calc.memoryRecall}
              onMemoryAdd={calc.memoryAdd}
              onMemorySubtract={calc.memorySubtract}
              onMemoryStore={calc.memoryStore}
              angleMode={calc.angleMode}
              isSecondMode={calc.isSecondMode}
              isLoading={calc.isLoading}
              memory={calc.memory}
            />
          </div>
        ) : (
          <div className="w-full">
            <GraphPanel
              initialExpression={calc.expression}
              isDarkTheme={resolvedTheme === 'dark'}
              angleMode={calc.angleMode}
            />
          </div>
        )}
      </main>

      {/* History Slide-over */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(item) => {
          calc.loadFromHistory(item);
          setActiveTab('calc');
        }}
        onClear={clearHistory}
        onRemove={removeHistoryItem}
      />

      {/* Keyboard Shortcuts & Syntax Help Dialog */}
      <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* AI Explanation Modal */}
      <ExplainModal
        isOpen={isExplainOpen}
        onClose={() => setIsExplainOpen(false)}
        expression={calc.lastEvaluated?.expression || ''}
        result={calc.lastEvaluated?.formatted || ''}
        explanation={explanation}
        isLoading={explainLoading}
        error={explainError}
      />
    </div>
  );
}
