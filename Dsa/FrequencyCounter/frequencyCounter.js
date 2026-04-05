/**
 * Hash Map / Frequency Counter — DSA Pattern
 *
 * Clean, runnable implementations with multiple approaches.
 * Run: node hashmap-frequency-counter.js
 */

// ============================================
// Problem 1: Find All Duplicates in an Array (LC #442 — Medium)
// ============================================
// Given nums of length n, values in [1, n], each appears at most twice.
// Return all integers that appear twice.
// Constraint: O(n) time, O(1) auxiliary space.

// Approach 1 — Hash Map | Time: O(n) | Space: O(n) ⚠️ Doesn't meet space constraint
function findDuplicates_map(nums) {
  const freq = new Map();
  const result = [];

  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  for (const [key, count] of freq) {
    if (count > 1) result.push(key);
  }

  return result;
}

// Approach 2 — Index Negation | Time: O(n) | Space: O(1) ✅ Optimal
// Since values are in [1, n], use value as index. Negate to mark "seen".
// If already negative when visited again → duplicate.
function findDuplicates_negation(nums) {
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    const idx = Math.abs(nums[i]) - 1; // always use Math.abs — value may already be negated

    if (nums[idx] < 0) {
      result.push(idx + 1); // idx + 1 = original value
    } else {
      nums[idx] = -nums[idx]; // mark as seen
    }
  }

  return result;
}

console.log("=== Find All Duplicates ===");
console.log("Map:      ", findDuplicates_map([4, 3, 2, 7, 8, 2, 3, 1])); // [2, 3]
console.log("Negation: ", findDuplicates_negation([4, 3, 2, 7, 8, 2, 3, 1])); // [2, 3]
console.log("Single:   ", findDuplicates_map([1, 1, 2])); // [1]
console.log("Empty:    ", findDuplicates_map([1])); // []
console.log();

// ============================================
// Problem 2: Valid Anagram (LC #242 — Easy)
// ============================================
// Given two strings s and t, return true if t is an anagram of s.

// Approach 1 — Two Frequency Objects | Time: O(n) | Space: O(n)
function isAnagram_twoMaps(s, t) {
  if (s.length !== t.length) return false;

  const freq1 = {};
  const freq2 = {};

  for (const ch of s) freq1[ch] = (freq1[ch] || 0) + 1;
  for (const ch of t) freq2[ch] = (freq2[ch] || 0) + 1;

  for (const key in freq1) {
    if (freq1[key] !== freq2[key]) return false;
  }

  return true;
}

// Approach 2 — Single 26-Array with charCodeAt | Time: O(n) | Space: O(1) ✅ Optimal
// Increment for s, decrement for t. If all zeros at end → anagram.
// Only works for lowercase English letters (26 chars).
function isAnagram_array(s, t) {
  if (s.length !== t.length) return false;

  const count = new Array(26).fill(0);

  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++; // 'a' = 97, so 'a' → index 0, 'z' → index 25
    count[t.charCodeAt(i) - 97]--;
  }

  for (let i = 0; i < 26; i++) {
    if (count[i] !== 0) return false;
  }

  return true;
}

console.log("=== Valid Anagram ===");
console.log("Two Maps: ", isAnagram_twoMaps("anagram", "nagaram")); // true
console.log("Array:    ", isAnagram_array("anagram", "nagaram")); // true
console.log("Two Maps: ", isAnagram_twoMaps("rat", "car")); // false
console.log("Array:    ", isAnagram_array("rat", "car")); // false
console.log();

// ============================================
// Problem 3: Intersection of Two Arrays (LC #349 — Easy)
// ============================================
// Return unique intersection of two arrays.

// Approach 1 — Set Lookup | Time: O(n + m) | Space: O(n) ✅
// Build Set from one array, walk the other and check membership.
function intersection_set(nums1, nums2) {
  const set1 = new Set(nums1);
  const result = [];

  for (const num of nums2) {
    if (set1.has(num)) {
      result.push(num);
      set1.delete(num); // delete after push to ensure uniqueness in result
    }
  }

  return result;
}

// Approach 2 — Sort + Two Pointers | Time: O(n log n + m log m) | Space: O(1)
// Sort both, walk with two pointers, skip duplicates.
function intersection_twoPointers(nums1, nums2) {
  nums1.sort((a, b) => a - b);
  nums2.sort((a, b) => a - b);

  const result = [];
  let i = 0;
  let j = 0;

  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] === nums2[j]) {
      // only push if not a duplicate of last pushed element
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
}

console.log("=== Intersection of Two Arrays ===");
console.log("Set:          ", intersection_set([4, 9, 5], [9, 4, 9, 8, 4])); // [9, 4]
console.log("Two Pointers: ", intersection_twoPointers([4, 9, 5], [9, 4, 9, 8, 4])); // [4, 9]
console.log("Set:          ", intersection_set([1, 2, 2, 1], [2, 2])); // [2]
console.log();

// ============================================
// Problem 4: Top K Frequent Elements (LC #347 — Medium)
// ============================================
// Return the k most frequent elements.
// Follow up: better than O(n log n).

// --- Step shared by all approaches: build frequency map ---
function buildFreqMap(nums) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }
  return freq;
}

// Approach 1 — Sort | Time: O(n log n) | Space: O(n)
// Convert map → array of [element, count], sort by count desc, take first k.
function topKFrequent_sort(nums, k) {
  const freq = buildFreqMap(nums);

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map((entry) => entry[0]);
}

// Approach 2 — Manual Max Scan | Time: O(n × k) | Space: O(n)
// Find max-frequency element k times, deleting after each pick.
function topKFrequent_maxScan(nums, k) {
  const freq = buildFreqMap(nums);
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
}

// Approach 3 — Bucket Sort | Time: O(n) | Space: O(n) ✅ Optimal
// Use frequency as bucket index. Max frequency = n.
// Walk buckets from highest to lowest, collect until we have k elements.
function topKFrequent_bucket(nums, k) {
  const freq = buildFreqMap(nums);

  // buckets[i] = array of elements that appear exactly i times
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
}

console.log("=== Top K Frequent Elements ===");
console.log("Sort:     ", topKFrequent_sort([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log("Max Scan: ", topKFrequent_maxScan([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log("Bucket:   ", topKFrequent_bucket([1, 1, 1, 2, 2, 3], 2)); // [1, 2]
console.log();
console.log("Sort:     ", topKFrequent_sort([1, 2, 1, 2, 1, 2, 3, 1, 3, 2], 2)); // [1, 2]
console.log("Bucket:   ", topKFrequent_bucket([1, 2, 1, 2, 1, 2, 3, 1, 3, 2], 2)); // [1, 2]
console.log("Single:   ", topKFrequent_bucket([1], 1)); // [1]