# StoryDNA Studio — Devpost Submission Draft

Source of truth reviewed on July 21, 2026:

- Live application: https://storydnastudio.netlify.app
- Repository: https://github.com/dynamackops/storydna-studio
- Verified locally: TypeScript typecheck passed, 22 tests passed, and the production Vite build passed.

## 1. Project Title

**StoryDNA Studio**

## 2. One-sentence tagline

**An AI creative director that turns a creator’s story and clarified intention into a production-ready visual plan.**

Alternate short tagline: **Keep your voice. Lose the production chaos.**

## 3. Elevator pitch

StoryDNA Studio helps solo AI filmmakers move from a poem, script, lyric, story, or rough concept to a coherent visual production plan without losing the emotional intention that made the idea worth creating. Instead of immediately generating content, it interprets the source, asks exactly three adaptive creative questions, protects the creator’s approved decisions, and carries that direction through scenes, image prompts, motion plans, production estimates, export, and a finished-cut review.

## 4. Inspiration

Solo AI filmmakers now have access to remarkable tools for images, video, voice, music, and editing. The hard part is no longer finding a generator; it is maintaining one creative intention while moving between all of them.

A poem may begin with a precise emotional truth, but that truth can disappear as the creator translates it into scenes, prompts, camera movement, retries, and edits. Most AI products accelerate generation before they understand what the creator is trying to preserve. StoryDNA Studio was inspired by the need for a quieter, more attentive layer: an AI creative director that listens first, identifies the decisions that matter, and turns approved intention into practical production direction.

## 5. What it does

StoryDNA Studio provides a staged creative-direction workflow:

1. **Story intake:** The creator enters a project title, source material, visual vibe, optional character direction, aspect ratio, target runtime, and preferred tools.
2. **StoryDNA analysis:** The application identifies the core emotional truth, intended audience feeling, emotional arc, themes, symbols, visual language, sensory direction, interpretation risks, and an initial scene-count estimate. It deliberately does not create scenes yet.
3. **Three adaptive questions:** The creator receives exactly three questions focused on ambiguities that could materially change the film. They can answer, add context, correct the interpretation, or request another set.
4. **Confirmed creative brief:** StoryDNA Studio turns the interpretation and creator decisions into an editable brief. Creator corrections and answers are treated as authoritative. Approval protects the brief before downstream work begins.
5. **Editable scene outline:** The application generates an ordered scene plan with story beat, source reference, narrative purpose, emotional intention, visual description, shot type, duration, and transition. Creators can edit, add, delete, reorder, or regenerate one scene. Stable scene IDs prevent an isolated change from rebuilding unaffected scenes.
6. **Image direction:** Each approved scene receives a detailed image prompt, shorter prompt, alternate framing, negative instructions, aspect ratio, and continuity anchors. Prompts remain editable and individually regenerable.
7. **Motion direction:** For each scene, creators can select a still image locally, add motion notes, and generate an editable image-to-video plan covering camera, subject, environment, expression, timing, transitions, and negative motion guidance. Uploaded pixels are used as a browser-local reference; the text-planning request receives the filename and creator notes, not the image itself.
8. **Production estimate:** A deterministic calculator converts scene count, duration, expected attempts, and shot difficulty into minimum, expected, and high-retry generation ranges. Credit estimates appear only when the creator supplies a sample rate; no current platform pricing is hardcoded.
9. **Production export:** The complete project can be downloaded as a readable Markdown director’s packet or versioned JSON. Credentials and browser-local image previews are excluded.
10. **Director’s Commentary:** The creator can upload one finished clip and choose one of four feedback lenses. The browser samples up to eight timestamped frames and compares the visual evidence with the source, approved brief, emotional arc, scene plan, and motion plans. The report covers nine review areas and ends with one highest-priority revision.

The MVP does not directly generate images or videos, store projects in the cloud, analyze audio, or claim continuous video understanding. Director’s Commentary evaluates sampled visual frames rather than the full motion and sound experience.

## 6. How we built it

We began by reducing the product to one trust-building vertical slice: source material to interpretation to exactly three clarifying questions. Once that interaction felt like an attentive director rather than a chatbot, we extended the same approval and provenance model through the rest of production.

Each AI responsibility was implemented as a separate operation with its own validated response schema. Story analysis, question generation, creative briefing, scene planning, image prompting, motion planning, and finished-cut feedback do not share one giant prompt. The client keeps the original source, AI interpretation, creator corrections, answers, and approved decisions distinct, and downstream prompts label the approved brief as authoritative.

