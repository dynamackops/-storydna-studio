import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  clarifyingQuestionsSchema,
  commentaryReportSchema,
  creativeBriefSchema,
  imagePromptSchema,
  imagePromptSetSchema,
  motionPlanSchema,
  sceneOutlineSchema,
  sceneSchema,
  storyAnalysisSchema,
  type StoryAnalysisValues,
  type StoryInputValues,
  type CommentaryModeValues,
  type CommentaryReportValues,
  type CreativeBriefValues,
  type ImagePromptValues,
  type MotionPlanValues,
  type SceneValues,
} from "../../shared/schemas";

const CREATIVE_DIRECTOR = `You are the StoryDNA creative director for a solo AI filmmaker. Be attentive, specific, cinematic, and emotionally literate. Preserve ambiguity where it appears intentional. Distinguish evidence in the source from your interpretation. Never flatten the creator's voice into generic inspirational language.`;

function client(apiKey: string) {
  return new OpenAI({ apiKey });
}

export async function analyzeStory(
  input: StoryInputValues,
  apiKey: string,
  model: string,
): Promise<StoryAnalysisValues> {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nAnalyze only. Do not propose a scene outline, shots, or final production plan. Ground claims in the source and call uncertainty an interpretation risk.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL (creator-authored; never rewrite it)\n${JSON.stringify(input, null, 2)}\n\nReturn the requested StoryDNA analysis.`,
      },
    ],
    text: { format: zodTextFormat(storyAnalysisSchema, "story_dna_analysis") },
  });

  if (!response.output_parsed) throw new Error("The model returned no parsed StoryDNA analysis.");
  return storyAnalysisSchema.parse(response.output_parsed);
}

export async function generateClarifyingQuestions(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  userCorrection: string,
  extraContext: string,
  variationSeed: number,
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nAsk exactly three concise questions. Each must resolve a distinct ambiguity that would materially alter emotional direction, symbolism, world, character, pacing, or visual language. Do not repeat intake questions. Do not generate scenes. Offer 2–4 genuinely different directions while allowing a free-form answer. Stable unique ids must begin with q-.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL\n${JSON.stringify(input, null, 2)}\n\nAI INTERPRETATION (unapproved)\n${JSON.stringify(analysis, null, 2)}\n\nUSER CORRECTION\n${userCorrection || "None provided"}\n\nEXTRA CREATIVE CONTEXT\n${extraContext || "None provided"}\n\nVARIATION REQUEST\nSet ${variationSeed}. Produce a meaningfully different set when this number is above zero.`,
      },
    ],
    text: { format: zodTextFormat(clarifyingQuestionsSchema, "clarifying_questions") },
  });

  if (!response.output_parsed) throw new Error("The model returned no parsed clarification questions.");
  return clarifyingQuestionsSchema.parse(response.output_parsed);
}

export async function createCreativeBrief(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  questions: Array<{ id: string; question: string; whyItMatters: string; decisionArea: string; options: string[] }>,
  answers: Array<{ questionId: string; answer: string }>,
  userCorrection: string,
  extraContext: string,
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nCreate a concise production-facing creative brief, not a scene outline. Treat creator answers and corrections as authoritative confirmed decisions. When a creator correction conflicts with the AI interpretation, the creator correction wins. Make every field editable in spirit: clear, specific, and free of conversational filler. Constraints and consistency requirements must be observable in later scene or prompt work.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL (immutable)\n${JSON.stringify(input, null, 2)}\n\nAI INTERPRETATION (unapproved evidence)\n${JSON.stringify(analysis, null, 2)}\n\nCLARIFYING QUESTIONS\n${JSON.stringify(questions, null, 2)}\n\nCREATOR ANSWERS (authoritative)\n${JSON.stringify(answers, null, 2)}\n\nCREATOR CORRECTION (authoritative; overrides interpretation)\n${userCorrection || "None provided"}\n\nEXTRA CREATIVE CONTEXT (authoritative)\n${extraContext || "None provided"}`,
      },
    ],
    text: { format: zodTextFormat(creativeBriefSchema, "confirmed_creative_brief") },
  });

  if (!response.output_parsed) throw new Error("The model returned no parsed creative brief.");
  return creativeBriefSchema.parse(response.output_parsed);
}

export async function generateSceneOutline(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nCreate an ordered visual scene outline only from the approved creative brief. Every scene must advance the emotional arc and have a distinct narrative purpose. Do not generate image prompts yet. Use stable ids scene-01, scene-02, and so on. Total suggested duration should stay reasonably close to the creator's target runtime. Source references may quote only a short phrase or identify a beat. Preserve every constraint and consistency requirement.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL\n${JSON.stringify(input, null, 2)}\n\nSTORYDNA INTERPRETATION\n${JSON.stringify(analysis, null, 2)}\n\nAPPROVED CREATIVE BRIEF (authoritative; never contradict)\n${JSON.stringify(brief, null, 2)}`,
      },
    ],
    text: { format: zodTextFormat(sceneOutlineSchema, "scene_outline") },
  });
  if (!response.output_parsed) throw new Error("The model returned no parsed scene outline.");
  return sceneOutlineSchema.parse(response.output_parsed);
}

