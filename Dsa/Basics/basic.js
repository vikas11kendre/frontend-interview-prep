/**
 * JavaScript Iteration & Looping — Quick Reference
 *
 * Covers: for...of vs for...in, Map iteration, Object iteration
 * Run: node iteration-reference.js
 */

// ============================================
// 1. for...of vs for...in — The Core Rule
// ============================================
// for...of → gives VALUES (works on iterables: Array, String, Map, Set)
// for...in → gives KEYS/INDEXES (works on any object, including plain objects)

// --- String ---
const str = "abc";

// for...of → each character
for (const ch of str) {
  // 'a', 'b', 'c'
}

// for...in → each index
for (const idx in str) {
  // '0', '1', '2'  ⚠️ indexes are STRINGS, not numbers
}

// --- Array ---
const arr = ["A", "B", "C"];

// for...of → each element
for (const el of arr) {
  // 'A', 'B', 'C'
}

// for...in → each index
for (const idx in arr) {
  // '0', '1', '2'  ⚠️ again, string indexes
}

// --- Plain Object ---
const obj = { a: 1, b: 2 };

// for...of → ❌ ERROR! Plain objects are NOT iterable
// for (const val of obj) { }  // TypeError: obj is not iterable

// for...in → each key
for (const key in obj) {
  // 'a', 'b'
}

console.log("=== for...of vs for...in ===");
console.log("String of:", [...str]); // [ 'a', 'b', 'c' ]
console.log("Array  of:", [...arr]); // [ 'A', 'B', 'C' ]
console.log("Object in:", Object.keys(obj)); // [ 'a', 'b' ]
console.log();

// ============================================
// 2. Object Static Methods — Keys, Values, Entries
// ============================================
// These convert a plain object into an array so you CAN use for...of

const person = { name: "Rahul", age: 25, city: "Pune" };

console.log("=== Object Static Methods ===");
console.log("keys:   ", Object.keys(person)); // ['name', 'age', 'city']         O(n)
console.log("values: ", Object.values(person)); // ['Rahul', 25, 'Pune']          O(n)
console.log("entries:", Object.entries(person)); // [['name','Rahul'], ['age',25], ['city','Pune']]  O(n)

// Now you can use for...of on objects via these methods
for (const [key, val] of Object.entries(person)) {
  // 'name' 'Rahul', 'age' 25, 'city' 'Pune'
}

console.log();

// ============================================
// 3. Map Iteration — 5 Ways
// ============================================

const map = new Map([
  ["name", "Rahul"],
  ["age", 25],
  ["city", "Pune"],
]);

console.log("=== Map Iteration ===");

// Way 1: .keys()
console.log("keys:");
for (const key of map.keys()) {
  console.log("  ", key); // 'name', 'age', 'city'
}

// Way 2: .values()
console.log("values:");
for (const val of map.values()) {
  console.log("  ", val); // 'Rahul', 25, 'Pune'
}

// Way 3: .entries()
console.log("entries:");
for (const [key, val] of map.entries()) {
  console.log("  ", key, "→", val);
}

// Way 4: for...of directly (same as .entries())
console.log("for...of directly:");
for (const [key, val] of map) {
  console.log("  ", key, "→", val);
}

// Way 5: .forEach()
console.log("forEach:");
map.forEach((val, key) => {
  console.log("  ", key, "→", val); // ⚠️ TRAP: callback is (value, key) — value comes FIRST!
});

console.log();

// ============================================
// 4. Cheat Sheet — What Works Where
// ============================================
//
// ┌─────────────┬───────────┬───────────┬──────────────────────────┐
// │ Data Type   │ for...of  │ for...in  │ Notes                    │
// ├─────────────┼───────────┼───────────┼──────────────────────────┤
// │ String      │ ✅ chars  │ ✅ indexes│ indexes are strings      │
// │ Array       │ ✅ values │ ✅ indexes│ for...in not recommended │
// │ Object      │ ❌ error  │ ✅ keys   │ use Object.entries() +   │
// │             │           │           │ for...of instead         │
// │ Map         │ ✅ entries│ ❌ nothing│ use .keys()/.values()    │
// │ Set         │ ✅ values │ ❌ nothing│ no duplicates            │
// └─────────────┴───────────┴───────────┴──────────────────────────┘
//
// GOLDEN RULE:
//   for...of = "give me the THINGS"     (values, elements, characters)
//   for...in = "give me the LABELS"     (keys, indexes, property names)
//
// ⚠️ Interview Traps:
//   1. for...in on arrays gives STRING indexes ('0', '1'), not numbers
//   2. for...in iterates inherited prototype properties too — use hasOwnProperty() to guard
//   3. Map.forEach callback is (value, key) — opposite of Map.entries() which is [key, value]
//   4. for...of on plain objects throws TypeError — they're not iterable
//   5. for...in on Map/Set gives nothing useful — they don't have enumerable properties