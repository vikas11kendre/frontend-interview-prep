# Promise — Hard & Tricky Interview Questions (Senior / Lead)

> Output-prediction and edge-case questions that separate senior candidates from the rest. Every question maps to a real concept trap. No syntax basics — only the stuff that trips up experienced devs.

---

## Section 1: Execution Order & Microtask Queue

### Q1 — What is the output?

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");
```

<details>
<summary>Answer</summary>

```
1
4
3
2
```

**Why:** Sync runs first (`1`, `4`). Microtasks (Promise `.then`) flush before macrotasks (setTimeout). `3` before `2`.

</details>

---

### Q2 — Nested microtasks. What is the output?

```javascript
Promise.resolve()
  .then(() => {
    console.log("a");
    Promise.resolve().then(() => console.log("b"));
  })
  .then(() => console.log("c"));
```

<details>
<summary>Answer</summary>

```
a
b
c
```

**Why:** 
- `.then("a")` runs → logs `a`, schedules inner `.then("b")` as a microtask
- `.then("c")` is already queued, but the inner `.then("b")` was queued **before** it resolves
- Microtask queue processes in FIFO: `b` fires before `c`

**The trap:** Candidates assume `a → c → b` (depth-first), but it's actually breadth-first within the microtask queue.

</details>

---

### Q3 — setTimeout vs Promise ordering inside executor

```javascript
const p = new Promise((resolve) => {
  setTimeout(() => {
    resolve("timeout");
    console.log("after resolve");
  }, 0);
  console.log("executor");
});

p.then((val) => console.log("then:", val));
console.log("sync");
```

<details>
<summary>Answer</summary>

```
executor
sync
after resolve
then: timeout
```

**Why:** `resolve()` schedules the `.then()` as a microtask — but microtasks are only flushed once the *current task* (the setTimeout callback) finishes. So `after resolve` logs before `then: timeout`.
OUTPUT: executor
MACROTASK QUEUE: [setTimeout callback]
</details>

---

## Section 2: Chaining & Return Values

### Q4 — What does `then2` log?

```javascript
Promise.resolve(1)
  .then((val) => {
    console.log("then1:", val);
    // no return
  })
  .then((val) => {
    console.log("then2:", val);
  });
```

<details>
<summary>Answer</summary>

```
then1: 1
then2: undefined
```

**Why:** If `.then()` returns nothing, the next handler receives `undefined`. A missing `return` is one of the most common bugs in real codebases.

</details>

---

### Q5 — Branching vs chaining trap

```javascript
const p = Promise.resolve(1);

const p2 = p.then((val) => {
  console.log("branch1:", val);
  return 10;
});

const p3 = p.then((val) => {
  console.log("branch2:", val);
  return 20;
});

p2.then((val) => console.log("p2 result:", val));
p3.then((val) => console.log("p3 result:", val));
```

<details>
<summary>Answer</summary>

```
branch1: 1
branch2: 1
p2 result: 10
p3 result: 20
```

**Why:** `p2` and `p3` both branch off the **same** original promise `p`. They both receive `1`. They don't affect each other. Each branch is independent.

**The trap:** Candidates assume `branch2` gets `10` because it "comes after" `branch1`.

</details>

---

### Q6 — Returning a Promise from `.then()`

```javascript
Promise.resolve("outer")
  .then((val) => {
    console.log("then1:", val);
    return new Promise((resolve) => {
      setTimeout(() => resolve("inner"), 100);
    });
  })
  .then((val) => console.log("then2:", val));
```

<details>
<summary>Answer</summary>

```
then1: outer
then2: inner
```

**Why:** When `.then()` returns a Promise, the chain **waits** for it to settle. The next `.then()` receives the *unwrapped* resolved value — `"inner"`, not the Promise object.

</details>

---

## Section 3: Error Handling

### Q7 — Does `.catch()` run here?

```javascript
Promise.resolve()
  .then(() => {
    setTimeout(() => {
      throw new Error("async throw");
    }, 0);
  })
  .catch((e) => console.log("caught:", e.message));
```

<details>
<summary>Answer</summary>

```
Uncaught Error: async throw
```

**Why:** `throw` inside `setTimeout` is outside the Promise chain. By the time it throws, the `.then()` has already fulfilled. Promise `.catch()` **cannot** intercept errors from async callbacks (setTimeout, setInterval, event listeners). Use `reject()` instead.

</details>

---

### Q8 — `catch` resetting the chain

```javascript
Promise.reject("error")
  .catch((err) => {
    console.log("catch1:", err);
    return "recovered";
  })
  .catch((err) => {
    console.log("catch2:", err);
  })
  .then((val) => console.log("then:", val));
