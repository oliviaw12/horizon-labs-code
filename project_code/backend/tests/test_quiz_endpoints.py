from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from clients.database.quiz_repository import (
    QuizAttemptRecord,
    QuizDefinitionRecord,
    QuizQuestionRecord,
    QuizSessionRecord,
)


async def _create_quiz_definition(async_client, quiz_id: str, topics: list[str]) -> None:
    payload = {
        "quiz_id": quiz_id,
        "name": f"{quiz_id}-name",
        "topics": topics,
        "default_mode": "practice",
        "initial_difficulty": "medium",
        "assessment_num_questions": 2,
        "assessment_time_limit_minutes": 5,
        "assessment_max_attempts": 3,
    }
    response = await async_client.post("/quiz/definitions", json=payload)
    assert response.status_code == 200


@pytest.mark.anyio
async def test_cannot_start_without_definition(async_client):
    payload = {
        "session_id": "missing-def-session",
        "quiz_id": "missing-quiz",
        "user_id": "user-1",
    }
    response = await async_client.post("/quiz/session/start", json=payload)
    assert response.status_code == 404


@pytest.mark.anyio
async def test_assessment_quiz_flow(async_client):
    quiz_id = "algebra-quiz"
    await _create_quiz_definition(async_client, quiz_id, ["algebra"])

    session_id = "assessment-101"
    payload = {
        "session_id": session_id,
        "quiz_id": quiz_id,
        "user_id": "learner-1",
        "mode": "assessment",
        "initial_difficulty": "easy",
    }
    start_response = await async_client.post("/quiz/session/start", json=payload)
    assert start_response.status_code == 200
    body = start_response.json()
    assert body["status"] == "in_progress"
    assert body["mode"] == "assessment"
    assert body["quiz_id"] == quiz_id

    # First question
    question_response = await async_client.get(f"/quiz/session/{session_id}/next")
    assert question_response.status_code == 200
    question = question_response.json()
    answer_payload = {
        "question_id": question["question_id"],
        "selected_answer": question["choices"][0],
    }
    submit_response = await async_client.post(
        f"/quiz/session/{session_id}/answer",
        json=answer_payload,
    )
    assert submit_response.status_code == 200
    body = submit_response.json()
    assert body["is_correct"] is True
    assert body["session_completed"] is False

    # Second question completes the assessment (definition caps at 2 questions)
    second_question = await async_client.get(f"/quiz/session/{session_id}/next")
    assert second_question.status_code == 200
    question2 = second_question.json()
    submit_response_2 = await async_client.post(
        f"/quiz/session/{session_id}/answer",
        json={
            "question_id": question2["question_id"],
            "selected_answer": question2["choices"][0],
        },
    )
    assert submit_response_2.status_code == 200
    body2 = submit_response_2.json()
    assert body2["session_completed"] is True
    assert body2["summary"]["status"] in {"completed", "timed_out"}
    assert body2["summary"]["total_questions"] == 2

    # No more questions after completion
    closed_response = await async_client.get(f"/quiz/session/{session_id}/next")
    assert closed_response.status_code == 410


@pytest.mark.anyio
async def test_practice_adapts_difficulty(async_client):
    quiz_id = "loops-quiz"
    await _create_quiz_definition(async_client, quiz_id, ["loops"])

    session_id = "practice-55"
    payload = {
        "session_id": session_id,
        "quiz_id": quiz_id,
        "user_id": "learner-2",
        "mode": "practice",
        "initial_difficulty": "medium",
    }
    start_response = await async_client.post("/quiz/session/start", json=payload)
    assert start_response.status_code == 200
    assert start_response.json()["current_difficulty"] == "medium"

    # First correct answer keeps difficulty the same.
    question = await async_client.get(f"/quiz/session/{session_id}/next")
    q1 = question.json()
    result = await async_client.post(
        f"/quiz/session/{session_id}/answer",
        json={
            "question_id": q1["question_id"],
            "selected_answer": q1["choices"][0],
        },
    )
    assert result.status_code == 200
    assert result.json()["current_difficulty"] == "medium"

    # Second consecutive correct answer should increase difficulty.
    question2 = await async_client.get(f"/quiz/session/{session_id}/next")
    q2 = question2.json()
    result2 = await async_client.post(
        f"/quiz/session/{session_id}/answer",
        json={
            "question_id": q2["question_id"],
            "selected_answer": q2["choices"][0],
        },
    )
    assert result2.status_code == 200
    assert result2.json()["current_difficulty"] == "hard"
    assert result2.json()["session_completed"] is False


