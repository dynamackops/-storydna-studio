# StoryDNA Studio — Build Notes

Running log for product decisions, scope cuts, bugs, verification, and submission-ready Codex contributions.

## 2026-07-18 — Kickoff and repository audit

### Decisions made

- Treat the workspace as greenfield: it contained no files, package metadata, Git repository, or local agent instructions.
- Use one React/Vite/TypeScript repository with a thin server-only API boundary.
- Keep `OPENAI_MODEL` configurable and document `gpt-5.6` as the example after confirming the official model listing.
- Use the Responses API with Structured Outputs and shared Zod validation.
- Keep the OpenAI API key server-only.
- Provide a clearly labeled deterministic demo mode when no key is configured, so the hackathon walkthrough remains reliable.
- Use Zustand local persistence for one active project.
- Use hand-authored design tokens/CSS in the initial slice to avoid introducing a utility layer before components stabilize.

### Features cut or deferred

- Authentication, Supabase, uploads, motion, estimates, Director's Commentary, exports, and deployment are deferred until the day-one creation loop works.
- The first implementation stops after StoryDNA analysis and exactly three clarification questions.

### Bugs encountered

- The official OpenAI Docs MCP connector was not installed. It was installed successfully, but newly installed MCP tools require a new Codex session; current model guidance was therefore checked through the skill's official-domain web fallback.
- The direct latest-model Markdown fetch returned an upstream fetch error; the official model catalog search result supplied the current model ID and capability confirmation.

### Verification results

- Repository audit: complete; empty workspace confirmed.
- Official model documentation: `gpt-5.6` alias and Responses API/Structured Outputs support confirmed on 2026-07-18.
- TypeScript typecheck: passed.
- Focused unit/contract tests: 4 passed across 2 test files.
- Production Vite build: passed (102 modules transformed).
- Live API smoke: analysis schema valid; exactly 3 questions; invalid input returns HTTP 400; guided-demo mode confirmed.
- Interactive browser: full intake → analysis → questions workflow passed.
- Question regeneration: replaced only the three-question set while preserving the existing analysis.
- Local persistence: selected answer restored after reload and all three question cards remained present.
- Responsive check: 390×844 viewport had no horizontal body overflow; analysis collapsed to one column; question cards used the intended compact two-column layout; stage navigation remained horizontally scrollable.
- Browser console: no warnings or errors.

### Codex contributions useful for Devpost

- Converted an expansive product vision into a staged, testable scope with explicit release gates.
- Designed a provenance-aware AI architecture that keeps source, interpretation, corrections, and approved decisions separate.
- Added a demo-resilient architecture that protects API credentials and still supports reliable judging without production infrastructure.
- Delivered a polished cinematic interface and complete first vertical slice with observable AI-operation state, correction affordances, and protected creator decisions.

### Bugs encountered during implementation

- Initial local server startup was blocked by the managed sandbox's socket policy; starting the same scoped `npm run dev` command with approval resolved it.
- TypeScript initially lacked Vite's CSS side-effect import declarations. Adding `src/vite-env.d.ts` fixed both typecheck and build.
- The browser's screenshot command timed out, so responsive verification used live DOM/accessibility inspection and computed layout measurements instead. Functional browser verification was unaffected.

## 2026-07-18 — Confirmed creative brief milestone

### Decisions made

- Added `createCreativeBrief` as a third independent structured AI operation rather than expanding either analysis or question generation.
- Labeled creator answers, corrections, and extra context as authoritative in the prompt; creator corrections explicitly override the unapproved AI interpretation.
- Made six brief sections editable before approval: intention, emotional destination, visual identity, character direction, constraints, and consistency requirements.
- Added an explicit provenance trail from original voice through interpretation and creator decisions to the brief.
- Approval converts the brief to read-only state and persists an approval timestamp. The UI exposes no silent regeneration path after approval.
- Scene generation remains visibly locked as the next milestone.

### Verification results

- TypeScript typecheck and production build: passed.
- Focused schema/demo tests: 6 passed across 2 files.
- Browser workflow: three answers → generated brief → edit → approval passed.
- Generated brief contained all six required editable sections.
- Approval converted every brief field to read-only state.
- Edited intention and approval state both survived browser refresh.
- Mobile 390×844 check: no horizontal overflow; fields, provenance, and approval actions collapsed to one column.
- Browser console: no warnings or errors.

