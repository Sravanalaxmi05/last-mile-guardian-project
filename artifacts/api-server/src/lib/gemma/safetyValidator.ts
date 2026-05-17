import type { ActionCards, DecisionPacket } from "./schemas";

const BANNED_PATTERNS: Array<{
  pattern: RegExp;
  message: string;
  allowWhenNegated?: boolean;
}> = [
  { pattern: /\bsafe\s+route\b/i, message: "Claims a safe route." },
  { pattern: /\broute\s+is\s+safe\b/i, message: "Claims a route is safe." },
  { pattern: /\bsafe\s+to\s+cross\b/i, message: "Claims floodwater is safe to cross." },
  {
    pattern: /\bwalk\s+through\s+floodwater\b/i,
    message: "Tells user to walk through floodwater.",
    allowWhenNegated: true,
  },
  {
    pattern: /\bcross\s+(the\s+)?floodwater\b/i,
    message: "Tells user to cross floodwater.",
    allowWhenNegated: true,
  },
  { pattern: /\bguaranteed\s+rescue\b/i, message: "Guarantees rescue." },
  { pattern: /\brescue\s+(is|will be)\s+coming\b/i, message: "Claims rescue is coming." },
  { pattern: /\bpredict(s|ed|ing)?\s+flood\b/i, message: "Claims to predict flood severity." },
  { pattern: /\breal[- ]time\b/i, message: "Claims real-time awareness." },
];

function isNegatedInstruction(text: string, matchIndex: number): boolean {
  const priorText = text.slice(0, matchIndex);
  const currentStringStart = priorText.lastIndexOf("\"");
  const priorContext = priorText.slice(currentStringStart + 1);

  return /\b(do not|don't|never|avoid|must not|should not|not attempt to)\b/i.test(
    priorContext
  );
}

export function validateActionCardSafety(cards: ActionCards): string[] {
  const errors: string[] = [];
  const text = JSON.stringify(cards);

  for (const rule of BANNED_PATTERNS) {
    const match = rule.pattern.exec(text);

    if (
      match &&
      (!rule.allowWhenNegated || !isNegatedInstruction(text, match.index))
    ) {
      errors.push(rule.message);
    }
  }

  if (cards.sms_card.length > 160) {
    errors.push("SMS card exceeds 160 characters.");
  }

  const lower = text.toLowerCase();

  if (!lower.includes("official")) {
    errors.push("Output must refer users back to official guidance.");
  }

  if (!lower.includes("floodwater") && !lower.includes("flood water")) {
    errors.push("Output should explicitly warn about floodwater risk.");
  }

  return errors;
}

export function validateDecisionPacketSafety(packet: DecisionPacket): string[] {
  const errors: string[] = [];

  if (packet.needs_assisted_evacuation && !packet.should_call_for_help_now) {
    errors.push("Assisted evacuation case must recommend calling for help now.");
  }

  if (
    packet.recommended_strategy === "call_for_assisted_evacuation" &&
    !packet.needs_assisted_evacuation
  ) {
    errors.push("Assisted evacuation strategy requires needs_assisted_evacuation=true.");
  }

  if (packet.official_alert_facts_used.length === 0) {
    errors.push("Decision packet must cite at least one fact from the official alert.");
  }

  if (packet.persona_facts_used.length === 0) {
    errors.push("Decision packet must cite at least one fact from the persona.");
  }

  return errors;
}
