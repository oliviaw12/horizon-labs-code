from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Iterable, List, Literal, Optional, Protocol

try:  # pragma: no cover - optional dependency
    from google.cloud import firestore  # type: ignore[import]
except Exception:  # pragma: no cover - optional dependency missing
    firestore = None  # type: ignore[assignment]

from .firebase import get_firestore

DifficultyLevel = Literal["easy", "medium", "hard"]
QuizMode = Literal["assessment", "practice"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _parse_datetime(raw: Optional[str]) -> datetime:
    if not raw:
        return _now()
    try:
        return datetime.fromisoformat(raw)
    except ValueError:
        return _now()


@dataclass(frozen=True)
class QuizDefinitionRecord:
    """Instructor-authored quiz configuration shared by all sessions."""

    quiz_id: str
    name: Optional[str]
    topics: List[str]
    default_mode: QuizMode
    initial_difficulty: DifficultyLevel
    assessment_num_questions: Optional[int]
    assessment_time_limit_minutes: Optional[int]
    assessment_max_attempts: Optional[int]
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)

    def to_dict(self) -> Dict[str, object]:
        return {
            "quiz_id": self.quiz_id,
            "name": self.name,
            "topics": self.topics,
            "default_mode": self.default_mode,
            "initial_difficulty": self.initial_difficulty,
            "assessment_num_questions": self.assessment_num_questions,
            "assessment_time_limit_minutes": self.assessment_time_limit_minutes,
            "assessment_max_attempts": self.assessment_max_attempts,
            "created_at": self.created_at.isoformat(),
            "updated_at": _now().isoformat(),
        }

    @staticmethod
    def from_dict(payload: Dict[str, object]) -> "QuizDefinitionRecord":
        return QuizDefinitionRecord(
            quiz_id=str(payload.get("quiz_id", "")),
            name=payload.get("name"),
            topics=list(payload.get("topics", []) or []),
            default_mode=str(payload.get("default_mode", "practice")),  # type: ignore[arg-type]
            initial_difficulty=str(payload.get("initial_difficulty", "medium")),  # type: ignore[arg-type]
            assessment_num_questions=int(payload["assessment_num_questions"]) if payload.get("assessment_num_questions") is not None else None,
            assessment_time_limit_minutes=int(payload["assessment_time_limit_minutes"]) if payload.get("assessment_time_limit_minutes") is not None else None,
            assessment_max_attempts=int(payload["assessment_max_attempts"]) if payload.get("assessment_max_attempts") is not None else None,
            created_at=_parse_datetime(payload.get("created_at")),  # type: ignore[arg-type]
            updated_at=_parse_datetime(payload.get("updated_at")),  # type: ignore[arg-type]
        )


@dataclass(frozen=True)
class QuizQuestionRecord:
    """Reusable question stored for a quiz definition."""

    quiz_id: str
    question_id: str
    prompt: str
    choices: List[str]
    correct_answer: str
    rationale: str
    incorrect_rationales: Dict[str, str]
    topic: str
    difficulty: DifficultyLevel
    order: int
    generated_at: datetime = field(default_factory=_now)

    def to_dict(self) -> Dict[str, object]:
        return {
            "quiz_id": self.quiz_id,
            "question_id": self.question_id,
            "prompt": self.prompt,
            "choices": self.choices,
            "correct_answer": self.correct_answer,
            "rationale": self.rationale,
            "incorrect_rationales": self.incorrect_rationales,
            "topic": self.topic,
            "difficulty": self.difficulty,
            "order": self.order,
            "generated_at": self.generated_at.isoformat(),
        }

    @staticmethod
    def from_dict(payload: Dict[str, object]) -> "QuizQuestionRecord":
        return QuizQuestionRecord(
            quiz_id=str(payload.get("quiz_id", "")),
            question_id=str(payload.get("question_id", "")),
            prompt=str(payload.get("prompt", "")),
            choices=list(payload.get("choices", []) or []),
            correct_answer=str(payload.get("correct_answer", "")),
            rationale=str(payload.get("rationale", "")),
            incorrect_rationales=dict(payload.get("incorrect_rationales", {}) or {}),
            topic=str(payload.get("topic", "")),
            difficulty=str(payload.get("difficulty", "medium")),  # type: ignore[arg-type]
            order=int(payload.get("order", 0)),
            generated_at=_parse_datetime(payload.get("generated_at")),  # type: ignore[arg-type]
        )


