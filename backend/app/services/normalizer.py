import re


def normalize_text(value: str) -> str:
    cleaned = re.sub(r"[^a-z0-9+#]+", " ", value.strip().lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def normalize_skill_name(name: str, skill_aliases=None) -> str:
    normalized = normalize_text(name)
    if skill_aliases:
        return skill_aliases.get(normalized, normalized)
    return normalized


def build_user_skill_map(profile, compute_skill_score, skill_aliases=None):
    user_skill_map = {}

    for skill in profile.skills:
        normalized_name = normalize_skill_name(skill.name, skill_aliases)
        score = compute_skill_score(skill.rating, skill.projects)

        # Keep the strongest evidence when a user enters similar skills twice.
        user_skill_map[normalized_name] = max(user_skill_map.get(normalized_name, 0), score)

    return user_skill_map
