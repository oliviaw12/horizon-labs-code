from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, Field


class QuizSettings(BaseModel):
    """Configuration parameters for quiz delivery."""

    practice_increase_streak: int = Field(
        default=2,
        ge=1,
        description="Consecutive correct answers required to increase practice difficulty",
    )
    practice_decrease_streak: int = Field(
        default=2,
        ge=1,
        description="Consecutive incorrect answers required to decrease practice difficulty",
    )


@lru_cache
def get_quiz_settings() -> QuizSettings:
    """Load quiz settings from the shared .env file."""
    env_path = Path(__file__).resolve().parents[2] / ".env"
    load_dotenv(env_path)

    increase = int(os.environ.get("QUIZ_PRACTICE_INCREASE_STREAK", "2"))
    decrease = int(os.environ.get("QUIZ_PRACTICE_DECREASE_STREAK", "2"))

    return QuizSettings(
        practice_increase_streak=max(increase, 1),
        practice_decrease_streak=max(decrease, 1),
    )
