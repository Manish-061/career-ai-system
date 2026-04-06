def generate_explanation(role, matched, missing, score, readiness, transition):
    matched_str = ", ".join(matched) if matched else "no strong matching skills yet"
    missing_str = ", ".join(missing)

    return (
        f"You are best suited for {role} with a match score of {round(score,2)}. "
        f"Your strengths include {matched_str}. "
        f"You need to improve in {missing_str}. "
        f"Your readiness level is {readiness}. "
        f"Suggested path: {transition}."
    )