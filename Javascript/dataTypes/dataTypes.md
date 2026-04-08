
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




# JavaScript Set — Interview Reference

> A Set stores **unique values** of any type. Duplicates are silently ignored. Insertion order is preserved.

---

## Creating a Set

A Set accepts any **iterable** as its constructor argument.

```javascript
// ✅ From array
const s1 = new Set([1, 2, 3]);           // Set {1, 2, 3}

// ✅ From string (each character)
const s2 = new Set("abca");              // Set {'a', 'b', 'c'} — duplicate 'a' ignored

// ✅ From another Set (copy)
const s3 = new Set(s1);                  // Set {1, 2, 3}

// ✅ From Map (gets [key, value] pairs as entries)
const s4 = new Set(new Map([["a", 1]])); // Set { ['a', 1] }

// ✅ Empty set, add later
const s5 = new Set();

// ❌ Plain objects are NOT iterable
new Set({ a: 1, b: 2 });                 // TypeError: object is not iterable
```

> **Interview Trap:** `new Set("hello")` gives `Set {'h', 'e', 'l', 'o'}` — it iterates characters, not the whole string. And `'l'` appears only once.

---

## Methods & Complexity

| Method | What it does | Returns | Time | Space |
|--------|-------------|---------|------|-------|
| `set.add(value)` | Adds value (ignored if duplicate) | the Set itself (chainable) | O(1) | O(1) |
| `set.has(value)` | Checks if value exists | `true` / `false` | O(1) | O(1) |
| `set.delete(value)` | Removes value if it exists | `true` (existed) / `false` | O(1) | O(1) |
| `set.clear()` | Removes all values | `undefined` | O(n) | O(1) |
| `set.size` | Number of elements (property, not method) | number | O(1) | O(1) |

```javascript
const set = new Set();

set.add(1);
set.add(2);
set.add(2);             // ignored — already exists
console.log(set);       // Set {1, 2}

set.add(3).add(4);      // ✅ chainable — .add() returns the Set itself
console.log(set);       // Set {1, 2, 3, 4}

set.has(2);             // true
set.has(10);            // false

set.delete(2);          // true  — existed and removed
set.delete(10);         // false — didn't exist

console.log(set.size);  // 3

set.clear();
console.log(set);       // Set {}
```

---

## Iteration Methods

All iteration methods respect **insertion order**.

| Method | What it yields | Time | Space |
|--------|---------------|------|-------|
| `set.forEach(cb)` | Calls `cb(value, value, set)` for each element | O(n) | O(1) |
| `set.values()` | Iterator of values | O(1) to create, O(n) to consume | O(1) |
| `set.keys()` | Same as `.values()` (exists for Map compatibility) | O(1) / O(n) | O(1) |
| `set.entries()` | Iterator of `[value, value]` pairs | O(1) / O(n) | O(1) |
| `for...of set` | Same as `.values()` | O(n) | O(1) |
| `[...set]` | Spread into array | O(n) | O(n) |

```javascript
const set = new Set([1, 2, 3]);

// forEach — ⚠️ callback is (value, value, set) — value appears TWICE (no keys in a Set)
set.forEach((val, val2, s) => {
  console.log(val, val2);   // 1 1, 2 2, 3 3
});

// values() — returns an iterator
const iter = set.values();
console.log(iter.next());  // { value: 1, done: false }
console.log(iter.next());  // { value: 2, done: false }
console.log(iter.next());  // { value: 3, done: false }
console.log(iter.next());  // { value: undefined, done: true }

// keys() — identical to values() (Set has no keys)
// Exists only so Set and Map share the same interface

// entries() — returns [value, value] pairs (again, for Map compatibility)
for (const entry of set.entries()) {
  console.log(entry);
}
// [1, 1]
// [2, 2]
// [3, 3]

// for...of — the cleanest way
for (const val of set) {
  console.log(val);         // 1, 2, 3
}

// Spread into array
const arr = [...set];       // [1, 2, 3]
```

---

## Common Interview Patterns

### Remove Duplicates from Array

```javascript
const nums = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(nums)];   // [1, 2, 3]
// Time: O(n) | Space: O(n)
```

### Array Intersection Using Set

