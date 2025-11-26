# Repository & Architecture Map

This file mirrors the repository layout and shows how requests flow through the tech stack (frontend → FastAPI backend → LLM/vendor services → databases).

## Directory Guide

```
project_code/
├── Makefile                # Dev/test shortcuts (npm install, pip install, run servers)
├── README.md               # High-level project overview + setup
├── backend/                # FastAPI service
│   ├── app/                # API routes and request/response schemas
│   ├── clients/            # Service layers and integrations
│   │   ├── llm/            # Chat + prompt logic (LangChain/OpenRouter)
│   │   ├── quiz/           # Quiz generation, grading, sessions
│   │   ├── ingestion/      # Slide/PDF parsing → embeddings → Pinecone index
│   │   ├── rag/            # Context retrieval from Pinecone for quizzes
│   │   └── database/       # Firestore chat storage, Pinecone wrapper, quiz store
│   ├── tests/              # Backend pytest suite
│   └── test_frontend/      # Static SSE test harness for the API
└── frontend/               # Next.js (App Router) UI
    ├── app/                # Routes for student/instructor flows
    │   ├── Student/        # Chat + quizzes UX
    │   ├── Instructor/     # Uploads, quiz generator, dashboards
    │   ├── Quiz/           # Shared quiz pages
    │   └── components/     # Layout wrappers & shared UI pieces
    ├── lib/                # Client-side helpers (feature flags, utilities)
    └── public/             # Static assets (icons, gradients, buttons)
```

## How Things Connect 

- **Student chat → Backend → OpenRouter/Gemini → Firestore/Pinecone**
  - UI: `frontend/app/Student/chat/page.jsx` streams tokens from `POST /chat/stream`, hydrates from `GET /chat/history`, lists sessions from `GET /chat/sessions`, resets via `POST /chat/reset`, inspects friction via `GET /debug/friction-state`.
  - API: `backend/app/main.py` routes to `LLMService` (`clients/llm/service.py`), which builds prompts, runs LangChain `ChatOpenAI` against OpenRouter (model defaults in `clients/llm/settings.py`), and persists history to Firestore (`clients/database/chat_repository.py`, `firebase.py`) or falls back to in-memory.
  - Telemetry: optional structured logs via `clients/llm/telemetry.py`.

- **Instructor upload → Ingestion → Pinecone (embeddings via Gemini)**
  - UI: `frontend/app/Instructor/QuizGenerator/page.jsx` uploads PPTX/PDF to `POST /ingest/upload`; deletes via `DELETE /ingest/document/{id}`.
  - API: `backend/app/main.py` → `LLMService.ingest_upload` → `SlideIngestionPipeline` (`clients/ingestion/pipeline.py`).
    - Extract slides/pages (`SlideExtractor` / `PDFExtractor`), chunk (`SlideChunker`), embed with Google Generative AI embeddings, upsert vectors to Pinecone via `clients/database/pinecone.py`.

- **Quiz creation & delivery (practice/assessment)**
  - Instructor flow: publishes quiz definitions over `POST/GET/DELETE /quiz/definitions` from Instructor pages (e.g., `frontend/app/Instructor/Practice/page.jsx`, `.../Assessment/page.jsx`).
  - Student flow: lists quizzes (`GET /quiz/definitions`), starts sessions (`POST /quiz/session/start`), fetches questions (`GET /quiz/session/{id}/next`), submits answers (`POST /quiz/session/{id}/answer`), ends sessions (`POST /quiz/session/{id}/end`), reviews history (`GET /quiz/session/{id}`) from Student quiz pages.
  - API: `backend/app/main.py` delegates to `QuizService` (`clients/quiz/service.py`).
    - Question generation via `QuizQuestionGenerator` (`clients/quiz/generator.py`) using OpenRouter LLM.
    - Optional context grounding from previously ingested slides via `SlideContextRetriever` (`clients/rag/retriever.py`) hitting Pinecone.
    - Quiz/session state lives in the quiz repository (`clients/database/quiz_repository.py`), currently in-memory.

- **Analytics & diagnostics**
  - Chat analytics (`GET /analytics/chats`) and quiz analytics (`GET /analytics/quizzes`) surface aggregate counts for dashboards (`frontend/app/Instructor/Dashboard/page.jsx`).
  - Health/ping: `GET /health`, `HEAD /` for Render/Vercel probes; optional lightweight `/ping` app in `backend/ping_app.py`.

- **Hosting/tests**
  - Frontend: Next.js app (UI in `frontend/app`) deployable to Vercel; front-end testing with Jest under `frontend/tests/`.
  - Backend: FastAPI app (in `backend/app/main.py`) deployable to Render; backend tests in `backend/tests/` (pytest).
  - LLM vendor: OpenRouter (`OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`) using Gemini model by default; embeddings via Google Generative AI (`GOOGLE_API_KEY`).
  - Datastores: Firestore for chat transcripts (optional, else in-memory) and Pinecone for semantic search over ingested slides.

## Components

