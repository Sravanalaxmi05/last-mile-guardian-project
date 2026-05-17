export type GemmaInputPart =
  | { type: "text"; text: string }
  | { type: "image"; mimeType: string; base64: string };

export interface GemmaGenerateOptions {
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
}

export interface GemmaGenerateResult {
  text: string;
  raw?: unknown;
}

export interface GemmaProvider {
  modelId: string;
  generate(parts: GemmaInputPart[], options?: GemmaGenerateOptions): Promise<GemmaGenerateResult>;
}
