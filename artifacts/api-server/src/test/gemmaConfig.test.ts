import { describe, expect, it } from "vitest";
import { isGemma4ModelId } from "../config/gemmaConfig";

describe("Gemma config", () => {
  it("accepts Gemma 4 model IDs", () => {
    expect(isGemma4ModelId("gemma-4-e4b-it")).toBe(true);
    expect(isGemma4ModelId("google/gemma-4-26b-it")).toBe(true);
  });

  it("rejects Gemma 3 model IDs", () => {
    expect(isGemma4ModelId("gemma-3-example")).toBe(false);
  });
});
