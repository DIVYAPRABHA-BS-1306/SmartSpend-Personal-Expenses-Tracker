"""
EduMate AI — Streamlit Web Application.

Beautiful multi-page UI for the four-agent learning assistant.
Run with: streamlit run app.py
"""

from __future__ import annotations

from datetime import date, timedelta

import base64

import pandas as pd
import streamlit as st
import streamlit.components.v1 as components

import config
from motivation import generate_motivation
from planner import generate_study_plan
from progress import (
    add_pending_topic,
    generate_progress_report,
    get_progress_snapshot,
    mark_topic_complete,
)
from quiz import generate_quiz
from utils import (
    QuizQuestion,
    format_api_error,
    get_api_key_status,
    load_progress,
    parse_markdown_table,
    parse_quiz,
    parse_subjects,
    save_progress,
    split_markdown_sections,
    update_study_streak,
    validate_api_key,
)

# ---------------------------------------------------------------------------
# Page config (must be first Streamlit command)
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title=config.APP_NAME,
    page_icon=config.PAGE_ICON,
    layout=config.LAYOUT,
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Custom CSS
# ---------------------------------------------------------------------------
st.markdown(
    """
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    .hero {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 3rem 2rem;
        border-radius: 16px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    .hero h1 { font-size: 2.8rem; margin-bottom: 0.5rem; }
    .hero p  { font-size: 1.2rem; opacity: 0.95; }

    .feature-card {
        background: #f8f9fc;
        border: 1px solid #e8ecf4;
        border-radius: 12px;
        padding: 1.5rem;
        height: 100%;
        transition: box-shadow 0.2s;
    }
    .feature-card:hover { box-shadow: 0 4px 20px rgba(102,126,234,0.15); }
    .feature-card h3 { color: #667eea; margin-top: 0; }

    .metric-box {
        background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf4 100%);
        border-radius: 12px;
        padding: 1.2rem;
        text-align: center;
    }
    .metric-box .value { font-size: 2rem; font-weight: 700; color: #667eea; }
    .metric-box .label { font-size: 0.9rem; color: #666; }

    .agent-badge {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.8rem;
        margin: 0.2rem;
    }

    div[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
    }
    div[data-testid="stSidebar"] * { color: #e0e0e0 !important; }
    div[data-testid="stSidebar"] .stRadio label { font-size: 1rem; }

    .stButton > button[kind="primary"] {
        background: linear-gradient(135deg, #667eea, #764ba2);
        border: none;
        border-radius: 8px;
        font-weight: 600;
    }
</style>
""",
    unsafe_allow_html=True,
)


