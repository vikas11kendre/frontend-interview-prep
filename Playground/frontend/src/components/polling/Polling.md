# Polling & Long Polling — Real-Time Communication Patterns

> Understanding short polling and long polling — how they work, when to use them, production trade-offs, and why they still matter in interviews.

---

## Key Concepts

### Short Polling

Client sends repeated HTTP requests at fixed intervals (e.g., every 3 seconds) to check for new data. Server responds immediately — either with new data or "nothing new." Simple, wasteful, but dead easy to implement.

### Long Polling

Client sends a request, but the server **holds the connection open** until new data is available. Once data arrives, server responds and the connection closes. Client immediately reconnects and waits again. This eliminates empty responses but keeps the connection hanging.

---

## How It Works Under the Hood

### Short Polling Flow

```
Client → GET /data → Server: "nothing new" (200)
Client waits 3 seconds...
Client → GET /data → Server: "nothing new" (200)
Client waits 3 seconds...
Client → GET /data → Server: "here's new data!" (200)
Client waits 3 seconds...
(repeats forever)
```

- Every request = full HTTP handshake (TCP connection, headers, etc.)
- Server processes every request even when there's nothing to send
- Response is instant — server never holds the connection

### Long Polling Flow

```
Client → GET /long-poll → Server: (holds connection open... waiting...)
... 15 seconds later, new data arrives ...
Server → "here's new data!" (200) → connection closes
Client immediately → GET /long-poll → Server: (holds again...)
```

- Server stores the `res` object without responding
- When data arrives, server loops through stored clients and calls `res.json(data)`
- Client reconnects immediately after every response
- If no data arrives, connection eventually times out → client reconnects

---

## Why Use Each One?

### Short Polling — When It Makes Sense

- **Dashboard refresh** — stock prices, analytics that update every 30 seconds
- **Background sync** — checking for new notifications every minute
- **Simple status checks** — "is my file upload done yet?"
- Works when **slight delay is acceptable** and data changes infrequently

### Long Polling — When It Makes Sense

- **Chat applications** (before WebSocket/SSE era — Facebook Messenger used this)
- **Notification systems** — wait until there's actually something to notify
- **Collaborative editing** — Google Docs originally used long polling
- Works when you need **near real-time** without WebSocket infrastructure

---

## Production Use Cases

| Use Case | Short Polling | Long Polling |
|---|---|---|
| Email inbox check | ✅ Check every 30s | Overkill |
| Live chat | ❌ Too slow/wasteful | ✅ Good fit |
| Stock ticker (non-critical) | ✅ Every 5s is fine | ✅ Also works |
| Live sports scores | ❌ Wasteful | ✅ Better fit |
| CI/CD build status | ✅ Check every 10s | ✅ Also works |
| Multiplayer game state | ❌ Too slow | ❌ Still too slow (use WebSockets) |

---

## Drawbacks

### Short Polling Drawbacks

- **Wasted bandwidth** — most responses are "nothing new"
- **Unnecessary server load** — server handles thousands of empty requests
- **Delayed updates** — if interval is 5s, user might wait up to 5s for new data
- **Not scalable** — 10,000 users × 1 req/3s = 3,333 requests/second for nothing
- **Battery drain on mobile** — constant network activity kills battery

### Long Polling Drawbacks

- **Server holds open connections** — each waiting client = memory consumed (stored `res` objects)
- **Connection limits** — browsers limit concurrent connections per domain (~6). Long polling eats one of them permanently
- **Timeout management** — connections time out (30-60s). Need retry logic on both sides
- **Not truly real-time** — there's still a reconnection gap between responses
- **Load balancer issues** — sticky sessions needed. If request goes to Server A but data arrives at Server B, the client never gets it
- **Scaling complexity** — 10,000 held connections = 10,000 open sockets on your server

---

## Code — Short Polling

### Backend (Express)

```javascript
// routes/polling.js
const router = require('express').Router();

let latestData = null;

// Endpoint that client polls repeatedly
router.get("/short-poll", (req, res) => {
  if (latestData) {
    const data = latestData;
    latestData = null; // clear after sending
    return res.json({ hasData: true, data });
  }
  res.json({ hasData: false, data: null });
});

// Simulate new data arriving
router.get("/trigger", (req, res) => {
  latestData = { message: "New update!", time: new Date().toISOString() };
  res.send("Data queued for next poll");
});

module.exports = router;
```

### Frontend (React — Next.js Pages Router)

```jsx
import React, { useState, useEffect, useRef } from "react";

const ShortPolling = () => {
  const [messages, setMessages] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Poll every 3 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:4000/short-poll");
        const data = await res.json();
        if (data.hasData) {
          setMessages((prev) => [...prev, data.data]);
        }
      } catch (err) {
        console.error("Poll failed:", err);
      }
    }, 3000);

    // Cleanup on unmount — IMPORTANT!
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <h2>Short Polling</h2>
      {messages.map((msg, i) => (
        <p key={i}>{msg.message} — {msg.time}</p>
      ))}
    </div>
  );
};

export default ShortPolling;
```

---

## Code — Long Polling

### Backend (Express)

