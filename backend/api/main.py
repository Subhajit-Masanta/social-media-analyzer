import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load secrets from .env file
load_dotenv()

from .models import AnalyzeRequest, AnalysisResult, ErrorResponse
from .gemini_client import analyze_content

app = FastAPI(
    title="Social Media Content Analyzer API",
    description="Analyzes social media posts and suggests engagement improvements.",
    version="1.0.0",
)

# CORS: allow local dev (Vite) and production (Vercel) origins
ALLOWED_ORIGINS = [
    "http://localhost:5173", 
    "https://social-media-analyzer.vercel.app",
    "https://social-media-analyzer-subhajit.vercel.app",
    os.environ.get("FRONTEND_URL", ""),  # Flexible override url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in ALLOWED_ORIGINS if o],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    """Health check endpoint — useful for Vercel cold start verification."""
    return {"status": "ok"}

@app.post(
    "/api/analyze",
    response_model=AnalysisResult,
    responses={
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "AI or server error"},
    },
)
async def analyze(request: AnalyzeRequest) -> AnalysisResult:
    """
    Analyzes extracted social media text and returns structured suggestions.
    The Gemini response is validated against the AnalysisResult Pydantic schema
    before being returned to the client.
    """
    try:
        result = analyze_content(request)
        return result
    except ValueError as e:
        print(f"DEBUG VALIDATION ERROR: {str(e)}")
        raise HTTPException(
            status_code=422, 
            detail="The analysis engine generated an incomplete or invalid response. Please try analyzing again."
        )
    except Exception as e:
        error_str = str(e)
        print(f"DEBUG ERROR: {error_str}")
        if "429" in error_str or "quota" in error_str.lower():
            raise HTTPException(
                status_code=429, 
                detail="AI service temporarily rate-limited (free tier capacity reached). Please try again later."
            )
        if "503" in error_str or "unavailable" in error_str.lower():
            raise HTTPException(
                status_code=503,
                detail="The AI model is currently experiencing high demand. Please try again."
            )
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {error_str}")
