from fastapi import APIRouter
from app.models.user_profile import UserProfile
from app.models.response_model import RecommendationResponse
from app.services.reasoning_engine import generate_recommendations

router = APIRouter()


@router.get("/")
def root():
    return {"message": "Career AI System Running"}


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(profile: UserProfile):
    return generate_recommendations(profile)