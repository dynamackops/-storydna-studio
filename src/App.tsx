import { useEffect, useMemo, useState, type FormEvent } from "react";
import { storyInputSchema, type CommentaryModeValues, type StoryInputValues } from "../shared/schemas";
import { guidedDemoRequested, requestAnalysis, requestCommentary, requestCreativeBrief, requestImagePrompts, requestMotionPrompt, requestQuestions, requestRegeneratedImagePrompt, requestRegeneratedScene, requestSceneOutline, storyApiHeaders } from "./lib/api";
import { calculateProductionEstimate } from "./lib/estimate";
import { createProductionExport, exportFileName, productionExportToJson, productionExportToMarkdown } from "./lib/export";
import { sampleVideoFrames, validateCommentaryVideo, type SampledClip } from "./lib/videoFrames";
import { useProjectStore } from "./store/projectStore";

const stages = ["Story", "DNA", "Scenes", "Images", "Motion", "Review"];

function Mark() {
  return (
    <div className="mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return <span className={`arrow arrow-${direction}`} aria-hidden="true">→</span>;
}

function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "ready" | "demo" | "unknown">("checking");

  useEffect(() => {
    fetch("/api/story/status", { headers: storyApiHeaders() })
      .then((response) => response.json())
      .then((result: { configured?: boolean }) => setStatus(result.configured ? "ready" : "demo"))
      .catch(() => setStatus("unknown"));
  }, []);

  const labels = {
    checking: "Checking AI",
    ready: "OpenAI ready",
    demo: "Guided demo",
    unknown: "AI status unknown",
  };
  return <span className={`api-status api-${status}`}><i />{labels[status]}</span>;
}

function Header({ activeStage, onStartOver }: { activeStage: number; onStartOver: () => void }) {
  const forcedDemo = guidedDemoRequested();
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="StoryDNA Studio home">
          <Mark />
          <span>StoryDNA</span>
          <em>Studio</em>
        </a>
        <div className="header-actions">
          <ApiStatus />
          <span className="autosave"><i /> Saved locally</span>
          {activeStage > 0 && <button className="text-button" onClick={onStartOver}>New project</button>}
        </div>
      </header>
      <nav className="stage-nav" aria-label="Production stages">
        {stages.map((stage, index) => {
          const active = index === activeStage;
          const complete = index < activeStage;
          return (
            <div className={`stage ${active ? "active" : ""} ${complete ? "complete" : ""}`} key={stage}>
              <span>{complete ? "✓" : String(index + 1).padStart(2, "0")}</span>
              {stage}
            </div>
          );
        })}
      </nav>
      {forcedDemo && <div className="demo-route-banner"><span>✦ Guided demo route</span> Uses deterministic sample responses for a reliable walkthrough; no model request is made.</div>}
    </>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  wide?: boolean;
}

function Field({ label, hint, error, children, wide }: FieldProps) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span className="field-label">{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

function StoryIntake({ onAnalyze }: { onAnalyze: (input: StoryInputValues) => Promise<void> }) {
  const { draft, updateDraft, loadDemoStory, status, error } = useProjectStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = status === "analyzing" || status === "questioning";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = storyInputSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    await onAnalyze(parsed.data);
  };

  return (
    <main id="top" className="intake-shell">
      <section className="intake-intro">
        <p className="eyebrow"><span>01</span> Story intake</p>
        <h1>Your story already has a <em>visual language.</em></h1>
        <p className="lede">Before we plan a single shot, let’s understand what you’re really trying to make people feel.</p>
        <div className="promise">
          <span className="promise-line" />
          <p>Keep your voice.<br /><strong>Lose the production chaos.</strong></p>
        </div>
        <button type="button" className="sample-button" onClick={loadDemoStory} disabled={busy}>
          <span>✦</span> Load the demo poem
        </button>
        <aside className="director-note">
          <p>From the director’s notebook</p>
          <blockquote>“The first question isn’t what should we generate? It’s what must the audience carry home?”</blockquote>
        </aside>
      </section>

      <form className="story-form" onSubmit={submit} noValidate>
        <div className="form-heading">
          <div><span>New project</span><h2>Give me the raw material.</h2></div>
          <span className="step-pill">Step 1 of 6</span>
        </div>
        <div className="form-grid">
          <Field label="Project title" error={errors.title}>
            <input value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} placeholder="The House That Kept the Dawn" />
          </Field>
          <Field label="Source type">
            <select value={draft.sourceType} onChange={(e) => updateDraft("sourceType", e.target.value as StoryInputValues["sourceType"])}>
              <option value="poem">Poem</option><option value="script">Script</option><option value="lyrics">Lyrics</option><option value="story">Story</option><option value="concept">Rough concept</option>
            </select>
          </Field>
          <Field label="Source material" hint={`${draft.sourceText.length.toLocaleString()} / 30,000`} error={errors.sourceText} wide>
            <textarea className="source-text" value={draft.sourceText} onChange={(e) => updateDraft("sourceText", e.target.value)} placeholder="Paste the poem, script, lyrics, story, or rough concept. Keep it unpolished—this is where we listen." />
          </Field>
          <Field label="Desired visual vibe" error={errors.visualVibe} wide>
            <input value={draft.visualVibe} onChange={(e) => updateDraft("visualVibe", e.target.value)} placeholder="e.g. intimate 35mm, celestial surrealism, quiet magical realism" />
          </Field>
          <Field label="Character direction" hint="Optional" wide>
            <textarea value={draft.characterDescription} onChange={(e) => updateDraft("characterDescription", e.target.value)} placeholder="Appearance, energy, wardrobe, or what must stay visually consistent…" />
          </Field>
          <Field label="Aspect ratio">
            <select value={draft.aspectRatio} onChange={(e) => updateDraft("aspectRatio", e.target.value as StoryInputValues["aspectRatio"])}>
              <option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option><option>2.39:1</option>
            </select>
          </Field>
          <Field label="Target runtime">
            <div className="runtime-input"><input type="number" min="10" max="600" value={draft.targetRuntimeSeconds} onChange={(e) => updateDraft("targetRuntimeSeconds", Number(e.target.value))} /><span>seconds</span></div>
          </Field>
          <Field label="Preferred tools" hint="Optional" wide>
            <input value={draft.preferredTools} onChange={(e) => updateDraft("preferredTools", e.target.value)} placeholder="Runway, Kling, Veo, Midjourney, CapCut…" />
          </Field>
        </div>
        {error && <div className="error-banner" role="alert"><strong>The reading paused.</strong> {error}</div>}
        <div className="form-footer">
          <p><span>✦</span> We’ll interpret first. No scenes will be generated yet.</p>
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Reading your story…" : "Analyze my story"}<Arrow />
          </button>
        </div>
      </form>
    </main>
  );
}