The interface was built as a cinematic single-page React application. Zustand persists one active project in browser local storage, making the complete workflow usable without authentication or a database. A shared server router powers both the local Vite middleware and the deployed Netlify Function, so validation and AI behavior remain consistent across environments.

We also built for a dependable demo. When no API key is configured, the application uses a clearly labeled deterministic guided-demo director. This exercises the same schemas and UI state transitions without pretending that a model call occurred.

## 7. Technical architecture

### Client

- React and TypeScript on Vite
- Hand-authored responsive cinematic CSS
- Zustand with local-storage persistence for the active project
- Stable IDs connecting scenes, image prompts, motion plans, estimates, and exports
- Client-side Markdown and JSON export
- Browser-side video decoding and frame sampling

### Server boundary

- One server-only `/api/story/*` boundary
- Shared request router used by local Vite middleware and the production Netlify Function
- OpenAI JavaScript SDK and Responses API
- Structured Outputs parsed with `responses.parse` and `zodTextFormat`
- Shared Zod schemas validating requests and responses
- API credentials and model selection stored in server-side environment variables
- Request content-type checks, payload limits, no-store responses, and baseline security headers

### AI operations

- `analyzeStory`
- `generateClarifyingQuestions`
- `createCreativeBrief`
- `generateSceneOutline`
- `regenerateScene`
- `generateImagePrompts`
- `regenerateImagePrompt`
- `generateMotionPrompt`
- `analyzeFinishedVideo`

### Non-AI operations

- Production effort is calculated deterministically from observable project inputs.
- Video frames are sampled locally before selected JPEG frames are sent for visual critique.
- Exports are generated locally and do not make another API request.

The key architectural principle is provenance: original source material remains immutable, AI interpretation remains visibly provisional, creator corrections and answers are authoritative, and approved decisions become protected context for downstream work.

## 8. Challenges we ran into

### Protecting the creator’s decisions

The central product challenge was preventing later AI generations from silently rewriting earlier choices. We solved this by separating source, interpretation, correction, confirmation, and production artifacts in both state and prompts. Approval states are explicit, and downstream operations label approved information as authoritative.

### Surgical regeneration

Regenerating one scene or prompt should not damage the rest of the project. Scenes and prompts use stable IDs, and isolated regeneration endpoints forcibly preserve the target ID and position while receiving neighboring work only as continuity context.

### Honest video analysis

It would have been easy to describe Director’s Commentary as “watching” a video. The implemented MVP instead decodes the clip locally, samples up to eight timestamped JPEG frames, and sends only those samples plus project context. Audio and continuous motion are explicitly outside the current analysis boundary.

### Production payload limits

Multimodal review had to fit within Netlify’s buffered function payload. Frame count, width, and JPEG quality were deliberately constrained so the feature remains deployable without introducing video storage or transcoding infrastructure.

### Deployment configuration

The first Netlify attempt pointed at a repository without the application package files. A later deploy also treated a colocated test file as a serverless function and rejected its dotted function name. We corrected the GitHub connection, committed explicit Netlify configuration, moved the test outside the functions directory, and unified production and local routing.

### API availability and demo reliability

During development, the live API path encountered quota and model/provider errors. The application therefore includes a clearly disclosed guided-demo mode for deterministic walkthroughs. Before judging, the production model configuration must be verified with a successful end-to-end request.

## 9. Accomplishments we’re proud of

- Built a complete creative loop from raw source material through production planning and finished-cut feedback.
- Made clarification—not instant generation—the defining product interaction.
- Preserved a traceable chain from creator voice to AI interpretation to confirmed decisions to production artifacts.
- Implemented exactly three adaptive questions with regeneration and correction controls.
- Built editable approval gates for the creative brief and scene outline.
- Implemented isolated scene and image-prompt regeneration without rebuilding unaffected work.
- Produced scene-linked image and motion direction that carries emotional and continuity constraints forward.
- Created transparent production ranges without presenting invented pricing as fact.
- Kept uploaded video local while sending only controlled visual samples for critique.
- Built portable Markdown and JSON exports rather than trapping the result inside the interface.
- Delivered a responsive cinematic UI that works on desktop and mobile.
- Reached a verified local baseline of 22 passing tests, a clean TypeScript typecheck, and a successful production build.

## 10. What we learned

The strongest creative AI experiences are often built around restraint. Waiting to generate scenes until the creator has reviewed the interpretation produces a more trustworthy and differentiated interaction than adding another prompt box.

We also learned that provenance must be an architectural concern, not merely a sentence in a system prompt. If approved choices matter, they need distinct data structures, visible approval states, and server operations that cannot casually replace them.