export async function regenerateScene(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scene: SceneValues,
  previousScene: SceneValues | undefined,
  nextScene: SceneValues | undefined,
  creatorNote: string,
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nRegenerate exactly one scene. Preserve its id and position exactly. Do not modify or return neighboring scenes. Keep continuity with the supplied neighbors and obey the approved brief. Make a meaningful visual improvement based on the creator note when provided. Do not generate an image prompt.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE\n${JSON.stringify(input, null, 2)}\n\nSTORYDNA\n${JSON.stringify(analysis, null, 2)}\n\nAPPROVED BRIEF\n${JSON.stringify(brief, null, 2)}\n\nPREVIOUS SCENE (context only)\n${JSON.stringify(previousScene || null, null, 2)}\n\nTARGET SCENE (preserve id and position)\n${JSON.stringify(scene, null, 2)}\n\nNEXT SCENE (context only)\n${JSON.stringify(nextScene || null, null, 2)}\n\nCREATOR NOTE\n${creatorNote || "Find a stronger cinematic expression without changing the story beat."}`,
      },
    ],
    text: { format: zodTextFormat(sceneSchema, "regenerated_scene") },
  });
  if (!response.output_parsed) throw new Error("The model returned no parsed scene.");
  const parsed = sceneSchema.parse(response.output_parsed);
  return { ...parsed, id: scene.id, position: scene.position };
}

export async function generateImagePrompts(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scenes: SceneValues[],
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nCreate one production-ready still-image prompt for every approved scene. Return prompts in scene order and preserve each sceneId exactly. Use ids prompt-{sceneId}. The detailed prompt must explicitly cover subject, environment, composition, camera framing, expression and body language, lighting, color and atmosphere, style, aspect ratio, and character continuity. Keep the short prompt usable, make alternate framing materially different, and make negative instructions practical. Carry approved consistency requirements into observable consistency anchors. Do not change the story, scenes, or approved brief.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE MATERIAL\n${JSON.stringify(input, null, 2)}\n\nSTORYDNA INTERPRETATION\n${JSON.stringify(analysis, null, 2)}\n\nAPPROVED CREATIVE BRIEF (authoritative)\n${JSON.stringify(brief, null, 2)}\n\nAPPROVED SCENES (preserve scene ids and order)\n${JSON.stringify(scenes, null, 2)}`,
      },
    ],
    text: { format: zodTextFormat(imagePromptSetSchema, "image_prompt_set") },
  });
  if (!response.output_parsed) throw new Error("The model returned no parsed image prompts.");
  return imagePromptSetSchema.parse(response.output_parsed);
}

export async function regenerateImagePrompt(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scene: SceneValues,
  prompt: ImagePromptValues,
  creatorNote: string,
  apiKey: string,
  model: string,
) {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nRegenerate exactly one still-image prompt. Preserve its id, sceneId, and aspectRatio exactly. Do not return or modify any other prompt. Obey the approved brief and scene, incorporate the creator note, and produce a meaningfully different visual solution without changing the story beat.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE\n${JSON.stringify(input, null, 2)}\n\nSTORYDNA\n${JSON.stringify(analysis, null, 2)}\n\nAPPROVED BRIEF\n${JSON.stringify(brief, null, 2)}\n\nAPPROVED TARGET SCENE\n${JSON.stringify(scene, null, 2)}\n\nCURRENT PROMPT\n${JSON.stringify(prompt, null, 2)}\n\nCREATOR NOTE\n${creatorNote || "Find a stronger, more specific cinematic image."}`,
      },
    ],
    text: { format: zodTextFormat(imagePromptSchema, "regenerated_image_prompt") },
  });
  if (!response.output_parsed) throw new Error("The model returned no parsed image prompt.");
  const parsed = imagePromptSchema.parse(response.output_parsed);
  return { ...parsed, id: prompt.id, sceneId: prompt.sceneId, aspectRatio: prompt.aspectRatio };
}

export async function generateMotionPrompt(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scene: SceneValues,
  imagePrompt: ImagePromptValues,
  creatorMotionNotes: string,
  uploadedImageName: string,
  apiKey: string,
  model: string,
): Promise<MotionPlanValues> {
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nCreate exactly one image-to-video motion plan for the supplied approved scene and still-image prompt. Preserve sceneId exactly and use id motion-{sceneId}. Prioritize controlled, physically plausible motion and identity continuity. Separate camera, subject, environment, and facial direction. The final image-to-video prompt must be ready to paste into a generation tool. Avoid claims about exact proprietary model features or pricing; suggestedModelCategory must be a capability category, not a guaranteed recommendation.`,
      },
      {
        role: "user",
        content: `ORIGINAL SOURCE\n${JSON.stringify(input, null, 2)}\n\nSTORYDNA\n${JSON.stringify(analysis, null, 2)}\n\nAPPROVED BRIEF (authoritative)\n${JSON.stringify(brief, null, 2)}\n\nAPPROVED SCENE\n${JSON.stringify(scene, null, 2)}\n\nEDITED STILL-IMAGE PROMPT\n${JSON.stringify(imagePrompt, null, 2)}\n\nUPLOADED IMAGE REFERENCE\n${uploadedImageName || "No filename supplied; use the still prompt as visual reference."}\n\nCREATOR MOTION NOTES (authoritative)\n${creatorMotionNotes || "No extra motion direction supplied."}`,
      },
    ],
    text: { format: zodTextFormat(motionPlanSchema, "motion_plan") },
  });
  if (!response.output_parsed) throw new Error("The model returned no parsed motion plan.");
  const parsed = motionPlanSchema.parse(response.output_parsed);
  return { ...parsed, id: `motion-${scene.id}`, sceneId: scene.id };
}

