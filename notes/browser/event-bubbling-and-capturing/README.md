# Event Delegation, Bubbling & Capturing — Complete Notes

> Covers the full browser event flow, delegation pattern, React's synthetic event system, and common interview traps.

---

## Key Concepts

### 1. The 3 Phases of Event Flow

Every DOM event travels through **3 phases**:

```
Capturing (top-down):
html → body → ul → li

Target Phase:
li  ← the element that was actually clicked

Bubbling (bottom-up):
li → ul → body → html
```

- **Capturing** — event travels from `document` down to the target
- **Target** — event is ON the clicked element
- **Bubbling** — event travels back up from target to `document` (default behavior)

---

### 2. Event Delegation

Attach **one listener on a parent** instead of individual listeners on each child. Works because of bubbling.

```js
const list = document.getElementById('list');

list.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('Clicked:', e.target.innerText);
  }
});
```

**Why it works:** When `<li>` is clicked, the event bubbles up to `<ul>` where the listener catches it.

**Benefits:**
- Better performance — one listener instead of N listeners
- Works for dynamically added elements automatically

---

### 3. `useCapture` flag — `true` vs `false`

```js
el.addEventListener('click', handler, false); // default — bubbling phase
el.addEventListener('click', handler, true);  // capturing phase
```

| Value | Phase | Direction |
|---|---|---|
| `false` (default) | Bubbling | Bottom → Up |
| `true` | Capturing | Top → Down |

---

### 4. Firing Order — All 4 Combinations

Given: `ul` (parent) and `li` (child, the clicked element)

| `ul` listener | `li` listener | Fires first |
|---|---|---|
| `true` (capture) | `true` (capture) | `ul` — higher in DOM |
| `false` (bubble) | `false` (bubble) | `li` — it's the target |
| `true` (capture) | `false` (bubble) | `ul` — capture beats bubble |
| `false` (bubble) | `true` (capture) | `li` — target phase fires before bubbling reaches parent |

> **Key Rule:** A listener only participates in the phase it registered for. If `ul` registered for bubbling (`false`), it sits out the entire capturing pass — even though the event travels through it.

---

### 5. `e.target` vs `e.currentTarget`

```js
ul.addEventListener('click', (e) => {
  console.log(e.target);        // <li> — element that was actually clicked
  console.log(e.currentTarget); // <ul> — element where listener is attached
});
```

| | Meaning | Changes as event travels? |
|---|---|---|
| `e.target` | The element clicked (origin) | ❌ Never changes |
| `e.currentTarget` | The element with the listener | ✅ Changes at each element |

**They are equal only when you click the exact element the listener is on.**

---

### 6. `stopPropagation` vs `stopImmediatePropagation`

```js
// stopPropagation — stops bubbling to parents
// but other listeners on the SAME element still fire
li.addEventListener('click', (e) => {
  e.stopPropagation();
  console.log('listener 1'); // fires
});
li.addEventListener('click', () => {
  console.log('listener 2'); // still fires!
});
// ul listener → SKIPPED

// stopImmediatePropagation — stops bubbling AND kills remaining listeners on same element
li.addEventListener('click', (e) => {
  e.stopImmediatePropagation();
  console.log('listener 1'); // fires
});
li.addEventListener('click', () => {
  console.log('listener 2'); // SKIPPED
});
// ul listener → SKIPPED
```

| | Stops bubbling to parent | Stops other listeners on same element |
|---|---|---|
| `stopPropagation` | ✅ | ❌ |
| `stopImmediatePropagation` | ✅ | ✅ |

**Real use case for `stopImmediatePropagation`:** Gate logic (e.g., user not logged in → block purchase AND analytics listeners on the same button).

---

## React — Synthetic Event System

### How React handles events internally

React does **NOT** attach listeners to individual elements. It uses **automatic event delegation** — one single listener at the root:

```
React 16 → attached to document
React 17+ → attached to #root (the root DOM container)
```

React wraps the native event in a **SyntheticEvent** object with the same API (`e.target`, `e.stopPropagation()`, `e.preventDefault()`).

```jsx
function Button() {
  const handleClick = (e) => {
    console.log(e);            // SyntheticEvent
    console.log(e.nativeEvent); // original native MouseEvent
  };
  return <button onClick={handleClick}>Click</button>;
}
```

---

### React 16 vs React 17+ — What changed