```

<details>
<summary>Answer</summary>

```
catch1: error
then: recovered
```

**Why:** `catch1` handles the rejection and returns `"recovered"` — this converts the chain back to **fulfilled**. `catch2` is skipped entirely. `then` receives `"recovered"`.

</details>

---

### Q9 — What if `.catch()` throws?

```javascript
Promise.reject("first error")
  .catch((err) => {
    console.log("catch1:", err);
    throw new Error("second error");
  })
  .catch((err) => {
    console.log("catch2:", err.message);
  })
  .then((val) => console.log("then:", val));
```

<details>
<summary>Answer</summary>

```
catch1: first error
catch2: second error
then: undefined
```

**Why:** `catch1` throws — so it rejects again. `catch2` handles it and returns `undefined` (no return). Chain resolves to fulfilled with `undefined`. `then` runs.

</details>

---

### Q10 — resolve wins over throw

```javascript
const p = new Promise((resolve, reject) => {
  resolve("success");
  throw new Error("too late");
});

p
  .then((val) => console.log("then:", val))
  .catch((err) => console.log("catch:", err.message));
```

<details>
<summary>Answer</summary>

```
then: success
```

**Why:** Promise settles **once**. `resolve("success")` settles it first. The subsequent `throw` is silently ignored. `.catch()` never runs.

</details>

---

## Section 4: `.finally()` Edge Cases

### Q11 — Does `.finally()` pass through the value?

```javascript
Promise.resolve(42)
  .finally(() => {
    console.log("finally");
    return 100; // does this change the value?
  })
  .then((val) => console.log("then:", val));
```

<details>
<summary>Answer</summary>

```
finally
then: 42
```

**Why:** `.finally()` return values are **ignored**. The original resolved value `42` passes through unchanged to the next `.then()`.

</details>

---

### Q12 — `.finally()` with a throw

```javascript
Promise.resolve(42)
  .finally(() => {
    throw new Error("finally error");
  })
  .then((val) => console.log("then:", val))
  .catch((err) => console.log("catch:", err.message));
```

<details>
<summary>Answer</summary>

```
catch: finally error
```

**Why:** The ONE exception to the "finally is transparent" rule — if `.finally()` **throws**, it overrides the resolved value and rejects the chain.

</details>

---

### Q13 — `.finally()` with a returned rejected Promise

```javascript
Promise.resolve(42)
  .finally(() => Promise.reject("finally rejected"))
  .then((val) => console.log("then:", val))
  .catch((err) => console.log("catch:", err));
```

<details>
<summary>Answer</summary>

```
catch: finally rejected
```

**Why:** Returning a **rejected** Promise from `.finally()` also overrides the original value — same as throwing. Only fulfilled return values are ignored.

</details>

---

## Section 5: async / await Traps

### Q14 — What does this async function return?

```javascript
async function foo() {
  return Promise.resolve(42);
}

foo().then((val) => console.log(val));
```

<details>
<summary>Answer</summary>

```
42
```

**Why:** `async` functions automatically **unwrap** returned Promises. There's no double-wrapping — you get `Promise<42>`, not `Promise<Promise<42>>`.

</details>

---

### Q15 — await vs .then() ordering

```javascript
async function run() {
  console.log("1");

  await Promise.resolve();

  console.log("2");
}

run();

console.log("3");
```

<details>
<summary>Answer</summary>

```
1
3
2
```

**Why:** `await` suspends the async function and yields control back to the caller. `console.log("3")` runs synchronously. `"2"` resumes as a microtask after the current call stack clears.

</details>

---

### Q16 — Unhandled rejection in async function

```javascript
async function failing() {
  throw new Error("oops");
}

failing();
console.log("after call");
```

<details>
<summary>Answer</summary>

```
after call
UnhandledPromiseRejection: oops
```

**Why:** `async` functions always return a Promise. `throw` inside becomes a rejected Promise. Since no `.catch()` or `try/catch` handles it, it's an unhandled rejection — but still runs *after* the current sync code.

</details>

---

## Section 6: Promise.all / race / any / allSettled Traps

### Q17 — `Promise.all` with a non-promise value

```javascript
Promise.all([1, Promise.resolve(2), 3])
  .then((vals) => console.log(vals));
```

<details>
<summary>Answer</summary>

```
[1, 2, 3]
```

**Why:** `Promise.all` internally wraps each value in `Promise.resolve()`. Plain values `1` and `3` become immediately resolved promises.

</details>

---

### Q18 — `Promise.all` failure ordering

```javascript
const p1 = new Promise((_, reject) => setTimeout(() => reject("p1 fail"), 100));
const p2 = new Promise((_, reject) => setTimeout(() => reject("p2 fail"), 50));
const p3 = new Promise((resolve) => setTimeout(() => resolve("p3 ok"), 200));

