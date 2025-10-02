## ADR 007: Monitoring — Sentry + Google Analytics

### Context
 We need visibility into both system errors (for developers) and user behavior (for product/UX). These two goals require different tools but should be integrated seamlessly into the frontend and backend.

### Options
**Sentry**: Robust error tracking, alerting, and performance monitoring.

**Google Analytics (GA4)**: Industry-standard user behavior analytics for traffic, engagement, and retention insights.

**Mixpanel/Amplitude**: More advanced event-based analytics, but overkill for MVP.

**Datadog/New Relic**: Strong monitoring but higher cost/complexity than needed now.

### Decision
 We decided to integrate Sentry for error and performance monitoring and Google Analytics for user interaction tracking. Sentry will be tied to both the frontend (capturing React/Next.js errors) and backend (FastAPI errors). Google Analytics will connect to the frontend, tracking student and instructor flows.

### Status
 Accepted — this decision stands for MVP and first production release.

### Consequences
**Positive:**
1. Clear separation of concerns (errors → Sentry, behavior → GA).
2. Faster debugging of frontend and backend issues.
3. Data-driven improvements to UX.

**Negative / Risks:**
1. Additional overhead in configuring privacy compliance (GDPR, consent).
2. GA event setup must be maintained as flows evolve

