import fs from "node:fs/promises";

const API_BASE = process.env.API_BASE || "http://localhost:8080/api";
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMMA_API_KEY;

async function main() {
  const alerts = JSON.parse(await fs.readFile("eval/fixtures/alerts.json", "utf-8"));

  const results: any[] = [];

  for (const alert of alerts) {
    const response = await fetch(`${API_BASE}/action-cards/compare`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        alertText: alert.text,
        ...(API_KEY ? { apiKey: API_KEY } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(`Eval failed for ${alert.id}: ${response.status} ${await response.text()}`);
    }

    const json = await response.json();

    for (const item of json) {
      results.push({
        alertId: alert.id,
        personaId: item.persona.id,
        mode: item.mode,
        model: item.metadata?.model,
        live: item.metadata?.live,
        fallbackUsed: item.metadata?.fallbackUsed,
        fallbackReason: item.metadata?.fallbackReason,
        safetyPassed: item.safety?.passed,
        smsLength: item.cards?.sms_card?.length,
        latencyMs: item.metadata?.latencyMs,
        outputHash: item.metadata?.outputHash,
      });
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalCases: results.length,
    liveCases: results.filter((r) => r.live).length,
    fallbackCases: results.filter((r) => r.fallbackUsed).length,
    safetyPassed: results.filter((r) => r.safetyPassed).length,
    smsUnder160: results.filter((r) => r.smsLength <= 160).length,
    models: [...new Set(results.map((r) => r.model))],
    results,
  };

  await fs.mkdir("eval/results", { recursive: true });
  await fs.writeFile(
    "eval/results/latest-live-gemma4.json",
    JSON.stringify(summary, null, 2)
  );

  console.log(summary);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
