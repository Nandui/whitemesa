"""
Lana Control Panel — manage skills, memory files, Mem0, and profile config.
Run: uvicorn app:app --reload --port 3001
"""

import json
import os
import subprocess
import sys
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Lana Control Panel")

HOME = Path.home()
LANA_MEMORY = HOME / "lana_memory"
SKILLS_DIR = HOME / ".hermes" / "skills"
PROFILE_DIR = HOME / ".hermes" / "profiles" / "lana"
MEMORY_FILES_DIR = LANA_MEMORY / "memory"

MEMORY_PY = LANA_MEMORY / "lana_memory.py"
VENV_PYTHON = LANA_MEMORY / ".venv" / "bin" / "python3"


# ── Helpers ──────────────────────────────────────────────────────────

def run_mem0(args: list[str]) -> dict:
    """Run the lana_memory.py CLI and return parsed output."""
    if not VENV_PYTHON.exists():
        return {"error": "Virtual environment not found"}
    cmd = [str(VENV_PYTHON), str(MEMORY_PY)] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, cwd=str(LANA_MEMORY))
        if result.returncode != 0:
            return {"error": result.stderr.strip() or result.stdout.strip()}
        # Try to parse as JSON
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            return {"output": result.stdout.strip()}
    except subprocess.TimeoutExpired:
        return {"error": "Timed out"}
    except Exception as e:
        return {"error": str(e)}


def read_file_safe(path: Path) -> dict:
    if not path.exists():
        return {"error": "File not found", "path": str(path)}
    if path.is_dir():
        return {"error": "Path is a directory", "path": str(path)}
    try:
        content = path.read_text()
        return {"content": content, "path": str(path), "size": len(content)}
    except Exception as e:
        return {"error": str(e)}


def write_file_safe(path: Path, content: str) -> dict:
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
        return {"status": "ok", "path": str(path), "size": len(content)}
    except Exception as e:
        return {"error": str(e)}


def get_skills_tree(base: Path) -> list:
    """Recursively find all SKILL.md files and their directories."""
    results = []
    if not base.exists():
        return results
    for item in sorted(base.iterdir()):
        if item.is_dir():
            skill_file = item / "SKILL.md"
            if skill_file.exists():
                results.append({
                    "name": item.name,
                    "path": str(skill_file),
                    "type": "skill",
                    "dir": str(item),
                })
            else:
                # Check subdirs
                for sub in sorted(item.iterdir()):
                    sub_skill = sub / "SKILL.md"
                    if sub_skill.exists():
                        results.append({
                            "name": f"{item.name}/{sub.name}",
                            "path": str(sub_skill),
                            "type": "skill",
                            "dir": str(sub),
                        })
    return results


# ── API Routes ───────────────────────────────────────────────────────

@app.get("/api/structure")
def get_structure():
    """Get the overall file structure."""
    return {
        "memory_files_dir": str(MEMORY_FILES_DIR),
        "profile_dir": str(PROFILE_DIR),
        "skills_dir": str(SKILLS_DIR),
        "mem0_dir": str(LANA_MEMORY / "chroma_db"),
        "lana_memory_dir": str(LANA_MEMORY),
    }


# ── Skills ────────────────────────────────────────────────────────────

@app.get("/api/skills")
def list_skills():
    skills = get_skills_tree(SKILLS_DIR)
    return {"skills": skills, "count": len(skills)}


@app.get("/api/skills/read")
def read_skill(path: str = Query(...)):
    """Read a skill's SKILL.md by full path."""
    p = Path(path)
    if not str(p).startswith(str(SKILLS_DIR)):
        return {"error": "Invalid path"}
    return read_file_safe(p)


@app.put("/api/skills/save")
def save_skill(path: str = Query(...), data: dict = None):
    """Save a skill's SKILL.md."""
    if data is None:
        return {"error": "No data provided"}
    p = Path(path)
    if not str(p).startswith(str(SKILLS_DIR)):
        return {"error": "Invalid path"}
    return write_file_safe(p, data.get("content", ""))


# ── Memory Markdown Files ────────────────────────────────────────────

@app.get("/api/memory-files")
def list_memory_files():
    files = []
    if MEMORY_FILES_DIR.exists():
        for f in sorted(MEMORY_FILES_DIR.iterdir()):
            if f.is_file() and f.suffix in (".md", ".txt"):
                files.append({
                    "name": f.name,
                    "path": str(f),
                    "size": f.stat().st_size,
                })
    return {"files": files, "count": len(files)}


@app.get("/api/memory-files/read")
def read_memory_file(path: str = Query(...)):
    p = Path(path)
    if not str(p).startswith(str(MEMORY_FILES_DIR)):
        return {"error": "Invalid path"}
    return read_file_safe(p)


@app.put("/api/memory-files/save")
def save_memory_file(path: str = Query(...), data: dict = None):
    if data is None:
        return {"error": "No data provided"}
    p = Path(path)
    if not str(p).startswith(str(MEMORY_FILES_DIR)):
        return {"error": "Invalid path"}
    return write_file_safe(p, data.get("content", ""))


# ── Profile Files ────────────────────────────────────────────────────

@app.get("/api/profile-files")
def list_profile_files():
    files = []
    if PROFILE_DIR.exists():
        for f in sorted(PROFILE_DIR.iterdir()):
            if f.is_file() and f.suffix in (".md", ".yaml", ".yml", ".json", ".txt"):
                files.append({
                    "name": f.name,
                    "path": str(f),
                    "size": f.stat().st_size,
                })
    return {"files": files, "count": len(files)}


@app.get("/api/profile-files/read")
def read_profile_file(path: str = Query(...)):
    p = Path(path)
    if not str(p).startswith(str(PROFILE_DIR)):
        return {"error": "Invalid path"}
    return read_file_safe(p)


@app.put("/api/profile-files/save")
def save_profile_file(path: str = Query(...), data: dict = None):
    if data is None:
        return {"error": "No data provided"}
    p = Path(path)
    if not str(p).startswith(str(PROFILE_DIR)):
        return {"error": "Invalid path"}
    return write_file_safe(p, data.get("content", ""))


# ── Mem0 ─────────────────────────────────────────────────────────────

@app.get("/api/mem0/search")
def mem0_search(q: str = Query("")):
    if not q:
        return run_mem0(["recent"])
    return run_mem0(["search", q])


@app.get("/api/mem0/recent")
def mem0_recent():
    return run_mem0(["recent"])


class Mem0AddRequest(BaseModel):
    text: str


@app.post("/api/mem0/add")
def mem0_add(req: Mem0AddRequest):
    return run_mem0(["add", req.text])


# ── Structure ─────────────────────────────────────────────────────────

@app.get("/api/browse-dir")
def browse_dir(path: str = Query(...)):
    """Browse any directory under the allowed roots."""
    p = Path(path)
    allowed = [str(MEMORY_FILES_DIR), str(PROFILE_DIR), str(SKILLS_DIR), str(LANA_MEMORY)]
    if not any(str(p).startswith(a) for a in allowed):
        return {"error": "Access denied"}
    if not p.exists():
        return {"error": "Not found"}
    if not p.is_dir():
        return read_file_safe(p)
    items = []
    for item in sorted(p.iterdir()):
        items.append({
            "name": item.name,
            "path": str(item),
            "type": "file" if item.is_file() else "dir",
            "size": item.stat().st_size if item.is_file() else 0,
        })
    return {"items": items, "path": str(p)}


# ── Frontend ──────────────────────────────────────────────────────────

@app.get("/")
def index():
    html = (Path(__file__).parent / "static" / "index.html").read_text()
    return HTMLResponse(html)


# ── Main ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3001)
