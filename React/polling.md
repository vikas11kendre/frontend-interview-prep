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







“Difference between long polling and short polling?”

👉 Say:

“Short polling repeatedly requests data at fixed intervals, which can lead to unnecessary network calls. Long polling keeps the request open until the server has new data, reducing redundant requests and improving efficiency.”