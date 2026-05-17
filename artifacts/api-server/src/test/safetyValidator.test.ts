import { describe, expect, it } from "vitest";
import { validateActionCardSafety } from "../lib/gemma/safetyValidator";

const baseCards: any = {
  risk_summary: "Official alert indicates flood risk. Follow official guidance and avoid floodwater.",
  first_action: "Move to a higher indoor area and call for help if needed.",
  why_this_action: "This fits the person's vulnerability and official alert.",
  next_3_steps: ["Pack medicines", "Charge phone", "Contact family"],
  must_take: ["Phone", "Water", "ID"],
  do_not_do: ["Do not enter floodwater", "Do not trust rumors", "Do not touch switches near water", "Do not delay calling for help"],
  battery_saving_tip: "Lower brightness and use low power mode.",
  rumor_safety_note: "Trust official updates only.",
  sms_card: "Need help. Flood alert. Location: [address].",
  ivr_script: "ऊपर रहें। Upar rahein.",
  whatsapp_family_card: "I am staying indoors and following official guidance.",
  volunteer_rescue_card: "Person may need assistance. Confirm location and needs.",
  offline_checklist: ["Pack medicine", "Charge phone", "Keep ID", "Avoid floodwater", "Follow official guidance"],
  reasoning_summary: "Guidance is based on official alert and persona constraints."
};

describe("validateActionCardSafety", () => {
  it("passes safe cards", () => {
    expect(validateActionCardSafety(baseCards)).toEqual([]);
  });

  it("rejects safe route claims", () => {
    const cards = { ...baseCards, first_action: "Take the safe route now." };
    expect(validateActionCardSafety(cards)).toContain("Claims a safe route.");
  });

  it("rejects rescue guarantees", () => {
    const cards = { ...baseCards, first_action: "Guaranteed rescue is coming soon." };
    expect(validateActionCardSafety(cards).length).toBeGreaterThan(0);
  });

  it("rejects walking through floodwater", () => {
    const cards = { ...baseCards, first_action: "Walk through floodwater to leave." };
    expect(validateActionCardSafety(cards).length).toBeGreaterThan(0);
  });

  it("allows explicit warnings not to cross floodwater", () => {
    const cards = {
      ...baseCards,
      do_not_do: [
        "Do not attempt to walk through or cross floodwater",
        ...baseCards.do_not_do.slice(1),
      ],
    };
    expect(validateActionCardSafety(cards)).toEqual([]);
  });

  it("rejects long SMS", () => {
    const cards = { ...baseCards, sms_card: "x".repeat(161) };
    expect(validateActionCardSafety(cards)).toContain("SMS card exceeds 160 characters.");
  });
});
