# Promise — Final Notes

## What is a Promise?
A Promise is a built-in JavaScript object representing the eventual completion or failure of an asynchronous operation and its resulting value.

**3 States:**
- `pending` — initial state, operation in progress
- `fulfilled` — resolved successfully via `resolve()`
- `rejected` — failed via `reject()` or an uncaught `throw`

**Why Promises over Callbacks?**
Callbacks created "Callback Hell" — deeply nested, hard to read, error handling repeated at every level.
`async/await` is syntactic sugar *on top of* Promises — every `async` function returns a Promise.

---

## A) Promise Constructor & Executor

```js
const p = new Promise((resolve, reject) => {
  // executor runs synchronously and immediately
});
```

**Rules:**
- The executor runs **synchronously** — code before `setTimeout`/`fetch` runs first
- Once a Promise is **settled** (resolved or rejected), its state **cannot change**
- Calling `resolve()` after `reject()` (or vice versa) is silently ignored
- A `throw` inside the **executor** automatically calls `reject()` with the error
- A `throw` inside **async callbacks** (setTimeout, addEventListener) is **NOT caught** — the Promise stays pending and the error becomes an uncaught exception — you must call `reject()` manually

**Key Rule:**
> `throw` only works inside the executor or a `.then()` handler. Inside `setTimeout`, `setInterval`, `addEventListener` — always call `reject()`.

---

## B) `.then()` `.catch()` `.finally()`

### `.then(onFulfilled, onRejected)`
- Receives the resolved value
- Whatever it **returns** becomes the resolved value of the next `.then()`
- If it returns **nothing** → next `.then()` gets `undefined`
- If it returns a **Promise** → chain suspends (Promise assimilation — see C)
- If it **throws** → next `.catch()` receives the error

### `.catch(onRejected)`
- Shorthand for `.then(undefined, onRejected)`
- After `.catch()` runs **without throwing**, the chain **returns to fulfilled state**
- Its return value passes to the next `.then()`
- A second `.catch()` after a non-throwing `.catch()` will **not** fire

### `.finally(callback)`
- Runs on **both** fulfillment and rejection
- Receives **no arguments** (no access to value or error)
- Its **return value is discarded** — the previous value passes through unchanged
- If `.finally()` **throws**, that error propagates to the next `.catch()`

**State flow:**

```
resolve → .then() runs   → value passes down
reject  → .catch() runs  → if no throw, state = fulfilled, value passes down
        → .then() after .catch() runs normally
```

---

## C) Chaining

### Value Propagation
Each `.then()` receives the return value of the previous one.

```js
Promise.resolve(1)
  .then(val => val + 1)   // 2
  .then(val => val * 3)   // 6
  .then(val => console.log(val)); // 6
```

### Promise Assimilation
When `.then()` returns a **Promise**, the chain **suspends** and waits for that inner Promise to settle. The next `.then()` receives the **unwrapped value**, not the Promise object.

```js
Promise.resolve("outer")
  .then(val => new Promise(res => setTimeout(() => res("inner"), 1000)))
  .then(val => console.log(val)); // "inner" (after 1s)
```

### Error Propagation
Errors skip all `.then()` handlers until the next `.catch()`.

```js
Promise.resolve()
  .then(() => { throw new Error("fail"); })
  .then(() => console.log("skipped"))   // skipped
  .catch(err => console.log(err.message)); // "fail"
```

### Branching vs Chaining
- **Chaining**: `.then()` on the *result* of a previous `.then()` — sequential pipeline
- **Branching**: multiple `.then()` on the *same* Promise — each gets the **same original value** independently

```js
const p = Promise.resolve(1);
p.then(val => console.log("branch A:", val)); // 1
p.then(val => console.log("branch B:", val)); // 1
p.then(val => console.log("branch C:", val)); // 1
```

---

# 📘 JavaScript Promises – Deep Dive (Interview Ready)

This file covers **Promises, chaining, errors, `.finally()`**, and tricky behaviors that are frequently asked in **frontend & product-based interviews**.

---

# 🚀 1. Promise Basics (`resolve` / `reject`)

