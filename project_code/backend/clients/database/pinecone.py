from __future__ import annotations

import logging
from typing import Any, Dict, Sequence

from pinecone import Pinecone

from clients.llm.settings import Settings

logger = logging.getLogger(__name__)


class PineconeRepository:
    """Thin wrapper around Pinecone vector operations used by the ingestion pipeline."""

    def __init__(self, settings: Settings) -> None:
        if not settings.pinecone_api_key:
            raise RuntimeError("PINECONE_API_KEY is required to ingest documents")
        if not settings.pinecone_index_name:
            raise RuntimeError("PINECONE_INDEX_NAME is required to ingest documents")

        self.namespace = settings.pinecone_namespace
        self._index_name = settings.pinecone_index_name
        self._client = Pinecone(
            api_key=settings.pinecone_api_key,
            environment=settings.pinecone_environment,
        )

        try:
            self._index = self._client.Index(self._index_name)
        except Exception as exc:  # pragma: no cover - depends on remote state
            logger.exception("Unable to access Pinecone index '%s'", self._index_name)
            raise RuntimeError(
                "Failed to initialise Pinecone index. Ensure the index exists and credentials are correct."
            ) from exc

    def upsert(self, items: Sequence[Dict[str, Any]]) -> None:
        if not items:
            return
        self._index.upsert(vectors=list(items), namespace=self.namespace)
