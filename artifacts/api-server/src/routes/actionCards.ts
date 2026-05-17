import { Router } from "express";
import { z } from "zod";
import { getPersonaById, personas } from "../data/personas";
import { getDemoCards } from "../lib/demoCards";
import { generateWithGemma, isGemmaAvailable, validateActionCards } from "../lib/gemmaClient";

const router = Router();

const ActionCardRequestSchema = z.object({
  alertText: z.string().min(1),
  personaId: z.string().min(1),
  apiKey: z.string().optional(),
});

const CompareRequestSchema = z.object({
  alertText: z.string().min(1),
  apiKey: z.string().optional(),
});

async function resolveCards(
  persona: Parameters<typeof getPersonaById>[0] extends undefined ? never : NonNullable<ReturnType<typeof getPersonaById>>,
  alertText: string,
  apiKey: string | undefined,
  log: (msg: string) => void
): Promise<{ cards: ReturnType<typeof getDemoCards>; mode: string; warning?: string }> {
  if (isGemmaAvailable(apiKey)) {
    try {
      const cards = await generateWithGemma(persona, alertText, apiKey);
      const unsafePhrase = validateActionCards(cards);
      if (unsafePhrase) {
        log(`Unsafe phrase detected in Gemma output: "${unsafePhrase}" — falling back to demo`);
        return {
          cards: getDemoCards(persona, alertText),
          mode: "demo",
          warning: `Live Gemma mode produced an unsafe phrase ("${unsafePhrase}"). Falling back to safe demo outputs.`,
        };
      }
      return { cards, mode: "gemma" };
    } catch (err) {
      log(`Gemma failed — falling back to demo: ${String(err)}`);
      return {
        cards: getDemoCards(persona, alertText),
        mode: "demo",
        warning: "Live Gemma mode failed. Falling back to safe demo outputs.",
      };
    }
  }

  return { cards: getDemoCards(persona, alertText), mode: "demo" };
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

  const { cards, mode, warning } = await resolveCards(
    persona,
    alertText,
    apiKey,
    (msg) => req.log.warn(msg)
  );

  res.json({ persona, cards, mode, ...(warning ? { warning } : {}) });
});

router.post("/action-cards/compare", async (req, res) => {
  const parsed = CompareRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "alertText is required" });
    return;
  }

  const { alertText, apiKey } = parsed.data;

  const results = await Promise.all(
    personas.map(async (persona) => {
      const { cards, mode, warning } = await resolveCards(
        persona,
        alertText,
        apiKey,
        (msg) => req.log.warn({ personaId: persona.id }, msg)
      );
      return { persona, cards, mode, ...(warning ? { warning } : {}) };
    })
  );

  res.json(results);
});

export default router;
