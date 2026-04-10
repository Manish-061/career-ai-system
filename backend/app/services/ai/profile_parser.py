import re
from functools import lru_cache

from app.models.ai_models import ParsedProfileResponse
from app.models.user_profile import SkillInput, UserProfile
from app.services.ai.gemini_client import GeminiClientError, gemini_client
from app.utils.helpers import load_knowledge_base


PROFILE_PARSE_SCHEMA = {
    "type": "object",
    "properties": {
        "education": {"type": "string"},
        "interests": {
            "type": "array",
            "items": {"type": "string"},
        },
        "skills": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "rating": {"type": "integer", "minimum": 1, "maximum": 10},
                    "projects": {"type": "integer", "minimum": 0},
                },
                "required": ["name", "rating", "projects"],
                "additionalProperties": False,
            },
        },
        "parse_confidence": {"type": "number", "minimum": 0, "maximum": 1},
        "clarification_questions": {
            "type": "array",
            "items": {"type": "string"},
        },
    },
    "required": [
        "education",
        "interests",
        "skills",
        "parse_confidence",
        "clarification_questions",
    ],
    "additionalProperties": False,
}


WORD_TO_NUMBER = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
}

INTEREST_HINTS = {
    "data analyst": "data analysis",
    "data analytics": "data analysis",
    "analytics": "data analysis",
    "machine learning": "machine learning",
    "data science": "data science",
    "backend": "backend",
    "frontend": "frontend",
    "full stack": "full stack development",
    "web development": "web development",
    "cybersecurity": "cybersecurity",
    "cloud": "cloud",
    "devops": "devops",
    "testing": "testing",
    "qa": "testing",
    "ui/ux": "ui design",
    "product": "product analytics",
}

EDUCATION_PATTERNS = [
    r"b\.tech(?: in [a-z &]+)?",
    r"m\.tech(?: in [a-z &]+)?",
    r"bca",
    r"mca",
    r"b\.sc(?: in [a-z &]+)?",
    r"m\.sc(?: in [a-z &]+)?",
    r"bachelor(?:'s)?(?: degree)?(?: in [a-z &]+)?",
    r"master(?:'s)?(?: degree)?(?: in [a-z &]+)?",
    r"diploma(?: in [a-z &]+)?",
]


@lru_cache(maxsize=1)
def _parser_resources():
    knowledge_base = load_knowledge_base()
    alias_map: dict[str, str] = {}

    for alias, canonical in knowledge_base.get("skill_aliases", {}).items():
        alias_map[alias.lower()] = canonical

    for role_data in knowledge_base.get("roles", {}).values():
        for canonical_skill in role_data.get("skills", {}).keys():
            alias_map.setdefault(canonical_skill.lower(), canonical_skill)

    interest_bank = set()
    for role_data in knowledge_base.get("roles", {}).values():
        for interest in role_data.get("interests", []):
            cleaned = interest.strip().lower()
            if cleaned:
                interest_bank.add(cleaned)

    return alias_map, interest_bank


def _clean_list(values):
    return [value.strip() for value in values if value and value.strip()]


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _search_phrase(text: str, phrase: str) -> bool:
    escaped = re.escape(phrase)
    pattern = rf"(?<![a-z0-9]){escaped}(?![a-z0-9])"
    return re.search(pattern, text, flags=re.IGNORECASE) is not None


def _to_title_phrase(value: str) -> str:
    preserved = {"ui", "ux", "qa", "sql", "api", "ml", "ai", "bi"}
    parts = []
    for token in value.split():
        if token.lower() in preserved:
            parts.append(token.upper())
        else:
            parts.append(token.capitalize())
    return " ".join(parts)


def _extract_education(text: str) -> str:
    for pattern in EDUCATION_PATTERNS:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            return _to_title_phrase(_normalize_whitespace(match.group(0)))

    if "student" in text or "undergraduate" in text:
        return "Student"

    return ""


def _find_interests(text: str) -> list[str]:
    alias_map, interest_bank = _parser_resources()
    skill_names = {value.lower() for value in alias_map.values()}
    matches: list[str] = []

    for interest in sorted(interest_bank, key=len, reverse=True):
        if _search_phrase(text, interest):
            formatted = _to_title_phrase(interest)
            if formatted.lower() not in skill_names:
                matches.append(formatted)

    for phrase, normalized in INTEREST_HINTS.items():
        if _search_phrase(text, phrase):
            formatted = _to_title_phrase(normalized)
            if formatted.lower() not in skill_names and formatted not in matches:
                matches.append(formatted)

    return matches[:5]


def _parse_number(token: str) -> int | None:
    cleaned = token.strip().lower()
    if cleaned.isdigit():
        return int(cleaned)
    return WORD_TO_NUMBER.get(cleaned)


def _estimate_rating(text: str, alias: str) -> int:
    escaped = re.escape(alias)
    number_patterns = [
        rf"{escaped}.{{0,24}}?(\d{{1,2}})\s*(?:/\s*10)?",
        rf"(\d{{1,2}})\s*(?:/\s*10)?.{{0,18}}?{escaped}",
    ]
    for pattern in number_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            value = max(1, min(10, int(match.group(1))))
            return value

    qualifier_patterns = [
        (8, ["advanced", "expert", "very strong", "highly proficient"]),
        (7, ["strong", "proficient", "comfortable", "good"]),
        (6, ["working knowledge", "intermediate"]),
        (4, ["basic", "beginner", "familiar", "little"]),
    ]

    context_match = re.search(rf".{0,36}{escaped}.{{0,36}}", text, flags=re.IGNORECASE)
    context = context_match.group(0).lower() if context_match else text.lower()

    for score, qualifiers in qualifier_patterns:
        if any(qualifier in context for qualifier in qualifiers):
            return score

    return 6


