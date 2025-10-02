## ADR 006: Vector Store — Pinecone

### Context
 We need a vector database to store and query embeddings for semantic search and retrieval-augmented generation (RAG). Core needs include scalability, low-latency similarity search, and easy integration with LangChain.

### Options
**Pinecone**: Managed vector DB, built for large-scale similarity search, seamless LangChain integration.

**pgvector (Postgres extension)**: Open-source extension that allows vector storage/search in a Postgres instance, simpler if Postgres is already in use.

**Weaviate**: Open-source alternative with hybrid search, but higher ops overhead.

### Decision
 We selected Pinecone due to its production-grade performance, low-latency queries, and strong ecosystem integrations. pgvector was considered but would add complexity since our transactional DB is Firestore, not Postgres.

### Status
 Accepted.

### Consequences
**Positive:**
1. Easy scaling and reliability for RAG workloads.
2. Fast setup, no ops burden.

**Negative / Risks:**
1. Vendor lock-in.
2. Higher cost than self-hosted pgvector.
