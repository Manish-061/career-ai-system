from typing import List, Literal

from pydantic import BaseModel, Field

from app.models.response_model import Recommendation
from app.models.user_profile import UserProfile


class FreeTextProfileRequest(BaseModel):
    profile_text: str = Field(..., min_length=10, description="Free-text candidate profile.")


class ParsedProfileResponse(BaseModel):
    parsed_profile: UserProfile
    parse_confidence: float
    clarification_questions: List[str]
    model: str


class AIAssistance(BaseModel):
    model: str
    parse_confidence: float
    summary: str
    roadmap: List[str]
    project_ideas: List[str]
    clarification_questions: List[str]


class AIRecommendationResponse(BaseModel):
    parsed_profile: UserProfile
    recommendation: Recommendation
    ai_assistance: AIAssistance | None = None
    ai_warning: str | None = None


class StructuredRecommendationResponse(BaseModel):
    recommendation: Recommendation
    ai_assistance: AIAssistance | None = None
    ai_warning: str | None = None


GenerationAction = Literal["roadmap", "project_ideas", "career_alternatives", "chat"]


class GenerationRequest(BaseModel):
    action: GenerationAction = "chat"
    prompt: str = Field(..., min_length=2)
    profile: UserProfile
    recommendation: Recommendation
    existing_output: str = ""


class GenerationResponse(BaseModel):
    action: GenerationAction
    title: str
    content: str
    suggestions: List[str]
    model: str
    warning: str | None = None
