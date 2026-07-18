# StoryDNA Studio — Product Requirements Document

## Problem

Solo AI filmmakers can generate individual assets quickly, but must manually translate a poetic or narrative intention into dozens of consistent visual and production decisions. Existing generation-first tools often skip interpretation, flatten ambiguity, and create expensive retries.

## Audience

The primary user is a solo AI filmmaker moving between image generators, image-to-video tools, voice/music tools, and an editor such as CapCut. They value their own voice and need creative continuity more than another generic generation box.

## Product principles

1. **Understand before producing.** Interpretation, clarification, and confirmation precede scenes.
2. **Show the thinking artifact.** The creator can see and correct the StoryDNA interpretation.
3. **Ask only consequential questions.** Three questions must change visual or emotional direction.
4. **Approved means protected.** Later stages inherit confirmed decisions and never silently replace them.
5. **Regenerate surgically.** A scene or prompt can change without rebuilding unaffected work.
6. **Make progress visible.** Stage, approval state, and active AI operation are always clear.

## Primary journey

### 1. Story intake

The creator supplies a title, source type and material, desired vibe, optional character description, aspect ratio, target runtime, and optional preferred tools. The primary action is **Analyze my story**.

### 2. StoryDNA analysis

The system returns:

- Core emotional truth.
- Intended audience feeling.
- Beginning and ending emotional states.
- Emotional arc.
- Themes.
- Symbols and motifs.
- Visual language.
- Color, lighting, texture, and atmosphere.
- Character transformation.
- Interpretation risks.
- Initial estimated scene count.

This is explicitly an interpretation, not a final plan.

### 3. Clarification

The system returns exactly three questions based on ambiguity in the source and analysis. Each includes why the decision matters and optional directional choices without preventing a free-form answer.

The creator can answer, add context, correct the interpretation, or request a different set.

### 4. Confirmed creative brief

Answers and corrections produce an editable brief covering intention, emotional destination, visual identity, character direction, constraints, and continuity requirements. Scene generation remains locked until approval.

### 5. Scenes

The approved brief produces an ordered, editable outline. Scenes have stable IDs and can be inserted, removed, reordered, edited, or individually regenerated.

### 6. Images

Approved scenes receive detailed and short prompts, optional alternate framing, negative instructions, copy, and isolated regeneration.

## Extended hackathon workflow

The working MVP now extends beyond day one with motion planning, configurable production estimates, production-plan export, and visual-frame Director's Commentary. Saved accounts and cloud asset storage remain post-submission infrastructure.

## Functional requirements

- Persist one active project locally for MVP.
- Validate input in the UI and at the API boundary.
- Validate every AI response against a Zod schema.
- Separate AI operations by workflow responsibility.
- Track provenance and approval status in project data.
- Support loading, empty, success, degraded-demo, and error states.
- Keep current stage reachable and completed stages reviewable.
- Meet basic keyboard, label, focus, contrast, and reduced-motion accessibility needs.

## Non-functional requirements

- Responsive from 360px mobile through large desktop.
- No frontend secrets.
- No hard dependency on external storage for the demo.
- Fast perceived progress through staged status language and useful skeletons.
- Production build must pass with no TypeScript errors.

## Measures of success

- A first-time user can reach three questions in under three minutes.
- Analysis feels specific enough that the creator wants to correct or confirm it.
- All three questions represent real creative forks rather than intake repetition.
- The creator can explain where their original text, the AI's reading, and their own decisions live.
- The happy path survives refresh and can be demonstrated without production infrastructure.
