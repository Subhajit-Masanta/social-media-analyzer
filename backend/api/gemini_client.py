import os
import time
from google import genai
from google.genai import types
from .models import AnalysisResult, AnalyzeRequest
from .prompt_builder import build_prompt

GEMINI_MODEL = "gemini-3.6-flash"

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
    prompt = build_prompt(request.text, request.platform)

    def make_request():
        # Using exact SDK 2.19.0 API shape
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=AnalysisResult,
                temperature=0.7,
                max_output_tokens=8192,
            ),
        )
        return response

    # Retry once on rate limit or high demand
    try:
        response = make_request()
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "503" in error_str or "UNAVAILABLE" in error_str or "rate" in error_str.lower():
            time.sleep(3)
            response = make_request()
        else:
            raise

    # Parse and validate via Pydantic
    result = AnalysisResult.model_validate_json(response.text)
    return result
