/**
 * Scientific Calculator Tokenizer
 * Lexes an expression string into strongly typed tokens and inserts implicit multiplication.
 */

import { CONSTANTS, CONSTANT_SYMBOLS } from './constants.js';

export type TokenType =
  | 'NUMBER'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  numberValue?: number;
  position: number;
  implicit?: boolean;
}

const KNOWN_FUNCTIONS = new Set([
  'sin', 'cos', 'tan',
  'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh',
  'log', 'ln', 'log2',
  'sqrt', 'cbrt', 'abs', 'exp',
  'floor', 'ceil', 'round',
  'nthroot', 'logbase', 'ncr', 'npr',
  'min', 'max'
]);

export function isConstantName(name: string): boolean {
  const normalized = CONSTANT_SYMBOLS[name] || name.toLowerCase();
  return normalized in CONSTANTS;
}

export function isFunctionName(name: string): boolean {
  return KNOWN_FUNCTIONS.has(name.toLowerCase());
}

export function isVariableName(name: string): boolean {
  return name.toLowerCase() === 'x';
}

export function tokenize(input: string): Token[] {
  if (input.length > 500) {
    throw new Error('Expression exceeds maximum length of 500 characters');
  }

  const rawTokens: Token[] = [];
  let i = 0;
  const len = input.length;

  while (i < len) {
    const ch = input[i];

    // Whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Number (including scientific notation e.g. 6.02e23, 1.5e-4)
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(input[i + 1]))) {
      const start = i;
      let hasDot = ch === '.';
      i++;

      while (i < len && /[0-9]/.test(input[i])) {
        i++;
      }

      if (!hasDot && i < len && input[i] === '.') {
        hasDot = true;
        i++;
        while (i < len && /[0-9]/.test(input[i])) {
          i++;
        }
      }

      // Check for scientific exponent 'e' or 'E' followed by optional '+' or '-' and digits
      if (i < len && (input[i] === 'e' || input[i] === 'E')) {
        const nextChar = input[i + 1];
        if (
          (nextChar === '+' || nextChar === '-') &&
          i + 2 < len &&
          /[0-9]/.test(input[i + 2])
        ) {
          i += 2;
          while (i < len && /[0-9]/.test(input[i])) {
            i++;
          }
        } else if (nextChar && /[0-9]/.test(nextChar)) {
          i++;
          while (i < len && /[0-9]/.test(input[i])) {
            i++;
          }
        }
      }

      const numStr = input.slice(start, i);
      const parsed = Number(numStr);
      if (Number.isNaN(parsed)) {
        throw new Error(`Invalid number format: "${numStr}" at position ${start}`);
      }

      rawTokens.push({
        type: 'NUMBER',
        value: numStr,
        numberValue: parsed,
        position: start,
      });
      continue;
    }

    // Unicode symbols
    if (ch === '√') {
      rawTokens.push({ type: 'IDENTIFIER', value: 'sqrt', position: i });
      i++;
      continue;
    }
    if (ch === '∛') {
      rawTokens.push({ type: 'IDENTIFIER', value: 'cbrt', position: i });
      i++;
      continue;
    }
    if (ch === 'π') {
      rawTokens.push({ type: 'IDENTIFIER', value: 'pi', position: i });
      i++;
      continue;
    }
    if (ch === 'φ') {
      rawTokens.push({ type: 'IDENTIFIER', value: 'phi', position: i });
      i++;
      continue;
    }

    // Identifiers (functions, constants, or variables)
    if (/[a-zA-Z]/.test(ch)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9]/.test(input[i])) {
        i++;
      }
      const ident = input.slice(start, i);
      rawTokens.push({
        type: 'IDENTIFIER',
        value: ident,
        position: start,
      });
      continue;
    }

    // Operators
    if (ch === '+' || ch === '-' || ch === '−' || ch === '*' || ch === '×' || ch === '/' || ch === '÷' || ch === '%' || ch === '^' || ch === '!') {
      let normalized = ch;
      if (ch === '−') normalized = '-';
      if (ch === '×') normalized = '*';
      if (ch === '÷') normalized = '/';

      rawTokens.push({
        type: 'OPERATOR',
        value: normalized,
        position: i,
      });
      i++;
      continue;
    }

    // Parentheses & Comma
    if (ch === '(') {
      rawTokens.push({ type: 'LPAREN', value: '(', position: i });
      i++;
      continue;
    }
    if (ch === ')') {
      rawTokens.push({ type: 'RPAREN', value: ')', position: i });
      i++;
      continue;
    }
    if (ch === ',') {
      rawTokens.push({ type: 'COMMA', value: ',', position: i });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: "${ch}" at position ${i}`);
  }

  // Second pass: Insert implicit multiplication
  // Examples: 2x, 2pi, 3(4+5), 2sin(30), (1+2)(3+4), 5!2, pi(2), x^2
  const tokens: Token[] = [];
  for (let k = 0; k < rawTokens.length; k++) {
    const current = rawTokens[k];
    tokens.push(current);

    if (k + 1 < rawTokens.length) {
      const next = rawTokens[k + 1];

      const currentEndsValue =
        current.type === 'NUMBER' ||
        current.type === 'RPAREN' ||
        (current.type === 'OPERATOR' && current.value === '!') ||
        (current.type === 'IDENTIFIER' && (isConstantName(current.value) || isVariableName(current.value)));

      const nextStartsValue =
        next.type === 'NUMBER' ||
        next.type === 'LPAREN' ||
        (next.type === 'IDENTIFIER' && (isConstantName(next.value) || isFunctionName(next.value) || isVariableName(next.value)));

      if (currentEndsValue && nextStartsValue) {
        tokens.push({
          type: 'OPERATOR',
          value: '*',
          position: next.position,
          implicit: true,
        });
      }
    }
  }

  tokens.push({
    type: 'EOF',
    value: '',
    position: len,
  });

  return tokens;
}
