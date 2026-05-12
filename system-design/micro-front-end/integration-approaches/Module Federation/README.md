## Method 4: Module Federation

Module Federation, introduced with Webpack 5, allows separately built and deployed applications to expose and consume modules at runtime.

Unlike iframes or Web Components, the host app can directly import a remote component as if it were part of the local app.

### Typical Setup

- **Host app**: Shell that consumes remote modules.
- **Remote app**: App that exposes components or modules.

### Remote App Example

```js
// product-app/webpack.config.js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devServer: {
    port: 3001,
  },
  output: {
    publicPath: 'auto',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'productApp',
      filename: 'remoteEntry.js',
      exposes: {
        './ProductTile': './src/ProductTile.jsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
```

### Host App Consumption

```js
import React, { Suspense } from 'react';

const RemoteProductTile = React.lazy(() => import('productApp/ProductTile'));

export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Host App</h1>
      <Suspense fallback={<div>Loading product tile...</div>}>
        <RemoteProductTile title="Bluetooth Speaker" />
      </Suspense>
    </div>
  );
}
```

### Pros

- Runtime module loading.
- Independent deployments.
- Direct component sharing.
- Shared dependencies can reduce duplicate bundles.
- No iframe wrapper needed.
- Useful for platform-style products.

### Cons

- Webpack-specific by default.
- Setup and shared dependency configuration can be complex.
- Remote app downtime can break the host unless fallback handling exists.
- Version mismatch risk.
- SSR requires custom handling.

### When to Use

Use Module Federation when independent teams need to share real app modules or components at runtime inside one cohesive frontend platform.

---

## Other Tools

### Import Maps + Native ES Modules

Import Maps let browsers resolve module names to URLs without a bundler.

```html
<script type="importmap">
{
  "imports": {
    "ui-library/": "https://cdn.example.com/ui/v1.2.3/",
    "square": "./modules/shapes/square.js"
  }
}
</script>
```

Use this for modern-browser-only apps, shared libraries, and lightweight federated loading.

### Piral

Piral is a portal-focused micro-frontend framework. It uses a central shell and pluggable micro apps called pilets.

Good for enterprise portals, admin dashboards, CMS-heavy applications, and feature-team-driven products.

### Luigi

Luigi, from SAP, focuses on shell-based micro frontend applications with side navigation, top bars, permissions, and iframe-based integration.

Good for intranet apps, cloud admin panels, and productized dashboards.

### Open Components

Open Components treats UI as independently deployable services. Components can be rendered server-side or client-side and consumed through a registry/CDN model.

Good when a company wants UI components to behave like deployable microservices.

### Bit

Bit is not strictly a micro-frontend framework. It helps teams build, version, discover, and publish composable components.

Good with Web Components or Module Federation when teams need component ownership and reuse at scale.

---

## Decision Guide

| Use Case | Best Fit |
|---|---|
| Need maximum isolation/security | Iframes |
| Need framework-agnostic reusable UI | Web Components |
| Need central route orchestration for multiple SPAs | single-spa |
| Need runtime component/module sharing | Module Federation |
| Need modern browser native module mapping | Import Maps |
| Need enterprise portal plugins | Piral |
| Need SAP-style shell/navigation/RBAC | Luigi |
| Need UI-as-service registry | Open Components |
| Need component discovery/versioning | Bit |

---

## Frontend Interview Notes

### What interviewer may ask

**Q: Can micro frontends share Redux state?**

Yes, but it is usually not recommended to directly share one Redux store across all micro frontends because it creates tight coupling. Better options are:

- Shell-owned state exposed through contracts.
- Custom event bus.
- URL/query params for route state.
- Shared API/backend state.
- Shared auth/session context.
- Module Federation shared store only when teams are tightly aligned.

**Q: How should header/footer be handled?**

Usually the shell owns common layout such as header, footer, navigation, authentication guard, and route composition. Feature teams own page-level micro apps.

**Q: How to structure e-commerce micro frontends?**

A practical split:

```text
shell-app
├── header / footer / auth / routing
├── product-listing-mfe
├── product-detail-mfe
├── cart-mfe
├── checkout-mfe
├── account-mfe
└── shared-ui-library
```

**Q: Which approach is best for React + Next.js?**

For production-grade React/Next.js apps, Module Federation or route-level composition is common. Web Components work well for framework-independent widgets. Iframes should be reserved for isolation-heavy use cases.

---

## Final Summary

Micro frontends are not a single technology. They are an architectural pattern for splitting frontend ownership, deployment, and runtime composition across teams.

Use them only when the product/team complexity justifies the extra architecture cost. For a small app, a simple monolith is often better. For a large multi-team product, micro frontends can improve autonomy, release speed, and long-term maintainability when implemented with clear contracts and strong platform governance.
