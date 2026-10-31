/**
 * Scientific Calculator Recursive-Descent Parser
 * Builds an AST with precedence, associativity, function calls, constants, variables, and recursion safety.
 */

import { Token, isVariableName } from './tokenizer.js';
import { CONSTANTS, CONSTANT_SYMBOLS } from './constants.js';

export type ASTNode =
  | NumberNode
  | ConstantNode
  | VariableNode
  | UnaryNode
  | BinaryNode
  | PostfixNode
  | FunctionCallNode;

export interface NumberNode {
  type: 'Number';
  value: number;
}

export interface ConstantNode {
  type: 'Constant';
  name: string;
}

export interface VariableNode {
  type: 'Variable';
  name: string;
}

export interface UnaryNode {
  type: 'Unary';
  operator: '+' | '-';
  argument: ASTNode;
}

export interface BinaryNode {
  type: 'Binary';
  operator: '+' | '-' | '*' | '/' | '%' | '^';
  left: ASTNode;
  right: ASTNode;
}

export interface PostfixNode {
  type: 'Postfix';
  operator: '!';
  argument: ASTNode;
}

export interface FunctionCallNode {
  type: 'FunctionCall';
  name: string;
  args: ASTNode[];
}

export class Parser {
  private tokens: Token[];
  private current = 0;
  private depth = 0;
  private readonly maxDepth = 50;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): ASTNode {
    this.current = 0;
    this.depth = 0;

    if (this.isAtEnd() || this.peek().type === 'EOF') {
      throw new Error('Empty expression');
    }

    const ast = this.expression();

    if (!this.isAtEnd() && this.peek().type !== 'EOF') {
      const tok = this.peek();
      throw new Error(`Unexpected token "${tok.value}" at position ${tok.position}`);
    }

    return ast;
  }

  private enter(): void {
    this.depth++;
    if (this.depth > this.maxDepth) {
      throw new Error('Maximum recursion depth exceeded (expression nesting too deep)');
    }
  }

  private leave(): void {
    this.depth--;
  }

  // Precedence level 1: + and - (binary)
  private expression(): ASTNode {
    this.enter();
    try {
      let node = this.term();

      while (this.matchOperator('+', '-')) {
        const op = this.previous().value as '+' | '-';
        const right = this.term();
        node = {
          type: 'Binary',
          operator: op,
          left: node,
          right,
        };
      }

      return node;
    } finally {
      this.leave();
    }
  }

  // Precedence level 2: *, /, %
  private term(): ASTNode {
    this.enter();
    try {
      let node = this.unary();

      while (this.matchOperator('*', '/', '%')) {
        const op = this.previous().value as '*' | '/' | '%';
        const right = this.unary();
        node = {
          type: 'Binary',
          operator: op,
          left: node,
          right,
        };
      }

      return node;
    } finally {
      this.leave();
    }
  }

  // Precedence level 3: Unary + and -
  private unary(): ASTNode {
    this.enter();
    try {
      if (this.matchOperator('+', '-')) {
        const op = this.previous().value as '+' | '-';
        const argument = this.unary();
        return {
          type: 'Unary',
          operator: op,
          argument,
        };
      }

      return this.power();
    } finally {
      this.leave();
    }
  }

  // Precedence level 4: Exponentiation ^ (Right-associative)
  private power(): ASTNode {
    this.enter();
    try {
      const base = this.postfix();

      if (this.matchOperator('^')) {
        const exponent = this.unary();
        return {
          type: 'Binary',
          operator: '^',
          left: base,
          right: exponent,
        };
      }

      return base;
    } finally {
      this.leave();
    }
  }

  // Precedence level 5: Postfix factorial !
  private postfix(): ASTNode {
    this.enter();
    try {
      let node = this.primary();

      while (this.matchOperator('!')) {
        node = {
          type: 'Postfix',
          operator: '!',
          argument: node,
        };
      }

      return node;
    } finally {
      this.leave();
    }
  }

  // Precedence level 6: Primaries
  private primary(): ASTNode {
    this.enter();
    try {
      const tok = this.peek();

      // Number literal
      if (tok.type === 'NUMBER') {
        this.advance();
        return {
          type: 'Number',
          value: tok.numberValue !== undefined ? tok.numberValue : Number(tok.value),
        };
      }

      // Identifier: function call, constant, or variable
      if (tok.type === 'IDENTIFIER') {
        const name = tok.value;
        this.advance();

        // Function call: name followed by '('
        if (this.check('LPAREN')) {
          this.advance(); // consume '('
          const args: ASTNode[] = [];

          if (!this.check('RPAREN')) {
            do {
              args.push(this.expression());
            } while (this.match('COMMA'));
          }

          this.consume('RPAREN', `Expected ')' after function arguments for "${name}"`);
          return {
            type: 'FunctionCall',
            name: name.toLowerCase(),
            args,
          };
        }

        // Variable 'x'
        if (isVariableName(name)) {
          return {
            type: 'Variable',
            name: 'x',
          };
        }

        // Constant without parens
        const norm = CONSTANT_SYMBOLS[name] || name.toLowerCase();
        if (norm in CONSTANTS) {
          return {
            type: 'Constant',
            name: norm,
          };
        }

        // Other variable identifier (e.g. y, z, t) - captured to provide descriptive error if unsupported
        return {
          type: 'Variable',
          name: name.toLowerCase(),
        };
      }

      // Grouping: ( expr )
      if (this.check('LPAREN')) {
        this.advance();
        const expr = this.expression();
        this.consume('RPAREN', `Expected closing ')' to match opening '(' at position ${tok.position}`);
        return expr;
      }

      throw new Error(`Unexpected token "${tok.value || 'EOF'}" at position ${tok.position}`);
    } finally {
      this.leave();
    }
  }

  private peek(): Token {
    return this.tokens[this.current] || { type: 'EOF', value: '', position: 0 };
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length || this.peek().type === 'EOF';
  }

  private advance(): Token {
    if (!this.isAtEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private check(type: Token['type']): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private match(...types: Token['type'][]): boolean {
    for (const t of types) {
      if (this.check(t)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private matchOperator(...ops: string[]): boolean {
    if (this.isAtEnd()) return false;
    const tok = this.peek();
    if (tok.type === 'OPERATOR' && ops.includes(tok.value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private consume(type: Token['type'], message: string): Token {
    if (this.check(type)) return this.advance();
    const tok = this.peek();
    throw new Error(`${message}. Found "${tok.value || 'EOF'}" at position ${tok.position}`);
  }
}

export function parse(tokens: Token[]): ASTNode {
  return new Parser(tokens).parse();
}

export function findVariables(node: ASTNode, vars = new Set<string>()): Set<string> {
  switch (node.type) {
    case 'Variable':
      vars.add(node.name);
      break;
    case 'Unary':
    case 'Postfix':
      findVariables(node.argument, vars);
      break;
    case 'Binary':
      findVariables(node.left, vars);
      findVariables(node.right, vars);
      break;
    case 'FunctionCall':
      node.args.forEach((a) => findVariables(a, vars));
      break;
    default:
      break;
  }
  return vars;
}
