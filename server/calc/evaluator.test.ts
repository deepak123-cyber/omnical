import { describe, expect, it } from 'vitest';
import {
  evaluateExpression,
  factorial,
  nCr,
  nPr,
  generateGraphPoints,
} from './evaluator.js';

describe('Scientific Calculator Core Evaluation', () => {
  describe('Operator Precedence & Associativity', () => {
    it('evaluates addition and multiplication with correct precedence', () => {
      expect(evaluateExpression('2 + 3 * 4').result).toBe(14);
      expect(evaluateExpression('(2 + 3) * 4').result).toBe(20);
    });

    it('evaluates exponentiation before multiplication', () => {
      expect(evaluateExpression('2 * 3 ^ 2').result).toBe(18);
    });

    it('evaluates exponentiation as right-associative', () => {
      // 2 ^ (3 ^ 2) = 2 ^ 9 = 512, NOT (2 ^ 3) ^ 2 = 64
      expect(evaluateExpression('2 ^ 3 ^ 2').result).toBe(512);
    });

    it('evaluates unary minus and powers correctly', () => {
      expect(evaluateExpression('-2 ^ 2').result).toBe(-4);
      expect(evaluateExpression('(-2) ^ 2').result).toBe(4);
      expect(evaluateExpression('2 ^ -2').result).toBe(0.25);
    });

    it('evaluates left-associative subtraction and division', () => {
      expect(evaluateExpression('10 - 4 - 2').result).toBe(4);
      expect(evaluateExpression('10 / 2 / 2').result).toBe(2.5);
    });

    it('handles modulo operator', () => {
      expect(evaluateExpression('17 % 5').result).toBe(2);
    });
  });

  describe('Implicit Multiplication', () => {
    it('multiplies number before constant', () => {
      expect(evaluateExpression('2pi').result).toBeCloseTo(2 * Math.PI);
      expect(evaluateExpression('2π').result).toBeCloseTo(2 * Math.PI);
    });

    it('multiplies number before parenthesis', () => {
      expect(evaluateExpression('3(4 + 5)').result).toBe(27);
    });

    it('multiplies parenthesis before parenthesis', () => {
      expect(evaluateExpression('(2 + 3)(4 + 5)').result).toBe(45);
    });

    it('multiplies number before function', () => {
      expect(evaluateExpression('2sin(30)', 'deg').result).toBeCloseTo(1);
    });

    it('multiplies after factorial', () => {
      expect(evaluateExpression('5! 2').result).toBe(240);
      expect(evaluateExpression('3!(2)').result).toBe(12);
    });

    it('multiplies variables in scope', () => {
      expect(evaluateExpression('2x', 'deg', { x: 5 }).result).toBe(10);
      expect(evaluateExpression('3x^2', 'deg', { x: 4 }).result).toBe(48);
    });
  });

  describe('Trigonometry in DEG and RAD Modes', () => {
    it('evaluates exact DEG trigonometric angles cleanly', () => {
      expect(evaluateExpression('sin(30)', 'deg').result).toBe(0.5);
      expect(evaluateExpression('sin(180)', 'deg').result).toBe(0);
      expect(evaluateExpression('cos(60)', 'deg').result).toBe(0.5);
      expect(evaluateExpression('cos(90)', 'deg').result).toBe(0);
      expect(evaluateExpression('tan(45)', 'deg').result).toBe(1);
      expect(evaluateExpression('tan(0)', 'deg').result).toBe(0);
    });

    it('evaluates RAD trigonometric functions correctly', () => {
      expect(evaluateExpression('sin(pi / 6)', 'rad').result).toBeCloseTo(0.5);
      expect(evaluateExpression('cos(0)', 'rad').result).toBe(1);
      expect(evaluateExpression('tan(pi / 4)', 'rad').result).toBeCloseTo(1);
    });

    it('evaluates inverse trigonometric functions in both modes', () => {
      expect(evaluateExpression('asin(0.5)', 'deg').result).toBeCloseTo(30);
      expect(evaluateExpression('acos(0.5)', 'deg').result).toBeCloseTo(60);
      expect(evaluateExpression('atan(1)', 'deg').result).toBeCloseTo(45);

      expect(evaluateExpression('asin(1)', 'rad').result).toBeCloseTo(Math.PI / 2);
      expect(evaluateExpression('atan(1)', 'rad').result).toBeCloseTo(Math.PI / 4);
    });

    it('evaluates hyperbolic functions', () => {
      expect(evaluateExpression('sinh(0)').result).toBe(0);
      expect(evaluateExpression('cosh(0)').result).toBe(1);
      expect(evaluateExpression('tanh(0)').result).toBe(0);
    });
  });

  describe('Constants, Combinatorics & Functions', () => {
    it('evaluates scientific constants', () => {
      expect(evaluateExpression('e').result).toBeCloseTo(Math.E);
      expect(evaluateExpression('phi').result).toBeCloseTo(1.6180339887);
      expect(evaluateExpression('c').result).toBe(299792458);
      expect(evaluateExpression('g').result).toBe(9.80665);
      expect(evaluateExpression('h').result).toBe(6.62607015e-34);
      expect(evaluateExpression('NA').result).toBe(6.02214076e23);
    });

    it('computes factorial, nCr, and nPr', () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(5)).toBe(120);
      expect(nCr(5, 2)).toBe(10);
      expect(nPr(5, 2)).toBe(20);
      expect(evaluateExpression('nCr(6, 3)').result).toBe(20);
      expect(evaluateExpression('nPr(6, 3)').result).toBe(120);
    });

    it('computes roots and logarithms', () => {
      expect(evaluateExpression('sqrt(25)').result).toBe(5);
      expect(evaluateExpression('cbrt(-27)').result).toBe(-3);
      expect(evaluateExpression('nthRoot(81, 4)').result).toBe(3);
      expect(evaluateExpression('nthRoot(-32, 5)').result).toBe(-2);
      expect(evaluateExpression('log(1000)').result).toBe(3);
      expect(evaluateExpression('ln(e)').result).toBe(1);
      expect(evaluateExpression('log2(16)').result).toBe(4);
      expect(evaluateExpression('logBase(64, 4)').result).toBe(3);
    });

    it('computes min, max, floor, ceil, round', () => {
      expect(evaluateExpression('min(10, 5, 20)').result).toBe(5);
      expect(evaluateExpression('max(10, 5, 20)').result).toBe(20);
      expect(evaluateExpression('floor(3.7)').result).toBe(3);
      expect(evaluateExpression('ceil(3.2)').result).toBe(4);
      expect(evaluateExpression('round(3.5)').result).toBe(4);
    });

    it('formats decimal rounding cleanly', () => {
      expect(evaluateExpression('0.1 + 0.2').formatted).toBe('0.3');
    });
  });

  describe('Error Paths & Safety Validation', () => {
    it('rejects division by zero', () => {
      expect(() => evaluateExpression('5 / 0')).toThrow(/Division by zero/);
    });

    it('rejects modulo by zero', () => {
      expect(() => evaluateExpression('5 % 0')).toThrow(/Modulo by zero/);
    });

    it('rejects square root of negative numbers', () => {
      expect(() => evaluateExpression('sqrt(-4)')).toThrow(/negative number/);
    });

    it('rejects even roots of negative numbers', () => {
      expect(() => evaluateExpression('nthRoot(-16, 4)')).toThrow(/Even root/);
    });

    it('rejects logarithms of non-positive numbers', () => {
      expect(() => evaluateExpression('ln(-1)')).toThrow(/non-positive/);
      expect(() => evaluateExpression('log(0)')).toThrow(/non-positive/);
    });

    it('rejects out of range inverse trig arguments', () => {
      expect(() => evaluateExpression('asin(1.5)')).toThrow(/out of range/);
      expect(() => evaluateExpression('acos(-2)')).toThrow(/out of range/);
    });

    it('rejects undefined tangent asymptotes in DEG mode', () => {
      expect(() => evaluateExpression('tan(90)', 'deg')).toThrow(/vertical asymptote/);
      expect(() => evaluateExpression('tan(270)', 'deg')).toThrow(/vertical asymptote/);
    });

    it('rejects negative or non-integer factorials', () => {
      expect(() => evaluateExpression('(-5)!')).toThrow();
      expect(() => evaluateExpression('(3.5)!')).toThrow();
    });

    it('guards against factorial overflow > 170!', () => {
      expect(() => evaluateExpression('171!')).toThrow(/exceeds limit/);
    });

    it('guards against runaway exponentiation overflow', () => {
      expect(() => evaluateExpression('10 ^ 400')).toThrow(/overflowed to Infinity/);
    });

    it('rejects expressions exceeding 500 characters', () => {
      const longExpr = '1+' + '1+'.repeat(300) + '1';
      expect(() => evaluateExpression(longExpr)).toThrow(/maximum length/);
    });

    it('guards against excessive recursion depth', () => {
      const deepExpr = '('.repeat(55) + '1' + ')'.repeat(55);
      expect(() => evaluateExpression(deepExpr)).toThrow(/recursion depth/);
    });
  });

  describe('Graphing Points Generation & Behavior', () => {
    it('generates points for valid function f(x)', () => {
      const graph = generateGraphPoints('x^2', 'rad', -5, 5, 21);
      expect(graph.points.length).toBe(21);
      expect(graph.points[0].y).toBeCloseTo(25);
      expect(graph.points[10].y).toBeCloseTo(0);
      expect(graph.points[20].y).toBeCloseTo(25);
    });

    it('handles undefined behavior gracefully by setting null y value', () => {
      const graph = generateGraphPoints('sqrt(x)', 'rad', -5, 5, 21);
      expect(graph.points.length).toBe(21);
      // Points where x < 0 should be null
      const negativeX = graph.points.filter((p) => p.x < 0);
      expect(negativeX.every((p) => p.y === null)).toBe(true);
      // Points where x > 0 should have numbers
      const positiveX = graph.points.filter((p) => p.x > 0);
      expect(positiveX.some((p) => typeof p.y === 'number')).toBe(true);
    });

    it('detects and rejects multiple variables on 2D graph', () => {
      expect(() => generateGraphPoints('x + y', 'rad', -5, 5)).toThrow(/Multiple variables detected/);
    });

    it('rejects invalid range where xMin >= xMax', () => {
      expect(() => generateGraphPoints('x^2', 'rad', 10, -10)).toThrow(/strictly less than/);
    });
  });
});
