# 📘 JavaScript Math Methods Cheat Sheet

This repository contains examples and explanations of commonly used JavaScript `Math` methods. These functions are essential for numerical operations, rounding, calculations, and real-world problem solving.

---

## 🔢 1. `Math.abs()`

Returns the absolute (positive) value of a number.

```js
Math.abs(0.5 - 0.6); // 0.0999...
Math.abs(12 - 9);    // 3
```

---

## 🔄 2. `Math.round()`

Rounds a number to the nearest integer.

```js
Math.round(0.1);  // 0
Math.round(0.5);  // 1

Math.round(2.3);  // 2
Math.round(2.5);  // 3

Math.round(-2.4); // -2
Math.round(-2.6); // -3
Math.round(-2.5); // -2  // important edge case
```

---

## ⬇️ 3. `Math.floor()`

Always rounds **down** (toward negative infinity).

```js
Math.floor(1.9);   // 1
Math.floor(-1.1);  // -2
Math.floor(-1.9);  // -2
```

---

## ⬆️ 4. `Math.ceil()`

Always rounds **up** (toward positive infinity).

```js
Math.ceil(2.6);   // 3
Math.ceil(2.1);   // 3
Math.ceil(-2.9);  // -2
Math.ceil(-2.1);  // -2
```

---

## ✂️ 5. `Math.trunc()`

Removes the decimal part (toward zero).

```js
Math.trunc(2.9);   // 2
Math.trunc(-2.9);  // -2
```

---

## 🔽 6. `Math.min()`

Returns the smallest value.

```js
Math.min(3, 9, 5, 10, 1); // 1
```

⚠️ Note:

```js
Math.min([3, 9, 5]); // NaN ❌
```

Use spread operator:

```js
Math.min(...[3, 9, 5]); // 3 ✅
```

---

## 🔼 7. `Math.max()`

Returns the largest value.

```js
Math.max(3, 1, 5); // 5
```

---

## 🔢 8. `Math.pow()` / Exponentiation

```js
Math.pow(2, 3); // 8
2 ** 3;         // 8 (recommended modern syntax)
```

---

## 📐 9. `Math.sqrt()`

Returns square root.

```js
Math.sqrt(16); // 4
Math.sqrt(2);  // 1.4142...
```

### ✅ Real-world use: Distance formula

```js
const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
```

---

## 🎲 10. `Math.random()`

Generates a random number between **0 and 1 (exclusive of 1)**.

```js
Math.random(); // 0 to 0.999...
```

### 🎯 Random number in range:

```js
Math.floor(Math.random() * 10); // 0 to 9
```

---

## ➕➖ 11. `Math.sign()`

Returns the sign of a number.

```js
Math.sign(10);   // 1
Math.sign(-10);  // -1
Math.sign(0);    // 0
```

### ✅ Real-world use: Direction detection

```js
const direction = Math.sign(currentPos - previousPos);
// 1 → moving forward
// -1 → moving backward
// 0 → no movement
```

---

# 🚀 Summary

| Method       | Behavior           |
| ------------ | ------------------ |
| `abs`        | Absolute value     |
| `round`      | Nearest integer    |
| `floor`      | Always down        |
| `ceil`       | Always up          |
| `trunc`      | Remove decimals    |
| `min/max`    | Smallest / Largest |
| `pow` / `**` | Exponent           |
| `sqrt`       | Square root        |
| `random`     | Random number      |
| `sign`       | Number direction   |

---

# 🎯 Notes

* Be careful with **negative rounding behavior**
* `Math.min` / `Math.max` do NOT accept arrays directly
* Prefer modern syntax like `**` over `Math.pow`

---

# 💡 Use Cases

* UI animations
* Game development
* Financial calculations
* Geometry & distance
* Randomization logic

---

Happy Coding 🚀
