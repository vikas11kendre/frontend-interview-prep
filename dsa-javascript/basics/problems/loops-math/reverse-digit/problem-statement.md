# Reverse Integer — Thought Process

## Problem Statement

Given a 32-bit signed integer `x`, reverse its digits.

If the reversed integer goes outside the 32-bit signed integer range, return `0`.

---

## 32-bit Signed Integer Range

For a signed 32-bit integer:

```txt
Minimum = -2^31
Maximum = 2^31 - 1
```

So:

```js
const MIN = -(2 ** 31);      // -2147483648
const MAX = 2 ** 31 - 1;    // 2147483647
```

> Important: It is not `2^32`.  
> Because signed integer uses one bit for sign.

---

## Examples

```txt
Input: 123
Output: 321

Input: -123
Output: -321

Input: 120
Output: 21

Input: 1534236469
Output: 0
```

---

# Approach

## Step 1 — Check Sign

If the number is negative, store that information.

```js
let isNegative = x < 0;
```

Then convert number to positive:

```js
let n = Math.abs(x);
```

---

## Step 2 — Reverse The Number

To reverse a number:

1. Get the last digit using `% 10`
2. Add it to `rev`
3. Remove last digit using `Math.floor(n / 10)`

Formula:

```js
let remainder = n % 10;
rev = rev * 10 + remainder;
n = Math.floor(n / 10);
```

---

# Dry Run 1

Input:

```txt
123
```

Initial:

```txt
n = 123
rev = 0
```

## First Iteration

```txt
remainder = 123 % 10 = 3
rev = 0 * 10 + 3 = 3
n = Math.floor(123 / 10) = 12
```

## Second Iteration

```txt
remainder = 12 % 10 = 2
rev = 3 * 10 + 2 = 32
n = Math.floor(12 / 10) = 1
```

## Third Iteration

```txt
remainder = 1 % 10 = 1
rev = 32 * 10 + 1 = 321
n = Math.floor(1 / 10) = 0
```

Loop stops.

Final:

```txt
rev = 321
```

---

# Dry Run 2

Input:

```txt
120
```

Initial:

```txt
n = 120
rev = 0
```

## First Iteration

```txt
remainder = 120 % 10 = 0
rev = 0 * 10 + 0 = 0
n = Math.floor(120 / 10) = 12
```

## Second Iteration

```txt
remainder = 12 % 10 = 2
rev = 0 * 10 + 2 = 2
n = Math.floor(12 / 10) = 1
```

## Third Iteration

```txt
remainder = 1 % 10 = 1
rev = 2 * 10 + 1 = 21
n = Math.floor(1 / 10) = 0
```

Final:

```txt
rev = 21
```

Leading zero is automatically removed.

---

# Step 3 — Add Sign Back

If original number was negative:

```js
if (isNegative) {
    rev = -rev;
}
```

---

# Step 4 — Check Overflow

After reversing, check if result is outside signed 32-bit range.

```js
if (rev < MIN || rev > MAX) {
    return 0;
}
```

Otherwise return `rev`.

---

# Final Code

```js
function reverse(x) {
    const MIN = -(2 ** 31);
    const MAX = 2 ** 31 - 1;

    let isNegative = x < 0;
    let n = Math.abs(x);
    let rev = 0;

    while (n > 0) {
        let remainder = n % 10;
        rev = rev * 10 + remainder;
        n = Math.floor(n / 10);
    }

    if (isNegative) {
        rev = -rev;
    }

    if (rev < MIN || rev > MAX) {
        return 0;
    }

    return rev;
}
```

---

# Complexity Analysis

## Time Complexity

The loop runs once for each digit.

If the number has `d` digits:

```txt
Time Complexity = O(d)
```

Since number of digits is also `log10(n)`:

```txt
Time Complexity = O(log n)
```

For this problem, writing `O(d)` is easier and more clear.

---

## Space Complexity

We only use a few variables:

```txt
MIN, MAX, isNegative, n, rev, remainder
```

So:

```txt
Space Complexity = O(1)
```