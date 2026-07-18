import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  creativeBriefRequestSchema,
  commentaryRequestSchema,
  imagePromptsRequestSchema,
  motionPromptRequestSchema,
  regenerateImagePromptRequestSchema,
  regenerateSceneRequestSchema,
  sceneOutlineRequestSchema,
  questionsRequestSchema,
  storyInputSchema,
} from "../shared/schemas";
import { demoAnalysis, demoCommentaryReport, demoCreativeBrief, demoImagePrompts, demoMotionPlan, demoQuestions, demoRegeneratedImagePrompt, demoRegeneratedScene, demoSceneOutline } from "./ai/demo";
import { analyzeFinishedVideo, analyzeStory, createCreativeBrief, generateClarifyingQuestions, generateImagePrompts, generateMotionPrompt, generateSceneOutline, regenerateImagePrompt, regenerateScene } from "./ai/operations";

interface ApiConfig {
  apiKey?: string;
  model: string;
}

async function readJson(req: IncomingMessage, limit = 100_000): Promise<unknown> {
  let body = "";
  for await (const chunk of req) {
    body += chunk;
    if (body.length > limit) throw new Error("Request body is too large.");
  }
  return JSON.parse(body || "{}");
}

function send(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function meta(config: ApiConfig, demoMode: boolean) {
  return {
    demoMode,
    model: demoMode ? "StoryDNA demo director" : config.model,
    generatedAt: new Date().toISOString(),
  };
}

export function storyApiPlugin(config: ApiConfig): Plugin {
  return {
    name: "storydna-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/story/")) return next();
        if (req.url === "/api/story/status" && req.method === "GET") {
          return send(res, 200, {
            configured: Boolean(config.apiKey),
            model: config.model,
          });
        }
        if (req.method !== "POST") return send(res, 405, { code: "method_not_allowed", message: "Use POST.", retryable: false });
        if (!req.headers["content-type"]?.includes("application/json")) {
          return send(res, 415, { code: "invalid_content_type", message: "Send JSON.", retryable: false });
        }

        try {
          const body = await readJson(req, req.url === "/api/story/commentary" ? 12_000_000 : 100_000);
          const demoMode = !config.apiKey;

          if (req.url === "/api/story/analyze") {
            const input = storyInputSchema.parse(body);
            const data = demoMode
              ? demoAnalysis(input)
              : await analyzeStory(input, config.apiKey!, config.model);
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/questions") {
            const parsed = questionsRequestSchema.parse(body);
            const data = demoMode
              ? demoQuestions(parsed.variationSeed)
              : await generateClarifyingQuestions(
                  parsed.input,
                  parsed.analysis,
                  parsed.userCorrection,
                  parsed.extraContext,
                  parsed.variationSeed,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/brief") {
            const parsed = creativeBriefRequestSchema.parse(body);
            const data = demoMode
              ? demoCreativeBrief(
                  parsed.input,
                  parsed.analysis,
                  parsed.answers,
                  parsed.userCorrection,
                  parsed.extraContext,
                )
              : await createCreativeBrief(
                  parsed.input,
                  parsed.analysis,
                  parsed.questions,
                  parsed.answers,
                  parsed.userCorrection,
                  parsed.extraContext,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/scenes") {
            const parsed = sceneOutlineRequestSchema.parse(body);
            const data = demoMode
              ? demoSceneOutline(parsed.input, parsed.analysis)
              : await generateSceneOutline(parsed.input, parsed.analysis, parsed.brief, config.apiKey!, config.model);
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/scene/regenerate") {
            const parsed = regenerateSceneRequestSchema.parse(body);
            const data = demoMode
              ? demoRegeneratedScene(parsed.scene, parsed.creatorNote)
              : await regenerateScene(
                  parsed.input,
                  parsed.analysis,
                  parsed.brief,
                  parsed.scene,
                  parsed.previousScene,
                  parsed.nextScene,
                  parsed.creatorNote,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/image-prompts") {
            const parsed = imagePromptsRequestSchema.parse(body);
            const data = demoMode
              ? demoImagePrompts(parsed.input, parsed.brief, parsed.scenes)
              : await generateImagePrompts(parsed.input, parsed.analysis, parsed.brief, parsed.scenes, config.apiKey!, config.model);
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/image-prompt/regenerate") {
            const parsed = regenerateImagePromptRequestSchema.parse(body);
            const data = demoMode
              ? demoRegeneratedImagePrompt(parsed.prompt, parsed.scene, parsed.creatorNote)
              : await regenerateImagePrompt(
                  parsed.input,
                  parsed.analysis,
                  parsed.brief,
                  parsed.scene,
                  parsed.prompt,
                  parsed.creatorNote,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/motion-prompt") {
            const parsed = motionPromptRequestSchema.parse(body);
            const data = demoMode
              ? demoMotionPlan(parsed.scene, parsed.imagePrompt, parsed.creatorMotionNotes)
              : await generateMotionPrompt(
                  parsed.input,
                  parsed.analysis,
                  parsed.brief,
                  parsed.scene,
                  parsed.imagePrompt,
                  parsed.creatorMotionNotes,
                  parsed.uploadedImageName,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          if (req.url === "/api/story/commentary") {
            const parsed = commentaryRequestSchema.parse(body);
            const data = demoMode
              ? demoCommentaryReport(parsed.mode, parsed.clip.name, parsed.clip.durationSeconds)
              : await analyzeFinishedVideo(
                  parsed.input,
                  parsed.analysis,
                  parsed.brief,
                  parsed.scenes,
                  parsed.motionPlans,
                  parsed.mode,
                  parsed.creatorNotes,
                  parsed.clip,
                  config.apiKey!,
                  config.model,
                );
            return send(res, 200, { data, meta: meta(config, demoMode) });
          }

          return send(res, 404, { code: "not_found", message: "Unknown operation.", retryable: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown server error.";
          const validation = error && typeof error === "object" && "issues" in error;
          return send(res, validation ? 400 : 500, {
            code: validation ? "invalid_request" : "generation_failed",
            message: validation ? "Some story details are invalid." : message,
            retryable: !validation,
          });
        }
      });
    },
  };
}
