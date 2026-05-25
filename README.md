# Lana Control Panel

Web UI for managing Lana's skills, memory files, Mem0 memories, and profile configuration.

## Local dev

```bash
pip install -r requirements.txt
python app.py
# → http://localhost:3001
```

Or with uvicorn:
```bash
uvicorn app:app --reload --port 3001
```

## Deploy

Push to GitHub → Vercel auto-deploys from `main`.

## Structure

```
├── api/index.py        # Vercel serverless entry
├── app.py              # FastAPI backend
├── static/index.html   # Single-page frontend
├── vercel.json         # Vercel config
└── requirements.txt    # Python dependencies
```
