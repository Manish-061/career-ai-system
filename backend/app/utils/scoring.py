def normalize_rating(rating):
    return rating / 10


def normalize_projects(projects):
    return min(projects / 5, 1)


def compute_skill_score(rating, projects):
    r = normalize_rating(rating)
    p = normalize_projects(projects)
    return (0.7 * r) + (0.3 * p)