# StoryDNA Studio — Hackathon Scope

## Product promise

**Keep your voice. Lose the production chaos.**

StoryDNA Studio is an attentive AI creative director for solo AI filmmakers. It interprets a creator's source material, exposes its interpretation for correction, asks three high-leverage questions, and only then turns the confirmed intent into a visual production plan.

## Success definition

The hackathon demo succeeds when a creator can move from a poem or story to a clarified creative intention and an editable visual production plan without feeling that the application replaced their voice.

## Day-one scope

The first demonstrable workflow includes:

1. Cinematic, responsive story intake.
2. Structured StoryDNA analysis.
3. Exactly three adaptive clarification questions.
4. User corrections and extra creative context.
5. Concise, editable confirmed creative brief with explicit approval.
6. Editable scene outline with stable scene IDs and isolated regeneration.
7. Per-scene image prompts.
8. Local browser persistence and clear stage/approval/loading state.

The first vertical slice implemented and verified is:

> Story input → StoryDNA analysis → exactly three clarification questions

## Original day-one deferrals

- Authentication and multi-user access.
- Supabase database, storage, and Row Level Security policies.
- Image uploads and motion workspace. *(Completed after day one.)*
- Finished-video upload and Director's Commentary. *(Completed after day one as local frame sampling.)*
- Current vendor pricing claims or live credit calculations.
- Payments, collaboration, and a large project database.
- Export formats and deployment automation. *(Export completed; deployment remains.)*

These are deferred until the day-one workflow works end to end.

Motion planning, local previews, production estimates, export, and Director's Commentary were subsequently added after the day-one release gate passed. Authentication, cloud storage, payments, and multi-user infrastructure remain deferred.

## Guardrails

- Never generate a final scene plan before clarification and brief approval.
- Preserve original source, AI interpretation, user corrections, and confirmed decisions as distinct data.
- Never silently overwrite approved creative decisions.
- Every model response is validated at the server boundary.
- OpenAI credentials remain server-side.
- Model choice is configured by environment variable.
- Exactly three questions must address ambiguities that materially change creative direction.
- Do not claim exact platform pricing unless configuration provides it.

## Acceptance criteria for the first vertical slice

- A creator can enter all required intake fields and optional character/tool context.
- Submitting valid source material visibly advances through analysis and question generation.
- Analysis displays every required StoryDNA field in a readable hierarchy.
- The application shows exactly three editable question answers.
- A creator can add a correction and extra creative context.
- A creator can request a different set of questions without losing the analysis.
- A refresh restores the active local project.
- API failures are legible and retryable.
- With no server API key, an explicit demo mode still provides a coherent deterministic walkthrough.
- Type checking, unit tests, production build, API smoke checks, and desktop/mobile visual checks pass.
