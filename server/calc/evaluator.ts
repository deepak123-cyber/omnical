/**
 * Scientific Calculator Evaluator
 * Evaluates the AST with angle mode (deg/rad), domain validations, overflow protection,
 * variable scoping for 2D graphing, asymptote discontinuity detection, and high-precision formatting.
 */

import { ASTNode, findVariables, parse } from './parser.js';
import { CONSTANTS } from './constants.js';
import { tokenize } from './tokenizer.js';

export type AngleMode = 'deg' | 'rad';

export interface EvaluationOutput {
  result: number;
  formatted: string;
}

export interface GraphPoint {
  x: number;
  y: number | null;
}

export interface GraphOutput {
  points: GraphPoint[];
  detectedVariables: string[];
  xMin: number;
  xMax: number;
}

// Factorial table / calculation for 0 <= n <= 170
export function factorial(n: number): number {
  if (!Number.isInteger(n)) {
    throw new Error(`Factorial is only defined for integers. Received: ${n}`);
  }
  if (n < 0) {
    throw new Error(`Factorial is not defined for negative numbers: ${n}!`);
  }
  if (n > 170) {
    throw new Error(`Factorial argument exceeds limit (${n}!). Maximum supported is 170! to avoid float overflow.`);
  }

  let acc = 1;
  for (let i = 2; i <= n; i++) {
    acc *= i;
  }
  return acc;
}

export function nPr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error('nPr arguments must be integers');
  }
  if (n < 0 || r < 0) {
    throw new Error('nPr arguments must be non-negative');
  }
  if (r > n) {
    throw new Error(`r cannot be greater than n in nPr(${n}, ${r})`);
  }
  if (n > 170) {
    throw new Error('nPr argument n cannot exceed 170');
  }

  let result = 1;
  for (let i = n - r + 1; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function nCr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r)) {
    throw new Error('nCr arguments must be integers');
  }
  if (n < 0 || r < 0) {
    throw new Error('nCr arguments must be non-negative');
  }
  if (r > n) {
    throw new Error(`r cannot be greater than n in nCr(${n}, ${r})`);
  }
  const k = Math.min(r, n - r);
  let numerator = 1;
  let denominator = 1;
  for (let i = 1; i <= k; i++) {
    numerator *= n - i + 1;
    denominator *= i;
  }
  return Math.round(numerator / denominator);
}

export function formatResult(value: number): string {
  if (Object.is(value, -0)) {
    return '0';
  }
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const abs = Math.abs(value);

  // If very large or very small, use scientific notation
  if (abs >= 1e12 || (abs > 0 && abs < 1e-6)) {
    const expStr = value.toExponential(10);
    return expStr.replace(/\.?0+e/, 'e');
  }

  // Round floating point jitter
  const precision = 12;
  const fixed = Number(value.toPrecision(precision));

  if (Number.isInteger(fixed)) {
    return fixed.toString();
  }

  const str = fixed.toFixed(10);
  return str.replace(/\.?0+$/, '');
}

