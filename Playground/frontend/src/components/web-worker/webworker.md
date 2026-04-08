/*

id	name	email	age	city	salary
1	User_1	user1@gmail.com	54	Hyderabad	117775
2	User_2	user2@company.org	64	Kolkata	82481
3	User_3	user3@yahoo.com	61	Bangalore	125144
4	User_4	user4@outlook.com	59	Pune	71391
5	User_5	user5@gmail.com	21	Delhi	89584
6	User_6	user6@company.org	22	Chennai	112808
7	User_7	user7@company.org	18	Mumbai	39556
8	User_8	user8@gmail.com	30	Hyderabad	149028
9	User_9	user9@gmail.com	29	Delhi	89082


sample data for csv file
*/
# Web Workers — Interview Prep Notes (Medium + Advanced)

> Web Workers let you run JavaScript in a background thread, keeping the main thread free for UI rendering and user interactions. A must-know for senior roles — interviewers use this to test your understanding of the browser's threading model.

---

## 1. What Are Web Workers?

JavaScript is **single-threaded** — one call stack, one task at a time. The main thread handles DOM rendering, event listeners, user input, and all JS execution. If any JS task takes too long, the UI freezes.

Web Workers solve this by spawning a **separate OS-level thread** that runs JS in parallel. The worker has its own global scope (`self`), its own event loop, and **zero access to the DOM**.

Communication happens via **message passing** — `postMessage` to send, `onmessage` to receive. Data is **copied** (structured clone), not shared (with one exception: `SharedArrayBuffer` + `Transferable` objects).

### Types of Workers

| Type | Scope | Use Case |
|------|-------|----------|
| **Dedicated Worker** | One parent page | Heavy computation for a single tab |
| **Shared Worker** | Multiple tabs/windows | Shared state across tabs (e.g., WebSocket connection) |
| **Service Worker** | Entire origin | Offline caching, push notifications, network interception |

> **Interview note:** When someone says "Web Worker" they almost always mean a **Dedicated Worker**. Service Workers are a separate topic.

---

## 2. Why Do We Need Web Workers?

### The Main Thread Problem

The browser's main thread does everything:
- Parse & execute JS
- Calculate styles & layout
- Paint pixels
- Handle user input (clicks, scrolls, typing)

If your JS takes 200ms to execute, the UI is **frozen for 200ms**. The user can't click, type, or scroll. At 60fps, each frame budget is ~16ms. Anything beyond that = jank.

### What Web Workers Fix

- **No UI blocking** — heavy computation runs in parallel
- **True parallelism** — not async (which is still single-threaded), but actual multi-threading
- **Responsive UX** — animations, input, scrolling all stay smooth during computation

### What Web Workers Do NOT Fix

- Network I/O — `fetch` is already non-blocking (async)
- DOM manipulation — workers can't touch the DOM
- Simple async tasks — `setTimeout`, Promises, `requestAnimationFrame` are sufficient
- Small computations — worker creation overhead (~50-100ms) isn't worth it for tasks under ~50ms

### Key Distinction: Async ≠ Parallel

```
// Async (single thread) — fetch doesn't block, but parsing the response does
const res = await fetch('/big-data.json');
const data = await res.json();  // non-blocking
processData(data);              // THIS blocks the main thread

// Parallel (web worker) — everything runs on a different thread
worker.postMessage(rawData);    // send to worker
// main thread is completely free while worker processes
```

---

## 3. Production Use Cases

### 3.1 CSV / Large File Parsing
**Scenario:** User uploads a 100k+ row CSV. Parsing, validating, and summarizing on main thread freezes the UI.
**Worker does:** Read file → split rows → validate each row → return summary.

### 3.2 Real-Time Search / Fuzzy Matching
**Scenario:** 50k product catalog, user types in a search box. Running Levenshtein distance on every keystroke on main thread = typing lag.
**Worker does:** Receive query + dataset → compute fuzzy matches → return ranked results.

### 3.3 Image Processing
**Scenario:** User applies filters (grayscale, blur, contrast) to a high-res image. Pixel-by-pixel manipulation is CPU-heavy.
**Worker does:** Receive pixel data from canvas → apply transformations → return modified pixels.

### 3.4 Syntax Highlighting / Markdown Parsing
**Scenario:** Code editor or markdown editor with live preview. Parsing large documents lags the typing.
**Worker does:** Receive raw text → tokenize → generate highlighted HTML → return.

