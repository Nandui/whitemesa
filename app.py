"""
Lana Control Panel — manage skills, memory files, Mem0, and profile config.
Run: uvicorn app:app --reload --port 3001
"""

import json
import os
import subprocess
import sys
import datetime as _dt
import base64
import re
from pathlib import Path
from fastapi import FastAPI, Query, Body
from fastapi.responses import HTMLResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Lana Control Panel")

HOME = Path.home()
LANA_MEMORY = HOME / "lana_memory"
SKILLS_DIR = HOME / ".hermes" / "skills"
PROFILE_DIR = HOME / ".hermes" / "profiles" / "lana"
MEMORY_FILES_DIR = LANA_MEMORY / "memory"
DREAMS_DIR = LANA_MEMORY / "dreams"
CONSOLIDATION_DIR = LANA_MEMORY / "consolidation"
IMAGES_DIR = LANA_MEMORY / "images"
CATALOG_PATH = IMAGES_DIR / "catalog.json"
VISUAL_IDENTITY_PATH = MEMORY_FILES_DIR / "visual_identity.md"
CONTENT_STRATEGY_PATH = MEMORY_FILES_DIR / "content_strategy.md"
VOICE_GUIDE_PATH = MEMORY_FILES_DIR / "voice_guide.md"
TIMELINE_PATH = LANA_MEMORY / "timeline.md"
INNER_STATE_PATH = LANA_MEMORY / "inner_state.md"
ROADMAP_PATH = LANA_MEMORY / "REALNESS_ROADMAP.md"
FALLBACK_PATH = MEMORY_FILES_DIR / "fallback_memories.jsonl"
PROPOSED_PATH = LANA_MEMORY / "proposed_memories.json"

MEMORY_PY = LANA_MEMORY / "lana_memory.py"
VENV_PYTHON = LANA_MEMORY / ".venv" / "bin" / "python3"


class SaveRequest(BaseModel):
    content: str


class ReferenceUploadRequest(BaseModel):
    filename: str
    data_url: str


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
def save_skill(path: str = Query(...), data: SaveRequest = Body(...)):
    """Save a skill's SKILL.md."""
    p = Path(path)
    if not str(p).startswith(str(SKILLS_DIR)):
        return {"error": "Invalid path"}
    return write_file_safe(p, data.content)


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
def save_memory_file(path: str = Query(...), data: SaveRequest = Body(...)):
    p = Path(path)
    if not str(p).startswith(str(MEMORY_FILES_DIR)):
        return {"error": "Invalid path"}
    return write_file_safe(p, data.content)


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
def save_profile_file(path: str = Query(...), data: SaveRequest = Body(...)):
    p = Path(path)
    if not str(p).startswith(str(PROFILE_DIR)):
        return {"error": "Invalid path"}
    return write_file_safe(p, data.content)


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


# ── Phase 1.5: Dreams ─────────────────────────────────────────────────

def _list_md_files(directory: Path) -> list:
    """List .md files in a directory, newest first."""
    if not directory.exists():
        return []
    files = sorted(
        [f for f in directory.iterdir() if f.is_file() and f.suffix == ".md"],
        key=lambda f: f.stat().st_mtime,
        reverse=True,
    )
    return [
        {"name": f.name, "path": str(f), "size": f.stat().st_size}
        for f in files
    ]


@app.get("/api/dreams")
def list_dreams():
    files = _list_md_files(DREAMS_DIR)
    return {"files": files, "count": len(files)}


@app.get("/api/dreams/read")
def read_dream(path: str = Query(...)):
    p = Path(path)
    if not str(p).startswith(str(DREAMS_DIR)):
        return {"error": "Invalid path"}
    return read_file_safe(p)


@app.delete("/api/dreams/delete")
def delete_dream(path: str = Query(...)):
    p = Path(path)
    if not str(p).startswith(str(DREAMS_DIR)):
        return {"error": "Invalid path"}
    try:
        p.unlink()
        return {"status": "deleted", "path": str(p)}
    except Exception as e:
        return {"error": str(e)}


