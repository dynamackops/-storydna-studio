# StoryDNA Studio

An attentive AI creative director for solo AI filmmakers.

> Keep your voice. Lose the production chaos.

This repository currently implements the verified creative-direction slice:

**Story intake → StoryDNA analysis → exactly three adaptive clarification questions → approved creative brief → editable scene outline → editable per-scene image prompts**

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open <http://127.0.0.1:4173>.

Without `OPENAI_API_KEY`, the app runs in clearly labeled guided-demo mode. With a key, the server-only API boundary uses the configured `OPENAI_MODEL` and validates Responses API Structured Outputs with Zod.

## Verify

```bash
npm run typecheck
npm test
npm run build
npm run smoke:api
```

The smoke test expects the development server to be running and guided-demo mode to be active.

## Build documentation

- [Scope](docs/hackathon-build/scope.md)
- [PRD](docs/hackathon-build/prd.md)
- [Technical spec](docs/hackathon-build/spec.md)
- [Milestone checklist](docs/hackathon-build/checklist.md)
- [Build notes](docs/hackathon-build/build-notes.md)
