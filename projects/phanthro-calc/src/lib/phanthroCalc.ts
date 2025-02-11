import { TreeNode } from './treeNode';

class ExpressionTree {
  private static operatorMapping: any = {
    '^': '**',
    'AND': '&&',
    'OR': '||',
  };

  private static precedence: any = {
    '||': 0,
    '&&': 1,
    '==': 2,
    '!=': 2,
    '<': 3,
    '>': 3,
    '<=': 3,
    '>=': 3,
    '+': 4,
    '-': 4,
    '*': 5,
    '/': 5,
    '^': 6,
    '?': 7,
    ':': 7,
  };

  static customMapping: any = [];
  static customOperators = new Map();

  static addOperator(symbol: string, handler: any, precedence?: number) {
    if (typeof handler !== 'function') {
      throw new Error(`The operator "${symbol}" must be a function.`);
    }

    if (symbol.length > 2) {
      throw new Error(
        `Custom operators cannot exceed 2 characters: "${symbol}"`
      );
    }

    const testResult = handler(1, 1);
    if (testResult instanceof Promise) {
      throw new Error(`Asynchronous operators are not allowed: "${symbol}"`);
    }

    if (precedence === undefined) {
      console.warn(
        `Warning: No precedence provided for "${symbol}". Using default precedence: 5.`
      );
      precedence = 5;
    }

    this.customOperators.set(symbol, handler);
    this.precedence[symbol] = precedence;
  }

  static addMapping(operator: string, newOperator: any) {
    this.customMapping[operator] = newOperator;
  }

