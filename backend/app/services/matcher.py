def match_skills(user_skill_map, role_skills):
    total_weight = sum(role_skills.values())
    matched_weight = 0

    matched = []
    missing = []

    for skill, weight in role_skills.items():
        if skill.lower() in user_skill_map:
            matched_weight += weight
            matched.append(skill)
        else:
            missing.append(skill)

    score = matched_weight / total_weight if total_weight > 0 else 0

    return score, matched, missing