@dataclass(frozen=True)
class QuizAttemptRecord:
    """Learner answer for a specific question."""

    question_id: str
    selected_answer: str
    is_correct: bool
    submitted_at: datetime
    response_ms: Optional[int] = None
    rationale: Optional[str] = None
    presented_at: Optional[datetime] = None

    def to_dict(self) -> Dict[str, object]:
        payload: Dict[str, object] = {
            "question_id": self.question_id,
            "selected_answer": self.selected_answer,
            "is_correct": self.is_correct,
            "submitted_at": self.submitted_at.isoformat(),
        }
        if self.response_ms is not None:
            payload["response_ms"] = self.response_ms
        if self.rationale is not None:
            payload["rationale"] = self.rationale
        if self.presented_at is not None:
            payload["presented_at"] = self.presented_at.isoformat()
        return payload

    @staticmethod
    def from_dict(payload: Dict[str, object]) -> "QuizAttemptRecord":
        return QuizAttemptRecord(
            question_id=str(payload.get("question_id", "")),
            selected_answer=str(payload.get("selected_answer", "")),
            is_correct=bool(payload.get("is_correct", False)),
            submitted_at=_parse_datetime(payload.get("submitted_at")),  # type: ignore[arg-type]
            response_ms=int(payload["response_ms"]) if payload.get("response_ms") is not None else None,
            rationale=str(payload.get("rationale")) if payload.get("rationale") is not None else None,
            presented_at=_parse_datetime(payload.get("presented_at")) if payload.get("presented_at") else None,  # type: ignore[arg-type]
        )


@dataclass(frozen=True)
class QuizSessionRecord:
    """Per-learner session state referencing a shared quiz definition."""

    session_id: str
    quiz_id: str
    user_id: str
    mode: QuizMode
    status: Literal["in_progress", "completed", "timed_out"]
    current_difficulty: DifficultyLevel
    correct_streak: int
    incorrect_streak: int
    attempts_used: int
    topics: List[str]
    asked_question_ids: List[str]
    active_question_id: Optional[str]
    active_question_served_at: Optional[datetime]
    started_at: datetime
    completed_at: Optional[datetime]
    deadline: Optional[datetime]
    attempts: List[QuizAttemptRecord] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        payload: Dict[str, object] = {
            "session_id": self.session_id,
            "quiz_id": self.quiz_id,
            "user_id": self.user_id,
            "mode": self.mode,
            "status": self.status,
            "current_difficulty": self.current_difficulty,
            "correct_streak": self.correct_streak,
            "incorrect_streak": self.incorrect_streak,
            "attempts_used": self.attempts_used,
            "topics": self.topics,
            "asked_question_ids": self.asked_question_ids,
            "active_question_id": self.active_question_id,
            "started_at": self.started_at.isoformat(),
            "attempts": [attempt.to_dict() for attempt in self.attempts],
        }
        if self.active_question_served_at is not None:
            payload["active_question_served_at"] = self.active_question_served_at.isoformat()
        if self.completed_at is not None:
            payload["completed_at"] = self.completed_at.isoformat()
        if self.deadline is not None:
            payload["deadline"] = self.deadline.isoformat()
        return payload

    @staticmethod
    def from_dict(payload: Dict[str, object]) -> "QuizSessionRecord":
        attempts_payload = payload.get("attempts", []) or []
        return QuizSessionRecord(
            session_id=str(payload.get("session_id", "")),
            quiz_id=str(payload.get("quiz_id", "")),
            user_id=str(payload.get("user_id", "")),
            mode=str(payload.get("mode", "practice")),  # type: ignore[arg-type]
            status=str(payload.get("status", "in_progress")),  # type: ignore[arg-type]
            current_difficulty=str(payload.get("current_difficulty", "medium")),  # type: ignore[arg-type]
            correct_streak=int(payload.get("correct_streak", 0)),
            incorrect_streak=int(payload.get("incorrect_streak", 0)),
            attempts_used=int(payload.get("attempts_used", 0)),
            topics=list(payload.get("topics", []) or []),
            asked_question_ids=list(payload.get("asked_question_ids", []) or []),
            active_question_id=payload.get("active_question_id"),
            active_question_served_at=_parse_datetime(payload.get("active_question_served_at")) if payload.get("active_question_served_at") else None,  # type: ignore[arg-type]
            started_at=_parse_datetime(payload.get("started_at")),  # type: ignore[arg-type]
            completed_at=_parse_datetime(payload.get("completed_at")) if payload.get("completed_at") else None,  # type: ignore[arg-type]
            deadline=_parse_datetime(payload.get("deadline")) if payload.get("deadline") else None,  # type: ignore[arg-type]
            attempts=[QuizAttemptRecord.from_dict(item) for item in attempts_payload if isinstance(item, dict)],
        )


