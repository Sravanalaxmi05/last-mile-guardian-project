import type { Persona } from "../../data/personas";
import { OFFICIAL_SAFETY_RULES } from "../../data/officialSafetyRules";
import type { DecisionPacket } from "./schemas";

export const LIFE_SAFETY_RULES = `
You are Last-Mile Guardian, a life-safety assistant for flood emergencies.

Non-negotiable rules:
${OFFICIAL_SAFETY_RULES.map((rule) => `- ${rule}`).join("\n")}
`;

export function officialAlertExtractionPrompt(sourceType: "text" | "image"): string {
  return `
Extract official flood alert content from the provided ${sourceType} input.

Return JSON only:
{
  "source_type": "text" | "image",
  "is_official_alert": boolean,
  "extracted_alert_text": string,
  "location_mentioned": string,
  "time_window_mentioned": string,
  "official_authority_mentioned": string,
  "uncertainty_notes": string[]
}

Rules:
- source_type must be "${sourceType}".
- Extract only what is present.
- Do not invent locations, times, authorities, or severity.
- Omit optional fields when the input does not state them.
- If the input is not an official alert, set is_official_alert=false.
`;
}

export function decisionPacketPrompt(persona: Persona, alertText: string): string {
  return `
${LIFE_SAFETY_RULES}

Task: produce a vulnerability decision packet.

Official alert:
${alertText}

Persona:
- Name: ${persona.name}
- Age: ${persona.age}
- Description: ${persona.description}
- Conditions: ${persona.conditions.join(", ")}
- Floor: ${persona.floor}
- Can evacuate alone: ${persona.canEvacuateAlone}
- Language preference: ${persona.languagePreference}
- Internet connection: ${persona.internetStrength}

Return JSON only:
{
  "risk_level": "low" | "medium" | "high" | "critical",
  "recommended_strategy": "shelter_in_place" | "prepare_to_evacuate" | "call_for_assisted_evacuation" | "follow_official_evacuation_order",
  "should_call_for_help_now": boolean,
  "needs_assisted_evacuation": boolean,
  "medical_continuity_risk": boolean,
  "mobility_risk": boolean,
  "child_safety_risk": boolean,
  "connectivity_risk": boolean,
  "unsafe_movement_risk": boolean,
  "official_alert_facts_used": string[],
  "persona_facts_used": string[],
  "assumptions": string[],
  "prohibited_claims_avoided": string[]
}

Consistency rules:
- If needs_assisted_evacuation=true, should_call_for_help_now must also be true.
- If recommended_strategy="call_for_assisted_evacuation", needs_assisted_evacuation must be true and should_call_for_help_now must be true.
`;
}

export function actionCardsPrompt(
  persona: Persona,
  alertText: string,
  packet: DecisionPacket
): string {
  return `
${LIFE_SAFETY_RULES}

Task: generate channel-specific survival action cards.

Official alert:
${alertText}

Persona:
- Name: ${persona.name}
- Age: ${persona.age}
- Description: ${persona.description}
- Conditions: ${persona.conditions.join(", ")}
- Floor: ${persona.floor}
- Can evacuate alone: ${persona.canEvacuateAlone}
- Language preference: ${persona.languagePreference}
- Internet connection: ${persona.internetStrength}

Validated decision packet:
${JSON.stringify(packet, null, 2)}

Return JSON only:
{
  "risk_summary": "2-3 sentence risk assessment specific to this person",
  "first_action": "single most important immediate action",
  "why_this_action": "why this action fits this person",
  "next_3_steps": ["step 1", "step 2", "step 3"],
  "must_take": ["item 1", "item 2", "item 3"],
  "do_not_do": ["warning 1", "warning 2", "warning 3", "warning 4"],
  "battery_saving_tip": "one specific phone battery instruction",
  "rumor_safety_note": "one warning about misinformation",
  "sms_card": "140 characters or fewer",
  "ivr_script": "Hindi Devanagari followed by Romanized Hindi",
  "whatsapp_family_card": "family status and plan message",
  "volunteer_rescue_card": "handoff for rescue volunteers",
  "offline_checklist": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "reasoning_summary": "brief explanation of personalization"
}

Channel rules:
- sms_card must be 140 characters or fewer so it remains below the enforced 160-character SMS limit.
- Never use the phrase "real-time"; refer users to "official updates" instead.
`;
}