function LoadingDirector({ message, phase }: { message: string; phase: string }) {
  return (
    <main className="loading-stage" aria-live="polite">
      <div className="orb"><span /><span /><span /></div>
      <p className="eyebrow">The creative director is listening</p>
      <h1>{phase}</h1>
      <p>{message}</p>
      <div className="loading-track"><i /></div>
      <small>Original language stays untouched. Interpretation remains yours to correct.</small>
    </main>
  );
}

function AnalysisHeader() {
  const { draft, meta } = useProjectStore();
  return (
    <div className="dna-title-row">
      <div>
        <p className="eyebrow"><span>02</span> StoryDNA reading</p>
        <h1>I think this story is really about <em>what remains.</em></h1>
        <p>Here’s my reading of <strong>{draft.title}</strong>. This is an interpretation—not a verdict.</p>
      </div>
      <div className="reading-meta">
        {meta?.demoMode && <span className="demo-badge">✦ Guided demo mode</span>}
        <span>{draft.sourceType} · {draft.targetRuntimeSeconds}s · {draft.aspectRatio}</span>
      </div>
    </div>
  );
}

function AnalysisView() {
  const { analysis } = useProjectStore();
  if (!analysis) return null;
  return (
    <section className="analysis-section" aria-labelledby="analysis-heading">
      <div className="section-kicker"><span>Our reading</span><i /></div>
      <div className="truth-card">
        <span>Core emotional truth</span>
        <h2 id="analysis-heading">{analysis.coreEmotionalTruth}</h2>
        <p><strong>What the audience should carry:</strong> {analysis.intendedAudienceFeeling}</p>
      </div>
      <div className="arc-card">
        <div className="arc-state"><span>Beginning</span><p>{analysis.beginningEmotionalState}</p></div>
        <div className="arc-line"><i /><b>Emotional arc</b><i /></div>
        <div className="arc-state"><span>Ending</span><p>{analysis.endingEmotionalState}</p></div>
        <blockquote>{analysis.emotionalArc}</blockquote>
      </div>
      <div className="analysis-grid">
        <article className="analysis-card themes">
          <span className="card-number">01</span><p className="card-label">Main themes</p>
          <div className="theme-list">{analysis.mainThemes.map((theme) => <span key={theme}>{theme}</span>)}</div>
        </article>
        <article className="analysis-card visual">
          <span className="card-number">02</span><p className="card-label">Visual language</p>
          <p>{analysis.visualLanguage}</p>
        </article>
        <article className="analysis-card sensory">
          <span className="card-number">03</span><p className="card-label">Sensory direction</p>
          {Object.entries(analysis.sensoryDirection).map(([key, value]) => <div key={key}><span>{key}</span><p>{value}</p></div>)}
        </article>
        <article className="analysis-card symbols">
          <span className="card-number">04</span><p className="card-label">Symbols & motifs</p>
          {analysis.symbolsAndMotifs.map((motif) => <div className="motif" key={motif.symbol}><h3>{motif.symbol}</h3><p>{motif.possibleMeaning}</p><small>{motif.visualOpportunity}</small></div>)}
        </article>
        <article className="analysis-card character">
          <span className="card-number">05</span><p className="card-label">Character transformation</p>
          <p>{analysis.characterTransformation}</p>
        </article>
        <article className="analysis-card risks">
          <span className="card-number">06</span><p className="card-label">Interpretation risks</p>
          <ul>{analysis.interpretationRisks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
          <div className="scene-estimate"><strong>{String(analysis.initialEstimatedSceneCount).padStart(2, "0")}</strong><span>initial scenes<br />estimated</span></div>
        </article>
      </div>
    </section>
  );
}

function QuestionsView({ onRegenerate, onBuildBrief }: { onRegenerate: () => Promise<void>; onBuildBrief: () => Promise<void> }) {
  const { questions, answers, setAnswer, userCorrection, setUserCorrection, extraContext, setExtraContext, status, error } = useProjectStore();
  const [showContext, setShowContext] = useState(false);
  const busy = status === "questioning";
  if (questions.length !== 3) return null;

  return (
    <section className="questions-section">
      <div className="questions-heading">
        <div><p className="eyebrow"><span>03</span> Before we direct</p><h2>Three choices will define the film.</h2><p>Your answers become protected creative decisions—not disposable chat.</p></div>
        <button className="secondary-button" disabled={busy} onClick={onRegenerate}>↻ Ask a different three</button>
      </div>
      <div className="question-list">
        {questions.map((question, index) => (
          <article className="question-card" key={question.id}>
            <div className="question-index">0{index + 1}</div>
            <div className="question-content">
              <span>{question.decisionArea}</span>
              <h3>{question.question}</h3>
              <p>{question.whyItMatters}</p>
              <div className="option-row">
                {question.options.map((option) => <button type="button" className={answers[question.id] === option ? "selected" : ""} onClick={() => setAnswer(question.id, option)} key={option}>{option}</button>)}
              </div>
              <textarea aria-label={`Your answer to question ${index + 1}`} value={answers[question.id] || ""} onChange={(e) => setAnswer(question.id, e.target.value)} placeholder="Or answer in your own words…" />
            </div>
          </article>
        ))}
      </div>
      <div className="context-panel">
        <button type="button" className="context-toggle" onClick={() => setShowContext(!showContext)} aria-expanded={showContext}>
          <span><b>Something in the reading feels off?</b><small>Correct the interpretation or add context before the creative brief.</small></span><Arrow direction="down" />
        </button>
        {showContext && <div className="context-fields">
          <Field label="Correction to the StoryDNA interpretation"><textarea value={userCorrection} onChange={(e) => setUserCorrection(e.target.value)} placeholder="The house isn't a memory—it represents the future she was afraid to choose…" /></Field>
          <Field label="Extra creative context"><textarea value={extraContext} onChange={(e) => setExtraContext(e.target.value)} placeholder="A personal reference, non-negotiable image, cultural context, or constraint…" /></Field>
        </div>}
      </div>
      <div className="next-stage-preview">
        <div><span>Next</span><h3>Confirm the creative brief</h3><p>Your answers will be distilled into an editable north star before any scenes are made.</p></div>
        <button className="primary-button" onClick={onBuildBrief}>Build creative brief <Arrow /></button>
      </div>
      {error && <div className="error-banner brief-error" role="alert"><strong>The brief needs one more thing.</strong> {error}</div>}
    </section>
  );
}

function BriefField({ label, value, onChange, locked, large = false }: { label: string; value: string; onChange: (value: string) => void; locked: boolean; large?: boolean }) {
  return (
    <label className={`brief-field ${large ? "brief-field-large" : ""}`}>
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} readOnly={locked} />
    </label>
  );
}

