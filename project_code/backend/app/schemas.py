from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class ChatStreamRequest(BaseModel):
    session_id: str = Field(..., description="Identifier for the chat session")
    message: str = Field(..., description="User's chat prompt")
    context: Optional[str] = Field(
        default=None, description="Optional context to ground the response"
    )
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Arbitrary key-value pairs forwarded to the prompt",
    )
    use_guidance: bool = Field(
        default=False,
        description="When true, request the guidance prompt for this turn (if unlocked)",
    )


class ChatResetRequest(BaseModel):
    session_id: str = Field(..., description="Identifier for the chat session to clear")


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"] = Field(..., description="Speaker of the message")
    content: str = Field(..., description="Human-readable message text")
    created_at: datetime = Field(..., description="Timestamp when the message was recorded")
    turn_classification: Optional[Literal["good", "needs_focusing"]] = Field(
        default=None,
        description="Classifier label assigned to the learner turn",
    )
    classification_rationale: Optional[str] = Field(
        default=None,
        description="Brief justification for the assigned turn classification",
    )


class ChatHistoryResponse(BaseModel):
    session_id: str = Field(..., description="Chat session identifier")
    messages: List[ChatMessage] = Field(default_factory=list, description="Ordered chat transcript")


class ChatSessionSummary(BaseModel):
    session_id: str = Field(..., description="Unique chat session identifier")
    updated_at: datetime = Field(..., description="When the session was last updated")
    message_count: int = Field(..., ge=0, description="Number of persisted user/assistant messages")


class ChatSessionListResponse(BaseModel):
    sessions: List[ChatSessionSummary] = Field(default_factory=list, description="Available chat sessions")


class QuizStreamRequest(BaseModel):
    session_id: str = Field(..., description="Identifier for the chat session")
    topic: str = Field(..., description="Subject area the quiz should cover")
    difficulty: Optional[str] = Field(
        default=None,
        description="Optional difficulty hint for the quiz generator",
    )
    num_questions: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of questions to request from the generator",
    )


QuizModeLiteral = Literal["assessment", "practice"]
QuizDifficultyLiteral = Literal["easy", "medium", "hard"]
QuizStatusLiteral = Literal["in_progress", "completed", "timed_out"]


class QuizDefinitionRequest(BaseModel):
    quiz_id: str = Field(..., description="Stable identifier chosen by the instructor")
    name: Optional[str] = Field(default=None, description="Human-friendly quiz name")
    topics: List[str] = Field(..., description="Topics or tags drawn from the source material")
    default_mode: QuizModeLiteral = Field(..., description="Default mode learners will use when starting sessions")
    initial_difficulty: QuizDifficultyLiteral = Field(
        default="medium",
        description="Difficulty level to seed new sessions",
    )
    assessment_num_questions: Optional[int] = Field(
        default=None,
        ge=1,
        le=200,
        description="Total questions served when running in assessment mode",
    )
    assessment_time_limit_minutes: Optional[int] = Field(
        default=None,
        ge=1,
        le=480,
        description="Time limit applied to assessment sessions (minutes)",
    )
    assessment_max_attempts: Optional[int] = Field(
        default=None,
        ge=1,
        le=500,
        description="Maximum attempts permitted during assessment sessions",
    )


class QuizDefinitionResponse(BaseModel):
    quiz_id: str
    name: Optional[str]
    topics: List[str]
    default_mode: QuizModeLiteral
    initial_difficulty: QuizDifficultyLiteral
    assessment_num_questions: Optional[int]
    assessment_time_limit_minutes: Optional[int]
    assessment_max_attempts: Optional[int]
    created_at: datetime
    updated_at: datetime


class QuizStartRequest(BaseModel):
    session_id: str = Field(..., description="Unique identifier for the learner session")
    quiz_id: str = Field(..., description="Quiz definition to attach this session to")
    user_id: str = Field(..., description="Learner identifier")
    mode: Optional[QuizModeLiteral] = Field(
        default=None,
        description="Optional override of the default mode",
    )
    initial_difficulty: Optional[QuizDifficultyLiteral] = Field(
        default=None,
        description="Optional override of the default starting difficulty",
    )


class QuizSessionResponse(BaseModel):
    session_id: str
    quiz_id: str
    user_id: str
    mode: QuizModeLiteral
    status: QuizStatusLiteral
    topics: List[str]
    current_difficulty: QuizDifficultyLiteral
    questions_answered: int
    started_at: datetime
    completed_at: Optional[datetime]
    deadline: Optional[datetime]


class QuizQuestionResponse(BaseModel):
    session_id: str
    question_id: str
    prompt: str
    choices: List[str]
    topic: str
    difficulty: QuizDifficultyLiteral
    order: int


class QuizAnswerRequest(BaseModel):
    question_id: str = Field(..., description="Question the learner is answering")
    selected_answer: str = Field(..., description="Learner's selected response")


class TopicPerformance(BaseModel):
    attempted: int = Field(..., ge=0)
    correct: int = Field(..., ge=0)


class QuizSummaryResponse(BaseModel):
    session_id: str
    quiz_id: str
    user_id: str
    mode: QuizModeLiteral
    status: QuizStatusLiteral
    total_questions: int
    correct_answers: int
    accuracy: float
    topics: Dict[str, TopicPerformance]
    total_time_ms: int
    started_at: datetime
    completed_at: Optional[datetime]


class QuizAnswerResponse(BaseModel):
    question_id: str
    is_correct: bool
    selected_answer: str
    correct_answer: str
    rationale: str
    topic: str
    difficulty: QuizDifficultyLiteral
    current_difficulty: QuizDifficultyLiteral
    session_completed: bool
    response_ms: Optional[int]
    summary: Optional[QuizSummaryResponse] = None