### 3.5 Data Aggregation for Dashboards
**Scenario:** Analytics dashboard receives large JSON datasets. Grouping, sorting, computing averages on main thread blocks chart rendering.
**Worker does:** Receive raw data → aggregate/group/compute → return chart-ready data.

### 3.6 Encryption / Hashing
**Scenario:** Client-side encryption of files before upload. Crypto operations are CPU-intensive.
**Worker does:** Receive file data → encrypt/hash → return encrypted output.

### 3.7 PDF Generation
**Scenario:** Generating multi-page PDFs client-side (using libraries like jsPDF). Layout computation for complex PDFs is slow.
**Worker does:** Receive data → generate PDF binary → transfer back.

---

## 4. Interview Question: CSV File Analyzer with Web Workers

### Problem Statement

Build a React component where:
- User uploads a CSV file (100k+ rows)
- A Web Worker parses and validates each row (check for missing fields, invalid emails)
- UI shows a loading/progress indicator while processing
- Final summary displays: total rows, valid/invalid count, missing values per column, first N errors

### Why This Tests Senior-Level Thinking

- **Threading model** — Do you know why main thread parsing freezes UI?
- **Worker lifecycle** — When to create, how to communicate, when to terminate
- **React integration** — How to wire worker messages into React's state/render cycle
- **Error handling** — What if the worker crashes? What if the component unmounts mid-processing?
- **UX** — Progress updates, not just a spinner with no feedback

### Key Architecture Decisions

```
Main Thread (React)              Worker Thread
─────────────────────           ─────────────────
1. User selects file
2. User clicks "Get Summary"
3. Create Worker
4. postMessage(file) ──────────► 5. Receive file
   setLoading(true)               6. FileReader.readAsText()
                                   7. Parse CSV line by line
                                   8. Validate each row
◄── progress (every 10k rows) ◄── 9. postMessage(progress)
   update progress UI
◄── final result ◄────────────── 10. postMessage(result)
   setSummary(result)
   setLoading(false)
   worker.terminate()
```

### Critical Implementation Details

**1. Worker creation — use `useRef`, not `useState`**
```javascript
const workerRef = useRef(null);
```
Why? The worker is a mutable resource, not render-triggering state. `useRef` holds it stably without causing re-renders.

**2. Prevent double-execution**
```javascript
const getSummary = () => {
  if (!data || loading) return;          // guard
  if (workerRef.current) workerRef.current.terminate(); // kill previous
  // ... create new worker
};
```

**3. Handle both progress and result messages**
```javascript
worker.onmessage = (e) => {
  if (e.data.type === "progress") {
    setProgress(e.data);  // update progress bar
    // do NOT terminate or setLoading(false) here
  } else if (e.data.type === "result") {
    setSummary(e.data);
    setLoading(false);
    worker.terminate();
    workerRef.current = null;
  }
};
```

**4. Error handling**
```javascript
worker.onerror = (err) => {
  console.error("Worker error:", err);
  setLoading(false);
  worker.terminate();
  workerRef.current = null;
};
```

**5. Unmount safety**
If the component unmounts while worker is running:
```javascript
useEffect(() => {
  return () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };
}, []);
```

---

## 5. Solution Review — React CSV Analyzer

### Component Structure

```
<CsvFileAnalyser>              — owns worker, state, orchestration
  <FileSelection />            — file input, displays file info, triggers getSummary
  <DisplaySummary />           — renders results from worker
```

### CsvFileAnalyser.jsx — Final Version

```jsx
import React, { useState, useRef, useEffect } from "react";
import DisplaySummary from "./DisplaySummary";
import FileSelection from "./FileSelection";

const CsvFileAnalyser = () => {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(null);
  const workerRef = useRef(null);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const getSummary = () => {
    if (!data || loading) return;

    if (workerRef.current) workerRef.current.terminate();

    const worker = new Worker(
      new URL("../../webWorker/fileAnalyser.js", import.meta.url)
    );
    workerRef.current = worker;
    setLoading(true);
    setSummary(null);
    setProgress(null);

    worker.postMessage(data);

    worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === "progress") {
        setProgress(msg);
      } else if (msg.type === "result") {
        setSummary(msg);
        setLoading(false);
        worker.terminate();
        workerRef.current = null;
      } else if (msg.error) {
        console.error(msg.error);
        setLoading(false);
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = (err) => {
      console.error("Worker error:", err);
      setLoading(false);
      worker.terminate();
      workerRef.current = null;
    };
  };

  return (
    <div>
      <FileSelection setData={setData} getSummary={getSummary} />
      {loading && progress && (
        <p>Processing... {progress.processed}/{progress.total} rows</p>
      )}
      {loading && !progress && <p>Starting analysis...</p>}
      {summary && <DisplaySummary summary={summary} />}
    </div>
  );
};

export default CsvFileAnalyser;
```