```javascript
function intersection(a, b) {
  const setA = new Set(a);
  return b.filter((x) => setA.has(x));  // O(1) lookup per element
}
// Time: O(n + m) | Space: O(n)
```

### Array Union

```javascript
function union(a, b) {
  return [...new Set([...a, ...b])];
}
// Time: O(n + m) | Space: O(n + m)
```

### Array Difference (A - B)

```javascript
function difference(a, b) {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}
// Time: O(n + m) | Space: O(m)
```

---

## Interview Traps & Gotchas

### Trap 1: Set uses SameValueZero, not ===

```javascript
const set = new Set();
set.add(NaN);
set.add(NaN);
console.log(set.size);   // 1 — NaN === NaN is false, but Set treats them as equal

set.add(0);
set.add(-0);
console.log(set.size);   // 2 (was 1 from NaN) + 1 = 2 — 0 and -0 are treated as same
```

### Trap 2: Objects are compared by reference

```javascript
const set = new Set();
set.add({ a: 1 });
set.add({ a: 1 });
console.log(set.size);   // 2 — different references, even though same content
```
```javascript
const k= new Set([1,2,3,4]);
const k1=new Set(k);
console.log(k);
console.log(k1);
k1.delete(1);

console.log(k);Set(4) { 1, 2, 3, 4 }
console.log(k1); Set(3) { 2, 3, 4 }
```
### Trap 3: No index access

```javascript
const set = new Set([10, 20, 30]);
set[0];                  // undefined — Sets don't have index access
// Convert to array first: [...set][0] → 10
```

### Trap 4: .forEach callback signature

```javascript
// Array:  forEach((value, index, array) => {})
// Map:    forEach((value, key, map) => {})
// Set:    forEach((value, value, set) => {})
//                         ^^^^^ value repeated — there are no keys in a Set
```

---

## Set vs Array vs Map — When to Use What

| Need | Use |
|------|-----|
| Ordered list with duplicates, index access | **Array** |
| Unique values, fast O(1) lookup/add/delete | **Set** |
| Key-value pairs with any key type | **Map** |
| Unique keys with fast lookup + associated values | **Map** |

---

## Quick Revision (Cheat Sheet)

- Set stores **unique** values, insertion order preserved.
- Constructor takes any **iterable** (array, string, set, map) — NOT plain objects.
- `add`, `has`, `delete` are all **O(1)**.
- `.add()` is chainable — returns the Set.
- `.size` is a property, not a method — no parentheses.
- `.keys()` === `.values()` — exists only for Map compatibility.
- `.entries()` returns `[value, value]` pairs — same reason.
- NaN equals NaN in a Set (SameValueZero), unlike `===`.
- Objects are compared **by reference** — `{a:1}` and `{a:1}` are two different entries.
- No index access — convert to array with `[...set]` if needed.

---

## References

- [MDN — Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)


# JavaScript Map — Interview Reference

> A Map stores **key-value pairs** where keys can be **any type** (objects, functions, primitives). Insertion order is preserved. O(1) for get/set/has/delete.

---

## Creating a Map

Map constructor accepts an **iterable of `[key, value]` pairs**.

```javascript
// ✅ From array of pairs
const m1 = new Map([
  ["name", "Rahul"],
  ["age", 25],
  ["city", "Pune"],
]);

// ✅ From another Map (copy)
const m2 = new Map(m1);

// ✅ From Object.entries() — convert object to Map
const obj = { a: 1, b: 2 };
const m3 = new Map(Object.entries(obj));  // Map { 'a' => 1, 'b' => 2 }

// ✅ Empty map, add later
const m4 = new Map();

// ❌ Plain object directly
new Map({ a: 1 });  // TypeError: object is not iterable

// ❌ Flat array
new Map([1, 2, 3]); // TypeError: Iterator value 1 is not an entry
```

> **Interview Trap:** `new Map(Object.entries(obj))` is the correct way to convert an object to Map — not `new Map(obj)`.

---

## Methods & Complexity

| Method | What it does | Returns | Time | Space |
|--------|-------------|---------|------|-------|
| `map.set(key, value)` | Adds or updates a key-value pair | the Map itself (chainable) | O(1) | O(1) |
| `map.get(key)` | Returns value for key | value or `undefined` | O(1) | O(1) |
| `map.has(key)` | Checks if key exists | `true` / `false` | O(1) | O(1) |
| `map.delete(key)` | Removes key if it exists | `true` (existed) / `false` | O(1) | O(1) |
| `map.clear()` | Removes all entries | `undefined` | O(n) | O(1) |
| `map.size` | Number of entries (property, not method) | number | O(1) | O(1) |

