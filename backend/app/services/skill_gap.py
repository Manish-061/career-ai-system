def get_skill_gap(user_skill_map, role_skills):
    missing = []

    for skill in role_skills:
        if skill.lower() not in user_skill_map:
            missing.append(skill)

    return missing