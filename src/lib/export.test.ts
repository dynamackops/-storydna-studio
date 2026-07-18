import { describe, expect, it } from "vitest";
import { exportFileName, productionExportToJson, productionExportToMarkdown, type ProductionExport } from "./export";

const project = {
  format: "storydna-production-plan",
  version: 1,
  exportedAt: "2026-07-18T12:00:00.000Z",
  originalSource: { title: "A Light / A Door", sourceType: "poem", sourceText: "A sufficiently long source text that opens a door into the morning light.", visualVibe: "quiet 35mm", characterDescription: "", aspectRatio: "16:9", targetRuntimeSeconds: 10, preferredTools: "" },
  interpretation: { coreEmotionalTruth: "Truth", intendedAudienceFeeling: "Release", beginningEmotionalState: "Closed", endingEmotionalState: "Open", emotionalArc: "A turn", mainThemes: ["change"], symbolsAndMotifs: [{ symbol: "door", possibleMeaning: "choice", visualOpportunity: "threshold" }], visualLanguage: "tactile", sensoryDirection: { color: "amber", lighting: "soft", texture: "grain", atmosphere: "still" }, characterTransformation: "softens", interpretationRisks: ["too literal"], initialEstimatedSceneCount: 2 },
  questions: [{ id: "q-1", question: "How should it end?", whyItMatters: "Changes the ending.", decisionArea: "emotion", options: ["Release", "Ache"] }],
  answers: { "q-1": "Release" }, userCorrection: "", extraContext: "",
  confirmedBrief: { creativeIntention: "Make change visible.", emotionalDestination: "Release", visualIdentity: "Tactile amber", characterDirection: "Soften", storytellingConstraints: ["Stay restrained"], consistencyRequirements: ["Keep the coat"] },
  scenes: [{ id: "scene-01", position: 1, storyBeat: "The door", sourceReference: "Opening", narrativePurpose: "Begin", emotionalIntention: "Uncertainty", visualDescription: "A hand at a door.", shotType: "Close-up", durationSeconds: 5, transitionIdea: "Cut" }],
  imagePrompts: [{ id: "prompt-scene-01", sceneId: "scene-01", detailedPrompt: "Detailed image prompt", shortPrompt: "Short image prompt", alternateFraming: "Alternate", negativeInstructions: "No text", aspectRatio: "16:9", consistencyAnchors: ["coat"] }],
  motionPlans: [{ id: "motion-scene-01", sceneId: "scene-01", intendedAction: "Open", cameraMovement: "Push", subjectMovement: "Hand turns", environmentalMovement: "Dust", facialExpressionDirection: "Still", durationSeconds: 5, imageToVideoPrompt: "Animate the hand", negativeMotionInstructions: "No morph", transitionIntoNextShot: "Cut", suggestedModelCategory: "Controlled motion" }],
  productionEstimate: { platformLabel: "Kling", finishedRuntimeSeconds: 5, minimumLikelyGenerations: 1, expectedGenerations: 3, highRetryEstimate: 5, difficultSceneIds: [], shots: [{ sceneId: "scene-01", difficulty: "medium", difficultyReason: "hand detail", minimumGenerations: 1, expectedGenerations: 3, highRetryGenerations: 5 }], disclaimer: "Estimate only", generatedAt: "2026-07-18T12:00:00.000Z" },
} satisfies ProductionExport;

describe("production plan export", () => {
  it("creates a readable markdown packet with every production stage", () => {
    const markdown = productionExportToMarkdown(project);
    expect(markdown).toContain("# A Light / A Door — StoryDNA Production Plan");
    expect(markdown).toContain("Detailed image prompt");
    expect(markdown).toContain("Animate the hand");
    expect(markdown).toContain("Expected generations:** 3");
    expect(markdown).toContain("API credentials are never included");
  });

  it("creates structured JSON and a safe filename", () => {
    expect(JSON.parse(productionExportToJson(project)).format).toBe("storydna-production-plan");
    expect(exportFileName(project.originalSource.title, "json")).toBe("a-light-a-door-production-plan.json");
  });
});
