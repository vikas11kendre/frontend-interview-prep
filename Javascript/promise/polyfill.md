# Promise Polyfills — Advance

> Deep dive into implementing all Promise static methods from scratch. A favourite FAANG interview topic that tests your understanding of async mechanics, ordering guarantees, and edge cases.

---

## Key Concepts

- **Promise constructor** takes an executor `(resolve, reject)` — once settled, subsequent calls to `resolve`/`reject` are silently ignored. This is the foundation all polyfills exploit.
- **Promise.resolve(x)** safely wraps any value — if `x` is already a thenable, it returns it as-is. Always use this when iterating an input array.
- **Settlement order vs. index order** — async callbacks resolve in *completion* order, not *insertion* order. Polyfills must explicitly preserve index order using `results[i]`.
- **AggregateError** — a special Error subclass that holds an `errors` array. Required by `Promise.any`.

---

## How It Works Under the Hood

The Promise constructor's `resolve`/`reject` are one-shot — the spec says once a promise is resolved/rejected, it is immutable. This means:

- In `race` and `any`: calling `resolve(res)` inside a loop is safe — the first call wins and all subsequent ones are no-ops.
- In `all` and `allSettled`: you must manually track a counter + use `.finally()` to know when *all* have settled.
- The micro-task queue ensures `.then()` / `.catch()` callbacks run *after* the current call stack — never synchronously.

```
Executor runs sync
  └─ Promise.resolve(array[i]) schedules microtasks
       └─ .then() / .catch() run in microtask queue
            └─ .finally() runs after .then()/.catch() is done
```

---

## Polyfill Implementations

### Promise.all
Resolves when **all** fulfill. Rejects on **first** rejection.

```javascript
Promise.myAll = (array) => {
    return new Promise((resolve, reject) => {
        if (array.length === 0) return resolve([]);

        const results = new Array(array.length); // preserve order
        let count = 0;

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => {
                    results[i] = res;            // index order, not completion order
                    count++;
                    if (count === array.length) resolve(results);
                })
                .catch((e) => reject(e));        // first rejection short-circuits
        }
    });
};
```

---

### Promise.allSettled
Always resolves (never rejects). Returns **all outcomes**.

```javascript
Promise.myAllSettled = (array) => {
    return new Promise((resolve) => {
        if (array.length === 0) return resolve([]);

        const results = new Array(array.length);
        let count = 0;

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => {
                    results[i] = { status: "fulfilled", value: res };
                })
                .catch((e) => {
                    results[i] = { status: "rejected", reason: e };
                })
                .finally(() => {
                    count++;
                    if (count === array.length) resolve(results); // never reject
                });
        }
    });
};
```

---

### Promise.race
Settles (resolve **or** reject) with the **first** promise to settle.

```javascript
Promise.myRace = (array) => {
    return new Promise((resolve, reject) => {
        if (array.length === 0) return; // hangs forever — matches native behaviour

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => resolve(res))  // first settle wins
                .catch((e) => reject(e));     // rejection also wins the race
        }
    });
};
```

---

### Promise.any
Resolves with **first fulfillment**. Rejects only when **all** reject.

```javascript
Promise.myAny = (array) => {
    return new Promise((resolve, reject) => {
        if (array.length === 0)
            return reject(new AggregateError([], "All promises were rejected"));

        const errors = new Array(array.length); // preserve error order
        let count = 0;

        for (let i = 0; i < array.length; i++) {
            Promise.resolve(array[i])
                .then((res) => resolve(res))   // first fulfillment wins
                .catch((e) => {
                    errors[i] = e;             // NOT errors.push(e) — order matters
                })
                .finally(() => {
                    count++;
                    if (count === array.length) {
                        reject(new AggregateError(errors, "All promises were rejected"));
                    }
                });
        }
    });
};
```

---

## Interview Traps & Tricky Questions

### Trap 1: `errors.push(e)` vs `errors[i] = e` in `Promise.any`
**What they ask:** "Your `AggregateError` has errors in wrong order — why?"
**Why it's tricky:** `.catch()` fires in *completion* order. If p2 rejects before p1, `push` gives `[p2_err, p1_err]` instead of `[p1_err, p2_err]`.
**Correct answer:** Use `errors[i] = e` with a pre-sized array to preserve the input array's index order.

---

