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
