from pydantic import BaseModel
from typing import List


class Recommendation(BaseModel):
    role: str
    domain: str
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    readiness_level: str
    explanation: str


class RecommendationResponse(BaseModel):
    recommendation: Recommendation