- **Backend API surface:** `backend/app/main.py` defines chat, ingest, quiz, analytics, and health endpoints.
- **Chat stack:** `clients/llm/service.py` (prompting + SSE streaming) → `langchain_openai.ChatOpenAI` (OpenRouter) → Firestore/in-memory persistence → telemetry logger.
- **Ingestion stack:** `clients/ingestion/pipeline.py` (extract → chunk → embed → Pinecone) with settings from `clients/llm/settings.py`.
- **Quiz stack:** `clients/quiz/service.py` (session orchestration) + `clients/quiz/generator.py` (LLM question writing) + `clients/rag/retriever.py` (Pinecone context) + `clients/database/quiz_repository.py` (storage).
- **Frontend entrypoints:** role selection (`frontend/app/page.jsx`), student home (`frontend/app/Student/HomePage/page.jsx`), chat (`frontend/app/Student/chat/page.jsx`), quizzes (`frontend/app/Student/Quizzes/...`), instructor upload/generator (`frontend/app/Instructor/QuizGenerator/page.jsx`), instructor quiz setup (`frontend/app/Instructor/Practice|Assessment/page.jsx`), dashboards (`frontend/app/Instructor/Dashboard/page.jsx`).
- **Config knobs:** `backend/.env` (OpenRouter, Google API, Pinecone, Firestore, friction/classifier tuning), `frontend/.env.local` (`NEXT_PUBLIC_BACKEND_URL`).

## File-level Wiring (front → API → services → vendors)

- **Chat (SSE)**
  - Frontend: `frontend/app/Student/chat/page.jsx` calls `POST /chat/stream` (SSE), `GET /chat/history`, `GET /chat/sessions`, `POST /chat/reset`, `GET /debug/friction-state`.
  - API layer: `backend/app/main.py` (`chat_stream`, `chat_history`, `chat_sessions`, `chat_reset`, `friction_state`); request/response models in `backend/app/schemas.py`.
  - Service: `backend/clients/llm/service.py` builds prompts, tracks friction state, streams via `langchain_openai.ChatOpenAI`; classifier in `clients/llm/classifier.py`; telemetry in `clients/llm/telemetry.py`.
  - Storage: `clients/database/chat_repository.py` interface; Firestore impl in `clients/database/firebase.py`; in-memory fallback in same module.

- **Slide/PDF ingestion → embeddings → Pinecone**
  - Frontend: `frontend/app/Instructor/QuizGenerator/page.jsx` hits `POST /ingest/upload`, `DELETE /ingest/document/{id}`.
  - API layer: `backend/app/main.py` (`ingest_upload`, `ingest_delete_document`) delegates to `LLMService.ingest_upload` / `.delete_document`.
  - Pipeline: `clients/ingestion/pipeline.py` orchestrates extract (`SlideExtractor`, `PDFExtractor`), chunk (`SlideChunker`), embed (GoogleGenerativeAIEmbeddings), and upsert to Pinecone via `clients/database/pinecone.py`.
  - Settings: `clients/llm/settings.py` supplies Pinecone keys, Google API key, model names; ingestion batch size, namespace, dimensions live here too.
  - Tests: `backend/tests/test_slide_context_retriever.py` covers retrieval logic; pipeline behaviours can be unit-tested similarly.

- **Quiz authoring + delivery**
  - Frontend (Instructor): quiz definition CRUD and mode selection in `frontend/app/Instructor/Practice/page.jsx`, `frontend/app/Instructor/Assessment/page.jsx`, list view in `frontend/app/Instructor/Quizzes/page.jsx`.
  - Frontend (Student): browse quizzes `frontend/app/Student/Quizzes/page.jsx`, take quiz `frontend/app/Student/Quizzes/[quizId]/page.jsx`, session Q&A `frontend/app/Student/Quizzes/[quizId]/sessions/[sessionId]/page.jsx`.
  - API layer: `backend/app/main.py` quiz routes (`/quiz/definitions*`, `/quiz/session/*`, `/quiz/session/{id}/answer|next|end`, `/quiz/session/{id}`) with request/response schemas in `backend/app/schemas.py`.
  - Service: `clients/quiz/service.py` coordinates sessions, grading, streaks; uses `clients/quiz/generator.py` (LLM question JSON), pulls context from `clients/rag/retriever.py` (Pinecone) when available.
  - Storage: `clients/database/quiz_repository.py` holds quiz definitions/sessions (in-memory by default).

- **Retrieval (for quizzes)**
  - Retriever: `clients/rag/retriever.py` builds Pinecone queries using Google embeddings, filters by `document_id`, and samples top-K chunks; reset logic for coverage thresholds.
  - Tests: `backend/tests/test_slide_context_retriever.py` validates fetch logic and coverage reset.

- **Routing & middleware**
  - CORS + app bootstrap in `backend/app/main.py`; optional warm `/ping` mount in `backend/ping_app.py`.
  - Shared schemas live in `backend/app/schemas.py`; pytest config in `backend/pytest.ini`; settings loader in `clients/llm/settings.py` and `clients/quiz/settings.py`.

- **Frontend scaffolding**
  - Global layout: `frontend/app/layout.jsx`, styles in `frontend/app/globals.css`.
  - Common UI: `frontend/app/components` (navigation, cards, modals).
  - Feature flags/utilities: `frontend/lib/flag.js`; assets in `frontend/public/`.

- **Testing**
  - Backend: `backend/tests/` (pytest) — covers chat classifier, ingestion/retrieval, quiz flows.
  - Frontend: `frontend/tests/` Jest unit tests alongside Next.js components.