function CreativeBriefView({ onBuildScenes }: { onBuildScenes: () => Promise<void> }) {
  const { brief, draft, updateBriefField, approveBrief, returnToQuestions, meta } = useProjectStore();
  if (!brief) return null;
  const locked = brief.approval === "approved";
  const editList = (key: "storytellingConstraints" | "consistencyRequirements", value: string) =>
    updateBriefField(key, value.split("\n").map((item) => item.trim()).filter(Boolean));

  return (
    <section className={`brief-workspace ${locked ? "brief-approved" : ""}`}>
      <div className="brief-hero">
        <div>
          <p className="eyebrow"><span>04</span> Confirmed direction</p>
          <h1>{locked ? "This is the film’s north star." : "Shape the brief before we build."}</h1>
          <p>{locked ? "These decisions are now protected and will guide every scene and prompt." : "Edit anything that misses your intention. Nothing moves to scenes until you approve it."}</p>
        </div>
        <div className={`approval-seal ${locked ? "sealed" : ""}`}>
          <span>{locked ? "✓" : "04"}</span>
          <strong>{locked ? "Approved" : "Awaiting approval"}</strong>
          <small>{meta?.demoMode ? "Guided demo" : meta?.model}</small>
        </div>
      </div>

      <div className="provenance-strip">
        <div><span>Original voice</span><strong>{draft.title}</strong></div>
        <i />
        <div><span>AI reading</span><strong>StoryDNA interpretation</strong></div>
        <i />
        <div><span>Your decisions</span><strong>3 clarifying answers</strong></div>
        <i />
        <div className={locked ? "current" : ""}><span>Creative brief</span><strong>{locked ? "Approved & protected" : "Editable draft"}</strong></div>
      </div>

      <div className="brief-paper">
        <div className="brief-paper-heading">
          <div><span>Production brief</span><h2>{draft.title}</h2></div>
          <p>{draft.aspectRatio} · approx. {draft.targetRuntimeSeconds}s · {draft.sourceType}</p>
        </div>
        <div className="brief-fields-grid">
          <BriefField large label="Creative intention" value={brief.creativeIntention} locked={locked} onChange={(value) => updateBriefField("creativeIntention", value)} />
          <BriefField label="Emotional destination" value={brief.emotionalDestination} locked={locked} onChange={(value) => updateBriefField("emotionalDestination", value)} />
          <BriefField label="Visual identity" value={brief.visualIdentity} locked={locked} onChange={(value) => updateBriefField("visualIdentity", value)} />
          <BriefField label="Character direction" value={brief.characterDirection} locked={locked} onChange={(value) => updateBriefField("characterDirection", value)} />
          <BriefField label="Storytelling constraints · one per line" value={brief.storytellingConstraints.join("\n")} locked={locked} onChange={(value) => editList("storytellingConstraints", value)} />
          <BriefField label="Must remain consistent · one per line" value={brief.consistencyRequirements.join("\n")} locked={locked} onChange={(value) => editList("consistencyRequirements", value)} />
        </div>
      </div>

      {!locked ? (
        <div className="brief-actions">
          <button className="secondary-button" onClick={returnToQuestions}>← Revise my answers</button>
          <p><span>✦</span> Approval protects this brief from later AI regeneration.</p>
          <button className="primary-button" onClick={approveBrief}>Approve creative brief <Arrow /></button>
        </div>
      ) : (
        <div className="approved-next">
          <div><span className="approved-check">✓</span><div><strong>Creative direction locked</strong><p>Scene generation will inherit these exact decisions.</p></div></div>
          <button className="primary-button" onClick={onBuildScenes}>Build scene outline <Arrow /></button>
        </div>
      )}
    </section>
  );
}

function SceneTextField({ label, value, onChange, locked, rows = 2 }: { label: string; value: string; onChange: (value: string) => void; locked: boolean; rows?: number }) {
  return <label className="scene-field"><span>{label}</span><textarea rows={rows} value={value} readOnly={locked} onChange={(event) => onChange(event.target.value)} /></label>;
}

function ScenesWorkspace({ onRegenerateScene, onGeneratePrompts }: { onRegenerateScene: (id: string) => Promise<void>; onGeneratePrompts: () => Promise<void> }) {
  const store = useProjectStore();
  const locked = store.sceneApproval === "approved";
  const totalDuration = store.scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0);

  return (
    <section className={`scenes-workspace ${locked ? "scenes-approved" : ""}`}>
      <div className="scenes-hero">
        <div><p className="eyebrow"><span>05</span> Scene architecture</p><h1>{locked ? "The visual rhythm is locked." : "Build the film, beat by beat."}</h1><p>{locked ? "Every downstream image prompt will inherit this approved order and intention." : "Edit freely. Reorder the rhythm. Regenerate only the scene that needs another idea."}</p></div>
        <div className="outline-stats"><div><strong>{String(store.scenes.length).padStart(2, "0")}</strong><span>Scenes</span></div><i /><div><strong>{totalDuration}s</strong><span>Estimated runtime</span></div></div>
      </div>

      <div className="outline-toolbar">
        <div><span className={`outline-status ${locked ? "locked" : ""}`}>{locked ? "✓ Approved outline" : "Editable outline"}</span><small>Stable IDs preserve unaffected work</small></div>
        {!locked && <button className="secondary-button" onClick={store.addScene}>＋ Add scene</button>}
      </div>

      <div className="scene-list">
        {store.scenes.map((scene, index) => {
          const regenerating = store.regeneratingSceneId === scene.id;
          return (
            <article className="scene-card" data-scene-id={scene.id} key={scene.id}>
              <div className="scene-rail"><strong>{String(scene.position).padStart(2, "0")}</strong><span>{scene.id}</span>{!locked && <div className="reorder-controls"><button aria-label={`Move scene ${scene.position} up`} disabled={index === 0} onClick={() => store.moveScene(scene.id, -1)}>↑</button><button aria-label={`Move scene ${scene.position} down`} disabled={index === store.scenes.length - 1} onClick={() => store.moveScene(scene.id, 1)}>↓</button></div>}</div>
              <div className="scene-body">
                <div className="scene-card-heading">
                  <SceneTextField label="Story beat" value={scene.storyBeat} locked={locked} onChange={(value) => store.updateScene(scene.id, "storyBeat", value)} />
                  <label className="duration-field"><span>Duration</span><div><input type="number" min="1" max="60" value={scene.durationSeconds} readOnly={locked} onChange={(event) => store.updateScene(scene.id, "durationSeconds", Math.max(1, Number(event.target.value)))} /><b>sec</b></div></label>
                </div>
                <div className="scene-fields-grid">
                  <SceneTextField label="Source reference" value={scene.sourceReference} locked={locked} onChange={(value) => store.updateScene(scene.id, "sourceReference", value)} />
                  <SceneTextField label="Narrative purpose" value={scene.narrativePurpose} locked={locked} onChange={(value) => store.updateScene(scene.id, "narrativePurpose", value)} />
                  <SceneTextField label="Emotional intention" value={scene.emotionalIntention} locked={locked} onChange={(value) => store.updateScene(scene.id, "emotionalIntention", value)} />
                  <SceneTextField label="Suggested shot" value={scene.shotType} locked={locked} onChange={(value) => store.updateScene(scene.id, "shotType", value)} />
                  <div className="scene-wide"><SceneTextField rows={3} label="Visual description" value={scene.visualDescription} locked={locked} onChange={(value) => store.updateScene(scene.id, "visualDescription", value)} /></div>
                  <div className="scene-wide"><SceneTextField label="Transition idea" value={scene.transitionIdea} locked={locked} onChange={(value) => store.updateScene(scene.id, "transitionIdea", value)} /></div>
                </div>
                {!locked && <div className="scene-actions"><input aria-label={`Regeneration note for scene ${scene.position}`} value={store.sceneNotes[scene.id] || ""} onChange={(event) => store.setSceneNote(scene.id, event.target.value)} placeholder="Optional direction for a different version…" /><button className="secondary-button" disabled={regenerating} onClick={() => onRegenerateScene(scene.id)}>{regenerating ? "Regenerating…" : "↻ Regenerate scene"}</button><button className="delete-scene" disabled={store.scenes.length <= 2} onClick={() => store.deleteScene(scene.id)}>Delete</button></div>}
              </div>
            </article>
          );
        })}
      </div>

      {store.error && <div className="error-banner scene-error" role="alert"><strong>The production step paused.</strong> {store.error} Make sure the local development server is running, then try again.</div>}

      {!locked ? <div className="outline-approval"><div><span>Ready?</span><h3>Approve the scene outline</h3><p>Approval locks order and content before image prompts are generated.</p></div><button className="primary-button" onClick={store.approveScenes}>Approve outline <Arrow /></button></div> : <div className="approved-next"><div><span className="approved-check">✓</span><div><strong>Scene outline protected</strong><p>Unchanged scenes will keep their stable IDs through the next stage.</p></div></div><button className="primary-button" onClick={onGeneratePrompts}>Generate image prompts <Arrow /></button></div>}
    </section>
  );
}

