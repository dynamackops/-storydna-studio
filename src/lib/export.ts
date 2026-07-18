import type {
  ClarifyingQuestionValues,
  CreativeBriefValues,
  ImagePromptValues,
  MotionPlanValues,
  ProductionEstimateValues,
  SceneValues,
  StoryAnalysisValues,
  StoryInputValues,
} from "../../shared/schemas";

export interface ProductionExportInput {
  originalSource: StoryInputValues;
  interpretation: StoryAnalysisValues;
  questions: ClarifyingQuestionValues[];
  answers: Record<string, string>;
  userCorrection: string;
  extraContext: string;
  confirmedBrief: CreativeBriefValues;
  scenes: SceneValues[];
  imagePrompts: ImagePromptValues[];
  motionPlans: MotionPlanValues[];
  productionEstimate: ProductionEstimateValues;
}

export interface ProductionExport extends ProductionExportInput {
  format: "storydna-production-plan";
  version: 1;
  exportedAt: string;
}

export function createProductionExport(input: ProductionExportInput): ProductionExport {
  return {
    format: "storydna-production-plan",
    version: 1,
    exportedAt: new Date().toISOString(),
    ...input,
  };
}

function section(title: string, body: string) {
  return `## ${title}\n\n${body.trim()}\n`;
}

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function productionExportToMarkdown(project: ProductionExport) {
  const { originalSource, interpretation, confirmedBrief, productionEstimate } = project;
  const decisions = project.questions.map((question) => {
    const answer = project.answers[question.id] || "Not answered";
    return `### ${question.question}\n\n**Creator answer:** ${answer}\n\n_${question.whyItMatters}_`;
  }).join("\n\n");

  const scenes = project.scenes.map((scene) => {
    const image = project.imagePrompts.find((prompt) => prompt.sceneId === scene.id);
    const motion = project.motionPlans.find((plan) => plan.sceneId === scene.id);
    return `## Scene ${String(scene.position).padStart(2, "0")} — ${scene.storyBeat}

**Stable ID:** ${scene.id}  
**Source reference:** ${scene.sourceReference}  
**Narrative purpose:** ${scene.narrativePurpose}  
**Emotional intention:** ${scene.emotionalIntention}  
**Shot / duration:** ${scene.shotType} · ${scene.durationSeconds}s  
**Transition:** ${scene.transitionIdea}

### Visual description

${scene.visualDescription}

### Image prompt

${image?.detailedPrompt || "Not generated"}

**Short prompt:** ${image?.shortPrompt || "Not generated"}

**Alternate framing:** ${image?.alternateFraming || "Not generated"}

**Negative instructions:** ${image?.negativeInstructions || "Not generated"}

### Motion plan

**Intended action:** ${motion?.intendedAction || "Not generated"}  
**Camera:** ${motion?.cameraMovement || "Not generated"}  
**Subject:** ${motion?.subjectMovement || "Not generated"}  
**Environment:** ${motion?.environmentalMovement || "Not generated"}  
**Expression:** ${motion?.facialExpressionDirection || "Not generated"}  
**Clip duration:** ${motion?.durationSeconds || scene.durationSeconds}s  
**Model category:** ${motion?.suggestedModelCategory || "Not generated"}

#### Image-to-video prompt

${motion?.imageToVideoPrompt || "Not generated"}

**Negative motion instructions:** ${motion?.negativeMotionInstructions || "Not generated"}

**Transition into next shot:** ${motion?.transitionIntoNextShot || scene.transitionIdea}`;
  }).join("\n\n---\n\n");

  const shotRows = productionEstimate.shots.map((shot) => {
    const scene = project.scenes.find((item) => item.id === shot.sceneId);
    return `| ${scene?.position || "—"} | ${scene?.storyBeat || shot.sceneId} | ${shot.difficulty} | ${shot.expectedGenerations} | ${shot.highRetryGenerations} | ${shot.difficultyReason} |`;
  }).join("\n");

  return `# ${originalSource.title} — StoryDNA Production Plan

> Keep your voice. Lose the production chaos.

Exported ${new Date(project.exportedAt).toLocaleString()} · ${originalSource.aspectRatio} · approximately ${originalSource.targetRuntimeSeconds}s · ${originalSource.sourceType}

${section("Original source material", originalSource.sourceText)}
${section("StoryDNA interpretation", `**Core emotional truth:** ${interpretation.coreEmotionalTruth}

**Intended audience feeling:** ${interpretation.intendedAudienceFeeling}

**Emotional arc:** ${interpretation.beginningEmotionalState} → ${interpretation.endingEmotionalState}

${interpretation.emotionalArc}

**Themes**

${bulletList(interpretation.mainThemes)}

**Visual language:** ${interpretation.visualLanguage}`)}
${section("Creator decisions", `${decisions}

### Correction to the interpretation

${project.userCorrection || "None provided"}

### Extra creative context

${project.extraContext || "None provided"}`)}
${section("Approved creative brief", `### Creative intention

${confirmedBrief.creativeIntention}

### Emotional destination

${confirmedBrief.emotionalDestination}

### Visual identity

${confirmedBrief.visualIdentity}

### Character direction

${confirmedBrief.characterDirection}

### Storytelling constraints

${bulletList(confirmedBrief.storytellingConstraints)}

### Must remain consistent

${bulletList(confirmedBrief.consistencyRequirements)}`)}
# Scene production plan

${scenes}

# Production estimate

**Platform assumption:** ${productionEstimate.platformLabel}  
**Estimated finished runtime:** ${productionEstimate.finishedRuntimeSeconds}s  
**Minimum likely generations:** ${productionEstimate.minimumLikelyGenerations}  
**Expected generations:** ${productionEstimate.expectedGenerations}  
**High-retry estimate:** ${productionEstimate.highRetryEstimate}

${productionEstimate.estimatedCredits ? `**Configured sample credits:** ${productionEstimate.estimatedCredits.minimum} minimum · ${productionEstimate.estimatedCredits.expected} expected · ${productionEstimate.estimatedCredits.highRetry} high-retry  
_${productionEstimate.estimatedCredits.configurationLabel}_\n` : "**Credits:** Not configured\n"}
| Scene | Beat | Difficulty | Expected | High retry | Reason |
| --- | --- | --- | ---: | ---: | --- |
${shotRows}

> ${productionEstimate.disclaimer}

---

Generated by StoryDNA Studio. Uploaded image previews and API credentials are never included in this export.
`;
}

export function productionExportToJson(project: ProductionExport) {
  return JSON.stringify(project, null, 2);
}

export function exportFileName(title: string, extension: "md" | "json") {
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "storydna-project";
  return `${slug}-production-plan.${extension}`;
}