export function evaluateAST(
  node: ASTNode,
  angleMode: AngleMode,
  scope: Record<string, number> = {}
): number {
  switch (node.type) {
    case 'Number':
      return node.value;

    case 'Constant': {
      const val = CONSTANTS[node.name];
      if (val === undefined) {
        throw new Error(`Unknown constant: ${node.name}`);
      }
      return val;
    }

    case 'Variable': {
      if (node.name in scope) {
        return scope[node.name];
      }
      if (node.name === 'x') {
        throw new Error('Variable "x" is only defined in graphing mode. Switch to Graphing tab to plot f(x).');
      }
      throw new Error(`Unknown variable or identifier: "${node.name}"`);
    }

    case 'Unary': {
      const arg = evaluateAST(node.argument, angleMode, scope);
      if (node.operator === '+') return arg;
      if (node.operator === '-') return -arg;
      throw new Error(`Unknown unary operator: ${node.operator}`);
    }

    case 'Postfix': {
      const arg = evaluateAST(node.argument, angleMode, scope);
      return factorial(arg);
    }

    case 'Binary': {
      const left = evaluateAST(node.left, angleMode, scope);
      const right = evaluateAST(node.right, angleMode, scope);

      switch (node.operator) {
        case '+': {
          const res = left + right;
          if (!Number.isFinite(res)) throw new Error('Addition overflowed to Infinity');
          return res;
        }
        case '-': {
          const res = left - right;
          if (!Number.isFinite(res)) throw new Error('Subtraction overflowed to Infinity');
          return res;
        }
        case '*': {
          const res = left * right;
          if (!Number.isFinite(res)) throw new Error('Multiplication overflowed to Infinity');
          return res;
        }
        case '/': {
          if (right === 0) {
            throw new Error('Division by zero');
          }
          const res = left / right;
          if (!Number.isFinite(res)) throw new Error('Division overflowed to Infinity');
          return res;
        }
        case '%': {
          if (right === 0) {
            throw new Error('Modulo by zero');
          }
          return left % right;
        }
        case '^': {
          if (left === 0 && right < 0) {
            throw new Error('Division by zero (0 raised to negative exponent)');
          }
          if (left < 0 && !Number.isInteger(right)) {
            throw new Error('Negative base with non-integer exponent results in a complex number');
          }
          const res = Math.pow(left, right);
          if (!Number.isFinite(res)) {
            throw new Error('Calculation overflowed to Infinity (runaway exponentiation)');
          }
          return res;
        }
        default:
          throw new Error(`Unknown binary operator: ${(node as any).operator}`);
      }
    }

    case 'FunctionCall': {
      const evaluatedArgs = node.args.map((a) => evaluateAST(a, angleMode, scope));
      return evaluateFunction(node.name, evaluatedArgs, angleMode);
    }

    default:
      throw new Error(`Unknown AST node type: ${(node as any).type}`);
  }
}

