import {
  commentaryRequestSchema,
  creativeBriefRequestSchema,
  imagePromptsRequestSchema,
  motionPromptRequestSchema,
  questionsRequestSchema,
  regenerateImagePromptRequestSchema,
  regenerateSceneRequestSchema,
  sceneOutlineRequestSchema,
  storyInputSchema,
} from "../shared/schemas";
import {
  demoAnalysis,
  demoCommentaryReport,
  demoCreativeBrief,
  demoImagePrompts,
  demoMotionPlan,
  demoQuestions,
  demoRegeneratedImagePrompt,
  demoRegeneratedScene,
  demoSceneOutline,
} from "./ai/demo";
import {
  analyzeFinishedVideo,
  analyzeStory,
  createCreativeBrief,
  generateClarifyingQuestions,
  generateImagePrompts,
  generateMotionPrompt,
  generateSceneOutline,
  regenerateImagePrompt,
  regenerateScene,
} from "./ai/operations";

export interface StoryApiConfig {
  apiKey?: string;
  model: string;
}

export interface StoryApiResult {
  status: number;
  payload: unknown;
}

function result(status: number, payload: unknown): StoryApiResult {
  return { status, payload };
}

function meta(config: StoryApiConfig, demoMode: boolean) {
  return {
    demoMode,
    model: demoMode ? "StoryDNA demo director" : config.model,
    generatedAt: new Date().toISOString(),
  };
}

export async function handleStoryApiRequest(
  path: string,
  method: string,
  body: unknown,
  config: StoryApiConfig,
): Promise<StoryApiResult> {
  if (path === "/api/story/status" && method === "GET") {
    return result(200, { configured: Boolean(config.apiKey), model: config.model });
  }
  if (method !== "POST") return result(405, { code: "method_not_allowed", message: "Use POST.", retryable: false });

  try {
    const demoMode = !config.apiKey;

    if (path === "/api/story/analyze") {
      const input = storyInputSchema.parse(body);
      const data = demoMode ? demoAnalysis(input) : await analyzeStory(input, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/questions") {
      const parsed = questionsRequestSchema.parse(body);
      const data = demoMode
        ? demoQuestions(parsed.variationSeed)
        : await generateClarifyingQuestions(parsed.input, parsed.analysis, parsed.userCorrection, parsed.extraContext, parsed.variationSeed, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/brief") {
      const parsed = creativeBriefRequestSchema.parse(body);
      const data = demoMode
        ? demoCreativeBrief(parsed.input, parsed.analysis, parsed.answers, parsed.userCorrection, parsed.extraContext)
        : await createCreativeBrief(parsed.input, parsed.analysis, parsed.questions, parsed.answers, parsed.userCorrection, parsed.extraContext, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/scenes") {
      const parsed = sceneOutlineRequestSchema.parse(body);
      const data = demoMode
        ? demoSceneOutline(parsed.input, parsed.analysis)
        : await generateSceneOutline(parsed.input, parsed.analysis, parsed.brief, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/scene/regenerate") {
      const parsed = regenerateSceneRequestSchema.parse(body);
      const data = demoMode
        ? demoRegeneratedScene(parsed.scene, parsed.creatorNote)
        : await regenerateScene(parsed.input, parsed.analysis, parsed.brief, parsed.scene, parsed.previousScene, parsed.nextScene, parsed.creatorNote, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/image-prompts") {
      const parsed = imagePromptsRequestSchema.parse(body);
      const data = demoMode
        ? demoImagePrompts(parsed.input, parsed.brief, parsed.scenes)
        : await generateImagePrompts(parsed.input, parsed.analysis, parsed.brief, parsed.scenes, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/image-prompt/regenerate") {
      const parsed = regenerateImagePromptRequestSchema.parse(body);
      const data = demoMode
        ? demoRegeneratedImagePrompt(parsed.prompt, parsed.scene, parsed.creatorNote)
        : await regenerateImagePrompt(parsed.input, parsed.analysis, parsed.brief, parsed.scene, parsed.prompt, parsed.creatorNote, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/motion-prompt") {
      const parsed = motionPromptRequestSchema.parse(body);
      const data = demoMode
        ? demoMotionPlan(parsed.scene, parsed.imagePrompt, parsed.creatorMotionNotes)
        : await generateMotionPrompt(parsed.input, parsed.analysis, parsed.brief, parsed.scene, parsed.imagePrompt, parsed.creatorMotionNotes, parsed.uploadedImageName, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    if (path === "/api/story/commentary") {
      const parsed = commentaryRequestSchema.parse(body);
      const data = demoMode
        ? demoCommentaryReport(parsed.mode, parsed.clip.name, parsed.clip.durationSeconds)
        : await analyzeFinishedVideo(parsed.input, parsed.analysis, parsed.brief, parsed.scenes, parsed.motionPlans, parsed.mode, parsed.creatorNotes, parsed.clip, config.apiKey!, config.model);
      return result(200, { data, meta: meta(config, demoMode) });
    }

    return result(404, { code: "not_found", message: "Unknown operation.", retryable: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error.";
    const validation = error && typeof error === "object" && "issues" in error;
    return result(validation ? 400 : 500, {
      code: validation ? "invalid_request" : "generation_failed",
      message: validation ? "Some story details are invalid." : message,
      retryable: !validation,
    });
  }
}
