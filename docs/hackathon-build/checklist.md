# StoryDNA Studio — Build Checklist

## Milestone 0 — Foundation and product contract

- [x] Inspect repository and local instructions.
- [x] Record existing state (empty greenfield workspace).
- [x] Confirm official API model ID and Structured Outputs support.
- [x] Define day-one scope and explicit cuts.
- [x] Write PRD and technical spec.
- [x] Define acceptance criteria and verification plan.

## Milestone 1 — Vertical slice foundation

- [x] Scaffold React, TypeScript, and Vite.
- [x] Add shared domain schemas and requested TypeScript types.
- [x] Add persisted Zustand workflow store.
- [x] Add server-only OpenAI boundary and environment example.
- [x] Add explicit deterministic demo fallback.
- [x] Verify typecheck and production build.

## Milestone 2 — Story intake

- [x] Implement cinematic responsive shell and stage navigation.
- [x] Implement accessible, validated intake form.
- [x] Persist draft fields locally.
- [x] Show progress and retry states.
- [x] Verify mobile and desktop layouts.

## Milestone 3 — StoryDNA analysis

- [x] Implement independent `analyzeStory` operation.
- [x] Validate structured response with Zod.
- [x] Render every analysis field with interpretation framing.
- [x] Preserve original source separately.
- [x] Verify API success, validation failure, and demo fallback.

## Milestone 4 — Three adaptive questions

- [x] Implement independent `generateClarifyingQuestions` operation.
- [x] Enforce exactly three questions in schema and UI.
- [x] Support answers, correction, and extra context.
- [x] Support requesting a different set without regenerating analysis.
- [x] Verify persistence and refresh behavior.

## Milestone 5 — Confirmed creative brief

- [x] Generate from labeled source, interpretation, corrections, and answers.
- [x] Make all brief fields editable.
- [x] Require explicit approval before scenes.
- [x] Protect approved decisions from silent overwrite.

## Milestone 6 — Editable scenes

- [x] Generate outline only from approved brief.
- [x] Add/edit/delete/reorder scenes with stable IDs.
- [x] Regenerate one scene without changing others.
- [x] Approve outline and preserve ordering.

## Milestone 7 — Image prompts

- [x] Generate detailed and short prompt per approved scene.
- [x] Add alternate framing, negative instructions, copy, and isolated regenerate.
- [x] Verify aspect ratio and consistency details propagate.

## Milestone 8 — Motion workspace

- [x] Add browser-local still uploads and scene-linked previews.
- [x] Generate an editable motion plan for one scene at a time.
- [x] Include action, camera, subject, environment, expression, duration, negatives, transition, and model category.
- [x] Preserve motion plans by stable scene ID without sending uploaded pixels to the planning API.

## Milestone 9 — Production estimate

- [x] Calculate finished runtime and minimum, expected, and high-retry generation ranges.
- [x] Add configurable platform label and attempts-per-scene assumption.
- [x] Derive explainable per-shot difficulty and flag likely difficult scenes.
- [x] Keep credit estimates hidden until a sample rate is configured.
- [x] Display an explicit estimate and no-current-pricing disclaimer.

## Milestone 10 — Production plan export

- [x] Export a readable Markdown director's packet.
- [x] Export versioned structured JSON with stable scene IDs.
- [x] Include source, interpretation, creator decisions, brief, scenes, prompts, motion, and estimate.
- [x] Exclude API credentials and browser-local image previews.
- [x] Verify generated content, safe filenames, and responsive export controls.

## Milestone 11 — Director's Commentary

- [x] Add one finished-clip upload with local preview and size/duration guards.
- [x] Sample a chronological visual sequence in the browser instead of claiming unsupported direct video vision.
- [x] Compare visible evidence with the source, StoryDNA, approved brief, scene plan, and motion plans.
- [x] Add gentle collaborator, direct editor, audience reaction, and AI-video technical modes.
- [x] Return four actionable feedback sections plus a nine-area scorecard.
- [x] State clearly that audio and continuous frame-to-frame motion are not analyzed.
- [x] Persist the latest structured report and include it in later exports.

## Later milestones

- [x] Netlify build, SPA fallback, serverless API routes, environment boundary, and payload hardening.
- [ ] Connect the real GitHub remote and verify the public production URL.
- [ ] Submission page, screenshots, and demo recording.
- [ ] Supabase Auth/Postgres/Storage and verified RLS policies.

## Release gate for each milestone

- [ ] Acceptance criteria demonstrated.
- [ ] Typecheck passes.
- [ ] Focused tests pass.
- [ ] Production build passes.
- [ ] Desktop and mobile visual states checked.
- [ ] Build notes updated with decisions, cuts, bugs, verification, and Devpost value.
