import { describe, expect, it } from "vitest";
import { DEFAULT_OPENAI_MODEL, resolveOpenAIModel } from "./model";

describe("OpenAI model configuration", () => {
  it("uses the explicit GPT-5.6 flagship slug by default and for the public alias", () => {
    expect(resolveOpenAIModel()).toBe(DEFAULT_OPENAI_MODEL);
    expect(resolveOpenAIModel("gpt-5.6")).toBe("gpt-5.6-sol");
    expect(resolveOpenAIModel("  gpt-5.6  ")).toBe("gpt-5.6-sol");
  });

  it("preserves another explicitly configured model", () => {
    expect(resolveOpenAIModel("custom-model-id")).toBe("custom-model-id");
  });
});