function PromptField({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="prompt-field"><span>{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function ImagesWorkspace({ onRegeneratePrompt, onOpenMotion }: { onRegeneratePrompt: (sceneId: string) => Promise<void>; onOpenMotion: () => void }) {
  const store = useProjectStore();
  const [copied, setCopied] = useState<string>();

  const copyPrompt = async (sceneId: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(sceneId);
      window.setTimeout(() => setCopied((current) => current === sceneId ? undefined : current), 1600);
    } catch {
      store.fail("The browser blocked clipboard access. Select the prompt text and copy it manually.");
    }
  };

  return (
    <section className="images-workspace">
      <div className="images-hero">
        <div><p className="eyebrow"><span>06</span> Image direction</p><h1>Every frame speaks the same language.</h1><p>Detailed prompts inherit your approved brief, scene intention, aspect ratio, and character anchors. Edit freely or regenerate one frame without touching the rest.</p></div>
        <div className="prompt-count"><strong>{String(store.imagePrompts.length).padStart(2, "0")}</strong><span>Production-ready<br />image prompts</span></div>
      </div>
      <div className="prompt-provenance"><span>✓ Approved brief</span><i /> <span>✓ Approved scenes</span><i /> <strong>{store.draft.aspectRatio} consistency applied</strong></div>
      <div className="prompt-list">
        {store.imagePrompts.map((prompt) => {
          const scene = store.scenes.find((item) => item.id === prompt.sceneId);
          if (!scene) return null;
          const regenerating = store.regeneratingPromptSceneId === scene.id;
          return (
            <article className="prompt-card" data-scene-id={scene.id} key={prompt.id}>
              <header className="prompt-card-header">
                <div className="prompt-scene-number">{String(scene.position).padStart(2, "0")}</div>
                <div><span>{scene.id} · {prompt.aspectRatio}</span><h2>{scene.storyBeat}</h2><p>{scene.emotionalIntention}</p></div>
                <button className={`copy-button ${copied === scene.id ? "copied" : ""}`} onClick={() => copyPrompt(scene.id, prompt.detailedPrompt)}>{copied === scene.id ? "✓ Copied" : "Copy prompt"}</button>
              </header>
              <div className="prompt-grid">
                <div className="prompt-wide"><PromptField label="Detailed generation prompt" rows={9} value={prompt.detailedPrompt} onChange={(value) => store.updateImagePrompt(scene.id, "detailedPrompt", value)} /></div>
                <PromptField label="Short prompt" rows={5} value={prompt.shortPrompt} onChange={(value) => store.updateImagePrompt(scene.id, "shortPrompt", value)} />
                <PromptField label="Alternate framing" rows={5} value={prompt.alternateFraming} onChange={(value) => store.updateImagePrompt(scene.id, "alternateFraming", value)} />
                <div className="prompt-wide"><PromptField label="Negative instructions" rows={3} value={prompt.negativeInstructions} onChange={(value) => store.updateImagePrompt(scene.id, "negativeInstructions", value)} /></div>
              </div>
              <div className="consistency-panel"><span>Consistency anchors</span><div>{prompt.consistencyAnchors.map((anchor) => <em key={anchor}>{anchor}</em>)}</div></div>
              <div className="prompt-actions"><input aria-label={`Regeneration note for image prompt ${scene.position}`} value={store.imagePromptNotes[scene.id] || ""} onChange={(event) => store.setImagePromptNote(scene.id, event.target.value)} placeholder="Optional direction: wider, more intimate, less literal…" /><button className="secondary-button" disabled={regenerating} onClick={() => onRegeneratePrompt(scene.id)}>{regenerating ? "Regenerating…" : "↻ Regenerate this prompt"}</button></div>
            </article>
          );
        })}
      </div>
      {store.error && <div className="error-banner" role="alert"><strong>The image director paused.</strong> {store.error}</div>}
      <div className="outline-approval images-next"><div><span>Images ready</span><h3>Next: bring each frame to life</h3><p>Upload your selected stills and design controlled motion one scene at a time.</p></div><button className="primary-button" onClick={onOpenMotion}>Open motion workspace <Arrow /></button></div>
    </section>
  );
}

function MotionField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="motion-field"><span>{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Generate a motion plan or write your own direction…" /></label>;
}

function MotionWorkspace({ onGenerateMotion }: { onGenerateMotion: (sceneId: string) => Promise<void> }) {
  const store = useProjectStore();
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string>();

  const uploadStill = (sceneId: string, file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return store.fail("Choose a JPG, PNG, WEBP, or other browser-readable image file.");
    if (file.size > 10 * 1024 * 1024) return store.fail("Keep the local preview under 10 MB for this MVP.");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setPreviews((current) => ({ ...current, [sceneId]: reader.result as string }));
    };
    reader.onerror = () => store.fail("The browser could not read that image.");
    reader.readAsDataURL(file);
    store.setMotionImageName(sceneId, file.name);
  };

  const copyMotion = async (sceneId: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(sceneId);
      window.setTimeout(() => setCopied((current) => current === sceneId ? undefined : current), 1600);
    } catch {
      store.fail("The browser blocked clipboard access. Select the motion prompt and copy it manually.");
    }
  };

  const completed = store.motionPlans.filter((plan) => plan.imageToVideoPrompt).length;
  return (
    <section className="motion-workspace">
      <div className="motion-hero">
        <div><button className="back-stage-button" onClick={store.closeMotionWorkspace}>← Back to image prompts</button><p className="eyebrow"><span>07</span> Motion direction</p><h1>Move only what carries meaning.</h1><p>Upload the chosen still for visual reference, add your own direction, then create a controlled image-to-video plan for each scene.</p></div>
        <div className="motion-progress"><strong>{completed}/{store.motionPlans.length}</strong><span>Motion plans<br />ready</span></div>
      </div>
      <div className="local-asset-note"><span>Private local preview</span><p>Uploaded images stay in this browser session and are not sent to the planning API. Re-select them after a refresh.</p></div>
      <div className="motion-list">
        {store.motionPlans.map((plan) => {
          const scene = store.scenes.find((item) => item.id === plan.sceneId);
          if (!scene) return null;
          const hasPlan = Boolean(plan.imageToVideoPrompt);
          return (
            <article className={`motion-card ${hasPlan ? "motion-ready" : ""}`} data-scene-id={scene.id} key={plan.id}>
              <div className="motion-card-heading"><div><span>Scene {String(scene.position).padStart(2, "0")} · {scene.id}</span><h2>{scene.storyBeat}</h2><p>{scene.emotionalIntention}</p></div><span className="motion-status">{hasPlan ? "✓ Plan ready" : "Awaiting direction"}</span></div>
              <div className="motion-setup">
                <label className={`still-uploader ${previews[scene.id] ? "has-preview" : ""}`}>
                  {previews[scene.id] ? <img src={previews[scene.id]} alt={`Uploaded still for scene ${scene.position}`} /> : <div><span>＋</span><strong>Upload scene still</strong><small>JPG, PNG, or WEBP · max 10 MB</small></div>}
                  <input type="file" accept="image/*" onChange={(event) => uploadStill(scene.id, event.target.files?.[0])} />
                  {previews[scene.id] && <em>Replace image</em>}
                </label>
                <div className="motion-note-block"><span>Story beat</span><p>{scene.visualDescription}</p><label><span>Your motion notes</span><textarea value={store.motionNotes[scene.id] || ""} onChange={(event) => store.setMotionNote(scene.id, event.target.value)} placeholder="What should move, what must stay still, and what should the audience notice?" /></label><button className="primary-button" onClick={() => onGenerateMotion(scene.id)}>{hasPlan ? "Regenerate motion plan" : "Generate motion plan"}<Arrow /></button></div>
              </div>
              {hasPlan && <>
                <div className="motion-direction-grid">
                  <MotionField label="Intended action" value={plan.intendedAction} onChange={(value) => store.updateMotionPlan(scene.id, "intendedAction", value)} />
                  <MotionField label="Camera movement" value={plan.cameraMovement} onChange={(value) => store.updateMotionPlan(scene.id, "cameraMovement", value)} />
                  <MotionField label="Subject movement" value={plan.subjectMovement} onChange={(value) => store.updateMotionPlan(scene.id, "subjectMovement", value)} />
                  <MotionField label="Environmental movement" value={plan.environmentalMovement} onChange={(value) => store.updateMotionPlan(scene.id, "environmentalMovement", value)} />
                  <MotionField label="Facial-expression direction" value={plan.facialExpressionDirection} onChange={(value) => store.updateMotionPlan(scene.id, "facialExpressionDirection", value)} />
                  <MotionField label="Transition into next shot" value={plan.transitionIntoNextShot} onChange={(value) => store.updateMotionPlan(scene.id, "transitionIntoNextShot", value)} />
                </div>
                <div className="motion-prompt-block"><div><span>Image-to-video prompt</span><button className={copied === scene.id ? "copied" : ""} onClick={() => copyMotion(scene.id, plan.imageToVideoPrompt)}>{copied === scene.id ? "✓ Copied" : "Copy prompt"}</button></div><textarea rows={8} value={plan.imageToVideoPrompt} onChange={(event) => store.updateMotionPlan(scene.id, "imageToVideoPrompt", event.target.value)} /></div>
                <div className="motion-footer-grid"><MotionField label="Negative motion instructions" value={plan.negativeMotionInstructions} onChange={(value) => store.updateMotionPlan(scene.id, "negativeMotionInstructions", value)} /><div className="motion-metadata"><label><span>Clip duration</span><div><input type="number" min="1" max="20" value={plan.durationSeconds} onChange={(event) => store.updateMotionPlan(scene.id, "durationSeconds", Math.max(1, Math.min(20, Number(event.target.value))))} /><b>sec</b></div></label><label><span>Suggested model category</span><textarea value={plan.suggestedModelCategory} onChange={(event) => store.updateMotionPlan(scene.id, "suggestedModelCategory", event.target.value)} /></label></div></div>
              </>}
            </article>
          );
        })}
      </div>
      {store.error && <div className="error-banner scene-error" role="alert"><strong>The motion director paused.</strong> {store.error}</div>}
      <div className="outline-approval motion-next"><div><span>Next</span><h3>Estimate the production effort</h3><p>Turn scene duration and shot difficulty into transparent generation ranges.</p></div><button className="primary-button" onClick={store.openEstimateWorkspace}>Build production estimate <Arrow /></button></div>
    </section>
  );
}

