import type {
  ClarifyingQuestionValues,
  CreativeBriefValues,
  ImagePromptValues,
  MotionPlanValues,
  SceneValues,
  StoryAnalysisValues,
  StoryInputValues,
} from "../../shared/schemas";

export function demoAnalysis(input: StoryInputValues): StoryAnalysisValues {
  const sceneCount = Math.max(3, Math.min(12, Math.round(input.targetRuntimeSeconds / 8)));

  return {
    coreEmotionalTruth: `A private inner change becomes visible when the creator stops resisting what the ${input.sourceType} already knows.`,
    intendedAudienceFeeling: "Recognized first, then quietly released—as if an unnamed feeling has finally found an image.",
    beginningEmotionalState: "Held breath, distance, and emotional containment.",
    endingEmotionalState: "Tender clarity with a trace of mystery still intact.",
    emotionalArc: "The film should move from compression and uncertainty through a charged symbolic encounter, then arrive at an earned visual exhale.",
    mainThemes: ["self-recognition", "transformation", "memory as landscape"],
    symbolsAndMotifs: [
      {
        symbol: "Thresholds and reflected surfaces",
        possibleMeaning: "The gap between the self that performs and the self that knows.",
        visualOpportunity: "Repeat doors, windows, water, or mirrors with a subtle change in each appearance.",
      },
      {
        symbol: "A single warm source of light",
        possibleMeaning: "An inner truth that is present before the character can name it.",
        visualOpportunity: "Let the warm source gradually move from background detail to the emotional center of frame.",
      },
    ],
    visualLanguage: `${input.visualVibe}. Favor composed, tactile images with negative space and visual echoes rather than literal illustration of every line.`,
    sensoryDirection: {
      color: "Near-black violets and mineral blues interrupted by restrained amber.",
      lighting: "Motivated pools of light, soft falloff, and one evolving practical source.",
      texture: "Film grain, weathered surfaces, atmospheric depth, and delicate imperfections.",
      atmosphere: "Intimate, suspended, and quietly celestial rather than grandiose.",
    },
    characterTransformation: input.characterDescription
      ? "The character moves from guarded observation to embodied acceptance; posture and gaze should carry more of the change than overt action."
      : "The implied protagonist moves from disconnection to presence; this can be expressed through point of view, environment, and rhythm if no character is shown.",
    interpretationRisks: [
      "Beautiful imagery could become decorative if the central emotional turn is not clearly staged.",
      "The ending could read as resolution or loss; the creator's intended after-feeling needs clarification.",
    ],
    initialEstimatedSceneCount: sceneCount,
  };
}

const questionSets: ClarifyingQuestionValues[][] = [
  [
    {
      id: "q-ending-feeling",
      decisionArea: "emotion",
      question: "In the final image, should the audience feel release, ache, or a deliberately unresolved mixture of both?",
      whyItMatters: "That choice changes whether the visual arc opens into warmth, holds on absence, or ends on an ambiguous threshold.",
      options: ["A clean emotional release", "A beautiful ache", "Both—keep it unresolved"],
    },
    {
      id: "q-symbol-mode",
      decisionArea: "symbolism",
      question: "Should the recurring threshold imagery exist literally in the world, symbolically through framing, or in both forms?",
      whyItMatters: "This determines whether the film feels like grounded magical realism or a more subjective visual poem.",
      options: ["Literal objects and locations", "Symbolic framing only", "A blend of both"],
    },
    {
      id: "q-world-safety",
      decisionArea: "world",
      question: "How should the world feel before the emotional turn: protective, quietly unsettling, or actively hostile?",
      whyItMatters: "The starting atmosphere controls the contrast and intensity of the character's transformation.",
      options: ["Protective but closed", "Quietly unsettling", "Actively hostile"],
    },
  ],
  [
    {
      id: "q-recognition",
      decisionArea: "character",
      question: "Does the protagonist consciously understand the change as it happens, or should the audience recognize it first?",
      whyItMatters: "This changes performance direction, gaze, and whether the camera behaves as witness or extension of the character.",
      options: ["The character understands", "The audience understands first", "Recognition arrives together"],
    },
    {
      id: "q-tempo",
      decisionArea: "pacing",
      question: "Should the central encounter feel like a suspended breath or a sudden rupture in the film's rhythm?",
      whyItMatters: "It determines shot length, motion intensity, and the shape of the transition into the ending.",
      options: ["A suspended breath", "A sudden rupture", "A rupture followed by stillness"],
    },
    {
      id: "q-polish",
      decisionArea: "visual-language",
      question: "How visible should imperfection be in the finished world: dreamlike polish, tactile human texture, or a controlled progression between them?",
      whyItMatters: "The answer sets a consistency rule for surfaces, generated artifacts, grain, and lighting across every scene.",
      options: ["Dreamlike polish", "Tactile human texture", "Move from polish to texture"],
    },
  ],
];