class QuizRepository(Protocol):
    """Persistence interface for quiz definitions, questions, and sessions."""

    # Quiz definitions
    def load_quiz_definition(self, quiz_id: str) -> Optional[QuizDefinitionRecord]:
        ...

    def save_quiz_definition(self, record: QuizDefinitionRecord) -> None:
        ...

    # Question bank
    def list_quiz_questions(self, quiz_id: str) -> List[QuizQuestionRecord]:
        ...

    def save_quiz_question(self, record: QuizQuestionRecord) -> None:
        ...

    def get_quiz_question(self, question_id: str) -> Optional[QuizQuestionRecord]:
        ...

    # Learner sessions
    def load_session(self, session_id: str) -> Optional[QuizSessionRecord]:
        ...

    def save_session(self, record: QuizSessionRecord) -> None:
        ...


class FirestoreQuizRepository:
    """Firestore-backed implementation."""

    def __init__(self, *, collection_name: str = "quiz_data") -> None:
        if not _firestore_available():
            raise RuntimeError(
                "google-cloud-firestore is required for FirestoreQuizRepository. Install the package "
                "and configure credentials, or use InMemoryQuizRepository instead."
            )
        client = get_firestore()
        self._definitions = client.collection(f"{collection_name}_definitions")
        self._questions = client.collection(f"{collection_name}_questions")
        self._sessions = client.collection(f"{collection_name}_sessions")

    def load_quiz_definition(self, quiz_id: str) -> Optional[QuizDefinitionRecord]:
        document = self._definitions.document(quiz_id).get()
        if not document.exists:
            return None
        data = document.to_dict() or {}
        return QuizDefinitionRecord.from_dict(data)

    def save_quiz_definition(self, record: QuizDefinitionRecord) -> None:
        self._definitions.document(record.quiz_id).set(record.to_dict(), merge=True)

    def list_quiz_questions(self, quiz_id: str) -> List[QuizQuestionRecord]:
        questions: List[QuizQuestionRecord] = []
        for doc in self._questions.where("quiz_id", "==", quiz_id).stream():
            data = doc.to_dict() or {}
            questions.append(QuizQuestionRecord.from_dict(data))
        questions.sort(key=lambda item: (item.order, item.generated_at))
        return questions

    def save_quiz_question(self, record: QuizQuestionRecord) -> None:
        self._questions.document(record.question_id).set(record.to_dict(), merge=True)

    def get_quiz_question(self, question_id: str) -> Optional[QuizQuestionRecord]:
        document = self._questions.document(question_id).get()
        if not document.exists:
            return None
        return QuizQuestionRecord.from_dict(document.to_dict() or {})

    def load_session(self, session_id: str) -> Optional[QuizSessionRecord]:
        document = self._sessions.document(session_id).get()
        if not document.exists:
            return None
        data = document.to_dict() or {}
        return QuizSessionRecord.from_dict(data)

    def save_session(self, record: QuizSessionRecord) -> None:
        self._sessions.document(record.session_id).set(record.to_dict(), merge=True)


class InMemoryQuizRepository:
    """In-process repository useful for local development and tests."""

    def __init__(self) -> None:
        self._definitions: Dict[str, Dict[str, object]] = {}
        self._questions: Dict[str, Dict[str, object]] = {}
        self._sessions: Dict[str, Dict[str, object]] = {}

    def load_quiz_definition(self, quiz_id: str) -> Optional[QuizDefinitionRecord]:
        payload = self._definitions.get(quiz_id)
        if not payload:
            return None
        return QuizDefinitionRecord.from_dict(payload)

    def save_quiz_definition(self, record: QuizDefinitionRecord) -> None:
        self._definitions[record.quiz_id] = record.to_dict()

    def list_quiz_questions(self, quiz_id: str) -> List[QuizQuestionRecord]:
        questions: List[QuizQuestionRecord] = []
        for payload in self._questions.values():
            if payload.get("quiz_id") == quiz_id:
                questions.append(QuizQuestionRecord.from_dict(payload))
        questions.sort(key=lambda item: (item.order, item.generated_at))
        return questions

    def save_quiz_question(self, record: QuizQuestionRecord) -> None:
        self._questions[record.question_id] = record.to_dict()

    def get_quiz_question(self, question_id: str) -> Optional[QuizQuestionRecord]:
        payload = self._questions.get(question_id)
        if not payload:
            return None
        return QuizQuestionRecord.from_dict(payload)

    def load_session(self, session_id: str) -> Optional[QuizSessionRecord]:
        payload = self._sessions.get(session_id)
        if not payload:
            return None
        return QuizSessionRecord.from_dict(payload)

    def save_session(self, record: QuizSessionRecord) -> None:
        self._sessions[record.session_id] = record.to_dict()


def _firestore_available() -> bool:
    return firestore is not None
