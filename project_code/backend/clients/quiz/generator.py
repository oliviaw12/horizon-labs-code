from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Dict, List, Optional

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from clients.llm.settings import Settings, get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class GeneratedQuestion:
    prompt: str
    choices: List[str]
    correct_answer: str
    rationale: str
    incorrect_rationales: Dict[str, str]


class QuizQuestionGenerationError(RuntimeError):
    pass


class QuizQuestionGenerator:
    """Produces multiple-choice questions using the configured LLM."""

    def __init__(
        self,
        *,
        llm_settings: Optional[Settings] = None,
        temperature: float = 0.4,
    ) -> None:
        settings = llm_settings or get_settings()
        self._model = ChatOpenAI(
            model=settings.model_name,
            temperature=temperature,
            openai_api_key=settings.openrouter_api_key,
            openai_api_base=settings.openrouter_base_url,
            timeout=settings.request_timeout_seconds,
        )

    def generate(
        self,
        *,
        topic: str,
        difficulty: str,
        order: int,
    ) -> GeneratedQuestion:
        instructions = (
            "You are an instructional design assistant. "
            "Write a single multiple-choice question that checks conceptual understanding. "
            "Return ONLY a JSON object with keys: prompt (string), choices (array of 4 distinct strings), "
            "correct_answer (string exactly matching one choice), correct_rationale (string), "
            "incorrect_rationales (object keyed by choice with short explanation).\n"
            "Keep the distractors plausible but definitively incorrect. "
            "Do not include any text before or after the JSON object and do not wrap it in Markdown fences."
        )
        learner_prompt = (
            f"Topic: {topic}\n"
            f"Difficulty: {difficulty}\n"
            f"Question Number: {order}\n"
            "Follow the format instructions strictly."
        )

        response = self._model.invoke(
            [
                SystemMessage(content=instructions),
                HumanMessage(content=learner_prompt),
            ]
        )
        content = getattr(response, "content", "")
        try:
            payload = _parse_model_response(content)
        except QuizQuestionGenerationError:
            raise
        except Exception as exc:  # pragma: no cover - defensive branch
            logger.warning("Failed to parse quiz question JSON (%.160s): %s", content, exc)
            raise QuizQuestionGenerationError("Model returned invalid question format") from exc

        prompt = str(payload.get("prompt", "")).strip()
        choices = [str(choice).strip() for choice in payload.get("choices", []) if str(choice).strip()]
        if len(choices) < 2:
            raise QuizQuestionGenerationError("Question generator returned insufficient choices")

        correct_answer = str(payload.get("correct_answer", "")).strip()
        if correct_answer not in choices:
            raise QuizQuestionGenerationError("Correct answer missing from choices")

        correct_rationale = str(payload.get("correct_rationale", "")).strip()
        incorrect_raw = payload.get("incorrect_rationales", {}) or {}
        incorrect_rationales = {
            str(choice): str(explanation).strip()
            for choice, explanation in incorrect_raw.items()
            if str(choice) in choices
        }

        # Ensure every distractor has a rationale; if missing, supply a generic one.
        for choice in choices:
            if choice == correct_answer:
                continue
            if choice not in incorrect_rationales:
                incorrect_rationales[choice] = "This option does not correctly address the prompt."

        return GeneratedQuestion(
            prompt=prompt,
            choices=choices,
            correct_answer=correct_answer,
            rationale=correct_rationale or f"The correct choice best represents the topic {topic}.",
            incorrect_rationales=incorrect_rationales,
        )


def _parse_model_response(content: str) -> Dict[str, object]:
    text = content.strip()
    if not text:
        raise QuizQuestionGenerationError("Model returned an empty response")

    if text.startswith("```"):
        text = _strip_markdown_fence(text)

    start = text.find("{")
    end = text.rfind("}")
    candidate = None
    if start != -1 and end != -1 and end > start:
        candidate = text[start : end + 1]

    for snippet in filter(None, [candidate, text]):
        try:
            return json.loads(snippet)
        except json.JSONDecodeError:
            continue

    raise QuizQuestionGenerationError("Model returned invalid question format")


def _strip_markdown_fence(raw: str) -> str:
    text = raw.strip()
    # Remove leading fence with optional language tag
    text = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", text)
    if "```" in text:
        text = text[: text.rfind("```")]
    return text.strip()