Promise.all([p1, p2, p3])
  .then((vals) => console.log("resolved:", vals))
  .catch((err) => console.log("rejected:", err));
```

<details>
<summary>Answer</summary>

```
rejected: p2 fail
```

**Why:** `p2` rejects first (50ms). `Promise.all` short-circuits immediately with that error. `p1` and `p3` are still running but their outcomes are ignored.

</details>

---

### Q19 — `Promise.race` with an already-resolved promise

```javascript
const p1 = new Promise((resolve) => setTimeout(() => resolve("slow"), 100));
const p2 = Promise.resolve("instant");

Promise.race([p1, p2]).then((val) => console.log(val));
```

<details>
<summary>Answer</summary>

```
instant
```

**Why:** `p2` is already resolved synchronously. When the race starts, `p2`'s `.then()` schedules a microtask immediately. It wins before `p1`'s timeout fires.

</details>

---

### Q20 — `Promise.any` all reject

```javascript
Promise.any([
  Promise.reject("a"),
  Promise.reject("b"),
  Promise.reject("c"),
])
  .then((val) => console.log("resolved:", val))
  .catch((err) => {
    console.log(err instanceof AggregateError);
    console.log(err.errors);
  });
```

<details>
<summary>Answer</summary>

```
true
["a", "b", "c"]
```

**Why:** When all promises reject, `Promise.any` rejects with an `AggregateError`. `err.errors` contains all rejection reasons in **input array order**, not rejection order.

</details>

---

## Section 7: Lead-Level Design Questions

### Q21 — How would you implement a promise timeout wrapper?

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// Usage
withTimeout(fetch("/api/data"), 3000)
  .then((res) => console.log("ok"))
  .catch((err) => console.log(err.message));
```

**Follow-up they ask:** "What's the problem with this implementation?"

<details>
<summary>Answer</summary>

The original `promise` (e.g. fetch) is **still running** in the background even after the timeout wins the race. `Promise.race` only ignores the outcome — it does not cancel the underlying operation. True cancellation requires `AbortController`.

```javascript
function withTimeout(promise, ms, signal) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => {
      signal?.abort();
      reject(new Error(`Timed out after ${ms}ms`));
    }, ms)
  );
  return Promise.race([promise, timeout]);
}
```

</details>

---

### Q22 — Sequential vs parallel execution

```javascript
const tasks = [fetchUser, fetchPosts, fetchComments]; // array of async functions

// Option A
for (const task of tasks) {
  await task();
}

// Option B
await Promise.all(tasks.map(task => task()));
```

**What's the difference? When would you choose each?**

<details>
<summary>Answer</summary>

- **Option A (sequential):** Tasks run one after another. Total time = sum of all durations. Use when tasks **depend on each other** or when you need to avoid race conditions / rate limiting.
- **Option B (parallel):** All tasks fire simultaneously. Total time = slowest task. Use when tasks are **independent** and you want maximum throughput.

**The trap:** Candidates write `await` inside loops without thinking about whether parallelism is possible. In most API calls, Option B is correct. In DB transactions or dependent writes, Option A is necessary.

</details>

---

### Q23 — Promise retry with exponential backoff

```javascript
async function withRetry(fn, retries = 3, delay = 100) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delay * 2 ** i));
    }
  }
}
```

**Follow-up:** "Why `delay * 2 ** i` and not just `delay`?"

<details>
<summary>Answer</summary>

Exponential backoff. Each retry waits twice as long as the previous one (100ms → 200ms → 400ms). This avoids thundering herd — if a service is overloaded, hammering it with retries at the same interval makes things worse. Exponential backoff gives the service time to recover.

</details>

---

## Quick Revision Cheat Sheet

- Microtasks (Promise `.then`) always flush **before** macrotasks (setTimeout, setInterval).
- `throw` inside setTimeout is **not** caught by Promise chain — use `reject()`.
- `.then()` without `return` passes `undefined` to the next handler.
- Branching off the same promise: each branch gets the **original value**, independently.
- `.finally()` return values are **ignored** — unless it throws or returns a rejected Promise.
- `async` functions unwrap returned Promises — no double wrapping.
- `await` suspends the async function and yields back to the caller synchronously.
- `Promise.all` rejects with the **first** rejection, order of input array doesn't matter.
- `Promise.any` errors are in **input array order**, not rejection order.
- `Promise.race` does NOT cancel the losers — they still run in the background.
- Sequential `await` in a loop = serial. Use `Promise.all` when tasks are independent.
- Once a Promise settles, all further `resolve`/`reject` calls are silent no-ops.