export function demoQuestions(seed: number): { questions: ClarifyingQuestionValues[] } {
  return { questions: questionSets[seed % questionSets.length] };
}

export function demoCreativeBrief(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
  answers: Array<{ questionId: string; answer: string }>,
  userCorrection: string,
  extraContext: string,
): CreativeBriefValues {
  const decisions = answers.map((item) => item.answer).join("; ");
  return {
    creativeIntention: `Create an intimate visual poem about ${analysis.mainThemes.slice(0, 2).join(" and ")} that lets the source remain emotionally ambiguous while making its central transformation legible.`,
    emotionalDestination: `${analysis.endingEmotionalState} The creator's chosen direction is: ${answers[0]?.answer}.`,
    visualIdentity: `${analysis.visualLanguage} Use ${analysis.sensoryDirection.color.toLowerCase()} Lighting should feel ${analysis.sensoryDirection.lighting.toLowerCase()}`,
    characterDirection: `${analysis.characterTransformation}${input.characterDescription ? ` Preserve this anchor: ${input.characterDescription}` : ""}`,
    storytellingConstraints: [
      "Do not illustrate every line literally; each image must advance the emotional movement.",
      `Honor these confirmed creative choices: ${decisions}.`,
      `Design for ${input.aspectRatio} and an approximate ${input.targetRuntimeSeconds}-second finished runtime.`,
      ...(userCorrection ? [`Creator correction overrides the initial interpretation: ${userCorrection}`] : []),
    ],
    consistencyRequirements: [
      "Repeat thresholds, reflected surfaces, and the evolving warm light with purposeful variation.",
      "Keep wardrobe, age, hair, and silhouette consistent whenever the protagonist appears.",
      "Let posture, gaze, and distance from camera carry the transformation before overt action.",
      ...(extraContext ? [`Carry this creator context through every scene: ${extraContext}`] : []),
    ],
  };
}

