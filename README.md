# Lana Control Panel

Web UI for managing Lana's skills, memory files, Mem0 memories, and profile configuration.

## Local dev

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 3001
# → http://localhost:3001
```

Or directly:
```bash
python app.py
```

## Deploy

Push to GitHub → Vercel auto-deploys from `main` (configured via `vercel.json`).

## Structure

```
├── app.py              # FastAPI backend + Vercel entry point
├── static/index.html   # Single-page frontend
├── vercel.json         # Vercel Python build config
└── requirements.txt    # Python dependencies
```
