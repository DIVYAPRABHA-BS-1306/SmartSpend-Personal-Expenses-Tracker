"""
EduMate AI — Shared utilities.

Provides logging, Gemini client setup, ADK runner helpers, JSON I/O,
and progress persistence used across agents and the Streamlit app.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

import config

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("edumate")


def get_logger(name: str) -> logging.Logger:
    """Return a namespaced logger for a module."""
    return logging.getLogger(f"edumate.{name}")


# ---------------------------------------------------------------------------
# API key validation
# ---------------------------------------------------------------------------
def get_api_key_status() -> tuple[bool, str]:
    """
    Return whether the API key looks usable and a short status message.

    Google AI Studio supports:
    - Legacy standard keys (start with 'AIza')
    - New authorization keys (start with 'AQ.')
    """
    key = config.GOOGLE_API_KEY.strip()
    if not key or key in config._INVALID_KEY_PLACEHOLDERS:
        return False, (
            "Add your Gemini API key to the `.env` file (not `.env.example`). "
            "Get one free at: https://aistudio.google.com/apikey"
        )
    if key.startswith("AIza") or key.startswith("AQ."):
        return True, "API key configured"
    return False, (
        "API key format looks incorrect. Gemini keys from AI Studio "
        "start with `AIza` (legacy) or `AQ.` (new auth keys). Check your `.env` file."
    )


def validate_api_key() -> bool:
    """Return True if a Gemini API key is configured and looks valid."""
    ok, _ = get_api_key_status()
    return ok


def require_api_key() -> None:
    """Raise ValueError when the API key is missing or invalid."""
    ok, message = get_api_key_status()
    if not ok:
        raise ValueError(message)


def format_api_error(exc: Exception) -> str:
    """Turn Gemini/ADK API errors into actionable user messages."""
    text = str(exc)
    if "API_KEY_INVALID" in text or "API key not valid" in text:
        return (
            "**Invalid Gemini API key.**\n\n"
            "1. Open https://aistudio.google.com/apikey\n"
            "2. Click **Create API key**\n"
            "3. Copy the key (starts with `AIza`)\n"
            "4. Paste it in `EduMateAI/.env` as:\n"
            "   `GOOGLE_API_KEY=AIza...your_key...`\n"
            "5. Restart Streamlit (`Ctrl+C`, then `streamlit run app.py`)\n\n"
            "Use `.env` — not `.env.example`."
        )
    if "PERMISSION_DENIED" in text or "403" in text:
        return "API access denied. Enable the Generative Language API for your key in Google AI Studio."
    if "429" in text or "RESOURCE_EXHAUSTED" in text:
        return "Rate limit exceeded. Wait a minute and try again, or check your API quota."
    return f"Error: {exc}"


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------
def days_until_exam(exam_date: date) -> int:
    """Calculate days remaining until exam (minimum 1)."""
    delta = (exam_date - date.today()).days
    return max(delta, 1)


def parse_markdown_table(text: str) -> list[dict[str, str]]:
    """Parse a markdown pipe table into a list of row dictionaries."""
    rows: list[dict[str, str]] = []
    headers: list[str] = []

    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("|"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if not cells:
            continue
        # Separator row: |---|---|
        if all(set(cell.replace(":", "")) <= {"-"} for cell in cells):
            continue
        if not headers:
            headers = cells
            continue
        if len(cells) == len(headers):
            rows.append(dict(zip(headers, cells)))
    return rows


def split_markdown_sections(text: str) -> dict[str, str]:
    """Split markdown text into sections keyed by ## heading (lowercase)."""
    sections: dict[str, str] = {"_intro": ""}
    current_key = "_intro"
    buffer: list[str] = []

    for line in text.splitlines():
        if line.startswith("## "):
            sections[current_key] = "\n".join(buffer).strip()
            current_key = line[3:].strip().lower()
            buffer = []
        else:
            buffer.append(line)

    sections[current_key] = "\n".join(buffer).strip()
    return sections


def parse_subjects(subjects_text: str) -> list[str]:
    """Parse comma- or newline-separated subject list."""
    raw = re.split(r"[,;\n]+", subjects_text)
    return [s.strip() for s in raw if s.strip()]


# ---------------------------------------------------------------------------
# Quiz parsing
# ---------------------------------------------------------------------------
@dataclass
class QuizQuestion:
    """A single parsed quiz question."""

    number: int
    qtype: str
    question: str
    options: dict[str, str] = field(default_factory=dict)
    correct_answer: str = ""
    explanation: str = ""