export function demoSceneOutline(
  input: StoryInputValues,
  analysis: StoryAnalysisValues,
): { scenes: SceneValues[] } {
  const count = Math.max(4, Math.min(8, analysis.initialEstimatedSceneCount));
  const beatTemplates = [
    ["The held breath", "Opening image / emotional baseline", "Establish containment before the story changes", "Distance and guarded stillness", "The protagonist crosses a silver field toward the abandoned house; the warm dawn remains trapped in its windows.", "Wide establishing shot", "A slow dissolve carried by moving grass"],
    ["The key remembers", "The rusted key and the approach", "Turn an ordinary object into the first charged symbol", "Recognition without understanding", "A weathered hand closes around the rusted key as the house softens out of focus behind it.", "Macro insert", "Match cut from the key's circular bow to a dark window"],
    ["A voice behind the door", "The younger voice names what was forgotten", "Make the internal conflict present without over-explaining it", "Unease becoming attention", "At the threshold, the protagonist hears her younger self; reflected light briefly suggests a second figure without revealing one.", "Tight over-the-shoulder", "Sound bridge into the stillness before the turn"],
    ["The choice to enter", "She turns the key", "Stage the irreversible emotional decision", "Fear held alongside resolve", "The key turns with tactile resistance as amber light leaks through the doorframe and reaches her face.", "Extreme close-up to medium profile", "Hard cut on the lock's release"],
    ["The house opens into sky", "The impossible reveal", "Externalize the transformation through one earned visual rupture", "Awe with a beautiful ache", "The interior walls fall away into an immense quiet sky; familiar objects drift at the edge of the impossible space.", "Wide reveal with restrained push-in", "Light bloom that resolves into a softer exposure"],
    ["The light stays", "Final line / emotional destination", "Land the meaning without forcing resolution", "Tender clarity, still unresolved", "The protagonist stands within the open sky as the warm source settles beside rather than behind her; her posture releases before her expression does.", "Intimate medium close-up", "Hold on breath, then fade through the warm practical"],
  ] as const;

  return {
    scenes: Array.from({ length: count }, (_, index) => {
      const template = beatTemplates[Math.min(index, beatTemplates.length - 1)];
      return {
        id: `scene-${String(index + 1).padStart(2, "0")}`,
        position: index + 1,
        storyBeat: template[0],
        sourceReference: template[1],
        narrativePurpose: template[2],
        emotionalIntention: template[3],
        visualDescription: template[4],
        shotType: template[5],
        durationSeconds: Math.max(4, Math.round(input.targetRuntimeSeconds / count)),
        transitionIdea: template[6],
      };
    }),
  };
}

export function demoRegeneratedScene(scene: SceneValues, creatorNote: string): SceneValues {
  const cleanNote = creatorNote.replace(/[.!?]+$/, "");
  return {
    ...scene,
    visualDescription: `${scene.visualDescription} Reframe the moment with stronger foreground depth and one precise symbolic detail${cleanNote ? `; creator direction: ${cleanNote}` : ""}.`,
    shotType: scene.shotType.includes("alternate") ? scene.shotType : `${scene.shotType} · alternate framing`,
    transitionIdea: `Refined transition: ${scene.transitionIdea}`,
  };
}

export function demoImagePrompts(
  input: StoryInputValues,
  brief: CreativeBriefValues,
  scenes: SceneValues[],
): { prompts: ImagePromptValues[] } {
  const character = input.characterDescription || "the implied protagonist, shown consistently through silhouette and point of view";
  return {
    prompts: scenes.map((scene) => ({
      id: `prompt-${scene.id}`,
      sceneId: scene.id,
      detailedPrompt: `${scene.visualDescription} Subject: ${character}. Environment and action should express “${scene.storyBeat}” without literal over-explanation. Composition: ${scene.shotType}, intentional negative space, layered foreground depth, cinematic visual hierarchy. Expression and body language: ${scene.emotionalIntention.toLowerCase()}, communicated through gaze, posture, and hand tension. Lighting: motivated amber practical light with soft falloff through mineral-blue and near-black violet shadow. Color and atmosphere: tactile, intimate, suspended, quietly celestial. Style: ${input.visualVibe}, subtle 35mm grain, weathered surfaces, natural skin texture, controlled depth of field. Frame for ${input.aspectRatio}. Character continuity: preserve age, facial structure, dark wavy hair, charcoal wardrobe, silhouette, and the evolving warm-light motif across the sequence.`,
      shortPrompt: `${scene.storyBeat}: ${scene.visualDescription} ${scene.shotType}, ${input.visualVibe}, amber and mineral-blue light, tactile 35mm texture, ${input.aspectRatio}, consistent character and wardrobe.`,
      alternateFraming: `Alternate: shift to a low, intimate foreground-obstructed ${scene.shotType.toLowerCase()} with the symbolic light source just outside the character's eyeline; preserve the same beat and ${input.aspectRatio} frame.`,
      negativeInstructions: "No extra people, duplicate limbs, changed face or wardrobe, plastic skin, floating props, illegible anatomy, text, logos, watermarks, oversaturated neon, generic fantasy spectacle, or conflicting light direction.",
      aspectRatio: input.aspectRatio,
      consistencyAnchors: [
        character,
        ...brief.consistencyRequirements.slice(0, 4),
        `Use ${input.aspectRatio} framing throughout.`,
      ].slice(0, 8),
    })),
  };
}

