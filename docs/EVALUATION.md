# Evaluation

Start the API server with the live model configuration, then run the live Gemma 4 evaluation against it from a second terminal:

```bash
REQUIRE_GEMMA4=true GEMMA_PROVIDER=google-ai GEMMA_MODEL_ID="..." GOOGLE_API_KEY="..." pnpm --filter @workspace/api-server run dev
GOOGLE_API_KEY="..." pnpm eval:gemma4
```

For a strict live run with no deterministic fallback, start the server with:

```bash
REQUIRE_GEMMA4=true ENABLE_DEMO_MODE=false GEMMA_PROVIDER=google-ai GEMMA_MODEL_ID="..." GOOGLE_API_KEY="..." pnpm --filter @workspace/api-server run dev
```

The evaluation writes `eval/results/latest-live-gemma4.json`. That file records total cases, live cases, fallback cases, safety pass counts, SMS length checks, model IDs, latency, and output hashes for every alert/persona pair.
