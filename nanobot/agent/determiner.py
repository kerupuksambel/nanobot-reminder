from nanobot.providers.base import LLMProvider
import json


from pathlib import Path
from typing import Any

from nanobot.agent.memory import MemoryStore
from nanobot.agent.skills import SkillsLoader

def __init__(self, workspace: Path):
    self.workspace = workspace
    self.memory = MemoryStore(workspace)
    self.skills = SkillsLoader(workspace)

async def determine_skills(prompt: str, provider: LLMProvider) -> list[str]:
    determination_prompt = f"""
    {prompt}

    See the skills you have, and determine the skills that you would use. Return ONLY in valid JSON array.
    """
    skills = await provider.chat_with_retry(determination_prompt)

    return json.loads(skills)
