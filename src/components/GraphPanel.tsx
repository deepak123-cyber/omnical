import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { fetchGraphData, GraphResponse } from '../api/client.js';
import { Play, RotateCcw, AlertTriangle, Info, ZoomIn, ZoomOut } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphPanelProps {
  initialExpression?: string;
  isDarkTheme: boolean;
  angleMode: 'deg' | 'rad';
}

const PRESET_FUNCTIONS = [
  'sin(x)',
  'cos(x)',
  'tan(x)',
  'x^2',
  'x^3 - 3x',
  '1/x',
  'sqrt(x)',
  'exp(x)',
  'abs(x)',
];

export const GraphPanel: React.FC<GraphPanelProps> = ({
  initialExpression = 'sin(x)',
  isDarkTheme,
  angleMode: initialAngleMode,
}) => {
  const [expr, setExpr] = useState<string>(() => {
    if (initialExpression && initialExpression.includes('x')) {
      return initialExpression;
    }
    return 'sin(x)';
  });
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>(initialAngleMode);
  const [xMin, setXMin] = useState<number>(-10);
  const [xMax, setXMax] = useState<number>(10);
  const [pointsCount] = useState<number>(300);

  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const plotFunction = useCallback(
    async (expressionToPlot: string, min: number, max: number, mode: 'deg' | 'rad') => {
      const cleanExpr = expressionToPlot.trim();
      if (!cleanExpr) {
        setError('Please enter a mathematical function of x');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchGraphData(cleanExpr, mode, min, max, pointsCount);
        setGraphData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to plot graph');
      } finally {
        setIsLoading(false);
      }
    },
    [pointsCount]
  );

  useEffect(() => {
    plotFunction(expr, xMin, xMax, angleMode);
  }, []);

  const handlePlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    plotFunction(expr, xMin, xMax, angleMode);
  };

  const handlePresetSelect = (preset: string) => {
    setExpr(preset);
    plotFunction(preset, xMin, xMax, angleMode);
  };

  const setRangePreset = (min: number, max: number) => {
    setXMin(min);
    setXMax(max);
    plotFunction(expr, min, max, angleMode);
  };

  const zoom = (factor: number) => {
    const center = (xMin + xMax) / 2;
    const span = (xMax - xMin) * factor;
    const newMin = Number((center - span / 2).toFixed(2));
    const newMax = Number((center + span / 2).toFixed(2));
    setXMin(newMin);
    setXMax(newMax);
    plotFunction(expr, newMin, newMax, angleMode);
  };

  // Prepare chart dataset
  const chartConfig = useMemo(() => {
    if (!graphData || !graphData.points) {
      return { labels: [], datasets: [] };
    }

    const labels = graphData.points.map((p) => p.x.toString());
    const dataPoints = graphData.points.map((p) => (p.y !== null ? p.y : NaN));

    return {
      labels,
      datasets: [
        {
          label: `f(x) = ${expr}`,
          data: dataPoints,
          borderColor: isDarkTheme ? '#22d3ee' : '#0891b2', // laser cyan
          backgroundColor: isDarkTheme ? 'rgba(34, 211, 238, 0.08)' : 'rgba(8, 145, 178, 0.08)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 10,
          spanGaps: false, // Discontinuity handling: leaves gaps at undefined domain / asymptotes
          tension: 0.15,
        },
      ],
    };
  }, [graphData, expr, isDarkTheme]);

  const chartOptions: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: isDarkTheme ? '#94a3b8' : '#475569',
            font: { family: 'JetBrains Mono', size: 12 },
          },
        },
        tooltip: {
          backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
          titleColor: isDarkTheme ? '#f8fafc' : '#0f172a',
          bodyColor: isDarkTheme ? '#cbd5e1' : '#334155',
          borderColor: isDarkTheme ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 8,
          displayColors: false,
          callbacks: {
            title: (items) => `x = ${items[0].label}`,
            label: (item) => {
              const val = item.raw as number;
              return Number.isNaN(val) ? 'Undefined' : `y = ${val.toFixed(4)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: isDarkTheme ? '#64748b' : '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 },
            maxTicksLimit: 12,
          },
        },
        y: {
          grid: {
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            color: isDarkTheme ? '#64748b' : '#94a3b8',
            font: { family: 'JetBrains Mono', size: 10 },
            maxTicksLimit: 10,
          },
        },
      },
    }),
    [isDarkTheme]
  );

  const hasUndefinedPoints = graphData?.points.some((p) => p.y === null);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Control Bar */}
      <form
        onSubmit={handlePlotSubmit}
        className="flex flex-col md:flex-row gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
      >
        {/* Function Input */}
        <div className="flex-1 flex items-center gap-2">
          <span className="font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400 shrink-0">
            f(x) =
          </span>
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="e.g. sin(x), x^2 - 4, 1/x"
            className="flex-1 px-3 py-2 text-sm font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Range and Mode controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
            <span>x:</span>
            <input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(Number(e.target.value))}
              className="w-16 px-2 py-1.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              title="x minimum"
            />
            <span>to</span>
            <input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(Number(e.target.value))}
              className="w-16 px-2 py-1.5 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              title="x maximum"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const nextMode = angleMode === 'deg' ? 'rad' : 'deg';
              setAngleMode(nextMode);
              plotFunction(expr, xMin, xMax, nextMode);
            }}
            className="px-2.5 py-1.5 text-xs font-mono font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors uppercase"
          >
            {angleMode}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-xs disabled:opacity-50 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Plot</span>
          </button>
        </div>
      </form>

      {/* Preset Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-mono text-slate-400 shrink-0">Presets:</span>
        {PRESET_FUNCTIONS.map((p) => (
          <button
            key={p}
            onClick={() => handlePresetSelect(p)}
            className={`px-2.5 py-1 rounded-lg font-mono whitespace-nowrap transition-colors ${
              expr === p
                ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Graph Canvas Container */}
      <div className="relative w-full h-[360px] md:h-[440px] p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
        {/* Graph HUD Toolbar */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-mono">
            <span>Range: [{xMin}, {xMax}]</span>
            {hasUndefinedPoints && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400" title="Gaps represent asymptotes or undefined domain values">
                <Info className="w-3 h-3" />
                <span>Asymptotes with gaps</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => zoom(0.5)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => zoom(2)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRangePreset(-10, 10)}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Reset View"
              aria-label="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="relative flex-1 w-full min-h-0">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xs">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <Line data={chartConfig} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
