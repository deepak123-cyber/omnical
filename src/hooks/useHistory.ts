import { useState, useEffect, useCallback } from 'react';

export interface HistoryItem {
  id: string;
  expression: string;
  result: number;
  formatted: string;
  angleMode: 'deg' | 'rad';
  timestamp: number;
}

const STORAGE_KEY = 'omnicalc_history_v1';
const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
      }
    } catch {
      // Ignore parse error
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Storage quota or private mode error
    }
  }, [history]);

  const addHistoryItem = useCallback(
    (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
      const newItem: HistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        // Avoid duplicate consecutive identical expressions
        if (prev.length > 0 && prev[0].expression === newItem.expression && prev[0].formatted === newItem.formatted) {
          return prev;
        }
        return [newItem, ...prev].slice(0, MAX_HISTORY);
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    history,
    addHistoryItem,
    clearHistory,
    removeHistoryItem,
  };
}
