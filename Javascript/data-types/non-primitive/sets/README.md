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