# ── Phase 1.5: Consolidations ─────────────────────────────────────────


@app.get("/api/consolidations")
def list_consolidations():
    files = _list_md_files(CONSOLIDATION_DIR)
    return {"files": files, "count": len(files)}


@app.get("/api/consolidations/read")
def read_consolidation(path: str = Query(...)):
    p = Path(path)
    if not str(p).startswith(str(CONSOLIDATION_DIR)):
        return {"error": "Invalid path"}
    return read_file_safe(p)


@app.delete("/api/consolidations/delete")
def delete_consolidation(path: str = Query(...)):
    p = Path(path)
    if not str(p).startswith(str(CONSOLIDATION_DIR)):
        return {"error": "Invalid path"}
    try:
        p.unlink()
        return {"status": "deleted", "path": str(p)}
    except Exception as e:
        return {"error": str(e)}


# ── Phase 1.5: Fallback Memories ──────────────────────────────────────


@app.get("/api/fallback-memories")
def list_fallback_memories():
    if not FALLBACK_PATH.exists():
        return {"memories": [], "count": 0}
    try:
        lines = [l for l in FALLBACK_PATH.read_text().splitlines() if l.strip()]
        memories = [json.loads(l) for l in lines]
        return {"memories": memories, "count": len(memories)}
    except Exception as e:
        return {"error": str(e)}


@app.delete("/api/fallback-memories/clear")
def clear_fallback_memories():
    try:
        FALLBACK_PATH.write_text("")
        return {"status": "cleared"}
    except Exception as e:
        return {"error": str(e)}


@app.delete("/api/fallback-memories/delete")
def delete_fallback_memory(memory_id: str = Query(...)):
    if not FALLBACK_PATH.exists():
        return {"error": "No fallback file"}
    try:
        lines = [l for l in FALLBACK_PATH.read_text().splitlines() if l.strip()]
        kept = [l for l in lines if memory_id not in l]
        FALLBACK_PATH.write_text("\n".join(kept) + ("\n" if kept else ""))
        removed = len(lines) - len(kept)
        return {"status": "ok", "removed": removed}
    except Exception as e:
        return {"error": str(e)}


# ── Phase 1.5: Timeline ───────────────────────────────────────────────


@app.get("/api/timeline")
def get_timeline():
    return read_file_safe(TIMELINE_PATH)


@app.put("/api/timeline/save")
def save_timeline(data: SaveRequest = Body(...)):
    return write_file_safe(TIMELINE_PATH, data.content)


# ── Phase 1.5: Inner State ────────────────────────────────────────────


@app.get("/api/inner-state")
def get_inner_state():
    return read_file_safe(INNER_STATE_PATH)


@app.put("/api/inner-state/save")
def save_inner_state(data: SaveRequest = Body(...)):
    return write_file_safe(INNER_STATE_PATH, data.content)


# ── Phase 1.5: Roadmap ────────────────────────────────────────────────


@app.get("/api/roadmap")
def get_roadmap():
    return read_file_safe(ROADMAP_PATH)


# ── Structure ─────────────────────────────────────────────────────────

# ── Phase 2: Proposed Memories (Approval-Gated) ──────────────────────

def _load_proposed() -> list[dict]:
    """Load proposed memories from JSON store."""
    if not PROPOSED_PATH.exists():
        return []
    try:
        data = json.loads(PROPOSED_PATH.read_text())
        if isinstance(data, list):
            return data
        return []
    except (json.JSONDecodeError, Exception):
        return []


def _save_proposed(items: list[dict]) -> None:
    """Save proposed memories to JSON store."""
    PROPOSED_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROPOSED_PATH.write_text(json.dumps(items, indent=2, ensure_ascii=False))


