/**
 * API Client for OmniCalc Scientific Calculator
 */

export interface EvaluateResponse {
  result: number;
  formatted: string;
}

export interface GraphResponse {
  points: Array<{ x: number; y: number | null }>;
  detectedVariables: string[];
  xMin: number;
  xMax: number;
}

export interface ExplainResponse {
  explanation: string;
}

export interface ExplainStatusResponse {
  available: boolean;
}

export async function evaluateAPI(
  expression: string,
  angleMode: 'deg' | 'rad'
): Promise<EvaluateResponse> {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression, angleMode }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to evaluate expression');
  }

  return data;
}

export async function fetchGraphData(
  expression: string,
  angleMode: 'deg' | 'rad',
  xMin: number,
  xMax: number,
  points: number = 250
): Promise<GraphResponse> {
  const res = await fetch('/api/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression, angleMode, xMin, xMax, points }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to plot graph');
  }

  return data;
}

export async function checkExplainStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/explain/status');
    if (!res.ok) return false;
    const data: ExplainStatusResponse = await res.json();
    return Boolean(data.available);
  } catch {
    return false;
  }
}

export async function requestExplanation(
  expression: string,
  result: number | string
): Promise<string> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expression, result }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to explain expression');
  }

  return data.explanation;
}