@pytest.mark.anyio
async def test_quiz_analytics_endpoint(async_client, quiz_repository):
    now = datetime(2024, 9, 1, 9, 0, tzinfo=timezone.utc)

    algebra_definition = QuizDefinitionRecord(
        quiz_id="quiz-algebra",
        name="Algebra Basics",
        topics=["functions", "derivatives"],
        default_mode="practice",
        initial_difficulty="medium",
        assessment_num_questions=None,
        assessment_time_limit_minutes=None,
        assessment_max_attempts=None,
    )
    geometry_definition = QuizDefinitionRecord(
        quiz_id="quiz-geometry",
        name="Geometry Essentials",
        topics=["triangles"],
        default_mode="practice",
        initial_difficulty="medium",
        assessment_num_questions=None,
        assessment_time_limit_minutes=None,
        assessment_max_attempts=None,
    )
    quiz_repository.save_quiz_definition(algebra_definition)
    quiz_repository.save_quiz_definition(geometry_definition)

    q1 = QuizQuestionRecord(
        quiz_id="quiz-algebra",
        question_id="q1",
        prompt="Algebra question 1",
        choices=["A", "B", "C", "D"],
        correct_answer="A",
        rationale="Because A is correct",
        incorrect_rationales={"B": "Not quite", "C": "Nope", "D": "Try again"},
        topic="functions",
        difficulty="medium",
        order=1,
    )
    q2 = QuizQuestionRecord(
        quiz_id="quiz-algebra",
        question_id="q2",
        prompt="Algebra question 2",
        choices=["A", "B", "C", "D"],
        correct_answer="C",
        rationale="Because C is correct",
        incorrect_rationales={"A": "No", "B": "No", "D": "No"},
        topic="derivatives",
        difficulty="hard",
        order=2,
    )
    q3 = QuizQuestionRecord(
        quiz_id="quiz-geometry",
        question_id="q3",
        prompt="Geometry question 1",
        choices=["A", "B", "C", "D"],
        correct_answer="B",
        rationale="Because B is correct",
        incorrect_rationales={"A": "Not correct", "C": "Not correct", "D": "Not correct"},
        topic="triangles",
        difficulty="easy",
        order=1,
    )
    quiz_repository.save_quiz_question(q1)
    quiz_repository.save_quiz_question(q2)
    quiz_repository.save_quiz_question(q3)

    algebra_session_attempts = [
        QuizAttemptRecord(
            question_id="q1",
            selected_answer="A",
            is_correct=True,
            submitted_at=now,
            response_ms=1200,
        ),
        QuizAttemptRecord(
            question_id="q2",
            selected_answer="A",
            is_correct=False,
            submitted_at=now + timedelta(minutes=2),
            response_ms=1500,
        ),
    ]
    algebra_session = QuizSessionRecord(
        session_id="session-a",
        quiz_id="quiz-algebra",
        user_id="alice",
        mode="practice",
        status="completed",
        current_difficulty="medium",
        correct_streak=0,
        incorrect_streak=1,
        attempts_used=len(algebra_session_attempts),
        topics=algebra_definition.topics,
        asked_question_ids=["q1", "q2"],
        active_question_id=None,
        active_question_served_at=None,
        started_at=now,
        completed_at=now + timedelta(minutes=5),
        deadline=None,
        attempts=algebra_session_attempts,
    )

    algebra_session_two_attempts = [
        QuizAttemptRecord(
            question_id="q1",
            selected_answer="A",
            is_correct=True,
            submitted_at=now + timedelta(days=1),
            response_ms=900,
        ),
    ]
    algebra_session_two = QuizSessionRecord(
        session_id="session-b",
        quiz_id="quiz-algebra",
        user_id="bob",
        mode="practice",
        status="completed",
        current_difficulty="medium",
        correct_streak=1,
        incorrect_streak=0,
        attempts_used=len(algebra_session_two_attempts),
        topics=algebra_definition.topics,
        asked_question_ids=["q1"],
        active_question_id=None,
        active_question_served_at=None,
        started_at=now + timedelta(days=1),
        completed_at=now + timedelta(days=1, minutes=3),
        deadline=None,
        attempts=algebra_session_two_attempts,
    )

    geometry_session_attempts = [
        QuizAttemptRecord(
            question_id="q3",
            selected_answer="C",
            is_correct=False,
            submitted_at=now + timedelta(days=2),
            response_ms=800,
        ),
    ]
    geometry_session = QuizSessionRecord(
        session_id="session-c",
        quiz_id="quiz-geometry",
        user_id="carol",
        mode="practice",
        status="completed",
        current_difficulty="medium",
        correct_streak=0,
        incorrect_streak=1,
        attempts_used=len(geometry_session_attempts),
        topics=geometry_definition.topics,
        asked_question_ids=["q3"],
        active_question_id=None,
        active_question_served_at=None,
        started_at=now + timedelta(days=2),
        completed_at=now + timedelta(days=2, minutes=2),
        deadline=None,
        attempts=geometry_session_attempts,
    )

    quiz_repository.save_session(algebra_session)
    quiz_repository.save_session(algebra_session_two)
    quiz_repository.save_session(geometry_session)

    response = await async_client.get("/analytics/quizzes")
    assert response.status_code == 200
    body = response.json()

    assert body["total_sessions"] == 3
    assert body["unique_learners"] == 3
    assert body["average_accuracy"] == 0.5
    assert body["average_questions"] == pytest.approx(1.33, rel=1e-2)
    assert body["average_response_ms"] == 1466

    quizzes = body["quizzes"]
    assert quizzes[0]["quiz_id"] == "quiz-algebra"
    assert quizzes[0]["total_sessions"] == 2
    assert quizzes[0]["completed_sessions"] == 2
    assert quizzes[0]["unique_learners"] == 2
    assert quizzes[0]["average_accuracy"] == 0.75
    assert quizzes[0]["average_questions"] == 1.5
    assert quizzes[0]["average_response_ms"] == 1800

    algebra_topics = {item["topic"]: item for item in quizzes[0]["topics"]}
    assert algebra_topics["functions"]["attempted"] == 2
    assert algebra_topics["functions"]["correct"] == 2
    assert algebra_topics["functions"]["accuracy"] == 1.0
    assert algebra_topics["derivatives"]["attempted"] == 1
    assert algebra_topics["derivatives"]["correct"] == 0
    assert algebra_topics["derivatives"]["accuracy"] == 0.0

    overall_topics = {item["topic"]: item for item in body["overall_topics"]}
    assert overall_topics["functions"]["attempted"] == 2
    assert overall_topics["functions"]["correct"] == 2
    assert overall_topics["derivatives"]["attempted"] == 1
    assert overall_topics["triangles"]["attempted"] == 1

    filtered = await async_client.get("/analytics/quizzes", params={"quiz_id": "quiz-geometry"})
    assert filtered.status_code == 200
    filtered_body = filtered.json()
    assert filtered_body["total_sessions"] == 1
    assert filtered_body["unique_learners"] == 1
    assert filtered_body["quizzes"][0]["quiz_id"] == "quiz-geometry"
    assert filtered_body["average_accuracy"] == 0.0
    assert filtered_body["average_questions"] == 1.0
    assert filtered_body["average_response_ms"] == 800
