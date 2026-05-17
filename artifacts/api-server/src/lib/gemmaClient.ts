import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";
import type { Persona } from "../data/personas";
import type { ActionCards } from "./demoCards";

const ENV_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY;

export function isGemmaAvailable(apiKey?: string): boolean {
  return !!(apiKey || ENV_API_KEY);
}

const UNSAFE_PHRASES = [
  "route is safe",
  "guaranteed rescue",
  "predict flood",
  "walk through floodwater",
  "safe to cross",
  "crossing is safe",
  "safe route",
  "flood prediction",
];

export function containsUnsafeContent(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of UNSAFE_PHRASES) {
    if (lower.includes(phrase)) {
      return phrase;
    }
  }
  return null;
}

export function validateActionCards(cards: ActionCards): string | null {
  const allText = [
    cards.first_action,
    cards.why_this_action,
    cards.risk_summary,
    cards.sms_card,
    cards.ivr_script,
    cards.whatsapp_family_card,
    cards.volunteer_rescue_card,
    ...cards.next_3_steps,
    ...cards.must_take,
    ...cards.do_not_do,
    ...cards.offline_checklist,
  ].join(" ");

  return containsUnsafeContent(allText);
}

const SYSTEM_PROMPT = `You are Last-Mile Guardian, a life-safety AI assistant for flood emergencies.

Your ONLY job: convert an official flood alert into a personalized, structured survival action plan for a specific vulnerable person.

ABSOLUTE SAFETY RULES — NEVER VIOLATE ANY OF THESE:
- Do NOT replace or contradict official authorities
- Do NOT predict flood severity beyond what the official alert states
- Do NOT guarantee rescue or claim rescue is coming
- Do NOT claim any route is safe
- Do NOT tell users to walk through floodwater
- Do NOT rely on forwarded rumors or unverified information
- ALWAYS recommend following official authority guidance
- NEVER claim you have real-time information
- Give short, calm, actionable instructions only

Your output MUST be valid JSON. No markdown, no code fences, just the JSON object.`;

const OUTPUT_SCHEMA = `{
  "risk_summary": "2-3 sentence risk assessment specific to this person",
  "first_action": "Single most important immediate action — specific, short, actionable",
  "why_this_action": "One sentence: why this specific action for this specific person",
  "next_3_steps": ["step 1", "step 2", "step 3"],
  "must_take": ["item 1", "item 2", "item 3", "item 4"],
  "do_not_do": ["warning 1", "warning 2", "warning 3", "warning 4"],
  "battery_saving_tip": "One specific tip for preserving phone battery",
  "rumor_safety_note": "One sentence warning about misinformation",
  "sms_card": "Short SMS under 160 chars for rescue services or family",
  "ivr_script": "Hindi Devanagari script followed by newline then Romanized Hindi",
  "whatsapp_family_card": "A message to send to family about current status and plan",
  "volunteer_rescue_card": "Information card for volunteer rescue workers: priority, needs, location",
  "offline_checklist": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "gemma_reasoning_summary": "2-3 sentences explaining your personalization reasoning"
}`;

export async function generateWithGemma(
  persona: Persona,
  alertText: string,
  apiKey?: string
): Promise<ActionCards> {
  const key = apiKey || ENV_API_KEY;
  if (!key) {
    throw new Error("No API key available");
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

  const prompt = `${SYSTEM_PROMPT}

OFFICIAL FLOOD ALERT:
${alertText}

VULNERABLE PERSON PROFILE:
Name: ${persona.name}
Age: ${persona.age}
Description: ${persona.description}
Medical/Physical Conditions: ${persona.conditions.join(", ")}
Floor: ${persona.floor}
Can Evacuate Alone: ${persona.canEvacuateAlone ? "Yes" : "No"}
Language Preference: ${persona.languagePreference}
Internet Connection: ${persona.internetStrength}

Generate a personalized survival action plan for ${persona.name}.

Return ONLY a valid JSON object matching this exact schema (no markdown, no code fences):
${OUTPUT_SCHEMA}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON found in model response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as ActionCards;
  return parsed;
}
