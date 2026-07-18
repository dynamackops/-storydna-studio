import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ClarifyingQuestionValues,
  CreativeBriefValues,
  ImagePromptValues,
  MotionPlanValues,
  StoryAnalysisValues,
  StoryInputValues,
  SceneValues,
} from "../../shared/schemas";

export type WorkflowStatus = "idle" | "analyzing" | "questioning" | "briefing" | "scenes" | "images" | "motion" | "ready" | "error";

export interface PersistedCreativeBrief extends CreativeBriefValues {
  approval: "ready" | "approved";
  approvedAt?: string;
}

export const blankStory: StoryInputValues = {
  title: "",
  sourceType: "poem",
  sourceText: "",
  visualVibe: "",
  characterDescription: "",
  aspectRatio: "16:9",
  targetRuntimeSeconds: 60,
  preferredTools: "",
};

export const demoStory: StoryInputValues = {
  title: "The House That Kept the Dawn",
  sourceType: "poem",
  sourceText:
    "Every morning the old house caught the dawn in its windows, but no one lived there to see it. I carried a rusted key through fields of silver grass. At the door, I heard my younger voice on the other side, naming all the things I had taught myself to forget. When I turned the key, the house opened into sky—and the light did not forgive me. It simply stayed.",
  visualVibe: "quiet magical realism, tactile 35mm, intimate and celestial",
  characterDescription:
    "A solitary woman in her early thirties, dark wavy hair, weathered charcoal coat, guarded posture that gradually softens.",
  aspectRatio: "16:9",
  targetRuntimeSeconds: 60,
  preferredTools: "Midjourney, Kling, CapCut",
};

function motionDraft(scene: SceneValues): MotionPlanValues {
  return {
    id: `motion-${scene.id}`,
    sceneId: scene.id,
    intendedAction: "",
    cameraMovement: "",
    subjectMovement: "",
    environmentalMovement: "",
    facialExpressionDirection: "",
    durationSeconds: Math.max(2, Math.min(10, scene.durationSeconds)),
    imageToVideoPrompt: "",
    negativeMotionInstructions: "",
    transitionIntoNextShot: "",
    suggestedModelCategory: "",
  };
}

interface OperationMeta {
  demoMode: boolean;
  model: string;
  generatedAt: string;
}

