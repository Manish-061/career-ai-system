from app.utils.helpers import load_knowledge_base
from app.utils.scoring import compute_skill_score

from app.services.normalizer import build_user_skill_map
from app.services.matcher import match_skills
from app.services.skill_gap import get_skill_gap
from app.services.explanation import generate_explanation
from app.services.domain_engine import get_domain_weights

KB = load_knowledge_base()


def get_readiness(score):
    if score >= 0.75:
        return "High"
    elif score >= 0.5:
        return "Medium"
    else:
        return "Low"


def check_education_match(user_education, role_education):
    if "Any" in role_education:
        return 1
    return 1 if user_education in role_education else 0


def generate_transition(role):
    transitions = {
        "Data Scientist": "Start with Data Analyst, then move to Data Scientist",
        "Software Engineer": "Begin with Backend/Frontend Developer roles",
        "Doctor": "Complete MBBS before specialization",
        "Chartered Accountant": "Start with Accounting roles, then pursue CA"
    }
    return transitions.get(role, "Build required skills and gain experience step by step")


def generate_recommendations(profile):

    # Step 1: Normalize input + scoring
    user_skill_map = build_user_skill_map(profile, compute_skill_score)

    results = []

    # Step 2: Evaluate each role
    for role, data in KB["roles"].items():

        role_skills = data["skills"]
        domain = data["domain"]

        # Matching
        skill_score, matched = match_skills(user_skill_map, role_skills)

        # Skill gap
        missing = get_skill_gap(user_skill_map, role_skills)

        # Domain weights
        weights = get_domain_weights(domain)

        # Education match
        education_score = check_education_match(profile.education, data["education"])

        # Final score
        final_score = (
            (skill_score * weights["skill"]) +
            (education_score * weights["education"])
        )

        results.append({
            "role": role,
            "domain": domain,
            "score": round(final_score, 2),
            "matched_skills": matched,
            "missing_skills": missing
        })

    # Step 3: Sort and pick best
    results.sort(key=lambda x: x["score"], reverse=True)

    best = results[0]

    readiness = get_readiness(best["score"])
    transition = generate_transition(best["role"])

    explanation = generate_explanation(
        best["role"],
        best["matched_skills"],
        best["missing_skills"],
        best["score"],
        readiness,
        transition
    )

    best["readiness_level"] = readiness
    best["explanation"] = explanation

    return {"recommendation": best}