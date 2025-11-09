from __future__ import annotations

import pytest

from clients.database.chat_repository import InMemoryChatRepository
from clients.ingestion import IngestionResult
from clients.llm.service import LLMService
from clients.llm.settings import Settings


def _settings_with_pinecone() -> Settings:
    return Settings(
        openrouter_api_key="test-key",
        openrouter_base_url="http://localhost",
        model_name="test-model",
        request_timeout_seconds=5,
        telemetry_enabled=False,
        telemetry_sample_rate=0.0,
        friction_attempts_required=1,
        friction_min_words=1,
        turn_classifier_enabled=False,
        turn_classifier_model="test-model",
        turn_classifier_temperature=0.0,
        turn_classifier_timeout_seconds=5,
        embedding_model_name="text-embedding-3-large",
        pinecone_api_key="pcn-test",
        pinecone_index_name="test-index",
        pinecone_environment=None,
        pinecone_namespace="test-namespace",
    )


@pytest.mark.asyncio
async def test_ingest_upload_merges_metadata(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = _settings_with_pinecone()
    service = LLMService(settings, repository=InMemoryChatRepository())

    captured: dict[str, object] = {}

    class StubPipeline:
        async def ingest(self, **kwargs: object) -> IngestionResult:
            captured.update(kwargs)
            return IngestionResult(
                document_id=kwargs["document_id"],
                slide_count=3,
                chunk_count=7,
                namespace="test-namespace",
            )

    monkeypatch.setattr(service, "_get_ingestion_pipeline", lambda: StubPipeline())

    result = await service.ingest_upload(
        session_id="SESSION-123",
        file_bytes=b"binary-data",
        filename="Week 1 Intro.pptx",
        metadata={"course": "math"},
    )

    assert captured["metadata"] == {
        "course": "math",
        "session_id": "SESSION-123",
        "source_filename": "Week 1 Intro.pptx",
    }
    assert captured["document_id"] == result.document_id
    assert result.chunk_count == 7
    assert result.slide_count == 3
    assert result.namespace == "test-namespace"


def test_get_ingestion_pipeline_cached(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = _settings_with_pinecone()
    service = LLMService(settings, repository=InMemoryChatRepository())

    created: list[object] = []

    def _fake_pipeline(_settings: Settings) -> object:
        instance = object()
        created.append(instance)
        return instance

    monkeypatch.setattr("clients.llm.service.SlideIngestionPipeline", _fake_pipeline)

    first = service._get_ingestion_pipeline()
    second = service._get_ingestion_pipeline()

    assert first is second
    assert len(created) == 1


def test_get_ingestion_pipeline_wraps_runtime_error(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = _settings_with_pinecone()
    service = LLMService(settings, repository=InMemoryChatRepository())

    def _boom(_settings: Settings) -> object:
        raise RuntimeError("configure Pinecone")

    monkeypatch.setattr("clients.llm.service.SlideIngestionPipeline", _boom)

    with pytest.raises(RuntimeError, match="configure Pinecone"):
        service._get_ingestion_pipeline()


def test_derive_document_id_slugifies() -> None:
    slug = LLMService._derive_document_id(filename="Week 1 Intro!.pptx", session_id="Session ABC")
    assert slug.startswith("week-1-intro-session-abc")
    assert "!" not in slug
