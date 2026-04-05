# Hash Map / Frequency Counter — DSA Pattern

> Master the frequency counter pattern — one of the most common building blocks in array and string problems. Interviewers love it because it tests your ability to trade space for time.

---

## Pattern Overview

**When to use:** Whenever a problem involves counting occurrences, finding duplicates, comparing distributions, or identifying "top K" elements.

**Core idea:** Build a frequency map in O(n), then query it — avoiding nested loops entirely.

---

## Problem 1: Find All Duplicates in an Array (LC #442 — Medium)

### Question

Given an integer array `nums` of length `n` where all integers are in the range `[1, n]` and each integer appears **at most twice**, return all integers that appear **twice**.

**Constraint:** O(n) time, O(1) auxiliary space.

```
Input:  [4,3,2,7,8,2,3,1]
Output: [2,3]
```

### 🧠 How to Think Through This

1. **Read the problem → spot the keyword:** "appears twice" = I need to **count occurrences**. My brain immediately goes to a frequency map.
2. **First instinct — hash map:** Loop through, count everything, then check who has count > 1. Simple. Works. But wait…
3. **Re-read constraints:** O(1) auxiliary space. A hash map is O(n) space. So that's out for the optimal solution, but it's still a valid first answer to mention.
4. **The hint is in the range:** All values are in `[1, n]` and array length is `n`. This means every value can map to a valid index (`value - 1`). Can I use the **array itself** as my hash map?
5. **The trick — marking:** If I visit index `3`, I can negate `nums[3]` to "mark" that I've seen value `4`. If I visit index `3` again and it's already negative, then `4` is a duplicate.
6. **Edge case check:** What if a value was already negated from a previous step? That's why I always use `Math.abs(nums[i])` to get the original value before using it as an index.

> **In an interview, say this out loud:** "My first thought is a hash map for O(n) time, but the space constraint pushes me to think about using the array itself — since values are bounded by the array length, I can use index negation."

---

### Approach 1 — Hash Map (Does NOT meet space constraint)

```javascript
var findDuplicates = function (nums) {
  const freq = new Map();
  const result = [];

  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  for (const [key, count] of freq) {
    if (count > 1) result.push(key);
  }

  return result;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n)  | Single pass to build map + single pass to read it |
| **Space**  | O(n)  | The map stores up to n entries — **violates the O(1) constraint** |

### Approach 2 — Index Negation (Optimal ✅)

Since every value is in `[1, n]`, we can use the **array itself** as a hash map. For each value, treat it as an index and negate the element at that index. If we visit an index that's already negative, the value is a duplicate.

```javascript
var findDuplicates = function (nums) {
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    const idx = Math.abs(nums[i]) - 1;

    if (nums[idx] < 0) {
      result.push(idx + 1);
    } else {
      nums[idx] = -nums[idx];
    }
  }

  return result;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n)  | Single pass through the array |
| **Space**  | O(1)  | No extra data structure — uses input array as the map |

> **Interview Trap:** Forgetting `Math.abs()` when reading `nums[i]` after negation causes index errors. Always use `Math.abs` before using a value as an index.

---

## Problem 2: Valid Anagram (LC #242 — Easy)

### Question

Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.

```
Input:  s = "anagram", t = "nagaram"
Output: true

Input:  s = "rat", t = "car"
Output: false
```

### 🧠 How to Think Through This

1. **Read the problem → what is an anagram?** Same letters, same counts, different order. So this is really asking: "Do these two strings have identical character frequencies?"
2. **Immediate edge case:** If lengths differ → impossible to be anagrams. Return `false` right away. This is a free O(1) check that avoids unnecessary work.
3. **First instinct — two frequency maps:** Count characters in both strings, then compare. Works perfectly. But can I do better on space?
4. **Optimisation thought:** Instead of two maps, what if I use **one** counter? Increment for string `s`, decrement for string `t`. If they're anagrams, everything cancels to zero.
5. **Another level deeper:** The problem says "lowercase English letters" — that's only 26 characters. I don't need a `Map` at all. A fixed array of size 26 works, and that's true O(1) space.
6. **How to map char → index?** `charCodeAt(i) - 97` maps `'a'` → `0`, `'b'` → `1`, … `'z'` → `25`.

> **In an interview, say this out loud:** "Anagram means same character distribution. I'll count frequencies — and since it's only lowercase letters, I can use a 26-element array instead of a map for constant space."

