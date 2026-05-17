import { afterEach, describe, expect, it } from "vitest";
import { personas } from "../data/personas";
import type { GemmaProvider } from "../lib/gemma/provider";
import { parseJsonObject, runGemma4Pipeline } from "../lib/gemma/pipeline";

const persona = personas[0]!;
const officialAlert = {
  source_type: "text",
  is_official_alert: true,
  extracted_alert_text: "Official Flood Warning: Follow official guidance and avoid floodwater.",
  uncertainty_notes: [],
};
const decisionPacket = {
  risk_level: "high",
  recommended_strategy: "call_for_assisted_evacuation",
  should_call_for_help_now: true,
  needs_assisted_evacuation: true,
  medical_continuity_risk: true,
  mobility_risk: true,
  child_safety_risk: false,
  connectivity_risk: true,
  unsafe_movement_risk: true,
  official_alert_facts_used: ["Avoid floodwater"],
  persona_facts_used: ["Limited mobility"],
  assumptions: [],
  prohibited_claims_avoided: ["No safe route claims"],
};
const cards = {
  risk_summary: "Official alert indicates flood risk. Follow official guidance and avoid floodwater.",
  first_action: "Move to a higher indoor area and call for help now.",
  why_this_action: "This fits the person's mobility and medical vulnerability.",
  next_3_steps: ["Pack medicines", "Charge phone", "Contact family"],
  must_take: ["Phone", "Water", "ID"],
  do_not_do: ["Do not enter floodwater", "Do not trust rumors", "Do not touch switches near water", "Do not delay calling for help"],
  battery_saving_tip: "Lower brightness and use low power mode.",
  rumor_safety_note: "Trust official updates only.",
  sms_card: "Need help. Flood alert. Location: [address].",
  ivr_script: "ऊपर रहें। Upar rahein and follow official guidance.",
  whatsapp_family_card: "I am staying indoors and following official guidance.",
  volunteer_rescue_card: "Person may need assistance. Confirm location and needs.",
  offline_checklist: ["Pack medicine", "Charge phone", "Keep ID", "Avoid floodwater", "Follow official guidance"],
  reasoning_summary: "Guidance is based on official alert and persona constraints.",
};

class FakeProvider implements GemmaProvider {
  public readonly modelId = "gemma-4-test";
  private callCount = 0;

  async generate() {
    this.callCount += 1;
    const outputs = [officialAlert, decisionPacket, cards];
    return { text: JSON.stringify(outputs[this.callCount - 1]) };
  }
}

afterEach(() => {
  delete process.env.ENABLE_DEMO_MODE;
});

describe("runGemma4Pipeline", () => {
  it("parses JSON wrapped in prose", () => {
    expect(parseJsonObject(`Here is JSON: ${JSON.stringify(officialAlert)}`)).toEqual(officialAlert);
  });

  it("uses the final complete JSON object when model thoughts contain earlier objects", () => {
    expect(
      parseJsonObject(
        `Thoughts with braces {not json}. Example: ${JSON.stringify({ draft: true })}\nFinal: ${JSON.stringify(officialAlert)}`
      )
    ).toEqual(officialAlert);
  });

  it("returns typed live artifacts from each stage", async () => {
    const result = await runGemma4Pipeline({
      persona,
      alertText: officialAlert.extracted_alert_text,
      provider: new FakeProvider(),
    });

    expect(result.mode).toBe("gemma4");
    expect(result.alert).toEqual(officialAlert);
    expect(result.decisionPacket).toEqual(decisionPacket);
    expect(result.cards).toEqual(cards);
    expect(result.metadata.stages.map((stage) => stage.name)).toEqual([
      "official_alert_text_extraction",
      "vulnerability_decision_packet",
      "channel_action_cards",
    ]);
  });

  it("falls back visibly when live configuration is invalid", async () => {
    const result = await runGemma4Pipeline({
      persona,
      alertText: officialAlert.extracted_alert_text,
    });

    expect(result.mode).toBe("demo");
    expect(result.metadata.fallbackUsed).toBe(true);
    expect(result.metadata.fallbackReason).toContain("GEMMA_MODEL_ID is required");
    expect(result.safety.warnings).toContain("Live Gemma 4 pipeline failed; deterministic fallback used.");
  });

  it("throws instead of falling back when demo mode is disabled", async () => {
    process.env.ENABLE_DEMO_MODE = "false";

    await expect(
      runGemma4Pipeline({
        persona,
        alertText: officialAlert.extracted_alert_text,
      })
    ).rejects.toThrow("GEMMA_MODEL_ID is required");
  });
});
