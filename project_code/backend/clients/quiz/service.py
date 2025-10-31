from __future__ import annotations

import logging
import uuid
from dataclasses import replace
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

from clients.database.quiz_repository import (
    DifficultyLevel,
    InMemoryQuizRepository,
    QuizAttemptRecord,
    QuizDefinitionRecord,
    QuizMode,
    QuizQuestionRecord,
    QuizRepository,
    QuizSessionRecord,
)
from .generator import GeneratedQuestion, QuizQuestionGenerationError, QuizQuestionGenerator
from .settings import QuizSettings, get_quiz_settings

logger = logging.getLogger(__name__)

DifficultySequence: List[DifficultyLevel] = ["easy", "medium", "hard"]
DifficultyRank: Dict[DifficultyLevel, int] = {level: idx for idx, level in enumerate(DifficultySequence)}


class QuizDefinitionNotFoundError(RuntimeError):
    pass


class QuizSessionNotFoundError(RuntimeError):
    pass


class QuizSessionConflictError(RuntimeError):
    pass


class QuizSessionClosedError(RuntimeError):
    def __init__(self, message: str, *, status: str) -> None:
        super().__init__(message)
        self.status = status


class QuizQuestionNotFoundError(RuntimeError):
    pass


class QuizGenerationError(RuntimeError):
    pass