def _estimate_projects(text: str, alias: str) -> int:
    escaped = re.escape(alias)
    project_patterns = [
        rf"{escaped}.{{0,36}}?(\d+|one|two|three|four|five)\s+(?:projects?|apps?|dashboards?|apis?|websites?)",
        rf"(\d+|one|two|three|four|five)\s+(?:projects?|apps?|dashboards?|apis?|websites?).{{0,24}}?{escaped}",
    ]
    for pattern in project_patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        if match:
            parsed = _parse_number(match.group(1))
            if parsed is not None:
                return max(0, parsed)

    general_match = re.search(
        r"(\d+|one|two|three|four|five)\s+(?:projects?|apps?|dashboards?|apis?|websites?)",
        text,
        flags=re.IGNORECASE,
    )
    if general_match:
        parsed = _parse_number(general_match.group(1))
        if parsed is not None:
            return max(0, min(parsed, 3))

    if re.search(r"\b(project|portfolio|internship|built|developed|created)\b", text, flags=re.IGNORECASE):
        return 1

    return 0


def _find_skills(text: str) -> list[SkillInput]:
    alias_map, _ = _parser_resources()
    detected: dict[str, SkillInput] = {}

    for alias in sorted(alias_map.keys(), key=len, reverse=True):
        if not _search_phrase(text, alias):
            continue

        canonical = alias_map[alias]
        existing = detected.get(canonical)
        rating = _estimate_rating(text, alias)
        projects = _estimate_projects(text, alias)

        if existing is None:
            detected[canonical] = SkillInput(name=canonical, rating=rating, projects=projects)
        else:
            detected[canonical] = SkillInput(
                name=canonical,
                rating=max(existing.rating, rating),
                projects=max(existing.projects, projects),
            )

    return list(detected.values())[:8]


def _build_clarification_questions(profile: UserProfile) -> list[str]:
    questions: list[str] = []

    if not profile.education:
        questions.append("What is your current education background or degree program?")
    if not profile.interests:
        questions.append("Which roles or work areas interest you most right now?")
    if len(profile.skills) < 2:
        questions.append("Which other tools, languages, or platforms have you used in projects or coursework?")

    return questions[:3]


def _build_parse_confidence(profile: UserProfile, *, heuristic: bool) -> float:
    score = 0.35 if heuristic else 0.55
    if profile.education:
        score += 0.15
    if profile.interests:
        score += 0.12
    score += min(len(profile.skills), 4) * 0.08
    if any(skill.projects > 0 for skill in profile.skills):
        score += 0.08
    return round(min(score, 0.92 if not heuristic else 0.78), 2)


def _build_profile_response(profile: UserProfile, *, model: str, heuristic: bool) -> ParsedProfileResponse:
    return ParsedProfileResponse(
        parsed_profile=profile,
        parse_confidence=_build_parse_confidence(profile, heuristic=heuristic),
        clarification_questions=_build_clarification_questions(profile),
        model=model,
    )


def _heuristic_parse(profile_text: str) -> ParsedProfileResponse:
    lowered = profile_text.lower()
    profile = UserProfile(
        education=_extract_education(lowered),
        interests=_find_interests(lowered),
        skills=_find_skills(lowered),
    )

    if not profile.skills:
        raise GeminiClientError(
            "Gemini is temporarily unavailable and the backup parser could not confidently detect any skills. Please add a few skills manually or describe your tools and projects more explicitly.",
            retriable=False,
        )

    return _build_profile_response(profile, model="heuristic-parser", heuristic=True)


def parse_free_text_profile(profile_text: str) -> ParsedProfileResponse:
    prompt = f"""
You are helping normalize a career profile for a recommendation engine.
Convert the user's free-text profile into strict JSON.

Rules:
- Infer only what is reasonably supported by the text.
- If education is missing, return an empty string.
- Interests must be short phrases.
- Skills must include a rating from 1 to 10 and project count from 0 upward.
- Be conservative when estimating ratings and project counts.
- If important information is missing, include up to 3 clarification questions.
- Return JSON only.

User profile:
{profile_text}
""".strip()

    try:
        raw, model_used = gemini_client.generate_json(prompt, PROFILE_PARSE_SCHEMA)

        skills = []
        for skill in raw.get("skills", []):
            name = skill.get("name", "").strip()
            if not name:
                continue

            rating = int(max(1, min(10, skill.get("rating", 5))))
            projects = int(max(0, skill.get("projects", 0)))
            skills.append(SkillInput(name=name, rating=rating, projects=projects))

        parsed_profile = UserProfile(
            education=raw.get("education", "").strip(),
            interests=_clean_list(raw.get("interests", [])),
            skills=skills,
        )

        if not parsed_profile.skills:
            return _heuristic_parse(profile_text)

        return ParsedProfileResponse(
            parsed_profile=parsed_profile,
            parse_confidence=float(raw.get("parse_confidence", 0.62)),
            clarification_questions=_clean_list(raw.get("clarification_questions", [])),
            model=model_used,
        )
    except GeminiClientError:
        return _heuristic_parse(profile_text)

