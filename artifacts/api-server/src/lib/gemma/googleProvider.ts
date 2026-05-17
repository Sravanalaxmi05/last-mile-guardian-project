import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GemmaProvider, GemmaInputPart, GemmaGenerateOptions } from "./provider";

export class GoogleAIGemmaProvider implements GemmaProvider {
  public readonly modelId: string;

  private readonly genAI: GoogleGenerativeAI;

  constructor(apiKey: string, modelId: string) {
    this.modelId = modelId;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generate(parts: GemmaInputPart[], options: GemmaGenerateOptions = {}) {
    const model = this.genAI.getGenerativeModel({
      model: this.modelId,
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        responseMimeType: options.responseMimeType,
      },
    });

    const googleParts = parts.map((part) => {
      if (part.type === "text") {
        return { text: part.text };
      }

      return {
        inlineData: {
          mimeType: part.mimeType,
          data: part.base64,
        },
      };
    });

    const result = await model.generateContent(googleParts);
    return {
      text: result.response.text(),
      raw: result,
    };
  }
}
