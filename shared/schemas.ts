import { z } from "zod";

export const sourceTypes = ["poem", "script", "lyrics", "story", "concept"] as const;
export const aspectRatios = ["16:9", "9:16", "1:1", "4:5", "2.39:1"] as const;

export const storyInputSchema = z.object({
  title: z.string().trim().min(2, "Give this project a title.").max(120),
  sourceType: z.enum(sourceTypes),
  sourceText: z
    .string()
    .trim()
    .min(40, "Share at least 40 characters so the director has enough to interpret.")
    .max(30_000),
  visualVibe: z.string().trim().min(3, "Describe the visual feeling you want.").max(500),
  characterDescription: z.string().trim().max(1_000).default(""),
  aspectRatio: z.enum(aspectRatios),
  targetRuntimeSeconds: z.number().int().min(10).max(600),
  preferredTools: z.string().trim().max(500).default(""),
});

export const storyAnalysisSchema = z.object({
  coreEmotionalTruth: z.string().min(1),
  intendedAudienceFeeling: z.string().min(1),
  beginningEmotionalState: z.string().min(1),
  endingEmotionalState: z.string().min(1),
  emotionalArc: z.string().min(1),
  mainThemes: z.array(z.string().min(1)).min(1).max(6),
  symbolsAndMotifs: z.array(
    z.object({
      symbol: z.string().min(1),
      possibleMeaning: z.string().min(1),
      visualOpportunity: z.string().min(1),
    }),
  ).min(1).max(6),
  visualLanguage: z.string().min(1),
  sensoryDirection: z.object({
    color: z.string().min(1),
    lighting: z.string().min(1),
    texture: z.string().min(1),
    atmosphere: z.string().min(1),
  }),
  characterTransformation: z.string().min(1),
  interpretationRisks: z.array(z.string().min(1)).min(1).max(5),
  initialEstimatedSceneCount: z.number().int().min(2).max(30),
});

export const clarifyingQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  whyItMatters: z.string().min(1),
  decisionArea: z.enum(["emotion", "symbolism", "world", "character", "pacing", "visual-language"]),
  options: z.array(z.string().min(1)).min(2).max(4),
});

export const clarifyingQuestionsSchema = z.object({
  questions: z.array(clarifyingQuestionSchema).length(3),
});

export const questionsRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  userCorrection: z.string().trim().max(2_000).default(""),
  extraContext: z.string().trim().max(2_000).default(""),
  variationSeed: z.number().int().nonnegative().default(0),
});

export const creativeBriefSchema = z.object({
  creativeIntention: z.string().min(1),
  emotionalDestination: z.string().min(1),
  visualIdentity: z.string().min(1),
  characterDirection: z.string().min(1),
  storytellingConstraints: z.array(z.string().min(1)).min(1).max(8),
  consistencyRequirements: z.array(z.string().min(1)).min(1).max(8),
});

export const creativeBriefRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  questions: z.array(clarifyingQuestionSchema).length(3),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      answer: z.string().trim().min(1),
    }),
  ).length(3),
  userCorrection: z.string().trim().max(2_000).default(""),
  extraContext: z.string().trim().max(2_000).default(""),
});

export const operationMetaSchema = z.object({
  demoMode: z.boolean(),
  model: z.string(),
  generatedAt: z.string(),
});

export const analysisResponseSchema = z.object({
  data: storyAnalysisSchema,
  meta: operationMetaSchema,
});

export const questionsResponseSchema = z.object({
  data: clarifyingQuestionsSchema,
  meta: operationMetaSchema,
});

export const creativeBriefResponseSchema = z.object({
  data: creativeBriefSchema,
  meta: operationMetaSchema,
});

export const sceneSchema = z.object({
  id: z.string().min(1),
  position: z.number().int().min(1),
  storyBeat: z.string().min(1),
  sourceReference: z.string().min(1),
  narrativePurpose: z.string().min(1),
  emotionalIntention: z.string().min(1),
  visualDescription: z.string().min(1),
  shotType: z.string().min(1),
  durationSeconds: z.number().int().min(1).max(60),
  transitionIdea: z.string().min(1),
});

