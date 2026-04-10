def generate_explanation(
    role,
    matched,
    missing,
    score,
    readiness,
    transition,
    matched_interests,
    recommendation_type,
):
    matched_str = ", ".join(matched) if matched else "no strong matching skills yet"
    missing_str = ", ".join(missing[:3]) if missing else "only a few small gaps"

    if matched_interests:
        interest_sentence = (
            f"Your stated interests align with this path through {', '.join(matched_interests)}."
        )
    else:
        interest_sentence = "This role is being recommended primarily from your current capability profile."

    return (
        f"{role} is the strongest recommendation right now with a score of {round(score, 2)} "
        f"and a {recommendation_type.lower()}. "
        f"Your strongest evidence comes from {matched_str}. "
        f"{interest_sentence} "
        f"To improve readiness from {readiness.lower()} to the next level, focus on {missing_str}. "
        f"Suggested path: {transition}."
    )
