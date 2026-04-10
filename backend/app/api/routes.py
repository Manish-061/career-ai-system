from fastapi import APIRouter, HTTPException

from app.models.ai_models import (
    AIRecommendationResponse,
    FreeTextProfileRequest,
    GenerationRequest,
    GenerationResponse,
    ParsedProfileResponse,
    StructuredRecommendationResponse,
)
from app.models.response_model import RecommendationResponse
from app.models.user_profile import UserProfile
from app.services.ai.gemini_client import GeminiClientError
from app.services.ai.generation_service import generate_interactive_content
from app.services.ai.profile_parser import parse_free_text_profile
from app.services.ai.recommendation_explainer import (
    build_ai_assistance,
    build_fallback_ai_assistance,
    build_profile_context,
)
from app.services.reasoning_engine import generate_recommendations

router = APIRouter()


@router.get("/")
def root():
    return {"message": "Career AI System Running"}


@router.post("/recommend", response_model=RecommendationResponse)
def recommend(profile: UserProfile):
    return generate_recommendations(profile)


@router.post("/recommend/enhanced", response_model=StructuredRecommendationResponse)
def recommend_enhanced(profile: UserProfile):
    recommendation_response = generate_recommendations(profile)
    recommendation = recommendation_response["recommendation"]

    try:
        ai_assistance = build_ai_assistance(
            build_profile_context(profile),
            profile,
            recommendation,
            1.0,
            [],
        )
        ai_warning = None
    except GeminiClientError as exc:
        ai_assistance = build_fallback_ai_assistance(profile, recommendation, 1.0, [])
        ai_warning = f"{exc} Falling back to rule-based guidance."

    return {
        "recommendation": recommendation,
        "ai_assistance": ai_assistance,
        "ai_warning": ai_warning,
    }


@router.post("/ai/parse-profile", response_model=ParsedProfileResponse)
def ai_parse_profile(payload: FreeTextProfileRequest):
    try:
        return parse_free_text_profile(payload.profile_text)
    except GeminiClientError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc


@router.post("/ai/recommend", response_model=AIRecommendationResponse)
def ai_recommend(payload: FreeTextProfileRequest):
    try:
        parsed = parse_free_text_profile(payload.profile_text)
        recommendation_response = generate_recommendations(parsed.parsed_profile)
        recommendation = recommendation_response["recommendation"]
    except GeminiClientError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    try:
        ai_assistance = build_ai_assistance(
            payload.profile_text,
            parsed.parsed_profile,
            recommendation,
            parsed.parse_confidence,
            parsed.clarification_questions,
        )
        ai_warning = None
    except GeminiClientError as exc:
        ai_assistance = build_fallback_ai_assistance(
            parsed.parsed_profile,
            recommendation,
            parsed.parse_confidence,
            parsed.clarification_questions,
        )
        ai_warning = f"{exc} Falling back to rule-based guidance."

    return {
        "parsed_profile": parsed.parsed_profile,
        "recommendation": recommendation,
        "ai_assistance": ai_assistance,
        "ai_warning": ai_warning,
    }


@router.post("/ai/generate", response_model=GenerationResponse)
def ai_generate_content(payload: GenerationRequest):
    recommendation_payload = (
        payload.recommendation.model_dump()
        if hasattr(payload.recommendation, "model_dump")
        else payload.recommendation.dict()
    )

    return generate_interactive_content(
        payload.action,
        payload.prompt,
        payload.profile,
        recommendation_payload,
        payload.existing_output,
    )
