import { z } from "zod";

export const OfficialAlertSchema = z.object({
  source_type: z.enum(["text", "image"]),
  is_official_alert: z.boolean(),
  extracted_alert_text: z.string().min(1),
  location_mentioned: z.string().optional(),
  time_window_mentioned: z.string().optional(),
  official_authority_mentioned: z.string().optional(),
  uncertainty_notes: z.array(z.string()).default([]),
});

export type OfficialAlert = z.infer<typeof OfficialAlertSchema>;

export const DecisionPacketSchema = z.object({
  risk_level: z.enum(["low", "medium", "high", "critical"]),
  recommended_strategy: z.enum([
    "shelter_in_place",
    "prepare_to_evacuate",
    "call_for_assisted_evacuation",
    "follow_official_evacuation_order",
  ]),
  should_call_for_help_now: z.boolean(),
  needs_assisted_evacuation: z.boolean(),
  medical_continuity_risk: z.boolean(),
  mobility_risk: z.boolean(),
  child_safety_risk: z.boolean(),
  connectivity_risk: z.boolean(),
  unsafe_movement_risk: z.boolean(),
  official_alert_facts_used: z.array(z.string()).min(1),
  persona_facts_used: z.array(z.string()).min(1),
  assumptions: z.array(z.string()).default([]),
  prohibited_claims_avoided: z.array(z.string()).min(1),
});

export type DecisionPacket = z.infer<typeof DecisionPacketSchema>;

export const ActionCardsSchema = z.object({
  risk_summary: z.string().min(20),
  first_action: z.string().min(10),
  why_this_action: z.string().min(10),
  next_3_steps: z.array(z.string().min(5)).length(3),
  must_take: z.array(z.string().min(2)).min(3).max(8),
  do_not_do: z.array(z.string().min(5)).min(4).max(8),
  battery_saving_tip: z.string().min(10),
  rumor_safety_note: z.string().min(10),
  sms_card: z.string().min(10).max(160),
  ivr_script: z.string().min(20),
  whatsapp_family_card: z.string().min(20),
  volunteer_rescue_card: z.string().min(20),
  offline_checklist: z.array(z.string().min(5)).min(5).max(12),
  reasoning_summary: z.string().min(20),
});

export type ActionCards = z.infer<typeof ActionCardsSchema>;

export const SafetyValidationSchema = z.object({
  passed: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});

export type SafetyValidation = z.infer<typeof SafetyValidationSchema>;

export const GemmaRunMetadataSchema = z.object({
  provider: z.string(),
  model: z.string(),
  live: z.boolean(),
  fallbackUsed: z.boolean(),
  fallbackReason: z.string().optional(),
  generatedAt: z.string(),
  latencyMs: z.number(),
  promptHash: z.string(),
  outputHash: z.string(),
  stages: z.array(
    z.object({
      name: z.string(),
      model: z.string(),
      latencyMs: z.number(),
      outputHash: z.string(),
    })
  ),
});

export type GemmaRunMetadata = z.infer<typeof GemmaRunMetadataSchema>;
