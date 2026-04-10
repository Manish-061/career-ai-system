from app.services.domain_engine import get_domain_weights
from app.services.explanation import generate_explanation
from app.services.matcher import match_skills
from app.services.normalizer import build_user_skill_map, normalize_text
from app.utils.helpers import load_knowledge_base
from app.utils.scoring import compute_skill_score

KB = load_knowledge_base()
SKILL_ALIASES = {
    normalize_text(alias): normalize_text(skill)
    for alias, skill in KB.get("skill_aliases", {}).items()
}

SKILL_GUIDANCE = {
    "python": "Deepen Python with data handling, automation, or backend mini-projects.",
    "sql": "Practice joins, aggregations, window functions, and query optimization on real datasets.",
    "statistics": "Cover descriptive statistics, probability, hypothesis testing, and business interpretation.",
    "excel": "Build reporting sheets, pivots, lookups, and dashboard-style summaries.",
    "power bi": "Create dashboards from sample datasets and publish one polished portfolio case study.",
    "machine learning": "Implement end-to-end supervised learning projects with evaluation and feature work.",
    "deep learning": "Learn neural-network fundamentals and apply them to one focused applied project.",
    "data visualization": "Tell a business story with charts, dashboard layout, and executive-level summaries.",
    "etl": "Build simple ingestion and transformation pipelines from raw files into analytics-ready tables.",
    "data warehousing": "Learn dimensional modeling, fact tables, and analytics-oriented schema design.",
    "spark": "Process larger datasets and understand distributed transformations with Spark basics.",
    "react": "Build responsive component-based projects and strengthen state management patterns.",
    "javascript": "Strengthen modern JavaScript fundamentals including async flows, modules, and DOM thinking.",
    "node.js": "Build REST APIs, validate input, and manage persistence for backend workflows.",
    "spring boot": "Create production-style APIs with layered architecture and database integration.",
    "api design": "Practice RESTful endpoint design, status codes, authentication, and pagination.",
    "testing": "Improve unit, integration, and API testing coverage with repeatable quality checks.",
    "automation": "Turn repeated manual test or workflow steps into reliable scripts and pipelines.",
    "docker": "Containerize applications and understand images, volumes, and local multi-service setup.",
    "kubernetes": "Learn deployments, services, config maps, and scaling workflows after Docker basics.",
    "aws": "Understand IAM, compute, storage, and deployment workflows with a small cloud project.",
    "linux": "Get comfortable with the shell, permissions, processes, and common server-side tooling.",
    "ci cd": "Automate lint, test, and deployment steps with a simple pipeline.",
    "networking": "Strengthen protocols, addressing, ports, and troubleshooting fundamentals.",
    "security concepts": "Build a base in threat modeling, authentication, encryption, and secure practices.",
}


def get_readiness(score, skill_score, project_score):
    if score >= 0.72 and skill_score >= 0.5 and project_score >= 0.5:
        return "High"
    if score >= 0.48 or skill_score >= 0.35:
        return "Medium"
    return "Low"


def check_education_match(user_education, role_education):
    if any(normalize_text(entry) == "any" for entry in role_education):
        return 1.0

    normalized_user = normalize_text(user_education)
    if not normalized_user:
        return 0.0

    user_tokens = set(normalized_user.split())

    partial_match = 0.0

    for accepted in role_education:
        normalized_accepted = normalize_text(accepted)
        accepted_tokens = set(normalized_accepted.split())

        if normalized_accepted in normalized_user or normalized_user in normalized_accepted:
            return 1.0

        if accepted_tokens and accepted_tokens.issubset(user_tokens):
            return 1.0

        overlap = len(user_tokens & accepted_tokens)
        if overlap >= 2 or (overlap == 1 and len(accepted_tokens) == 1):
            partial_match = max(partial_match, 0.7)

    return partial_match


def score_project_readiness(profile, min_projects):
    if min_projects <= 0:
        return 1.0

    total_projects = sum(max(skill.projects, 0) for skill in profile.skills)
    return min(total_projects / min_projects, 1.0)


def phrase_matches(user_interest, keyword):
    normalized_interest = normalize_text(user_interest)
    normalized_keyword = normalize_text(keyword)

    if not normalized_interest or not normalized_keyword:
        return False

    if (
        normalized_interest == normalized_keyword
        or normalized_keyword in normalized_interest
        or normalized_interest in normalized_keyword
    ):
        return True

    interest_tokens = set(normalized_interest.split())
    keyword_tokens = set(normalized_keyword.split())

    return bool(keyword_tokens) and keyword_tokens.issubset(interest_tokens)


def score_interest_alignment(profile_interests, role_name, role_data):
    role_keywords = {
        role_name,
        role_data["domain"],
        role_data["subdomain"],
        *role_data.get("interests", []),
    }

    matched = []

    for interest in profile_interests:
        if any(phrase_matches(interest, keyword) for keyword in role_keywords):
            matched.append(interest)

    unique_matches = list(dict.fromkeys(matched))

    if not profile_interests:
        return 0.0, []

    score = len(unique_matches) / len(profile_interests)
    return min(score, 1.0), unique_matches


