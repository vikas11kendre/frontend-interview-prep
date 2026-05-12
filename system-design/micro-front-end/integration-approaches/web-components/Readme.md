## Method 2: Web Components

Web Components let you create custom HTML elements that work across frameworks. They are browser-native and can be used in React, Angular, Vue, Svelte, or plain HTML.

A Web Component usually involves:

- **Custom Elements**: Define custom tags like `<product-tile>`.
- **Shadow DOM**: Encapsulates DOM and styles.
- **Templates**: Reusable HTML fragments.
- **Slots**: Content projection areas.

### Data Communication

| Direction | Mechanism | Example |
|---|---|---|
| Input | Attribute | `<product-tile title="Coffee Mug"></product-tile>` |
| Input | Property | `element.someProp = value` |
| Output | Custom Event | `new CustomEvent('add-to-cart', { detail })` |

### Example Web Component

```js
class ProductTile extends HTMLElement {
  static get observedAttributes() {
    return ['title'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<div id="title"></div>`;
  }

  connectedCallback() {
    const title = this.getAttribute('title') ?? 'Unnamed Product';
    this.updateTitle(title);

    this.dispatchEvent(
      new CustomEvent('add-to-cart', {
        detail: { title },
        bubbles: true,
        composed: true,
      })
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'title' && oldValue !== newValue) {
      this.updateTitle(newValue);
    }
  }

  updateTitle(title) {
    this.shadowRoot.querySelector('#title').textContent = title;
  }
}

customElements.define('product-tile', ProductTile);
```

Usage:

```html
<product-tile title="Coffee Mug"></product-tile>
```

Listen to custom events:

```js
const elem = document.querySelector('product-tile');

elem.addEventListener('add-to-cart', event => {
  console.log(event.detail);
});
```

### React Wrapped in Web Component

A React component can be mounted inside a Web Component’s Shadow DOM. This lets one team ship a React-based widget and other teams consume it as a native custom element.

Example usage:

```html
<magic-player
  src="https://cdn.example.com/video.mp4"
  controls="true"
></magic-player>
```

The wrapper handles attributes as inputs and custom events such as `play` and `pause` as outputs.

### Pros

- Framework-agnostic.
- Browser-native.
- Good for reusable design systems and widgets.
- Clean input/output communication through attributes and events.
- Shadow DOM helps avoid style leakage.
- Can support accessibility with ARIA and semantic HTML.

### Cons

- Cross-framework communication still needs careful design.
- Older browsers may need polyfills.
- No built-in global state sharing.
- SSR and hydration need extra planning.

### When to Use

Use Web Components for framework-independent UI components, design systems, cross-team widgets, and reusable frontend building blocks.

---
