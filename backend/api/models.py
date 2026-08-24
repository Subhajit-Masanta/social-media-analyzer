from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=10000,
                      description="Extracted text to analyze")
    platform: Literal["X", "Instagram", "LinkedIn"] = Field(
        ..., description="Target social media platform"
    )

class AnalysisResult(BaseModel):
    score: int = Field(..., ge=0, le=100,
                       description="Engagement score from 0 to 100")
    tone: str = Field(..., description="Detected tone of the content")
    strengths: List[str] = Field(..., min_length=1,
                                 description="What is working well")
    improvements: List[str] = Field(..., min_length=1,
                                    description="Specific things to improve")
    rewritten_post: str = Field(..., description="AI-rewritten version")
    hashtags: List[str] = Field(default_factory=list, description="Suggested hashtags")
    character_count: int = Field(..., description="Character count of rewritten post")
    platform_notes: Optional[str] = Field(None,
                                          description="Platform-specific advice")

class ErrorResponse(BaseModel):
    detail: str
    code: str
