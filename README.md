# StoryDNA Studio

**An AI creative director for solo AI filmmakers.**

> Keep your voice. Lose the production chaos.

[Live application](https://storydnastudio.netlify.app) · [Build documentation](#build-documentation)

StoryDNA Studio turns a poem, script, lyric, story, or rough concept into a clarified creative intention and a production-ready visual plan. Unlike tools that generate immediately, it interprets the source first, asks exactly three consequential questions, and lets the creator approve the direction before scenes or prompts are produced.

## Why StoryDNA Studio

Solo AI filmmakers work across image generators, video models, voice tools, music tools, and editors. The difficult part is maintaining one emotional and visual intention across every handoff.

StoryDNA Studio is the connective creative layer. It keeps the creator's original source, the AI's interpretation, creator corrections, and approved decisions distinct—and carries the approved direction through production without silently overwriting it.

## The workflow

**Story → DNA → Scenes → Images → Motion → Review**

1. **Story intake** — Capture the source, visual vibe, character direction, aspect ratio, runtime, and preferred tools.
2. **StoryDNA analysis** — Identify emotional truth, audience feeling, themes, symbols, visual language, sensory direction, interpretation risks, and the emotional arc without generating scenes yet.
3. **Three adaptive questions** — Resolve exactly three ambiguities that would materially alter the film. The creator can answer, add context, correct the interpretation, or request a different set.
4. **Confirmed creative brief** — Turn creator decisions into an editable north star, then protect it through explicit approval.
5. **Editable scene outline** — Edit, add, delete, reorder, or regenerate one scene while stable IDs preserve unaffected work.
6. **Image prompts** — Produce editable detailed and short prompts, alternate framing, negative instructions, aspect ratio, and continuity anchors for every approved scene.
7. **Motion plans** — Add a local still reference and creator notes, then build editable camera, subject, environment, expression, timing, transition, and negative-motion direction.
8. **Production estimate** — Calculate transparent minimum, expected, and high-retry generation ranges from duration, attempts, and shot difficulty.
9. **Director's Commentary** — Compare timestamped visual samples from a finished clip with the source, approved brief, emotional arc, and scene plan.
10. **Export** — Download the complete director's packet as Markdown or versioned JSON.

## Product principles

- **Listen before generating.** Analysis and clarification happen before scene planning.
- **Creator decisions are authoritative.** Corrections and answers override provisional AI interpretation.
- **Approval has meaning.** Approved briefs and outlines become protected downstream context.
- **Regeneration is surgical.** Stable IDs let one scene or prompt change without rebuilding unaffected work.
- **Claims stay honest.** Estimates do not invent current pricing, and video critique is described as sampled-frame analysis.

## Architecture

```mermaid
flowchart LR
    UI[React + TypeScript UI] --> Store[Zustand local persistence]
    UI --> API[/api/story operations]
    API --> Router[Shared validated router]
    Router --> OpenAI[OpenAI Responses API]
    OpenAI --> Zod[Structured Outputs + Zod]
    UI --> Frames[Browser-side frame sampling]
    Frames --> API
    Store --> Export[Markdown + JSON export]
```

### Client

- React, TypeScript, and Vite
- Zustand with local-storage persistence for one active project
- Responsive cinematic interface with hand-authored CSS
- Browser-local image previews and video-frame sampling
- Client-side Markdown and JSON exports

### AI and server boundary

- Current OpenAI JavaScript SDK
- Responses API with `responses.parse`
- Structured Outputs generated from shared Zod schemas
- Separate operations for analysis, questions, briefing, scenes, image prompts, motion, and commentary
- One shared router used by local Vite middleware and the production Netlify Function
- Server-only API credentials and model configuration

The default model is the explicit [`gpt-5.6-sol`](https://developers.openai.com/api/docs/guides/latest-model) flagship slug. A configured `gpt-5.6` alias is normalized to that slug before a request is sent.

### Deterministic operations

Production estimates are calculated from visible project assumptions rather than another model call. Exports are created locally and require no additional API request.

## Director's Commentary privacy boundary

The complete finished clip remains in the browser. StoryDNA Studio decodes it locally and samples up to eight evenly spaced JPEG frames at a maximum working width of 640 pixels. Only those timestamped samples, clip metadata, creator notes, and approved project context cross the API boundary.

Audio, dialogue, music, and continuous frame-to-frame motion are not analyzed in this MVP. The saved report persists locally; the uploaded video and sampled frames do not.

## Run locally

Requirements: Node.js 22 and an optional OpenAI API key.

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://127.0.0.1:4173>.

To use the live OpenAI path, configure the server-only values in `.env`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5.6-sol
```

Never prefix the key with `VITE_`, expose it in frontend code, or commit `.env` files.

Without `OPENAI_API_KEY`, the app runs in clearly labeled guided-demo mode. The deterministic demo director uses the same schemas and exercises the complete interface without pretending that a model call occurred.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run smoke:api
```

Current verified baseline:

- TypeScript typecheck passes
- 25 tests pass across 7 test files
- Production Vite build passes
- Shared request and response schemas cover every structured operation

The smoke test expects the development server to be running with guided-demo mode active.

## Deploy to Netlify

The repository contains:

- A production Netlify Function for `/api/story/*`
- `npm run build` and `dist` configuration
- Node.js 22 pinning
- SPA refresh fallback
- Request payload guards and baseline response-security headers

Follow the [Netlify deployment guide](docs/hackathon-build/deploy-netlify.md). Configure `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-5.6-sol` in Netlify's server-side environment settings, then trigger a fresh deploy.

## Current MVP boundaries

- StoryDNA Studio creates production direction and prompts; it does not directly generate images or videos.
- One active project is stored in the current browser. Authentication and cloud project storage are not implemented.
- Motion-reference images are local previews and are not sent for pixel analysis.
- Director's Commentary analyzes sampled visual frames, not audio or continuous motion.
- One finished clip is reviewed at a time.
- Credit totals appear only when the creator supplies a sample rate; no live provider pricing is included.
- PDF, ZIP, embedded-asset, and share-link exports are deferred.

## Built with Codex and GPT-5.6

GPT-5.6 is the structured creative-direction runtime. It is used through focused operations instead of one monolithic prompt, with approved creator decisions labeled as authoritative at every downstream stage.

Codex supported product planning, architecture, React and server implementation, schema design, testing, debugging, responsive refinement, deployment hardening, and submission documentation. The build log records decisions, cuts, bugs, and verification evidence throughout the project.

## Build documentation

- [Hackathon scope](docs/hackathon-build/scope.md)
- [Product requirements](docs/hackathon-build/prd.md)
- [Technical specification](docs/hackathon-build/spec.md)
- [Milestone checklist](docs/hackathon-build/checklist.md)
- [Build notes](docs/hackathon-build/build-notes.md)
- [Netlify deployment guide](docs/hackathon-build/deploy-netlify.md)
- [Devpost submission draft](docs/hackathon-build/devpost-submission.md)

## License

StoryDNA Studio is available under the [MIT License](LICENSE).
