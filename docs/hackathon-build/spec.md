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

This is one TypeScript repository with a Vite React client and a deliberately thin server boundary. The development middleware is sufficient for the verified hackathon slice; the same handlers can later move into Netlify/Vercel functions without changing client contracts.

## Technology choices

- React + TypeScript + Vite.
- Hand-authored CSS design tokens for the initial cinematic interface; Tailwind can be introduced if utility reuse justifies it after the slice is stable.
- Zustand with persist middleware for one local active project.
- Zod shared schemas for request, response, and persistence validation.
- Official `openai` JavaScript SDK and Responses API Structured Outputs.
- Vitest + Testing Library for focused behavior and schema tests.

## Model configuration

- `OPENAI_API_KEY`: server-only secret.
- `OPENAI_MODEL`: required model selection with `gpt-5.6` documented as the example value confirmed in official model documentation on 2026-07-18.
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