export const sceneOutlineSchema = z.object({
  scenes: z.array(sceneSchema).min(2).max(30),
});

export const sceneOutlineRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  brief: creativeBriefSchema,
});

export const regenerateSceneRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  brief: creativeBriefSchema,
  scene: sceneSchema,
  previousScene: sceneSchema.optional(),
  nextScene: sceneSchema.optional(),
  creatorNote: z.string().trim().max(1_000).default(""),
});

export const sceneOutlineResponseSchema = z.object({
  data: sceneOutlineSchema,
  meta: operationMetaSchema,
});

export const sceneResponseSchema = z.object({
  data: sceneSchema,
  meta: operationMetaSchema,
});

export const imagePromptSchema = z.object({
  id: z.string().min(1),
  sceneId: z.string().min(1),
  detailedPrompt: z.string().min(1),
  shortPrompt: z.string().min(1),
  alternateFraming: z.string().min(1),
  negativeInstructions: z.string().min(1),
  aspectRatio: z.enum(aspectRatios),
  consistencyAnchors: z.array(z.string().min(1)).min(1).max(8),
});

export const imagePromptSetSchema = z.object({
  prompts: z.array(imagePromptSchema).min(2).max(30),
});

export const imagePromptsRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  brief: creativeBriefSchema,
  scenes: z.array(sceneSchema).min(2).max(30),
});

export const regenerateImagePromptRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  brief: creativeBriefSchema,
  scene: sceneSchema,
  prompt: imagePromptSchema,
  creatorNote: z.string().trim().max(1_000).default(""),
});

export const imagePromptsResponseSchema = z.object({
  data: imagePromptSetSchema,
  meta: operationMetaSchema,
});

export const imagePromptResponseSchema = z.object({
  data: imagePromptSchema,
  meta: operationMetaSchema,
});

export const motionPlanSchema = z.object({
  id: z.string().min(1),
  sceneId: z.string().min(1),
  intendedAction: z.string().min(1),
  cameraMovement: z.string().min(1),
  subjectMovement: z.string().min(1),
  environmentalMovement: z.string().min(1),
  facialExpressionDirection: z.string().min(1),
  durationSeconds: z.number().int().min(1).max(20),
  imageToVideoPrompt: z.string().min(1),
  negativeMotionInstructions: z.string().min(1),
  transitionIntoNextShot: z.string().min(1),
  suggestedModelCategory: z.string().min(1),
});

export const motionPromptRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  brief: creativeBriefSchema,
  scene: sceneSchema,
  imagePrompt: imagePromptSchema,
  creatorMotionNotes: z.string().trim().max(1_500).default(""),
  uploadedImageName: z.string().trim().max(500).default(""),
});

export const motionPromptResponseSchema = z.object({
  data: motionPlanSchema,
  meta: operationMetaSchema,
});

export const shotDifficultySchema = z.enum(["low", "medium", "high"]);

export const estimateConfigSchema = z.object({
  platformLabel: z.string().trim().min(1).max(120),
  attemptsPerScene: z.number().int().min(1).max(12),
  sampleCreditsPerGeneration: z.number().min(0).max(100_000).optional(),
  creditConfigurationLabel: z.string().trim().max(160).default("Sample configuration"),
});

export const shotEstimateSchema = z.object({
  sceneId: z.string().min(1),
  difficulty: shotDifficultySchema,
  difficultyReason: z.string().min(1),
  minimumGenerations: z.number().int().min(1),
  expectedGenerations: z.number().int().min(1),
  highRetryGenerations: z.number().int().min(1),
});