interface ProjectState {
  draft: StoryInputValues;
  analysis?: StoryAnalysisValues;
  questions: ClarifyingQuestionValues[];
  answers: Record<string, string>;
  userCorrection: string;
  extraContext: string;
  variationSeed: number;
  brief?: PersistedCreativeBrief;
  scenes: SceneValues[];
  sceneApproval: "draft" | "ready" | "approved";
  scenesApprovedAt?: string;
  sceneNotes: Record<string, string>;
  regeneratingSceneId?: string;
  imagePrompts: ImagePromptValues[];
  imagePromptNotes: Record<string, string>;
  regeneratingPromptSceneId?: string;
  motionPlans: MotionPlanValues[];
  motionWorkspaceOpen: boolean;
  motionNotes: Record<string, string>;
  motionImageNames: Record<string, string>;
  regeneratingMotionSceneId?: string;
  status: WorkflowStatus;
  statusMessage: string;
  error?: string;
  meta?: OperationMeta;
  updateDraft: <K extends keyof StoryInputValues>(key: K, value: StoryInputValues[K]) => void;
  loadDemoStory: () => void;
  beginAnalysis: () => void;
  setAnalysis: (analysis: StoryAnalysisValues, meta: OperationMeta) => void;
  beginQuestions: () => void;
  setQuestions: (questions: ClarifyingQuestionValues[], meta: OperationMeta) => void;
  setAnswer: (id: string, answer: string) => void;
  setUserCorrection: (value: string) => void;
  setExtraContext: (value: string) => void;
  nextVariation: () => number;
  beginBrief: () => void;
  setBrief: (brief: CreativeBriefValues, meta: OperationMeta) => void;
  updateBriefField: <K extends keyof CreativeBriefValues>(key: K, value: CreativeBriefValues[K]) => void;
  approveBrief: () => void;
  returnToQuestions: () => void;
  beginScenes: () => void;
  setScenes: (scenes: SceneValues[], meta: OperationMeta) => void;
  updateScene: <K extends keyof SceneValues>(id: string, key: K, value: SceneValues[K]) => void;
  addScene: () => void;
  deleteScene: (id: string) => void;
  moveScene: (id: string, direction: -1 | 1) => void;
  setSceneNote: (id: string, note: string) => void;
  beginSceneRegeneration: (id: string) => void;
  replaceScene: (scene: SceneValues, meta: OperationMeta) => void;
  approveScenes: () => void;
  beginImagePrompts: () => void;
  setImagePrompts: (prompts: ImagePromptValues[], meta: OperationMeta) => void;
  updateImagePrompt: <K extends keyof ImagePromptValues>(sceneId: string, key: K, value: ImagePromptValues[K]) => void;
  setImagePromptNote: (sceneId: string, note: string) => void;
  beginImagePromptRegeneration: (sceneId: string) => void;
  replaceImagePrompt: (prompt: ImagePromptValues, meta: OperationMeta) => void;
  openMotionWorkspace: () => void;
  closeMotionWorkspace: () => void;
  setMotionNote: (sceneId: string, note: string) => void;
  setMotionImageName: (sceneId: string, fileName: string) => void;
  beginMotionGeneration: (sceneId: string) => void;
  setMotionPlan: (plan: MotionPlanValues, meta: OperationMeta) => void;
  updateMotionPlan: <K extends keyof MotionPlanValues>(sceneId: string, key: K, value: MotionPlanValues[K]) => void;
  fail: (message: string) => void;
  startOver: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      draft: blankStory,
      questions: [],
      answers: {},
      userCorrection: "",
      extraContext: "",
      variationSeed: 0,
      brief: undefined,
      scenes: [],
      sceneApproval: "draft",
      sceneNotes: {},
      imagePrompts: [],
      imagePromptNotes: {},
      motionPlans: [],
      motionWorkspaceOpen: false,
      motionNotes: {},
      motionImageNames: {},
      status: "idle",
      statusMessage: "",
      updateDraft: (key, value) =>
        set((state) => ({
          draft: { ...state.draft, [key]: value },
          analysis: undefined,
          questions: [],
          answers: {},
          status: "idle",
          error: undefined,
          meta: undefined,
          brief: undefined,
          scenes: [],
          sceneApproval: "draft",
          sceneNotes: {},
          imagePrompts: [],
          imagePromptNotes: {},
          motionPlans: [],
          motionWorkspaceOpen: false,
          motionNotes: {},
          motionImageNames: {},
        })),
      loadDemoStory: () =>
        set({
          draft: demoStory,
          analysis: undefined,
          questions: [],
          answers: {},
          status: "idle",
          error: undefined,
          meta: undefined,
          brief: undefined,
          scenes: [],
          sceneApproval: "draft",
          sceneNotes: {},
          imagePrompts: [],
          imagePromptNotes: {},
          motionPlans: [],
          motionWorkspaceOpen: false,
          motionNotes: {},
          motionImageNames: {},
        }),
      beginAnalysis: () =>
        set({
          analysis: undefined,
          questions: [],
          answers: {},
          status: "analyzing",
          statusMessage: "Reading for emotional truth, symbols, and the shape of change…",
          error: undefined,
        }),
      setAnalysis: (analysis, meta) => set({ analysis, meta }),
      beginQuestions: () =>
        set({
          status: "questioning",
          statusMessage: "Finding the three decisions that will change the film most…",
          error: undefined,
        }),
      setQuestions: (questions, meta) =>
        set({ questions, meta, status: "ready", statusMessage: "", error: undefined }),
      setAnswer: (id, answer) =>
        set((state) => ({ answers: { ...state.answers, [id]: answer } })),
      setUserCorrection: (userCorrection) => set({ userCorrection }),
      setExtraContext: (extraContext) => set({ extraContext }),
      nextVariation: () => {
        const value = get().variationSeed + 1;
        set({ variationSeed: value });
        return value;
      },
      beginBrief: () =>
        set({
          status: "briefing",
          statusMessage: "Distilling your answers into a protected creative north star…",
          error: undefined,
        }),
      setBrief: (brief, meta) =>
        set({
          brief: { ...brief, approval: "ready" },
          meta,
          status: "ready",
          statusMessage: "",
          error: undefined,
        }),
      updateBriefField: (key, value) =>
        set((state) => {
          if (!state.brief || state.brief.approval === "approved") return state;
          return { brief: { ...state.brief, [key]: value } };
        }),
      approveBrief: () =>
        set((state) =>
          state.brief
            ? { brief: { ...state.brief, approval: "approved", approvedAt: new Date().toISOString() } }
            : state,
        ),
      returnToQuestions: () => set({ brief: undefined, status: "ready", error: undefined }),
      beginScenes: () =>
        set({
          status: "scenes",
          statusMessage: "Turning the approved brief into an editable visual rhythm…",
          error: undefined,
        }),
      setScenes: (scenes, meta) =>
        set({
          scenes: scenes.map((scene, index) => ({ ...scene, position: index + 1 })),
          sceneApproval: "ready",
          sceneNotes: {},
          imagePrompts: [],
          imagePromptNotes: {},
          motionPlans: [],
          motionWorkspaceOpen: false,
          motionNotes: {},
          motionImageNames: {},
          meta,
          status: "ready",
          statusMessage: "",
          error: undefined,
        }),
      updateScene: (id, key, value) =>
        set((state) =>
          state.sceneApproval === "approved"
            ? state
            : { scenes: state.scenes.map((scene) => scene.id === id ? { ...scene, [key]: value } : scene) },
        ),
      addScene: () =>
        set((state) => {
          if (state.sceneApproval === "approved") return state;
          const nextPosition = state.scenes.length + 1;
          return {
            scenes: [...state.scenes, {
              id: `scene-local-${Date.now().toString(36)}`,
              position: nextPosition,
              storyBeat: "Untitled story beat",
              sourceReference: "Creator-added beat",
              narrativePurpose: "Define what this moment changes in the story.",
              emotionalIntention: "Define the intended audience feeling.",
              visualDescription: "Describe the essential image and action.",
              shotType: "Medium shot",
              durationSeconds: 5,
              transitionIdea: "Cut on visual or emotional continuity.",
            }],
          };
        }),
      deleteScene: (id) =>
        set((state) => {
          if (state.sceneApproval === "approved" || state.scenes.length <= 2) return state;
          return { scenes: state.scenes.filter((scene) => scene.id !== id).map((scene, index) => ({ ...scene, position: index + 1 })) };
        }),
      moveScene: (id, direction) =>
        set((state) => {
          if (state.sceneApproval === "approved") return state;
          const index = state.scenes.findIndex((scene) => scene.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= state.scenes.length) return state;
          const scenes = [...state.scenes];
          [scenes[index], scenes[target]] = [scenes[target], scenes[index]];
          return { scenes: scenes.map((scene, sceneIndex) => ({ ...scene, position: sceneIndex + 1 })) };
        }),
      setSceneNote: (id, note) => set((state) => ({ sceneNotes: { ...state.sceneNotes, [id]: note } })),
      beginSceneRegeneration: (regeneratingSceneId) => set({ regeneratingSceneId, error: undefined }),
      replaceScene: (scene, meta) =>
        set((state) => ({
          scenes: state.scenes.map((current) => current.id === scene.id ? { ...scene, id: current.id, position: current.position } : current),
          regeneratingSceneId: undefined,
          meta,
          error: undefined,
        })),
      approveScenes: () =>
        set((state) => ({
          sceneApproval: state.scenes.length >= 2 ? "approved" : state.sceneApproval,
          scenesApprovedAt: state.scenes.length >= 2 ? new Date().toISOString() : state.scenesApprovedAt,
        })),
      beginImagePrompts: () =>
        set({
          status: "images",
          statusMessage: "Translating each approved beat into a consistent cinematic frame…",
          error: undefined,
        }),
      setImagePrompts: (imagePrompts, meta) =>
        set({
          imagePrompts,
          imagePromptNotes: {},
          motionPlans: [],
          motionWorkspaceOpen: false,
          motionNotes: {},
          motionImageNames: {},
          meta,
          status: "ready",
          statusMessage: "",
          error: undefined,
        }),
      updateImagePrompt: (sceneId, key, value) =>
        set((state) => ({
          imagePrompts: state.imagePrompts.map((prompt) => prompt.sceneId === sceneId ? { ...prompt, [key]: value } : prompt),
        })),
      setImagePromptNote: (sceneId, note) =>
        set((state) => ({ imagePromptNotes: { ...state.imagePromptNotes, [sceneId]: note } })),
      beginImagePromptRegeneration: (regeneratingPromptSceneId) =>
        set({ regeneratingPromptSceneId, error: undefined }),
      replaceImagePrompt: (prompt, meta) =>
        set((state) => ({
          imagePrompts: state.imagePrompts.map((current) => current.sceneId === prompt.sceneId
            ? { ...prompt, id: current.id, sceneId: current.sceneId, aspectRatio: current.aspectRatio }
            : current),
          regeneratingPromptSceneId: undefined,
          meta,
          error: undefined,
        })),
      openMotionWorkspace: () =>
        set((state) => ({
          motionPlans: state.motionPlans.length ? state.motionPlans : state.scenes.map(motionDraft),
          motionWorkspaceOpen: true,
          status: "ready",
          error: undefined,
        })),
      closeMotionWorkspace: () => set({ motionWorkspaceOpen: false, status: "ready", error: undefined }),
      setMotionNote: (sceneId, note) =>
        set((state) => ({ motionNotes: { ...state.motionNotes, [sceneId]: note } })),
      setMotionImageName: (sceneId, fileName) =>
        set((state) => ({ motionImageNames: { ...state.motionImageNames, [sceneId]: fileName } })),
      beginMotionGeneration: (regeneratingMotionSceneId) =>
        set({ regeneratingMotionSceneId, status: "motion", statusMessage: "Designing controlled motion for this frame…", error: undefined }),
      setMotionPlan: (plan, meta) =>
        set((state) => ({
          motionPlans: state.motionPlans.map((current) => current.sceneId === plan.sceneId
            ? { ...plan, id: current.id, sceneId: current.sceneId }
            : current),
          regeneratingMotionSceneId: undefined,
          status: "ready",
          statusMessage: "",
          meta,
          error: undefined,
        })),
      updateMotionPlan: (sceneId, key, value) =>
        set((state) => ({
          motionPlans: state.motionPlans.map((plan) => plan.sceneId === sceneId ? { ...plan, [key]: value } : plan),
        })),
      fail: (error) => set({ status: "error", statusMessage: "", error, regeneratingSceneId: undefined, regeneratingPromptSceneId: undefined, regeneratingMotionSceneId: undefined }),
      startOver: () =>
        set({
          draft: blankStory,
          analysis: undefined,
          questions: [],
          answers: {},
          userCorrection: "",
          extraContext: "",
          variationSeed: 0,
          brief: undefined,
          scenes: [],
          sceneApproval: "draft",
          scenesApprovedAt: undefined,
          sceneNotes: {},
          regeneratingSceneId: undefined,
          imagePrompts: [],
          imagePromptNotes: {},
          regeneratingPromptSceneId: undefined,
          motionPlans: [],
          motionWorkspaceOpen: false,
          motionNotes: {},
          motionImageNames: {},
          regeneratingMotionSceneId: undefined,
          status: "idle",
          statusMessage: "",
          error: undefined,
          meta: undefined,
        }),
    }),
    {
      name: "storydna-active-project-v1",
      partialize: (state) => ({
        draft: state.draft,
        analysis: state.analysis,
        questions: state.questions,
        answers: state.answers,
        userCorrection: state.userCorrection,
        extraContext: state.extraContext,
        variationSeed: state.variationSeed,
        status: state.status === "analyzing" || state.status === "questioning" || state.status === "briefing" || state.status === "scenes" || state.status === "images" || state.status === "motion" ? "idle" : state.status,
        meta: state.meta,
        brief: state.brief,
        scenes: state.scenes,
        sceneApproval: state.sceneApproval,
        scenesApprovedAt: state.scenesApprovedAt,
        sceneNotes: state.sceneNotes,
        imagePrompts: state.imagePrompts,
        imagePromptNotes: state.imagePromptNotes,
        motionPlans: state.motionPlans,
        motionWorkspaceOpen: state.motionWorkspaceOpen,
        motionNotes: state.motionNotes,
        motionImageNames: state.motionImageNames,
      }),
    },
  ),
);
