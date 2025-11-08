from __future__ import annotations

import logging
from typing import Any, Dict, Sequence, List

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
            self.dimension = self._fetch_index_dimension()
        except Exception as exc:  # pragma: no cover - depends on remote state
            logger.exception("Unable to access Pinecone index '%s'", self._index_name)
            raise RuntimeError(
                "Failed to initialise Pinecone index. Ensure the index exists and credentials are correct."
            ) from exc

    def _fetch_index_dimension(self) -> int | None:
        try:
            description = self._client.describe_index(self._index_name)
        except Exception:  # pragma: no cover - best-effort log
            logger.warning("Unable to describe Pinecone index '%s' to determine dimension.", self._index_name)
            return None

        # Different SDK versions may return objects or dicts.
        if isinstance(description, dict):
            return description.get("dimension")
        return getattr(description, "dimension", None)

    def _normalize_vectors(self, items: Sequence[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not items or not self.dimension:
            return list(items)

        normalized: List[Dict[str, Any]] = []
        for item in items:
            values = list(item.get("values") or [])
            if not values:
                continue
            if len(values) == self.dimension:
                normalized.append(item)
                continue

            if len(values) > self.dimension:
                adjusted = values[: self.dimension]
            else:
                padding = [0.0] * (self.dimension - len(values))
                adjusted = values + padding

            normalized.append({**item, "values": adjusted})

        return normalized

    def upsert(self, items: Sequence[Dict[str, Any]]) -> None:
        if not items:
            return
        prepared = self._normalize_vectors(items)
        if not prepared:
            return
        self._index.upsert(vectors=prepared, namespace=self.namespace)

    def delete_document(self, document_id: str) -> None:
        if not document_id:
            return
        try:
            self._index.delete(
                namespace=self.namespace,
                filter={"document_id": document_id},
            )
        except Exception as exc:  # pragma: no cover - depends on remote state
            logger.exception("Unable to delete document %s from Pinecone", document_id)
            raise RuntimeError("Failed to delete document from vector index") from exc
