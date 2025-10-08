from __future__ import annotations

from typing import Any, Dict, Optional

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


class ChatResetRequest(BaseModel):
    session_id: str = Field(..., description="Identifier for the chat session to clear")


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
