import React, { useState } from 'react';
import { Delete, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface KeypadProps {
  onInput: (token: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onCalculate: () => void;
  onToggleAngleMode: () => void;
  onToggleSecondMode: () => void;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onMemoryStore: () => void;
  angleMode: 'deg' | 'rad';
  isSecondMode: boolean;
  isLoading: boolean;
  memory: number;
}

export const Keypad: React.FC<KeypadProps> = ({
  onInput,
  onDelete,
  onClear,
  onCalculate,
  onToggleAngleMode,
  onToggleSecondMode,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onMemoryStore,
  angleMode,
  isSecondMode,
  isLoading,
  memory,
}) => {
  const [showConstants, setShowConstants] = useState(false);

  // Common button classes
  const baseBtn =
    'relative flex items-center justify-center font-medium rounded-xl select-none transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none min-h-[44px] md:min-h-[48px] text-sm md:text-base';

  const numBtn = `${baseBtn} bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 font-semibold text-base md:text-lg`;
  const opBtn = `${baseBtn} bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-400 font-semibold`;
  const sciBtn = `${baseBtn} bg-slate-100/70 hover:bg-slate-200 dark:bg-slate-900/60 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-mono`;
  const memBtn = `${baseBtn} bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-mono`;
  const actionBtn = `${baseBtn} bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-semibold`;
  const equalsBtn = `${baseBtn} bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold text-lg shadow-sm`;

  return (
    <div className="w-full flex flex-col gap-2.5">
      {/* Memory & Mode Bar */}
      <div className="grid grid-cols-7 gap-1.5 p-1 bg-slate-100/60 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
        <button
          onClick={onToggleAngleMode}
          className={`${memBtn} font-bold ${
            angleMode === 'deg'
              ? 'text-cyan-700 dark:text-cyan-400'
              : 'text-emerald-700 dark:text-emerald-400'
          }`}
          aria-label={`Toggle angle mode. Current: ${angleMode}`}
        >
          {angleMode.toUpperCase()}
        </button>

        <button
          onClick={onToggleSecondMode}
          className={`${memBtn} ${
            isSecondMode
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : ''
          }`}
          aria-label="Toggle secondary functions"
        >
          2nd
        </button>

        <button
          onClick={onMemoryClear}
          disabled={memory === 0}
          className={`${memBtn} disabled:opacity-40`}
          aria-label="Memory Clear"
        >
          MC
        </button>
        <button
          onClick={onMemoryRecall}
          disabled={memory === 0}
          className={`${memBtn} disabled:opacity-40 font-semibold`}
          aria-label="Memory Recall"
        >
          MR
        </button>
        <button onClick={onMemoryAdd} className={memBtn} aria-label="Memory Add">
          M+
        </button>
        <button onClick={onMemorySubtract} className={memBtn} aria-label="Memory Subtract">
          M−
        </button>
        <button onClick={onMemoryStore} className={memBtn} aria-label="Memory Store">
          MS
        </button>
      </div>

      {/* Main Keypad Grid */}
      <div className="grid grid-cols-5 md:grid-cols-6 gap-1.5 md:gap-2">
        {/* Row 1 */}
        <button
          onClick={() => onInput(isSecondMode ? 'asin' : 'sin')}
          className={sciBtn}
          aria-label={isSecondMode ? 'arcsine' : 'sine'}
        >
          {isSecondMode ? 'sin⁻¹' : 'sin'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? 'acos' : 'cos')}
          className={sciBtn}
          aria-label={isSecondMode ? 'arccosine' : 'cosine'}
        >
          {isSecondMode ? 'cos⁻¹' : 'cos'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? 'atan' : 'tan')}
          className={sciBtn}
          aria-label={isSecondMode ? 'arctangent' : 'tangent'}
        >
          {isSecondMode ? 'tan⁻¹' : 'tan'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? 'eˣ' : 'ln')}
          className={sciBtn}
          aria-label={isSecondMode ? 'exponential e to the power x' : 'natural logarithm'}
        >
          {isSecondMode ? 'eˣ' : 'ln'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? '10ˣ' : 'log')}
          className={sciBtn}
          aria-label={isSecondMode ? '10 to the power x' : 'logarithm base 10'}
        >
          {isSecondMode ? '10ˣ' : 'log'}
        </button>
        <button
          onClick={onClear}
          className={`${actionBtn} hidden md:flex`}
          aria-label="All Clear"
        >
          AC
        </button>

        {/* Row 2 */}
        <button
          onClick={() => onInput(isSecondMode ? 'x²' : 'sqrt')}
          className={sciBtn}
          aria-label={isSecondMode ? 'x squared' : 'square root'}
        >
          {isSecondMode ? 'x²' : '√'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? 'x³' : 'cbrt')}
          className={sciBtn}
          aria-label={isSecondMode ? 'x cubed' : 'cube root'}
        >
          {isSecondMode ? 'x³' : '∛'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? 'nthRoot' : 'xʸ')}
          className={sciBtn}
          aria-label={isSecondMode ? 'nth root' : 'x to the power y'}
        >
          {isSecondMode ? 'ⁿ√x' : 'xʸ'}
        </button>
        <button
          onClick={() => onInput('1/x')}
          className={sciBtn}
          aria-label="reciprocal one over x"
        >
          1/x
        </button>
        <button
          onClick={() => onInput('!')}
          className={sciBtn}
          aria-label="factorial"
        >
          n!
        </button>
        <button
          onClick={onDelete}
          className={`${sciBtn} hidden md:flex`}
          aria-label="Delete last character"
        >
          <Delete className="w-4 h-4" />
        </button>

        {/* Row 3 */}
        <button
          onClick={() => onInput(isSecondMode ? 'sinh' : 'π')}
          className={sciBtn}
          aria-label={isSecondMode ? 'hyperbolic sine' : 'pi'}
        >
          {isSecondMode ? 'sinh' : 'π'}
        </button>
        <button
          onClick={() => onInput(isSecondMode ? 'cosh' : 'e')}
          className={sciBtn}
          aria-label={isSecondMode ? 'hyperbolic cosine' : 'Euler constant e'}
        >
          {isSecondMode ? 'cosh' : 'e'}
        </button>
        <button
          onClick={() => onInput('(')}
          className={sciBtn}
          aria-label="left parenthesis"
        >
          (
        </button>
        <button
          onClick={() => onInput(')')}
          className={sciBtn}
          aria-label="right parenthesis"
        >
          )
        </button>
        <button
          onClick={() => onInput('%')}
          className={sciBtn}
          aria-label="modulo or percent"
        >
          %
        </button>
        <button
          onClick={() => onInput('/')}
          className={`${opBtn} hidden md:flex text-xl`}
          aria-label="divide"
        >
          ÷
        </button>

        {/* Row 4 (Digits & Operators) */}
        <button
          onClick={() => onInput(isSecondMode ? 'tanh' : 'nCr')}
          className={sciBtn}
          aria-label={isSecondMode ? 'hyperbolic tangent' : 'combinations nCr'}
        >
          {isSecondMode ? 'tanh' : 'nCr'}
        </button>
        <button onClick={() => onInput('7')} className={numBtn} aria-label="digit 7">
          7
        </button>
        <button onClick={() => onInput('8')} className={numBtn} aria-label="digit 8">
          8
        </button>
        <button onClick={() => onInput('9')} className={numBtn} aria-label="digit 9">
          9
        </button>
        <button
          onClick={() => onInput('*')}
          className={`${opBtn} text-xl`}
          aria-label="multiply"
        >
          ×
        </button>
        <button
          onClick={() => onInput('/')}
          className={`${opBtn} flex md:hidden text-xl`}
          aria-label="divide"
        >
          ÷
        </button>

        {/* Row 5 */}
        <button
          onClick={() => onInput(isSecondMode ? 'abs' : 'nPr')}
          className={sciBtn}
          aria-label={isSecondMode ? 'absolute value' : 'permutations nPr'}
        >
          {isSecondMode ? 'abs' : 'nPr'}
        </button>
        <button onClick={() => onInput('4')} className={numBtn} aria-label="digit 4">
          4
        </button>
        <button onClick={() => onInput('5')} className={numBtn} aria-label="digit 5">
          5
        </button>
        <button onClick={() => onInput('6')} className={numBtn} aria-label="digit 6">
          6
        </button>
        <button
          onClick={() => onInput('-')}
          className={`${opBtn} text-xl`}
          aria-label="subtract"
        >
          −
        </button>

        {/* Row 6 */}
        <button
          onClick={() => onInput('EXP')}
          className={sciBtn}
          aria-label="scientific exponential notation"
        >
          EXP
        </button>
        <button onClick={() => onInput('1')} className={numBtn} aria-label="digit 1">
          1
        </button>
        <button onClick={() => onInput('2')} className={numBtn} aria-label="digit 2">
          2
        </button>
        <button onClick={() => onInput('3')} className={numBtn} aria-label="digit 3">
          3
        </button>
        <button
          onClick={() => onInput('+')}
          className={`${opBtn} text-xl`}
          aria-label="add"
        >
          +
        </button>

        {/* Row 7 */}
        <button
          onClick={() => onInput('±')}
          className={sciBtn}
          aria-label="negate or plus minus"
        >
          ±
        </button>
        <button onClick={() => onInput('0')} className={numBtn} aria-label="digit 0">
          0
        </button>
        <button onClick={() => onInput('.')} className={numBtn} aria-label="decimal point">
          .
        </button>
        <button
          onClick={onDelete}
          className={`${sciBtn} flex md:hidden`}
          aria-label="Delete last character"
        >
          <Delete className="w-4 h-4" />
        </button>
        <button
          onClick={onClear}
          className={`${actionBtn} flex md:hidden`}
          aria-label="All clear"
        >
          AC
        </button>
        <button
          onClick={onCalculate}
          disabled={isLoading}
          className={`${equalsBtn} col-span-2 md:col-span-1 disabled:opacity-50`}
          aria-label="Calculate result"
        >
          =
        </button>
      </div>

      {/* Expandable Scientific Constants Panel */}
      <div className="pt-1">
        <button
          onClick={() => setShowConstants(!showConstants)}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-mono font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-800/50"
          aria-expanded={showConstants}
        >
          <span className="flex items-center gap-1.5">
            <span>Physical & Mathematical Constants</span>
            <span className="text-[11px] text-slate-400">c, g, h, NA, φ</span>
          </span>
          {showConstants ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showConstants && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mt-2 p-2 bg-slate-50 dark:bg-slate-900/70 rounded-xl border border-slate-200/60 dark:border-slate-800/60 text-xs">
            <button
              onClick={() => onInput('c')}
              className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
              title="Speed of light in vacuum: 299,792,458 m/s"
            >
              <div className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">c (Light)</div>
              <div className="text-[10px] text-slate-400">2.9979e8 m/s</div>
            </button>

            <button
              onClick={() => onInput('g')}
              className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
              title="Standard acceleration of gravity: 9.80665 m/s²"
            >
              <div className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">g (Gravity)</div>
              <div className="text-[10px] text-slate-400">9.80665 m/s²</div>
            </button>

            <button
              onClick={() => onInput('h')}
              className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
              title="Planck constant: 6.62607015e-34 J·s"
            >
              <div className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">h (Planck)</div>
              <div className="text-[10px] text-slate-400">6.626e-34 J·s</div>
            </button>

            <button
              onClick={() => onInput('NA')}
              className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
              title="Avogadro constant: 6.02214076e23 mol⁻¹"
            >
              <div className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">NA (Avogadro)</div>
              <div className="text-[10px] text-slate-400">6.022e23 mol⁻¹</div>
            </button>

            <button
              onClick={() => onInput('phi')}
              className="flex flex-col items-start p-2 rounded-lg bg-white dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors col-span-2 md:col-span-1"
              title="Golden ratio: 1.6180339887..."
            >
              <div className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">φ (Golden)</div>
              <div className="text-[10px] text-slate-400">1.6180339...</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
