/**
 * Promises — Deep Dive & Interview Traps
 *
 * Covers: resolve/reject, chaining, throw behavior, finally, async unwrapping, branching
 * Run: node promises-deep-dive.js
 */

// ============================================
// Topic 1: Promise.resolve() & Promise.reject()
// ============================================

// --- Basic resolve ---
let a = Promise.resolve(1);
console.log(typeof a, a);
// 'object', Promise { 1 }
// Key: typeof Promise is 'object', not 'promise'

a.then((val) => console.log("then1:", val)) // 1
  .then((val) => console.log("then2:", val)); // undefined — previous .then() didn't return anything

// --- Basic reject ---
let b = Promise.reject(1);
b.catch((err) => console.log("rejected:", err)); // 1

// ============================================
// Topic 2: Execution Order — setTimeout + resolve
// ============================================

// const p1 = new Promise((resolve, reject) => {
//   console.log("start");              // 1️⃣ sync — runs immediately
//   setTimeout(() => {
//     console.log("timeout start");    // 3️⃣ macro task
//     resolve("done");                 // schedules .then() as micro task
//     console.log("timeout end");      // 4️⃣ still runs — resolve doesn't stop execution
//   });
//   console.log("end");               // 2️⃣ sync — runs immediately
// });
// p1.then((t) => console.log(t));     // 5️⃣ micro task after timeout callback finishes

// OUTPUT:
// start
// end
// timeout start
// timeout end
// done

// ============================================
// Topic 3: throw Inside vs Outside setTimeout
// ============================================

// ⚠️ THE RULE:
// throw only works inside the Promise executor or a .then() handler.
// It does NOT work inside async callbacks like setTimeout, addEventListener, setInterval.
// Inside those — you MUST manually call reject().

// --- throw INSIDE setTimeout — ❌ UNCAUGHT, promise stays pending ---
// const p2 = new Promise((resolve, reject) => {
//   console.log("start");
//   setTimeout(() => {
//     console.log("timeout start");
//     throw new Error("this is error");  // ❌ not caught by Promise — crashes process
//     console.log("timeout end");        // never reached
//   });
//   console.log("end");
// });
// p2.then((t) => console.log(t)).catch((e) => console.log("catch:", e));

// OUTPUT:
// start
// end
// timeout start
// ❌ UnhandledError — .catch() NEVER fires because throw is inside setTimeout

// --- throw INSIDE executor (no setTimeout) — ✅ caught by Promise ---
// const p3 = new Promise((resolve, reject) => {
//   console.log("start");
//   throw new Error("this is error");   // ✅ caught — Promise auto-rejects
//   console.log("end");                 // never reached
// });
// p3.then((t) => console.log(t)).catch((e) => console.log("catch:", e.message));

// OUTPUT:
// start
// catch: this is error

// --- resolve() before throw — resolve wins, throw is ignored ---
// const p4 = new Promise((resolve, reject) => {
//   resolve("success");
//   throw new Error("too late");        // ignored — Promise already settled
// });
// p4.then((val) => console.log("then:", val))
//   .catch((err) => console.log("catch:", err.message));

// OUTPUT:
// then: success
// 🔑 Once a Promise settles (resolve or reject), it CANNOT change state. throw after resolve is dead code.

// ============================================
// Topic 4: Promise Assimilation (returning Promise from .then)
// ============================================

// Promise.resolve("outer")
//   .then((val) => {
//     return new Promise((resolve) => {
//       setTimeout(() => resolve("inner"), 100);
//     });
//   })
//   .then((val) => console.log(val));

// OUTPUT: "inner" (after 100ms)

// 🔑 Interview answer:
// "When .then() returns a Promise, the chain suspends and waits for that
// inner Promise to settle. Only once it resolves does the next .then()
// receive the unwrapped value — not the Promise object itself."

// ============================================
// Topic 5: .finally() Behavior
// ============================================

// 🔑 Rules:
// 1. .finally() runs on BOTH fulfillment and rejection
// 2. It receives NO arguments (no access to value or error)
// 3. Its return value is IGNORED — the chain passes through the previous value
// 4. EXCEPTION: if .finally() throws or returns a rejected Promise, that error propagates

