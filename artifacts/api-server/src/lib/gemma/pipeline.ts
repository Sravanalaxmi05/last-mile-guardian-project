import type { Persona } from "../../data/personas";
import { getGemmaConfig } from "../../config/gemmaConfig";
import { getDemoCards } from "../demoCards";
import { createGemmaProvider } from "./createProvider";
import type { GemmaProvider } from "./provider";
import {
  ActionCardsSchema,
  DecisionPacketSchema,
  OfficialAlertSchema,
  type ActionCards,
  type DecisionPacket,
  type OfficialAlert,
  type GemmaRunMetadata,
} from "./schemas";
import {
  actionCardsPrompt,
  decisionPacketPrompt,
  officialAlertExtractionPrompt,
} from "./prompts";
import {
  validateActionCardSafety,
  validateDecisionPacketSafety,
} from "./safetyValidator";
import { nowIso, sha256 } from "./metadata";
import { getErrorMessage } from "./errors";

export function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const candidates: unknown[] = [];
    let start = -1;
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = 0; index < trimmed.length; index += 1) {
      const character = trimmed[index]!;

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }

        if (character === "\\") {
          escaped = true;
          continue;
        }

        if (character === "\"") {
          inString = false;
        }

        continue;
      }

      if (character === "\"") {
        inString = true;
        continue;
      }

      if (character === "{") {
        if (depth === 0) {
          start = index;
        }

        depth += 1;
        continue;
      }

      if (character === "}" && depth > 0) {
        depth -= 1;

        if (depth === 0 && start >= 0) {
          const candidate = trimmed.slice(start, index + 1);

          try {
            candidates.push(JSON.parse(candidate));
          } catch {
            // Keep searching; model thoughts may contain non-JSON braces.
          }

          start = -1;
        }
      }
    }

    const lastCandidate = candidates.at(-1);

    if (lastCandidate === undefined) {
      throw new Error("Model response did not contain a JSON object.");
    }

    return lastCandidate;
  }
}

export interface RunGemmaPipelineInput {
  persona: Persona;
  alertText?: string;
  alertImageBase64?: string;
  alertImageMimeType?: string;
  apiKey?: string;
  provider?: GemmaProvider;
}

export interface RunGemmaPipelineResult {
  mode: "gemma4" | "demo";
  alert: OfficialAlert;
  decisionPacket?: DecisionPacket;
  cards: ActionCards;
  safety: {
    passed: boolean;
    errors: string[];
    warnings: string[];
  };
  metadata: GemmaRunMetadata;
  warning?: string;
}

