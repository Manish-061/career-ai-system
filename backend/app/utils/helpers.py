import json
from pathlib import Path


def load_knowledge_base():
    knowledge_base_path = (
        Path(__file__).resolve().parent.parent / "data" / "knowledge_base.json"
    )

    with knowledge_base_path.open(encoding="utf-8") as file:
        return json.load(file)
