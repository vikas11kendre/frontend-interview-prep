# Problem Statement:
Write a function isPalindrome(x) that takes an integer x and returns true if it reads the same backward and forward; otherwise false.

## Requirements:
Handles both positive and negative integers.
Return false for negative numbers (not Palindromes).
Constraints:
Time Complexity: O(d)Where dis the number of digits.

Space Complexity: O(1)Only a few variables are used.

## Examples:
Input:121

Output:true

Input:-121

Output:false

Input:10

Output:false




# Palindrome Number — Thought Process

## Problem Understanding

A palindrome number reads the same from left to right and right to left.

Examples:

```txt
121   -> true
1221  -> true
123   -> false
-121  -> false
10    -> false
```

---

# Approach

## Case 1 — Negative Number

If the number is negative, it can never be a palindrome because of the `-` sign.

Example:

```txt
-121 != 121-
```

Condition:

```js
if (number < 0) {
    return false;
}
```

---

## Case 2 — Number Ending With Zero

If a number ends with `0`, after reversing the number the zero comes at the front.

Example:

```txt
10 -> 01 -> 1
100 -> 001 -> 1
```

So it cannot be palindrome.

Condition:

```js
if (number !== 0 && number % 10 === 0) {
    return false;
}
```

---

# Main Idea

Reverse the number and compare it with the original number.

To reverse:

1. Take last digit using `% 10`
2. Add digit into reversed number
3. Remove last digit using `Math.floor(number / 10)`

---

# Reverse Formula

```js
remainder = n % 10
reverse = reverse * 10 + remainder
n = Math.floor(n / 10)
```

---

# Dry Run

Input:

```txt
1221
```

Initial values:

```txt
number = 1221
n = 1221
reverse = 0
```

---

## First Iteration

```txt
remainder = 1221 % 10 = 1

reverse = 0 * 10 + 1
reverse = 1

n = Math.floor(1221 / 10)
n = 122
```

---

## Second Iteration

```txt
remainder = 122 % 10 = 2

reverse = 1 * 10 + 2
reverse = 12

n = Math.floor(122 / 10)
n = 12
```

---

## Third Iteration

```txt
remainder = 12 % 10 = 2

reverse = 12 * 10 + 2
reverse = 122

n = Math.floor(12 / 10)
n = 1
```

---

## Fourth Iteration

```txt
remainder = 1 % 10 = 1

reverse = 122 * 10 + 1
reverse = 1221

n = Math.floor(1 / 10)
n = 0
```

Loop stops because:

```txt
n > 0 becomes false
```

---

# Final Comparison

```txt
reverse === number

1221 === 1221
```

Result:

```txt
true
```

---

# Final Code

```js
function isPalindrome(number) {

    // Negative numbers are not palindrome
    if (number < 0) {
        return false;
    }

    // Numbers ending with 0 are not palindrome
    // except 0 itself
    if (number !== 0 && number % 10 === 0) {
        return false;
    }

    let rev = 0;
    let n = number;

    while (n > 0) {

        let remainder = n % 10;

        rev = rev * 10 + remainder;

        n = Math.floor(n / 10);
    }

    return rev === number;
}
```

---

# Complexity Analysis

## Time Complexity

Each iteration removes one digit.

```txt
O(log10(n))
```

---

## Space Complexity

No extra space used.

```txt
O(1)
```