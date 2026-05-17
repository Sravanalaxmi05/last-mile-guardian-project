import crypto from "node:crypto";

export function sha256(value: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function nowIso(): string {
  return new Date().toISOString();
}
