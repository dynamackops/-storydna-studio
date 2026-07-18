import type {
  ClarifyingQuestionValues,
  CreativeBriefValues,
  StoryAnalysisValues,
  StoryInputValues,
} from "../../shared/schemas";

export type ApprovalState = "draft" | "ready" | "approved";
export type ProjectStage = "story" | "dna" | "scenes" | "images" | "motion" | "review";

export type StoryInput = StoryInputValues;
export type StoryAnalysis = StoryAnalysisValues;
export type ClarifyingQuestion = ClarifyingQuestionValues;

export interface ClarifyingAnswer {
  questionId: string;
  answer: string;
}

export interface CreativeBrief extends CreativeBriefValues {
  approval: ApprovalState;
  approvedAt?: string;
}

export interface Scene {
  id: string;
  position: number;
  storyBeat: string;
  sourceReference: string;
  narrativePurpose: string;
  emotionalIntention: string;
  visualDescription: string;
  shotType: string;
  durationSeconds: number;
  transitionIdea: string;
}

export interface ImagePrompt {
  id: string;
  sceneId: string;
  detailedPrompt: string;
  shortPrompt: string;
  alternateFraming: string;
  negativeInstructions: string;
  aspectRatio: StoryInputValues["aspectRatio"];
  consistencyAnchors: string[];
}

export interface MotionPlan {
  id: string;
  sceneId: string;
  intendedAction: string;
  cameraMovement: string;
  subjectMovement: string;
  environmentalMovement: string;
  facialExpressionDirection: string;
  durationSeconds: number;
  prompt: string;
  negativeInstructions: string;
  nextTransition: string;
  suggestedModelCategory: string;
  creatorNotes: string;
}

export interface ProductionEstimate {
  finishedRuntimeSeconds: number;
  minimumGenerations: number;
  expectedGenerations: number;
  highRetryGenerations: number;
  estimatedCredits?: { min: number; max: number; configurationLabel: string };
  difficultSceneIds: string[];
  disclaimer: string;
}

export interface CommentaryReport {
  id: string;
  mode: "gentle" | "direct" | "audience" | "technical";
  whatIsWorking: string[];
  unclearMeaning: string[];
  specificChanges: string[];
  highestPriorityRevision: string;
  createdAt: string;
}

export interface Project {
  id: string;
  createdAt: string;
  updatedAt: string;
  stage: ProjectStage;
  original: StoryInput;
  interpretation?: StoryAnalysis;
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[];
  userCorrection: string;
  extraContext: string;
  confirmedBrief?: CreativeBrief;
  scenes: Scene[];
  imagePrompts: ImagePrompt[];
  motionPlans: MotionPlan[];
  productionEstimate?: ProductionEstimate;
  commentaryReports: CommentaryReport[];
}
