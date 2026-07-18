import { describe, expect, it } from "vitest";
import { clarifyingQuestionsSchema, creativeBriefSchema, imagePromptSchema, imagePromptSetSchema, sceneOutlineSchema, sceneSchema, storyAnalysisSchema } from "../../shared/schemas";
import { demoAnalysis, demoCreativeBrief, demoImagePrompts, demoQuestions, demoRegeneratedImagePrompt, demoRegeneratedScene, demoSceneOutline } from "./demo";

const demoStory = {
  title: "The House That Kept the Dawn",
  sourceType: "poem" as const,
  sourceText: "Every morning the old house caught the dawn in its windows, but no one lived there to see it.",
  visualVibe: "quiet magical realism",
  characterDescription: "A solitary woman in a charcoal coat.",
  aspectRatio: "16:9" as const,
  targetRuntimeSeconds: 60,
  preferredTools: "Kling",
};

describe("guided demo director", () => {
  it("returns schema-valid StoryDNA", () => {
    expect(storyAnalysisSchema.parse(demoAnalysis(demoStory)).initialEstimatedSceneCount).toBeGreaterThan(1);
  });

  it("returns a distinct, valid set of exactly three questions", () => {
    const first = clarifyingQuestionsSchema.parse(demoQuestions(0));
    const second = clarifyingQuestionsSchema.parse(demoQuestions(1));
    expect(first.questions).toHaveLength(3);
    expect(second.questions).toHaveLength(3);
    expect(second.questions[0].id).not.toBe(first.questions[0].id);
  });

  it("turns creator answers and corrections into a valid brief", () => {
    const analysis = demoAnalysis(demoStory);
    const questions = demoQuestions(0).questions;
    const answers = questions.map((question, index) => ({
      questionId: question.id,
      answer: index === 0 ? "A beautiful ache" : question.options[0],
    }));
    const brief = creativeBriefSchema.parse(
      demoCreativeBrief(demoStory, analysis, answers, "The house represents her future.", "Keep the rusted key."),
    );
    expect(brief.emotionalDestination).toContain("A beautiful ache");
    expect(brief.storytellingConstraints.join(" ")).toContain("future");
  });

  it("creates stable scene ids and regenerates only the target scene", () => {
    const analysis = demoAnalysis(demoStory);
    const outline = sceneOutlineSchema.parse(demoSceneOutline(demoStory, analysis));
    expect(new Set(outline.scenes.map((scene) => scene.id)).size).toBe(outline.scenes.length);
    const beforeIds = outline.scenes.map((scene) => scene.id);
    const target = outline.scenes[1];
    const regenerated = sceneSchema.parse(demoRegeneratedScene(target, "Make the key more prominent."));
    const after = outline.scenes.map((scene) => scene.id === target.id ? regenerated : scene);
    expect(after.map((scene) => scene.id)).toEqual(beforeIds);
    expect(after[0]).toEqual(outline.scenes[0]);
    expect(regenerated.visualDescription).toContain("key more prominent");
  });

  it("creates one linked image prompt per scene and regenerates only its target", () => {
    const analysis = demoAnalysis(demoStory);
    const scenes = demoSceneOutline(demoStory, analysis).scenes;
    const brief = demoCreativeBrief(demoStory, analysis, demoQuestions(0).questions.map((question) => ({ questionId: question.id, answer: question.options[0] })), "", "");
    const set = imagePromptSetSchema.parse(demoImagePrompts(demoStory, brief, scenes));
    expect(set.prompts.map((prompt) => prompt.sceneId)).toEqual(scenes.map((scene) => scene.id));
    expect(set.prompts.every((prompt) => prompt.aspectRatio === demoStory.aspectRatio)).toBe(true);
    const target = set.prompts[1];
    const regenerated = imagePromptSchema.parse(demoRegeneratedImagePrompt(target, scenes[1], "Make it less literal."));
    expect(regenerated.id).toBe(target.id);
    expect(regenerated.sceneId).toBe(target.sceneId);
    expect(regenerated.detailedPrompt).toContain("less literal");
    expect(set.prompts[0]).not.toEqual(regenerated);
  });
});