function EstimateWorkspace() {
  const store = useProjectStore();
  const estimate = useMemo(
    () => calculateProductionEstimate(store.scenes, store.motionPlans, store.estimateConfig),
    [store.scenes, store.motionPlans, store.estimateConfig],
  );
  const formatCredits = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1);
  const downloadPlan = (format: "md" | "json") => {
    if (!store.analysis || !store.brief) return;
    const project = createProductionExport({
      originalSource: store.draft,
      interpretation: store.analysis,
      questions: store.questions,
      answers: store.answers,
      userCorrection: store.userCorrection,
      extraContext: store.extraContext,
      confirmedBrief: store.brief,
      scenes: store.scenes,
      imagePrompts: store.imagePrompts,
      motionPlans: store.motionPlans,
      productionEstimate: estimate,
      commentaryReport: store.commentaryReport,
    });
    const contents = format === "md" ? productionExportToMarkdown(project) : productionExportToJson(project);
    const blob = new Blob([contents], { type: format === "md" ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = exportFileName(store.draft.title, format);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };

  return (
    <section className="estimate-workspace">
      <div className="estimate-hero">
        <div><button className="back-stage-button" onClick={store.closeEstimateWorkspace}>← Back to motion plans</button><p className="eyebrow"><span>08</span> Production estimate</p><h1>Know the effort before you render.</h1><p>A transparent planning range based on your approved scenes, clip durations, expected attempts, and likely shot difficulty.</p></div>
        <div className="estimate-runtime"><strong>{estimate.finishedRuntimeSeconds}s</strong><span>Estimated finished<br />runtime</span></div>
      </div>

      <div className="estimate-config">
        <div><span>Estimate configuration</span><p>Adjust these assumptions to match your workflow. They are saved locally.</p></div>
        <label><span>Generation platform</span><select value={store.estimateConfig.platformLabel} onChange={(event) => store.updateEstimateConfig("platformLabel", event.target.value)}><option>Mixed / not selected</option><option>Kling</option><option>Runway</option><option>Veo</option><option>Higgsfield</option><option>Other configured platform</option></select></label>
        <label><span>Expected attempts per scene</span><input type="number" min="1" max="12" value={store.estimateConfig.attemptsPerScene} onChange={(event) => store.updateEstimateConfig("attemptsPerScene", Math.max(1, Math.min(12, Number(event.target.value))))} /></label>
        <label><span>Sample credits per generation</span><input type="number" min="0" step="0.1" value={store.estimateConfig.sampleCreditsPerGeneration ?? ""} onChange={(event) => store.updateEstimateConfig("sampleCreditsPerGeneration", event.target.value === "" ? undefined : Math.max(0, Number(event.target.value)))} placeholder="Optional" /><small>Leave blank until you configure a sample rate.</small></label>
      </div>

      <div className="estimate-range" aria-label="Generation estimate range">
        <article><span>Minimum likely</span><strong>{estimate.minimumLikelyGenerations}</strong><p>One usable generation per approved scene.</p></article>
        <article className="expected"><span>Expected</span><strong>{estimate.expectedGenerations}</strong><p>Your attempt setting adjusted by shot difficulty.</p></article>
        <article><span>High-retry</span><strong>{estimate.highRetryEstimate}</strong><p>Extra retries for difficult motion and continuity.</p></article>
      </div>

      {estimate.estimatedCredits ? <div className="credit-estimate"><div><span>Configured sample credit range</span><strong>{formatCredits(estimate.estimatedCredits.minimum)}–{formatCredits(estimate.estimatedCredits.highRetry)} credits</strong></div><p>Expected: {formatCredits(estimate.estimatedCredits.expected)} · {estimate.estimatedCredits.configurationLabel}</p></div> : <div className="credit-empty"><span>Credits not configured</span><p>Add a sample credits-per-generation value above to calculate a planning range. No current provider pricing is hardcoded.</p></div>}

      <div className="shot-estimates">
        <div className="shot-estimates-heading"><div><span>Shot-by-shot risk</span><h2>Where retries are most likely</h2></div><p>{estimate.difficultSceneIds.length ? `${estimate.difficultSceneIds.length} shot${estimate.difficultSceneIds.length === 1 ? "" : "s"} marked difficult` : "No shots currently marked high difficulty"}</p></div>
        {estimate.shots.map((shot) => {
          const scene = store.scenes.find((item) => item.id === shot.sceneId);
          return <article className="shot-estimate-row" key={shot.sceneId}><div className="shot-estimate-id"><span>{String(scene?.position || 0).padStart(2, "0")}</span><div><strong>{scene?.storyBeat}</strong><small>{shot.sceneId}</small></div></div><span className={`difficulty difficulty-${shot.difficulty}`}>{shot.difficulty}</span><p>{shot.difficultyReason}</p><div className="shot-generation-range"><span>Expected</span><strong>{shot.expectedGenerations}</strong><small>High {shot.highRetryGenerations}</small></div></article>;
        })}
      </div>

      <div className="estimate-disclaimer"><span>Planning estimate</span><p>{estimate.disclaimer}</p></div>
      <div className="outline-approval estimate-next"><div><span>Core production plan complete</span><h3>Take the director’s packet with you.</h3><p>Markdown is ready to read or paste into a production document. JSON preserves the structured project for future integrations. Local images and credentials are excluded.</p></div><div className="export-actions"><button className="secondary-button" onClick={() => downloadPlan("json")}>Download JSON</button><button className="primary-button" onClick={() => downloadPlan("md")}>Export Markdown <Arrow /></button></div></div>
      <div className="review-entry"><div><span>Finished a cut?</span><h3>Bring it back to the director’s room.</h3><p>Compare a finished clip with the source, approved intention, emotional arc, and scene plan.</p></div><button className="primary-button" onClick={store.openCommentaryWorkspace}>Open Director’s Commentary <Arrow /></button></div>
    </section>
  );
}

const commentaryModeOptions: Array<{ id: CommentaryModeValues; title: string; description: string }> = [
  { id: "gentle", title: "Gentle collaborator", description: "Warm, perceptive notes that protect the film's voice." },
  { id: "direct", title: "Direct film editor", description: "Clear priorities with no cushioning or vague praise." },
  { id: "audience", title: "Audience reaction", description: "What a first-time viewer can feel and understand." },
  { id: "technical", title: "AI-video technical", description: "Continuity, motion, artifacts, timing, and repair choices." },
];

const scorecardLabels: Record<string, string> = {
  narrativeClarity: "Narrative clarity",
  emotionalPayoff: "Emotional payoff",
  pacing: "Pacing",
  visualConsistency: "Visual consistency",
  characterContinuity: "Character continuity",
  symbolism: "Symbolism",
  shotDuration: "Shot duration",
  repetition: "Repetition",
  transitions: "Transitions",
};

function CommentaryWorkspace({ onAnalyze }: { onAnalyze: (clip: SampledClip) => Promise<void> }) {
  const store = useProjectStore();
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileError, setFileError] = useState("");
  const [sampling, setSampling] = useState(false);
  const report = store.commentaryReport;

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const chooseClip = (nextFile?: File) => {
    if (!nextFile) return;
    try {
      validateCommentaryVideo(nextFile);
      setFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
      setFileError("");
    } catch (error) {
      setFile(undefined);
      setPreviewUrl("");
      setFileError(error instanceof Error ? error.message : "That clip could not be opened.");
    }
  };

  const analyzeClip = async () => {
    if (!file) { setFileError("Upload a finished clip before requesting commentary."); return; }
    setSampling(true);
    setFileError("");
    try {
      const clip = await sampleVideoFrames(file);
      await onAnalyze(clip);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "The clip could not be sampled.");
    } finally {
      setSampling(false);
    }
  };

  if (report) {
    return (
      <section className="commentary-workspace">
        <div className="commentary-hero report-hero"><div><button className="back-stage-button" onClick={store.closeCommentaryWorkspace}>← Back to production plan</button><p className="eyebrow"><span>09</span> Director’s Commentary</p><h1>The cut is speaking. Here’s what it says.</h1><p>{report.summary}</p></div><div className="report-mode"><span>Feedback lens</span><strong>{commentaryModeOptions.find((mode) => mode.id === report.mode)?.title}</strong><small>{new Date(report.createdAt).toLocaleString()}</small></div></div>

        <div className="commentary-scorecard">
          {Object.entries(report.scorecard).map(([key, item]) => <article key={key} className={`score-${item.status}`}><span>{scorecardLabels[key]}</span><strong>{item.status.replace("-", " ")}</strong><p>{item.note}</p></article>)}
        </div>

        <div className="commentary-report-grid">
          <article className="commentary-section working"><span>01 · What is working</span><h2>Protect these choices.</h2><ul>{report.whatIsWorking.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article className="commentary-section unclear"><span>02 · Where meaning is unclear</span><h2>The audience may lose the thread here.</h2><ul>{report.unclearMeaning.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>

        <article className="revision-list"><div><span>03 · Specific changes</span><h2>Move from note to next render.</h2></div>{report.specificChanges.map((item, index) => <div className="revision-row" key={`${item.area}-${index}`}><b>{String(index + 1).padStart(2, "0")}</b><div><span>{item.area.replaceAll("-", " ")}</span><strong>{item.change}</strong><p>{item.why}</p></div></div>)}</article>

        <article className="priority-revision"><div><span>04 · Highest-priority next revision</span><h2>{report.highestPriorityRevision.title}</h2></div><div><strong>Make this change</strong><p>{report.highestPriorityRevision.action}</p><small>{report.highestPriorityRevision.why}</small></div></article>
        <div className="commentary-limit"><span>Review boundary</span><p>{report.limitations}</p></div>
        <div className="commentary-actions"><button className="secondary-button" onClick={store.closeCommentaryWorkspace}>Back to production plan</button><button className="primary-button" onClick={store.clearCommentaryReport}>Review another cut <Arrow /></button></div>
      </section>
    );
  }

  return (
    <section className="commentary-workspace">
      <div className="commentary-hero"><div><button className="back-stage-button" onClick={store.closeCommentaryWorkspace}>← Back to production plan</button><p className="eyebrow"><span>09</span> Director’s Commentary</p><h1>Bring the finished cut back into the conversation.</h1><p>StoryDNA compares a timestamped visual sample with your original source, approved brief, emotional arc, and scene plan—then gives you one actionable next pass.</p></div><div className="commentary-orbit"><Mark /><span>Intention</span><span>Cut</span><span>Revision</span></div></div>

      <div className="commentary-setup">
        <div className="commentary-modes"><div><span>Choose the room</span><h2>How should the director speak?</h2></div>{commentaryModeOptions.map((mode) => <button key={mode.id} className={store.commentaryMode === mode.id ? "selected" : ""} onClick={() => store.setCommentaryMode(mode.id)}><i>{store.commentaryMode === mode.id ? "✓" : ""}</i><span><strong>{mode.title}</strong><small>{mode.description}</small></span></button>)}</div>
        <div className="commentary-upload-card">
          <label className={`clip-uploader ${previewUrl ? "has-clip" : ""}`}>
            {previewUrl ? <video src={previewUrl} controls playsInline /> : <div><span>＋</span><strong>Upload your finished short</strong><small>MP4, MOV, or WEBM · up to 150 MB · under 10 minutes</small></div>}
            <input type="file" accept="video/mp4,video/quicktime,video/webm,video/*" onChange={(event) => chooseClip(event.target.files?.[0])} />
            {previewUrl && <em>Replace clip</em>}
          </label>
          {file && <div className="clip-meta"><span>{file.name}</span><small>{(file.size / 1_000_000).toFixed(1)} MB · stays local while frames are sampled</small></div>}
          <label className="commentary-notes"><span>Anything the reviewer should know?</span><textarea value={store.commentaryNotes} onChange={(event) => store.setCommentaryNotes(event.target.value)} placeholder="For example: the sound mix is temporary, or I’m unsure whether the ending reads as release." /></label>
          {fileError && <div className="error-banner" role="alert"><strong>The review room paused.</strong> {fileError}</div>}
          {store.error && <div className="error-banner" role="alert"><strong>The review room paused.</strong> {store.error}</div>}
          <button className="primary-button commentary-submit" disabled={!file || sampling} onClick={analyzeClip}>{sampling ? "Sampling the visual rhythm…" : "Analyze finished clip"}<Arrow /></button>
          <p className="commentary-privacy"><strong>What gets reviewed:</strong> up to 8 compressed, timestamped frames plus your approved project context. The complete video stays in this browser. Audio, dialogue, and music are not analyzed.</p>
        </div>
      </div>
    </section>
  );
}

function DNAWorkspace({ onRegenerate, onBuildBrief, onBuildScenes, onRegenerateScene, onGeneratePrompts, onRegeneratePrompt, onGenerateMotion, onAnalyzeCommentary }: { onRegenerate: () => Promise<void>; onBuildBrief: () => Promise<void>; onBuildScenes: () => Promise<void>; onRegenerateScene: (id: string) => Promise<void>; onGeneratePrompts: () => Promise<void>; onRegeneratePrompt: (sceneId: string) => Promise<void>; onGenerateMotion: (sceneId: string) => Promise<void>; onAnalyzeCommentary: (clip: SampledClip) => Promise<void> }) {
  const brief = useProjectStore((state) => state.brief);
  const scenes = useProjectStore((state) => state.scenes);
  const imagePrompts = useProjectStore((state) => state.imagePrompts);
  const motionPlans = useProjectStore((state) => state.motionPlans);
  const motionWorkspaceOpen = useProjectStore((state) => state.motionWorkspaceOpen);
  const estimateWorkspaceOpen = useProjectStore((state) => state.estimateWorkspaceOpen);
  const commentaryWorkspaceOpen = useProjectStore((state) => state.commentaryWorkspaceOpen);
  return (
    <main className="dna-shell">
      {commentaryWorkspaceOpen ? <CommentaryWorkspace onAnalyze={onAnalyzeCommentary} /> : estimateWorkspaceOpen ? <EstimateWorkspace /> : motionWorkspaceOpen ? <MotionWorkspace onGenerateMotion={onGenerateMotion} /> : imagePrompts.length ? <ImagesWorkspace onRegeneratePrompt={onRegeneratePrompt} onOpenMotion={useProjectStore.getState().openMotionWorkspace} /> : scenes.length ? <ScenesWorkspace onRegenerateScene={onRegenerateScene} onGeneratePrompts={onGeneratePrompts} /> : brief ? <CreativeBriefView onBuildScenes={onBuildScenes} /> : <><AnalysisHeader /><AnalysisView /><QuestionsView onRegenerate={onRegenerate} onBuildBrief={onBuildBrief} /></>}
    </main>
  );
}

export default function App() {
  const store = useProjectStore();
  const hasAnalysis = Boolean(store.analysis);
  const activeStage = store.commentaryWorkspaceOpen || store.estimateWorkspaceOpen ? 5 : store.motionWorkspaceOpen ? 4 : store.imagePrompts.length ? 3 : store.scenes.length ? 2 : hasAnalysis ? 1 : 0;
  const loading = store.status === "analyzing" || store.status === "questioning" || store.status === "briefing" || store.status === "scenes" || store.status === "images" || store.status === "motion" || store.status === "commentary";
  const loadingPhase = useMemo(() => store.status === "commentary" ? "Comparing the finished cut with the film you meant to make." : store.status === "motion" ? "Directing movement without losing the frame." : store.status === "images" ? "Composing the frame language." : store.status === "scenes" ? "Finding the visual rhythm." : store.status === "briefing" ? "Distilling the north star." : store.status === "questioning" ? "Finding the creative forks." : "Reading beneath the words.", [store.status]);

  const runQuestions = async (input: StoryInputValues, analysis = store.analysis, seed = store.variationSeed) => {
    if (!analysis) return;
    store.beginQuestions();
    try {
      const result = await requestQuestions(input, analysis, store.userCorrection, store.extraContext, seed);
      store.setQuestions(result.data.questions, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Question generation failed.");
    }
  };

  const analyze = async (input: StoryInputValues) => {
    store.beginAnalysis();
    try {
      const result = await requestAnalysis(input);
      store.setAnalysis(result.data, result.meta);
      await runQuestions(input, result.data, 0);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Story analysis failed.");
    }
  };

  const regenerate = async () => {
    const seed = store.nextVariation();
    await runQuestions(store.draft, store.analysis, seed);
  };

  const buildBrief = async () => {
    if (!store.analysis) return;
    const answers = store.questions.map((question) => ({ questionId: question.id, answer: (store.answers[question.id] || "").trim() }));
    if (answers.some((answer) => !answer.answer)) {
      store.fail("Answer all three creative questions before building the brief.");
      return;
    }
    store.beginBrief();
    try {
      const result = await requestCreativeBrief(
        store.draft,
        store.analysis,
        store.questions,
        answers,
        store.userCorrection,
        store.extraContext,
      );
      store.setBrief(result.data, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Creative brief generation failed.");
    }
  };

  const buildScenes = async () => {
    if (!store.analysis || !store.brief || store.brief.approval !== "approved") return;
    store.beginScenes();
    try {
      const result = await requestSceneOutline(store.draft, store.analysis, store.brief);
      store.setScenes(result.data.scenes, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Scene outline generation failed.");
    }
  };

  const regenerateSceneById = async (id: string) => {
    if (!store.analysis || !store.brief || store.sceneApproval === "approved") return;
    const index = store.scenes.findIndex((scene) => scene.id === id);
    if (index < 0) return;
    const beforeIds = store.scenes.map((scene) => scene.id).join("|");
    store.beginSceneRegeneration(id);
    try {
      const result = await requestRegeneratedScene(store.draft, store.analysis, store.brief, store.scenes[index], store.scenes[index - 1], store.scenes[index + 1], store.sceneNotes[id] || "");
      store.replaceScene(result.data, result.meta);
      if (useProjectStore.getState().scenes.map((scene) => scene.id).join("|") !== beforeIds) throw new Error("Stable scene IDs changed unexpectedly.");
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Scene regeneration failed.");
    }
  };

  const buildImagePrompts = async () => {
    if (!store.analysis || !store.brief || store.sceneApproval !== "approved") return;
    store.beginImagePrompts();
    try {
      const result = await requestImagePrompts(store.draft, store.analysis, store.brief, store.scenes);
      const sceneIds = store.scenes.map((scene) => scene.id);
      const promptSceneIds = result.data.prompts.map((prompt) => prompt.sceneId);
      if (sceneIds.join("|") !== promptSceneIds.join("|")) throw new Error("Image prompts did not preserve the approved scene order.");
      store.setImagePrompts(result.data.prompts, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Image prompt generation failed.");
    }
  };

  const regeneratePromptBySceneId = async (sceneId: string) => {
    if (!store.analysis || !store.brief) return;
    const scene = store.scenes.find((item) => item.id === sceneId);
    const prompt = store.imagePrompts.find((item) => item.sceneId === sceneId);
    if (!scene || !prompt) return;
    const before = store.imagePrompts.map((item) => `${item.id}:${item.sceneId}`).join("|");
    store.beginImagePromptRegeneration(sceneId);
    try {
      const result = await requestRegeneratedImagePrompt(store.draft, store.analysis, store.brief, scene, prompt, store.imagePromptNotes[sceneId] || "");
      store.replaceImagePrompt(result.data, result.meta);
      if (useProjectStore.getState().imagePrompts.map((item) => `${item.id}:${item.sceneId}`).join("|") !== before) throw new Error("Stable prompt identities changed unexpectedly.");
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Image prompt regeneration failed.");
    }
  };

  const generateMotionBySceneId = async (sceneId: string) => {
    if (!store.analysis || !store.brief) return;
    const scene = store.scenes.find((item) => item.id === sceneId);
    const imagePrompt = store.imagePrompts.find((item) => item.sceneId === sceneId);
    if (!scene || !imagePrompt) return;
    store.beginMotionGeneration(sceneId);
    try {
      const result = await requestMotionPrompt(store.draft, store.analysis, store.brief, scene, imagePrompt, store.motionNotes[sceneId] || "", store.motionImageNames[sceneId] || "");
      store.setMotionPlan(result.data, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Motion prompt generation failed.");
    }
  };

  const analyzeCommentary = async (clip: SampledClip) => {
    if (!store.analysis || !store.brief) return;
    store.beginCommentary();
    try {
      const result = await requestCommentary(
        store.draft,
        store.analysis,
        store.brief,
        store.scenes,
        store.motionPlans.filter((plan) => plan.imageToVideoPrompt.trim()),
        store.commentaryMode,
        store.commentaryNotes,
        clip,
      );
      store.setCommentaryReport(result.data, result.meta);
    } catch (error) {
      store.fail(error instanceof Error ? error.message : "Director's Commentary failed.");
    }
  };

  return (
    <div className="app-frame">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <Header activeStage={activeStage} onStartOver={store.startOver} />
      {loading ? <LoadingDirector message={store.statusMessage} phase={loadingPhase} /> : hasAnalysis ? <DNAWorkspace onRegenerate={regenerate} onBuildBrief={buildBrief} onBuildScenes={buildScenes} onRegenerateScene={regenerateSceneById} onGeneratePrompts={buildImagePrompts} onRegeneratePrompt={regeneratePromptBySceneId} onGenerateMotion={generateMotionBySceneId} onAnalyzeCommentary={analyzeCommentary} /> : <StoryIntake onAnalyze={analyze} />}
      <footer><Mark /><p>StoryDNA Studio <span>·</span> An attentive creative director for AI filmmakers.</p><small>Built for OpenAI Build Week</small></footer>
    </div>
  );
}