---

### Approach 1 — Two Frequency Maps

```javascript
var isAnagram = function (s, t) {
  if (s.length !== t.length) return false;

  const freq1 = {};
  const freq2 = {};

  for (const ch of s) freq1[ch] = (freq1[ch] || 0) + 1;
  for (const ch of t) freq2[ch] = (freq2[ch] || 0) + 1;

  for (const key in freq1) {
    if (freq1[key] !== freq2[key]) return false;
  }

  return true;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n)  | Three linear passes (two for building maps, one for comparing) |
| **Space**  | O(n)  | Two objects holding up to 26 keys each (for lowercase English) — effectively O(1) but generic impl is O(n) |

### Approach 2 — Single Array with charCodeAt (Optimal ✅)

Since the input is limited to lowercase English letters, use a fixed-size array of 26. Increment for `s`, decrement for `t` — if all zeros at the end, it's an anagram.

```javascript
var isAnagram = function (s, t) {
  if (s.length !== t.length) return false;

  const count = new Array(26).fill(0);

  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }

  for (let i = 0; i < 26; i++) {
    if (count[i] !== 0) return false;
  }

  return true;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n)  | Single pass through both strings simultaneously + fixed 26-iteration check |
| **Space**  | O(1)  | Array of exactly 26 — constant regardless of input size |

> **Interview Trap:** If asked about **Unicode support**, the 26-array trick breaks. You'd need a `Map` for arbitrary character sets. Always clarify constraints.

---

## Problem 3: Intersection of Two Arrays (LC #349 — Easy)

### Question

Given two integer arrays `nums1` and `nums2`, return an array of their **unique intersection**.

```
Input:  nums1 = [4,9,5], nums2 = [9,4,9,8,4]
Output: [9,4]
```

### 🧠 How to Think Through This

1. **Read the problem → keyword "intersection":** I need elements that exist in **both** arrays. Plus the result must be **unique**.
2. **Brute force thought:** For each element in `nums1`, scan all of `nums2` to see if it exists. That's O(n × m) — too slow, and handling uniqueness is messy.
3. **Better idea — Set lookup:** If I dump `nums1` into a `Set`, I get O(1) lookups. Then I walk through `nums2` and check: "Is this in the set?" If yes, it's an intersection element. Delete it from the set after pushing to avoid duplicates.
4. **Space optimisation thought:** Which array should become the set? The **smaller** one — this minimises space usage. (Good point to mention in an interview.)
5. **Alternative — what if I can't use extra space?** Sort both arrays, then use two pointers walking forward. When values match → push to result (skip duplicates). When they don't → advance the smaller pointer.
6. **Choosing between approaches:** Set is simpler and O(n + m). Two pointers avoids extra space but costs O(n log n + m log m) for sorting. Depends on constraints.

> **In an interview, say this out loud:** "I need fast lookups to check membership. A Set gives me O(1) per check. I'll build the set from the smaller array and walk the larger one."

---

### Approach 1 — Two Sets

Convert one array to a `Set`, then filter the other.

```javascript
var intersection = function (nums1, nums2) {
  const set1 = new Set(nums1);
  const result = [];

  for (const num of nums2) {
    if (set1.has(num)) {
      result.push(num);
      set1.delete(num); // ensures uniqueness in result
    }
  }

  return result;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n + m) | Build set from nums1 (n), iterate nums2 (m) |
| **Space**  | O(n)     | Set stores up to n unique elements |

### Approach 2 — Sort + Two Pointers

```javascript
var intersection = function (nums1, nums2) {
  nums1.sort((a, b) => a - b);
  nums2.sort((a, b) => a - b);

  const result = [];
  let i = 0, j = 0;

  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] === nums2[j]) {
      if (!result.length || result[result.length - 1] !== nums1[i]) {
        result.push(nums1[i]);
      }
      i++;
      j++;
    } else if (nums1[i] < nums2[j]) {
      i++;
    } else {
      j++;
    }
  }

  return result;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n log n + m log m) | Dominated by the two sorts |
| **Space**  | O(1)  | No extra data structure (ignoring sort internals and output) |

> **Interview Trap:** Forgetting to deduplicate the result. A `Set` handles it automatically; with two pointers you must check the last pushed element.

---

## Problem 4: Top K Frequent Elements (LC #347 — Medium)

### Question

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements.

