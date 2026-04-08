# Server-Sent Events (SSE) — Real-Time Server → Client Streaming

> One-way persistent connection where the server pushes data to the client. The browser-native solution for real-time streaming — used by LLM APIs, live dashboards, and notification systems.

---

## Key Concepts

### What is SSE?

Client opens a connection once, server sends as many messages as it wants **without closing it**. Unlike long polling (one response per connection), SSE keeps the pipe open and pushes multiple messages through it. The browser handles reconnection automatically if the connection drops.

### How It's Different from Polling

| Feature | Short Polling | Long Polling | SSE |
|---|---|---|---|
| Connection | New every interval | New after each response | Single persistent connection |
| Direction | Client → Server → Client | Client → Server → Client | Server → Client only |
| Messages per connection | 1 | 1 | Unlimited |
| Reconnection | Manual (setInterval) | Manual (recursive fetch) | Automatic (browser handles it) |
| Browser API | fetch | fetch | EventSource (native) |

---

## How It Works Under the Hood

### Flow

```
Client → new EventSource("/sse") → connection opens
Server → sets Content-Type: text/event-stream
Server → res.write("data: message 1\n\n")  → client receives instantly
Server → res.write("data: message 2\n\n")  → client receives instantly
Server → res.write("data: message 3\n\n")  → client receives instantly
... connection stays open indefinitely ...
Server → res.write("data: [DONE]\n\n")     → signals completion
```

- Client opens connection via `EventSource` — just a GET request with special headers
- Server responds with `Content-Type: text/event-stream` — tells the browser "keep listening"
- Server uses `res.write()` (NOT `res.json()`) — sends data **without closing** the connection
- `res.json()` / `res.send()` = sends + closes. `res.write()` = sends + keeps open

### SSE Message Format (Strict)

Every message must follow this format:

```
data: your message here\n\n
```

- Must start with `data: `
- Must end with **two newlines** `\n\n` — this tells the browser "one message ends here"
- Single `\n` = line continuation. Double `\n\n` = message boundary

### Required Headers

```javascript
res.setHeader("Content-Type", "text/event-stream");   // tells browser to expect streaming
res.setHeader("Cache-Control", "no-cache");            // don't cache the stream
res.setHeader("Connection", "keep-alive");             // keep TCP connection open
```

---

## Advanced SSE Features

### 1. Custom Event Types

You're not limited to generic `data:` messages. You can send named events:

```
event: token
data: {"text": "hello"}

event: error
data: {"message": "rate limit hit"}

event: done
data: {"status": "complete"}
```

Client listens to specific events:

```javascript
source.addEventListener("token", (e) => {
  const data = JSON.parse(e.data);
  // handle token
});

source.addEventListener("done", (e) => {
  source.close(); // close connection when done
});
```

### 2. Event IDs and Resuming

SSE supports `id:` fields for each message. If the connection drops, the browser automatically sends a `Last-Event-ID` header on reconnect — the server can resume from where it left off.

```
id: 1
data: {"token": "Hello"}

id: 2
data: {"token": " world"}

id: 3
data: {"token": "!"}
```

If the connection drops after id 2, the browser reconnects with:
```
Last-Event-ID: 2
```

Server can then resume from id 3. Useful for long streams you don't want to restart.

### 3. Retry Interval

Server can tell the browser how long to wait before reconnecting:

```
retry: 5000
data: connected

```

This sets the reconnection delay to 5 seconds (default is usually 3 seconds).

### 4. `[DONE]` Convention

Most LLM APIs (OpenAI, Anthropic) send a special final message to signal the stream is complete:

```
data: {"token": "end of response"}

data: [DONE]
```

Client should check for this and close the connection:

```javascript
source.onmessage = (event) => {
  if (event.data === "[DONE]") {
    source.close();
    return;
  }
  const data = JSON.parse(event.data);
  // process token
};
```

---

## Important Limitations

### 1. EventSource Only Supports GET

The native `EventSource` API **cannot send POST requests**. You can't send a request body with it.

**Problem:** For an LLM chat app, you need to POST the user's prompt.

**Solution:** Use `fetch()` with a readable stream instead:

```javascript
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: "explain SSE" }),
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  console.log(chunk); // process each streamed chunk
}
```

This is how ChatGPT's API actually streams responses — SSE-style streaming over a POST request.

### 2. Browser Connection Limit

