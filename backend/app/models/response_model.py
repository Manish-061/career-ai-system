from pydantic import BaseModel
from typing import List


class Recommendation(BaseModel):
    role: str
    domain: str
    subdomain: str
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    matched_interests: List[str]
    readiness_level: str
    recommendation_type: str
    transition_path: str
    next_steps: List[str]
    alternative_roles: List[str]
    confidence_summary: str
    explanation: str


class RecommendationResponse(BaseModel):
    recommendation: Recommendation