```
Input:  nums = [1,1,1,2,2,3], k = 2
Output: [1,2]
```

### 🧠 How to Think Through This

1. **Read the problem → "k most frequent":** Two sub-problems here — (a) count frequencies, (b) find the top k. Step (a) is always a hash map. The real question is how to do step (b) efficiently.
2. **First instinct — sort:** Build the frequency map, convert to an array of `[element, count]` pairs, sort by count descending, take the first k. Easy to code, easy to explain. But it's O(n log n).
3. **Can I beat O(n log n)?** The follow-up asks for better than O(n log n). What are my options?
4. **Heap thought:** A min-heap of size k would let me stream through frequencies and keep only the top k. That's O(n log k). Better, but still not O(n).
5. **Key insight — bucket sort:** The maximum possible frequency is `n` (if all elements are the same). So I can create an array of size `n + 1` where index `i` holds all elements with frequency `i`. Then I just walk backwards from index `n` and collect until I have k elements. That's O(n)!
6. **Why does bucket sort work here but not always?** Because the "keys" I'm sorting by (frequencies) are bounded integers in `[1, n]`. If frequencies were unbounded or floating point, this wouldn't work.
7. **Edge case:** What if a bucket has more elements than remaining k? The problem guarantees a unique answer, so this won't cause issues — but mention it.

> **In an interview, say this out loud:** "Counting is straightforward with a map. The challenge is selecting top k efficiently. Sorting works at O(n log n), a heap gives O(n log k), but since frequency is bounded by n, I can flip it — use frequency as an index in a bucket array and walk backwards. That's O(n)."

---

### Approach 1 — Sort by Frequency

Build a frequency map → convert to array → sort descending → take first `k`.

```javascript
var topKFrequent = function (nums, k) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map((entry) => entry[0]);
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n log n) | Sorting the frequency entries dominates |
| **Space**  | O(n)       | Map + sorted array |

### Approach 2 — Manual Max Scan (k passes)

Scan the map k times, each time extracting and deleting the max-frequency element.

```javascript
var topKFrequent = function (nums, k) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  const result = [];

  while (result.length < k) {
    let maxKey = null;
    let maxVal = -1;

    for (const [key, val] of freq) {
      if (val > maxVal) {
        maxKey = key;
        maxVal = val;
      }
    }

    result.push(maxKey);
    freq.delete(maxKey);
  }

  return result;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n × k) | Each of the k rounds scans up to n entries |
| **Space**  | O(n)     | The frequency map |

### Approach 3 — Bucket Sort (Optimal ✅)

Use frequency as the bucket index. The maximum possible frequency is `n`, so create an array of size `n + 1`. Walk buckets from highest to lowest.

```javascript
var topKFrequent = function (nums, k) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  const buckets = new Array(nums.length + 1).fill(null);

  for (const [num, count] of freq) {
    if (!buckets[count]) buckets[count] = [];
    buckets[count].push(num);
  }

  const result = [];

  for (let i = buckets.length - 1; i > 0 && result.length < k; i--) {
    if (buckets[i]) result.push(...buckets[i]);
  }

  return result;
};
```

| Complexity | Value | Why |
|------------|-------|-----|
| **Time**   | O(n)  | Build map O(n) + fill buckets O(n) + read buckets O(n) |
| **Space**  | O(n)  | Map + bucket array |

> **Interview Trap:** Bucket sort only works here because frequency is bounded by `n`. If the problem asked for "top K by value" (unbounded range), this trick wouldn't apply.

---

## Quick Revision (Cheat Sheet)

- **Frequency Map** = the default first step for any counting/duplicate/anagram problem.
- `Map` > plain object when keys might be non-strings or you need `.size`.
- For **O(1) space** on `[1, n]` range arrays → use **index negation**.
- For **anagrams** with known charset → single increment/decrement array.
- For **Top K** → bucket sort gives O(n); sorting gives O(n log n); heap gives O(n log k).
- Always clarify: **unique result?** **sorted output?** **what's the value range?**

---

## References

- [LC 442 — Find All Duplicates](https://leetcode.com/problems/find-all-duplicates-in-an-array/)
- [LC 242 — Valid Anagram](https://leetcode.com/problems/valid-anagram/)
- [LC 349 — Intersection of Two Arrays](https://leetcode.com/problems/intersection-of-two-arrays/)
- [LC 347 — Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)