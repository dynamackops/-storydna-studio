# StoryDNA Studio — Technical Specification

## Smallest day-one architecture

```text
React UI + Zustand store + localStorage
                 |
                 | POST /api/story/*
                 v
Vite server middleware (server-only OpenAI key)
                 |
                 | Responses API + Structured Outputs
                 v
              OpenAI
```

This is one TypeScript repository with a Vite React client and a deliberately thin server boundary. Development uses Vite middleware, while Netlify production uses a serverless function backed by the same shared operation router and client contracts.

For production, the same shared operation router is now used by both Vite development middleware and `netlify/functions/story.mts`. Netlify custom-path routing keeps the browser contract at `/api/story/*`; no frontend API URLs or secrets change between local and production environments.

## Technology choices

- React + TypeScript + Vite.
- Hand-authored CSS design tokens for the initial cinematic interface; Tailwind can be introduced if utility reuse justifies it after the slice is stable.
- Zustand with persist middleware for one local active project.
- Zod shared schemas for request, response, and persistence validation.
- Official `openai` JavaScript SDK and Responses API Structured Outputs.
- Vitest + Testing Library for focused behavior and schema tests.

## Model configuration

- `OPENAI_API_KEY`: server-only secret.
- `OPENAI_MODEL`: required model selection with the explicit `gpt-5.6-sol` flagship slug. The public `gpt-5.6` alias is normalized to that slug before requests are sent.
- The browser never receives either the key or a `VITE_`-prefixed secret.
- When no key is configured, the local server returns an explicit `demoMode: true` deterministic result so judging is never blocked. This is a product demo fallback, not an emulation claim.

## Source layout

```text
src/
  components/        # Stage navigation and workflow views
  lib/               # API client, IDs, local helpers
  store/             # Persisted project/workflow state
  types/             # Domain types
  App.tsx
  styles.css
server/
  ai/                 # Separate operation prompts and handlers
  middleware.ts       # API routes and error normalization
shared/
  schemas.ts          # Zod contracts shared by client/server
docs/hackathon-build/
```

## Initial domain model

The TypeScript model includes all requested future-facing entities while the active slice now populates the intake, analysis, clarification, creative brief, scene, and image-prompt entities.

Every entity with independent edits has a stable string ID. Project state stores:

- `original`: immutable source intake snapshot.
- `interpretation`: replaceable, unapproved AI analysis.
- `userCorrections`: creator-authored corrections.
- `clarifyingAnswers`: creator-authored decisions.
- `confirmedBrief`: editable artifact with explicit approval metadata.
- Derived scene/prompt artifacts with their own approval state.

## API contracts

### `POST /api/story/analyze`

Input: validated `StoryInput`.

Output: validated `StoryAnalysis` plus operation metadata.

### `POST /api/story/questions`

Input: original `StoryInput`, current `StoryAnalysis`, optional correction/context, and an optional `variationSeed` for a different set.

Output: a tuple/array constrained to exactly three validated `ClarifyingQuestion` values plus operation metadata.

The operations are separate calls. Question generation cannot mutate analysis.

### `POST /api/story/image-prompts`

Input: original intake, StoryDNA analysis, approved creative brief, and approved ordered scenes.

Output: one validated image prompt per scene in identical order, including detailed/short versions, alternate framing, negative instructions, aspect ratio, and consistency anchors.

### `POST /api/story/image-prompt/regenerate`

Input: the authoritative context, one approved scene, its current prompt, and an optional creator note.

Output: exactly one validated replacement prompt. The server preserves prompt ID, scene ID, and aspect ratio.

### `POST /api/story/motion-prompt`

Input: authoritative story context, one approved scene, its edited image prompt, optional creator motion notes, and an optional local filename reference.

Output: one scene-linked motion plan containing intended action, camera/subject/environment movement, facial direction, duration, production-ready image-to-video prompt, negative motion instructions, transition, and capability-based model category.

Uploaded image bytes remain in browser memory for preview only in the MVP and are not sent to this text-planning operation.

### `POST /api/story/commentary`

Input: original intake, StoryDNA analysis, approved brief, scenes, available motion plans, creator notes, feedback mode, clip metadata, and 4–8 chronological JPEG frame samples.

Output: one validated commentary report with a nine-area scorecard, what is working, unclear meaning, specific changes, and the highest-priority revision.

The browser decodes the selected clip and samples up to 8 timestamped frames at a maximum working width of 640 pixels. The complete video is not uploaded. The Responses API receives the sampled images at low detail with the labeled project context. The UI and prompt both state that audio, dialogue, music, and continuous frame-to-frame motion are outside this MVP review boundary. This keeps the JSON request safely below Netlify's buffered function payload limit.

## Production estimate calculation

The estimate is a deterministic client-side calculation rather than an AI claim. Inputs are the approved scenes, available motion plans, configured platform label, expected attempts per scene, and an optional sample credits-per-generation rate.

Each shot receives a low, medium, or high risk classification with a visible reason based on continuity-sensitive anatomy, complex visual elements, coordinated motion, and clip duration. The calculator returns minimum, expected, and high-retry generation totals. Credit totals do not render until the creator explicitly supplies a sample rate, and every view states that no current provider pricing is implied.

## Production plan export

The completed local project can be exported entirely in the browser without another API call. A versioned export object preserves the original source, AI interpretation, creator corrections and answers, approved creative brief, stable scene IDs, image prompts, motion plans, the current production estimate, and the latest commentary report when available.

- Markdown is the readable director's packet for handoff or presentation.
- JSON preserves structured data for later imports and integrations.
- Filenames are derived from a normalized project title.
- Browser-local image previews and all API credentials are deliberately excluded.
- PDF, ZIP packaging, and binary asset embedding are deferred until after the hackathon submission path is stable.

## AI operation rules

Each operation has its own system instruction, user payload, Zod schema, and error boundary. Prompts label data blocks by provenance. The model is instructed to avoid production planning during analysis and to ask questions only about unresolved, high-impact forks.

Operations follow the same pattern:

1. `analyzeStory`
2. `generateClarifyingQuestions`
3. `createCreativeBrief`
4. `generateSceneOutline`
5. `generateImagePrompts`
6. `generateMotionPrompt`
7. `analyzeFinishedVideo`

## State transitions

```text
draft → analyzing → analysis-ready → questioning → questions-ready
  └──────── retry/error returns to last stable stage ────────┘
```

Editing the original source invalidates downstream analysis and questions after explicit confirmation in later milestones. Regenerating questions preserves analysis and current answers until the creator accepts the replacement set.

## Error and degraded-mode behavior

- Input errors render beside fields.
- API errors use a stable `{ code, message, retryable }` envelope.
- Schema mismatch is a server error and never reaches persisted state.
- Missing API configuration activates a visible demo badge.
- The UI preserves the user's intake when any call fails.

## Security

- Keep `OPENAI_API_KEY` on the server only.
- Apply JSON body size limits and reject invalid content types.
- Do not render user/model content as HTML.
- Do not log full source material or secrets.
- Supabase service-role credentials will never enter frontend code.
- Phase-two tables must enable RLS and policies must compare `auth.uid()` to row `user_id`.

## Verification strategy

- Unit tests: schemas, exactly-three invariant, local state behavior, fallback determinism.
- Integration smoke: both API endpoints and invalid input.
- Static: TypeScript and production build.
- Interactive: desktop and mobile workflow, error/status copy, persistence refresh, and basic keyboard traversal.
