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

## How Things Connect (compressed)

- **Student chat → FastAPI → OpenRouter/Gemini → Firestore/Pinecone**  
  UI `frontend/app/Student/chat/page.jsx` → API `/chat/stream|history|sessions|reset|debug/friction-state` (`backend/app/main.py`) → service `clients/llm/service.py` (+ `classifier.py`, `telemetry.py`) → storage `clients/database/chat_repository.py` + `firebase.py`.

- **Instructor upload → Ingestion → Pinecone (Gemini embeddings)**  
  UI `frontend/app/Instructor/QuizGenerator/page.jsx` → API `/ingest/upload`, `/ingest/document/{id}` (`backend/app/main.py`) → pipeline `clients/ingestion/pipeline.py` → Pinecone via `clients/database/pinecone.py` (keys/models in `clients/llm/settings.py`).

- **Quizzes (authoring + delivery)**  
  UI `frontend/app/Instructor/Practice|Assessment|Quizzes`, `frontend/app/Student/Quizzes/...` → API `/quiz/definitions*`, `/quiz/session/*`, `/quiz/session/{id}/answer|next|end` (`backend/app/main.py`) → services `clients/quiz/service.py`, `clients/quiz/generator.py`, `clients/rag/retriever.py` → storage `clients/database/quiz_repository.py`.

- **Analytics & diagnostics**  
  UI `frontend/app/Instructor/Dashboard/page.jsx` → API `/analytics/chats`, `/analytics/quizzes`, `/health`, optional `/ping` (`backend/ping_app.py`).

- **Hosting & tests**  
  Frontend: Next.js on Vercel; tests in `frontend/tests/` (Jest + Playwright).  
  Backend: FastAPI on Render; tests in `backend/tests/` (pytest).  
  Vendors: OpenRouter (Gemini default), Google embeddings; data in Firestore + Pinecone.

## Key Files by Area

- Backend API: `backend/app/main.py` (routes), `backend/app/schemas.py` (models); CORS/bootstrap in same file; pytest config `backend/pytest.ini`.
- Chat: `clients/llm/service.py`, `clients/llm/classifier.py`, `clients/llm/settings.py`, `clients/llm/telemetry.py`; storage `clients/database/chat_repository.py`, `firebase.py`.
- Ingestion: `clients/ingestion/pipeline.py`; vector store `clients/database/pinecone.py`.
- Quizzes: `clients/quiz/service.py`, `clients/quiz/generator.py`, `clients/rag/retriever.py`, `clients/database/quiz_repository.py`.
- Frontend entrypoints: `frontend/app/page.jsx` (role choose), `frontend/app/Student/HomePage/page.jsx`, `frontend/app/Student/chat/page.jsx`, `frontend/app/Student/Quizzes/...`, `frontend/app/Instructor/QuizGenerator/page.jsx`, `frontend/app/Instructor/Practice|Assessment/page.jsx`, `frontend/app/Instructor/Dashboard/page.jsx`.
- Frontend scaffolding: `frontend/app/layout.jsx`, `frontend/app/globals.css`, shared UI in `frontend/app/components`, flags in `frontend/lib/flag.js`, assets in `frontend/public/`.
- Config: `backend/.env` (OpenRouter, Google API, Pinecone, Firestore, friction/classifier), `frontend/.env.local` (`NEXT_PUBLIC_BACKEND_URL`).
