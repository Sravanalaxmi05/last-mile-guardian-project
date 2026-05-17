import type { GemmaProvider, GemmaInputPart, GemmaGenerateOptions } from "./provider";

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export class OpenAICompatibleGemmaProvider implements GemmaProvider {
  public readonly modelId: string;

  constructor(
    private readonly apiKey: string,
    modelId: string,
    private readonly baseUrl: string
  ) {
    this.modelId = modelId;
  }

  async generate(parts: GemmaInputPart[], options: GemmaGenerateOptions = {}) {
    const content = parts.map((part) => {
      if (part.type === "text") {
        return { type: "text", text: part.text };
      }

      return {
        type: "image_url",
        image_url: {
          url: `data:${part.mimeType};base64,${part.base64}`,
        },
      };
    });

    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: [{ role: "user", content }],
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxOutputTokens ?? 2048,
        response_format:
          options.responseMimeType === "application/json"
            ? { type: "json_object" }
            : undefined,
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemma provider failed: ${response.status} ${await response.text()}`);
    }

    const json = (await response.json()) as ChatCompletionResponse;
    return {
      text: json.choices?.[0]?.message?.content ?? "",
      raw: json,
    };
  }
}