### Codex contributions useful for Devpost

- Implemented the product's central trust mechanism: AI interpretation becomes an editable artifact, while creator-approved decisions become protected production context.
- Added a visual provenance model that makes the distinction between source, AI reading, user decisions, and confirmed direction understandable at a glance.

### OpenAI runtime configuration

- Added a server-only local API key through the Git-ignored `.env` file; no credential was added to tracked source.
- Added a non-secret `/api/story/status` health response and header indicator so creators can distinguish `OpenAI ready` from guided-demo mode.
- Verified the running Vite server reloaded the configuration and displayed `OpenAI ready` in the application header.

## 2026-07-18 — Editable scene outline milestone

### Decisions made

- Added `generateSceneOutline` as a separate structured operation that accepts only an approved creative brief as authoritative direction.
- Added isolated `regenerateScene` handling that forcibly preserves the target scene ID and position and receives neighboring scenes as continuity context only.
- Normalized positions after every add, delete, or reorder operation while leaving stable IDs unchanged.
- Kept creator-added scenes local and immediately editable with unique `scene-local-*` IDs.
- Approval removes edit, reorder, regenerate, add, and delete controls and persists an approval timestamp.
- Image prompt generation remains visibly locked as Milestone 7.

### Bugs encountered

- The live OpenAI request reached the API but returned HTTP 429 quota exceeded. The key and server integration are connected, but the account requires available billing/quota before real generations can complete.
- Demo regeneration initially produced double punctuation when a creator note already ended with punctuation; the note is now normalized before composition.
- Git commit creation remains blocked inside Codex because `.git/index.lock` cannot be written under the current managed permission profile.

### Verification results

- TypeScript typecheck: passed.
- Focused contract/demo tests: 8 passed across 2 files.
- Production build: passed.
- Guided browser workflow generated 8 scenes with 8 unique stable IDs.
- Edit, add, delete, and reorder operations: passed.
- Isolated scene regeneration changed the target scene, preserved all IDs, and left the sampled unaffected scene byte-for-byte unchanged.
- Outline approval made every scene field read-only and removed all mutation controls.
- Approved ordering and an edited story beat survived browser refresh.
- Mobile 390×844 check: no horizontal overflow; scene fields and approval controls collapsed correctly; stage navigation remained scrollable.
- Browser console: no warnings or errors.

### Codex contributions useful for Devpost

- Built a surgical regeneration architecture that avoids the common AI-product failure of rebuilding—and potentially damaging—unaffected creative work.
- Made the production plan feel like an editable film document rather than a chatbot transcript, with visible runtime, scene identity, emotional purpose, and approval state.

## 2026-07-18 — Readability pass

### Decisions made

- Raised the general microcopy floor from 7–10px to 11–12px across navigation, metadata, labels, status indicators, buttons, and helper text.
- Increased scene and creative-brief working copy to 14px while preserving larger editorial headings and story-beat typography.
- Brightened previously low-contrast secondary text without changing the dark cinematic palette.
- Reduced excessive letter spacing on small uppercase labels so the larger type remains compact and readable.

### Verification results

- TypeScript typecheck and production build: passed.
- Desktop check: no horizontal overflow; navigation 12px, status 11px, primary actions 12px, scene labels 11px.
- Mobile 390×844 check: no horizontal overflow or clipped buttons; navigation and API status remain 11px.

## 2026-07-18 — Image prompt workspace milestone

### Decisions made

- Kept GPT-5.6 as the core runtime provider because the OpenAI Build Week rules require entrants to build with Codex and GPT-5.6. Groq or Anthropic may supplement the product later, but will not replace the judged GPT-5.6 path.
- Preserved guided demo mode as the no-cost and quota-safe walkthrough fallback; the real OpenAI path remains server-only and uses the configured model environment variable.
- Added `generateImagePrompts` as a separate structured operation that accepts the approved brief and approved ordered scenes.
- Linked every image prompt to a stable `sceneId` and added an independent prompt ID so downstream motion work can attach without positional coupling.
- Included detailed prompt, short prompt, alternate framing, negative instructions, aspect ratio, and observable consistency anchors in the validated schema.
- Added isolated `regenerateImagePrompt`; both the server and store forcibly preserve prompt ID, scene ID, and aspect ratio.
- Kept every prompt editable after generation and added one-click copy feedback without adding provider-specific image generation yet.