For multimodal features, technical honesty improves the product. Describing Director’s Commentary as timestamped frame analysis allowed us to set the right expectation, design around deployment limits, and still deliver useful revision guidance.

Finally, deterministic logic is sometimes better than another model call. Production estimates are more credible when creators can see the assumptions and understand why a shot is classified as difficult.

## 11. What’s next for StoryDNA Studio

The next phase would add accounts, saved projects, and secure cloud storage with Supabase, followed by asset history and intentional sharing. Additional priorities include:

- Project version history and comparison between approved creative directions
- Direct integrations with selected image and video generation tools
- Configurable provider-specific cost assumptions without claiming unverified live pricing
- Richer image-aware motion planning
- Audio, dialogue, music, and transcript-aware finished-cut review
- Side-by-side comparison of two edits or generations
- PDF and production-package export with selected assets
- Collaboration and review links for creative partners

These additions would extend the workflow without changing its core promise: the creator remains the authority, and generation follows confirmed intention.

## 12. Why this project is a good fit for OpenAI Build Week

StoryDNA Studio demonstrates an opinionated use of advanced models rather than placing a chat interface around them. GPT-5.6 is positioned as a reasoning and creative-direction layer that interprets ambiguity, identifies consequential decisions, produces structured artifacts, and compares a finished visual result with the intention that produced it.

The project also shows a practical human-in-the-loop pattern. The model’s first interpretation is not treated as truth. The creator can correct it, answer targeted questions, edit the resulting brief, and explicitly approve the direction before production begins. Structured outputs, stable identifiers, schema validation, and approval boundaries turn that collaboration into a dependable application workflow.

Finally, StoryDNA Studio addresses a fast-growing creative audience. Solo filmmakers already have generation tools; what they lack is continuity of intention across those tools. The project demonstrates how OpenAI models can become the connective creative intelligence between ideation, production, and revision.

## 13. How Codex and GPT-5.6 were used

### GPT-5.6

GPT-5.6 is configured as the primary runtime model through the server-side `OPENAI_MODEL` environment variable. The implementation calls it through the OpenAI Responses API with Structured Outputs and Zod-backed parsing.

It is assigned focused creative operations rather than one monolithic prompt:

- Interpret the emotional, symbolic, visual, and narrative DNA of the source without prematurely generating scenes.
- Identify exactly three ambiguities whose answers would materially change the film.
- Convert creator answers and corrections into an editable production brief.
- Turn an approved brief into a structured scene outline.
- Create and selectively regenerate scene-linked image prompts.
- Create a controlled image-to-video motion plan for one scene at a time.
- Compare sampled frames from a finished cut with the source, approved direction, emotional arc, and production plan.

Every operation receives clearly labeled provenance. Original source material, provisional AI interpretation, creator corrections, answers, and approved decisions are never silently collapsed into one conversation transcript.

### Codex

Codex served as the primary build collaborator across the entire project:

- **Planning:** Converted the initial product vision into a day-one scope, PRD, technical specification, milestone checklist, and a running build log.
- **Architecture:** Designed the staged AI-operation model, shared Zod contracts, provenance boundaries, stable scene identifiers, local persistence, and server-only API boundary.
- **Implementation:** Built the React/TypeScript interface, Zustand store, OpenAI operations, guided-demo director, editing and approval states, isolated regeneration, motion workspace, production estimator, export system, and Director’s Commentary.
- **Refinement:** Increased typography and contrast, verified responsive layouts, clarified privacy and limitation copy, and maintained the cinematic visual direction.
- **Testing:** Added contract, demo, estimator, export, video-sampling, and production-function tests; repeatedly ran typecheck and production builds; and interactively verified the workflow on desktop and mobile.
- **Debugging:** Diagnosed API quota failures, silent network errors, local server constraints, Netlify repository configuration, function naming conflicts, and payload-size risks.
- **Deployment:** Added the Netlify Function, shared server router, build configuration, SPA fallback, environment-variable guidance, and production security headers.
- **Documentation:** Maintained build notes that record decisions, scope cuts, bugs, verification results, and contribution evidence for the submission.

Codex did not replace product judgment. It accelerated the loop between product decisions, implementation, verification, and refinement while keeping the creator’s stated scope and trust model visible throughout the build.

## 14. Three-minute Devpost demo script

### 0:00–0:15 — The problem

**Voiceover:** “Solo AI filmmakers have extraordinary tools for images, video, voice, music, and editing. But every handoff creates another chance to lose the emotional intention that made the story matter.”

Show the opening StoryDNA Studio screen and the line: “Keep your voice. Lose the production chaos.”

### 0:15–0:30 — The product promise

