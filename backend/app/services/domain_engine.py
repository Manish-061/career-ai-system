def get_domain_weights(domain):
    if domain == "Technology":
        return {"skill": 0.6, "project": 0.3, "education": 0.1}

    elif domain == "Medical":
        return {"skill": 0.2, "project": 0.1, "education": 0.7}

    elif domain == "Commerce":
        return {"skill": 0.5, "project": 0.1, "education": 0.4}

    elif domain == "Arts":
        return {"skill": 0.4, "project": 0.5, "education": 0.1}

    else:
        return {"skill": 0.5, "project": 0.3, "education": 0.2}