@app.get("/api/proposed-memories")
def list_proposed_memories(status: str = Query("proposed")):
    """List proposed memories, filtered by status (proposed/approved/rejected/all)."""
    items = _load_proposed()
    if status != "all":
        items = [i for i in items if i.get("status") == status]
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    counts = {"proposed": 0, "approved": 0, "rejected": 0}
    for i in _load_proposed():
        s = i.get("status", "proposed")
        if s in counts:
            counts[s] += 1
    return {"memories": items, "count": len(items), "counts": counts}


class ProposedActionRequest(BaseModel):
    memory_id: str


@app.post("/api/proposed-memories/approve")
def approve_proposed_memory(req: ProposedActionRequest):
    """Approve a single proposed memory — save to Mem0 and mark approved."""
    items = _load_proposed()
    found = None
    for item in items:
        if item.get("id") == req.memory_id and item.get("status") == "proposed":
            found = item
            break
    if not found:
        return {"error": "Memory not found or already resolved", "id": req.memory_id}

    # Save to Mem0
    result = run_mem0(["add", found["memory"]])
    found["status"] = "approved"
    found["resolved_at"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
    found["mem0_result"] = result
    _save_proposed(items)
    return {"status": "approved", "memory": found, "mem0_result": result}


@app.post("/api/proposed-memories/reject")
def reject_proposed_memory(req: ProposedActionRequest):
    """Reject a single proposed memory — mark rejected, do not save."""
    items = _load_proposed()
    found = None
    for item in items:
        if item.get("id") == req.memory_id and item.get("status") == "proposed":
            found = item
            break
    if not found:
        return {"error": "Memory not found or already resolved", "id": req.memory_id}

    found["status"] = "rejected"
    found["resolved_at"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
    _save_proposed(items)
    return {"status": "rejected", "memory": found}


@app.post("/api/proposed-memories/approve-all")
def approve_all_proposed():
    """Approve all currently proposed memories — save each to Mem0."""
    items = _load_proposed()
    approved = []
    for item in items:
        if item.get("status") != "proposed":
            continue
        result = run_mem0(["add", item["memory"]])
        item["status"] = "approved"
        item["resolved_at"] = _dt.datetime.now(_dt.timezone.utc).isoformat()
        item["mem0_result"] = result
        approved.append(item)
    _save_proposed(items)
    return {"status": "ok", "approved_count": len(approved)}


@app.post("/api/proposed-memories/reject-all")
def reject_all_proposed():
    """Reject all currently proposed memories."""
    items = _load_proposed()
    rejected = 0
    now = _dt.datetime.now(_dt.timezone.utc).isoformat()
    for item in items:
        if item.get("status") == "proposed":
            item["status"] = "rejected"
            item["resolved_at"] = now
            rejected += 1
    _save_proposed(items)
    return {"status": "ok", "rejected_count": rejected}


@app.delete("/api/proposed-memories/clear-resolved")
def clear_resolved_proposed():
    """Remove all approved/rejected entries, keeping only proposed ones."""
    items = _load_proposed()
    kept = [i for i in items if i.get("status") == "proposed"]
    _save_proposed(kept)
    return {"status": "ok", "kept": len(kept), "removed": len(items) - len(kept)}


# ── Phase 5: Content & Embodiment ─────────────────────────────────────

@app.get("/api/content-catalog")
def get_content_catalog():
    """Get the image catalog + content strategy overview."""
    images = []
    if CATALOG_PATH.exists():
        try:
            data = json.loads(CATALOG_PATH.read_text())
            if isinstance(data, list):
                images = sorted(data, key=lambda x: x.get("created_at", ""), reverse=True)
        except (json.JSONDecodeError, Exception):
            pass

    return {
        "images": images,
        "image_count": len(images),
        "passed_count": sum(1 for i in images if i.get("passed_qc")),
        "has_visual_identity": VISUAL_IDENTITY_PATH.exists(),
        "has_content_strategy": CONTENT_STRATEGY_PATH.exists(),
        "has_voice_guide": VOICE_GUIDE_PATH.exists(),
    }


@app.get("/api/content/visual-identity")
def get_visual_identity():
    return read_file_safe(VISUAL_IDENTITY_PATH)


@app.get("/api/content/content-strategy")
def get_content_strategy():
    return read_file_safe(CONTENT_STRATEGY_PATH)


@app.get("/api/content/voice-guide")
def get_voice_guide():
    return read_file_safe(VOICE_GUIDE_PATH)


class ImageQcRequest(BaseModel):
    filename: str
    passed_qc: bool
    qc_notes: str = ""


@app.post("/api/content/qc-update")
def update_image_qc(req: ImageQcRequest):
    """Update QC status on a catalogued image."""
    if not CATALOG_PATH.exists():
        return {"error": "No catalog found"}
    try:
        items = json.loads(CATALOG_PATH.read_text())
        found = None
        for item in items:
            if item.get("filename") == req.filename:
                item["passed_qc"] = req.passed_qc
                item["qc_notes"] = req.qc_notes
                found = item
                break
        if not found:
            return {"error": "Image not found in catalog", "filename": req.filename}
        CATALOG_PATH.write_text(json.dumps(items, indent=2, ensure_ascii=False))
        return {"status": "ok", "image": found}
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/content/generate-prompt")
def generate_content_prompt(
    category: str = Query("casual"),
    brief: str = Query(""),
):
    """Generate an image prompt using Lana's visual identity."""
    import subprocess
    try:
        result = subprocess.run(
            [str(VENV_PYTHON), str(LANA_MEMORY / "generate_image.py"),
             "--category", category, "--brief", brief],
            capture_output=True, text=True, timeout=30,
            cwd=str(LANA_MEMORY),
        )
        if result.returncode != 0:
            return {"error": result.stderr.strip()}
        return {"prompt": result.stdout.strip()}
    except Exception as e:
        return {"error": str(e)}


# ── Image Serving ──────────────────────────────────────────────────────

IDENTITY_REF_DIR = HOME / ".hermes" / "profiles" / "lana" / "home" / "lana-identity-references"
IDENTITY_REF_INVALID_DIR = IDENTITY_REF_DIR / "invalid"
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
MAX_REFERENCE_UPLOAD_BYTES = 50 * 1024 * 1024


def _safe_reference_filename(filename: str) -> str:
    """Return a safe single-file image name or raise ValueError."""
    name = Path(filename or "").name.strip()
    if not name:
        raise ValueError("Missing filename")
    if name.startswith(".") or "/" in name or "\\" in name:
        raise ValueError("Invalid filename")
    if not re.fullmatch(r"[A-Za-z0-9._ -]+", name):
        raise ValueError("Filename may only contain letters, numbers, spaces, dots, underscores, and hyphens")
    if Path(name).suffix.lower() not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValueError("Only PNG, JPG, JPEG, and WEBP images are allowed")
    return name


def _image_metadata(path: Path) -> dict:
    st = path.stat()
    return {
        "filename": path.name,
        "size": st.st_size,
        "modified_at": _dt.datetime.fromtimestamp(st.st_mtime).isoformat(),
        "url": f"/api/identity-references/{path.name}",
    }


@app.get("/api/images/{filename:path}")
def serve_image(filename: str):
    """Serve generated images from the catalog."""
    filepath = IMAGES_DIR / filename
    if not filepath.exists() or not filepath.is_file():
        return JSONResponse({"error": "Not found"}, status_code=404)
    return FileResponse(str(filepath))


@app.get("/api/identity-references/{filename:path}")
def serve_identity_ref(filename: str):
    """Serve identity reference images."""
    try:
        safe_name = _safe_reference_filename(filename)
    except ValueError:
        return JSONResponse({"error": "Invalid filename"}, status_code=400)
    filepath = IDENTITY_REF_DIR / safe_name
    if not filepath.exists() or not filepath.is_file():
        return JSONResponse({"error": "Not found"}, status_code=404)
    return FileResponse(str(filepath))


@app.get("/api/identity-references")
def list_identity_refs():
    """List all identity reference images."""
    if not IDENTITY_REF_DIR.exists():
        return {"images": [], "count": 0}
    images = []
    for f in sorted(IDENTITY_REF_DIR.iterdir()):
        if f.is_file() and f.suffix.lower() in ALLOWED_IMAGE_EXTENSIONS:
            images.append(_image_metadata(f))
    return {"images": images, "count": len(images), "directory": str(IDENTITY_REF_DIR)}


@app.post("/api/identity-references/upload")
def upload_identity_ref(req: ReferenceUploadRequest):
    """Upload/add a new active identity reference image.

    The frontend sends a data URL so the app does not depend on python-multipart.
    Existing files are never overwritten.
    """
    try:
        safe_name = _safe_reference_filename(req.filename)
    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=400)

    if "," not in req.data_url:
        return JSONResponse({"error": "Invalid image data"}, status_code=400)
    header, b64 = req.data_url.split(",", 1)
    if not header.startswith("data:image/") or ";base64" not in header:
        return JSONResponse({"error": "Expected a base64 image data URL"}, status_code=400)
    try:
        raw = base64.b64decode(b64, validate=True)
    except Exception:
        return JSONResponse({"error": "Invalid base64 image data"}, status_code=400)
    if len(raw) == 0:
        return JSONResponse({"error": "Empty image"}, status_code=400)
    if len(raw) > MAX_REFERENCE_UPLOAD_BYTES:
        return JSONResponse({"error": "Image is too large; max is 50MB"}, status_code=400)

    IDENTITY_REF_DIR.mkdir(parents=True, exist_ok=True)
    target = IDENTITY_REF_DIR / safe_name
    if target.exists():
        return JSONResponse({"error": "A reference with that filename already exists"}, status_code=409)
    target.write_bytes(raw)
    return {"status": "ok", "image": _image_metadata(target)}


@app.delete("/api/identity-references/{filename:path}")
def delete_identity_ref(filename: str):
    """Remove an image from Lana's active reference library by archiving it under invalid/."""
    try:
        safe_name = _safe_reference_filename(filename)
    except ValueError as e:
        return JSONResponse({"error": str(e)}, status_code=400)
    source = IDENTITY_REF_DIR / safe_name
    if not source.exists() or not source.is_file():
        return JSONResponse({"error": "Not found"}, status_code=404)
    IDENTITY_REF_INVALID_DIR.mkdir(parents=True, exist_ok=True)
    dest = IDENTITY_REF_INVALID_DIR / safe_name
    if dest.exists():
        stem = dest.stem
        suffix = dest.suffix
        dest = IDENTITY_REF_INVALID_DIR / f"{stem}_{_dt.datetime.now().strftime('%Y%m%d_%H%M%S')}{suffix}"
    source.rename(dest)
    return {"status": "archived", "filename": safe_name, "archived_to": str(dest)}


# ── Structure ─────────────────────────────────────────────────────────

MANUAL_PATH = Path(__file__).parent / "LANA_MANUAL.md"


@app.get("/api/manual")
def get_manual():
    """Serve the Lana system manual."""
    if not MANUAL_PATH.exists():
        return JSONResponse({"error": "Manual not found"}, status_code=404)
    content = MANUAL_PATH.read_text()
    return {
        "content": content,
        "size": len(content),
        "path": str(MANUAL_PATH),
    }


@app.get("/api/browse-dir")
def browse_dir(path: str = Query(...)):
    """Browse any directory under the allowed roots."""
    p = Path(path)
    allowed = [str(MEMORY_FILES_DIR), str(PROFILE_DIR), str(SKILLS_DIR), str(LANA_MEMORY), str(DREAMS_DIR), str(CONSOLIDATION_DIR)]
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


# ── Life State (Lana Life V1) ─────────────────────────────────────────

LIFE_PY = LANA_MEMORY / "lana_life.py"
VENV_PYTHON_LIFE = LANA_MEMORY / ".venv" / "bin" / "python3"
DAY_STATE_FILE = LANA_MEMORY / "day_state.json"
LIFE_EVENTS_FILE = LANA_MEMORY / "life_events.jsonl"
SCENE_LEDGER_FILE = LANA_MEMORY / "scene_ledger.json"


def _run_life(args: list[str], timeout: int = 15) -> dict:
    """Run lana_life.py with given args and return parsed output."""
    if not VENV_PYTHON_LIFE.exists():
        return {"error": "lana_life.py venv not found"}
    cmd = [str(VENV_PYTHON_LIFE), str(LIFE_PY)] + args
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(LANA_MEMORY))
        if result.returncode != 0:
            return {"error": result.stderr.strip() or result.stdout.strip()}
        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            return {"output": result.stdout.strip()}
    except subprocess.TimeoutExpired:
        return {"error": "Timed out"}
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/life/state")
def get_life_state():
    """Get current day_state.json."""
    if not DAY_STATE_FILE.exists():
        return {"error": "day_state.json not found"}
    try:
        return json.loads(DAY_STATE_FILE.read_text())
    except Exception as e:
        return {"error": str(e)}


