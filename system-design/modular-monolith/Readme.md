# Modular Monolith — System Design / Architecture

> Single deployable app with strict internal module boundaries. The sweet spot between monolith chaos and micro frontend complexity.

---


## In fact, some big companies are moving back to monolith (called Modular Monolith).

Why?

Micro frontends add too much complexity
Operational overhead is high — too many repos, pipelines, infra
Performance issues — multiple bundles, duplicate dependencies
Small-medium teams don't get enough benefit to justify the cost


Who moved back?

Shopify — moved away from micro frontends
Some teams at Amazon questioned the overhead

The real reason is — frontend is not the same as backend.
In backend microservices, each service has its own database, CPU, memory — isolation makes sense.
In frontend, everything runs in one browser — so splitting it causes:

Multiple bundles loading in same browser = performance hit
Duplicate React/libraries = bloat
Cross app communication = unnecessary complexity


The Irony
Micro frontends borrowed the microservices idea but browsers aren't servers — the constraints are completely different.

What big companies prefer now
Modular Monolith — single codebase but well structured modules with clear boundaries — gives team autonomy without the operational complexity.

Bottom line — Micro frontends solve a team scaling problem but create a browser performance problem. At large scale the tradeoff isn't always worth it.


## What Is It?

A **single codebase, single deployment** application — but internally divided into **well-defined, isolated business modules** with enforced boundaries.

Think of it as: **discipline applied to a monolith.**

---

## Why It Exists

### Problems with Normal Monolith
- All components dumped in one folder — no ownership
- Anyone imports anything from anywhere — **tightly coupled**
- Grows into a **big ball of mud** over time
- Hard to scale teams — merge conflicts, no clear ownership

### Problems with Micro Frontend
- Too much operational complexity
- Duplicate dependencies (React loaded multiple times)
- Performance overhead in browser
- Multiple repos, pipelines, infra to manage
- **Browser is not a server** — micro frontend tradeoffs don't always pay off

### Modular Monolith Sweet Spot
- Team autonomy **without** operational complexity
- Clean boundaries **without** independent deployments
- Easy to **migrate to micro frontend later** if needed

---

## Folder Structure

```
src/
  modules/
    cart/
      components/
      hooks/
      services/
      store/
        cartSlice.js
      index.js         ← PUBLIC API (gate)
    product/
      components/
      hooks/
      services/
      store/
        productSlice.js
      index.js
    search/
      index.js
    user/
      index.js
  shared/
    components/
      Accordion/
      Button/
      Modal/
    hooks/
    utils/
  store/
    index.js           ← combines all slices
```

---

## The Core Concept — index.js as Public API

`index.js` is the **gate/security guard** of every module.

Only what is exported from `index.js` is **public**. Everything else is **private**.

```js
// modules/cart/index.js
export { CartSummary } from './components/CartSummary'
export { useCart } from './hooks/useCart'
export { useCartCount } from './hooks/useCartCount'
// cartService.js is NOT exported — stays private
```

**Consuming from outside:**
```js
// ✅ Correct — uses public API
import { CartSummary, useCart } from '@cart'

// ❌ Wrong — reaches into internals
import { cartService } from '@cart/services/cartService'
import { cartHelper } from '@cart/utils/cartHelper'
```

**Analogy:** Module is a restaurant kitchen. Other modules are customers. They only see the **menu (index.js)** — they can't walk into the kitchen and grab ingredients directly.

---

## What Goes Where

| Type | Location |
|---|---|
| Generic reusable UI (Accordion, Button) | `shared/components/` |
| Business specific UI (CartSummaryCard) | `modules/cart/components/` |
| Common utility functions | `shared/utils/` |
| Module specific logic | Inside that module only |
| Cross-module shared hook | `shared/hooks/` — expose minimal API |

---

## State Management

One Redux store — but **each module owns its slice.**

```
store/
  index.js        ← combines all slices
modules/
  cart/
    store/
      cartSlice.js   ← owned by cart team
  product/
    store/
      productSlice.js
```

**Rule:** Other modules never access a slice directly. They use **exported hooks only.**

```js
// cart/index.js exports the hook
export { useCartCount } from './hooks/useCartCount'

// product module uses it via public API
import { useCartCount } from '@cart'   ✅

// product directly accessing cart's slice
import { cartSlice } from '@cart/store/cartSlice'  ❌ — boundary violation
```

---

## Hook Reuse — The Flag Anti-Pattern

