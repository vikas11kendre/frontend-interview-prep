# React Internals — Deep Dive Notes

> Covers React Fiber, reconciliation, re-render behavior, hooks internals, concurrent mode, and common interview traps. Senior-level prep for FAANG and top product companies.

---

## Table of Contents

1. [React Fiber Architecture](#1-react-fiber-architecture)
2. [How React Decides WHAT to Re-render and WHEN](#2-how-react-decides-what-to-re-render-and-when)
3. [What Happens Between setState and DOM Update](#3-what-happens-between-setstate-and-dom-update)
4. [useEffect vs useLayoutEffect](#4-useeffect-vs-uselayouteffect)
5. [Reconciliation & Diffing Algorithm](#5-reconciliation--diffing-algorithm)
6. [Concurrent Mode vs Legacy Mode](#6-concurrent-mode-vs-legacy-mode)
7. [React.memo — How it Works and When it Fails](#7-reactmemo--how-it-works-and-when-it-fails)
8. [Controlled vs Uncontrolled Components](#8-controlled-vs-uncontrolled-components)
9. [useContext — Re-renders and Optimization](#9-usecontext--re-renders-and-optimization)
10. [ReactDOM.render vs ReactDOM.createRoot](#10-reactdomrender-vs-reactdomcreateroot)

---

## 1. React Fiber Architecture

> Fiber is the internal reconciliation engine introduced in React 16. It replaced the old Stack reconciler and made rendering interruptible.

### Why was Fiber introduced?

The old **Stack reconciler** had one critical flaw — once it started reconciling, it **could not pause or stop**. It had to process the entire component tree synchronously.

```
Old Stack Reconciler:
Start reconciling 500 components
→ cannot stop
→ blocks main thread for 200ms
→ user clicks, scrolls, types → UI FROZEN ❌

Fiber Reconciler:
Start reconciling 500 components
→ do a little work (one fiber at a time)
→ check: is there something more urgent?
→ YES → pause, handle urgent work first
→ resume reconciliation
→ user never feels the freeze ✅
```

### What is a Fiber?

A **fiber** is a JavaScript object — one per component — that contains everything React needs to manage that component:

```js
{
  type,           // component function or DOM tag
  key,            // for list reconciliation
  child,          // first child fiber
  sibling,        // next sibling fiber
  return,         // parent fiber
  pendingProps,   // new props
  memoizedProps,  // props from last render
  memoizedState,  // state from last render
  effectTag,      // what needs to happen (insert, update, delete)
  alternate,      // pointer to the previous version of this fiber
}
```

React maintains **two fiber trees**:
- **Current tree** — what is currently on screen
- **Work-in-progress tree** — what React is building for the next render

### The 2 Phases of Fiber

```
Phase 1 — Render / Reconciliation (INTERRUPTIBLE ✅)
→ React builds work-in-progress fiber tree in memory
→ diffs old tree vs new tree
→ marks which fibers changed (effects list)
→ real DOM is NOT touched
→ can pause, resume, or discard entirely

Phase 2 — Commit (NOT INTERRUPTIBLE ❌)
→ React applies changes to the real DOM
→ must finish in one go
→ pausing mid-commit = user sees broken/torn UI
```

**Why commit can't pause:** If React paused halfway through DOM mutations, the user would see a half-old, half-new UI — called a **torn UI**. Like pausing surgery halfway through.

### Commit Phase — 3 Sub-phases

```
1. Before Mutation
   → reads DOM before changes
   → runs useLayoutEffect cleanups

2. Mutation
   → inserts, deletes, updates real DOM nodes
   → THIS is why commit can't pause

3. Layout
   → runs useLayoutEffect callbacks
   → updates refs (ref.current = DOM node)
   → then browser paints

After paint → useEffect runs
```

### Memorable Takeaway

> Fiber = work split into small pauseable units (one per component). Render phase = safe to pause (memory only). Commit phase = no pausing (real DOM surgery).

---

## 2. How React Decides WHAT to Re-render and WHEN

> React re-renders more than most developers expect. Understanding the subtree rule and bailout conditions is critical.

### What triggers a re-render?

```
1. setState() or useReducer dispatch called
2. Props change (parent re-renders)
3. Context value changes
4. Parent re-renders — even if props are the same ⚠️
```

### The Subtree Rule (Most Misunderstood)

When a component re-renders, **all its children re-render too** by default:

```jsx
function Parent() {
  const [count, setCount] = useState(0);
  return <Child />; // re-renders every time Parent does — even with no props!
}

function Child() {
  console.log('Child rendered'); // logs on every Parent re-render
  return <div>I am child</div>;
}
```

### Batching — React doesn't re-render immediately

React batches multiple state updates into one re-render:

```js
// React 18 — ONE re-render (automatic batching everywhere)
setTimeout(() => {
  setCount(1);   // queued
  setName('Jo'); // queued
  setAge(25);    // queued
  // ONE re-render fires here
}, 1000);

// React 17 — 3 separate re-renders inside setTimeout
// Batching only worked inside React event handlers in React 17
```

### How React Compares State — `Object.is()`

React uses `Object.is()` to compare old vs new state:

```js
setState(42)      // re-renders (0 !== 42)
setState(0)       // NO re-render (0 === 0)
setState([])      // re-renders (new array reference)
items.push(x);
setState(items);  // NO re-render ❌ same reference — common bug!
```

### Bailout Conditions — How React SKIPS re-renders

```jsx
// 1. React.memo — shallow compare props
const Child = React.memo(({ name }) => <div>{name}</div>);

// 2. useMemo — memoize expensive values
const value = useMemo(() => compute(data), [data]);

// 3. useCallback — stable function references
const fn = useCallback(() => doSomething(id), [id]);
```

### Re-render Decision Tree

```
setState called
      ↓
Object.is(oldState, newState)?
  SAME → bail out, no re-render ✅
  DIFFERENT → schedule re-render
      ↓
Component wrapped in React.memo?
  NO → re-render + all children
  YES → shallow compare props changed?
    NO → bail out ✅
    YES → re-render + all children
```

### Memorable Takeaway

> Re-render ≠ DOM update. React re-renders in memory first. Children always re-render unless memo-ized. Mutating state directly = same reference = no re-render (silent bug).

---

## 3. What Happens Between setState and DOM Update

> setState is asynchronous and triggers a multi-step pipeline before anything appears on screen.

### Full Pipeline

```
1. setState() called
      ↓
2. React creates an Update object and queues it
      ↓
3. React schedules work (via scheduler — priority based)
      ↓
4. Batching — multiple setState calls merged into one
      ↓
5. Render Phase begins
   → React calls your component function
   → builds work-in-progress fiber tree
   → diffs with current tree
   → marks effects (what changed)
      ↓
6. Commit Phase begins (synchronous)
   → Before Mutation (cleanup)
   → Mutation (real DOM updated)
   → Layout (useLayoutEffect, refs updated)
      ↓
7. Browser paints the screen
      ↓
8. useEffect callbacks run (after paint)
```

### setState is NOT synchronous

```jsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(1);
  console.log(count); // still 0! state hasn't updated yet
};
```

React queues the update — `count` is still the old value until next render.

### Functional Updates — Always use when new state depends on old

```jsx
// WRONG — may use stale state in async scenarios
setCount(count + 1);

// CORRECT — always gets the latest state
setCount(prev => prev + 1);
```

### Priority-based Scheduling

React 18 assigns **priority lanes** to updates:

```
Urgent (sync):    user input, clicks, typing
Normal:           setState from event handlers
Transition:       startTransition() — can be interrupted
Deferred:         useDeferredValue() — lowest priority
```

```jsx
import { startTransition } from 'react';

// Mark as non-urgent — React can interrupt and prioritize other work
startTransition(() => {
  setSearchResults(results); // heavy update, low priority
});
```

### Memorable Takeaway

> `setState` queues an update, doesn't apply it immediately. The pipeline is: queue → batch → render phase → commit phase → paint → useEffect. Never read state immediately after setting it.

---

## 4. useEffect vs useLayoutEffect

> Both run after render — but at different points in the pipeline. Wrong choice causes visual flickers.

### Execution Timing

```
Render Phase (memory)
      ↓
Commit Phase — DOM mutated
      ↓
useLayoutEffect runs ← BEFORE browser paint (synchronous)
      ↓
Browser paints screen
      ↓
useEffect runs ← AFTER browser paint (asynchronous)
```

### useEffect — After Paint

```jsx
useEffect(() => {
  // runs AFTER browser has painted
  // user sees the screen before this runs
  fetchData();
  addEventListeners();
  return () => cleanup(); // runs before next effect or unmount
}, [dependency]);
```

Use for: API calls, subscriptions, logging, non-visual side effects.

### useLayoutEffect — Before Paint

```jsx
useLayoutEffect(() => {
  // runs BEFORE browser paints
  // DOM is updated but user hasn't seen it yet
  const rect = ref.current.getBoundingClientRect();
  setTooltipPosition(rect); // update position before user sees anything
}, []);
```

Use for: DOM measurements, preventing visual flicker, synchronizing with DOM.

### The Flicker Problem

```jsx
// useEffect — causes flicker ❌
useEffect(() => {
  ref.current.style.left = '100px'; // user briefly sees old position, then jump
}, []);

// useLayoutEffect — no flicker ✅
useLayoutEffect(() => {
  ref.current.style.left = '100px'; // position set before user sees anything
}, []);
```

### Comparison Table

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| Runs | After paint | Before paint |
| Blocks paint? | ❌ No | ✅ Yes |
| Risk | Flicker (if reading/writing DOM) | Blocks paint if slow |
| Use for | API calls, subscriptions | DOM measurements, position fixes |
| SSR safe? | ✅ Yes | ❌ No (no DOM on server) |

### Memorable Takeaway

> Default to `useEffect`. Switch to `useLayoutEffect` only when you need to read or write the DOM before the user sees it — to prevent visual flicker. Never use `useLayoutEffect` for heavy work — it blocks the paint.

---

## 5. Reconciliation & Diffing Algorithm

> React's diffing algorithm runs during the render phase to find the minimum set of DOM changes needed.

### The Problem Diffing Solves

Comparing two trees naively is O(n³). React's algorithm is O(n) by making two assumptions:

1. **Elements of different types produce different trees** — React tears down and rebuilds
2. **Keys tell React which list items are the same across renders**

### Rule 1 — Different Type = Full Rebuild

```jsx
// Old tree          // New tree
<div>               <span>
  <Child />    →      <Child />  // Child unmounts and remounts!
</div>              </span>
```

When root element type changes, React destroys the entire subtree and builds fresh.

### Rule 2 — Same Type = Update in Place

```jsx
// Old                    // New
<div className="old">  → <div className="new">  // only className updated
```

React keeps the DOM node, just updates changed attributes.

### Rule 3 — Keys for Lists

```jsx
// Without keys — React re-renders all items when order changes ❌
<li>Item A</li>
<li>Item B</li>

// With keys — React matches by key, only moves/updates what changed ✅
<li key="a">Item A</li>
<li key="b">Item B</li>
```

### Key Trap — Never use index as key for dynamic lists

```jsx
// WRONG — index as key causes bugs when list order changes
items.map((item, index) => <li key={index}>{item}</li>);

// CORRECT — use stable unique IDs
items.map(item => <li key={item.id}>{item.name}</li>);
```

Why index keys break: If you remove item at index 0, all subsequent items get new keys → React thinks they all changed → unnecessary re-renders + broken component state.

### Reconciliation Flow

```
Previous fiber tree  +  New JSX (from render)
              ↓
Fiber diffing — walks both trees simultaneously
              ↓
Tags each fiber with an effect:
  - Placement (new node)
  - Update (changed node)
  - Deletion (removed node)
              ↓
Commit phase applies effects to real DOM
```

### Memorable Takeaway

> React diffs top-down, one node at a time. Different type = full rebuild. Same type = update in place. Keys are how React tracks list items — always use stable unique IDs, never array index for dynamic lists.

---

## 6. Concurrent Mode vs Legacy Mode

> Concurrent mode makes rendering interruptible. Legacy mode is synchronous and blocking.

### Legacy Mode (React 17 and below)

```jsx
ReactDOM.render(<App />, document.getElementById('root'));
```

- Rendering is **synchronous and blocking**
- Once started, React must finish before browser can do anything else
- Large renders = frozen UI

### Concurrent Mode (React 18+)

```jsx
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

- Rendering is **interruptible**
- React can pause, resume, or discard renders
- Browser stays responsive even during heavy renders

### Key Concurrent Features

**1. `startTransition` — Mark updates as non-urgent:**

```jsx
import { startTransition } from 'react';

const handleInput = (value) => {
  setInputValue(value);  // urgent — update input immediately
  startTransition(() => {
    setSearchResults(filter(value)); // non-urgent — can be interrupted
  });
};
```

**2. `useDeferredValue` — Defer a value's update:**

```jsx
const deferredQuery = useDeferredValue(query);
// deferredQuery lags behind query — React prioritizes urgent updates first
```

**3. Suspense for data fetching:**

```jsx
<Suspense fallback={<Spinner />}>
  <DataComponent /> {/* React can suspend and show fallback */}
</Suspense>
```

### Comparison Table

| | Legacy Mode | Concurrent Mode |
|---|---|---|
| Rendering | Synchronous, blocking | Interruptible |
| API | `ReactDOM.render` | `ReactDOM.createRoot` |
| startTransition | ❌ | ✅ |
| Automatic batching | Partial | ✅ Everywhere |
| Suspense (data) | Limited | ✅ Full support |
| Strict Mode double-invoke | ❌ | ✅ |

### Memorable Takeaway

> Concurrent mode = React can pause rendering to keep UI responsive. The key tool is `startTransition` — mark non-urgent updates so React prioritizes user input first. `createRoot` opts you into concurrent mode.

---

## 7. React.memo — How it Works and When it Fails

> React.memo prevents re-renders by shallow-comparing props. It fails more often than developers expect.

### How it Works

```jsx
const Child = React.memo(function Child({ name, age }) {
  console.log('Child rendered');
  return <div>{name} — {age}</div>;
});

// Only re-renders if name or age actually changed (shallow compare)
```

React.memo wraps the component and checks: did any prop change? If no → skip render, reuse last output.

### Shallow Comparison — What it means

```js
// Primitives — compared by value ✅
"hello" === "hello" // same → no re-render
42 === 42           // same → no re-render

// Objects/Arrays — compared by reference ❌
{} === {}           // different reference → re-render!
[] === []           // different reference → re-render!
```

### When React.memo FAILS — 4 Common Cases

**Case 1 — Object/Array props created inline:**

```jsx
function Parent() {
  return <Child style={{ color: 'red' }} />; // new object every render!
}
const Child = React.memo(({ style }) => <div style={style} />);
// React.memo is useless here — style is always a new reference
```

**Fix:** `useMemo`
```jsx
const style = useMemo(() => ({ color: 'red' }), []);
```

**Case 2 — Function props created inline:**

```jsx
function Parent() {
  return <Child onClick={() => doSomething()} />; // new function every render!
}
```

**Fix:** `useCallback`
```jsx
const handleClick = useCallback(() => doSomething(), []);
```

**Case 3 — Context consumer — memo doesn't help:**

```jsx
const Child = React.memo(() => {
  const value = useContext(MyContext); // still re-renders when context changes!
  return <div>{value}</div>;
});
// React.memo only checks props — context changes bypass it entirely
```

**Case 4 — Children prop:**

```jsx
<Child>
  <span>hello</span> {/* new JSX object every render */}
</Child>
// children is a new reference every time → memo fails
```

### Custom Comparison Function

```jsx
const Child = React.memo(
  ({ user }) => <div>{user.name}</div>,
  (prevProps, nextProps) => {
    // return true = skip re-render (props "equal")
    // return false = do re-render (props "different")
    return prevProps.user.id === nextProps.user.id;
  }
);
```

### Memorable Takeaway

> `React.memo` uses shallow comparison — it fails for inline objects, inline functions, context, and children prop. Always pair with `useMemo` and `useCallback` for object/function props. It's a performance optimization — don't add it everywhere, only where re-renders are actually expensive.

---

## 8. Controlled vs Uncontrolled Components

> The difference is about who owns the source of truth — React state or the DOM.

### Controlled Component — React owns the value

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}           // React controls the value
      onChange={e => setValue(e.target.value)}
    />
  );
}
```

- Value lives in React state
- Every keystroke → `onChange` → `setState` → re-render → input updated
- React is always in sync with what's displayed

### Uncontrolled Component — DOM owns the value

```jsx
function UncontrolledInput() {
  const ref = useRef();

  const handleSubmit = () => {
    console.log(ref.current.value); // read from DOM directly
  };

  return <input ref={ref} defaultValue="initial" />;
}
```

- Value lives in the DOM
- React doesn't track it on every keystroke
- Read value only when needed (on submit)

### At the Fiber Level

**Controlled:** React sets `value` prop on every render → React's fiber tree is always the source of truth → DOM is a reflection of React state.

**Uncontrolled:** React sets `defaultValue` once on mount → after that, the DOM manages its own state → React's fiber doesn't track the current value.

### Comparison Table

| | Controlled | Uncontrolled |
|---|---|---|
| Source of truth | React state | DOM |
| Re-renders on input | ✅ Every keystroke | ❌ No |
| Access value | `state` variable | `ref.current.value` |
| Validation | Easy (on every change) | Only on read |
| Use case | Forms needing live validation, conditional UI | Simple forms, file inputs |

### The `value` vs `defaultValue` trap ⚠️

```jsx
// WRONG — value without onChange = read-only input, user can't type
<input value="hello" />

// CORRECT controlled
<input value={val} onChange={e => setVal(e.target.value)} />

// CORRECT uncontrolled
<input defaultValue="hello" />
```

### Memorable Takeaway

> Controlled = React state drives the input, re-renders on every keystroke, easy to validate. Uncontrolled = DOM drives itself, use `ref` to read value, fewer re-renders. File inputs are always uncontrolled.

---

## 9. useContext — Re-renders and Optimization

> useContext re-renders ALL consumers when context value changes — even if they only use part of the value.

### How useContext triggers re-renders

```jsx
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState('John');

  return (
    <ThemeContext.Provider value={{ theme, user }}>
      <Child />
    </ThemeContext.Provider>
  );
}

function Child() {
  const { theme } = useContext(ThemeContext); // only uses theme
  console.log('Child rendered');
  // BUT — re-renders when user changes too! ❌
  return <div>{theme}</div>;
}
```

React re-renders **all consumers** when the context value reference changes — even if the specific field they use didn't change.

### Why this happens

`value={{ theme, user }}` creates a **new object** on every parent render → new reference → all consumers re-render.

### Optimization 1 — Split contexts

```jsx
// Instead of one big context, split by concern
const ThemeContext = createContext();
const UserContext = createContext();

// Child only subscribes to what it needs
const { theme } = useContext(ThemeContext); // only re-renders on theme change
```

### Optimization 2 — Memoize the context value

```jsx
function App() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState('John');

  const value = useMemo(() => ({ theme, user }), [theme, user]);
  // stable reference — only changes when theme or user actually changes

  return (
    <ThemeContext.Provider value={value}>
      <Child />
    </ThemeContext.Provider>
  );
}
```

### Optimization 3 — React.memo doesn't help context consumers

```jsx
const Child = React.memo(() => {
  const { theme } = useContext(ThemeContext);
  return <div>{theme}</div>;
});
// memo only checks props — context bypasses memo entirely ❌
```

To prevent a context consumer from re-rendering, you must either split context or use a state management library (Zustand, Jotai) that supports selector-based subscriptions.

### Optimization 4 — Selector pattern with useRef

```jsx
// Advanced: manually bail out if the part you care about didn't change
function useThemeOnly() {
  const { theme } = useContext(ThemeContext);
  const ref = useRef(theme);
  if (ref.current !== theme) ref.current = theme;
  return ref.current;
}
```

### Memorable Takeaway

> `useContext` re-renders ALL consumers on ANY context value change. Split contexts by concern. Memoize the provider value with `useMemo`. `React.memo` does NOT protect against context re-renders.

---

## 10. ReactDOM.render vs ReactDOM.createRoot

> The API you use determines whether your app runs in legacy or concurrent mode.

### Legacy Mode — `ReactDOM.render`

```jsx
// React 16, 17, still works in 18 (with deprecation warning)
ReactDOM.render(<App />, document.getElementById('root'));
```

- Synchronous, blocking rendering
- No concurrent features
- Deprecated in React 18

### Concurrent Mode — `ReactDOM.createRoot`

```jsx
// React 18+ — the new standard
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

- Interruptible rendering
- Enables all concurrent features
- Automatic batching everywhere

### What changes with createRoot

```
createRoot unlocks:
✅ startTransition (interruptible updates)
✅ useDeferredValue
✅ Automatic batching in setTimeout, Promise, native events
✅ Full Suspense support for data fetching
✅ Strict Mode double-invocation of effects (dev only)
✅ useId for stable server/client IDs
```

### Strict Mode double-invoke — createRoot specific

In development with `createRoot`, React **intentionally renders components twice** to catch side effects:

```jsx
// In dev + StrictMode + createRoot:
// Component renders → effects run → effects cleanup → effects run again
// This surfaces impure components and non-idempotent effects
```

This does NOT happen in production.

### Hydration — createRoot equivalent

```jsx
// Old SSR hydration
ReactDOM.hydrate(<App />, container);

// New SSR hydration (concurrent)
ReactDOM.hydrateRoot(container, <App />);
```

`hydrateRoot` enables **selective hydration** — React can prioritize hydrating parts of the page the user is interacting with first.

### Comparison Table

| | `ReactDOM.render` | `ReactDOM.createRoot` |
|---|---|---|
| Mode | Legacy (synchronous) | Concurrent (interruptible) |
| React version | 16, 17, 18 (deprecated) | 18+ |
| Automatic batching | Partial | ✅ Everywhere |
| startTransition | ❌ | ✅ |
| Suspense (data) | Limited | ✅ |
| Strict Mode double-invoke | ❌ | ✅ (dev only) |

### Memorable Takeaway

> `createRoot` = concurrent mode = interruptible rendering + all React 18 features. `ReactDOM.render` = legacy mode = synchronous, deprecated. Always use `createRoot` for new React 18 apps.

---

## Quick Revision Cheat Sheet

- **Fiber** = pauseable unit of work (one per component); replaced Stack reconciler in React 16
- **Render phase** = memory only, interruptible; **Commit phase** = real DOM, cannot pause
- **Re-render triggers** = setState, prop change, context change, parent re-render
- **Subtree rule** = all children re-render when parent does, unless React.memo
- **Object.is()** = how React compares state; same reference = no re-render (mutation bug)
- **Batching** = React 18 batches everywhere; React 17 only inside event handlers
- **setState pipeline** = queue → batch → render phase → commit phase → paint → useEffect
- **useLayoutEffect** = before paint (DOM measurements); **useEffect** = after paint (side effects)
- **Diffing rules** = different type → full rebuild; same type → update in place; keys → list tracking
- **Never use index as key** for dynamic lists — causes bugs when order changes
- **Concurrent mode** = `createRoot` → interruptible renders, startTransition, auto-batching
- **React.memo** = shallow prop comparison; fails for inline objects/functions/context/children
- **useContext** = all consumers re-render on any value change; split contexts to optimize
- **React.memo doesn't protect** context consumers — must split context or use selectors
- **createRoot** = concurrent mode; `ReactDOM.render` = legacy, deprecated in React 18

---

## References

- [React Fiber Architecture — acdlite](https://github.com/acdlite/react-fiber-architecture)
- [React 18 — What's New](https://reactjs.org/blog/2022/03/29/react-v18.html)
- [React 17 — Event Delegation Changes](https://reactjs.org/blog/2020/10/20/react-v17.html)
- [MDN — Object.is()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
- [React Docs — useLayoutEffect](https://react.dev/reference/react/useLayoutEffect)
- [React Docs — startTransition](https://react.dev/reference/react/startTransition)
- [React Docs — createRoot](https://react.dev/reference/react-dom/client/createRoot)