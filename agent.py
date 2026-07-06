"""
EduMate AI — Multi-Agent Orchestrator.

Coordinates four independent ADK agents using LLM-based delegation.
The orchestrator routes student requests to the appropriate specialist.

Why Google ADK?
---------------
ADK provides production-ready agent primitives (Agent, Runner, Session)
that let us define independent, composable agents with clear responsibilities.
The orchestrator uses ADK's sub-agent delegation pattern so routing logic
is handled intelligently by Gemini rather than brittle if/else rules.
"""

from __future__ import annotations

from google.adk.agents import Agent

import config
import prompts
from motivation import motivation_agent
from planner import study_planner_agent
from progress import progress_tracker_agent
from quiz import quiz_generator_agent
from utils import build_generate_config, get_logger, run_agent

logger = get_logger("orchestrator")

# ---------------------------------------------------------------------------
# Root Orchestrator Agent
# ---------------------------------------------------------------------------
# The orchestrator holds references to all four specialist agents as
# sub_agents. Gemini decides which agent to delegate to based on the
# user's natural-language request and each agent's description field.
orchestrator_agent = Agent(
    name="edumate_orchestrator",
    model=config.GEMINI_MODEL,
    instruction=prompts.ORCHESTRATOR_INSTRUCTION,
    description="Central coordinator for the EduMate AI learning assistant.",
    sub_agents=[
        study_planner_agent,
        quiz_generator_agent,
        motivation_agent,
        progress_tracker_agent,
    ],
    generate_content_config=build_generate_config(temperature=0.3),
)


def route_request(user_message: str) -> str:
    """
    Send a natural-language request through the orchestrator.

    The orchestrator analyzes intent and delegates to the best specialist.

    Args:
        user_message: Free-form student request.

    Returns:
        Agent response text.
    """
    logger.info("Orchestrator routing request: %s", user_message[:80])
    return run_agent(orchestrator_agent, user_message)


# Re-export specialist agents for direct access from Streamlit pages
AGENTS = {
    "study_planner": study_planner_agent,
    "quiz_generator": quiz_generator_agent,
    "motivation_coach": motivation_agent,
    "progress_tracker": progress_tracker_agent,
    "orchestrator": orchestrator_agent,
}
