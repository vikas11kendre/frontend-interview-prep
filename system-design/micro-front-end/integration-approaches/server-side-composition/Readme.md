# Server-Side Composition — Micro Frontend Architecture

> Server stitches HTML fragments from multiple team servers before sending to browser. Best fit for SEO-critical, content-heavy, public-facing apps like ecommerce.

---

## What Is It?

Instead of the browser assembling micro frontends, the **server fetches and stitches HTML fragments** from each team's server into one complete HTML response — before it reaches the browser.

---

## How It Works

```
Browser requests page
       ↓
Nginx / Edge Server receives request
       ↓
Fetches HTML fragments from each team's server in parallel
       ↓
Stitches them into one complete HTML page
       ↓
Sends complete HTML to browser
       ↓
Browser loads each team's CSS + JS and hydrates
```

---

## Two Approaches

### 1. SSI — Server Side Includes
Nginx fetches and injects fragments using special HTML comments.

```html
<!-- shell/index.html -->
<html>
  <body>
    <div class="header">
      <!--#include virtual="/header/fragment" -->
    </div>
    <div class="product">
      <!--#include virtual="/product/fragment?sku=t_porsche" -->
    </div>
    <div class="cart">
      <!--#include virtual="/cart/fragment" -->
    </div>
    <div class="recommendations">
      <!--#include virtual="/recommendations/fragment?sku=t_porsche" -->
    </div>
  </body>
</html>
```

Nginx replaces each `#include` with actual HTML from that team's server.

### Nginx Config
```nginx
ssi on;  # enable SSI

upstream team_blue {
  server team-blue:3001;
}
upstream team_green {
  server team-green:3002;
}
upstream team_red {
  server team-red:3003;
}

server {
  listen 3000;
  ssi on;

  location /cart {
    proxy_pass http://team_blue;
  }
  location /recommendations {
    proxy_pass http://team_green;
  }
  location / {
    proxy_pass http://team_red;  # shell/product team owns the page
  }
}
```

---

### 2. ESI — Edge Side Includes
Same concept but happens at **CDN level** (Cloudflare, Fastly, Akamai) — even closer to user.

```html
<esi:include src="/cart/fragment" />
<esi:include src="/recommendations/fragment?sku=t_porsche" />
```

Benefit — fragments cached and served at edge, extremely fast.

---

## Each Team Exposes a Fragment Endpoint

Each team runs their own server (Next.js / Express) and exposes an SSR endpoint.

```js
// team-blue/server.js (cart team)
import ReactDOMServer from 'react-dom/server';
import CartSummary from './components/CartSummary';

app.get('/cart/fragment', (req, res) => {
  const html = ReactDOMServer.renderToString(
    <CartSummary sku={req.query.sku} />
  );

  // fragment returns HTML + its own CSS + JS
  res.send(`
    <link rel="stylesheet" href="https://team-blue.com/cart.css" />
    <div id="cart-root">${html}</div>
    <script src="https://team-blue.com/cart.js"></script>
  `);
});
```

- **HTML** → server rendered markup (React SSR)
- **CSS** → team's own stylesheet
- **JS** → hydrates the React component on client

---

## State Management — No Shared Redux

There is **no shared Redux store** across teams. That would be coupling.

| Approach | When to Use |
|---|---|
| **URL / Query params** | Simple shareable state — `?sku=t_porsche&userId=123` |
| **localStorage / cookies** | Lightweight cross-team data — namespace it `blue:cart_count` |
| **Custom Events** | After JS hydration, real-time cross-team updates |
| **Backend API (most common)** | Each team fetches from their own API — backend is source of truth |

**Rule:** Shared state = coupling. Avoid it. Each team owns its own state.

---

## Communication After Hydration

Once JS loads in browser, teams communicate via **Custom Events** on `window`.

```js
// team-blue dispatches after cart update
window.dispatchEvent(new CustomEvent('blue:cart:updated', {
  detail: { count: 3 }
}));

// team-red listens
window.addEventListener('blue:cart:updated', (e) => {
  updateCartIcon(e.detail.count);
});
```