| | React 16 | React 17+ |
|---|---|---|
| Listener location | `document` | `#root` |
| Event pooling | ✅ (use `e.persist()`) | ❌ removed |
| `stopPropagation` | Partially broken | Works correctly |

**Why React 17 moved to `#root`:**
- Multiple React apps on same page no longer interfere
- `stopPropagation` now correctly prevents native `document` listeners from firing

---

### Event Pooling (React 16 only)

React reused SyntheticEvent objects for performance — after handler finished, all properties were nulled out.

```js
// React 16 — BROKEN
const handleClick = (e) => {
  setTimeout(() => console.log(e.target), 100); // null!
};

// Fix with e.persist()
const handleClick = (e) => {
  e.persist();
  setTimeout(() => console.log(e.target), 100); // works
};
```

React 17+ removed this entirely — `e.persist()` is now a no-op.

---

### Execution Order — React vs Native listeners

```jsx
useEffect(() => {
  document.addEventListener('click', () => console.log('native document'));
}, []);

<button onClick={() => console.log('react')}>Click</button>

// Output:
// react           ← fires first
// native document ← fires second
```

---

### Capturing in React

React exposes both phases as props:

```jsx
<ul onClick={handler}>          // bubbling (default)
<ul onClickCapture={handler}>   // capturing
```

| Vanilla JS | React |
|---|---|
| `addEventListener('click', fn, false)` | `onClick={fn}` |
| `addEventListener('click', fn, true)` | `onClickCapture={fn}` |

---

### Manual Event Delegation in React

You rarely need it (React delegates automatically), but you CAN do it:

```jsx
function List({ items }) {
  const handleClick = (e) => {
    if (e.target.tagName === 'LI') {
      console.log('clicked:', e.target.dataset.id);
    }
  };

  return (
    <ul onClick={handleClick}>
      {items.map(item => (
        <li key={item.id} data-id={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

**When to use manual delegation in React:** Extremely large lists (100k+ rows) where even creating onClick props has reconciliation overhead.

---

## Interview Traps & Tricky Questions

### Trap 1: "Does `stopPropagation` stop all listeners?"
**What they ask:** You call `e.stopPropagation()` — does the second listener on the same element still fire?
**Correct answer:** Yes. `stopPropagation` only stops the event from traveling to parent elements. Use `stopImmediatePropagation` to also kill sibling listeners on the same element.

---

### Trap 2: Firing order with mixed capture/bubble
**What they ask:** `ul` has `false` (bubble), `li` has `true` (capture) — which fires first when `li` is clicked?
**Correct answer:** `li` fires first — it's the target element, and its capturing listener fires in the target phase. `ul`'s bubbling listener fires after, on the way back up.

---

### Trap 3: `e.stopPropagation()` in React 16
**What they ask:** Does `stopPropagation` work correctly in React 16?
**Correct answer:** Not always. In React 16, React's listener was on `document` — by the time React processed the event, the native event had already reached `document`. So native `document` listeners would still fire even after `stopPropagation`. Fixed in React 17 by moving the listener to `#root`.

---

### Trap 4: `e.target` inside delegated listener
**What they ask:** You delegate a click from `ul` to handle `li` clicks. What does `e.target` and `e.currentTarget` give you?
**Correct answer:** `e.target` = the `<li>` that was clicked. `e.currentTarget` = the `<ul>` where the listener lives.

---

## Quick Revision Cheat Sheet

- **Capturing** = top-down (html → target), `useCapture: true`
- **Bubbling** = bottom-up (target → html), default behavior
- **Target phase** = event is ON the clicked element; firing order = registration order
- **Event Delegation** = one listener on parent, use `e.target` to identify child
- **`e.target`** = element clicked (never changes); **`e.currentTarget`** = element with listener (changes)
- **`stopPropagation`** = stops bubbling to parents only
- **`stopImmediatePropagation`** = stops bubbling + kills remaining listeners on same element
- **React** = auto-delegates to `#root` (React 17+), wraps events in SyntheticEvent
- **React 17** removed event pooling — no need for `e.persist()` anymore
- **`onClickCapture`** in React = capturing phase equivalent of `onClick`

---

## References

- [MDN — Event bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#event_bubbling)
- [MDN — addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)
- [React 17 — Changes to Event Delegation](https://reactjs.org/blog/2020/10/20/react-v17.html#changes-to-event-delegation)
- [MDN — stopPropagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)
- [MDN — stopImmediatePropagation](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopImmediatePropagation)