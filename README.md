# 📚 EduMate AI

**A Multi-Agent Learning Assistant for Personalized Study Planning**

Powered by **Google Gemini** and the **Agent Development Kit (ADK)**

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.32+-red.svg)](https://streamlit.io)
[![Google ADK](https://img.shields.io/badge/Google-ADK-green.svg)](https://adk.dev)
[![License](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](LICENSE)

> Built for the **Kaggle AI Agents Intensive Capstone** — Agents for Good track

---

## Problem Statement

Students preparing for exams often struggle with:

- Not knowing **what** to study and in **what order**
- Poor **time management** and unrealistic schedules
- Lack of **self-assessment** through practice questions
- **Burnout** and loss of motivation during long prep periods
- No clear view of **progress** or pending topics

## Solution

**EduMate AI** is a multi-agent system with four specialized AI agents, each handling one aspect of the study journey:

| Agent | Responsibility |
|-------|---------------|
| 📅 **Study Planner** | Daily schedules, revision plans, weak-subject prioritization |
| 📝 **Quiz Generator** | MCQs and short-answer questions with explanations |
| 💪 **Motivation Coach** | Encouragement, productivity tips, mental wellness |
| 📊 **Progress Tracker** | Completion metrics, streaks, revision reminders |

A central **Orchestrator Agent** (ADK) routes natural-language requests to the right specialist.

## Architecture

```
User → Streamlit UI → Orchestrator Agent (ADK)
                        ├── Study Planner Agent
                        ├── Quiz Generator Agent
                        ├── Motivation Agent
                        └── Progress Tracker Agent
                                  ↓
                            Gemini API
```

See [`assets/architecture.svg`](assets/architecture.svg) for the full diagram.

### Why Google ADK?

- **Modular agents** — Each agent is independent with its own instruction, model config, and output key
- **LLM delegation** — The orchestrator uses ADK's `sub_agents` pattern for intelligent routing
- **Production-ready** — ADK provides `Runner`, `Session`, and `Event` primitives for scalable deployment
- **Gemini-native** — First-class support for Google Gemini models

## Features

- ✅ Personalized daily study schedules with revision planning
- ✅ AI-generated quizzes (MCQ + short answer) with explanations
- ✅ Daily motivation and mental wellness support
- ✅ Progress tracking with completion %, streaks, and charts
- ✅ Beautiful Streamlit UI with sidebar navigation
- ✅ Secure API key management via `.env`
- ✅ Modular, well-documented Python codebase

## Installation

### Prerequisites

- Python 3.10 or higher
- A [Google AI Studio API key](https://aistudio.google.com/apikey)

### Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/EduMateAI.git
cd EduMateAI

# Create virtual environment
python -m venv .venv
source .venv/bin/activate      # Linux/Mac
# .venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY
```

## How to Run

```bash
streamlit run app.py
```

Open `http://localhost:8501` in your browser.

## Folder Structure

```
EduMateAI/
├── app.py              # Streamlit web application
├── agent.py            # Multi-agent orchestrator (ADK)
├── planner.py          # Study Planner Agent
├── quiz.py             # Quiz Generator Agent
├── motivation.py       # Motivation Agent
├── progress.py         # Progress Tracker Agent
├── prompts.py          # All agent prompt templates
├── utils.py            # Shared utilities & ADK runner
├── config.py           # Configuration & constants
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variable template
├── assets/             # Architecture diagram
├── demo/               # Sample inputs for testing
├── tests/              # Unit tests
├── data/               # Progress persistence (auto-created)
├── KAGGLE_WRITEUP.md   # Competition writeup
├── VIDEO_SCRIPT.md     # 5-minute demo script
├── TESTING.md          # Test cases & expected outputs
└── DEPLOYMENT.md       # Streamlit Cloud deployment guide
```

## Requirements

| Package | Purpose |
|---------|---------|
| `google-adk` | Agent Development Kit |
| `google-genai` | Gemini API client |
| `streamlit` | Web UI framework |
| `python-dotenv` | Environment variable management |
| `pandas` | Charts on Progress page |
| `pytest` | Unit testing |

## Screenshots

> Add screenshots of Home, Study Planner, Quiz, Motivation, and Progress pages after running the app.

## Testing

```bash
# Run unit tests (no API calls)
pytest tests/ -v
```

See [TESTING.md](TESTING.md) for full test cases and sample inputs.

## Deployment

Deploy to **Streamlit Community Cloud** for free. See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions.

## Future Scope

- [ ] Voice-based study assistant
- [ ] Integration with Google Calendar for schedule sync
- [ ] Collaborative study groups with shared progress
- [ ] Spaced repetition algorithm for revision timing
- [ ] Mobile app via Streamlit or Flutter
- [ ] Multi-language support
- [ ] ADK evaluation suite for agent quality metrics

## Acknowledgements

- [Google Agent Development Kit (ADK)](https://adk.dev)
- [Google Gemini API](https://ai.google.dev)
- [Streamlit](https://streamlit.io)
- [Kaggle AI Agents Intensive Course](https://www.kaggle.com/learn-guide/kaggle-ai-agents-intensive)

## License

This project is licensed under the Apache License 2.0 — see [LICENSE](LICENSE) for details.
