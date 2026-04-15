from app.models.ai_models import GenerationAction, GenerationResponse
from app.models.user_profile import UserProfile
from app.services.ai.gemini_client import GeminiClientError, gemini_client


GENERATION_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "content": {"type": "string"},
        "suggestions": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 2,
            "maxItems": 4,
        },
    },
    "required": ["title", "content", "suggestions"],
    "additionalProperties": False,
}

ACTION_LABELS = {
    "roadmap": "Multi-Day Roadmap",
    "project_ideas": "Project Ideas",
    "career_alternatives": "Career Alternatives",
    "chat": "Career Chat",
}

ACTION_INSTRUCTIONS = {
    "roadmap": (
        "Create a practical multi-day roadmap. Break it into phases or day ranges, "
        "include concrete learning tasks, portfolio milestones, and one measurable checkpoint per phase."
    ),
    "project_ideas": (
        "Create project ideas tailored to the recommended role. For each project, include goal, stack, "
        "core deliverables, and what skill gap it closes."
    ),
    "career_alternatives": (
        "Suggest realistic nearby career alternatives. For each one, explain why it fits, what gaps remain, "
        "and how it compares with the primary recommendation."
    ),
    "chat": (
        "You are a conversational AI career assistant. Answer the user's question or request "
        "thoroughly and helpfully. You can discuss anything career-related: interview tips, "
        "resume advice, skill development strategies, industry insights, salary negotiation, "
        "job search tactics, networking advice, or anything else the user asks about. "
        "Keep responses practical, actionable, and tailored to the user's profile and recommendation."
    ),
}

FALLBACK_SUGGESTIONS = {
    "roadmap": [
        "Ask for a shorter 14-day version.",
        "Request a version focused only on weekends.",
        "Ask for a roadmap optimized for internships.",
    ],
    "project_ideas": [
        "Ask for beginner-friendly ideas only.",
        "Request projects using your current strongest tools.",
        "Ask for one project that can be finished in two weeks.",
    ],
    "career_alternatives": [
        "Ask for safer entry-level options.",
        "Request alternatives closer to your strongest skills.",
        "Ask for alternatives with faster portfolio readiness.",
    ],
    "chat": [
        "What skills should I focus on next?",
        "How can I improve my resume?",
        "What are common interview questions for my target role?",
    ],
}


def _build_profile_block(profile: UserProfile) -> str:
    return "\n".join(
        [
            f"Education: {profile.education or 'Not provided'}",
            f"Interests: {', '.join(profile.interests) or 'Not provided'}",
            "Skills: "
            + ", ".join(
                f"{skill.name} ({skill.rating}/10, {skill.projects} projects)"
                for skill in profile.skills
            ),
        ]
    )


def _fallback_content(action: GenerationAction, prompt: str, recommendation: dict) -> str:
    role = recommendation["role"]
    gaps = recommendation["missing_skills"][:3]
    next_steps = recommendation["next_steps"]
    alternatives = recommendation["alternative_roles"][:3]

    if action == "roadmap":
        gap_text = ", ".join(gaps) if gaps else "advanced portfolio polish"
        roadmap_lines = [
            f"Week 1-2: Strengthen the foundations needed for {role}, especially {gap_text}.",
            f"Week 3-4: Apply the learning through one focused portfolio project tied to {role}.",
            f"Week 5-6: Refine the project, write a case study, and prepare for internship or entry-level applications.",
            "Checkpoint: At the end of each phase, document what you built, what improved, and what still feels weak.",
            f"Prompt focus: {prompt}",
        ]
        return "\n".join(roadmap_lines)

    if action == "project_ideas":
        return "\n".join(
            [
                f"1. Core portfolio project for {role}: build something that demonstrates your strongest matched skills.",
                f"2. Gap-closing project: design a mini-project focused on {', '.join(gaps) if gaps else 'one advanced capability for the role'}.",
                f"3. Presentation project: convert your work into a polished case study or dashboard that recruiters can review quickly.",
                f"Prompt focus: {prompt}",
            ]
        )

    if action == "career_alternatives":
        return "\n".join(
            [
                f"Primary recommendation remains {role}. Nearby alternatives include {', '.join(alternatives) if alternatives else 'roles close to your current strengths'}.",
                "For each alternative, compare three things: entry barrier, missing skills, and how quickly you can build proof of work.",
                "Choose the alternative that reduces your biggest gap while still keeping you close to your long-term target.",
                f"Prompt focus: {prompt}",
            ]
        )

    # chat (open-ended fallback)
    return "\n".join(
        [
            f"Based on your profile and recommendation for {role}:",
            f"Your strongest matched skills are solid, but consider closing gaps in: {', '.join(gaps) if gaps else 'advanced areas for the role'}.",
            f"Key next steps: {'; '.join(next_steps[:3]) if next_steps else 'Build a focused portfolio project and refine your resume.'}.",
            f"Prompt focus: {prompt}",
        ]
    )


def generate_interactive_content(
    action: GenerationAction,
    prompt: str,
    profile: UserProfile,
    recommendation: dict,
    existing_output: str = "",
) -> GenerationResponse:
    action_label = ACTION_LABELS[action]
    instruction = ACTION_INSTRUCTIONS[action]

    llm_prompt = f"""
You are a focused AI career generation assistant.
Generate content for the action: {action_label}

Requirements:
- Keep the content practical, readable, and polished.
- Use markdown headings and bullets when helpful.
- Tailor everything to the user's actual recommendation and current profile.
- Respect the user's extra prompt.
- If existing output is provided, refine or expand it rather than ignoring it.
- Do not change the recommended role unless the action explicitly asks for alternatives.

Profile:
{_build_profile_block(profile)}

Recommendation:
Role: {recommendation["role"]}
Domain: {recommendation["domain"]}
Subdomain: {recommendation["subdomain"]}
Readiness: {recommendation["readiness_level"]}
Matched Skills: {", ".join(recommendation["matched_skills"]) or "None"}
Missing Skills: {", ".join(recommendation["missing_skills"]) or "None"}
Suggested Transition: {recommendation["transition_path"]}

Action instruction:
{instruction}

User prompt:
{prompt}

Existing output:
{existing_output or "None"}

Return JSON only.
""".strip()

    try:
        raw, model_used = gemini_client.generate_json(llm_prompt, GENERATION_SCHEMA)
        return GenerationResponse(
            action=action,
            title=raw.get("title", action_label).strip() or action_label,
            content=raw.get("content", "").strip(),
            suggestions=[
                suggestion.strip()
                for suggestion in raw.get("suggestions", [])
                if suggestion.strip()
            ],
            model=model_used,
            warning=None,
        )
    except GeminiClientError as exc:
        return GenerationResponse(
            action=action,
            title=action_label,
            content=_fallback_content(action, prompt, recommendation),
            suggestions=FALLBACK_SUGGESTIONS[action],
            model="rule-based-guidance",
            warning=f"{exc} Falling back to rule-based generation.",
        )
