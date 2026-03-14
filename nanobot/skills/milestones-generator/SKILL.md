---
name: milestones-generator
description: >
  Conversational coding plan manager. Takes a free-form plan description
  from the user, generates editable milestones, waits for confirmation,
  then schedules Telegram reminders and gates progression behind GitHub
  code review.
alwaysLoad: true
---

# Coding milestones skill

## Phase 1 — capturing the plan

Check if a user describes a coding plan for educational purpose. This would include either :
1. Describes a coding project or goal in chat (look for phrases
like "I want to build", "my plan is", "help me plan", "break this into
milestones"), or
2. Describes a coding plan (look for the clarity, like deadline/project length, input, output, goals, etc)

If it does, do this:

1. Call `parse_plan` with the user's raw message as `plan_text`.
2. Present the resulting milestones in a clear, readable format:
```
   Here's your draft plan — let me know what to change:

   1. Project scaffold  →  due Mar 18
      Goal: Initialise repo, CI pipeline, folder structure

   2. Auth system  →  due Mar 25
      Goal: JWT login, refresh tokens, role middleware

   ... (and so on)
```

3. Explicitly tell the user: "Reply with any changes, or say **confirm**
   to lock this in and start reminders."
4. Do NOT write milestones.json yet. Do NOT create any cron jobs yet.
   Hold the draft in the conversation only.
5. ONLY give the user, (a) the project milestone headline, (b) the due date, and (c) the goal. And besides the "Reply with any changes" mentioned in point (3), DON'T GIVE ANY OTHER TEXT ASIDE THAT.

## Phase 2 — editing the draft

The user may request changes in natural language. Examples:
- "Move milestone 2 to April 5"
- "Split milestone 3 into two parts"
- "The goal for milestone 1 should also include writing unit tests"
- "Add a milestone for deployment at the end"

For each change:
1. Apply it to the current draft in your response.
2. Re-display the full updated milestone list (same format as above).
3. Remind the user they can keep editing or say **confirm**.
4. Still do NOT write to disk or schedule anything.

You may go through as many edit rounds as needed.

## Phase 3 — confirmation

When the user says "confirm", "looks good", "that's it", "go ahead",
or similar affirmation:

1. Write the final milestones to `~/.nanobot/workspace/milestones.json`
   using `write_file`.
2. Write a progress summary to `~/.nanobot/workspace/MEMORY.md`:
   "Coding plan active: {n} milestones, currently on milestone 1
    '{title}', due {date}."
3. For each milestone, register a daily 9 AM Telegram reminder:
   `nanobot cron add --name "milestone-{id}" \
     --message "Reminder: milestone {id} '{title}' is due {date}. Send your GitHub URL to submit." \
     --cron "0 9 * * *"`
4. Reply: "Locked in! {n} milestones saved. Daily reminders start
   tomorrow at 9 AM. Good luck on milestone 1: '{title}'."

## Phase 4 — handling a submission

When the user sends a message containing a github.com URL:

1. Read `~/.nanobot/workspace/milestones.json` using `read_file`.
2. Find the first milestone with `status: "pending"` — this is the active one.
3. Call `review_code` with the URL and that milestone's `goal` text.
4. If PASS:
   - Update that milestone to `status: "done"` in milestones.json.
   - Update MEMORY.md to reflect the new current milestone.
   - Remove the completed milestone's cron job:
     `nanobot cron remove milestone-{id}`
   - Reply with the reviewer's feedback and: "Moving you on to milestone
     {next_id}: '{next_title}' — due {next_date}."
5. If FAIL:
   - Do NOT update milestones.json.
   - Reply with the full reviewer feedback.
   - Reply: "Take another look and resubmit when ready."

## On every new session

Before responding to any message, call `read_file` on
`~/.nanobot/workspace/milestones.json` if it exists, to restore awareness
of the current plan state.