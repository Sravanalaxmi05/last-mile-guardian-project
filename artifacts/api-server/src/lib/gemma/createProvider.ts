import { getGemmaConfig, assertValidGemma4Config } from "../../config/gemmaConfig";
import type { GemmaProvider } from "./provider";
import { GoogleAIGemmaProvider } from "./googleProvider";
import { OpenAICompatibleGemmaProvider } from "./openAICompatibleProvider";

export function createGemmaProvider(apiKeyFromRequest?: string): GemmaProvider {
  const config = getGemmaConfig(apiKeyFromRequest);
  assertValidGemma4Config(config);

  if (!config.apiKey) {
    throw new Error("Missing Gemma API key");
  }

  if (config.provider === "google-ai") {
    return new GoogleAIGemmaProvider(config.apiKey, config.modelId);
  }

  if (!config.baseUrl) {
    throw new Error("Missing GEMMA_BASE_URL");
  }

  return new OpenAICompatibleGemmaProvider(config.apiKey, config.modelId, config.baseUrl);
}
