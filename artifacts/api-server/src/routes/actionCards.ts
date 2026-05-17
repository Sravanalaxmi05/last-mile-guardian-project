import { Router } from "express";
import { z } from "zod";
import { getPersonaById, personas } from "../data/personas";
import { getErrorMessage } from "../lib/gemma/errors";
import { runGemma4Pipeline } from "../lib/gemma/pipeline";

const router = Router();

const ActionCardRequestSchema = z.object({
  alertText: z.string().min(1),
  personaId: z.string().min(1),
  apiKey: z.string().optional(),
});

const ImageActionCardRequestSchema = z.object({
  imageBase64: z.string().min(1),
  mimeType: z.string().min(1).default("image/png"),
  personaId: z.string().min(1),
  apiKey: z.string().optional(),
});

const CompareRequestSchema = z.object({
  alertText: z.string().min(1),
  apiKey: z.string().optional(),
});

async function resolveCards(
  persona: NonNullable<ReturnType<typeof getPersonaById>>,
  alertText: string,
  apiKey: string | undefined
) {
  return runGemma4Pipeline({
    persona,
    alertText,
    apiKey,
  });
}

router.post("/action-cards", async (req, res) => {
  const parsed = ActionCardRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "alertText and personaId are required" });
    return;
  }

  const { alertText, personaId, apiKey } = parsed.data;
  const persona = getPersonaById(personaId);

  if (!persona) {
    res.status(400).json({ error: `Unknown persona: ${personaId}` });
    return;
  }

  try {
    const result = await resolveCards(persona, alertText, apiKey);

    res.json({
      persona,
      ...result,
    });
  } catch (error) {
    req.log.error({ error }, "Strict Gemma 4 pipeline failed");
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

router.post("/action-cards/from-image", async (req, res) => {
  const parsed = ImageActionCardRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "imageBase64, mimeType, and personaId are required" });
    return;
  }

  const { imageBase64, mimeType, personaId, apiKey } = parsed.data;
  const persona = getPersonaById(personaId);

  if (!persona) {
    res.status(400).json({ error: `Unknown persona: ${personaId}` });
    return;
  }

  try {
    const result = await runGemma4Pipeline({
      persona,
      alertImageBase64: imageBase64,
      alertImageMimeType: mimeType,
      apiKey,
    });

    res.json({
      persona,
      ...result,
    });
  } catch (error) {
    req.log.error({ error }, "Strict Gemma 4 image pipeline failed");
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

router.post("/action-cards/compare", async (req, res) => {
  const parsed = CompareRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "alertText is required" });
    return;
  }

  const { alertText, apiKey } = parsed.data;

  try {
    const results = await Promise.all(
      personas.map(async (persona) => {
        const result = await resolveCards(persona, alertText, apiKey);

        return {
          persona,
          ...result,
        };
      })
    );

    res.json(results);
  } catch (error) {
    req.log.error({ error }, "Strict Gemma 4 comparison pipeline failed");
    res.status(500).json({ error: getErrorMessage(error) });
  }
});

export default router;
