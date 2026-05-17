export type GemmaProviderKind = "google-ai" | "openai-compatible";

export interface GemmaConfig {
  provider: GemmaProviderKind;
  modelId: string;
  apiKey?: string;
  baseUrl?: string;
  demoModeEnabled: boolean;
  requireGemma4: boolean;
}

export function isGemma4ModelId(modelId: string): boolean {
  return /gemma[-_\/]?4/i.test(modelId);
}

export function getGemmaConfig(apiKeyFromRequest?: string): GemmaConfig {
  const modelId = process.env.GEMMA_MODEL_ID || "";
  const provider = (process.env.GEMMA_PROVIDER || "google-ai") as GemmaProviderKind;

  const apiKey =
    apiKeyFromRequest ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMMA_API_KEY ||
    process.env.GEMMA_OPENAI_COMPAT_API_KEY;

  return {
    provider,
    modelId,
    apiKey,
    baseUrl: process.env.GEMMA_BASE_URL,
    demoModeEnabled: process.env.ENABLE_DEMO_MODE !== "false",
    requireGemma4: process.env.REQUIRE_GEMMA4 !== "false",
  };
}

export function assertValidGemma4Config(config: GemmaConfig): void {
  if (config.provider !== "google-ai" && config.provider !== "openai-compatible") {
    throw new Error(`Unsupported GEMMA_PROVIDER: ${config.provider}.`);
  }

  if (!config.modelId) {
    throw new Error(
      "GEMMA_MODEL_ID is required. Set it to the exact Gemma 4 model ID provided by the hackathon or model host."
    );
  }

  if (config.requireGemma4 && !isGemma4ModelId(config.modelId)) {
    throw new Error(
      `Configured model is not Gemma 4: ${config.modelId}. Refusing to run live mode.`
    );
  }

  if (!config.apiKey) {
    throw new Error("No API key available for live Gemma 4 mode.");
  }

  if (config.provider === "openai-compatible" && !config.baseUrl) {
    throw new Error("GEMMA_BASE_URL is required for openai-compatible provider.");
  }
}
