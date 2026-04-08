import random

def generate_ghost_name() -> str:
    adjectives = ["Silent", "Neon", "Cyber", "Void", "Crimson", "Shadow", "Quantum"]
    nouns = ["Panda", "Spectre", "Ronin", "Cipher", "Wraith", "Nomad", "Glitch"]
    number = random.randint(100, 999)
    
    return f"{random.choice(adjectives)}{random.choice(nouns)}_{number}"