export const productionEstimateSchema = z.object({
  platformLabel: z.string().min(1),
  finishedRuntimeSeconds: z.number().int().min(1),
  minimumLikelyGenerations: z.number().int().min(1),
  expectedGenerations: z.number().int().min(1),
  highRetryEstimate: z.number().int().min(1),
  estimatedCredits: z.object({
    minimum: z.number().min(0),
    expected: z.number().min(0),
    highRetry: z.number().min(0),
    configurationLabel: z.string().min(1),
  }).optional(),
  difficultSceneIds: z.array(z.string().min(1)),
  shots: z.array(shotEstimateSchema).min(1).max(30),
  disclaimer: z.string().min(1),
  generatedAt: z.string().min(1),
});

export const commentaryModes = ["gentle", "direct", "audience", "technical"] as const;
export const commentaryAreas = ["narrative-clarity", "emotional-payoff", "pacing", "visual-consistency", "character-continuity", "symbolism", "shot-duration", "repetition", "transitions"] as const;

export const commentaryScoreSchema = z.object({
  status: z.enum(["working", "mixed", "needs-attention"]),
  note: z.string().min(1),
});

export const commentaryReportSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(commentaryModes),
  summary: z.string().min(1),
  whatIsWorking: z.array(z.string().min(1)).min(1).max(6),
  unclearMeaning: z.array(z.string().min(1)).min(1).max(6),
  specificChanges: z.array(z.object({
    area: z.enum(commentaryAreas),
    change: z.string().min(1),
    why: z.string().min(1),
  })).min(1).max(9),
  highestPriorityRevision: z.object({
    title: z.string().min(1),
    action: z.string().min(1),
    why: z.string().min(1),
  }),
  scorecard: z.object({
    narrativeClarity: commentaryScoreSchema,
    emotionalPayoff: commentaryScoreSchema,
    pacing: commentaryScoreSchema,
    visualConsistency: commentaryScoreSchema,
    characterContinuity: commentaryScoreSchema,
    symbolism: commentaryScoreSchema,
    shotDuration: commentaryScoreSchema,
    repetition: commentaryScoreSchema,
    transitions: commentaryScoreSchema,
  }),
  limitations: z.string().min(1),
  createdAt: z.string().min(1),
});

export const commentaryRequestSchema = z.object({
  input: storyInputSchema,
  analysis: storyAnalysisSchema,
  brief: creativeBriefSchema,
  scenes: z.array(sceneSchema).min(2).max(30),
  motionPlans: z.array(motionPlanSchema).max(30),
  mode: z.enum(commentaryModes),
  creatorNotes: z.string().trim().max(2_000).default(""),
  clip: z.object({
    name: z.string().trim().min(1).max(500),
    type: z.string().trim().min(1).max(100),
    sizeBytes: z.number().int().positive().max(150_000_000),
    durationSeconds: z.number().positive().max(600),
    width: z.number().int().positive().max(8_192),
    height: z.number().int().positive().max(8_192),
    sampledFrames: z.array(z.object({
      timeSeconds: z.number().min(0).max(600),
      imageDataUrl: z.string().startsWith("data:image/jpeg;base64,").max(800_000),
    })).min(4).max(12),
  }),
});

export const commentaryResponseSchema = z.object({
  data: commentaryReportSchema,
  meta: operationMetaSchema,
});

export type StoryInputValues = z.infer<typeof storyInputSchema>;
export type StoryAnalysisValues = z.infer<typeof storyAnalysisSchema>;
export type ClarifyingQuestionValues = z.infer<typeof clarifyingQuestionSchema>;
export type CreativeBriefValues = z.infer<typeof creativeBriefSchema>;
export type SceneValues = z.infer<typeof sceneSchema>;
export type ImagePromptValues = z.infer<typeof imagePromptSchema>;
export type MotionPlanValues = z.infer<typeof motionPlanSchema>;
export type EstimateConfigValues = z.infer<typeof estimateConfigSchema>;
export type ProductionEstimateValues = z.infer<typeof productionEstimateSchema>;
export type CommentaryModeValues = z.infer<typeof commentaryRequestSchema>["mode"];
export type CommentaryReportValues = z.infer<typeof commentaryReportSchema>;
export type CommentaryRequestValues = z.infer<typeof commentaryRequestSchema>;