def _extract_quiz_field(block: str, field_name: str) -> str:
    """Extract a **Field:** value from a quiz question block."""
    pattern = rf"\*\*{re.escape(field_name)}:\*\*\s*(.+?)(?=\n\*\*|\Z)"
    match = re.search(pattern, block, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else ""


def _extract_mcq_options(block: str) -> dict[str, str]:
    """Extract A-D options from an MCQ block."""
    options: dict[str, str] = {}
    for match in re.finditer(
        r"\*\*([A-D])\)\*\*\s*(.+?)(?=\n\*\*|\Z)",
        block,
        re.DOTALL | re.IGNORECASE,
    ):
        options[match.group(1).upper()] = match.group(2).strip()
    return options


def parse_quiz(text: str) -> list[QuizQuestion]:
    """
    Parse agent-generated quiz markdown into structured question objects.

    Expects blocks starting with ### Question [N] (MCQ|Short Answer).
    """
    questions: list[QuizQuestion] = []
    blocks = re.split(r"(?=###\s*Question\s+\d+)", text, flags=re.IGNORECASE)

    for block in blocks:
        header = re.search(
            r"###\s*Question\s+(\d+)\s*\((MCQ|Short Answer)\)",
            block,
            re.IGNORECASE,
        )
        if not header:
            continue

        number = int(header.group(1))
        qtype = header.group(2)
        question_text = _extract_quiz_field(block, "Question")
        if not question_text:
            continue

        options = _extract_mcq_options(block) if "mcq" in qtype.lower() else {}
        correct = _extract_quiz_field(block, "Correct Answer")
        explanation = _extract_quiz_field(block, "Explanation")

        questions.append(
            QuizQuestion(
                number=number,
                qtype=qtype,
                question=question_text,
                options=options,
                correct_answer=correct,
                explanation=explanation,
            )
        )

    return questions


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------
def extract_json_block(text: str) -> dict[str, Any] | None:
    """Try to extract a JSON object from LLM markdown output."""
    if not text:
        return None
    # Fenced code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # Bare JSON object
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass
    return None


# ---------------------------------------------------------------------------
# Progress persistence
# ---------------------------------------------------------------------------
DEFAULT_PROGRESS: dict[str, Any] = {
    "student_name": "Student",
    "subjects": [],
    "completed_topics": [],
    "pending_topics": [],
    "study_streak": 0,
    "last_session": "",
    "weekly_hours": 0,
    "session_history": [],
}


def load_progress() -> dict[str, Any]:
    """Load progress data from disk; return defaults if missing."""
    if config.PROGRESS_FILE.exists():
        try:
            with open(config.PROGRESS_FILE, encoding="utf-8") as f:
                data = json.load(f)
            merged = {**DEFAULT_PROGRESS, **data}
            return merged
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Could not load progress file: %s", exc)
    return dict(DEFAULT_PROGRESS)


def save_progress(data: dict[str, Any]) -> None:
    """Persist progress data to disk."""
    config.DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(config.PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    logger.info("Progress saved to %s", config.PROGRESS_FILE)


def compute_completion_pct(completed: list[str], pending: list[str]) -> float:
    """Calculate completion percentage from topic lists."""
    total = len(completed) + len(pending)
    if total == 0:
        return 0.0
    return round((len(completed) / total) * 100, 1)


def update_study_streak(progress: dict[str, Any]) -> dict[str, Any]:
    """Update study streak based on last session date."""
    today_str = date.today().isoformat()
    last = progress.get("last_session", "")
    streak = progress.get("study_streak", 0)

    if last == today_str:
        pass  # Already studied today
    elif last:
        try:
            last_date = date.fromisoformat(last)
            if (date.today() - last_date).days == 1:
                streak += 1
            else:
                streak = 1
        except ValueError:
            streak = 1
    else:
        streak = 1

    progress["study_streak"] = streak
    progress["last_session"] = today_str
    return progress


# ---------------------------------------------------------------------------
# ADK agent runner (sync wrapper for Streamlit)
# ---------------------------------------------------------------------------
async def _run_agent_async(
    agent: Agent,
    user_message: str,
    *,
    app_name: str = "edumate",
    user_id: str = "streamlit_user",
    session_id: str | None = None,
) -> str:
    """
    Execute an ADK agent asynchronously and return the final text response.

    Uses InMemorySessionService for lightweight, local execution suitable
    for Streamlit and development.
    """
    require_api_key()

    session_service = InMemorySessionService()
    sid = session_id or f"session_{datetime.now().strftime('%Y%m%d%H%M%S')}"

    await session_service.create_session(
        app_name=app_name,
        user_id=user_id,
        session_id=sid,
    )

    runner = Runner(
        agent=agent,
        app_name=app_name,
        session_service=session_service,
    )

    new_message = types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_message)],
    )

    final_text = ""
    async for event in runner.run_async(
        user_id=user_id,
        session_id=sid,
        new_message=new_message,
    ):
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if part.text:
                    final_text = part.text

    if not final_text:
        raise RuntimeError("Agent returned an empty response. Check API key and model.")

    return final_text


def run_agent(
    agent: Agent,
    user_message: str,
    **kwargs: Any,
) -> str:
    """
    Synchronous wrapper around _run_agent_async for Streamlit compatibility.

    Streamlit runs in a sync context, so we bridge async ADK execution here.
    """
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(
                    asyncio.run,
                    _run_agent_async(agent, user_message, **kwargs),
                )
                return future.result(timeout=120)
        return loop.run_until_complete(
            _run_agent_async(agent, user_message, **kwargs)
        )
    except RuntimeError:
        return asyncio.run(_run_agent_async(agent, user_message, **kwargs))


def build_generate_config(
    temperature: float | None = None,
    max_output_tokens: int | None = None,
) -> types.GenerateContentConfig:
    """Build a shared GenerateContentConfig for ADK agents."""
    return types.GenerateContentConfig(
        temperature=temperature or config.DEFAULT_TEMPERATURE,
        max_output_tokens=max_output_tokens or config.DEFAULT_MAX_OUTPUT_TOKENS,
    )
