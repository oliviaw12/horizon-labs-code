from __future__ import annotations

import json
from typing import Any, Dict, List

import pytest

from clients.ingestion.pipeline import IngestionResult
from clients.llm.service import LLMService


@pytest.mark.asyncio
async def test_ingest_upload_endpoint_returns_ingestion_summary(
    async_client,
    test_llm_service: LLMService,
) -> None:
    class StubPipeline:
        def __init__(self) -> None:
            self.calls: List[Dict[str, Any]] = []

        async def ingest(self, **kwargs: Any) -> IngestionResult:
            self.calls.append(kwargs)
            return IngestionResult(
                document_id=kwargs["document_id"],
                slide_count=4,
                chunk_count=10,
                namespace="slides",
            )

    stub = StubPipeline()
    test_llm_service._ingestion_pipeline = stub  # type: ignore[attr-defined]

    metadata = json.dumps({"document_id": "deck-123", "course": "math"})

    response = await async_client.post(
        "/ingest/upload",
        data={"session_id": "session-1", "metadata": metadata},
        files={"file": ("Lesson.pptx", b"binary-data", "application/vnd.ms-powerpoint")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "indexed"
    assert payload["document_id"] == "deck-123"
    assert payload["chunk_count"] == 10
    assert stub.calls, "pipeline was not invoked"
    call = stub.calls[0]
    assert call["filename"] == "Lesson.pptx"
    assert call["metadata"]["session_id"] == "session-1"
    assert call["metadata"]["document_id"] == "deck-123"
