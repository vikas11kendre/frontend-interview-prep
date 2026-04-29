# Rendering Patterns — SSR, CSR, SSG, ISR, RSC & Hydration

> Covers all React/Next.js rendering strategies, hydration internals, React Server Components, and when to use what. Critical for FAANG and senior frontend interviews.

---

## Table of Contents

1. [CSR — Client Side Rendering](#1-csr--client-side-rendering)
2. [SSR — Server Side Rendering](#2-ssr--server-side-rendering)
3. [SSG — Static Site Generation](#3-ssg--static-site-generation)
4. [ISR — Incremental Static Regeneration](#4-isr--incremental-static-regeneration)
5. [Hydration — Deep Dive](#5-hydration--deep-dive)
6. [Hydration Mismatch](#6-hydration-mismatch)
7. [Selective Hydration (React 18)](#7-selective-hydration-react-18)
8. [Streaming SSR (React 18)](#8-streaming-ssr-react-18)
9. [React Server Components (RSC)](#9-react-server-components-rsc)
10. [RSC in Next.js App Router](#10-rsc-in-nextjs-app-router)
11. [Comparison Table — All Strategies](#11-comparison-table--all-strategies)
12. [Interview Traps](#12-interview-traps)
13. [Quick Revision Cheat Sheet](#13-quick-revision-cheat-sheet)

---

## 1. CSR — Client Side Rendering

> Browser downloads a mostly empty HTML shell, then JavaScript runs and builds the entire UI on the client.

### How it works

```
Browser requests page
      ↓
Server sends empty HTML + JS bundle link
      ↓
Browser downloads JS bundle (can be large)
      ↓
React runs on client — builds entire UI
      ↓
User sees content (late — after JS loads and runs)
```

### What the server sends

```html
<!-- Bare HTML shell — no real content -->
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div> <!-- empty! -->
    <script src="/bundle.js"></script>
  </body>
</html>
```

### Code example (Create React App / Vite)

```jsx
// main.tsx
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

// App fetches data on client
function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(setPosts);
  }, []);

  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

### Pros & Cons

```
✅ Simple to build and deploy (static hosting — S3, Netlify, Vercel)
✅ Fast subsequent navigation (SPA — no full page reloads)
✅ Rich interactivity — full React features

❌ Slow initial load — user sees blank page until JS loads
❌ Bad SEO — crawlers see empty HTML
❌ Large bundle size hurts performance on slow networks
❌ No sensitive data protection — all code ships to client
```

### When to use

- Internal dashboards, admin panels (SEO doesn't matter)
- Highly interactive apps (real-time, games, editors)
- Apps behind authentication

---

## 2. SSR — Server Side Rendering

> Server runs React on every request, generates full HTML, sends it to the browser. React then hydrates on the client.

### How it works

```
Browser requests page
      ↓
Server runs React components
      ↓
Server generates full HTML string with data
      ↓
Browser receives full HTML → user sees content immediately
      ↓
Browser downloads JS bundle
      ↓
React hydrates — attaches event listeners
      ↓
Page becomes interactive
```

### Next.js Pages Router — SSR example

```jsx
// pages/posts.tsx
export async function getServerSideProps(context) {
  // runs on server on EVERY request
  const posts = await db.getPosts();
  return { props: { posts } };
}

export default function PostsPage({ posts }) {
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Next.js App Router — SSR (Server Component)

```jsx
// app/posts/page.tsx — Server Component, runs on every request by default
export default async function PostsPage() {
  const posts = await db.getPosts(); // direct DB access
  return (
    <ul>
      {posts.map(post => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

### The TTFB vs TTI gap problem

```
Timeline:
t=0ms   → Request sent
t=200ms → Server responds with HTML (TTFB — Time To First Byte)
t=200ms → User sees content (fast! ✅)
t=200ms → Browser starts downloading JS bundle
t=1500ms → JS bundle downloaded
t=1800ms → React hydrates
t=1800ms → Page interactive (TTI — Time To Interactive)

Gap between t=200ms and t=1800ms:
User sees the page but CANNOT interact with it
Clicks, scrolls don't work → frustrating UX ⚠️
```

### Pros & Cons

```
✅ Fast First Contentful Paint (FCP) — user sees content immediately
✅ Great SEO — full HTML sent to crawlers
✅ Fresh data on every request
✅ Sensitive data stays on server

❌ Slow TTFB for complex pages (server must finish before sending anything)
❌ Higher server load — runs on every request
❌ Hydration gap — page visible but not interactive
❌ Can't cache aggressively (data changes per request)
```

### When to use

- Pages with frequently changing data (news feed, stock prices, user dashboard)
- Pages that need auth-based personalization
- SEO-critical pages with dynamic data

---

## 3. SSG — Static Site Generation

> React runs at **build time** (not request time). Generates static HTML files. Served instantly from CDN.

### How it works

```
BUILD TIME (once):
Next.js runs React components
      ↓
Generates static HTML files for every page
      ↓
Files deployed to CDN

REQUEST TIME (every user):
Browser requests page
      ↓
CDN serves pre-built HTML instantly (no server computation)
      ↓
Browser downloads JS bundle
      ↓
React hydrates
```

### Next.js Pages Router — SSG example

```jsx
// pages/posts/[id].tsx

// Runs at build time — tells Next.js which pages to generate
export async function getStaticPaths() {
  const posts = await db.getAllPosts();
  return {
    paths: posts.map(p => ({ params: { id: p.id } })),
    fallback: false, // 404 for unknown paths
  };
}

// Runs at build time for each path
export async function getStaticProps({ params }) {
  const post = await db.getPost(params.id);
  return { props: { post } };
}

export default function PostPage({ post }) {
  return <article>{post.content}</article>;
}
```

### Next.js App Router — SSG

```jsx
// app/posts/[id]/page.tsx
// generateStaticParams = getStaticPaths equivalent
export async function generateStaticParams() {
  const posts = await db.getAllPosts();
  return posts.map(p => ({ id: p.id }));
}

export default async function PostPage({ params }) {
  const post = await db.getPost(params.id);
  return <article>{post.content}</article>;
}
```

### Pros & Cons

```
✅ Fastest possible load time (pre-built HTML from CDN)
✅ Zero server load at runtime
✅ Perfect SEO
✅ Infinitely scalable (static files)

❌ Data is stale — only updated on rebuild
❌ Long build times for thousands of pages
❌ Not suitable for personalized or real-time data
❌ Need to rebuild to update content
```

### When to use

- Marketing pages, landing pages
- Blog posts, documentation
- Product pages that rarely change
- Any page where data doesn't change per user or per minute

---

## 4. ISR — Incremental Static Regeneration

> SSG but with automatic background regeneration after a set time. Best of SSG + SSR.

### How it works

```
BUILD TIME:
Generate static HTML (like SSG)

REQUEST TIME:
t=0s   → User requests page
t=0s   → CDN serves cached static HTML instantly ✅
t=0s   → If page is older than revalidate time → trigger background rebuild

BACKGROUND:
Server regenerates page with fresh data
New HTML replaces old cached version
Next user gets fresh HTML
```

### Next.js Pages Router — ISR

```jsx
// pages/posts/[id].tsx
export async function getStaticProps({ params }) {
  const post = await db.getPost(params.id);
  return {
    props: { post },
    revalidate: 60, // regenerate at most every 60 seconds
  };
}
```

### Next.js App Router — ISR

```jsx
// app/posts/[id]/page.tsx
// Option 1 — time-based revalidation
export const revalidate = 60; // revalidate every 60 seconds

export default async function PostPage({ params }) {
  const post = await db.getPost(params.id);
  return <article>{post.content}</article>;
}

// Option 2 — on-demand revalidation (revalidatePath / revalidateTag)
// app/actions.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function updatePost(id, data) {
  await db.updatePost(id, data);
  revalidatePath(`/posts/${id}`); // immediately invalidate cache
}
```

### Stale-While-Revalidate pattern

```
Request 1 (t=0s):    serve cached HTML (instant) → trigger background rebuild
Request 2 (t=1s):    still cached (rebuild in progress)
Request 3 (t=5s):    NEW HTML served (rebuild complete)

User always gets a response instantly — data might be slightly stale
```

### Pros & Cons

```
✅ Fast as SSG (CDN-cached)
✅ Data stays fresh (auto-regeneration)
✅ No rebuild required for content updates
✅ Scales infinitely

❌ Data can be stale by up to revalidate seconds
❌ First user after revalidation still gets stale data
❌ More complex caching logic
```

### When to use

- E-commerce product pages (price/stock updates every few minutes)
- News articles (update periodically, not per-request)
- Any page where "close enough" freshness is acceptable

---

## 5. Hydration — Deep Dive

> Hydration is the process where React takes over server-rendered HTML and makes it interactive by attaching event listeners and syncing React state.

### Why hydration is needed

Server sends pure HTML — no JavaScript interactivity. The browser can display it, but:
- `onClick` doesn't work
- `useState` doesn't exist
- React component tree doesn't exist in memory

Hydration fixes this by **re-creating the React component tree on the client** and **attaching it to the existing DOM nodes**.

### What hydration does step by step

```
1. Browser receives HTML from server:
   <button data-reactroot="">Click me (0)</button>

2. React JS bundle downloads and runs

3. React calls ReactDOM.hydrateRoot():
   → React renders the component tree in MEMORY (virtual DOM)
   → React walks the server HTML and virtual DOM simultaneously
   → For each node: "does this match?" → YES → attach, don't recreate
   → Attaches event listeners to existing DOM nodes
   → Initializes useState, useReducer, refs

4. Page is now interactive ✅
```

### Code — hydrateRoot

```jsx
// Old way (React 17)
ReactDOM.hydrate(<App />, document.getElementById('root'));

// New way (React 18)
ReactDOM.hydrateRoot(document.getElementById('root'), <App />);
```

### The key insight — hydration reuses DOM nodes

```
Server HTML:           <div class="card"><h1>Hello</h1></div>
React virtual DOM:     <div className="card"><h1>Hello</h1></div>

React says: "These match — I'll attach to the existing DOM node"
→ NO new DOM nodes created
→ Just event listeners attached + React internals initialized

If they DON'T match → hydration mismatch error ⚠️
```

### Hydration is expensive — the real cost

```
Hydration must:
1. Download entire JS bundle
2. Parse and execute JS
3. Re-render entire component tree in memory
4. Walk entire DOM and match with virtual DOM
5. Attach event listeners to every interactive element

For large apps → hydration can take 3-10 seconds on slow devices
User sees the page but can't interact → "uncanny valley" UX
```

---

## 6. Hydration Mismatch

> When server-rendered HTML doesn't match what React renders on the client — causes errors and forces full re-render.

### What causes mismatches

```jsx
// 1. Using browser-only APIs in render
function Component() {
  return <div>{window.innerWidth}px wide</div>; // different on server (no window)
}

// 2. Random values
function Component() {
  return <div>{Math.random()}</div>; // different on server vs client
}

// 3. Date/time
function Component() {
  return <div>{new Date().toLocaleString()}</div>; // different timestamps
}

// 4. localStorage / sessionStorage
function Component() {
  return <div>{localStorage.getItem('theme')}</div>; // doesn't exist on server
}
```

### What happens on mismatch

```
React 17:
→ Silently discards server HTML
→ Re-renders entire tree from scratch on client
→ Expensive + causes visual flash

React 18:
→ Throws hydration error in development
→ Attempts to recover by re-rendering mismatched subtree
→ Console warning: "Text content does not match server-rendered HTML"
```

### Fixes

```jsx
// Fix 1 — useEffect for browser-only values (runs only on client)
function Component() {
  const [width, setWidth] = useState(0); // safe default for server

  useEffect(() => {
    setWidth(window.innerWidth); // runs only on client
  }, []);

  return <div>{width}px wide</div>;
}

// Fix 2 — suppressHydrationWarning for intentional mismatches
function Component() {
  return (
    <div suppressHydrationWarning>
      {new Date().toLocaleString()} {/* mismatch suppressed */}
    </div>
  );
}

// Fix 3 — dynamic import with ssr: false (Next.js)
import dynamic from 'next/dynamic';

const BrowserOnlyChart = dynamic(() => import('./Chart'), {
  ssr: false, // never render on server
});
```

---

## 7. Selective Hydration (React 18)

> React 18 can hydrate parts of the page independently and prioritize hydrating what the user is interacting with first.

### The old problem — all or nothing hydration

```
React 17:
→ Entire page must be hydrated before ANY part is interactive
→ Heavy component blocks entire page hydration
→ User clicks button → nothing happens (hydration not done)
```

### React 18 solution — Suspense + selective hydration

```jsx
// Wrap sections in Suspense to enable selective hydration
export default function Page() {
  return (
    <Layout>
      <NavBar />           {/* hydrates immediately */}

      <Suspense fallback={<Spinner />}>
        <HeavyComponent /> {/* hydrates independently, doesn't block NavBar */}
      </Suspense>

      <Suspense fallback={<Spinner />}>
        <AnotherHeavy />   {/* hydrates independently */}
      </Suspense>
    </Layout>
  );
}
```

### Priority hydration — React responds to user interaction

```
User clicks on <AnotherHeavy> while it's still hydrating
      ↓
React detects click event
      ↓
React prioritizes hydrating <AnotherHeavy> FIRST
      ↓
Click event fires correctly
      ↓
React continues hydrating <HeavyComponent>
```

React records the click and replays it once hydration is complete — user never notices.

---

## 8. Streaming SSR (React 18)

> Server sends HTML in chunks as components resolve — browser can display and hydrate parts of the page before the entire page is ready.

### Old SSR — waterfall problem

```
React 17 SSR:
1. Wait for ALL data fetching to complete
2. Render entire page to HTML string
3. Send entire HTML at once
4. Browser waits for entire HTML before showing anything

If one slow API takes 3s → entire page delayed by 3s ❌
```

### Streaming SSR — send chunks as ready

```
React 18 Streaming:
1. Send HTML shell immediately (fast)
2. Stream in sections as their data resolves
3. Browser renders and hydrates each chunk independently

Slow API takes 3s → rest of page loads in 200ms, slow section streams in when ready ✅
```

### Code example — Next.js App Router with Suspense

```jsx
// app/page.tsx
import { Suspense } from 'react';

export default function Page() {
  return (
    <div>
      {/* Sent immediately — no data needed */}
      <Header />
      <Hero />

      {/* Streamed in when data resolves */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />   {/* fetches data, streams when ready */}
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations /> {/* independent — doesn't wait for Posts */}
      </Suspense>
    </div>
  );
}

// Posts fetches its own data
async function Posts() {
  const posts = await db.getPosts(); // slow query — 2s
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

### What the browser receives over time

```
t=0ms:   <Header /><Hero /><div id="posts-fallback">Loading...</div>
t=500ms: <Recommendations data... />  (fast query done)
t=2000ms: <Posts data... />           (slow query done)
```

User sees content progressively — no blank screen waiting for everything.

---

## 9. React Server Components (RSC)

> Components that run ONLY on the server, never sent to the client. Zero bundle impact. Can directly access databases and file systems.

### RSC vs SSR — the critical difference

```
SSR:
→ Components run on server (generate HTML)
→ Same components run AGAIN on client (hydration)
→ Component code IS in the JS bundle
→ Two runs per component

RSC:
→ Server Components run ONLY on server
→ Never run on client
→ Component code is NOT in the JS bundle
→ One run, server only
```

### What Server Components can and cannot do

```
Server Components CAN:
✅ async/await at component level (direct DB/API access)
✅ import heavy libraries (never sent to client)
✅ access environment variables, secrets
✅ read file system
✅ reduce JS bundle size

Server Components CANNOT:
❌ useState, useReducer (no state)
❌ useEffect, useLayoutEffect (no lifecycle)
❌ onClick, onChange (no event handlers)
❌ useContext (no context)
❌ browser APIs (window, document, localStorage)
```

### Server Component — direct DB access

```jsx
// app/posts/page.tsx — Server Component (default in App Router)
export default async function PostsPage() {
  // No API route needed — direct DB access
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
```

### Client Component — interactivity

```jsx
// app/components/LikeButton.tsx
'use client'; // ← makes this a Client Component

import { useState } from 'react';

export default function LikeButton({ initialLikes, postId }) {
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = async () => {
    setLikes(l => l + 1);
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
  };

  return <button onClick={handleLike}>❤️ {likes}</button>;
}
```

### Golden pattern — Server fetches, Client interacts

```jsx
// app/posts/[id]/page.tsx — Server Component
import LikeButton from '@/components/LikeButton'; // Client Component

export default async function PostPage({ params }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* Pass server data as props to Client Component */}
      <LikeButton initialLikes={post.likes} postId={post.id} />
    </article>
  );
}
```

### React Flight — the wire format

When Server Components render, React sends a special serialized format (not HTML):

```
// React Flight format (simplified)
J0:["$","article",null,{"children":[
  ["$","h1",null,{"children":"My Post Title"}],
  ["$","p",null,{"children":"Post content..."}],
  ["$","LikeButton",null,{"initialLikes":42,"postId":"123"}]
]}]
```

Client React runtime understands this and merges with Client Components.

### Bundle size win

```jsx
// Without RSC — ships to client
import { marked } from 'marked';        // 100kb
import hljs from 'highlight.js';        // 200kb
import sanitizeHtml from 'sanitize-html'; // 50kb

// Total bundle impact: 350kb

// With RSC — stays on server, ZERO bundle impact
async function BlogPost({ slug }) {
  const post = await db.getPost(slug);
  const html = marked(post.content);  // runs on server only
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
// Client receives just the HTML output — 0kb of these libraries shipped ✅
```

---

## 10. RSC in Next.js App Router

> Next.js 13+ App Router is built around RSC. Everything is Server Component by default.

### Directive rules

```jsx
// No directive = Server Component (default)
export default async function Page() { ... }

// 'use client' = Client Component
'use client';
export default function InteractiveWidget() { ... }

// 'use server' = Server Action (function that runs on server, called from client)
'use server';
export async function savePost(data) { ... }
```

### Client boundary — how it propagates

```jsx
// ClientParent.tsx
'use client';
import Child from './Child';       // Child becomes Client too (no 'use client' needed)
import GrandChild from './GrandChild'; // also Client

// The 'use client' boundary makes entire subtree Client Components
```

### Passing Server Components as children to Client Components ✅

```jsx
// This pattern works — Server Component passed as children prop
// app/page.tsx (Server Component)
import ClientWrapper from './ClientWrapper';
import ServerContent from './ServerContent';

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent /> {/* Server Component passed as children ✅ */}
    </ClientWrapper>
  );
}

// ClientWrapper.tsx
'use client';
export default function ClientWrapper({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}>Toggle</button>
      {open && children} {/* children rendered by server, controlled by client */}
    </div>
  );
}
```

### Server Actions — mutating data from Client

```jsx
// app/actions/posts.ts
'use server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  await prisma.post.create({ data: { title } });
  revalidatePath('/posts'); // invalidate cache
}

// app/components/CreatePostForm.tsx
'use client';
import { createPost } from '@/app/actions/posts';

export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

### Caching in App Router

```jsx
// Default — cached (SSG behavior)
async function Page() {
  const data = await fetch('https://api.example.com/data');
}

// No cache — SSR behavior (fresh on every request)
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store'
  });
}

// ISR behavior — revalidate every N seconds
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }
  });
}
```

---

## 11. Comparison Table — All Strategies

| Strategy | Renders On | When | Data Freshness | SEO | Interactive | Use Case |
|---|---|---|---|---|---|---|
| **CSR** | Client | On load | Real-time | ❌ | ✅ Immediately | Dashboards, SPAs |
| **SSR** | Server + Client | Every request | Always fresh | ✅ | ✅ After hydration | News, user feeds |
| **SSG** | Server | Build time | Stale until rebuild | ✅ | ✅ After hydration | Blogs, docs |
| **ISR** | Server | Build + background | Fresh within revalidate window | ✅ | ✅ After hydration | E-commerce, content sites |
| **RSC** | Server only | Request (no client run) | Fresh (no cache by default) | ✅ | ❌ (needs Client Component) | Data-heavy pages |
| **Streaming SSR** | Server + Client | Per request (progressive) | Always fresh | ✅ | ✅ Progressive | Pages with slow data |

---

## 12. Interview Traps

### Trap 1 — "RSC and SSR are the same thing"
**What they ask:** What's the difference between RSC and SSR?
**Why it's tricky:** Both run on the server — easy to confuse.
**Correct answer:** SSR renders components on server AND client (hydration). RSC runs only on server, never on client, never in JS bundle. SSR reduces time-to-first-paint. RSC reduces bundle size and enables direct server data access.

---

### Trap 2 — "Hydration just attaches event listeners"
**What they ask:** What exactly happens during hydration?
**Why it's tricky:** Most people oversimplify it.
**Correct answer:** Hydration re-renders the entire component tree in memory, walks the server HTML simultaneously, matches nodes, attaches event listeners, initializes state (useState, useReducer), and sets up refs. It reuses existing DOM nodes rather than recreating them.

---

### Trap 3 — "ISR always serves fresh data"
**What they ask:** Does ISR guarantee fresh data?
**Why it's tricky:** ISR sounds like SSR but it's not.
**Correct answer:** No. ISR uses stale-while-revalidate. The first user after the revalidate window still gets stale data — background regeneration happens after their request. The NEXT user gets fresh data. On-demand revalidation (`revalidatePath`) can force immediate invalidation.

---

### Trap 4 — "React.memo protects against RSC re-renders"
**What they ask:** Can you use React.memo on a Server Component?
**Correct answer:** No. `React.memo` is a client-side optimization. Server Components don't re-render on client — they don't exist there. React.memo is irrelevant for Server Components.

---

### Trap 5 — "You can import Server Components into Client Components"
**What they ask:** Can a Client Component import a Server Component?
**Correct answer:** No. A Client Component cannot directly import a Server Component — it would pull server code into the client bundle. The workaround is to pass Server Components as `children` or props to Client Components.

---

### Trap 6 — "SSG means no server"
**What they ask:** Does SSG require a server?
**Correct answer:** SSG requires a server at BUILD time (to run React and generate HTML). At REQUEST time, static files are served from CDN — no server needed. ISR requires a server at request time for background regeneration.

---

### Trap 7 — "useEffect fixes all hydration mismatches"
**What they ask:** How do you fix a hydration mismatch?
**Correct answer:** Depends on the cause. For browser-only values (window, localStorage), use `useEffect` with a safe default. For intentional mismatches (timestamps), use `suppressHydrationWarning`. For components that should never SSR, use `dynamic(() => import(...), { ssr: false })` in Next.js.

---

## 13. Quick Revision Cheat Sheet

- **CSR** = empty HTML + JS builds UI on client. Fast nav, bad SEO, slow initial load.
- **SSR** = server generates HTML per request. Fast first paint, SEO ✅, hydration gap.
- **SSG** = HTML generated at build time. Fastest load (CDN), stale until rebuild.
- **ISR** = SSG + background regeneration. Fast + fresh. Stale-while-revalidate pattern.
- **Hydration** = React re-renders tree in memory, matches server HTML, attaches events. Reuses DOM nodes.
- **Hydration mismatch** = server HTML ≠ client render. Causes re-render or error. Fix: useEffect, suppressHydrationWarning, or ssr:false.
- **Selective hydration** (React 18) = Suspense boundaries hydrate independently. React prioritizes what user clicks first.
- **Streaming SSR** (React 18) = HTML sent in chunks via Suspense. No waiting for slowest data.
- **RSC** = runs ONLY on server. No hooks, no events. Direct DB access. Zero bundle impact.
- **`'use client'`** = opt into Client Component. Creates client boundary for entire subtree.
- **`'use server'`** = marks Server Actions — functions called from client, run on server.
- **Golden RSC pattern** = Server Component fetches data → passes as props → Client Component handles interaction.
- **Cannot import** Server Component inside Client Component — pass as `children` instead.
- **App Router caching**: no option = SSG, `cache: 'no-store'` = SSR, `next: { revalidate: N }` = ISR.

---

## References

- [Next.js Docs — Rendering Strategies](https://nextjs.org/docs/app/building-your-application/rendering)
- [React Docs — Server Components](https://react.dev/reference/rsc/server-components)
- [React 18 — Selective Hydration](https://github.com/reactwg/react-18/discussions/37)
- [React 18 — Streaming SSR](https://github.com/reactwg/react-18/discussions/37)
- [Next.js Docs — Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Docs — Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)