**Voiceover:** “StoryDNA Studio is an AI creative director that listens before it generates. It turns raw source material into a clarified creative intention and a production-ready visual plan.”

Load the included demo poem.

### 0:30–0:58 — StoryDNA analysis

Click **Analyze my story** and reveal the StoryDNA analysis.

**Voiceover:** “The first operation analyzes emotional truth, audience feeling, themes, symbols, visual language, sensory direction, risks, and the shape of the emotional arc. It deliberately does not create scenes yet.”

Briefly highlight emotional truth, the arc, and one symbol.

### 0:58–1:20 — Three decisions that matter

Scroll to the clarification section.

**Voiceover:** “Instead of asking generic setup questions, StoryDNA generates exactly three adaptive questions about decisions that would materially alter the film. I can choose a direction, write my own answer, correct the interpretation, or ask for a different three.”

Answer the three questions and briefly reveal the correction/context controls.

### 1:20–1:42 — Protected creative brief

Generate the brief, edit one visible phrase, and approve it.

**Voiceover:** “My answers become an editable creative brief. Creator corrections override the model’s initial reading, and approval turns the brief into protected production context.”

### 1:42–2:05 — Scene architecture and surgical regeneration

Generate or show the scene outline. Demonstrate reorder controls or regenerate one scene.

**Voiceover:** “The approved brief becomes an editable scene outline with narrative purpose, emotional intention, shot direction, duration, and transitions. Stable IDs let me regenerate one scene without rebuilding or damaging the others.”

Approve the outline.

### 2:05–2:25 — Image and motion direction

Show an image-prompt card, its short version, alternate framing, continuity anchors, and copy control. Then show one completed motion plan.

**Voiceover:** “Each scene receives production-ready image direction and an editable image-to-video plan. Emotional intention carries forward into composition, performance, camera movement, environment, timing, and negative motion guidance.”

### 2:25–2:40 — Estimate and export

Show the minimum, expected, and high-retry estimate, then the Markdown and JSON export buttons.

**Voiceover:** “A transparent calculator highlights difficult shots and likely retry ranges without inventing current platform pricing. The full project exports as a director’s packet or structured JSON.”

### 2:40–2:53 — Director’s Commentary

Show the four review modes and a completed commentary report.

**Voiceover:** “After the edit, Director’s Commentary samples timestamped frames locally and compares the visible cut with the source and approved plan, ending with one highest-priority revision. Audio and continuous motion are not analyzed in this MVP.”

### 2:53–3:00 — Close

Return to a strong overview screen.

**Voiceover:** “StoryDNA Studio keeps the creator’s voice in control from first meaning to next revision. Keep your voice. Lose the production chaos.”

## 15. README improvements

The existing README accurately describes the workflow, local setup, verification commands, deployment path, and Director’s Commentary limitations. Before submission, improve it with the following:

1. Add prominent **Live Demo** and **Devpost** links directly below the title.
2. Add a cinematic hero screenshot or short GIF.
3. Replace the single workflow sentence with a concise “Why StoryDNA” introduction and a scannable feature list.
4. Add a small architecture diagram showing React → `/api/story/*` → Netlify Function → Responses API, plus local persistence and browser-side frame sampling.
5. Add a “Trust model” section explaining provisional interpretation, authoritative creator decisions, approval gates, and stable IDs.
6. Add a “Current limitations” section covering no direct generation, one local active project, sampled-frame video review, no audio analysis, and no live provider pricing.
7. Document both OpenAI mode and the clearly labeled no-key guided-demo mode.
8. Add a short testing section that states the current baseline: 22 tests, typecheck, and production build.
9. Add selected screenshots and a 3-minute demo-video link.
10. Add an MIT `LICENSE` file and reference it from the README.
11. Add acknowledgements explaining how GPT-5.6 and Codex were used.
12. Add a security note reminding deployers that `OPENAI_API_KEY` must remain server-side.

Suggested opening block:

