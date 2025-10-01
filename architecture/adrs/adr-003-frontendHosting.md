## ADR 003: Frontend Hosting — Vercel

### Context
 We need a hosting solution for the Next.js frontend that supports SSR, edge functions, and global CDN distribution. Priorities include developer experience, CI/CD, and reliability.

### Options
**Vercel**: Native support for Next.js, auto-deploy from GitHub, edge-first infra.

**Netlify**: Strong JAMstack hosting, but less optimized for Next.js.

**AWS Amplify**: Flexible but adds ops overhead.

### Decision
 We selected Vercel as our frontend hosting provider for its tight integration with Next.js and excellent developer workflow.

### Status
 Accepted.

### Consequences
**Positive:**
1. Zero-config deployment for Next.js.
2. Built-in CI/CD.

**Negative / Risks:**
1. Pricing may increase at scale.
2. Some lock-in with Vercel’s serverless/edge model.