### fileAnalyser.js — Worker

```javascript
self.onmessage = (e) => {
  const file = e.data;
  const reader = new FileReader();

  reader.onload = (event) => {
    const text = event.target.result;
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      postMessage({ error: "File is empty or has no data rows" });
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const emailIndex = headers.indexOf("email");
    const totalRows = lines.length - 1;
    const errors = [];
    let validCount = 0;
    const missingByColumn = {};
    headers.forEach((h) => (missingByColumn[h] = 0));

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      let rowValid = true;

      headers.forEach((header, idx) => {
        if (!values[idx] || values[idx] === "") {
          missingByColumn[header]++;
          rowValid = false;
          errors.push({ row: i + 1, column: header, issue: "missing" });
        }
      });

      if (emailIndex !== -1 && values[emailIndex]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(values[emailIndex])) {
          rowValid = false;
          errors.push({
            row: i + 1,
            column: "email",
            issue: "invalid format",
            value: values[emailIndex],
          });
        }
      }

      if (rowValid) validCount++;

      if (i % 10000 === 0) {
        postMessage({ type: "progress", processed: i, total: totalRows });
      }
    }

    postMessage({
      type: "result",
      headers,
      totalRows,
      validCount,
      invalidCount: totalRows - validCount,
      missingByColumn,
      errors: errors.slice(0, 100),
      totalErrors: errors.length,
    });
  };

  reader.onerror = () => postMessage({ error: "Failed to read file" });
  reader.readAsText(file);
};
```

### What Makes This Senior-Level

| Concern | How It's Handled |
|---------|-----------------|
| Worker lifecycle | `useRef` + cleanup on unmount |
| Double-click guard | `if (!data \|\| loading) return` + terminate previous |
| Progress feedback | Worker sends updates every 10k rows |
| Message discrimination | `type: "progress"` vs `type: "result"` — only terminate on result |
| Error handling | Both `worker.onerror` and `msg.error` handled |
| Memory | Errors capped at 100, worker terminated after use |
| Separation of concerns | Parent orchestrates, FileSelection handles input, DisplaySummary renders |

### Follow-Up Questions Interviewers Ask

1. **"What if the CSV has 10M rows — would this approach still work?"**
   → FileReader loads entire file into memory. For very large files, consider streaming with `ReadableStream` or chunked reading.

2. **"Can you use `Transferable` objects here?"**
   → Yes. `ArrayBuffer` can be transferred (zero-copy) instead of cloned. Useful for binary data like images, not as critical for text.

3. **"When would you NOT use a Web Worker?"**
   → When the task is under ~50ms, when it's I/O bound (fetch), or when the overhead of serialization/deserialization exceeds the computation cost.

4. **"How is a Web Worker different from `requestIdleCallback` or chunking with `setTimeout`?"**
   → Those still run on the main thread — they just break work into smaller chunks between frames. Worker runs truly in parallel. Use chunking for light work, workers for heavy computation.

5. **"Can workers import modules?"**
   → Yes, with `import` in module workers (`new Worker(url, { type: 'module' })`). Not supported in all bundlers — Next.js `new URL()` pattern works around this.

---

## Quick Revision — Cheat Sheet

- Web Workers = **real OS threads**, not async on main thread
- Communication via **`postMessage` / `onmessage`** — data is **cloned**, not shared
- Workers **cannot access DOM**, `window`, `document`, or `localStorage`
- Use **`useRef`** to hold the worker in React, **not `useState`**
- Always **terminate** workers when done — they don't auto-cleanup
- Add **`useEffect` cleanup** to terminate on unmount
- Send **progress updates** for long tasks — don't leave the user staring at a spinner
- Handle **`onerror`** — workers can crash silently without it
- **When to use:** CSV parsing, image processing, fuzzy search, encryption, PDF generation
- **When NOT to use:** API calls, simple state updates, tasks under 50ms

---

## References

- [MDN — Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [MDN — Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [MDN — Transferable Objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)