Browsers allow only **~6 concurrent connections** per domain over HTTP/1.1. Each SSE connection permanently occupies one. If your app opens multiple SSE streams, you'll quickly exhaust the limit.

**Fix:** HTTP/2 solves this with multiplexing — allows many streams over a single TCP connection.

### 3. Text Only

SSE can only send **text data**. You can't stream binary data (images, files, audio). For binary streaming, you need WebSockets.

### 4. One-Directional Only

SSE is server → client only. The `EventSource` API has no `.send()` method. If the client needs to send data, use a separate `fetch()` call.

### 5. No IE Support

Internet Explorer never supported SSE. All modern browsers support it (Chrome, Firefox, Safari, Edge).

---

## Production Use Cases

| Use Case | Why SSE Works |
|---|---|
| **LLM token streaming** | ChatGPT, Claude APIs stream responses token-by-token via SSE |
| **Live notifications** | Server pushes new notifications as they happen |
| **CI/CD build logs** | GitHub Actions, Vercel stream deployment logs via SSE |
| **Live dashboards** | Stock prices, analytics, server metrics pushed in real-time |
| **Payment updates** | Stripe dashboard uses SSE for real-time payment notifications |
| **Progress updates** | File upload progress, data processing status |
| **Live sports scores** | Score changes pushed instantly |

**Common thread:** All are one-directional (server → client). The server has data and pushes it. The client just listens.

---

## Code — SSE Implementation

### Backend (Express)

```javascript
// controllers/sseController.js

let sseClients = [];

const startSse = (req, res) => {
  // 1. Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 2. Send a message every 2 seconds (demo)
  const interval = setInterval(() => {
    const data = { message: "Hello!", time: new Date().toISOString() };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 2000);

  // 3. Track client (for broadcasting from other endpoints)
  sseClients.push(res);

  // 4. Cleanup on disconnect — same pattern as long polling!
  req.on("close", () => {
    clearInterval(interval);
    sseClients = sseClients.filter((c) => c !== res);
  });
};

// Broadcast to all connected SSE clients from another endpoint
const broadcastSse = (req, res) => {
  const data = { message: req.body.message, time: new Date().toISOString() };

  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });

  res.json({ sent: true, clients: sseClients.length });
};

module.exports = { startSse, broadcastSse };
```

```javascript
// routes/sseRoutes.js
const router = require("express").Router();
const { startSse, broadcastSse } = require("../controllers/sseController");

router.get("/sse", startSse);
router.post("/sse/broadcast", broadcastSse);

module.exports = router;
```

### Frontend (React — Next.js Pages Router)

#### Using EventSource (GET only — simple)

```jsx
import React, { useState, useEffect } from "react";

const SSEClient = () => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource("http://localhost:5000/api/v1/playground/sse");

    source.onopen = () => {
      setConnected(true);
    };

    source.onmessage = (event) => {
      // Check for [DONE] signal
      if (event.data === "[DONE]") {
        source.close();
        setConnected(false);
        return;
      }
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    source.onerror = () => {
      console.error("SSE connection failed");
      setConnected(false);
      // Browser automatically retries — no manual reconnection needed!
    };

    // Cleanup on unmount
    return () => {
      source.close();
    };
  }, []);

  return (
    <div>
      <h2>SSE Client</h2>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>
      {messages.map((msg, i) => (
        <p key={i}>{msg.message} — {msg.time}</p>
      ))}
    </div>
  );
};

export default SSEClient;
```

#### Using Fetch + ReadableStream (POST support — for LLM apps)

```jsx
import React, { useState } from "react";

const SSEPostClient = () => {
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendPrompt = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/playground/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Explain SSE in simple terms" }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // Parse SSE format: "data: {...}\n\n"
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6); // remove "data: " prefix
            if (data === "[DONE]") break;
            const parsed = JSON.parse(data);
            setResponse((prev) => prev + parsed.token);
          }
        }
      }
    } catch (err) {
      console.error("Stream failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>LLM-Style SSE Streaming</h2>
      <button onClick={sendPrompt} disabled={loading}>
        {loading ? "Streaming..." : "Send Prompt"}
      </button>
      <p>{response}</p>
    </div>
  );
};

export default SSEPostClient;
```

---

## Interview Traps & Tricky Questions

### Trap 1: "Can you send data from client to server using SSE?"
**What they ask:** "Is SSE bidirectional?"
**Why it's tricky:** People confuse SSE with WebSockets.
**Correct answer:** "No. SSE is strictly server → client. For client → server, you use a separate fetch/POST request. That's fine for most use cases — LLM apps POST the prompt, then SSE streams the response."