function evaluateFunction(name: string, args: number[], angleMode: AngleMode): number {
  const argCount = args.length;

  switch (name) {
    case 'sin': {
      if (argCount !== 1) throw new Error(`sin() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (angleMode === 'deg') {
        const norm = ((val % 360) + 360) % 360;
        if (norm === 0 || norm === 180 || norm === 360) return 0;
        if (norm === 90) return 1;
        if (norm === 270) return -1;
        if (norm === 30 || norm === 150) return 0.5;
        if (norm === 210 || norm === 330) return -0.5;
        return Math.sin(val * (Math.PI / 180));
      }
      return Math.sin(val);
    }

    case 'cos': {
      if (argCount !== 1) throw new Error(`cos() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (angleMode === 'deg') {
        const norm = ((val % 360) + 360) % 360;
        if (norm === 90 || norm === 270) return 0;
        if (norm === 0 || norm === 360) return 1;
        if (norm === 180) return -1;
        if (norm === 60 || norm === 300) return 0.5;
        if (norm === 120 || norm === 240) return -0.5;
        return Math.cos(val * (Math.PI / 180));
      }
      return Math.cos(val);
    }

    case 'tan': {
      if (argCount !== 1) throw new Error(`tan() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (angleMode === 'deg') {
        const norm = ((val % 360) + 360) % 360;
        if (norm === 90 || norm === 270) {
          throw new Error('Tangent is undefined at 90° and 270° (vertical asymptote)');
        }
        if (norm === 0 || norm === 180 || norm === 360) return 0;
        if (norm === 45 || norm === 225) return 1;
        if (norm === 135 || norm === 315) return -1;
        return Math.tan(val * (Math.PI / 180));
      }
      if (Math.abs(Math.cos(val)) < 1e-15) {
        throw new Error('Tangent is undefined at vertical asymptote');
      }
      return Math.tan(val);
    }

    case 'asin': {
      if (argCount !== 1) throw new Error(`asin() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (val < -1 || val > 1) {
        throw new Error(`asin input (${val}) out of range [-1, 1]`);
      }
      const rad = Math.asin(val);
      return angleMode === 'deg' ? rad * (180 / Math.PI) : rad;
    }

    case 'acos': {
      if (argCount !== 1) throw new Error(`acos() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (val < -1 || val > 1) {
        throw new Error(`acos input (${val}) out of range [-1, 1]`);
      }
      const rad = Math.acos(val);
      return angleMode === 'deg' ? rad * (180 / Math.PI) : rad;
    }

    case 'atan': {
      if (argCount !== 1) throw new Error(`atan() takes 1 argument, got ${argCount}`);
      const val = args[0];
      const rad = Math.atan(val);
      return angleMode === 'deg' ? rad * (180 / Math.PI) : rad;
    }

    case 'sinh': {
      if (argCount !== 1) throw new Error(`sinh() takes 1 argument, got ${argCount}`);
      const res = Math.sinh(args[0]);
      if (!Number.isFinite(res)) throw new Error('sinh() overflowed');
      return res;
    }

    case 'cosh': {
      if (argCount !== 1) throw new Error(`cosh() takes 1 argument, got ${argCount}`);
      const res = Math.cosh(args[0]);
      if (!Number.isFinite(res)) throw new Error('cosh() overflowed');
      return res;
    }

    case 'tanh': {
      if (argCount !== 1) throw new Error(`tanh() takes 1 argument, got ${argCount}`);
      return Math.tanh(args[0]);
    }

    case 'log': {
      if (argCount !== 1) throw new Error(`log() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (val <= 0) {
        throw new Error(`Logarithm of non-positive number (${val}) is undefined in real numbers`);
      }
      return Math.log10(val);
    }

    case 'ln': {
      if (argCount !== 1) throw new Error(`ln() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (val <= 0) {
        throw new Error(`Natural logarithm of non-positive number (${val}) is undefined in real numbers`);
      }
      return Math.log(val);
    }

    case 'log2': {
      if (argCount !== 1) throw new Error(`log2() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (val <= 0) {
        throw new Error(`log2 of non-positive number (${val}) is undefined in real numbers`);
      }
      return Math.log2(val);
    }

    case 'logbase': {
      if (argCount !== 2) throw new Error(`logBase(x, b) takes 2 arguments, got ${argCount}`);
      const [x, b] = args;
      if (x <= 0) throw new Error('logBase argument x must be greater than 0');
      if (b <= 0 || b === 1) throw new Error('logBase base b must be greater than 0 and not equal to 1');
      return Math.log(x) / Math.log(b);
    }

    case 'sqrt': {
      if (argCount !== 1) throw new Error(`sqrt() takes 1 argument, got ${argCount}`);
      const val = args[0];
      if (val < 0) {
        throw new Error(`Square root of negative number (${val}) is undefined in real numbers`);
      }
      return Math.sqrt(val);
    }

    case 'cbrt': {
      if (argCount !== 1) throw new Error(`cbrt() takes 1 argument, got ${argCount}`);
      return Math.cbrt(args[0]);
    }

    case 'nthroot': {
      if (argCount !== 2) throw new Error(`nthRoot(x, n) takes 2 arguments, got ${argCount}`);
      const [x, n] = args;
      if (n === 0) throw new Error('0th root is undefined (division by zero index)');
      if (x < 0 && n % 2 === 0) {
        throw new Error(`Even root (${n}) of negative number (${x}) is undefined in real numbers`);
      }
      if (x < 0) {
        return -Math.pow(-x, 1 / n);
      }
      return Math.pow(x, 1 / n);
    }

    case 'abs': {
      if (argCount !== 1) throw new Error(`abs() takes 1 argument, got ${argCount}`);
      return Math.abs(args[0]);
    }

    case 'exp': {
      if (argCount !== 1) throw new Error(`exp() takes 1 argument, got ${argCount}`);
      const res = Math.exp(args[0]);
      if (!Number.isFinite(res)) throw new Error('exp() overflowed to Infinity');
      return res;
    }

    case 'floor': {
      if (argCount !== 1) throw new Error(`floor() takes 1 argument, got ${argCount}`);
      return Math.floor(args[0]);
    }

    case 'ceil': {
      if (argCount !== 1) throw new Error(`ceil() takes 1 argument, got ${argCount}`);
      return Math.ceil(args[0]);
    }

    case 'round': {
      if (argCount !== 1) throw new Error(`round() takes 1 argument, got ${argCount}`);
      return Math.round(args[0]);
    }

    case 'ncr': {
      if (argCount !== 2) throw new Error(`nCr(n, r) takes 2 arguments, got ${argCount}`);
      return nCr(args[0], args[1]);
    }

    case 'npr': {
      if (argCount !== 2) throw new Error(`nPr(n, r) takes 2 arguments, got ${argCount}`);
      return nPr(args[0], args[1]);
    }

    case 'min': {
      if (argCount < 1) throw new Error('min() requires at least 1 argument');
      return Math.min(...args);
    }

    case 'max': {
      if (argCount < 1) throw new Error('max() requires at least 1 argument');
      return Math.max(...args);
    }

    default:
      throw new Error(`Unsupported function: "${name}"`);
  }
}

export function evaluateExpression(
  expression: string,
  angleMode: AngleMode = 'deg',
  scope: Record<string, number> = {}
): EvaluationOutput {
  const tokens = tokenize(expression);
  const ast = parse(tokens);
  const result = evaluateAST(ast, angleMode, scope);

  if (!Number.isFinite(result)) {
    throw new Error('Calculation result overflowed to Infinity');
  }
  if (Number.isNaN(result)) {
    throw new Error('Calculation resulted in an invalid number (NaN)');
  }

  const formatted = formatResult(result);
  return { result, formatted };
}

export function generateGraphPoints(
  expression: string,
  angleMode: AngleMode = 'rad',
  xMin: number = -10,
  xMax: number = 10,
  pointsCount: number = 250
): GraphOutput {
  if (!Number.isFinite(xMin) || !Number.isFinite(xMax)) {
    throw new Error('Graph bounds xMin and xMax must be finite numbers');
  }
  if (xMin >= xMax) {
    throw new Error(`xMin (${xMin}) must be strictly less than xMax (${xMax})`);
  }
  if (pointsCount < 20 || pointsCount > 1000) {
    throw new Error('pointsCount must be between 20 and 1000');
  }

  const tokens = tokenize(expression);
  const ast = parse(tokens);

  const vars = Array.from(findVariables(ast));
  const nonXVars = vars.filter((v) => v !== 'x');
  if (nonXVars.length > 0) {
    throw new Error(
      `Multiple variables detected: [${nonXVars.join(', ')}]. 2D plotting only supports functions of single variable "x".`
    );
  }

  const points: GraphPoint[] = [];
  const step = (xMax - xMin) / (pointsCount - 1);

  let prevY: number | null = null;

  for (let i = 0; i < pointsCount; i++) {
    const xVal = xMin + i * step;
    // Format xVal to avoid floating point representation noise
    const cleanX = Number(xVal.toFixed(6));

    try {
      const yVal = evaluateAST(ast, angleMode, { x: cleanX });

      if (!Number.isFinite(yVal) || Number.isNaN(yVal)) {
        points.push({ x: cleanX, y: null });
        prevY = null;
        continue;
      }

      // Detect asymptote discontinuity (e.g. tan(x) or 1/x jumping between +/- extreme values)
      if (prevY !== null && Math.abs(yVal - prevY) > 500 && Math.sign(yVal) !== Math.sign(prevY)) {
        points.push({ x: cleanX, y: null });
        prevY = null;
        continue;
      }

      // Clamp extreme display values to avoid crushing the chart scale
      if (Math.abs(yVal) > 1e6) {
        points.push({ x: cleanX, y: null });
        prevY = null;
        continue;
      }

      points.push({ x: cleanX, y: yVal });
      prevY = yVal;
    } catch {
      // Point undefined in domain (e.g. sqrt(-x), division by zero, etc.)
      points.push({ x: cleanX, y: null });
      prevY = null;
    }
  }

  return {
    points,
    detectedVariables: vars,
    xMin,
    xMax,
  };
}