@app.put("/api/life/state")
def update_life_state(data: SaveRequest = Body(...)):
    """Replace entire day_state.json."""
    return write_file_safe(DAY_STATE_FILE, data.content)


@app.post("/api/life/tick")
def life_tick():
    """Run a state tick (advance time band, energy, focus)."""
    return _run_life(["tick"])


@app.get("/api/life/events")
def get_life_events(limit: int = Query(20)):
    """Get recent life events from life_events.jsonl."""
    if not LIFE_EVENTS_FILE.exists():
        return {"events": [], "count": 0}
    try:
        lines = [l for l in LIFE_EVENTS_FILE.read_text().splitlines() if l.strip()]
        events = []
        for l in lines:
            try:
                events.append(json.loads(l))
            except json.JSONDecodeError:
                continue
        return {"events": events[-limit:], "count": len(events)}
    except Exception as e:
        return {"error": str(e)}


class LifeEventRequest(BaseModel):
    type: str = "conversation_moment"
    summary: str
    source: str = "whitemesa"
    mood: str = ""
    focus: str = ""
    desire: str = ""


@app.post("/api/life/events")
def add_life_event(req: LifeEventRequest):
    """Append a life event."""
    args = ["event", "--summary", req.summary, "--type", req.type, "--source", req.source]
    if req.mood:
        args += ["--mood", req.mood]
    if req.focus:
        args += ["--focus", req.focus]
    if req.desire:
        args += ["--desire", req.desire]
    return _run_life(args)


@app.get("/api/life/scenes")
def get_scenes():
    """Get scene ledger."""
    if not SCENE_LEDGER_FILE.exists():
        return {"scenes": [], "active_scene_id": None}
    try:
        return json.loads(SCENE_LEDGER_FILE.read_text())
    except Exception as e:
        return {"error": str(e)}


@app.put("/api/life/scenes")
def update_scenes(data: SaveRequest = Body(...)):
    """Replace scene ledger."""
    return write_file_safe(SCENE_LEDGER_FILE, data.content)


@app.post("/api/life/scenes/active")
def set_active_scene(scene_id: str = Query("")):
    """Set the active scene."""
    return _run_life(["scene-active", "--id", scene_id])


@app.post("/api/life/set")
def life_set_field(field: str = Query(""), value: str = Query("")):
    """Set a single field in day_state.json."""
    return _run_life(["set", "--field", field, "--value", value])


# ── Main ──────────────────────────────────────────────────────────────

@app.get("/")
def index():
    html = (Path(__file__).parent / "static" / "index.html").read_text()
    return HTMLResponse(html)


# ── Main ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=3001)
