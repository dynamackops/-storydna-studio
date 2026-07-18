import { describe, expect, it } from "vitest";
import { clarifyingQuestionsSchema, creativeBriefRequestSchema, imagePromptSetSchema, motionPlanSchema, sceneOutlineSchema, storyInputSchema } from "./schemas";

const question = {
  id: "q-ending",
  question: "What should the ending feel like?",
  whyItMatters: "It changes the final visual direction.",
  decisionArea: "emotion" as const,
  options: ["Release", "Ache"],
};

describe("StoryDNA schemas", () => {
  it("requires exactly three clarification questions", () => {
    expect(() => clarifyingQuestionsSchema.parse({ questions: [question, question] })).toThrow();
    expect(
      clarifyingQuestionsSchema.parse({
        questions: [
          { ...question, id: "q-one" },
          { ...question, id: "q-two" },
          { ...question, id: "q-three" },
        ],
      }).questions,
    ).toHaveLength(3);
  });

  it("rejects source material too short to interpret", () => {
    const result = storyInputSchema.safeParse({
      title: "A title",
      sourceType: "poem",
      sourceText: "Too short",
      visualVibe: "dreamlike",
      characterDescription: "",
      aspectRatio: "16:9",
      targetRuntimeSeconds: 60,
      preferredTools: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires three answered creative decisions before brief generation", () => {
    const result = creativeBriefRequestSchema.safeParse({ answers: [] });
    expect(result.success).toBe(false);
  });

  it("requires a production-usable scene outline", () => {
    expect(sceneOutlineSchema.safeParse({ scenes: [] }).success).toBe(false);
  });

  it("requires a production-usable image prompt set", () => {
    expect(imagePromptSetSchema.safeParse({ prompts: [] }).success).toBe(false);
  });

  it("requires a complete motion plan", () => {
    expect(motionPlanSchema.safeParse({ id: "motion-scene-01", sceneId: "scene-01" }).success).toBe(false);
  });
});
