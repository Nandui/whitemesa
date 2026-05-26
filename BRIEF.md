# Lana Control Panel — Plan for Claude Code

## Overview
A local web-based control panel for managing Lana Hayes (AI persona). Runs on the user's Mac and is accessible via the local network. The user wants Claude Code to rebuild this properly.

## Target URL
Local: http://localhost:3001
Remote: accessible via Tailscale or local network

## Tech Stack
- Backend: Python + FastAPI (already in place)
- Frontend: Single HTML page with embedded CSS/JS
- No build step, no framework

## What Already Exists
- `app.py` — FastAPI backend with endpoints for skills, memory files, profile files, Mem0
- `static/index.html` — a UI that was written too hastily and doesn't work properly
- `vercel.json`, `requirements.txt`, `README.md`

## What the App Must Do

### 1. Skills Browser
- List all skills from ~/.hermes/skills/ (show all categories and individual skills)
- Click a skill to view its SKILL.md content
- Edit the SKILL.md content
- Save changes back to disk
- Show skill metadata (author, tags, description from frontmatter)

### 2. Memory Files
- List files in ~/lana_memory/memory/
- Click to view content
- Edit and save
- Show file path, size
- Files: core_identity.md, current_state.md, operating_rules.md, approval_policy.md

### 3. Profile Files
- List files in ~/.hermes/profiles/lana/
- Click to view content
- Edit and save
- Key files: SOUL.md, config.yaml, memory_prefill.md

### 4. Mem0 Memory
- Search memories by text query (uses Mem0 search)
- Show recent memories
- Add new memories
- Display memory text, score, timestamp

### 5. File Structure
- Show a visual tree of all relevant directories
- Clickable to browse

### 6. General Requirements
- Dark theme, clean UI, good spacing
- A functional text editor (Monaco is ideal, but a good textarea works)
- Save button with confirmation toast
- Back navigation
- Loading states
- Error handling
- Mobile-friendly

## The Backend (app.py)
The existing backend already has proper endpoints. Review it, fix any issues, and make sure it's complete. The key paths are:
- HOME = Path.home()
- LANA_MEMORY = HOME / "lana_memory"
- SKILLS_DIR = HOME / ".hermes" / "skills"
- PROFILE_DIR = HOME / ".hermes" / "profiles" / "lana"
- MEMORY_FILES_DIR = LANA_MEMORY / "memory"

## How to Run
```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 3001 --host 0.0.0.0
```

The `--host 0.0.0.0` allows remote access on the local network.

## What NOT to Do
- Don't change the project structure (keep app.py and static/index.html)
- Don't add npm/node/React/build tools
- Don't add authentication (it's local-only)
- Don't break the Vercel deployment (vercel.json should still work, but features that need local files will gracefully show an error or disabled state)
