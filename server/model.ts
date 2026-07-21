export const DEFAULT_OPENAI_MODEL = "gpt-5.6-sol";

/**
 * The public `gpt-5.6` alias normally routes to `gpt-5.6-sol`, but the
 * production provider resolver rejected the alias during deployment testing.
 * Resolve it explicitly while keeping other configured model IDs untouched.
 */
export function resolveOpenAIModel(configuredModel?: string) {
  const model = configuredModel?.trim();
  if (!model || model === "gpt-5.6") return DEFAULT_OPENAI_MODEL;
  return model;
}
