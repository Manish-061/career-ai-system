def normalize_skill_name(name: str) -> str:
    return name.strip().lower()


def build_user_skill_map(profile, compute_skill_score):
    user_skill_map = {}

    for s in profile.skills:
        normalized_name = normalize_skill_name(s.name)
        score = compute_skill_score(s.rating, s.projects)
        user_skill_map[normalized_name] = score

    return user_skill_map