## ✅ `Promise.resolve()`

```js
const a = Promise.resolve(1);
console.log(typeof a, a);
// object, Promise {1}

a.then(val => console.log(val))
 .then(val => console.log(val));
// 1
// undefined (nothing returned from previous then)
```

---

## ❌ `Promise.reject()`

```js
const b = Promise.reject(1);
console.log(typeof b, b);
// object, Promise { <rejected> 1 }
```

👉 Causes unhandled rejection if not caught

---

# ⚙️ 2. Execution Order (Event Loop Insight)

```js
const promise = new Promise((resolve) => {
  console.log("start");

  setTimeout(() => {
    console.log("time start");
    resolve("done");
    console.log("time end");
  });

  console.log("end");
});

promise.then(t => console.log(t));
```

### 🧾 Output

```
start
end
time start
time end
done
```

👉 **Synchronous first → then async → then `.then()` (microtask)**

---

# ❌ 3. Reject vs Throw

## Using `reject`

```js
reject("error");
```

## Using `throw`

```js
throw new Error("error");
```

---

## ⚠️ Important Rule

> `throw` works ONLY inside:

* Promise executor
* `.then()` / `.catch()`

❌ NOT inside:

* `setTimeout`
* `setInterval`
* DOM events

---

## ❌ Example (Wrong)

```js
setTimeout(() => {
  throw new Error("error"); // NOT caught
});
```

👉 Promise stays **pending**

---

## ✅ Correct Way

```js
setTimeout(() => {
  reject("error");
});
```

---

# 🔥 4. Throw Inside Executor

```js
const promise = new Promise(() => {
  console.log("start");
  throw new Error("this is error");
});

promise.catch(e => console.log("error", e.message));
```

### 🧾 Output

```
start
error this is error
```

👉 `throw` automatically converts to `reject`

---

# ⚡ 5. Resolve vs Throw Priority

```js
const p = new Promise((resolve) => {
  resolve("success");
  throw new Error("too late");
});

p.then(val => console.log("then:", val))
 .catch(err => console.log("catch:", err));
```

### 🧾 Output

```
then: success
```

👉 Once resolved → state is locked ✅

---

# 🔗 6. Promise Chaining & Assimilation

```js
Promise.resolve("outer")
  .then(() => {
    return new Promise(resolve => {
      setTimeout(() => resolve("inner"), 1000);
    });
  })
  .then(val => console.log(val));
```

### 🧾 Output

```
inner
```

---

## 🧠 Interview Statement

> When `.then()` returns a Promise, the chain waits for it to resolve and passes the resolved value to the next `.then()` — not the Promise itself.

---

# 🔥 7. `.finally()` Behavior

```js
Promise.resolve(1)
  .then(val => {
    console.log(val);
    return Promise.reject("oops");
  })
  .catch(err => {
    console.log("catch:", err);
    return "recovered";
  })
  .finally(() => {
    console.log("finally");
    return "ignored";
  })
  .then(val => {
    console.log("then:", val);
  });
```

### 🧾 Output

```
1
catch: oops
finally
then: recovered
```

---

## 🧠 Rules

* Runs on both success & failure
* No access to value/error
* Return value is **ignored**

---

# ⚡ 8. Async Functions

```js
async function greet() {
  return "hello";
}

console.log(greet());
// Promise { 'hello' }
```

---

## Returning Promise inside async

```js
async function fetchData() {
  return Promise.reject("failed");
}
```

👉 Not nested → directly rejected

---

# 🔄 9. Async inside `.then()`

```js
Promise.resolve(1)
  .then(async val => val + 1)
  .then(val => console.log(val));
```

### 🧾 Output

```
2
```

👉 Async returns Promise → auto unwrapped

---

# 🌿 10. Multiple `.then()` (Branching)

```js
const p = Promise.resolve(1);

p.then(val => console.log("then1:", val));
p.then(val => console.log("then2:", val));
p.then(val => console.log("then3:", val));
```

### 🧾 Output

```
then1: 1
then2: 1
then3: 1
```

