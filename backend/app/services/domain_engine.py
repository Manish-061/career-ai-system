def get_domain_weights(domain):
    if domain == "Technology":
        return {"skill": 0.45, "project": 0.2, "education": 0.1, "interest": 0.25}

    if domain == "Medical":
        return {"skill": 0.2, "project": 0.1, "education": 0.55, "interest": 0.15}

    if domain == "Commerce":
        return {"skill": 0.4, "project": 0.15, "education": 0.25, "interest": 0.2}

    if domain == "Arts":
        return {"skill": 0.3, "project": 0.3, "education": 0.1, "interest": 0.3}

    return {"skill": 0.4, "project": 0.2, "education": 0.2, "interest": 0.2}
