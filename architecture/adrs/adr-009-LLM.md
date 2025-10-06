## ADR 009: LLM Provider — OpenRouter

### Context
 We need an LLM provider for serving completions and chat. Requirements include multi-model flexibility (e.g., Gemini, GPT-4.1, Claude), reliability, and cost control.

### Options
**OpenRouter**: Aggregates multiple LLM vendors (OpenAI, Anthropic, Google, etc.), routing requests via one API.

**Direct vendor APIs (OpenAI, Anthropic, Google, etc.)**: Reliable, but would require multiple integrations.

**Self-hosted (Llama, Mistral)**: Cost-efficient long-term, but adds infra burden.

### Decision
 We chose OpenRouter for its flexibility in accessing multiple LLMs under one integration, enabling experimentation and vendor-agnostic fallback.

### Status
 Accepted.

### Consequences
**Positive:**
1. Single integration point for many models.
2. Ability to route/compare different LLMs.

**Negative / Risks:**
1. Extra latency due to proxying.
2. Vendor lock-in at aggregator level.