```javascript
const map = new Map();

map.set("name", "Rahul");
map.set("age", 25);
map.set("age", 26);              // overwrites — keys are unique
console.log(map);                // Map { 'name' => 'Rahul', 'age' => 26 }

map.set("a", 1).set("b", 2);    // ✅ chainable — .set() returns the Map

map.get("name");                 // 'Rahul'
map.get("missing");              // undefined — no error

map.has("name");                 // true
map.has("missing");              // false

map.delete("age");               // true  — existed and removed
map.delete("xyz");               // false — didn't exist

console.log(map.size);           // 2

map.clear();
console.log(map.size);           // 0
```

---

## Iteration Methods

All iteration methods respect **insertion order**.

| Method | What it yields | Time | Space |
|--------|---------------|------|-------|
| `map.forEach(cb)` | Calls `cb(value, key, map)` for each entry | O(n) | O(1) |
| `map.keys()` | Iterator of keys | O(1) to create, O(n) to consume | O(1) |
| `map.values()` | Iterator of values | O(1) / O(n) | O(1) |
| `map.entries()` | Iterator of `[key, value]` pairs | O(1) / O(n) | O(1) |
| `for...of map` | Same as `.entries()` | O(n) | O(1) |
| `[...map]` | Spread into array of `[key, value]` pairs | O(n) | O(n) |

```javascript
const map = new Map([
  ["name", "Rahul"],
  ["age", 25],
  ["city", "Pune"],
]);

// keys()
for (const key of map.keys()) {
  console.log(key);              // 'name', 'age', 'city'
}

// values()
for (const val of map.values()) {
  console.log(val);              // 'Rahul', 25, 'Pune'
}

// entries()
for (const [key, val] of map.entries()) {
  console.log(key, "→", val);   // 'name' → 'Rahul', etc.
}

// for...of directly — same as .entries()
for (const [key, val] of map) {
  console.log(key, "→", val);
}

// forEach — ⚠️ callback is (value, key, map) — VALUE comes FIRST
map.forEach((val, key) => {
  console.log(key, "→", val);
});

// Spread into array
const arr = [...map];            // [['name','Rahul'], ['age',25], ['city','Pune']]

// Convert back to object
const obj = Object.fromEntries(map);  // { name: 'Rahul', age: 25, city: 'Pune' }
```

> **Interview Trap:** `map.forEach((value, key) => {})` — value is the **first** argument, not key. Opposite of what you'd expect from `[key, value]` destructuring in `for...of`.

---

## Map vs Object — The Big Comparison

| Feature | Map | Object |
|---------|-----|--------|
| **Key types** | Any type (object, function, primitive) | String and Symbol only |
| **Key order** | Insertion order guaranteed | Mostly insertion order (integers sorted first) |
| **Size** | `map.size` — O(1) | `Object.keys(obj).length` — O(n) |
| **Iteration** | Directly iterable (`for...of`) | Need `Object.keys/values/entries()` |
| **Performance** | Optimized for frequent add/delete | Optimized for static structure |
| **Prototype keys** | No inherited keys | Has prototype chain (`toString`, etc.) |
| **Serialization** | ❌ No native JSON support | ✅ `JSON.stringify()` works |
| **Default keys** | None | Has `constructor`, `__proto__`, etc. |

```javascript
// Key type difference
const map = new Map();
const objKey = { id: 1 };
const fnKey = () => {};

map.set(objKey, "object as key");   // ✅ works
map.set(fnKey, "function as key");  // ✅ works
map.set(42, "number key");         // ✅ works

const obj = {};
obj[objKey] = "value";
console.log(Object.keys(obj));     // ['[object Object]'] — ⚠️ key got stringified!

// Integer keys in Object are sorted, not in insertion order
const o = {};
o["b"] = 1;
o["2"] = 2;
o["1"] = 3;
console.log(Object.keys(o));       // ['1', '2', 'b'] — integers first, then strings

const m = new Map();
m.set("b", 1);
m.set("2", 2);
m.set("1", 3);
console.log([...m.keys()]);        // ['b', '2', '1'] — insertion order preserved
```