export async function runGemma4Pipeline(
  input: RunGemmaPipelineInput
): Promise<RunGemmaPipelineResult> {
  const started = Date.now();
  const stages: GemmaRunMetadata["stages"] = [];
  const config = getGemmaConfig(input.apiKey);
  let lastOfficialAlert: OfficialAlert | undefined;

  try {
    const provider = input.provider ?? createGemmaProvider(input.apiKey);
    const sourceType = input.alertImageBase64 ? "image" : "text";
    const alertPrompt = officialAlertExtractionPrompt(sourceType);
    const alertStageStarted = Date.now();

    const alertParts = input.alertImageBase64
      ? [
          {
            type: "image" as const,
            mimeType: input.alertImageMimeType || "image/png",
            base64: input.alertImageBase64,
          },
          { type: "text" as const, text: alertPrompt },
        ]
      : [
          {
            type: "text" as const,
            text: `Official alert input text:\n${input.alertText || ""}`,
          },
          { type: "text" as const, text: alertPrompt },
        ];

    const alertResult = await provider.generate(alertParts, {
      temperature: 0,
      responseMimeType: "application/json",
      maxOutputTokens: 1200,
    });

    const officialAlert = OfficialAlertSchema.parse(parseJsonObject(alertResult.text));
    lastOfficialAlert = officialAlert;

    stages.push({
      name: sourceType === "image" ? "official_alert_image_extraction" : "official_alert_text_extraction",
      model: provider.modelId,
      latencyMs: Date.now() - alertStageStarted,
      outputHash: sha256(officialAlert),
    });

    if (!officialAlert.is_official_alert) {
      throw new Error("Input was not recognized as an official alert.");
    }

    const packetStarted = Date.now();
    const packetPrompt = decisionPacketPrompt(
      input.persona,
      officialAlert.extracted_alert_text
    );

    const packetResult = await provider.generate(
      [{ type: "text", text: packetPrompt }],
      { temperature: 0.1, responseMimeType: "application/json", maxOutputTokens: 1600 }
    );

    const decisionPacket = DecisionPacketSchema.parse(parseJsonObject(packetResult.text));
    const packetErrors = validateDecisionPacketSafety(decisionPacket);

    stages.push({
      name: "vulnerability_decision_packet",
      model: provider.modelId,
      latencyMs: Date.now() - packetStarted,
      outputHash: sha256(decisionPacket),
    });

    if (packetErrors.length > 0) {
      throw new Error(`Decision packet failed safety validation: ${packetErrors.join("; ")}`);
    }

    const cardsStarted = Date.now();
    const cardsPrompt = actionCardsPrompt(
      input.persona,
      officialAlert.extracted_alert_text,
      decisionPacket
    );

    const cardsResult = await provider.generate(
      [{ type: "text", text: cardsPrompt }],
      { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: 3000 }
    );

    const cards = ActionCardsSchema.parse(parseJsonObject(cardsResult.text));
    const cardErrors = validateActionCardSafety(cards);

    stages.push({
      name: "channel_action_cards",
      model: provider.modelId,
      latencyMs: Date.now() - cardsStarted,
      outputHash: sha256(cards),
    });

    if (cardErrors.length > 0) {
      throw new Error(`Action cards failed safety validation: ${cardErrors.join("; ")}`);
    }

    return {
      mode: "gemma4",
      alert: officialAlert,
      decisionPacket,
      cards,
      safety: {
        passed: true,
        errors: [],
        warnings: [],
      },
      metadata: {
        provider: config.provider,
        model: provider.modelId,
        live: true,
        fallbackUsed: false,
        generatedAt: nowIso(),
        latencyMs: Date.now() - started,
        promptHash: sha256({ alertPrompt, packetPrompt, cardsPrompt }),
        outputHash: sha256(cards),
        stages,
      },
    };
  } catch (error) {
    if (!config.demoModeEnabled) {
      throw error;
    }

    const fallbackCards = ActionCardsSchema.parse(getDemoCards(input.persona, input.alertText || ""));
    const fallbackErrors = validateActionCardSafety(fallbackCards);
    const fallbackReason = getErrorMessage(error);

    return {
      mode: "demo",
      alert: lastOfficialAlert ?? {
        source_type: input.alertImageBase64 ? "image" : "text",
        is_official_alert: Boolean(input.alertText),
        extracted_alert_text: input.alertText || "Live alert extraction unavailable during fallback.",
        uncertainty_notes: input.alertImageBase64
          ? ["Live image extraction did not complete before fallback."]
          : [],
      },
      cards: fallbackCards,
      safety: {
        passed: fallbackErrors.length === 0,
        errors: fallbackErrors,
        warnings: ["Live Gemma 4 pipeline failed; deterministic fallback used."],
      },
      warning: fallbackReason,
      metadata: {
        provider: config.provider,
        model: config.modelId || "not_configured",
        live: false,
        fallbackUsed: true,
        fallbackReason,
        generatedAt: nowIso(),
        latencyMs: Date.now() - started,
        promptHash: sha256({
          persona: input.persona,
          alertText: input.alertText,
          alertImageHash: input.alertImageBase64 ? sha256(input.alertImageBase64) : undefined,
          alertImageMimeType: input.alertImageMimeType,
        }),
        outputHash: sha256(fallbackCards),
        stages,
      },
    };
  }
}
