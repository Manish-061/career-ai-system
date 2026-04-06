import json


def load_knowledge_base():
    with open("app/data/knowledge_base.json") as f:
        return json.load(f)