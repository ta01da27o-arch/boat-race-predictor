import random

DECISION_TYPES = ["逃げ", "差し", "まくり", "まくり差し"]

def predict_race(entries):
    """
    単純AI: コースによる決まり手予測
    """
    if not entries:
        return "未取得"
    for entry in entries:
        if entry['コース'] == 1:
            return "1コースの逃げ"
        elif entry['コース'] in [2,3]:
            return f"{entry['コース']}コースの差し"
    return f"{random.choice(entries)['コース']}コースの{random.choice(DECISION_TYPES)}"