> **StoryDNA Studio is an AI creative director for solo AI filmmakers.** It interprets a creator’s source, asks three consequential questions, protects the approved creative direction, and turns it into a scene-by-scene production plan.
>
> **Keep your voice. Lose the production chaos.**
>
> [Live Demo](https://storydnastudio.netlify.app) · [Devpost Demo Video](ADD_VIDEO_URL)

## 16. Concise GitHub project description

**AI creative director that turns stories into clarified creative briefs, editable scene plans, image and motion prompts, production estimates, and finished-cut feedback.**

Shorter alternative:

**An AI creative director for turning stories into production-ready visual plans.**

## 17. Screenshots to capture

Capture clean desktop screenshots with the browser chrome cropped out where possible. Recommended order:

1. **Hero / story intake:** Brand, promise, stage navigation, and populated demo story.
2. **StoryDNA overview:** Core emotional truth, audience feeling, and emotional arc in one frame.
3. **Three adaptive questions:** All three question cards, with at least one selected answer and the protected-decisions message visible.
4. **Approved creative brief:** Approval state plus the provenance trail from original voice to confirmed direction.
5. **Editable scene outline:** Two or three scene cards showing story beat, emotional intention, shot type, duration, and stable IDs.
6. **Image prompt workspace:** One complete prompt card showing detailed prompt, alternate framing, negative instructions, and copy/regenerate controls.
7. **Motion workspace:** Uploaded still preview beside a completed motion plan.
8. **Production estimate:** Runtime, minimum/expected/high-retry totals, and shot difficulty rows.
9. **Director’s Commentary:** Four review lenses or the completed report with the highest-priority revision visible.
10. **Mobile composite:** Story intake and one downstream workspace at approximately 390 pixels wide.

For the Devpost gallery, prioritize screenshots 1, 2, 3, 6, and 9.

## 18. GIFs or demo clips that would strengthen the submission

- **Listen before generating:** Load demo poem → analyze → StoryDNA reveal.
- **Exactly three decisions:** Analysis scrolls into the three adaptive questions and an answer is selected.
- **Intent becomes protected:** Build brief → edit one line → approve brief.
- **Surgical scene revision:** Regenerate one scene while neighboring scene IDs and content remain unchanged.
- **Production handoff:** Scene card → image prompt → copy prompt → motion plan.
- **Transparent estimate:** Change attempts per scene and show the expected/high-retry totals update immediately.
- **Closed creative loop:** Choose a commentary lens → upload clip → reveal the highest-priority revision.
- **Portable result:** Export the Markdown director’s packet and briefly show its structured sections.

Keep each loop between four and eight seconds, avoid tiny text, and use one smooth crop rather than recording the full browser window.

## 19. Missing polish items that could significantly improve judging

### P0 — Fix before sharing with judges

1. **Redeploy and verify the repaired production AI path.** A fresh live test on July 21 returned `400 unable to find suitable provider for gpt-5.6` after clicking **Analyze my story**. The source now normalizes that public alias to the documented explicit `gpt-5.6-sol` flagship slug. Push and redeploy the fix, then complete one full public production request. If model access still fails, removing the server key will intentionally activate the clearly labeled guided-demo mode and keep the walkthrough functional, but the submitted explanation must remain transparent about which path is being shown.
2. **Rotate any API key that has ever been pasted into chat, screenshots, logs, or source.** Confirm the replacement exists only in Netlify’s server-side environment settings.
3. **Add a repository license.** The current workspace has no `LICENSE` file. MIT is appropriate if that matches the creator’s intent.
4. **Record the final demo only after an incognito end-to-end smoke test.** Verify the public URL, first analysis, exactly three questions, brief approval, scene generation, image prompts, one motion plan, estimate, commentary entry, and exports.

### P1 — High-value submission polish

5. Add the live URL, demo video, screenshots, architecture summary, limitations, and Codex/GPT-5.6 acknowledgements to the README.
6. Add Open Graph title, description, and a 1200×630 social-preview image so shared links look intentional. The current `index.html` has a standard description but no social card metadata or branded favicon.
7. Capture a completed project state before recording so the video can jump between stages without waiting on every generation.
8. Keep the video under three minutes and make the “listen first / protect decisions / regenerate surgically” differentiation visible within the first ninety seconds.
9. Use one strong sample story throughout the gallery, GIFs, video, and written submission so judges can follow the emotional transformation without reorienting.
10. Include an explicit limitations sentence in both Devpost and README. Honest boundaries strengthen the technical story around local video sampling, pricing, and direct generator integrations.

### P2 — Nice to have if time remains

11. Add a branded favicon and a polished Devpost thumbnail.
12. Add a one-click “start demo” or documented judging path if guided-demo mode will be used.
13. Add a short architecture image to the Devpost gallery.
14. Update the running build notes with the final public deployment smoke result and submission links.

## Final accuracy notes

- Do not claim that StoryDNA Studio generates images or videos. It generates and edits prompts and production plans for external tools.
- Do not claim that Director’s Commentary watches the entire video or hears audio. It analyzes up to eight timestamped visual samples.
- Do not claim current provider pricing. Credits are calculated only from a creator-configured sample rate.
- Do not claim cloud persistence or multi-project accounts. The MVP persists one active project in local browser storage.
- Do not imply that an uploaded motion-reference image is sent for pixel analysis. It remains a local preview in the current motion workspace.
