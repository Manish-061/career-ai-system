from app.models.ai_models import AIAssistance
from app.models.user_profile import UserProfile
from app.services.ai.gemini_client import gemini_client


AI_EXPLANATION_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {"type": "string"},
        "roadmap": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 2,
            "maxItems": 4,
        },
        "project_ideas": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 1,
            "maxItems": 3,
        },
    },
    "required": ["summary", "roadmap", "project_ideas"],
    "additionalProperties": False,
}

PROJECT_TEMPLATES = {
    "Data Analyst": [
        "Build a sales performance dashboard using SQL, Excel, and a visualization tool.",
        "Analyze a public dataset and present trend, anomaly, and KPI insights in a polished report.",
        "Create a customer segmentation case study with data cleaning, exploratory analysis, and recommendations.",
    ],
    "Business Intelligence Analyst": [
        "Design an executive dashboard that tracks business KPIs and drill-down insights.",
        "Combine SQL queries and Power BI storytelling in a stakeholder-facing analytics case study.",
        "Create a reporting workflow that refreshes data and highlights monthly performance changes.",
    ],
    "Data Scientist": [
        "Build a predictive model project with feature engineering, evaluation, and business interpretation.",
        "Create an end-to-end notebook that explains model choice, metrics, and deployment considerations.",
        "Compare multiple modeling approaches on one dataset and summarize trade-offs clearly.",
    ],
    "Machine Learning Engineer": [
        "Deploy a trained model behind an API and document the inference workflow.",
        "Create a reproducible ML pipeline with preprocessing, training, and versioned outputs.",
        "Package a model service with Docker and add basic monitoring or evaluation logging.",
    ],
    "Backend Developer": [
        "Build a REST API with authentication, validation, and relational database support.",
        "Create a service-oriented backend project with logging, error handling, and testing.",
        "Design a production-style backend for a realistic business workflow and document the API contract.",
    ],
    "Frontend Developer": [
        "Build a responsive dashboard that handles loading, empty, and error states gracefully.",
        "Create a polished multi-section product UI with reusable components and form validation.",
        "Integrate a frontend app with a real backend API and document the user flow.",
    ],
    "Full Stack Developer": [
        "Ship a complete web app with frontend, backend, database, and authentication.",
        "Build a portfolio project that includes admin workflows, analytics, and deployment.",
        "Create a real-world CRUD platform and document both architecture and user flows.",
    ],
    "Python Developer": [
        "Automate a repetitive workflow with Python and show measurable time savings.",
        "Build a small Python API or data-processing service and document how it is used.",
        "Create a Python project that combines scripting, file handling, and clean modular code.",
    ],
    "DevOps Engineer": [
        "Automate CI/CD for a sample application with build, test, and deploy stages.",
        "Containerize a service stack and define an environment promotion workflow.",
        "Create a deployment reliability project with monitoring and rollback steps.",
    ],
    "QA Engineer": [
        "Automate regression tests for a realistic web app flow.",
        "Build an API testing suite that validates success, failure, and edge-case behavior.",
        "Create a quality dashboard that tracks defects, test coverage, and release readiness.",
    ],
}


def build_ai_assistance(
    profile_context: str,
    parsed_profile: UserProfile,
    recommendation: dict,
    parse_confidence: float,
    clarification_questions: list[str],
) -> AIAssistance:
    prompt = f"""
You are an AI career coach.
Create a concise, practical explanation for a student based on:
1. their original free-text profile,
2. the structured profile extracted from it,
3. the rule-based recommendation returned by the career engine.

You must not change the recommendation role. You are only improving the explanation and action plan.
Keep the language professional, supportive, and concrete.

Profile context:
{profile_context}

Structured profile:
Education: {parsed_profile.education}
Interests: {", ".join(parsed_profile.interests) or "None provided"}
Skills: {", ".join(f"{skill.name} (rating {skill.rating}/10, {skill.projects} projects)" for skill in parsed_profile.skills)}

Rule-based recommendation:
Role: {recommendation["role"]}
Domain: {recommendation["domain"]}
Subdomain: {recommendation["subdomain"]}
Readiness: {recommendation["readiness_level"]}
Score: {recommendation["score"]}
Matched skills: {", ".join(recommendation["matched_skills"]) or "None"}
Missing skills: {", ".join(recommendation["missing_skills"]) or "None"}
Next steps: {", ".join(recommendation["next_steps"]) or "None"}

Return JSON only.
""".strip()

    raw, model_used = gemini_client.generate_json(prompt, AI_EXPLANATION_SCHEMA)

    return AIAssistance(
        model=model_used,
        parse_confidence=parse_confidence,
        summary=raw.get("summary", "").strip(),
        roadmap=[step.strip() for step in raw.get("roadmap", []) if step.strip()],
        project_ideas=[
            project.strip() for project in raw.get("project_ideas", []) if project.strip()
        ],
        clarification_questions=[question.strip() for question in clarification_questions if question.strip()],
    )


def build_profile_context(parsed_profile: UserProfile) -> str:
    return "\n".join(
        [
            f"Education: {parsed_profile.education or 'Not provided'}",
            f"Interests: {', '.join(parsed_profile.interests) or 'Not provided'}",
            "Skills: "
            + ", ".join(
                f"{skill.name} ({skill.rating}/10, {skill.projects} projects)"
                for skill in parsed_profile.skills
            ),
        ]
    )


def build_fallback_ai_assistance(
    parsed_profile: UserProfile,
    recommendation: dict,
    parse_confidence: float,
    clarification_questions: list[str],
) -> AIAssistance:
    matched_skills = ", ".join(recommendation["matched_skills"]) or "your current transferable strengths"
    missing_skills = ", ".join(recommendation["missing_skills"][:3]) or "a few smaller improvements"
    interests = ", ".join(parsed_profile.interests) or recommendation["domain"]

    summary = (
        f"{recommendation['role']} is currently the strongest path because your profile aligns through "
        f"{matched_skills}, and your stated interests connect well with {interests}. "
        f"To improve readiness further, focus next on {missing_skills}."
    )

    roadmap = [
        recommendation["transition_path"],
        *recommendation["next_steps"][:3],
    ]

    project_ideas = PROJECT_TEMPLATES.get(
        recommendation["role"],
        [
            f"Build one portfolio project that demonstrates {recommendation['role']} skills in a practical setting.",
            f"Create a case study that highlights how you solved a realistic {recommendation['domain'].lower()} problem.",
        ],
    )

    return AIAssistance(
        model="rule-based-guidance",
        parse_confidence=parse_confidence,
        summary=summary,
        roadmap=roadmap[:4],
        project_ideas=project_ideas[:3],
        clarification_questions=[question.strip() for question in clarification_questions if question.strip()],
    )