```javascript
// routes/polling.js (add to same file)

let clients = []; // holds waiting client responses

// Client connects and waits
router.get("/long-poll", (req, res) => {
  // Store the response object — DON'T respond yet
  clients.push(res);

  // Cleanup when client disconnects (closes tab, network drops)
  // Without this: dead res objects pile up → memory leak + crash when you try res.json() on them
  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });

  // Safety timeout — don't hold forever
  // Browsers timeout around 30-60s anyway
  setTimeout(() => {
    // Check if this client is still waiting
    if (clients.includes(res)) {
      clients = clients.filter((c) => c !== res);
      res.json({ hasData: false, data: null }); // send empty response
    }
  }, 30000); // 30 second timeout
});

// When new data arrives, respond to ALL waiting clients
router.get("/update", (req, res) => {
  const data = {
    message: "New Data!",
    time: new Date().toISOString(),
  };

  // Respond to every waiting client at once
  clients.forEach((client) => client.json({ hasData: true, data }));
  clients = []; // clear the list — they'll reconnect

  res.send(`Data sent to ${clients.length} waiting clients`);
});

module.exports = router;
```

### Frontend (React — Next.js Pages Router)

```jsx
import React, { useState, useEffect, useRef } from "react";

const LongPolling = () => {
  const [messages, setMessages] = useState([]);
  const isActive = useRef(true); // track if component is mounted

  const poll = async () => {
    while (isActive.current) {
      try {
        const res = await fetch("http://localhost:4000/long-poll");
        const data = await res.json();
        if (data.hasData) {
          setMessages((prev) => [...prev, data.data]);
        }
        // Immediately reconnect — no interval needed!
        // The "wait" happens on the server side, not here
      } catch (err) {
        console.error("Long poll failed:", err);
        // Wait before retrying on error (don't spam the server)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  useEffect(() => {
    poll();
    return () => {
      isActive.current = false; // stop polling on unmount
    };
  }, []);

  return (
    <div>
      <h2>Long Polling</h2>
      {messages.map((msg, i) => (
        <p key={i}>{msg.message} — {msg.time}</p>
      ))}
    </div>
  );
};

export default LongPolling;
```

---

## Interview Traps & Tricky Questions

### Trap 1: "Is long polling real-time?"
**What they ask:** "Does long polling give you real-time updates?"
**Why it's tricky:** It *feels* real-time but it's not — there's always a reconnection gap after each response. True real-time requires a persistent connection (SSE or WebSockets).
**Correct answer:** "Near real-time, not true real-time. There's latency during reconnection."

### Trap 2: "What happens to long-polling clients behind a load balancer?"
**What they ask:** "You have 3 servers behind a load balancer. Client connects to Server A. Data arrives at Server B. What happens?"
**Why it's tricky:** The client's held connection is on Server A, but Server A doesn't know about the new data.
**Correct answer:** You need either sticky sessions (same client always hits same server) or a pub/sub system (Redis) so all servers share events.

### Trap 3: "Why not just use setInterval with short polling?"
**What they ask:** "Why is long polling better than polling every second?"
**Why it's tricky:** If you poll every 1 second, it seems responsive enough. But you're still making empty requests.
**Correct answer:** Long polling is event-driven — zero wasted requests. The server only responds when there's actual data. With short polling at 1s interval, 99% of requests return nothing.

### Trap 4: "What's the connection limit problem?"
**What they ask:** "What happens if your app uses long polling AND needs to fetch other API data?"
**Why it's tricky:** Browsers allow only ~6 concurrent connections per domain. Long polling permanently occupies one.
**Correct answer:** You're left with only 5 connections for everything else. This is why HTTP/2 multiplexing and domain sharding were workarounds, and why SSE/WebSockets are preferred.

---

## Common Mistakes Senior Devs Still Make

- **No cleanup on disconnect** — forgetting `req.on("close")` causes memory leaks and crashes when calling `res.json()` on dead connections
- **No timeout on long poll** — server holds connections forever, eventually runs out of sockets
- **Using `setInterval` for long polling** — long polling uses recursive calls after each response, NOT intervals. Using intervals defeats the purpose
- **Not handling component unmount** — polling continues after navigation, causing state updates on unmounted components
- **Sending the bug with `clients.length`** — in the update route, logging `clients.length` AFTER clearing gives 0. Log before clearing

---

## Key Differences & Comparisons

| Feature | Short Polling | Long Polling |
|---|---|---|
| Connection | New connection every interval | New connection after each response |
| Server response | Immediate (data or empty) | Delayed until data exists |
| Wasted requests | Many (most return empty) | None (only responds with data) |
| Complexity | Very simple | Moderate (client management, timeouts) |
| Latency | Up to interval duration | Near instant (just reconnection time) |
| Server memory | Low | Higher (holds open connections) |
| Scalability | Bad (too many requests) | Better but limited (open connections) |
| Browser support | Universal | Universal |
| Use case | Dashboards, status checks | Chat, notifications |

---

## Quick Revision (Cheat Sheet)

- **Short polling** = `setInterval` + `fetch`. Simple but wasteful. Most responses are empty.
- **Long polling** = client sends request, server holds it open until data exists. Near real-time.
- Server stores `res` objects in an array, responds later from a different trigger.
- Always clean up dead connections with `req.on("close")` — prevents memory leaks and crashes.
- Always set a server-side timeout (30s) so connections don't hang forever.
- Browsers limit ~6 concurrent connections per domain — long polling uses one permanently.
- Long polling uses recursive calls (`poll().then(() => poll())`), NOT `setInterval`.
- Load balancers break long polling without sticky sessions or Redis pub/sub.
- Neither is truly real-time — SSE and WebSockets solve that.

---

## References

- [MDN: HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [MDN: Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [Polling vs SSE vs WebSocket (article)](https://ably.com/topic/long-polling)