Always namespace events → `[team]:[feature]:[action]`

---

## vs Next.js SSR

| | Next.js SSR | Server-Side Composition |
|---|---|---|
| Teams | One team | Multiple independent teams |
| Servers | One server | One server per team |
| Who stitches HTML | Next.js | Nginx / Edge |
| Codebase | Shared | Independent per team |
| Deployment | One deploy | Independent deploys per team |
| Ownership | Shared | Clear per team |

**They are not alternatives — Next.js can be used inside SSC.**
Each team runs their own Next.js server → exposes fragment endpoint → Nginx stitches them.

---

## When to Use

| App Type | Fit | Reason |
|---|---|---|
| Ecommerce | ✅ Best fit | SEO critical, fast load, product pages |
| Content / News | ✅ Great | SEO, multiple team ownership |
| Marketing pages | ✅ Good | SEO, mostly static |
| ERP | ❌ Poor | No SEO, heavy interactivity, internal |
| Dashboards | ❌ Poor | Real-time, interactive, no SEO needed |
| Static sites | ❌ Not needed | No dynamic fragments, use CDN |
| SaaS apps | ⚠️ Partial | Public pages yes, app internals no |

**Simple rule:** Public facing + SEO critical → SSC. Internal + interactive → client-side MFE.

---

## Real Companies Using This

- **Zalando** — built open source **Tailor** library for SSC
- **IKEA** — server-side fragments per team
- **Otto** — one of earliest adopters, wrote about verticalised systems
- **Netflix** — edge-side composition for parts of platform

---

## Advantages

- Great SEO — browser gets complete HTML
- Fast initial load — no JS needed to assemble page
- Works even if JS is disabled
- Each team deploys independently

## Disadvantages

- **Slowest fragment = slowest page** — one slow team blocks everyone
- Complex cache invalidation
- Teams must expose server-rendered endpoints
- Less interactive than pure client-side
- No shared state — cross-team communication is indirect

---

## Skeleton Screens — Handling Slow Fragments

For slow/personalised fragments — skip SSI include, load async in browser.
Use **skeleton markup** as placeholder to avoid layout reflow.

```html
<!-- team-green exposes skeleton via SSR -->
<green-recos sku="t_porsche">
  <div class="skeleton">Loading...</div>  <!-- placeholder -->
</green-recos>
<!-- JS hydrates and replaces skeleton with real content -->
```

---

## Quick Revision — Cheat Sheet

- Server stitches HTML from multiple team servers before browser receives it
- SSI = Nginx level, ESI = CDN/Edge level
- Each team exposes a fragment endpoint — returns HTML + CSS + JS link
- React teams use `ReactDOMServer.renderToString()` for SSR fragments
- No shared Redux — backend API is source of truth
- Cross-team communication via URL params, localStorage, Custom Events
- Slowest fragment = slowest page — biggest downside
- Next.js SSR and SSC are not alternatives — they work together
- Best for ecommerce, content sites — not for dashboards or ERPs

---

## Interview Traps

### Trap 1: "Isn't this just Next.js SSR?"
**Correct answer:** No. Next.js SSR is one team rendering one app. SSC is multiple team servers — Nginx stitches their HTML together. You can use Next.js inside SSC — each team runs their own Next.js instance.

### Trap 2: "How do you share state between teams?"
**Correct answer:** You don't share frontend state — that's coupling. Backend API is source of truth. Teams share minimal state via URL params, localStorage with namespacing, or Custom Events after hydration.

### Trap 3: "What if one team's fragment is slow?"
**Correct answer:** Slowest fragment blocks the whole page. Solutions — cache aggressively, exclude slow fragments from SSI and load them async in browser, use skeleton screens as placeholders.

### Trap 4: "What's the difference between SSI and ESI?"
**Correct answer:** SSI happens at your Nginx server level. ESI happens at CDN/Edge level — closer to user, better caching, faster. ESI is preferred for high-traffic public sites.