**Wrong approach:**
```js
// One hook with flags — bad practice
useCart({ enableBulkDiscount: true, showGiftWrap: false })
```

Flags are a sign one hook is doing too many things — **flag driven development.**

**Correct approach — split by responsibility:**

```
shared/hooks/
  useCartBase.js       ← common logic

modules/cart/hooks/
  useCartExtended.js   ← extends base, adds cart-specific logic

modules/product/hooks/
  useCartCount.js      ← only what product needs
```

Each module takes **only what it needs** — no flags, no coupling.

---

## Enforcing Boundaries — Tooling

Folder structure alone is NOT enough. Boundaries must be **automated.**

### 1. ESLint Plugin — `eslint-plugin-boundaries`
Define which module can import from which. Violations = lint errors.

### 2. Barrel Files (index.js)
If it's not exported from `index.js` — it's private. Simple as that.

### 3. TypeScript Path Aliases
```json
// tsconfig.json
{
  "paths": {
    "@cart/*": ["src/modules/cart/*"],
    "@product/*": ["src/modules/product/*"],
    "@shared/*": ["src/shared/*"]
  }
}
```
Forces devs to use module paths — reaching inside feels wrong.

### 4. CI/CD Checks
Lint rules run in pipeline — **PR fails** if boundaries are violated.

---

## Modular Monolith vs Normal Next.js App

| | Normal Next.js | Modular Monolith |
|---|---|---|
| Structure | Loose, by type | Strict, by business domain |
| Coupling | High | Low |
| Boundaries | None | Enforced via tooling |
| Team ownership | Unclear | Clear per module |
| Scalability | Gets messy | Stays clean |
| Tech | Same | Same |

**Same technology — different discipline.**

---

## Modular Monolith vs Micro Frontend

| | Modular Monolith | Micro Frontend |
|---|---|---|
| Repo | Single | Multiple |
| Deployment | Single | Independent per app |
| Complexity | Low | High |
| Performance | Better (one bundle) | Overhead (multiple bundles) |
| Team autonomy | Medium | High |
| Operational overhead | Low | High |
| When to use | Most large apps | Truly independent teams at scale |

---

## Why Big Companies Moved Back From Micro Frontend

Frontend ≠ Backend. The browser is not a server.

- In backend microservices — each service has own DB, CPU, memory. Isolation makes sense.
- In frontend — everything runs in **one browser**:
  - Multiple bundles = performance hit
  - Duplicate React/libraries = bloat
  - Cross-app communication = unnecessary complexity

**Shopify, and others** found micro frontend overhead wasn't worth it.
**Modular Monolith** gave them team autonomy without the browser performance penalty.

---

## When To Use Modular Monolith

✅ Large codebase, multiple teams  
✅ Don't need independent deployments  
✅ Performance is a priority  
✅ Want to keep operational complexity low  
✅ Early/mid stage — can migrate to MFE later if needed  

❌ If teams truly need to deploy independently at different cadences → consider Micro Frontend  

---

## Quick Revision — Cheat Sheet

- Single app, single deployment — but **strict internal boundaries**
- Each module = own components, hooks, state slice
- `index.js` = public API — internals are private
- Shared UI → `shared/` — owned by platform/UI team
- State: one store, each module owns its slice, expose via hooks only
- Boundaries enforced via ESLint, barrel files, TS aliases, CI checks
- No flag-driven hooks — split by responsibility instead
- Same tech as normal Next.js — difference is **discipline**
- Modular monolith > Micro frontend for most large apps because browser ≠ server

---

## Interview Traps

### Trap 1: "Isn't this just a well-organised folder structure?"
**Correct answer:** No. Folder structure is just the start. Real modular monolith requires **enforced boundaries via tooling** — ESLint rules, barrel files, CI checks. Without enforcement, it collapses back into a big ball of mud.

### Trap 2: "How is this different from micro frontends?"
**Correct answer:** Single deployment vs independent deployments. Modular monolith trades independent deployment for lower complexity and better browser performance. Micro frontend wins only when teams truly need to ship independently.

### Trap 3: "What if two modules need the same state?"
**Correct answer:** The owning module exposes a hook via its `index.js`. The consuming module uses only that hook — never accesses the slice directly. Boundary is maintained even for shared state.

### Trap 4: "Why not just use one shared hooks folder for everything?"
**Correct answer:** Generic/reusable logic goes to `shared/`. Business-specific logic stays in its module. Mixing them couples modules together — defeats the purpose of boundaries.