export async function analyzeFinishedVideo(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  brief: CreativeBriefValues,
  scenes: SceneValues[],
  motionPlans: MotionPlanValues[],
  mode: CommentaryModeValues,
  creatorNotes: string,
  clip: {
    name: string;
    durationSeconds: number;
    width: number;
    height: number;
    sampledFrames: Array<{ timeSeconds: number; imageDataUrl: string }>;
  },
  apiKey: string,
  model: string,
): Promise<CommentaryReportValues> {
  const modeDirection: Record<CommentaryModeValues, string> = {
    gentle: "Respond as a warm, perceptive creative collaborator. Be candid without flattening the creator's confidence.",
    direct: "Respond as a decisive film editor. Be concise, concrete, and willing to name what is not working.",
    audience: "Respond from likely first-viewer experience. Distinguish what an audience can infer from what only the creator knows.",
    technical: "Respond as an AI-video technical reviewer. Prioritize continuity drift, motion artifacts, timing, transitions, and repairable generation choices.",
  };
  const frameContent = clip.sampledFrames.flatMap((frame, index) => [
    { type: "input_text" as const, text: `SAMPLED FRAME ${index + 1} OF ${clip.sampledFrames.length} · ${frame.timeSeconds.toFixed(2)}s` },
    { type: "input_image" as const, image_url: frame.imageDataUrl, detail: "low" as const },
  ]);
  const response = await client(apiKey).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: `${CREATIVE_DIRECTOR}\n\nYou are reviewing timestamped frames sampled evenly from a finished short clip. ${modeDirection[mode]} Compare only visible evidence against the creator's authoritative brief and scene plan. Address narrative clarity, emotional payoff, pacing, visual consistency, character continuity, symbolism, shot duration, repetition, and transitions. Do not claim to hear audio, dialogue, music, or exact frame-to-frame motion. Make revisions specific enough to execute in an editor or generation tool.`,
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `ORIGINAL SOURCE MATERIAL\n${JSON.stringify(input, null, 2)}\n\nSTORYDNA INTERPRETATION\n${JSON.stringify(analysis, null, 2)}\n\nAPPROVED CREATIVE BRIEF (authoritative)\n${JSON.stringify(brief, null, 2)}\n\nAPPROVED SCENE PLAN\n${JSON.stringify(scenes, null, 2)}\n\nMOTION PLANS\n${JSON.stringify(motionPlans, null, 2)}\n\nCREATOR REVIEW NOTES\n${creatorNotes || "None provided."}\n\nCLIP METADATA\n${JSON.stringify({ name: clip.name, durationSeconds: clip.durationSeconds, width: clip.width, height: clip.height, sampledFrameCount: clip.sampledFrames.length }, null, 2)}\n\nThe following images are chronological samples, not continuous video.`,
          },
          ...frameContent,
        ],
      },
    ],
    text: { format: zodTextFormat(commentaryReportSchema, "directors_commentary") },
  });
  if (!response.output_parsed) throw new Error("The model returned no parsed commentary report.");
  const parsed = commentaryReportSchema.parse(response.output_parsed);
  return {
    ...parsed,
    id: `commentary-${Date.now().toString(36)}`,
    mode,
    limitations: "Visual review is based on evenly sampled frames, project context, and clip metadata. Audio, dialogue, music, and continuous frame-to-frame motion were not analyzed.",
    createdAt: new Date().toISOString(),
  };
}
