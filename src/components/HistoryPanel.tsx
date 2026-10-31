import React from 'react';
import { HistoryItem } from '../hooks/useHistory.js';
import { Trash2, X, Clock, ArrowLeftRight } from 'lucide-react';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onRemove,
}) => {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Calculation History
          </h2>
          <span className="text-xs font-mono text-slate-400">({history.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear all history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close history"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/40">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-4">
            <Clock className="w-8 h-8 stroke-1 mb-2 opacity-50" />
            <p className="text-sm font-medium">No calculations yet</p>
            <p className="text-xs mt-1 text-slate-400">Your recent results will automatically appear here.</p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="group relative pt-2 pb-1 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => {
                onSelect(item);
                onClose();
              }}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>{item.angleMode.toUpperCase()}</span>
                <span>{formatTime(item.timestamp)}</span>
              </div>

              <div className="font-mono text-sm text-slate-600 dark:text-slate-400 truncate">
                {item.expression}
              </div>

              <div className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                = {item.formatted}
              </div>

              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove item"
                  aria-label="Remove item"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any item to load into calculator</span>
        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </div>
  );
};
