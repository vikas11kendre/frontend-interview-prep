# call, bind, apply — Deep Notes

---

## 1. Understanding `this` in Classes

```javascript
class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    console.log(this.count++);
  }
}
```

**What happens behind the scenes when we do `new Counter()`:**

- JavaScript creates an empty object `{}`
- That `{}` is replaced with `this` inside the constructor
- Constructor runs → `this.count = 0` → object becomes `{ count: 0 }`
- That object is returned and assigned to c → so c = { count: 0 }

```javascript
const c = new Counter();
console.log(c.increment());
```

- `this` became `{ count: 0 }`
- `increment` is invoked → logs `this.count` → means `{ count: 0 }.count`
- We will get log `0`

---

## 2. `this` Loss — Detaching a Method

```javascript
const inc = c.increment;
inc(); // error Cannot read properties of undefined (reading 'count')
```

- `increment` is a function — we are giving reference of that only, not the complete `c`
-When we detach the method, this loses its context — classes run in strict mode so this becomes undefined
- No `count` is present in `this = undefined` so we get the error

```javascript
const inc1 = c.increment.bind(c);
inc1();
```

- Now `c` which is `{ count: 0 }` is assigned to the `this` of `inc1`

---

## 3. `call` vs `apply` vs `bind`

```javascript
const obj = { name: "Rahul" };

function greet(greeting, punctuation) {
  console.log(greeting + " " + this.name + punctuation);
}

greet.call(obj, "Hello", "!");
greet.apply(obj, ["Hello", "!"]);
const fn = greet.bind(obj, "Hello");
fn("!");
```

- All three log the same thing — `"Hello Rahul!"`
- But notice the `bind` line:

```javascript
const fn = greet.bind(obj, "Hello"); // pre-filled "Hello"
fn("!");                              // only needs "!"
```

- This is called **partial application** — you can pre-fill some arguments with `bind`, and pass the rest later
- `bind` isn't just for locking `this` — it can also **lock arguments**
- **Strong answer:** "bind also supports partial application — you can pre-fill arguments at bind time and pass the rest at call time"

---

## 4. Chaining `bind` — TRAP

```javascript
function foo() { console.log(this.x); }
const a = { x: 1 };
const b = { x: 2 };
const bar = foo.bind(a).bind(b);
bar(); // what logs?
```

- `foo.bind(a)` — creates a new function, `this` locked to `a` ✅
- `.bind(b)` — tries to rebind, but you're binding an already-bound function — `b` is ignored
- So `bar()` logs **1**

---

## 5. Arrow Function — `this` is NOT Dynamic

```javascript
const obj = {
  name: "Rahul",
  greet: () => console.log(this.name)
};
obj.greet(); // undefined
```

**Why `undefined`?**

- Arrow function does **NOT** create its own `this`
- It takes `this` from outer scope (global / module)
- `greet` is defined inside an object literal. But **object literals don't create a new scope** in JavaScript
- So it goes one level up — to the surrounding scope where `obj` is defined. That's either the global scope or a module scope
- In browser global scope → `this = window` → `window.name` is `""` or `undefined`
- In Node/module scope → `this = {}` → `undefined`
- That's why you get `undefined` ✅

**Fix — use regular function:**

```javascript
const obj = {
  name: "Rahul",
  greet: function() { console.log(this.name); } // this = obj ✅
};
// you get "Rahul"
```

---

## 6. Can You `bind` an Arrow Function?

```javascript
obj.greet.bind(obj)(); // will this work?
```

- **No.** `bind` cannot override `this` on an arrow function. Arrow functions have no `this` of their own — so there's nothing to bind
- It's the same reason you can't `call` or `apply` an arrow function with a different `this` — they all get **silently ignored**

```javascript
const arrow = () => console.log(this);

arrow.call({ x: 1 });   // still logs global this, not { x: 1 }
arrow.apply({ x: 1 });  // same
arrow.bind({ x: 1 })(); // same
```

- **Regular functions** → `this` is dynamic, can be overridden with `bind/call/apply`
- **Arrow functions** → `this` is lexical, locked at definition time, **forever**

---

## 7. `call(null)` — Sloppy vs Strict Mode

```javascript
function foo() { console.log(this); }
foo.call(null); // what is this?
```

- In **sloppy mode** → `this = window` (null gets replaced with global)
- In **strict mode** → `this = null`
- Since this is a regular function in global scope — sloppy mode — `this` becomes `window`, not `null`
- **Rule:** `call(null)` or `call(undefined)` → JS substitutes `window` in sloppy mode
- Output is the **window object**

---

## 8. Losing `this` in `setTimeout` — TRAP

```javascript
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(function() {
      console.log(this.seconds++);
    }, 1000);
  }
}
new Timer().start();
```

- `{ seconds: 0 }`
- `start()` has context — `this` is `{ seconds: 0 }`
- But the function is passed as a **callback by timer which is a Web API**
- Context is the timer instance — but the regular function callback loses it
- `timer this` or instance doesn't have `seconds` → so `undefined`
- `this.seconds` → `this = window` → `window.seconds = undefined`
- `undefined++` → converts to `NaN` first, then increments
- Logs `NaN`, not `undefined`
- correct explanation
- new Timer() creates { seconds: 0 }
- start() has context — this inside start() is { seconds: 0 } ✅
- But the function inside setInterval is a regular function passed as a callback to a Web API (browser timer)
- The browser timer invokes the callback — not the Timer instance — so this inside the callback becomes window
- window.seconds does not exist → undefined
- undefined++ → converts to NaN first, then increments
- Logs NaN, not undefined
**The sequence:**
1. Read `this.seconds` → `undefined`
2. Convert to number → `NaN`
3. Log `NaN` (post-increment — print first)
4. Increment `NaN` → still `NaN`

---

### Fix 1 — `bind`

```javascript
// ❌ wrong version
setInterval(function() {
  console.log(this.seconds++);
}.bind(Timer), 1000);
// Timer is the class itself, not the instance
```

```javascript
// ✅ correct
setInterval(function() {
  console.log(this.seconds++);
}.bind(this), 1000);
// this inside start() = the Timer instance
```

`bind` does work here — you're binding a regular function, not an arrow function. So it's perfectly valid. ✅

---

### Fix 2 — Arrow Function

```javascript
setInterval(() => {
  console.log(this.seconds++);
}, 1000);
```

Arrow function takes `this` from `start()` method's lexical scope, where `this = Timer instance` 🔥

---

### Fix 3 — `self = this` (pre-ES6 pattern)

```javascript
start() {
  const self = this; // capture the Timer instance
  setInterval(function() {
    console.log(self.seconds++); // use self instead of this
  }, 1000);
}
```

Old school pre-ES6 fix — before arrow functions and `bind` were common, developers used `const self = this` or `const that = this` to capture context.

---

## 9. `apply` for Math — Classic Trick

```javascript
const nums = [3, 1, 4, 1, 5, 9];
// find max without spread operator
Math.max.apply(null, nums); // 9
```

- We can pass anything instead of `null`
- Because `Math.max` does **not use `this` internally**
- `null` is just a convention meaning "no context needed"
- `apply` spreads the array as individual args → same as `Math.max(3, 1, 4, 1, 5, 9)`
- Output: **9**