// Promise.resolve(1)
//   .then((val) => {
//     console.log(val);                  // 1
//     return Promise.reject("oops");
//   })
//   .then((val) => {
//     console.log("then2:", val);        // ❌ skipped — previous rejected
//   })
//   .catch((err) => {
//     console.log("catch:", err);        // "oops"
//     return "recovered";               // state is now fulfilled with "recovered"
//   })
//   .then((val) => {
//     console.log("then3:", val);        // "recovered"
//   })
//   .finally(() => {
//     console.log("finally");           // runs always
//     return "ignored";                 // ⚠️ this return is DISCARDED
//   })
//   .then((val) => {
//     console.log("then4:", val);        // "recovered" — NOT "ignored"
//   });

// OUTPUT:
// 1
// catch: oops
// then3: recovered
// finally
// then4: recovered

// ============================================
// Topic 6: async Functions Auto-Wrap in Promise
// ============================================

// async function greet() {
//   return "hello";                      // plain string
// }
// console.log(greet());                  // Promise { 'hello' } — auto-wrapped

// async function fetchData() {
//   return Promise.reject("failed");     // returning a Promise
// }
// fetchData().catch((e) => console.log("caught:", e));
// // Promise { rejected: "failed" } — NOT double-wrapped

// 🔑 async always returns a Promise.
// If you return a Promise, it gets assimilated (unwrapped), not double-wrapped.

// --- async inside .then() ---
// Promise.resolve(1)
//   .then(async (val) => {
//     return val + 1;                    // async returns Promise { 2 }
//   })
//   .then((val) => console.log(val));    // 2 — chain unwraps it automatically

// OUTPUT: 2

// ============================================
// Topic 7: Branching vs Chaining
// ============================================

// const p = new Promise((resolve) => resolve(1));

// // These are THREE SEPARATE branches — NOT a chain
// p.then((val) => { console.log("then1:", val); return 3; });
// p.then((val) => console.log("then2:", val));
// p.then((val) => console.log("then3:", val));

// OUTPUT:
// then1: 1
// then2: 1
// then3: 1

// 🔑 Each .then() attached to the SAME promise receives the SAME original value.
// The return 3 in then1 does NOT affect then2 or then3.
// This is BRANCHING. Chaining is p.then().then().then() — a single path.

// ============================================
// Topic 8: .catch() Resets the Chain to Fulfilled
// ============================================

// --- catch handles error, second catch has nothing to catch ---
// Promise.resolve()
//   .then(() => Promise.reject("error"))
//   .catch((err) => {
//     console.log("catch1:", err);       // "error"
//     // no throw here — state becomes fulfilled (return undefined)
//   })
//   .catch((err) => {
//     console.log("catch2:", err);       // ❌ NEVER RUNS — previous .catch() didn't throw
//   });

// OUTPUT:
// catch1: error

// --- catch returns undefined → next .then() gets undefined ---
// Promise.resolve()
//   .then(() => Promise.reject("error"))
//   .catch((err) => {
//     console.log("catch1:", err);       // "error"
//     // returns undefined (no explicit return)
//   })
//   .then((t) => {
//     console.log("then:", t);           // undefined — catch fulfilled with no return
//   });

// OUTPUT:
// catch1: error
// then: undefined

// ============================================
// Topic 9: Full Chain — catch → then → throw → catch → then
// ============================================

// Promise.reject("error")
//   .catch((err) => {
//     console.log("catch:", err);        // "error"
//     return "recovered";               // fulfilled with "recovered"
//   })
//   .then((val) => {
//     console.log("then:", val);         // "recovered"
//     throw new Error("oops");          // rejected
//   })
//   .catch((err) => {
//     console.log("catch2:", err.message); // "oops"
//     // no return → fulfilled with undefined
//   })
//   .then((val) => {
//     console.log("final:", val);        // undefined
//   });

// OUTPUT:
// catch: error
// then: recovered
// catch2: oops
// final: undefined

// ============================================
// Summary — Promise State Machine
// ============================================
//
//   pending ──resolve()──→ fulfilled ──.then()──→ next
//      │                                            │
//      │                                     (if .then throws)
//      │                                            │
//      └──reject()/throw──→ rejected ──.catch()──→ fulfilled (reset!)
//                                                   │
//                                            (if .catch throws)
//                                                   │
//                                               rejected again
//
// KEY RULES:
// 1. Once settled (fulfilled/rejected), a Promise CANNOT change state
// 2. .catch() resets the chain to fulfilled (unless it throws)
// 3. .finally() passes through the previous value — its return is ignored
// 4. throw only works in executor or .then()/.catch() — NOT in setTimeout
// 5. async functions always return a Promise — returned Promises are unwrapped
// 6. Multiple .then() on same promise = branching (each gets same value)
//    vs .then().then() = chaining (each gets previous return value)