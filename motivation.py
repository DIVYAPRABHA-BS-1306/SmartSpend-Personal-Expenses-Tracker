"""
EduMate AI — Motivation Agent.

Independent ADK agent providing daily motivation, study advice,
burnout prevention tips, and personal encouragement.
"""

from __future__ import annotations

from google.adk.agents import Agent

import config
import prompts
from utils import build_generate_config, get_logger, run_agent

logger = get_logger("motivation")

# ---------------------------------------------------------------------------
# ADK Agent Definition
# ---------------------------------------------------------------------------
motivation_agent = Agent(
    name="motivation_coach",
    model=config.GEMINI_MODEL,
    instruction=prompts.MOTIVATION_AGENT_INSTRUCTION,
    description=(
        "Provides daily motivation, productivity tips, mental wellness advice, "
        "and personal encouragement for students."
    ),
    generate_content_config=build_generate_config(temperature=0.8),
    output_key="motivation_content",
)


def generate_motivation(
    student_name: str = "Student",
    current_focus: str = "General studies",
    study_streak: int = 0,
    recent_challenge: str = "Staying consistent with study schedule",
    goals: str = "Ace upcoming exams",
) -> str:
    """
    Generate motivational content using the Motivation Agent.

    Args:
        student_name: Student's display name.
        current_focus: What the student is currently studying.
        study_streak: Consecutive days studied.
        recent_challenge: A challenge the student faces.
        goals: Student's academic goals.

    Returns:
        Markdown-formatted motivation and wellness content.
    """
    user_message = prompts.MOTIVATION_USER_TEMPLATE.format(
        student_name=student_name,
        current_focus=current_focus,
        study_streak=study_streak,
        recent_challenge=recent_challenge,
        goals=goals,
    )

    logger.info("Generating motivation for %s (streak=%d)", student_name, study_streak)
    return run_agent(motivation_agent, user_message)
