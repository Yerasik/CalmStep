import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
BACKEND = Path(__file__).resolve().parents[1]

load_dotenv(ROOT / ".env")
load_dotenv(BACKEND / ".env")

# Locked Stage 6: local Ollama OpenAI-compatible /v1. Empty key is normal for Ollama.
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "http://127.0.0.1:11434/v1").rstrip("/")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
# llama3.1 (8B) is not installed here. llama3.1:70b is, and follows the JSON schema more reliably.
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.1:70b")
IF_LLM_DOWN = os.getenv("IF_LLM_DOWN", "fixtures")
LLM_TIMEOUT_S = float(os.getenv("LLM_TIMEOUT_S", "180"))
MAX_INTERVIEW_QUESTIONS = 10
MAX_GENERATE_RETRIES = 2