export function demoRegeneratedImagePrompt(
  prompt: ImagePromptValues,
  scene: SceneValues,
  creatorNote: string,
): ImagePromptValues {
  const cleanNote = creatorNote.replace(/[.!?]+$/, "");
  return {
    ...prompt,
    detailedPrompt: `${prompt.detailedPrompt} Revised visual direction: use a bolder foreground silhouette, more asymmetrical negative space, and a single precise symbolic detail${cleanNote ? `; creator direction: ${cleanNote}` : ""}.`,
    shortPrompt: `${scene.storyBeat}, asymmetrical cinematic composition, bold foreground silhouette, restrained symbolic detail, ${prompt.aspectRatio}.`,
    alternateFraming: `Alternate: compress the scene through a reflective surface, keeping the emotional action legible and the ${prompt.aspectRatio} composition uncluttered.`,
  };
}

export function demoMotionPlan(
  scene: SceneValues,
  imagePrompt: ImagePromptValues,
  creatorMotionNotes: string,
): MotionPlanValues {
  const cleanNote = creatorMotionNotes.replace(/[.!?]+$/, "");
  const duration = Math.max(2, Math.min(10, scene.durationSeconds));
  return {
    id: `motion-${scene.id}`,
    sceneId: scene.id,
    intendedAction: `Let the visual action reveal ${scene.storyBeat.toLowerCase()} through one restrained, readable change rather than several competing events.`,
    cameraMovement: scene.shotType.toLowerCase().includes("wide")
      ? "A slow, nearly imperceptible push forward with stable horizon and no sudden acceleration."
      : "A controlled micro-dolly inward with subtle natural handheld breath, never drifting from the subject.",
    subjectMovement: `The subject begins nearly still, then completes one deliberate gesture that expresses ${scene.emotionalIntention.toLowerCase()}; movement remains anatomically grounded.`,
    environmentalMovement: "Low-amplitude atmospheric motion only: soft grass or fabric drift, delicate airborne particles, and gradual light movement with consistent wind direction.",
    facialExpressionDirection: "Preserve facial identity. Let the eyes register the change first, followed by a minimal release in jaw, brow, and breath—no exaggerated smile or sudden expression swap.",
    durationSeconds: duration,
    imageToVideoPrompt: `Animate this ${imagePrompt.aspectRatio} cinematic still for ${duration} seconds. ${scene.visualDescription} ${scene.emotionalIntention}. Begin with a short hold, then use one controlled camera move and one purposeful subject action. Maintain the exact face, body proportions, wardrobe, composition, lighting direction, texture, and background geometry of the source image. Add subtle environmental motion and realistic secondary movement only. End in a stable pose that supports: ${scene.transitionIdea}.${cleanNote ? ` Creator motion direction: ${cleanNote}.` : ""}`,
    negativeMotionInstructions: "No face morphing, identity drift, lip movement without dialogue, rubber limbs, extra fingers, body warping, sudden camera shake, zoom pulses, speed ramps, flicker, lighting changes, background melting, duplicated objects, random new subjects, excessive wind, or motion in every element.",
    transitionIntoNextShot: `${scene.transitionIdea} Finish the motion cleanly during the final half-second so the edit has a stable outgoing frame.`,
    suggestedModelCategory: scene.emotionalIntention.toLowerCase().includes("unease")
      ? "Controlled character performance / subtle atmospheric motion"
      : "Cinematic image-to-video / restrained camera motion",
  };
}
