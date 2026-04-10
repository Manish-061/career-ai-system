def match_skills(user_skill_map, role_skills):
    total_weight = sum(role_skills.values())
    weighted_match = 0
    coverage_weight = 0
    matched = []

    for skill, weight in role_skills.items():
        user_score = user_skill_map.get(skill.lower(), 0)

        if user_score > 0:
            weighted_match += weight * user_score
            coverage_weight += weight

            if user_score >= 0.35:
                matched.append(skill)

    normalized_score = weighted_match / total_weight if total_weight > 0 else 0
    coverage_score = coverage_weight / total_weight if total_weight > 0 else 0

    return {
        "score": normalized_score,
        "coverage": coverage_score,
        "matched": matched,
    }
