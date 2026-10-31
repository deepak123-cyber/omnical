import { useState, useCallback, useRef, useEffect } from 'react';
import { evaluateAPI } from '../api/client.js';
import { HistoryItem } from './useHistory.js';

export type AngleMode = 'deg' | 'rad';

interface UseCalculatorProps {
  onAddHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export function useCalculator({ onAddHistory }: UseCalculatorProps) {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [lastEvaluated, setLastEvaluated] = useState<{
    expression: string;
    formatted: string;
    result: number;
  } | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>('deg');
  const [isSecondMode, setIsSecondMode] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('omnicalc_memory');
    return stored ? Number(stored) || 0 : 0;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    localStorage.setItem('omnicalc_memory', String(memory));
  }, [memory]);

  const showError = useCallback((msg: string) => {
    setErrorMessage(msg);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setErrorMessage(null);
    }, 4000);
  }, []);

  const clearAll = useCallback(() => {
    setExpression('');
    setResult('0');
    setErrorMessage(null);
  }, []);

  const deleteToken = useCallback(() => {
    setErrorMessage(null);
    setExpression((prev) => {
      if (!prev) return '';

      // Check if expression ends with known function like 'sin(' or 'logBase('
      const funcMatch = prev.match(/([a-zA-Z0-9]+)\($/);
      if (funcMatch) {
        return prev.slice(0, prev.length - funcMatch[0].length);
      }

      // Check if ends with multi-letter constant like 'phi' or 'nCr('
      const multiMatch = prev.match(/(phi|log2|cbrt|sqrt|asin|acos|atan|sinh|cosh|tanh)$/i);
      if (multiMatch) {
        return prev.slice(0, prev.length - multiMatch[0].length);
      }

      return prev.slice(0, -1);
    });
  }, []);

  const inputToken = useCallback((token: string) => {
    setErrorMessage(null);

    setExpression((prev) => {
      // If we just evaluated and user types a digit or function, start fresh
      if (lastEvaluated && prev === lastEvaluated.expression) {
        if (/^[0-9.]/.test(token) || /^[a-zA-Z]/.test(token)) {
          return token;
        }
      }

      // Handle function tokens
      if (
        [
          'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
          'sinh', 'cosh', 'tanh', 'log', 'ln', 'log2',
          'sqrt', 'cbrt', 'abs', 'exp', 'floor', 'ceil', 'round'
        ].includes(token)
      ) {
        return `${prev}${token}(`;
      }

      if (token === 'nCr' || token === 'nPr' || token === 'logBase' || token === 'nthRoot') {
        return `${prev}${token}(`;
      }

      if (token === 'x²') return `${prev}^2`;
      if (token === 'x³') return `${prev}^3`;
      if (token === 'xʸ') return `${prev}^`;
      if (token === '1/x') {
        if (prev.length === 0) return '1/(';
        return `1/(${prev})`;
      }
      if (token === 'eˣ') return `${prev}exp(`;
      if (token === '10ˣ') return `${prev}10^`;

      if (token === '±') {
        // Toggle negation
        if (prev.length === 0) return '-';
        if (prev.endsWith('-')) return prev.slice(0, -1);
        if (prev.endsWith('+')) return `${prev.slice(0, -1)}-`;
        return `${prev}-`;
      }

      if (token === 'EXP') {
        return `${prev}e`;
      }

      if (token === 'π') return `${prev}π`;
      if (token === 'e') return `${prev}e`;

      return `${prev}${token}`;
    });
  }, [lastEvaluated]);

  const calculate = useCallback(async () => {
    const trimmed = expression.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await evaluateAPI(trimmed, angleMode);
      setResult(data.formatted);
      const evalData = {
        expression: trimmed,
        formatted: data.formatted,
        result: data.result,
      };
      setLastEvaluated(evalData);
      onAddHistory({
        expression: trimmed,
        formatted: data.formatted,
        result: data.result,
        angleMode,
      });
    } catch (err: any) {
      showError(err.message || 'Error evaluating expression');
    } finally {
      setIsLoading(false);
    }
  }, [expression, angleMode, onAddHistory, showError]);

  // Memory operations
  const memoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const memoryRecall = useCallback(() => {
    setExpression((prev) => `${prev}${memory}`);
  }, [memory]);

  const memoryAdd = useCallback(async () => {
    try {
      const currentVal = Number(result) || (expression ? (await evaluateAPI(expression, angleMode)).result : 0);
      setMemory((prev) => prev + currentVal);
    } catch {
      showError('Cannot add to memory: invalid value');
    }
  }, [result, expression, angleMode, showError]);

  const memorySubtract = useCallback(async () => {
    try {
      const currentVal = Number(result) || (expression ? (await evaluateAPI(expression, angleMode)).result : 0);
      setMemory((prev) => prev - currentVal);
    } catch {
      showError('Cannot subtract from memory: invalid value');
    }
  }, [result, expression, angleMode, showError]);

  const memoryStore = useCallback(async () => {
    try {
      const currentVal = Number(result) || (expression ? (await evaluateAPI(expression, angleMode)).result : 0);
      setMemory(currentVal);
    } catch {
      showError('Cannot store to memory: invalid value');
    }
  }, [result, expression, angleMode, showError]);

  const toggleAngleMode = useCallback(() => {
    setAngleMode((prev) => (prev === 'deg' ? 'rad' : 'deg'));
  }, []);

  const toggleSecondMode = useCallback(() => {
    setIsSecondMode((prev) => !prev);
  }, []);

  const loadFromHistory = useCallback((item: HistoryItem) => {
    setExpression(item.expression);
    setResult(item.formatted);
    setAngleMode(item.angleMode);
    setLastEvaluated({
      expression: item.expression,
      formatted: item.formatted,
      result: item.result,
    });
    setErrorMessage(null);
  }, []);

  return {
    expression,
    setExpression,
    result,
    setResult,
    lastEvaluated,
    angleMode,
    isSecondMode,
    memory,
    isLoading,
    errorMessage,
    inputToken,
    deleteToken,
    clearAll,
    calculate,
    toggleAngleMode,
    toggleSecondMode,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    memoryStore,
    loadFromHistory,
  };
}
