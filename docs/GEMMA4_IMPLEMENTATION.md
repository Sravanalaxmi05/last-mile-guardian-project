# Gemma 4 Implementation

This project uses Gemma 4 through the configured model ID in `GEMMA_MODEL_ID`.

Required live-mode environment:

- `REQUIRE_GEMMA4=true`
- `GEMMA_PROVIDER=google-ai` or `GEMMA_PROVIDER=openai-compatible`
- `GEMMA_MODEL_ID=<actual Gemma 4 model ID>`
- `GOOGLE_API_KEY` or `GEMMA_API_KEY`
- `GEMMA_BASE_URL` only for OpenAI-compatible providers

The server refuses to run live mode if `GEMMA_MODEL_ID` does not match Gemma 4.

Pipeline stages:

1. Official alert extraction / normalization
2. Vulnerability decision packet
3. Channel-specific action card generation
4. Zod validation
5. Life-safety validation
6. Visible fallback if validation fails

For a strict live demonstration with deterministic fallback disabled:

```bash
ENABLE_DEMO_MODE=false pnpm --filter @workspace/api-server run dev
```
