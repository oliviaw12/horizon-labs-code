## ADR 005: Primary Database - Firestore

### Context
 We need a database to handle app data: user profiles, role assignments, chat history, and CUJ progress. Our priorities are developer velocity, real-time updates, and low ops overhead.

### Options
**Firestore (NoSQL)**: Serverless, realtime sync, good integration with Firebase ecosystem.

**PostgreSQL (SQL)**: Strong relational model, pgvector support, widely used in production.

**Supabase (Postgres as-a-service)**: Adds realtime and auth features on top of Postgres.

### Decision
 We chose Firestore for MVP because of its realtime sync, low ops, and strong alignment with a small team. PostgreSQL was considered but would add ops overhead and schema management complexity.

### Status
 Accepted for MVP; PostgreSQL may be revisited for advanced analytics or complex relationships.

### Consequences
**Positive:**
1. Rapid development with realtime sync.
2. Scales easily with no infra burden.

**Negative / Risks:**
1. Limited querying flexibility.
2. Migration may be needed if relational data grows complex.
