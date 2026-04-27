# 📘 Built-in Operations — Time & Space Complexity

> 🚀 **Quick reference for Array, String, and Object operations**
> Must-know for interviews — aim for **instant recall**

---

# 🧩 Array Operations

| Operation       | Method               | Time         | Space    | Mutates? | Notes                  |
| --------------- | -------------------- | ------------ | -------- | -------- | ---------------------- |
| Access by index | `arr[i]`             | O(1)         | O(1)     | ❌        |                        |
| Read length     | `arr.length`         | O(1)         | O(1)     | ❌        | Stored, not computed   |
| Append          | `push()`             | O(1)*        | O(1)     | ✅        | *Amortized             |
| Remove last     | `pop()`              | O(1)         | O(1)     | ✅        |                        |
| Prepend         | `unshift()`          | O(n)         | O(1)     | ✅        | Shifts elements        |
| Remove first    | `shift()`            | O(n)         | O(1)     | ✅        | Shifts elements        |
| Insert/remove   | `splice()`           | O(n)         | O(n)     | ✅        | Shifting cost          |
| Copy range      | `slice()`            | O(n)         | O(n)     | ❌        | Returns new array      |
| Merge arrays    | `concat()`           | O(n+m)       | O(n+m)   | ❌        |                        |
| Search          | `indexOf()`          | O(n)         | O(1)     | ❌        | `===` comparison       |
| Search          | `includes()`         | O(n)         | O(1)     | ❌        | Handles `NaN`          |
| Find            | `find()`             | O(n)         | O(1)     | ❌        | Stops early            |
| Transform       | `map()`              | O(n)         | O(n)     | ❌        |                        |
| Filter          | `filter()`           | O(n)         | O(n)     | ❌        |                        |
| Reduce          | `reduce()`           | O(n)         | O(1)*    | ❌        | Depends on accumulator |
| Iterate         | `forEach()`          | O(n)         | O(1)     | ❌        | No return              |
| Check           | `some()` / `every()` | O(n)         | O(1)     | ❌        | Short-circuit          |
| Sort            | `sort()`             | O(n log n)   | O(log n) | ✅        | In-place               |
| Reverse         | `reverse()`          | O(n)         | O(1)     | ✅        |                        |
| Flatten         | `flat()`             | O(n × depth) | O(n)     | ❌        |                        |
| Flatten+map     | `flatMap()`          | O(n)         | O(n)     | ❌        |                        |
| Fill            | `fill()`             | O(n)         | O(1)     | ✅        |                        |
| Join            | `join()`             | O(n)         | O(n)     | ❌        |                        |
| Create          | `Array.from()`       | O(n)         | O(n)     | —        |                        |
| Spread          | `[...arr]`           | O(n)         | O(n)     | —        | Shallow copy           |

---

# 🔤 String Operations

> ⚠️ Strings are **immutable** → all operations return new strings

| Operation     | Method           | Time     | Space    | Notes             |
| ------------- | ---------------- | -------- | -------- | ----------------- |
| Access char   | `str[i]`         | O(1)     | O(1)     |                   |
| Length        | `str.length`     | O(1)     | O(1)     |                   |
| Search        | `indexOf()`      | O(n)     | O(1)     |                   |
| Search        | `includes()`     | O(n)     | O(1)     |                   |
| Prefix/Suffix | `startsWith()`   | O(n)     | O(1)     |                   |
| Slice         | `slice()`        | O(n)     | O(n)     | Supports negative |
| Substring     | `substring()`    | O(n)     | O(n)     | No negative       |
| Split         | `split()`        | O(n)     | O(n)     |                   |
| Replace       | `replace()`      | O(n)     | O(n)     |                   |
| Replace all   | `replaceAll()`   | O(n)     | O(n)     |                   |
| Case change   | `toUpperCase()`  | O(n)     | O(n)     |                   |
| Trim          | `trim()`         | O(n)     | O(n)     |                   |
| Pad           | `padStart()`     | O(n)     | O(n)     |                   |
| Repeat        | `repeat()`       | O(n × k) | O(n × k) |                   |
| Concat        | `+` / `concat()` | O(n)     | O(n)     |                   |

---

## ⚠️ String Loop Trap

```js
// ❌ O(n²)
let str = "";
for (let i = 0; i < n; i++) {
  str += "a";
}

// ✅ O(n)
let arr = [];
for (let i = 0; i < n; i++) {
  arr.push("a");
}
str = arr.join("");
```

---

# 🧱 Object Operations

> ⚡ Objects use hash maps → **O(1) average**

| Operation    | Method                 | Time | Space | Notes              |
| ------------ | ---------------------- | ---- | ----- | ------------------ |
| Read         | `obj.key`              | O(1) | O(1)  |                    |
| Write        | `obj.key = val`        | O(1) | O(1)  |                    |
| Delete       | `delete obj.key`       | O(1) | O(1)  |                    |
| Check own    | `hasOwnProperty()`     | O(1) | O(1)  |                    |
| Check all    | `key in obj`           | O(1) | O(1)  | Includes prototype |
| Keys         | `Object.keys()`        | O(n) | O(n)  |                    |
| Values       | `Object.values()`      | O(n) | O(n)  |                    |
| Entries      | `Object.entries()`     | O(n) | O(n)  |                    |
| Merge        | `Object.assign()`      | O(n) | O(n)  | Mutates target     |
| Copy         | `{...obj}`             | O(n) | O(n)  |                    |
| From entries | `Object.fromEntries()` | O(n) | O(n)  |                    |
| Freeze       | `Object.freeze()`      | O(n) | O(1)  | Shallow            |
| Seal         | `Object.seal()`        | O(n) | O(1)  |                    |

---

# ⚠️ Interview Traps (VERY IMPORTANT)

## 🔥 1. `push()` is NOT always O(1)

* ✔️ Amortized O(1)
* ❌ Worst case O(n) (resize)

---

## 🔥 2. `sort()` default behavior

```js
[10, 9, 2].sort(); 
// ❌ [10, 2, 9]
```

✔️ Fix:

```js
arr.sort((a, b) => a - b);
```

---

## 🔥 3. `sort()` mutates

```js
const sorted = arr.sort(); // arr also modified ❌
```

✔️ Fix:

```js
const sorted = [...arr].sort();
```

---

## 🔥 4. `NaN` trap

```js
[NaN].indexOf(NaN);   // -1 ❌
[NaN].includes(NaN);  // true ✅
```

---

## 🔥 5. `delete` on arrays

```js
delete arr[2]; // ❌ creates hole
```

✔️ Use:

```js
arr.splice(2, 1);
```

---

## 🔥 6. Prototype trap

```js
const obj = Object.create({ a: 1 });
obj.b = 2;

Object.keys(obj); // ["b"]
"a" in obj;       // true
```

---

## 🔥 7. String concatenation

* ❌ `+=` in loop → O(n²)
* ✅ `join()` → O(n)

---

# 🎯 Quick Revision

```txt
Array:
- Access → O(1)
- Search → O(n)
- Sort → O(n log n)
- push/pop → O(1) amortized
- shift/unshift → O(n)

String:
- Immutable
- += loop → O(n²)

Object:
- Read/write → O(1)
- keys/values → O(n)
- "in" checks prototype

Important:
- includes handles NaN
- sort mutates
- delete doesn't shrink arrays
```

---

# 🚀 Pro Tip

> In interviews, don’t just say **O(1)** — say
> 👉 **“O(1) average, O(n) worst case (due to resizing or collisions)”**

---

Happy Coding 💻🔥
