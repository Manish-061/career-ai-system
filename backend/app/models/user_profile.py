from pydantic import BaseModel, Field
from typing import List


class SkillInput(BaseModel):
    name: str = Field(..., description="Skill name (e.g., Python, Java)")
    rating: float = Field(..., ge=1, le=10, description="User self rating (1–10)")
    projects: int = Field(..., ge=0, description="Number of projects related to skill")


class UserProfile(BaseModel):
    skills: List[SkillInput]
    interests: List[str]
    education: str