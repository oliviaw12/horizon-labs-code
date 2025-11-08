from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from langchain_google_genai import GoogleGenerativeAIEmbeddings

from clients.database.pinecone import PineconeRepository
from clients.llm.settings import Settings


@dataclass(frozen=True)
class RetrievedContext:
    """Chunk of source material returned from the vector index."""

    text: str
    metadata: Dict[str, Any]
    score: Optional[float] = None


class SlideContextRetriever:
    """Fetches the most relevant slide/page chunks for quiz generation."""

    def __init__(
        self,
        settings: Settings,
        repository: Optional[PineconeRepository] = None,
        embedder: Optional[GoogleGenerativeAIEmbeddings] = None,
    ) -> None:
        if not settings.google_api_key:
            raise RuntimeError(
                "GOOGLE_API_KEY is required for context retrieval. Please set it in the backend .env file."
            )
        self._repository = repository or PineconeRepository(settings)
        self._embedder = embedder or GoogleGenerativeAIEmbeddings(
            model=settings.google_embeddings_model_name,
            google_api_key=settings.google_api_key,
        )

    def fetch(
        self,
        *,
        document_id: str,
        topic: str,
        difficulty: str,
        limit: int = 4,
    ) -> List[RetrievedContext]:
        if not document_id:
            return []

        query = self._build_query(topic=topic, difficulty=difficulty)
        vector = self._embedder.embed_query(query)
        response = self._repository.query(
            vector=vector,
            top_k=limit,
            document_id=document_id,
        )
        matches = (response or {}).get("matches") or []

        contexts: List[RetrievedContext] = []
        for match in matches:
            metadata = match.get("metadata") or {}
            text = str(metadata.get("text") or "").strip()
            if not text:
                continue
            contexts.append(
                RetrievedContext(
                    text=text,
                    metadata=metadata,
                    score=match.get("score"),
                )
            )
        return contexts

    @staticmethod
    def _build_query(*, topic: str, difficulty: str) -> str:
        base_topic = topic or "general computer science"
        base_difficulty = difficulty or "medium"
        return (
            f"{base_topic} key ideas suitable for a {base_difficulty} difficulty question. "
            "Return the most informative passages."
        )
