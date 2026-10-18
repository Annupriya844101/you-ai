import os
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

load_dotenv()

ROOT = Path(__file__).resolve().parent.parent
STATIC_DIR = ROOT / "static"
APP_NAME = os.getenv("YOU_AI_NAME", "YOU AI")
AI_BASE_URL = os.getenv("AI_BASE_URL", "").strip().rstrip("/")
AI_API_KEY = os.getenv("AI_API_KEY", "").strip()
AI_MODEL = os.getenv("AI_MODEL", "").strip()

app = FastAPI(title=APP_NAME, version="0.1.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant|system)$")
    content: str = Field(min_length=1, max_length=12000)


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1, max_length=40)


@app.get("/")
async def home():
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "name": APP_NAME,
        "model_configured": bool(AI_BASE_URL and AI_MODEL),
    }


@app.post("/api/chat")
async def chat(payload: ChatRequest):
    if not AI_BASE_URL or not AI_MODEL:
        return {
            "reply": (
                "Welcome to YOU AI! The app is running, but no model endpoint is configured. "
                "Configure AI_BASE_URL, AI_MODEL, and AI_API_KEY (if required) in the backend "
                "environment settings. Do not put secret keys in frontend files or GitHub."
            ),
            "mode": "setup",
        }

    endpoint = AI_BASE_URL
    if not endpoint.endswith("/chat/completions"):
        endpoint += "/chat/completions"

    headers = {"Content-Type": "application/json"}
    if AI_API_KEY:
        headers["Authorization"] = f"Bearer {AI_API_KEY}"

    body = {
        "model": AI_MODEL,
        "messages": [m.model_dump() for m in payload.messages],
        "temperature": 0.7,
        "stream": False,
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(90.0)) as client:
            response = await client.post(endpoint, headers=headers, json=body)
            response.raise_for_status()
            data = response.json()
        reply = data["choices"][0]["message"]["content"]
        if not isinstance(reply, str):
            reply = str(reply)
        return {"reply": reply, "mode": "provider"}
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="The AI provider took too long. Try again.")
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        raise HTTPException(
            status_code=502,
            detail="Could not get a response from the configured AI provider. Check its endpoint, model, and key."
        )
