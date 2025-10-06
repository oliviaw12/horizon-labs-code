## ADR 002: Frontend Framework — Next.js (with React)

### Context
 We need a frontend framework that supports server-side rendering (SSR), static site generation (SSG), API routes, and a smooth developer experience for building both the employee-facing and instructor-facing interfaces. Since our team works heavily with React, we want a framework that leverages React’s ecosystem while also offering production-grade performance and integration with Vercel hosting.

### Options
**Next.js**: Production-grade React framework, supports SSR/SSG, API routes, App Router, built-in optimizations, and great DX.

**Create React App (CRA)**: Simple setup but lacks SSR and modern routing capabilities.

**Remix**: Modern React framework with nested routing and server-side focus, but less mature ecosystem compared to Next.js.

**Vue/Nuxt**: Powerful SSR framework, but requires a switch to Vue ecosystem.

### Decision
 We chose Next.js for its balance of developer productivity, performance optimizations, and tight integration with React and Vercel. It simplifies routing, server-side rendering, and hosting.

### Status
 Accepted — stands for MVP and initial production deployment.

### Consequences
**Positive:**
1. Easy SSR/SSG for SEO and performance.
2. Tight Vercel integration.
3. Large React ecosystem.

**Negative / Risks:**
1. Steeper learning curve with the App Router.
2. Requires careful handling of server/client boundaries.
