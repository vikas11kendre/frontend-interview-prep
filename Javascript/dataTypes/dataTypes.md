
## Primitive Types (7 total)

Primitives are **immutable** and compared **by value**.

| Type | Example | `typeof` returns |
|------|---------|-----------------|
| **Number** | `42`, `3.14`, `-5`, `NaN`, `Infinity` | `'number'` |
| **String** | `"hello"`, `'world'`, `` `template` `` | `'string'` |
| **Boolean** | `true`, `false` | `'boolean'` |
| **Undefined** | `let x;` → `x` is `undefined` | `'undefined'` |
| **Null** | `let y = null;` | ⚠️ `'object'` (historical bug) |
| **Symbol** (ES6+) | `Symbol('id')` — unique, immutable identifier | `'symbol'` |
| **BigInt** (ES2020+) | `9007199254740991n` — arbitrary precision integers | `'bigint'` |

---

## Non-Primitive Type (1)

Objects are **mutable** and compared **by reference**.

| Type | Examples |
|------|----------|
| **Object** | Plain objects `{ name: "Alice" }`, Arrays `[1, 2, 3]`, Functions `function() {}`, Date, RegExp, Map, Set, etc. |

```javascript
// By value (primitives)
let a = "hello";
let b = "hello";
a === b  // true ✅ — same value

// By reference (objects)
let x = { name: "Alice" };
let y = { name: "Alice" };
x === y  // false ❌ — different references in memory
```

---

## `typeof` Gotchas

```javascript
typeof 1          // 'number'
typeof 1.1        // 'number'    — no separate "float" type
typeof NaN        // 'number'    — ⚠️ "Not a Number" is a number
typeof Infinity   // 'number'

typeof "hello"    // 'string'
typeof true       // 'boolean'
typeof undefined  // 'undefined'
typeof Symbol()   // 'symbol'
typeof 1n         // 'bigint'

typeof null       // 'object'    — ⚠️ FAMOUS BUG, never fixed for backward compatibility
typeof []         // 'object'    — arrays are objects
typeof {}         // 'object'
typeof function(){} // 'function' — technically an object, but typeof gives 'function'
```

> **Interview Trap:** `typeof null === 'object'` is the #1 most-asked typeof question. It's a bug from JS v1 that can never be fixed because it would break the web.

---

## Floating-Point Precision (IEEE 754)

JavaScript stores all numbers as **64-bit double-precision floats** (IEEE 754). Some decimals like `0.1` and `0.2` **cannot be represented exactly** in binary — they get rounded internally. When you operate on two already-imprecise numbers, errors compound.

### The Problem

```javascript
0.1 + 0.2           // 0.30000000000000004
0.1 + 0.2 === 0.3   // false ❌

// But this works — because 0.2 + 0.2 = 0.4 happens to be exact in binary
0.2 + 0.2 === 0.4   // true ✅
```

### Why?

`0.1` in binary is `0.0001100110011...` (repeating forever). It gets truncated to fit 64 bits, introducing a tiny error. `0.2` has the same issue. Add two imprecise numbers → the error surfaces.

### 3 Fixes

```javascript
// Fix 1 — toFixed() (returns a string, then compare)
(0.1 + 0.2).toFixed(1) === "0.3"   // true

// Fix 2 — Multiply to work in integers, then divide back
(0.1 * 10 + 0.2 * 10) / 10 === 0.3   // true

// Fix 3 — Number.EPSILON (production standard)
// EPSILON is the smallest difference between two representable numbers (~2.2e-16)
Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON   // true
```

### For Money — Never Use Floats

```javascript
// ❌ BAD — floating point errors accumulate
const price = 0.1 + 0.2;   // 0.30000000000000004

// ✅ GOOD — store everything in cents (integers)
const price = 10 + 20;     // 30 cents → display as (price / 100)
```

---

## BigInt

`Number` has a safe integer limit: `2⁵³ - 1` (`9007199254740991`). Beyond this, precision is lost silently.

### The Problem

```javascript
let a = 9007199254740991 + 1;
let b = 9007199254740991 + 2;
a === b   // true ❌ — both round to the same value! Silently wrong.
```

### BigInt Solves This

```javascript
let a = 9007199254740991n + 1n;
let b = 9007199254740991n + 2n;
a === b   // false ✅ — arbitrary precision, no rounding
```

### How to Create

```javascript
// 1. Using n suffix
let big = 12345678901234567890n;

// 2. Using constructor
let big = BigInt(123);   // 123n

typeof 1n   // 'bigint'
```

### BigInt Rules & Traps

```javascript
// ❌ Cannot mix BigInt and Number in operations
let a = 10n;
let b = 10;
a + b;          // TypeError: Cannot mix BigInt and other types

// ❌ Division truncates — no decimals
5n / 2n;        // 2n (not 2.5n — BigInt drops the decimal part)

// Loose equality works, strict does not
10n == 10;      // true ✅  — same value after coercion
10n === 10;     // false ❌ — different types ('bigint' vs 'number')
```

---

## Type Coercion — Quick Gotchas

```javascript
// String coercion (+ with a string converts everything to string)
"5" + 3         // "53"       — number → string
"5" + true      // "5true"
"5" + null      // "5null"
"5" + undefined // "5undefined"

// Numeric coercion (other operators convert to number)
"5" - 3         // 2          — string → number
"5" * 2         // 10
"5" / 2         // 2.5
true + 1        // 2          — true → 1
false + 1       // 1          — false → 0
null + 1        // 1          — null → 0
undefined + 1   // NaN        — undefined → NaN

// Comparison coercion
"5" == 5        // true       — coerces string to number
null == undefined // true     — special JS rule
null === undefined // false   — different types
NaN === NaN     // false      — ⚠️ NaN is not equal to anything, including itself
```

> **Interview Trap:** `NaN === NaN` is `false`. Use `Number.isNaN(x)` to check for NaN, never `x === NaN`.

---

## Quick Revision (Cheat Sheet)

- **7 primitives:** Number, String, Boolean, Undefined, Null, Symbol, BigInt — immutable, compared by value.
- **1 non-primitive:** Object (includes arrays, functions, maps, sets) — mutable, compared by reference.
- `typeof null === 'object'` — a famous, unfixable bug.
- `typeof NaN === 'number'` — NaN is technically a number.
- `0.1 + 0.2 !== 0.3` — use `Number.EPSILON` or integer math.
- **For money, always store in cents** (integers), never floats.
- BigInt: use `n` suffix, can't mix with Number, division truncates.
- `===` checks type + value, `==` coerces then compares — prefer `===` always.
- `NaN !== NaN` — use `Number.isNaN()` to detect it.

---

## References

- [MDN — Data Types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [MDN — typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN — BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
- [MDN — Number.EPSILON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON)