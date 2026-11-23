from __future__ import annotations

import json
import re
from typing import Any

import httpx

from app.settings import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT_S


class LlmError(Exception):
    pass


def extract_json(text: str) -> Any:
    raw = text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?", "", raw).strip()
        raw = re.sub(r"```$", "", raw).strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start >= 0 and end > start:
            return json.loads(raw[start : end + 1])
        raise LlmError("Model did not return JSON.") from None


def chat_completions(
    messages: list[dict[str, str]],
    *,
    json_schema: dict[str, Any] | None = None,
    schema_name: str = "result",
) -> Any:
    """OpenAI-compatible POST /chat/completions. Always parse JSON after the call."""
    headers = {"Content-Type": "application/json"}
    if LLM_API_KEY:
        headers["Authorization"] = f"Bearer {LLM_API_KEY}"

    payload: dict[str, Any] = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": 0,
    }
    if json_schema is not None:
        payload["response_format"] = {
            "type": "json_schema",
            "json_schema": {
                "name": schema_name,
                "strict": True,
                "schema": json_schema,
            },
        }

    url = f"{LLM_BASE_URL}/chat/completions"
    try:
        timeout = httpx.Timeout(LLM_TIMEOUT_S, connect=2.0)
        with httpx.Client(timeout=timeout) as client:
            response = client.post(url, headers=headers, json=payload)
            if response.status_code in {400, 422} and json_schema is not None:
                payload["response_format"] = {"type": "json_object"}
                response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            body = response.json()
    except httpx.HTTPError as err:
        raise LlmError(f"LLM request failed: {err}") from err
    except ValueError as err:
        raise LlmError("LLM response was not JSON.") from err

    try:
        content = body["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as err:
        raise LlmError("LLM response missing choices.") from err
    if not isinstance(content, str):
        raise LlmError("LLM content was not text.")
    return extract_json(content)
