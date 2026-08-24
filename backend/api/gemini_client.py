import os
import re
import json
import time
from google import genai
from google.genai import types
from .models import AnalysisResult, AnalyzeRequest
from .prompt_builder import build_prompt

GEMINI_MODEL = "gemini-3.7-flash"

def get_client() -> genai.Client:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    return genai.Client(api_key=api_key)

def analyze_content(request: AnalyzeRequest) -> AnalysisResult:
    """
    Calls Gemini with structured output mode.
    Retries once on rate limit (429) or unavailability (503).
    Raises ValueError if the response fails Pydantic validation.
    """
    client = get_client()

    # Trim the text to prevent output token truncation.
    # Even 3000 chars of input is plenty for a social media post analysis.
    trimmed_text = request.text[:3000]
    prompt = build_prompt(trimmed_text, request.platform)

    def make_request():
        chat = client.chats.create(model=GEMINI_MODEL)
        response = chat.send_message(
            prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.5,
            )
        )
        return response

    # Retry up to 3 times on rate limit or high demand (503/429)
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = make_request()
            break
        except Exception as e:
            error_str = str(e)
            is_transient = any(msg in error_str.upper() for msg in ["429", "503", "UNAVAILABLE", "RATE"])
            if is_transient and attempt < max_retries - 1:
                time.sleep(2 ** attempt + 2)  # Wait 3s, then 4s, then fail
                continue
            raise

    raw = response.text or ""

    # If Gemini truncated the JSON, attempt to extract the largest valid
    # JSON object from the partial response before giving up.
    try:
        result = AnalysisResult.model_validate_json(raw)
        return result
    except Exception:
        pass

    # Fallback: find the last complete JSON object in the response
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        try:
            result = AnalysisResult.model_validate_json(match.group())
            return result
        except Exception:
            pass

    raise ValueError(f"Gemini returned unparseable JSON. Raw output (first 200 chars): {raw[:200]}")
