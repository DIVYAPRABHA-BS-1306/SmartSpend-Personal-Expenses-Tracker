"""
EduMate AI — Study Planner Agent.

Independent ADK agent responsible for creating daily study schedules,
revision plans, and personalized study tips based on exam inputs.
"""

from __future__ import annotations

from datetime import date

from google.adk.agents import Agent

import config
import prompts
from utils import build_generate_config, days_until_exam, get_logger, run_agent

logger = get_logger("planner")

# ---------------------------------------------------------------------------
# ADK Agent Definition
# ---------------------------------------------------------------------------
study_planner_agent = Agent(
    name="study_planner",
    model=config.GEMINI_MODEL,
    instruction=prompts.STUDY_PLANNER_INSTRUCTION,
    description=(
        "Creates personalized daily study schedules, revision plans, "
        "and study tips for students preparing for exams."
    ),
    generate_content_config=build_generate_config(temperature=0.6),
    output_key="study_plan",
)


def generate_study_plan(
    subjects: str,
    exam_date: date,
    hours_per_day: int,
    weak_subject: str,
    difficulty: str = "Medium",
) -> str:
    """
    Generate a complete study plan using the Study Planner Agent.

    Args:
        subjects: Comma-separated list of subjects.
        exam_date: Target exam date.
        hours_per_day: Available study hours per day.
        weak_subject: Subject needing extra focus.
        difficulty: Easy, Medium, or Hard intensity level.

    Returns:
        Markdown-formatted study plan from the agent.
    """
    days_left = days_until_exam(exam_date)
    user_message = prompts.STUDY_PLANNER_USER_TEMPLATE.format(
        subjects=subjects,
        exam_date=exam_date.strftime("%B %d, %Y"),
        hours_per_day=hours_per_day,
        weak_subject=weak_subject or "None specified",
        difficulty=difficulty,
        days_until_exam=days_left,
    )

    logger.info(
        "Generating study plan: subjects=%s, exam=%s, days=%d",
        subjects,
        exam_date,
        days_left,
    )
    return run_agent(study_planner_agent, user_message)
