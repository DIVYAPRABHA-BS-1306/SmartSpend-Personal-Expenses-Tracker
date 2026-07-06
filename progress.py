"""
EduMate AI — Progress Tracker Agent.

Independent ADK agent that analyzes study progress data and produces
completion summaries, revision reminders, and performance insights.
"""

from __future__ import annotations

from google.adk.agents import Agent

import config
import prompts
from utils import (
    build_generate_config,
    compute_completion_pct,
    get_logger,
    load_progress,
    run_agent,
    save_progress,
)

logger = get_logger("progress")

# ---------------------------------------------------------------------------
# ADK Agent Definition
# ---------------------------------------------------------------------------
progress_tracker_agent = Agent(
    name="progress_tracker",
    model=config.GEMINI_MODEL,
    instruction=prompts.PROGRESS_TRACKER_INSTRUCTION,
    description=(
        "Tracks completed and pending topics, calculates completion metrics, "
        "and provides revision reminders and performance summaries."
    ),
    generate_content_config=build_generate_config(temperature=0.4),
    output_key="progress_report",
)


def get_progress_snapshot() -> dict:
    """Return current progress data with computed completion percentage."""
    data = load_progress()
    completed = data.get("completed_topics", [])
    pending = data.get("pending_topics", [])
    data["completion_pct"] = compute_completion_pct(completed, pending)
    return data


def mark_topic_complete(topic: str) -> dict:
    """Move a topic from pending to completed and persist."""
    data = load_progress()
    pending = data.get("pending_topics", [])
    completed = data.get("completed_topics", [])

    if topic in pending:
        pending.remove(topic)
    if topic not in completed:
        completed.append(topic)

    data["pending_topics"] = pending
    data["completed_topics"] = completed
    data["completion_pct"] = compute_completion_pct(completed, pending)
    save_progress(data)
    logger.info("Marked complete: %s", topic)
    return data


def add_pending_topic(topic: str) -> dict:
    """Add a new topic to the pending list."""
    data = load_progress()
    pending = data.get("pending_topics", [])
    if topic and topic not in pending and topic not in data.get("completed_topics", []):
        pending.append(topic)
    data["pending_topics"] = pending
    data["completion_pct"] = compute_completion_pct(
        data.get("completed_topics", []), pending
    )
    save_progress(data)
    return data


def generate_progress_report(
    student_name: str | None = None,
    weekly_hours: float = 0,
) -> str:
    """
    Generate an AI progress report using stored progress data.

    Args:
        student_name: Override student name; uses stored value if None.
        weekly_hours: Hours studied this week.

    Returns:
        Markdown-formatted progress analysis from the agent.
    """
    data = get_progress_snapshot()
    name = student_name or data.get("student_name", "Student")

    user_message = prompts.PROGRESS_TRACKER_USER_TEMPLATE.format(
        student_name=name,
        subjects=", ".join(data.get("subjects", [])) or "Not set",
        completed_topics=", ".join(data.get("completed_topics", [])) or "None yet",
        pending_topics=", ".join(data.get("pending_topics", [])) or "None",
        completion_pct=data.get("completion_pct", 0),
        study_streak=data.get("study_streak", 0),
        last_session=data.get("last_session", "Never"),
        weekly_hours=weekly_hours,
    )

    logger.info("Generating progress report for %s", name)
    return run_agent(progress_tracker_agent, user_message)