---

## Interview Traps & Gotchas

### Trap 1: Object keys as Map keys — reference comparison

```javascript
const map = new Map();

map.set({}, "a");
map.set({}, "b");
console.log(map.size);             // 2 — different references

map.get({});                       // undefined — this is a NEW object, different reference

// Fix: store the reference
const key = {};
map.set(key, "a");
map.get(key);                      // 'a' ✅
```

### Trap 2: Map uses SameValueZero (like Set)

```javascript
const map = new Map();

map.set(NaN, "nan value");
map.set(NaN, "overwritten");
console.log(map.size);             // 1 — NaN === NaN is false, but Map treats them as same key

map.set(0, "zero");
map.set(-0, "negative zero");
console.log(map.size);             // 2 (NaN + 0) — 0 and -0 are treated as same key
```

### Trap 3: map[key] doesn't work like you think

```javascript
const map = new Map();

// ❌ WRONG — this sets a property on the object, NOT a Map entry
map["name"] = "Rahul";
console.log(map.get("name"));     // undefined
console.log(map.size);            // 0

// ✅ CORRECT
map.set("name", "Rahul");
console.log(map.get("name"));     // 'Rahul'
console.log(map.size);            // 1
```

### Trap 4: JSON serialization

```javascript
const map = new Map([["a", 1], ["b", 2]]);

JSON.stringify(map);               // '{}' — ❌ empty! Maps don't serialize

// Fix: convert to object or array first
JSON.stringify(Object.fromEntries(map));   // '{"a":1,"b":2}'
JSON.stringify([...map]);                  // '[["a",1],["b",2]]'
```

### Trap 5: for...in on Map gives nothing

```javascript
const map = new Map([["a", 1]]);

for (const key in map) {
  console.log(key);               // ❌ nothing prints — for...in doesn't work on Map
}

// ✅ Use for...of
for (const [key, val] of map) {
  console.log(key, val);          // 'a' 1
}
```

---

## Common Interview Patterns

### Frequency Counter

```javascript
function frequency(arr) {
  const freq = new Map();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  return freq;
}
// Time: O(n) | Space: O(n)
```

### Group By

```javascript
function groupBy(arr, keyFn) {
  const groups = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}
// Time: O(n) | Space: O(n)
```

### Two Sum (classic Map usage)

```javascript
function twoSum(nums, target) {
  const seen = new Map();          // value → index
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}
// Time: O(n) | Space: O(n)
```

### Convert Between Map and Object

```javascript
// Object → Map
const map = new Map(Object.entries({ a: 1, b: 2 }));

// Map → Object (only works if all keys are strings/symbols)
const obj = Object.fromEntries(map);
```

---

## When to Use Map vs Object

```
Use MAP when:
  ✅ Keys are not strings (objects, numbers, functions)
  ✅ You need guaranteed insertion order
  ✅ You need .size without computing it
  ✅ Frequent additions and deletions
  ✅ You need to iterate over entries

Use OBJECT when:
  ✅ Keys are strings and you know them upfront
  ✅ You need JSON serialization
  ✅ You need destructuring ({ a, b } = obj)
  ✅ You're defining a shape/schema (like API responses)
  ✅ You need prototype methods
```

---

## Quick Revision (Cheat Sheet)

- Map stores **key-value pairs**, any type as key, insertion order preserved.
- Constructor takes **iterable of `[key, value]` pairs** — NOT plain objects.
- `set`, `get`, `has`, `delete` are all **O(1)**.
- `.set()` is chainable — returns the Map.
- `.size` is a property, not a method.
- `for...of` works, `for...in` does **NOT**.
- `.forEach(value, key)` — **value first**, key second.
- Object keys get **stringified** — `{}` becomes `'[object Object]'`. Map doesn't.
- Object integer keys get **sorted**. Map preserves insertion order.
- `map[key]` sets a **property**, not a Map entry — always use `.set()` / `.get()`.
- Maps don't serialize to JSON — use `Object.fromEntries()` or `[...map]` first.
- NaN equals NaN in Map (SameValueZero), 0 and -0 are treated as same key.

---

## References

- [MDN — Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [MDN — Object.fromEntries()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)