### Trap 2: "EventSource only supports GET. How does ChatGPT stream responses to a POST request?"
**What they ask:** "If EventSource is GET-only, how do LLM APIs stream responses?"
**Why it's tricky:** Most tutorials only show EventSource, which can't POST.
**Correct answer:** "You use `fetch()` with `res.body.getReader()` to read a ReadableStream. It's SSE-style streaming over a POST request — same `text/event-stream` format, different client-side API."

### Trap 3: "What happens if the SSE connection drops?"
**What they ask:** "Do you need to write reconnection logic?"
**Why it's tricky:** With long polling you write manual retry. With SSE you don't.
**Correct answer:** "The browser auto-reconnects. If the server sent event IDs, the browser sends `Last-Event-ID` on reconnect so the server can resume. You can control retry delay with `retry:` field."

### Trap 4: "Why not just use WebSockets instead of SSE?"
**What they ask:** "WebSockets can do everything SSE does and more. Why bother with SSE?"
**Why it's tricky:** WebSockets seem superior on paper.
**Correct answer:** "SSE runs over plain HTTP — works with existing load balancers, proxies, CDNs, auth middleware out of the box. WebSockets use a different protocol (ws://), need connection upgrades, and require special infrastructure. If you only need server → client, SSE is simpler and cheaper to operate."

### Trap 5: "Can you open 10 SSE connections on the same page?"
**What they ask:** "What if your dashboard has 10 different real-time widgets?"
**Why it's tricky:** Connection limits aren't obvious.
**Correct answer:** "Over HTTP/1.1, browsers allow only ~6 concurrent connections per domain. 10 SSE streams would exceed that. Solutions: use HTTP/2 (multiplexing), multiplex multiple data streams into one SSE connection, or use different subdomains."

---

## Common Mistakes Senior Devs Still Make

- **Using `res.json()` instead of `res.write()`** — `res.json()` sends the response AND closes the connection. SSE requires `res.write()` which sends without closing
- **Forgetting `\n\n` at the end** — single `\n` means line continuation, double `\n\n` means message boundary. Missing it = browser never receives the message
- **Not cleaning up on disconnect** — same as long polling, skip `req.on("close")` and you get memory leaks + errors writing to dead connections
- **Using EventSource for POST requests** — EventSource only supports GET. For POST (like LLM prompts), use `fetch()` with ReadableStream
- **Opening multiple SSE connections** — hits browser connection limit. Multiplex into one connection instead
- **Not setting `Cache-Control: no-cache`** — proxies/CDNs might cache the stream and break everything

---

## SSE vs Long Polling — Key Differences

| Feature | Long Polling | SSE |
|---|---|---|
| Messages per connection | 1 (then reconnect) | Unlimited |
| Reconnection | Manual (you write it) | Automatic (browser handles it) |
| Resume support | None (start over) | Built-in (Last-Event-ID) |
| Client API | fetch() in a loop | EventSource (native) |
| Server method | res.json() (closes) | res.write() (keeps open) |
| Overhead | TCP + HTTP headers on every reconnect | Single connection, near zero overhead |
| Protocol | Regular HTTP | Regular HTTP (same!) |

---

## Quick Revision (Cheat Sheet)

- **SSE** = one-way persistent connection, server → client only
- Server sets `Content-Type: text/event-stream` header
- Uses `res.write()` to send without closing (NOT `res.json()`)
- Message format: `data: your message\n\n` — double newline is mandatory
- `EventSource` is the browser API — handles connection + auto-reconnect
- `EventSource` only supports GET — for POST, use `fetch()` + `ReadableStream`
- Event IDs (`id:` field) enable resume after disconnection via `Last-Event-ID` header
- Custom events with `event:` field — client uses `addEventListener()` to listen
- `[DONE]` convention signals stream completion (used by OpenAI, Anthropic APIs)
- Browser limit: ~6 connections per domain over HTTP/1.1. Use HTTP/2 for more
- Text-only — no binary data (use WebSockets for that)
- Same cleanup pattern as long polling: `req.on("close")` to handle disconnects
- SSE works with existing HTTP infrastructure (load balancers, proxies, auth). WebSockets don't

---

## References

- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [MDN: EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [MDN: ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [OpenAI Streaming API Docs](https://platform.openai.com/docs/api-reference/streaming)
- [HTML Spec: SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html)