  static findRootOperator(expression: string) {
    let minPrecedence = Infinity;
    let rootIndex = -1;
    let parenthesesDepth = 0;
    let lastQuestionMark = -1;

    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') parenthesesDepth++;
      else if (expression[i] === ')') parenthesesDepth--;
      else if (parenthesesDepth === 0) {
        if (expression[i] === '?') lastQuestionMark = i;
        if (expression[i] === ':') {
          if (lastQuestionMark !== -1) {
            rootIndex = lastQuestionMark;
            break;
          }
        }
        for (const op in this.precedence) {
          if (expression.slice(i, i + op.length) === op) {
            if (this.precedence[op] <= minPrecedence) {
              minPrecedence = this.precedence[op];
              rootIndex = i;
            }
          }
        }
      }
    }
    return rootIndex;
  }

  static buildExpressionTree(expression: string): TreeNode | null {
    expression = expression.trim();
    if (expression === '') return null;

    // Checking if the expression ends with an operator without a right operand
    const lastChar = expression[expression.length - 1];
    const lastTwoChars = expression.slice(-2);
    if (
      ['+', '-', '*', '/', '^', '?', ':'].includes(lastChar) ||
      this.precedence.hasOwnProperty(lastTwoChars)
    ) {
      throw new Error(
        'Incomplete expression: operator at the end without operand'
      );
    }

    if (/^\w+$/.test(expression)) return new TreeNode(expression);

    if (expression.startsWith('(') && expression.endsWith(')')) {
      let depth = 0;
      let isWrapped = true;
      for (let i = 0; i < expression.length; i++) {
        if (expression[i] === '(') depth++;
        else if (expression[i] === ')') depth--;
        if (depth === 0 && i < expression.length - 1) {
          isWrapped = false;
          break;
        }
      }
      if (isWrapped) expression = expression.slice(1, -1);
    }

    const rootIndex = this.findRootOperator(expression);
    if (rootIndex === -1) return new TreeNode(expression);

    let op = expression[rootIndex];
    if (
      rootIndex + 1 < expression.length &&
      this.precedence.hasOwnProperty(expression.substr(rootIndex, 2))
    ) {
      op = expression.slice(rootIndex, rootIndex + 2);
    }

    if (op === '?') {
      const colonIndex = expression.indexOf(':', rootIndex);
      if (colonIndex === -1) throw new Error('Malformed ternary operator');
      const root = new TreeNode('?');
      root.left = this.buildExpressionTree(
        expression.slice(0, rootIndex).trim()
      );
      root.right = new TreeNode(':');
      root.right.left = this.buildExpressionTree(
        expression.slice(rootIndex + 1, colonIndex).trim()
      );
      root.right.right = this.buildExpressionTree(
        expression.slice(colonIndex + 1).trim()
      );
      return root;
    }

    const node = new TreeNode(
      this.operatorMapping[op] || this.customMapping[op] || op
    );
    node.left = this.buildExpressionTree(expression.slice(0, rootIndex).trim());
    node.right = this.buildExpressionTree(
      expression.slice(rootIndex + op.length).trim()
    );
    return node;
  }

  private static treeToTransformedExpression(
    node: TreeNode | null
  ): string | number {
    if (node === null) return '';
    if (node.left === null && node.right === null) return node.value;

    const leftExpr = this.treeToTransformedExpression(node.left);
    const rightExpr = this.treeToTransformedExpression(node.right);

    switch (node.value) {
      case '**':
        return `Math.pow(${leftExpr}, ${rightExpr})`;
      case '?':
        return `(${leftExpr} ? ${this.treeToTransformedExpression(
          node.right?.left ?? null
        )} : ${this.treeToTransformedExpression(node.right?.right ?? null)})`;
      case ':':
        return this.treeToTransformedExpression(node.right?.left ?? null);
      default:
        return `(${leftExpr} ${node.value} ${rightExpr})`;
    }
  }

  static evaluateExpressionTree(node: TreeNode | null, variables: any): number {
    if (node === null) return NaN;
    if (node.left === null && node.right === null) {
      const num = parseFloat(node.value.toString());
      if (!isNaN(num)) return num;
      if (!(node.value in variables))
        throw new Error(`Undefined variable: ${node.value}`);
      return variables[node.value];
    }

    const leftValue = this.evaluateExpressionTree(node.left, variables);
    const rightValue = this.evaluateExpressionTree(node.right, variables);

    // Checks if the operator is custom
    if (this.customOperators.has(node.value)) {
      return this.customOperators.get(node.value)(leftValue, rightValue);
    }

    switch (node.value) {
      case '+':
        return leftValue + rightValue;
      case '-':
        return leftValue - rightValue;
      case '*':
        return leftValue * rightValue;
      case '/':
        return leftValue / rightValue;
      case '**':
        return Math.pow(leftValue, rightValue);
      case '&&':
        return leftValue !== 0 && rightValue !== 0 ? 1 : 0;
      case '||':
        return leftValue !== 0 || rightValue !== 0 ? 1 : 0;
      case '==':
        return leftValue === rightValue ? 1 : 0;
      case '!=':
        return leftValue !== rightValue ? 1 : 0;
      case '<':
        return leftValue < rightValue ? 1 : 0;
      case '>':
        return leftValue > rightValue ? 1 : 0;
      case '<=':
        return leftValue <= rightValue ? 1 : 0;
      case '>=':
        return leftValue >= rightValue ? 1 : 0;
      case '?':
        return leftValue !== 0
          ? this.evaluateExpressionTree(node.right?.left ?? null, variables)
          : this.evaluateExpressionTree(node.right?.right ?? null, variables);
      case ':':
        return this.evaluateExpressionTree(node.right?.left ?? null, variables);
      default:
        throw new Error(`Unknown operator: ${node.value}`);
    }
  }
}

export class PhanthroCalc {
  public static configure(options: {
    operators?: Map<string, Function>;
    mappings?: Record<string, string>;
  }) {
    if (options.operators) {
      options.operators.forEach((handler, symbol) => {
        ExpressionTree.addOperator(symbol, handler);
      });
    }

    if (options.mappings) {
      Object.entries(options.mappings).forEach(([operator, newOperator]) => {
        ExpressionTree.addMapping(operator, newOperator);
      });
    }
  }

  public static evaluate(expression: string, variables: any) {
    const tree = ExpressionTree.buildExpressionTree(expression);
    return ExpressionTree.evaluateExpressionTree(tree, variables);
  }
  public static getBinaryTree(expression: string): TreeNode | null {
    return ExpressionTree.buildExpressionTree(expression);
  }
  public static getExpressionRoot(expression: string): string | null {
    const rootIndex = ExpressionTree.findRootOperator(expression);
    if (rootIndex < 0) return null;
    return expression[rootIndex];
  }
}
