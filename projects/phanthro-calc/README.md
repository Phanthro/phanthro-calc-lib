# **PhanthroCalc**

PhanthroCalc is a library for calculating mathematical expressions based on binary trees. It supports mathematical expressions, logical operators, and custom operators.

## **Installation**

You can install the library via npm:

```bash
npm install phanthro-calc
```

## **Basic Usage**

You can use the library to evaluate mathematical expressions. Here's an example:

```typescript
import { PhanthroCalc } from 'phanthro-calc';

const expression = "10 + 5 * 2";
const result = PhanthroCalc.evaluate(expression, {});
console.log(result); // Output: 20
```

## **Variables in Expressions**

You can use variables in your expressions. Here's how:

```typescript
const expression = "x * y + 10";
const variables = { x: 5, y: 3 };
const result = PhanthroCalc.evaluate(expression, variables);
console.log(result); // Output: 25
```

## **Custom Operators**

You can add your own mathematical and logical operators. Here's an example of how to add custom operators:

```typescript
PhanthroCalc.configure({
  operators: new Map([
    ['%', (a, b) => a % b], // Modulo operator
    ['^^', (a, b) => Math.pow(a, 1 / b)] // N-th root
  ])
});

console.log(PhanthroCalc.evaluate("10 % 3", {})); // Output: 1
console.log(PhanthroCalc.evaluate("27 ^^ 3", {})); // Output: 3
```

## **Operator Mappings**

You can also map operators to new representations. Here's how you can do it:

```typescript
PhanthroCalc.configure({
  mappings: {
    'MOD': '%',
    'RAIZ': '^^'
  }
});

console.log(PhanthroCalc.evaluate("10 MOD 3", {})); // Output: 1
console.log(PhanthroCalc.evaluate("27 RAIZ 3", {})); // Output: 3
```

## **Getting the Root Operator**

If you need to find the root operator of the expression, use:

```typescript
console.log(PhanthroCalc.getExpressionRoot("10 + 5 * 2")); // Output: "+"
```

## **Getting the Binary Tree**

You can also get the binary tree representation of the expression:

```typescript
const tree = PhanthroCalc.getBinaryTree("10 + 5 * 2");
console.log(tree);
```

## **Restrictions**

* Custom operators must have a maximum length of **2 characters**.
* **Asynchronous operators** (`async`) are not allowed.
* Malformed expressions (e.g., `"5 +"`) will throw an error.