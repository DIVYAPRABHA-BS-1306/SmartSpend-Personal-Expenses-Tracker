"""
EduMate AI — Central configuration module.

Loads environment variables, defines model settings, and exposes
application-wide constants used by agents and the Streamlit UI.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root before reading any variables
PROJECT_ROOT: Path = Path(__file__).resolve().parent
load_dotenv(PROJECT_ROOT / ".env", override=True)

# Placeholder values that must not be sent to the API
_INVALID_KEY_PLACEHOLDERS: frozenset[str] = frozenset({
    "",
    "your_gemini_api_key_here",
    "your_api_key_here",
    "paste_your_key_here",
})

# ---------------------------------------------------------------------------
# Gemini / ADK settings
# ---------------------------------------------------------------------------
# Accept GOOGLE_API_KEY or GEMINI_API_KEY (both are common in docs/tutorials)
GOOGLE_API_KEY: str = (
    os.getenv("GOOGLE_API_KEY", "").strip()
    or os.getenv("GEMINI_API_KEY", "").strip()
)
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GOOGLE_GENAI_USE_VERTEXAI: bool = (
    os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "false").lower() == "true"
)

# ADK and google-genai read credentials from environment variables
if GOOGLE_API_KEY and GOOGLE_API_KEY not in _INVALID_KEY_PLACEHOLDERS:
    os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY
    os.environ["GEMINI_API_KEY"] = GOOGLE_API_KEY
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = str(GOOGLE_GENAI_USE_VERTEXAI).lower()

# Generation defaults shared across agents
DEFAULT_TEMPERATURE: float = float(os.getenv("DEFAULT_TEMPERATURE", "0.7"))
DEFAULT_MAX_OUTPUT_TOKENS: int = int(os.getenv("DEFAULT_MAX_OUTPUT_TOKENS", "4096"))

# ---------------------------------------------------------------------------
# Application metadata
# ---------------------------------------------------------------------------
APP_NAME: str = "EduMate AI"
APP_TAGLINE: str = "Your Multi-Agent Learning Assistant"
APP_VERSION: str = "1.0.0"
APP_DESCRIPTION: str = (
    "EduMate AI uses four specialized Google ADK agents powered by Gemini "
    "to help students plan studies, generate quizzes, stay motivated, "
    "and track academic progress."
)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR: Path = PROJECT_ROOT / "data"
PROGRESS_FILE: Path = DATA_DIR / "progress.json"
IMAGES_DIR: Path = PROJECT_ROOT / "images"
ASSETS_DIR: Path = PROJECT_ROOT / "assets"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# UI constants
# ---------------------------------------------------------------------------
DIFFICULTY_LEVELS: list[str] = ["Easy", "Medium", "Hard"]
DEFAULT_HOURS_PER_DAY: int = 4
MAX_QUIZ_QUESTIONS: int = 10
MIN_QUIZ_QUESTIONS: int = 3

# Streamlit page configuration
PAGE_ICON: str = "📚"
LAYOUT: str = "wide"
