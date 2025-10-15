# Horizon Labs Platform

## Overview
- FastAPI backend that streams chat and quiz responses from an LLM provider with optional telemetry.
- Next.js frontend that renders the Horizon Labs demo chat experience and consumes the streaming API.
- Shared research notes, product artifacts, and engineering utilities that support the Horizon Labs project.

## Hosting and Configuration
- The frontend (Next.js) is hosted on Vercel and the backend (FastAPI) on Render, both with automated deployments.
- Due to permission restrictions on the original class repository, the hosting and CI/CD workflows were migrated to a cloned repo where deployment now runs successfully:
  https://github.com/oliviaw12/horizon-labs-code
  
## Tech Stack at a Glance
- **Backend:** Python, FastAPI, LangChain, Playwright tests under `backend/tests`.
- **Frontend:** Next.js (App Router), React, Playwright end-to-end tests under `frontend/tests`.
- **Tooling:** Makefile shortcuts, environment files for local development, research documentation in `product_research/`.

## Repository Layout
```text
project/
├── Makefile                 # Convenience targets for dev, test, install
├── README.md                # Backend-focused documentation
├── backend/
│   ├── app/                  # FastAPI application (routes, schemas)
│   ├── clients/              # Service clients (LLM, telemetry, database stubs)
│   ├── requirements.txt      # Python dependencies
│   ├── test_frontend/        # Static test harness for streaming SSE
│   └── tests/                # Backend pytest suite
├── frontend/
│   ├── app/                  # Next.js routes (home + chat demo)
│   ├── components/           # Shared React components
│   ├── lib/                  # Client-side utilities and feature flags
│   ├── public/               # Static assets
│   ├── tests/                # Playwright e2e coverage
│   └── package.json          # Frontend dependencies & scripts
├── product_research/
│   ├── research_notes/       # Interview logs and discovery artifacts
│   └── ...
├── architecture/             # System diagrams and design explorations
└── team/                     # Planning docs, meeting notes, process
```

> See `project/backend/README.md` and `project/frontend/README.md` for deeper subsystem details.

## Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ / npm
- (Optional) `make` for the convenience targets below

### 2. Environment Setup
1. Copy the sample environment file and populate secrets:
   ```bash
   cd project
   cp .env.example .env
   ```
2. Adjust values as needed. Key settings:
   - `NEXT_PUBLIC_BACKEND_URL` (frontend): base URL for the running FastAPI server.
   - `OPENROUTER_API_KEY` (backend): required for real OpenRouter calls.
   - Other API keys (Pinecone, Firebase) are optional for the current demo.

### 3. Install Dependencies
```bash
# Frontend dependencies
cd project/frontend
npm install

# Backend dependencies (new shell)
cd project/backend
pip install -r requirements.txt
```
Or use the Makefile from the repo root: `make fe-install` and `make be-install`.

### 4. Run the Apps Locally
```bash
# Terminal 1 – backend (http://localhost:8000)
cd project/backend
uvicorn app.main:app --reload --port 8000

# Terminal 2 – frontend (http://localhost:3000)
cd project/frontend
npm run dev
```

Open `http://localhost:3000/chat` to interact with the streaming demo.

### 5. Run Tests
```bash
# Backend pytest suite
cd project/backend
pytest -q

# Frontend Playwright e2e suite
cd project/frontend
npx playwright test
```

## Makefile Shortcuts
```bash
make fe-install   # npm install in frontend/
make be-install   # pip install in backend/
make dev          # install both sets of deps
make fe           # npm run dev (frontend)
make be           # uvicorn fastapi server
make test         # run frontend + backend tests
```

## Additional Resources
- `architecture/` – system diagrams and exploratory designs.
- `product_research/` – discovery interviews and problem framing.
- `team/` – planning docs and internal process references.

Questions or contributions? Reach out to the Horizon Labs team via the `team/` folder contacts.
