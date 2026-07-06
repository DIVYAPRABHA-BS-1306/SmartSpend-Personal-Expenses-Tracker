"""
EduMate AI — Quiz Generator Agent.

Independent ADK agent that creates MCQs, short-answer questions,
and detailed explanations at configurable difficulty levels.
"""

from __future__ import annotations

from google.adk.agents import Agent

import config
import prompts
from utils import build_generate_config, get_logger, run_agent

logger = get_logger("quiz")

# ---------------------------------------------------------------------------
# ADK Agent Definition
# ---------------------------------------------------------------------------
quiz_generator_agent = Agent(
    name="quiz_generator",
    model=config.GEMINI_MODEL,
    instruction=prompts.QUIZ_GENERATOR_INSTRUCTION,
    description=(
        "Generates educational quizzes with MCQs and short-answer questions, "
        "including correct answers and detailed explanations."
    ),
    generate_content_config=build_generate_config(temperature=0.5),
    output_key="quiz_content",
)


def generate_quiz(
    subject: str,
    difficulty: str = "Medium",
    num_questions: int = 5,
) -> str:
    """
    Generate a quiz for the given subject using the Quiz Generator Agent.

    Args:
        subject: Topic or subject name.
        difficulty: Easy, Medium, or Hard.
        num_questions: Number of questions to generate.

    Returns:
        Markdown-formatted quiz with answers and explanations.
    """
    num_questions = max(
        config.MIN_QUIZ_QUESTIONS,
        min(num_questions, config.MAX_QUIZ_QUESTIONS),
    )

    user_message = prompts.QUIZ_GENERATOR_USER_TEMPLATE.format(
        subject=subject,
        difficulty=difficulty,
        num_questions=num_questions,
    )

    logger.info(
        "Generating quiz: subject=%s, difficulty=%s, count=%d",
        subject,
        difficulty,
        num_questions,
    )
    return run_agent(quiz_generator_agent, user_message)
