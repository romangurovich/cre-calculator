---
name: openspec-sync-specs
description: Sync delta specs from an OpenSpec change into main specs. Use before archiving when change specs diverge from openspec/specs.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.2.0"
---

Sync delta specs from a change into main specs.

**Input**: Optional change name. If omitted, infer from conversation or prompt the user to select an active change.

---

## Steps

1. **Select change**

   - If name is provided, use it.
   - Otherwise run:
     ```bash
     openspec list --json
     ```
   - If exactly one active change exists, select it.
   - If multiple exist, ask the user to choose.

2. **Read status and locate delta specs**

   - Run:
     ```bash
     openspec status --change "<name>" --json
     ```
   - Read delta specs under:
     - `openspec/changes/<name>/specs/*/spec.md`
   - For each delta spec, locate corresponding main spec:
     - `openspec/specs/<capability>/spec.md`

3. **Apply delta operations**

   Parse each delta spec section and apply in order:

   - `## ADDED Requirements`
     - Append new requirement blocks to main spec.
     - If main spec does not exist, create it with the added requirements.

   - `## MODIFIED Requirements`
     - Replace the entire matching requirement block in main spec by requirement title.
     - If no exact match exists, pause and ask for guidance.

   - `## REMOVED Requirements`
     - Remove matching requirement block from main spec.
     - Keep reason/migration notes in sync summary.

   - `## RENAMED Requirements`
     - Rename matching requirement header from `FROM` to `TO` while preserving body and scenarios.

4. **Normalize output format**

   - Main specs should contain requirement/scenario blocks directly (without delta operation wrappers).
   - Preserve untouched requirements and scenario ordering where possible.
   - Avoid duplicate requirement headers.

5. **Validate and report**

   - Run validation when available:
     ```bash
     openspec validate
     ```
   - Return a summary:
     - Capabilities synced
     - Operations applied (added/modified/removed/renamed)
     - Files created or updated
     - Any ambiguities or manual decisions

## Guardrails

- Do not edit change delta specs while syncing main specs.
- Do not drop scenarios when modifying requirements.
- If a MODIFIED/REMOVED/RENAMED target cannot be found, pause and ask.
- Keep edits minimal and scoped only to affected capability specs.