# ---------------------------------------------------------------------------
# Session state defaults
# ---------------------------------------------------------------------------
def init_session_state() -> None:
    defaults = {
        "page": "Home",
        "study_plan_result": "",
        "quiz_result": "",
        "motivation_result": "",
        "progress_report": "",
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val


init_session_state()


def render_architecture_diagram() -> None:
    """
    Render the architecture diagram.

    Streamlit strips inline <svg> from st.markdown(), so we embed the SVG
    via components.html using a base64 data URI image instead.
    """
    arch_path = config.ASSETS_DIR / "architecture.svg"
    if not arch_path.exists():
        st.code(
            """
User  ->  Streamlit UI  ->  Orchestrator Agent (ADK)
                              |-- Study Planner Agent
                              |-- Quiz Generator Agent
                              |-- Motivation Agent
                              +-- Progress Tracker Agent
                                        |
                                  Google Gemini API
""",
            language=None,
        )
        return

    svg_bytes = arch_path.read_bytes()
    b64 = base64.b64encode(svg_bytes).decode("ascii")
    html = f"""
    <div style="width:100%;text-align:center;background:#f8f9fc;border-radius:12px;padding:12px;">
      <img src="data:image/svg+xml;base64,{b64}"
           alt="EduMate AI Multi-Agent Architecture"
           style="width:100%;max-width:920px;height:auto;display:block;margin:0 auto;" />
    </div>
    """
    components.html(html, height=560, scrolling=False)


def _style_dataframe(df: pd.DataFrame, *, schedule: bool = False) -> None:
    """Render a pandas DataFrame as a styled, full-width table."""
    width_map = {
        "Day": "small",
        "Date": "medium",
        "Subject": "medium",
        "Topic / Focus": "large",
        "Time Slot": "medium",
        "Hours": "small",
        "Notes": "large",
        "Session": "small",
        "Topics to Revise": "large",
        "Duration": "small",
        "Priority": "small",
    }
    kwargs: dict = {
        "use_container_width": True,
        "hide_index": True,
        "column_config": {
            col: st.column_config.TextColumn(
                col,
                width=width_map.get(col, "medium"),  # type: ignore[arg-type]
            )
            for col in df.columns
        },
    }
    if schedule and len(df) > 8:
        kwargs["height"] = min(520, 45 + len(df) * 38)
    st.dataframe(df, **kwargs)


def render_study_plan(plan_text: str) -> None:
    """
    Render study plan with tabular Daily Schedule and Revision Plan.

    Parses markdown tables into Streamlit dataframes; falls back to markdown
    for sections that are not tabular.
    """
    sections = split_markdown_sections(plan_text)

    schedule_key = next((k for k in sections if "daily study schedule" in k), None)
    revision_key = next((k for k in sections if "revision plan" in k), None)
    tips_key = next((k for k in sections if "study tips" in k), None)

    tab_schedule, tab_revision, tab_tips = st.tabs(
        ["📅 Daily Study Schedule", "🔁 Revision Plan", "💡 Study Tips"]
    )

    with tab_schedule:
        schedule_body = sections.get(schedule_key or "", plan_text)
        schedule_rows = parse_markdown_table(schedule_body)
        if schedule_rows:
            df = pd.DataFrame(schedule_rows)
            st.markdown("##### Your day-by-day study timetable")
            col1, col2, col3 = st.columns(3)
            if "Hours" in df.columns:
                try:
                    total_hours = pd.to_numeric(df["Hours"], errors="coerce").sum()
                    col1.metric("Total Planned Hours", f"{total_hours:.0f}h")
                except (ValueError, TypeError):
                    pass
            if "Day" in df.columns:
                col2.metric("Study Days", df["Day"].nunique())
            if "Subject" in df.columns:
                col3.metric("Subjects Covered", df["Subject"].nunique())
            st.markdown("")
            _style_dataframe(df, schedule=True)
        else:
            st.info("Showing schedule as text — regenerate for a tabular layout.")
            st.markdown(schedule_body)

    with tab_revision:
        revision_body = sections.get(revision_key or "", "_No revision plan found._")
        revision_rows = parse_markdown_table(revision_body)
        if revision_rows:
            st.markdown("##### Spaced revision sessions")
            _style_dataframe(pd.DataFrame(revision_rows))
        else:
            st.markdown(revision_body)

    with tab_tips:
        tips_body = sections.get(tips_key or "", "_No study tips found._")
        st.markdown(tips_body)


def render_quiz(quiz_text: str) -> None:
    """
    Render quiz in two tabs: questions/options only, then answers/explanations.
    """
    questions: list[QuizQuestion] = parse_quiz(quiz_text)

    tab_quiz, tab_answers = st.tabs(["📋 Quiz", "💡 Answers & Explanations"])

    if not questions:
        with tab_quiz:
            st.warning("Could not parse quiz format. Showing raw output — please regenerate.")
            st.markdown(quiz_text)
        with tab_answers:
            st.info("Regenerate the quiz to see separated answers.")
        return

    with tab_quiz:
        st.markdown(f"##### {len(questions)} unique questions — select your answers, then check the next tab")
        for q in questions:
            label = "MCQ" if "mcq" in q.qtype.lower() else "Short Answer"
            st.markdown(f"**Q{q.number}.** ({label}) {q.question}")
            if q.options:
                for letter in sorted(q.options.keys()):
                    st.markdown(
                        f'<div style="margin-left:1.5rem;padding:0.35rem 0;">'
                        f"<strong>{letter})</strong> {q.options[letter]}</div>",
                        unsafe_allow_html=True,
                    )
            else:
                st.text_area(
                    "Your answer",
                    key=f"quiz_answer_{q.number}",
                    placeholder="Type your answer here...",
                    height=80,
                    label_visibility="collapsed",
                )
            st.divider()

    with tab_answers:
        st.markdown("##### Answer key and explanations")
        for q in questions:
            st.markdown(f"**Q{q.number}.** {q.question}")
            if q.options and q.correct_answer.strip().upper() in q.options:
                letter = q.correct_answer.strip().upper()[:1]
                st.success(f"**Correct Answer:** {letter}) {q.options[letter]}")
            else:
                st.success(f"**Correct Answer:** {q.correct_answer}")
            if q.explanation:
                st.markdown(f"**Explanation:** {q.explanation}")
            st.divider()


# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
def render_sidebar() -> str:
  with st.sidebar:
    st.markdown("## 📚 EduMate AI")
    st.caption(config.APP_TAGLINE)
    st.divider()

    page = st.radio(
        "Navigation",
        ["Home", "Study Planner", "Quiz Generator", "Motivation", "Progress Tracker", "About"],
        label_visibility="collapsed",
    )

    st.divider()
    api_ok, api_msg = get_api_key_status()
    if api_ok:
        st.success("✅ API key configured")
    else:
        st.error("❌ API key needed")
        st.caption(api_msg)

    st.caption(f"v{config.APP_VERSION} | Gemini + ADK")
    return page


# ---------------------------------------------------------------------------
# Page: Home
# ---------------------------------------------------------------------------
def page_home() -> None:
    st.markdown(
        """
<div class="hero">
    <h1>📚 EduMate AI</h1>
    <p>Your Multi-Agent Learning Assistant — Powered by Google Gemini & ADK</p>
</div>
""",
        unsafe_allow_html=True,
    )

    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(
            '<div class="metric-box"><div class="value">4</div><div class="label">AI Agents</div></div>',
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            '<div class="metric-box"><div class="value">Gemini</div><div class="label">LLM Engine</div></div>',
            unsafe_allow_html=True,
        )
    with col3:
        st.markdown(
            '<div class="metric-box"><div class="value">ADK</div><div class="label">Orchestration</div></div>',
            unsafe_allow_html=True,
        )

    st.markdown("### 🎯 What is EduMate AI?")
    st.write(config.APP_DESCRIPTION)

    st.markdown("### ✨ Features")
    c1, c2 = st.columns(2)
    features = [
        ("📅 Study Planner", "Daily schedules, revision plans, and weak-subject prioritization."),
        ("📝 Quiz Generator", "MCQs and short-answer questions with detailed explanations."),
        ("💪 Motivation Coach", "Daily encouragement, productivity tips, and wellness advice."),
        ("📊 Progress Tracker", "Topic completion, streaks, and AI-powered performance insights."),
    ]
    for i, (title, desc) in enumerate(features):
        col = c1 if i % 2 == 0 else c2
        with col:
            st.markdown(f'<div class="feature-card"><h3>{title}</h3><p>{desc}</p></div>', unsafe_allow_html=True)

    st.markdown("### 🏗️ Architecture")
    render_architecture_diagram()

    st.markdown("### 🚀 Get Started")
    if st.button("Start Planning Your Studies →", type="primary", use_container_width=True):
        st.session_state.page = "Study Planner"
        st.rerun()


# ---------------------------------------------------------------------------
# Page: Study Planner
# ---------------------------------------------------------------------------
def page_study_planner() -> None:
    st.header("📅 Study Planner Agent")
    st.caption("Creates personalized daily schedules and revision plans")

    with st.form("planner_form"):
        col1, col2 = st.columns(2)
        with col1:
            subjects = st.text_area(
                "Subjects (comma-separated)",
                value="Mathematics, Physics, Chemistry, English",
                help="List all subjects you need to study",
            )
            exam_date = st.date_input(
                "Exam Date",
                value=date.today() + timedelta(days=30),
                min_value=date.today(),
            )
        with col2:
            hours_per_day = st.slider("Hours Per Day", 1, 12, config.DEFAULT_HOURS_PER_DAY)
            weak_subject = st.text_input("Weak Subject", value="Physics")
            difficulty = st.selectbox("Difficulty Level", config.DIFFICULTY_LEVELS, index=1)

        submitted = st.form_submit_button("Generate Study Plan", type="primary", use_container_width=True)

    if submitted:
        if not validate_api_key():
            st.error(get_api_key_status()[1])
            return
        with st.spinner("Study Planner Agent is creating your plan..."):
            try:
                result = generate_study_plan(
                    subjects=subjects,
                    exam_date=exam_date,
                    hours_per_day=hours_per_day,
                    weak_subject=weak_subject,
                    difficulty=difficulty,
                )
                st.session_state.study_plan_result = result
            except Exception as exc:
                st.error(format_api_error(exc))

    if st.session_state.study_plan_result:
        st.divider()
        render_study_plan(st.session_state.study_plan_result)


# ---------------------------------------------------------------------------
# Page: Quiz Generator
# ---------------------------------------------------------------------------
def page_quiz() -> None:
    st.header("📝 Quiz Generator Agent")
    st.caption("Generate MCQs and short-answer questions with explanations")

    col1, col2, col3 = st.columns(3)
    with col1:
        subject = st.text_input("Subject / Topic", value="Photosynthesis")
    with col2:
        difficulty = st.selectbox("Difficulty", config.DIFFICULTY_LEVELS, index=1, key="quiz_diff")
    with col3:
        num_q = st.number_input("Questions", min_value=3, max_value=10, value=5)

    if st.button("Generate Quiz", type="primary", use_container_width=True):
        if not validate_api_key():
            st.error(get_api_key_status()[1])
            return
        with st.spinner("Quiz Generator Agent is crafting questions..."):
            try:
                result = generate_quiz(subject=subject, difficulty=difficulty, num_questions=num_q)
                st.session_state.quiz_result = result
            except Exception as exc:
                st.error(format_api_error(exc))

    if st.session_state.quiz_result:
        st.divider()
        render_quiz(st.session_state.quiz_result)


# ---------------------------------------------------------------------------
# Page: Motivation
# ---------------------------------------------------------------------------
def page_motivation() -> None:
    st.header("💪 Motivation Agent")
    st.caption("Daily encouragement, study tips, and mental wellness advice")

    progress = get_progress_snapshot()

    col1, col2 = st.columns(2)
    with col1:
        name = st.text_input("Your Name", value=progress.get("student_name", "Student"))
        focus = st.text_input("Current Focus", value="Preparing for final exams")
    with col2:
        streak = st.number_input("Study Streak (days)", min_value=0, value=progress.get("study_streak", 0))
        challenge = st.text_input("Recent Challenge", value="Finding motivation after a long week")
    goals = st.text_area("Your Goals", value="Score above 90% and build consistent study habits")

    if st.button("Generate Motivation", type="primary", use_container_width=True):
        if not validate_api_key():
            st.error(get_api_key_status()[1])
            return
        with st.spinner("Motivation Agent is preparing your boost..."):
            try:
                result = generate_motivation(
                    student_name=name,
                    current_focus=focus,
                    study_streak=int(streak),
                    recent_challenge=challenge,
                    goals=goals,
                )
                st.session_state.motivation_result = result
            except Exception as exc:
                st.error(format_api_error(exc))

    if st.session_state.motivation_result:
        st.divider()
        st.markdown(st.session_state.motivation_result)


# ---------------------------------------------------------------------------
# Page: Progress Tracker
# ---------------------------------------------------------------------------
def page_progress() -> None:
    st.header("📊 Progress Tracker Agent")
    st.caption("Track topics, streaks, and get AI-powered insights")

    progress = get_progress_snapshot()

    # Metrics row
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Completion", f"{progress.get('completion_pct', 0)}%")
    m2.metric("Completed", len(progress.get("completed_topics", [])))
    m3.metric("Pending", len(progress.get("pending_topics", [])))
    m4.metric("Streak", f"{progress.get('study_streak', 0)} days")

    st.progress(progress.get("completion_pct", 0) / 100)

    tab_manage, tab_report, tab_chart = st.tabs(["Manage Topics", "AI Report", "Charts"])

    with tab_manage:
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Add Topic")
            new_topic = st.text_input("New topic name")
            if st.button("Add to Pending"):
                if new_topic:
                    add_pending_topic(new_topic)
                    st.success(f"Added: {new_topic}")
                    st.rerun()

            st.subheader("Student Info")
            sname = st.text_input("Student Name", value=progress.get("student_name", "Student"))
            subjects_text = st.text_input(
                "Subjects",
                value=", ".join(progress.get("subjects", [])),
            )
            if st.button("Save Info"):
                data = load_progress()
                data["student_name"] = sname
                data["subjects"] = parse_subjects(subjects_text)
                save_progress(data)
                st.success("Saved!")

        with col2:
            st.subheader("Mark Complete")
            pending = progress.get("pending_topics", [])
            if pending:
                topic_to_complete = st.selectbox("Select topic", pending)
                if st.button("Mark as Complete"):
                    mark_topic_complete(topic_to_complete)
                    update_data = load_progress()
                    update_study_streak(update_data)
                    save_progress(update_data)
                    st.success(f"Completed: {topic_to_complete}")
                    st.rerun()
            else:
                st.info("No pending topics. Add some above!")

            st.subheader("Completed")
            for t in progress.get("completed_topics", []):
                st.markdown(f"✅ {t}")

    with tab_report:
        weekly_hours = st.slider("Weekly Study Hours", 0.0, 60.0, 10.0, 0.5)
        if st.button("Generate Progress Report", type="primary"):
            if not validate_api_key():
                st.error(get_api_key_status()[1])
                return
            with st.spinner("Progress Tracker Agent is analyzing..."):
                try:
                    report = generate_progress_report(weekly_hours=weekly_hours)
                    st.session_state.progress_report = report
                except Exception as exc:
                    st.error(format_api_error(exc))
        if st.session_state.progress_report:
            st.markdown(st.session_state.progress_report)

    with tab_chart:
        import pandas as pd

        completed = len(progress.get("completed_topics", []))
        pending = len(progress.get("pending_topics", []))
        chart_data = pd.DataFrame({"Status": ["Completed", "Pending"], "Count": [completed, pending]})
        st.bar_chart(chart_data.set_index("Status"))

        streak_data = pd.DataFrame(
            {"Day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
             "Hours": [2, 3, 1, 4, 2, 3, 2]}
        )
        st.line_chart(streak_data.set_index("Day"))
        st.caption("Sample weekly study hours chart — update via session tracking in future versions.")


# ---------------------------------------------------------------------------
# Page: About
# ---------------------------------------------------------------------------
def page_about() -> None:
    st.header("ℹ️ About EduMate AI")
    st.markdown(
        f"""
**{config.APP_NAME}** v{config.APP_VERSION}

{config.APP_DESCRIPTION}

### Technology Stack
| Component | Technology |
|-----------|------------|
| Language | Python 3.10+ |
| LLM | Google Gemini ({config.GEMINI_MODEL}) |
| Agent Framework | Google ADK (Agent Development Kit) |
| UI | Streamlit |
| Config | python-dotenv |

### Why Google ADK?
ADK lets us define **four independent agents** with clear responsibilities,
then orchestrate them through a coordinator agent. Each agent has its own
instruction, tools, and output key — making the system modular, testable,
and easy to extend.

### Agents
"""
    )
    agents_info = [
        ("study_planner", "📅 Study Planner", "Schedules & revision plans"),
        ("quiz_generator", "📝 Quiz Generator", "MCQs & explanations"),
        ("motivation_coach", "💪 Motivation", "Encouragement & wellness"),
        ("progress_tracker", "📊 Progress Tracker", "Analytics & reminders"),
    ]
    for _key, name, desc in agents_info:
        st.markdown(f'<span class="agent-badge">{name}</span> {desc}', unsafe_allow_html=True)

    st.markdown(
        """
### License
Apache License 2.0 — see [LICENSE](LICENSE) for details.

### Author
Built for the **Kaggle AI Agents Intensive Capstone** — Agents for Good track.
"""
    )


# ---------------------------------------------------------------------------
# Main router
# ---------------------------------------------------------------------------
def main() -> None:
    page = render_sidebar()

    pages = {
        "Home": page_home,
        "Study Planner": page_study_planner,
        "Quiz Generator": page_quiz,
        "Motivation": page_motivation,
        "Progress Tracker": page_progress,
        "About": page_about,
    }
    pages[page]()


if __name__ == "__main__":
    main()
