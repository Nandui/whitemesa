import sys
from pathlib import Path

# Vercel runs from api/, so we need to add the project root to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app import app as handler
