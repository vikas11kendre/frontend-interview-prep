🛒 "Product Listing Page" — Machine Coding Round
⏱️ Time to Complete: 60–75 minutes
(Senior Frontend / Lead level — same as what Flipkart, Atlassian, Razorpay, Swiggy, Zepto ask)

Problem Statement
Build a Product Listing Page with the following requirements:

Core Features
1. Dual Listing Mode (Toggle)

A toggle switch at the top: "Infinite Scroll" ↔ "Load More"
In Infinite Scroll mode: automatically fetch the next page when the user scrolls near the bottom
In Load More mode: show a "See More Products" button to fetch the next page manually

2. Search Bar

A search input that filters products by name
Must be debounced (300ms) — no API call on every keystroke
Each search resets pagination back to page 1

3. Virtualised Product Grid

Only render products visible in the viewport (+ a small overscan buffer)
The grid should not mount 500 DOM nodes if 500 products are loaded
Use a fixed-height card (you can hardcode card height, e.g. 250px)

4. Race Condition Handling

If the user types "app", then quickly changes it to "apple", only the response for "apple" should be shown — stale responses must be discarded
Handle this without any external library

5. Throttled Scroll Handler

The scroll event listener for infinite scroll must be throttled (not debounced) at 200ms
