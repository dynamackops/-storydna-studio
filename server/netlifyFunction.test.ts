import { afterEach, describe, expect, it } from "vitest";
import { analysisResponseSchema } from "../shared/schemas";
import storyApi from "../netlify/functions/story.mts";

const previousKey = process.env.OPENAI_API_KEY;
const previousModel = process.env.OPENAI_MODEL;

afterEach(() => {
  if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
  else process.env.OPENAI_API_KEY = previousKey;
  if (previousModel === undefined) delete process.env.OPENAI_MODEL;
  else process.env.OPENAI_MODEL = previousModel;
});

describe("Netlify story function", () => {
  it("reports guided-demo status without exposing a key", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.OPENAI_MODEL = "deployment-test-model";
    const response = await storyApi(new Request("https://storydna.example/api/story/status"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ configured: false, model: "deployment-test-model" });
  });

  it("resolves the GPT-5.6 alias to the explicit flagship model slug", async () => {
    delete process.env.OPENAI_API_KEY;
    process.env.OPENAI_MODEL = "gpt-5.6";
    const response = await storyApi(new Request("https://storydna.example/api/story/status"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ configured: false, model: "gpt-5.6-sol" });
  });

  it("serves a validated StoryDNA response through the production route", async () => {
    delete process.env.OPENAI_API_KEY;
    const response = await storyApi(new Request("https://storydna.example/api/story/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "The Door",
        sourceType: "poem",
        sourceText: "A long enough source passage follows a quiet traveler toward a door filled with morning light.",
        visualVibe: "tactile magical realism",
        characterDescription: "",
        aspectRatio: "16:9",
        targetRuntimeSeconds: 60,
        preferredTools: "",
      }),
    }));
    expect(response.status).toBe(200);
    expect(analysisResponseSchema.parse(await response.json()).meta.demoMode).toBe(true);
  });
});