### Trap 2: Empty array behaviour
**What they ask:** "What happens when you call `Promise.all([])`?"
**Why it's tricky:** Most candidates forget to handle this. The loop never runs, `count` never reaches `array.length`, and the promise hangs forever.
**Correct answer:**
- `all([])` → resolves with `[]`
- `allSettled([])` → resolves with `[]`
- `race([])` → hangs forever (matches native)
- `any([])` → rejects with `AggregateError([], ...)`

---

### Trap 3: Using `finally` vs `catch` for counting in `Promise.all`
**What they ask:** "Why not use `.finally()` for counting in `Promise.all`?"
**Why it's tricky:** In `Promise.all`, if you count in `.finally()`, you might resolve *after* you've already rejected — because `.finally()` runs after `.catch()`. The outer promise is already rejected, but your resolve call still runs (silently ignored, but sloppy).
**Correct answer:** For `all`, count inside `.then()` only. For `allSettled` and `any`, `.finally()` is correct since you always wait for all.

---

### Trap 4: Non-promise values in the input array
**What they ask:** "What if the array contains `[1, 2, Promise.resolve(3)]`?"
**Why it's tricky:** Raw values aren't thenables — calling `.then()` on `1` crashes.
**Correct answer:** Wrap every item in `Promise.resolve(array[i])`. It passes through real promises unchanged and wraps raw values in a resolved promise.

---

### Trap 5: `Promise.race` with a rejection
**What they ask:** "If the fastest promise rejects, does `race` wait for others to fulfill?"
**Why it's tricky:** Candidates assume `race` only cares about fulfillment.
**Correct answer:** No — `race` settles with the *first settled* promise, whether fulfilled or rejected. If you want first-fulfillment-wins, use `Promise.any`.

---

## Common Mistakes Senior Devs Still Make

- Using `array.forEach` instead of `for` loop — both work, but `for` loop is more explicit about index access and avoids closure-over-loop-variable issues in older code.
- Forgetting `Promise.resolve()` wrapper — raw values and thenables need uniform treatment.
- Counting settlements in `.then()` AND `.catch()` separately — leads to off-by-one bugs. Use `.finally()` as the single counter when you need to wait for all.
- Not pre-sizing the results array — `new Array(array.length)` + index assignment is required for order preservation.
- Assuming `resolve()`/`reject()` throws or returns something useful after first call — they are silent no-ops after first settlement.

---

## Key Differences & Comparisons

| Method | Short-circuits on | Waits for all? | Rejects with |
|---|---|---|---|
| `all` | First **rejection** | Only if all fulfill | Single error |
| `allSettled` | Never | Always | Never rejects |
| `race` | First **settlement** (either) | Never | Single error |
| `any` | First **fulfillment** | Only if all reject | `AggregateError` |

---

### `race` vs `any`

```
race → fastest finger wins (resolve OR reject)
any  → optimist wins (only resolves, waits for a winner)
```

---

### `all` vs `allSettled`

```
all        → fails fast on first rejection (pessimist)
allSettled → waits for everyone, reports all outcomes (journalist)
```

---

## Quick Revision (Cheat Sheet)

- Always wrap input items in `Promise.resolve()` — handles both values and thenables safely.
- Use `results[i] = val` (not `push`) — order preservation is required by spec.
- Empty array: `all/allSettled` → resolve `[]`, `any` → reject `AggregateError`, `race` → hangs.
- `Promise.all` — count in `.then()` only. Reject in `.catch()`. No `.finally()` needed.
- `Promise.allSettled` — set result in `.then()` and `.catch()`. Count + resolve in `.finally()`.
- `Promise.any` — set error in `.catch()`. Count + reject in `.finally()`. Resolve in `.then()`.
- `Promise.race` — just forward `.then()` → resolve and `.catch()` → reject. No counting needed.
- `AggregateError(errors, message)` — errors array must match input array order.
- After first `resolve()`/`reject()` call, the promise is frozen — all further calls are silently ignored.
- `race([])` hanging forever is **intentional native behaviour** — do not add an early return.

---

## References

- [MDN — Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [MDN — Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [MDN — Promise.race](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race)
- [MDN — Promise.any](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any)
- [ECMAScript Spec — Promise Objects](https://tc39.es/ecma262/#sec-promise-objects)
- [MDN — AggregateError](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)