👉 Each `.then()` gets same value
👉 This is **branching**, not chaining

---

# 🔥 11. `.catch()` Behavior

```js
Promise.resolve()
  .then(() => Promise.reject("error"))
  .catch(err => {
    console.log("catch1:", err);
  })
  .catch(err => {
    console.log("catch2:", err);
  });
```

### 🧾 Output

```
catch1: error
```

👉 Second catch won't run
👉 Because error already handled

---

# 🔁 12. Catch → Then Flow

```js
Promise.resolve()
  .then(() => Promise.reject("error"))
  .catch(err => {
    console.log("catch:", err);
  })
  .then(val => {
    console.log("then:", val);
  });
```

### 🧾 Output

```
catch: error
then: undefined
```

👉 Catch converts state → fulfilled

---

# 🔥 13. Full Chain Example

```js
Promise.reject("error")
  .catch(err => {
    console.log("catch:", err);
    return "recovered";
  })
  .then(val => {
    console.log("then:", val);
    throw new Error("oops");
  })
  .catch(err => {
    console.log("catch2:", err.message);
  })
  .then(val => {
    console.log("final:", val);
  });
```

### 🧾 Output

```
catch: error
then: recovered
catch2: oops
final: undefined
```

---

# 🧠 Final Mental Model

```txt
resolve → then → then → then
reject  → catch → then → then
throw   → catch
finally → runs always (ignored return)
```

---

# 🎯 Key Takeaways

* Promise state is **immutable once settled**
* `.then()` returns a new Promise
* `.catch()` handles rejection & converts state
* `.finally()` does NOT affect value
* Async functions always return Promises
* Returning a Promise inside `.then()` triggers **assimilation**

---

# 🚀 Interview Tip

If stuck, say:

> “Promises use microtask queue, support chaining, and automatically unwrap returned Promises.”

---

Happy Coding 🚀




















## D) Static Methods

### `Promise.all(iterable)`
- Waits for **all** promises to resolve
- Resolves with an **array** of values in the same order
- **Short-circuits on first rejection** — rejects immediately, others are ignored

```js
Promise.all([p1, p2, p3]).then(([v1, v2, v3]) => ...);
Promise.all([resolve(1), reject("x"), resolve(3)]).catch(err => ...); // "x"
```

**Use when:** all results are needed and failure of any = failure overall.

---

### `Promise.allSettled(iterable)`
- Waits for **all** promises to settle (resolve or reject)
- **Never rejects** — always resolves with an array of result objects

```js
Promise.allSettled([resolve(1), reject("error")]).then(results => {
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected',  reason: 'error' }
  // ]
});
```

**Use when:** you need to know the outcome of every promise regardless of failure.

---

### `Promise.race(iterable)`
- Settles with the **first** promise to settle — whether fulfilled or rejected
- Remaining promises are ignored after the first settles

```js
Promise.race([
  new Promise(res => setTimeout(() => res("slow"), 1000)),
  new Promise(res => setTimeout(() => res("fast"), 100)),
]).then(val => console.log(val)); // "fast"
```

**Use when:** you need a timeout or want whichever resolves first.

---

### `Promise.any(iterable)`
- Resolves with the **first fulfilled** promise
- **Ignores rejections** unless ALL reject → rejects with `AggregateError`

```js
Promise.any([reject("a"), resolve("b"), resolve("c")])
  .then(val => console.log(val)); // "b"

Promise.any([reject("a"), reject("b")])
  .catch(err => console.log(err)); // AggregateError: All promises were rejected
```

**Use when:** you want the first success and don't care about failures (opposite of `Promise.all`).

---

## Comparison Table

| Method           | Resolves when       | Rejects when          | Result shape                  |
|------------------|---------------------|-----------------------|-------------------------------|
| `Promise.all`    | ALL resolve         | First rejection       | Array of values               |
| `Promise.allSettled` | ALL settle      | Never                 | Array of `{status, value/reason}` |
| `Promise.race`   | First to settle     | First to settle (rejection) | Single value/error       |
| `Promise.any`    | First to resolve    | ALL reject            | Single value / AggregateError |
