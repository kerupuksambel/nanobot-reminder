from nanobot.agent.tools.base import Tool
from nanobot.providers.base import LLMProvider
import json, re
from datetime import date

class ParsePlanTool(Tool):
    name = "parse_plan"
    description = (
        "Takes a free-form project description from the user and returns "
        "a structured list of milestones with titles, goals, and "
        "AI-estimated deadlines. Input is raw chat text, not a file."
    )
    parameters = {
        "type": "object",
        "properties": {
            "plan_text": {
                "type": "string",
                "description": "The user's free-form project description from chat"
            },
            "context": {
                "type": "string",
                "description": (
                    "Optional: any extra context from earlier in the conversation "
                    "useful for deadline estimation (e.g. 'user mentioned 2 weeks'"
                    " or 'user is working part-time')"
                )
            }
        },
        "required": ["plan_text"]
    }

    def __init__(self, provider: LLMProvider):
        self._provider = provider

    async def execute(self, plan_text: str, context: str = "") -> str:
        today = date.today().isoformat()

        # Detect if the description is too thin to work with
        if len(plan_text.split()) < 15:
            return (json.dumps({
                "needs_clarification": True,
                "question": (
                    "Could you tell me a bit more? I'd like to know: "
                    "what are you building, what are the main phases you have in mind, "
                    "and do you have a target completion date?"
                )
            }))

        prompt = f"""Today is {today}.
{f'Extra context: {context}' if context else ''}

A user has described a coding project in chat. Extract every meaningful
deliverable phase as a milestone and estimate realistic deadlines.

Be specific in the goal descriptions — they will later be used as a code
review rubric, so each goal must clearly state what "done" looks like.

Return ONLY a JSON array, no markdown fences, no prose:
[
  {{
    "id": 1,
    "title": "Short milestone name",
    "goal": "Concrete description of what done looks like for this phase",
    "deadline": "YYYY-MM-DD",
    "status": "pending"
  }}
]

User's project description:
{plan_text}
"""
        response = await self._provider.complete(prompt)

        clean = re.sub(r"```[a-z]*", "", response).strip().strip("`")
        milestones = json.loads(clean)
        return (json.dumps(milestones, indent=2))

## What a conversation now looks like
## ```
## You:  I want to build a habit tracker app in React + Supabase. 
##       It needs auth, a dashboard to log habits, streak tracking, 
##       and a simple stats page. I'd like to finish in about 6 weeks.
## 
## Bot:  Here's your draft plan — let me know what to change:
## 
##       1. Project setup  →  due Mar 18
##          Goal: Vite + React scaffold, Supabase project created, 
##                auth tables migrated, env vars configured, CI passing
## 
##       2. Authentication  →  due Mar 22
##          Goal: Email/password sign-up and login working, 
##                protected routes, session persistence
## 
##       3. Habit logging  →  due Apr 1
##          Goal: CRUD for habits, daily log entry UI, 
##                data persisted to Supabase
## 
##       4. Streak tracking  →  due Apr 12
##          Goal: Streak calculation logic, displayed on dashboard, 
##                unit tested
## 
##       5. Stats page  →  due Apr 22
##          Goal: Completion rates chart, longest streak, 
##                weekly breakdown view
## 
##       Reply with any changes, or say confirm to lock this in.
## 
## You:  Split milestone 3 — logging and the UI should be separate.
##       Also give me until Apr 8 for the UI part.
## 
## Bot:  Updated plan:
## 
##       1. Project setup        →  due Mar 18  ✓
##       2. Authentication       →  due Mar 22  ✓
##       3. Habit data layer     →  due Apr 1
##          Goal: CRUD API for habits, Supabase schema, 
##                RLS policies, integration tests
##       4. Habit logging UI     →  due Apr 8
##          Goal: Daily log entry interface, habit list view, 
##                connected to data layer
##       5. Streak tracking      →  due Apr 15
##       6. Stats page           →  due Apr 25
## 
##       Still editing or ready to confirm?
## 
## You:  confirm
## 
## Bot:  Locked in! 6 milestones saved. Daily reminders start 
##       tomorrow at 9 AM. Good luck on milestone 1: "Project setup"!