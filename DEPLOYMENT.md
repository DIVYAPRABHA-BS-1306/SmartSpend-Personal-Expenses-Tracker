# Deploying EduMate AI to Streamlit Community Cloud

## Prerequisites

1. A [GitHub](https://github.com) account
2. Your code pushed to a public GitHub repository
3. A [Google AI Studio API key](https://aistudio.google.com/apikey)

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: EduMate AI multi-agent learning assistant"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/EduMateAI.git
git push -u origin main
```

### 2. Deploy on Streamlit Cloud

1. Go to [share.streamlit.io](https://share.streamlit.io)
2. Sign in with your GitHub account
3. Click **"New app"**
4. Select your repository: `YOUR_USERNAME/EduMateAI`
5. Set **Main file path** to: `app.py`
6. Click **"Advanced settings"**

### 3. Configure Secrets

In the **Secrets** section, add your environment variables in TOML format:

```toml
GOOGLE_API_KEY = "your_actual_api_key_here"
GEMINI_MODEL = "gemini-2.5-flash"
```

Alternatively, create `.streamlit/secrets.toml` locally (do NOT commit this file):

```toml
GOOGLE_API_KEY = "your_key"
```

For Streamlit Cloud, paste the secrets in the web UI — they are encrypted.

### 4. Update config.py for Streamlit Secrets (Optional)

If using Streamlit Cloud secrets instead of `.env`, add this to `config.py`:

```python
import streamlit as st
try:
    GOOGLE_API_KEY = st.secrets.get("GOOGLE_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
except Exception:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
```

The current project reads from `.env` via `python-dotenv`, which works locally. For cloud deployment, Streamlit secrets are the recommended approach.

### 5. Deploy

Click **"Deploy!"** and wait 2-3 minutes for the build.

Your app will be live at: `https://YOUR_APP_NAME.streamlit.app`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ModuleNotFoundError` | Ensure `requirements.txt` lists all dependencies |
| API key error | Verify secrets are set in Streamlit Cloud settings |
| Build timeout | Check for large files; use `.gitignore` |
| Agent timeout | Streamlit Cloud has a 60s request limit; reduce `max_output_tokens` |

## Custom Domain (Optional)

Streamlit Community Cloud supports custom domains on paid plans. See [Streamlit docs](https://docs.streamlit.io/streamlit-community-cloud).

## Production Considerations

- Use **Vertex AI** (`GOOGLE_GENAI_USE_VERTEXAI=true`) for production workloads
- Enable **rate limiting** on API keys
- Monitor usage via [Google AI Studio dashboard](https://aistudio.google.com)
- Consider ADK deployment to **Cloud Run** or **Agent Runtime** for backend scaling
