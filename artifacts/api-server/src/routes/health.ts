import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import {
  assertValidGemma4Config,
  getGemmaConfig,
  isGemma4ModelId,
} from "../config/gemmaConfig";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/gemma-status", (_req, res) => {
  const config = getGemmaConfig();
  let configured = true;

  try {
    assertValidGemma4Config(config);
  } catch {
    configured = false;
  }

  res.json({
    configured,
    provider: config.provider,
    model: config.modelId || "not_configured",
    isGemma4: isGemma4ModelId(config.modelId),
    demoModeEnabled: config.demoModeEnabled,
    hasApiKey: Boolean(config.apiKey),
  });
});

export default router;