### Features cut

- No direct image-provider API integration in this milestone; creators copy prompts into their preferred image tool.
- No provider selector or Groq/Anthropic fallback yet. Provider abstraction is deferred until after the required end-to-end OpenAI demo is submission-ready.
- No image uploads or motion plans; those remain the next milestone.

### Bugs encountered

- Live OpenAI generation remains blocked by HTTP 429 account quota, so the judged path requires API billing/quota before demo recording.
- The managed Codex shell cannot bind a new localhost port (`EPERM`). Moving the environment file triggered the user-started Vite process to stop; the file was immediately restored, but the user must restart `npm run dev` in Terminal.
- Local Terminal control is blocked by the desktop safety boundary, so Codex could not restart the user-owned process through the GUI.
- When the local server was unavailable, image-prompt generation correctly failed but the approved Scenes screen did not render the stored error, making the button appear unresponsive. Added a visible production-step error with restart guidance.

### Verification results

- TypeScript typecheck: passed.
- Focused schema/demo tests: 10 passed across 2 files.
- Production build: passed.
- Structured demo generation produced one prompt per approved scene in identical scene order.
- Every demo prompt inherited the requested aspect ratio and approved consistency requirements.
- Isolated prompt regeneration preserved prompt ID and scene ID while changing only the target prompt.
- Browser could inspect the existing approved-scene state and confirmed the Images action is now enabled. Final live Images visual verification is pending a user restart of the local Vite process.

### Codex contributions useful for Devpost

- Extended the product's surgical-regeneration promise from scenes into production prompts, protecting unaffected creative work and stable downstream references.
- Turned approved direction into visibly traceable prompt ingredients—emotion, framing, atmosphere, aspect ratio, and character continuity—rather than relying on a generic one-line generator prompt.
- Verified the official competition requirement before making a provider decision, retaining GPT-5.6 as the eligible core while preserving a reliable guided demo fallback.

## 2026-07-18 — Motion workspace milestone

### Decisions made

- Added `generateMotionPrompt` as a separate structured, scene-level AI operation instead of folding motion into image prompt generation.
- Motion plans retain stable `motion-{sceneId}` identities and never rebuild plans for unaffected scenes.
- Added browser-local still previews with a 10 MB guard. Image pixels are not uploaded or sent to the text-planning API; only the optional filename and creator-authored motion notes are included as context.
- Made all production direction editable: intended action, camera movement, subject movement, environmental movement, facial expression, clip duration, final prompt, negative motion instructions, transition, and suggested capability category.
- Avoided exact model pricing or unsupported tool-specific promises. Suggested models are expressed as capability categories.
- Added a back-to-images control that preserves completed motion plans, allowing creators to revise prompts without losing downstream work.
- Expanded `.gitignore` to cover `.env*` backups while explicitly keeping `.env.example`, preventing the guided-demo key backup from entering a commit.

### Features cut

- No pixel-level image analysis in this milestone; the upload is a private visual reference for the creator.
- Uploaded preview data is intentionally session-only and must be re-selected after refresh to avoid localStorage quota failures.
- Direct video generation remains outside the MVP; the workspace produces tool-ready prompts.

### Bugs encountered

- Existing `.env.openai` was initially visible as an untracked file after the guided-demo rename. The ignore rule now protects all environment variants.
- A network failure on the approved Scenes screen previously appeared silent; the screen now renders a visible restart/action error.

### Verification results

- TypeScript typecheck: passed.
- Focused schema/demo tests: 12 passed across 2 files.
- Production build: passed.
- Live guided-demo browser flow opened Motion from eight image prompts and generated one complete scene-linked plan.
- Creator motion notes propagated into the final image-to-video prompt.
- Refresh persistence passed for the completed plan, its creator note, duration, and editable fields.
- Mobile 390×844 check: no horizontal overflow; setup and direction grids collapse to one 324px column; working copy remains 13–14px with 11px labels.

### Codex contributions useful for Devpost

- Extended StoryDNA's protected-decision chain through motion, so emotional intent becomes concrete camera, performance, environment, and transition direction.
- Made the privacy boundary honest and visible: local image reference versus text context sent for planning.
- Added model-agnostic negative motion guidance focused on common AI-video failure modes such as identity drift, morphing, flicker, and uncontrolled camera movement.
