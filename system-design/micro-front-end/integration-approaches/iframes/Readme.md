# Method 1: Iframes + Cross-Window Messaging

Iframes are one of the oldest but still valid ways to integrate independent frontend apps. An iframe embeds another web page inside the current page. Communication between the parent app and iframe happens using the browser `postMessage` API.

### Basic Idea

```html
<iframe
  id="search-mfe"
  src="https://example.github.io"
  style="width: 100%; height: 200px; border: none;"
></iframe>
```

Parent app sends data to iframe:

```js
const iframe = document.getElementById('search-mfe');

iframe.onload = () => {
  iframe.contentWindow.postMessage({ type: 'init', userId: 42 }, '*');
};
```

Iframe sends data back to parent:

```js
window.parent.postMessage({
  type: 'searchResult',
  payload: ['Item A', 'Item B'],
}, '*');
```

Parent listens:

```js
window.addEventListener('message', event => {
  if (event.data?.type === 'searchResult') {
    console.log(event.data.payload);
  }
});
```

### Pros

- Strong isolation and sandboxing.
- No shared memory or style leakage.
- Dependency conflicts are avoided.
- Useful for legacy or untrusted apps.
- Works well for payment widgets, embedded analytics, ads, or legacy dashboards.

### Cons

- Slower rendering and heavier UX.
- Shared routing is difficult.
- Styling consistency is hard.
- Communication can become complex.
- Each iframe app must be hosted separately.

### When to Use

- Use iframes when security, isolation, or legacy integration is more important than seamless UX.
- Legacy app migration — wrap old app in iframe, build new parts outside
- Third party widgets — payment forms, chat widgets (Intercom, Stripe use this)
- Need complete isolation — security critical features
# Downsides to keep in mind

- Each iframe = separate browser context — heavy on memory
- SEO unfriendly
- Shared UI (modals, tooltips) can't overflow iframe boundaries
- Browser history management is complex
- Not suitable for performance critical apps

# Implementing Micro Frontend with iframes

#### Shell App
  - Shell has the layout and loads each micro app in an iframe
  ```js
<iframe src="https://team-blue.com/cart" /> 
<iframe src="https://team-green.com/recommendations" />
```
 #### Communication — postMessage
Already discussed — parent ↔ iframe via postMessage

#### Routing
- Shell controls top-level routing. When route changes, shell updates iframe src or shows/hides iframes.

#### Shared Auth
Pass auth token from shell to iframe via postMessage on load — iframe uses it for API calls.

#### Styling
Each iframe is fully isolated — each team manages their own CSS. Shell only controls iframe dimensions.


