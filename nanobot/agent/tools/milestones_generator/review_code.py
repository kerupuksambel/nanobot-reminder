from nanobot.agent.tools.base import Tool
from nanobot.providers.base import LLMProvider
import httpx, re

class ReviewCodeTool(Tool):
    def __init__(self, provider: LLMProvider):
        self._provider = provider

    name = "review_code"
    description = (
        "Fetches a GitHub repo or PR URL, reads the code diff/files, "
        "and decides whether the work meets the milestone goal. "
        "Returns PASS or FAIL with detailed feedback."
    )
    parameters = {
        "type": "object",
        "properties": {
            "github_url": {
                "type": "string",
                "description": "GitHub repo, PR, or commit URL"
            },
            "milestone_goal": {
                "type": "string",
                "description": "The goal text for the milestone being reviewed"
            }
        },
        "required": ["github_url", "milestone_goal"]
    }

    async def execute(self, github_url: str, milestone_goal: str) -> str:
        code_content = await self._fetch_github(github_url)

        prompt = f"""You are a strict but fair code reviewer acting as a gatekeeper.

Milestone goal:
{milestone_goal}

Submitted code:
{code_content[:12000]}

Decide: does this submission adequately achieve the milestone goal?

Respond with exactly this format:
VERDICT: PASS   (or FAIL)
FEEDBACK:
<2-5 bullet points — what was done well, and if FAIL, specifically what is missing>
"""
        response = await self._provider.complete(prompt)

        verdict = "PASS" if "VERDICT: PASS" in response else "FAIL"
        return response

    async def _fetch_github(self, url: str) -> str:
        """Convert a GitHub URL to its raw API equivalent and fetch content."""
        # Handle PR URLs: fetch the diff
        pr_match = re.search(r"github\.com/([^/]+)/([^/]+)/pull/(\d+)", url)
        if pr_match:
            owner, repo, pr = pr_match.groups()
            api = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr}/files"
            async with httpx.AsyncClient() as client:
                r = await client.get(api, headers={"Accept": "application/vnd.github+json"})
                files = r.json()
                parts = []
                for f in files[:10]:  # cap at 10 files
                    patch = f.get("patch", "")
                    parts.append(f"### {f['filename']}\n{patch}")
                return "\n\n".join(parts)

        # Handle plain repo URLs: fetch file tree + README
        repo_match = re.search(r"github\.com/([^/]+)/([^/]+?)(?:\.git)?$", url)
        if repo_match:
            owner, repo = repo_match.groups()
            async with httpx.AsyncClient() as client:
                readme_r = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/readme",
                    headers={"Accept": "application/vnd.github.raw"}
                )
                tree_r = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/git/trees/HEAD?recursive=1"
                )
                tree = [f["path"] for f in tree_r.json().get("tree", []) if f["type"] == "blob"]
                return f"README:\n{readme_r.text}\n\nFiles:\n" + "\n".join(tree[:80])

        # Fallback: fetch raw URL
        async with httpx.AsyncClient() as client:
            r = await client.get(url)
            return r.text[:12000]