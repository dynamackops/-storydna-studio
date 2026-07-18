const base = "http://127.0.0.1:4173";
const input = {
  title: "The House That Kept the Dawn",
  sourceType: "poem",
  sourceText: "Every morning the old house caught the dawn in its windows, but no one lived there to see it. I carried a rusted key through fields of silver grass.",
  visualVibe: "quiet magical realism, tactile 35mm",
  characterDescription: "A solitary woman in a charcoal coat.",
  aspectRatio: "16:9",
  targetRuntimeSeconds: 60,
  preferredTools: "Kling",
};

async function post(path, body) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(json)}`);
  return json;
}

const analysis = await post("/api/story/analyze", input);
if (!analysis.data.coreEmotionalTruth) {
  throw new Error("Analysis response did not include expected StoryDNA data.");
}

const questions = await post("/api/story/questions", {
  input,
  analysis: analysis.data,
  userCorrection: "",
  extraContext: "",
  variationSeed: 0,
});
if (questions.data.questions.length !== 3) {
  throw new Error(`Expected exactly 3 questions, received ${questions.data.questions.length}.`);
}

const answers = questions.data.questions.map((question, index) => ({
  questionId: question.id,
  answer: index === 0 ? "A beautiful ache" : question.options[0],
}));
const brief = await post("/api/story/brief", {
  input,
  analysis: analysis.data,
  questions: questions.data.questions,
  answers,
  userCorrection: "The house represents the future she was afraid to choose.",
  extraContext: "Keep the rusted key as a continuity anchor.",
});
if (!brief.data.creativeIntention || brief.data.storytellingConstraints.length === 0) {
  throw new Error("Creative brief response did not include required production direction.");
}

const outline = await post("/api/story/scenes", {
  input,
  analysis: analysis.data,
  brief: brief.data,
});
if (outline.data.scenes.length < 2 || new Set(outline.data.scenes.map((scene) => scene.id)).size !== outline.data.scenes.length) {
  throw new Error("Scene outline did not include at least two unique stable ids.");
}
const targetScene = outline.data.scenes[0];
const regenerated = await post("/api/story/scene/regenerate", {
  input,
  analysis: analysis.data,
  brief: brief.data,
  scene: targetScene,
  nextScene: outline.data.scenes[1],
  creatorNote: "Increase foreground depth.",
});
if (regenerated.data.id !== targetScene.id || regenerated.data.position !== targetScene.position) {
  throw new Error("Isolated regeneration changed the stable scene identity.");
}

const prompts = await post("/api/story/image-prompts", {
  input,
  analysis: analysis.data,
  brief: brief.data,
  scenes: outline.data.scenes,
});
if (prompts.data.prompts.length !== outline.data.scenes.length || prompts.data.prompts.some((prompt, index) => prompt.sceneId !== outline.data.scenes[index].id)) {
  throw new Error("Image prompts did not preserve the approved scene mapping.");
}
const targetPrompt = prompts.data.prompts[0];
const regeneratedPrompt = await post("/api/story/image-prompt/regenerate", {
  input,
  analysis: analysis.data,
  brief: brief.data,
  scene: targetScene,
  prompt: targetPrompt,
  creatorNote: "Use a wider, less literal frame.",
});
if (regeneratedPrompt.data.id !== targetPrompt.id || regeneratedPrompt.data.sceneId !== targetPrompt.sceneId) {
  throw new Error("Isolated image prompt regeneration changed stable identity.");
}

const invalid = await fetch(`${base}/api/story/analyze`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ title: "x" }),
});
if (invalid.status !== 400) throw new Error(`Expected invalid input to return 400, received ${invalid.status}.`);

console.log(JSON.stringify({
  analysis: "valid",
  questions: questions.data.questions.length,
  creativeBrief: "valid",
  scenes: outline.data.scenes.length,
  stableRegeneration: regenerated.data.id,
  imagePrompts: prompts.data.prompts.length,
  stablePromptRegeneration: regeneratedPrompt.data.id,
  invalidInputStatus: invalid.status,
  mode: analysis.meta.demoMode ? "guided-demo" : "openai",
}, null, 2));
