import {
  analysisResponseSchema,
  creativeBriefResponseSchema,
  imagePromptResponseSchema,
  imagePromptsResponseSchema,
  motionPromptResponseSchema,
  sceneOutlineResponseSchema,
  sceneResponseSchema,
  questionsResponseSchema,
  type StoryAnalysisValues,
  type StoryInputValues,
  type CreativeBriefValues,
  type ImagePromptValues,
  type SceneValues,
} from "../../shared/schemas";

export interface ApiErrorShape {
  code: string;
  message: string;
  retryable: boolean;
}

async function post(path: string, body: unknown): Promise<unknown> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = payload as Partial<ApiErrorShape>;
    throw new Error(error.message || "The creative director could not complete that step.");
  }
  return payload;
}

export async function requestAnalysis(input: StoryInputValues) {
  return analysisResponseSchema.parse(await post("/api/story/analyze", input));
}

export async function requestQuestions(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  userCorrection: string,
  extraContext: string,
  variationSeed: number,
) {
  return questionsResponseSchema.parse(
    await post("/api/story/questions", {
      input,
      analysis,
      userCorrection,
      extraContext,
      variationSeed,
    }),
  );
}

export async function requestCreativeBrief(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  questions: Array<{ id: string; question: string; whyItMatters: string; decisionArea: "emotion" | "symbolism" | "world" | "character" | "pacing" | "visual-language"; options: string[] }>,
  answers: Array<{ questionId: string; answer: string }>,
  userCorrection: string,
  extraContext: string,
) {
  return creativeBriefResponseSchema.parse(
    await post("/api/story/brief", {
      input,
      analysis,
      questions,
      answers,
      userCorrection,
      extraContext,
    }),
  );
}

export async function requestSceneOutline(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
) {
  return sceneOutlineResponseSchema.parse(await post("/api/story/scenes", { input, analysis, brief }));
}

export async function requestRegeneratedScene(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scene: SceneValues,
  previousScene: SceneValues | undefined,
  nextScene: SceneValues | undefined,
  creatorNote: string,
) {
  return sceneResponseSchema.parse(
    await post("/api/story/scene/regenerate", {
      input,
      analysis,
      brief,
      scene,
      previousScene,
      nextScene,
      creatorNote,
    }),
  );
}

export async function requestImagePrompts(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scenes: SceneValues[],
) {
  return imagePromptsResponseSchema.parse(
    await post("/api/story/image-prompts", { input, analysis, brief, scenes }),
  );
}

export async function requestRegeneratedImagePrompt(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scene: SceneValues,
  prompt: ImagePromptValues,
  creatorNote: string,
) {
  return imagePromptResponseSchema.parse(
    await post("/api/story/image-prompt/regenerate", {
      input,
      analysis,
      brief,
      scene,
      prompt,
      creatorNote,
    }),
  );
}

export async function requestMotionPrompt(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scene: SceneValues,
  imagePrompt: ImagePromptValues,
  creatorMotionNotes: string,
  uploadedImageName: string,
) {
  return motionPromptResponseSchema.parse(
    await post("/api/story/motion-prompt", {
      input,
      analysis,
      brief,
      scene,
      imagePrompt,
      creatorMotionNotes,
      uploadedImageName,
    }),
  );
}
