/**
 * Scientific Calculator Constants
 */

export const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2, // 1.618033988749895
  c: 299792458, // Speed of light in vacuum (m/s)
  g: 9.80665, // Standard acceleration of gravity (m/s²)
  h: 6.62607015e-34, // Planck constant (J·s)
  na: 6.02214076e23, // Avogadro constant (mol⁻¹)
};

export const CONSTANT_SYMBOLS: Record<string, string> = {
  'π': 'pi',
  'φ': 'phi',
  'NA': 'na',
  'Na': 'na',
};