class QuizService:
    """Coordinates quiz lifecycle, question generation, and grading with shared question banks."""

    def __init__(
        self,
        repository: Optional[QuizRepository] = None,
        settings: Optional[QuizSettings] = None,
        generator: Optional[QuizQuestionGenerator] = None,
    ) -> None:
        self._repository: QuizRepository = repository or self._select_repository()
        self._settings: QuizSettings = settings or get_quiz_settings()
        self._increase_threshold = max(self._settings.practice_increase_streak, 1)
        self._decrease_threshold = max(self._settings.practice_decrease_streak, 1)
        self._generator = generator or self._select_generator()

    # ------------------------------------------------------------------
    # Quiz definition management
    # ------------------------------------------------------------------
    def upsert_quiz_definition(
        self,
        *,
        quiz_id: str,
        name: Optional[str],
        topics: List[str],
        default_mode: QuizMode,
        initial_difficulty: DifficultyLevel,
        assessment_num_questions: Optional[int],
        assessment_time_limit_minutes: Optional[int],
        assessment_max_attempts: Optional[int],
    ) -> QuizDefinitionRecord:
        cleaned_topics = [topic.strip() for topic in topics if topic and topic.strip()]
        if not cleaned_topics:
            raise QuizGenerationError("Quiz definitions must include at least one topic.")

        if default_mode not in ("assessment", "practice"):
            raise QuizGenerationError("Unsupported default mode.")

        existing = self._repository.load_quiz_definition(quiz_id)
        created_at = existing.created_at if existing else datetime.now(timezone.utc)
        record = QuizDefinitionRecord(
            quiz_id=quiz_id,
            name=name,
            topics=cleaned_topics,
            default_mode=default_mode,
            initial_difficulty=initial_difficulty,
            assessment_num_questions=assessment_num_questions,
            assessment_time_limit_minutes=assessment_time_limit_minutes,
            assessment_max_attempts=assessment_max_attempts,
            created_at=created_at,
            updated_at=datetime.now(timezone.utc),
        )
        self._repository.save_quiz_definition(record)
        return record

    def get_quiz_definition(self, quiz_id: str) -> QuizDefinitionRecord:
        definition = self._repository.load_quiz_definition(quiz_id)
        if definition is None:
            raise QuizDefinitionNotFoundError(f"Quiz {quiz_id} not found.")
        return definition

    # ------------------------------------------------------------------
    # Session lifecycle
    # ------------------------------------------------------------------
    def start_session(
        self,
        *,
        session_id: str,
        quiz_id: str,
        user_id: str,
        mode: Optional[QuizMode] = None,
        initial_difficulty: Optional[DifficultyLevel] = None,
    ) -> QuizSessionRecord:
        existing = self._repository.load_session(session_id)
        if existing and existing.status == "in_progress":
            raise QuizSessionConflictError("A quiz session with this identifier is already in progress.")

        definition = self.get_quiz_definition(quiz_id)

        selected_mode = mode or definition.default_mode
        if selected_mode not in ("assessment", "practice"):
            raise QuizGenerationError("Unsupported quiz mode requested.")

        difficulty = initial_difficulty or definition.initial_difficulty
        now = datetime.now(timezone.utc)
        deadline = None
        if selected_mode == "assessment":
            if definition.assessment_num_questions is None:
                raise QuizGenerationError(
                    "Quiz definition is missing an assessment question count."
                )
            if definition.assessment_time_limit_minutes:
                deadline = now + timedelta(minutes=definition.assessment_time_limit_minutes)

        record = QuizSessionRecord(
            session_id=session_id,
            quiz_id=quiz_id,
            user_id=user_id,
            mode=selected_mode,
            status="in_progress",
            current_difficulty=difficulty,
            correct_streak=0,
            incorrect_streak=0,
            attempts_used=0,
            topics=definition.topics,
            asked_question_ids=[],
            active_question_id=None,
            active_question_served_at=None,
            started_at=now,
            completed_at=None,
            deadline=deadline,
            attempts=[],
        )
        self._repository.save_session(record)
        return record

    def get_next_question(self, session_id: str) -> QuizQuestionRecord:
        record = self._load_session(session_id)
        record = self._enforce_time_constraints(record)

        if record.status != "in_progress":
            raise QuizSessionClosedError("Quiz session is no longer active.", status=record.status)

        if record.active_question_id:
            existing = self._repository.get_quiz_question(record.active_question_id)
            if existing is not None:
                return existing
            logger.warning(
                "Active question %s missing from repository; generating replacement.",
                record.active_question_id,
            )
            record = replace(record, active_question_id=None, active_question_served_at=None)

        definition = self.get_quiz_definition(record.quiz_id)
        question_bank = self._repository.list_quiz_questions(record.quiz_id)
        seen = set(record.asked_question_ids)

        selected = None
        for question in question_bank:
            if question.question_id not in seen:
                selected = question
                break

        if selected is None:
            selected = self._create_question(record, definition, question_bank)

        now = datetime.now(timezone.utc)
        updated_record = replace(
            record,
            asked_question_ids=[*record.asked_question_ids, selected.question_id],
            active_question_id=selected.question_id,
            active_question_served_at=now,
        )
        self._repository.save_session(updated_record)
        return selected

    def submit_answer(
        self,
        *,
        session_id: str,
        question_id: str,
        selected_answer: str,
    ) -> Dict[str, object]:
        record = self._load_session(session_id)
        record = self._enforce_time_constraints(record)

        if record.status != "in_progress":
            raise QuizSessionClosedError("Quiz session is no longer active.", status=record.status)

        question = self._repository.get_quiz_question(question_id)
        if question is None:
            raise QuizQuestionNotFoundError("Question not found in the shared bank.")

        already_answered = any(attempt.question_id == question_id for attempt in record.attempts)
        if already_answered:
            raise QuizQuestionNotFoundError("This question has already been answered.")

        now = datetime.now(timezone.utc)
        is_correct = selected_answer == question.correct_answer
        rationale = (
            question.rationale if is_correct else question.incorrect_rationales.get(selected_answer)
        )

        response_ms = None
        presented_at = record.active_question_served_at
        if presented_at is not None:
            response_ms = max(0, int((now - presented_at).total_seconds() * 1000))

        attempt = QuizAttemptRecord(
            question_id=question.question_id,
            selected_answer=selected_answer,
            is_correct=is_correct,
            submitted_at=now,
            response_ms=response_ms,
            rationale=rationale,
            presented_at=presented_at,
        )

        attempts = [*record.attempts, attempt]
        correct_streak = record.correct_streak + 1 if is_correct else 0
        incorrect_streak = record.incorrect_streak + 1 if not is_correct else 0
        attempts_used = record.attempts_used + 1
        current_difficulty = record.current_difficulty

        if record.mode == "practice":
            adapted_difficulty = self._adapt_difficulty(current_difficulty, correct_streak, incorrect_streak)
            if adapted_difficulty != current_difficulty:
                if DifficultyRank[adapted_difficulty] > DifficultyRank[current_difficulty]:
                    correct_streak = 0
                else:
                    incorrect_streak = 0
            current_difficulty = adapted_difficulty
            if is_correct:
                incorrect_streak = 0
            else:
                correct_streak = 0

        updated_record = replace(
            record,
            attempts=attempts,
            attempts_used=attempts_used,
            correct_streak=correct_streak,
            incorrect_streak=incorrect_streak,
            current_difficulty=current_difficulty,
            active_question_id=None,
            active_question_served_at=None,
        )

        # Assessment termination checks
        if record.mode == "assessment":
            definition = self.get_quiz_definition(record.quiz_id)
            completed = False
            if definition.assessment_num_questions and len(attempts) >= definition.assessment_num_questions:
                updated_record = self._mark_completed(updated_record, status="completed")
                completed = True
            if (
                definition.assessment_max_attempts is not None
                and updated_record.attempts_used >= definition.assessment_max_attempts
                and updated_record.status == "in_progress"
            ):
                updated_record = self._mark_completed(updated_record, status="completed")
                completed = True
            if not completed and updated_record.deadline and datetime.now(timezone.utc) > updated_record.deadline:
                updated_record = self._mark_completed(updated_record, status="timed_out")

        self._repository.save_session(updated_record)

        response: Dict[str, object] = {
            "question_id": question.question_id,
            "is_correct": is_correct,
            "selected_answer": selected_answer,
            "correct_answer": question.correct_answer,
            "rationale": rationale or question.rationale,
            "topic": question.topic,
            "difficulty": question.difficulty,
            "session_completed": updated_record.status != "in_progress",
            "current_difficulty": updated_record.current_difficulty,
            "response_ms": response_ms,
        }
        if response["session_completed"]:
            response["summary"] = self._build_summary(updated_record)
        return response

    def end_session(self, session_id: str) -> Dict[str, object]:
        record = self._load_session(session_id)
        if record.status == "in_progress":
            record = self._mark_completed(record, status="completed")
            self._repository.save_session(record)
        return self._build_summary(record)

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _create_question(
        self,
        session: QuizSessionRecord,
        definition: QuizDefinitionRecord,
        existing_questions: List[QuizQuestionRecord],
    ) -> QuizQuestionRecord:
        order = len(existing_questions) + 1
        topic = definition.topics[(order - 1) % len(definition.topics)]
        difficulty = session.current_difficulty

        generated: Optional[GeneratedQuestion] = None
        if self._generator is not None:
            try:
                generated = self._generator.generate(topic=topic, difficulty=difficulty, order=order)
            except QuizQuestionGenerationError as exc:
                logger.warning(
                    "Quiz question generation failed for quiz %s (topic=%s, difficulty=%s): %s",
                    session.quiz_id,
                    topic,
                    difficulty,
                    exc,
                )
            except Exception:  # pragma: no cover - defensive fallback
                logger.exception(
                    "Unexpected error while generating quiz question for quiz %s (topic=%s)",
                    session.quiz_id,
                    topic,
                )

        question_id = str(uuid.uuid4())
        if generated:
            prompt = generated.prompt
            choices = generated.choices
            correct_answer = generated.correct_answer
            rationale = generated.rationale
            incorrect_rationales = generated.incorrect_rationales
        else:
            prompt = f"Which option best represents a key idea from the topic '{topic}'?"
            correct_answer = f"The option summarizing {topic} fundamentals."
            distractors = [
                f"An idea mostly unrelated to {topic}.",
                f"A misconception commonly seen about {topic}.",
                f"A detail that only loosely connects to {topic}.",
            ]
            choices = [correct_answer, *distractors]
            rationale = f"The correct answer highlights the fundamental concept within {topic}."
            incorrect_rationales = {
                distractors[0]: f"This option does not focus on {topic} and goes off-topic.",
                distractors[1]: f"This reflects a common misunderstanding of {topic}.",
                distractors[2]: f"This detail is tangential and does not capture the core of {topic}.",
            }

        record = QuizQuestionRecord(
            quiz_id=session.quiz_id,
            question_id=question_id,
            prompt=prompt,
            choices=choices,
            correct_answer=correct_answer,
            rationale=rationale,
            incorrect_rationales=incorrect_rationales,
            topic=topic,
            difficulty=difficulty,
            order=order,
            generated_at=datetime.now(timezone.utc),
        )
        self._repository.save_quiz_question(record)
        return record

    def _adapt_difficulty(
        self,
        current: DifficultyLevel,
        correct_streak: int,
        incorrect_streak: int,
    ) -> DifficultyLevel:
        index = DifficultyRank[current]
        if correct_streak >= self._increase_threshold and index < len(DifficultySequence) - 1:
            return DifficultySequence[index + 1]
        if incorrect_streak >= self._decrease_threshold and index > 0:
            return DifficultySequence[index - 1]
        return current

    def _enforce_time_constraints(self, record: QuizSessionRecord) -> QuizSessionRecord:
        if record.mode != "assessment":
            return record
        if record.status != "in_progress":
            return record
        if record.deadline and datetime.now(timezone.utc) > record.deadline:
            record = self._mark_completed(record, status="timed_out")
            self._repository.save_session(record)
        return record

    def _mark_completed(self, record: QuizSessionRecord, *, status: str) -> QuizSessionRecord:
        return replace(
            record,
            status=status,  # type: ignore[arg-type]
            completed_at=datetime.now(timezone.utc),
            active_question_id=None,
            active_question_served_at=None,
        )

    def _build_summary(self, record: QuizSessionRecord) -> Dict[str, object]:
        total_questions = len(record.attempts)
        correct_answers = sum(1 for attempt in record.attempts if attempt.is_correct)
        accuracy = (correct_answers / total_questions) if total_questions else 0.0
        total_time_ms = sum(attempt.response_ms or 0 for attempt in record.attempts)

        per_topic: Dict[str, Dict[str, int]] = {}
        for attempt in record.attempts:
            question = self._repository.get_quiz_question(attempt.question_id)
            topic = question.topic if question else "general"
            stats = per_topic.setdefault(topic, {"attempted": 0, "correct": 0})
            stats["attempted"] += 1
            if attempt.is_correct:
                stats["correct"] += 1

        return {
            "session_id": record.session_id,
            "quiz_id": record.quiz_id,
            "user_id": record.user_id,
            "mode": record.mode,
            "status": record.status,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "accuracy": round(accuracy, 2),
            "topics": per_topic,
            "total_time_ms": total_time_ms,
            "started_at": record.started_at,
            "completed_at": record.completed_at,
        }

    def _load_session(self, session_id: str) -> QuizSessionRecord:
        record = self._repository.load_session(session_id)
        if record is None:
            raise QuizSessionNotFoundError("Quiz session not found.")
        return record

    def _select_repository(self) -> QuizRepository:
        try:
            from clients.database.quiz_repository import FirestoreQuizRepository

            return FirestoreQuizRepository()
        except Exception:  # pragma: no cover - fallback for local dev
            logger.warning("Firestore unavailable; using in-memory quiz repository.")
            return InMemoryQuizRepository()

    def _select_generator(self) -> Optional[QuizQuestionGenerator]:
        try:
            return QuizQuestionGenerator()
        except Exception as exc:  # pragma: no cover - configuration fallback
            logger.warning(
                "Unable to initialise LLM quiz question generator; using static template fallback. Reason: %s",
                exc,
            )
            return None


_quiz_service: Optional[QuizService] = None


def get_quiz_service() -> QuizService:
    global _quiz_service
    if _quiz_service is None:
        _quiz_service = QuizService()
    return _quiz_service