def get_missing_skills(user_skill_map, role_skills):
    missing = []

    for skill in role_skills:
        if user_skill_map.get(skill.lower(), 0) < 0.35:
            missing.append(skill)

    return missing


def get_recommendation_type(score, interest_score, skill_score):
    if score >= 0.72:
        return "Strong Fit"
    if interest_score >= 0.5 and skill_score >= 0.22:
        return "Growth Path"
    return "Exploratory Fit"


def build_transition(role, recommendation_type, missing_skills, related_roles):
    if recommendation_type == "Strong Fit":
        return f"Target internships, entry-level opportunities, or portfolio projects for {role} immediately."

    if recommendation_type == "Growth Path" and missing_skills:
        focus_skills = ", ".join(missing_skills[:2])
        return f"Use {focus_skills} as your immediate upskilling focus, then move toward junior {role} opportunities."

    if related_roles:
        return f"Use adjacent roles such as {', '.join(related_roles[:2])} to build experience before moving into {role}."

    return f"Build the missing foundations step by step and transition toward {role} as your skill depth improves."


def build_next_steps(role_data, missing_skills):
    next_steps = []

    for skill in missing_skills[:3]:
        guidance = SKILL_GUIDANCE.get(skill.lower(), f"Build practical experience in {skill} through projects and focused practice.")
        next_steps.append(guidance)

    for step in role_data.get("next_steps", []):
        if step not in next_steps:
            next_steps.append(step)

    return next_steps[:4]


def build_confidence_summary(score, recommendation_type, matched_skills, matched_interests):
    return (
        f"{recommendation_type} based on {len(matched_skills)} aligned skills, "
        f"{len(matched_interests)} matching interests, and an overall score of {round(score, 2)}."
    )


def generate_recommendations(profile):
    user_skill_map = build_user_skill_map(profile, compute_skill_score, SKILL_ALIASES)
    normalized_interests = [normalize_text(interest) for interest in profile.interests if normalize_text(interest)]

    results = []

    for role, data in KB["roles"].items():
        role_skills = {
            normalize_text(skill): weight for skill, weight in data["skills"].items()
        }
        skill_label_map = {
            normalize_text(skill): skill for skill in data["skills"]
        }
        domain = data["domain"]

        skill_match = match_skills(user_skill_map, role_skills)
        missing = get_missing_skills(user_skill_map, role_skills)
        matched_skills = [skill_label_map[skill] for skill in skill_match["matched"]]
        missing_skills = [skill_label_map[skill] for skill in missing]
        weights = get_domain_weights(domain)
        education_score = check_education_match(profile.education, data["education"])
        project_score = score_project_readiness(profile, data.get("min_projects", 0))
        interest_score, matched_interests = score_interest_alignment(
            normalized_interests,
            role,
            data,
        )

        final_score = (
            (skill_match["score"] * weights["skill"])
            + (project_score * weights["project"])
            + (education_score * weights["education"])
            + (interest_score * weights["interest"])
        )

        difficulty = data.get("difficulty", "medium")
        if difficulty == "high" and skill_match["coverage"] < 0.4:
            final_score *= 0.9

        results.append(
            {
                "role": role,
                "domain": domain,
                "subdomain": data["subdomain"],
                "score": round(final_score, 2),
                "skill_score": skill_match["score"],
                "project_score": project_score,
                "interest_score": interest_score,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "matched_interests": matched_interests,
                "role_data": data,
            }
        )

    results.sort(
        key=lambda result: (
            result["score"],
            result["interest_score"],
            result["skill_score"],
        ),
        reverse=True,
    )

    best = results[0]
    readiness = get_readiness(best["score"], best["skill_score"], best["project_score"])
    recommendation_type = get_recommendation_type(
        best["score"],
        best["interest_score"],
        best["skill_score"],
    )

    role_data = best["role_data"]
    transition = build_transition(
        best["role"],
        recommendation_type,
        best["missing_skills"],
        role_data.get("related_roles", []),
    )
    next_steps = build_next_steps(role_data, best["missing_skills"])
    alternatives = [result["role"] for result in results[1:4]]
    confidence_summary = build_confidence_summary(
        best["score"],
        recommendation_type,
        best["matched_skills"],
        best["matched_interests"],
    )

    explanation = generate_explanation(
        best["role"],
        best["matched_skills"],
        best["missing_skills"],
        best["score"],
        readiness,
        transition,
        best["matched_interests"],
        recommendation_type,
    )

    recommendation = {
        "role": best["role"],
        "domain": best["domain"],
        "subdomain": best["subdomain"],
        "score": best["score"],
        "matched_skills": best["matched_skills"],
        "missing_skills": best["missing_skills"],
        "matched_interests": best["matched_interests"],
        "readiness_level": readiness,
        "recommendation_type": recommendation_type,
        "transition_path": transition,
        "next_steps": next_steps,
        "alternative_roles": alternatives,
        "confidence_summary": confidence_summary,
        "explanation": explanation,
    }

    return {"recommendation": recommendation}
