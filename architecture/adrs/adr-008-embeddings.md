## ADR 008: Embeddings Provider — OpenAI

### Context
 We need high-quality embeddings for semantic search and RAG. Embeddings should be consistent, cost-effective, and well-supported in LangChain.

### Options
**OpenAI Embeddings (text-embedding-3-small/large)**: High accuracy, widely supported, cost-effective.

**Cohere**: Competitive embeddings, but less ecosystem adoption.

**Self-hosted (Sentence Transformers, etc.)**: Flexible but requires GPU infra.

### Decision
 We selected OpenAI embeddings due to their balance of quality, cost, and ecosystem support.

### Status
 Accepted.

### Consequences
**Positive:**
1. Strong semantic performance.
2. Out-of-the-box integration with LangChain.

**Negative / Risks:**
1. Vendor lock-in.
2. Reliance on external API uptime.
