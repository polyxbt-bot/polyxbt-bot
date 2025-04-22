# PolyXBT Discord Bot

**PolyXBT Dev** — Open‑source Discord bot framework for market and AI agent interactions.

> Cleaned and prepared for public distribution. Sensitive credential references removed; this project demonstrates integration with open-source SDKs (Mistral, OpenAI, OpenRouter) and standard secret management.

## What this project is
A modular Discord bot scaffold designed to connect market-data sources and AI SDKs to provide analysis, automated replies, and tools for community trading/insights.

Key points:
- Built as a developer-focused reference bot.
- Uses Open‑source SDK clients for LLM integrations (Mistral, OpenAI) — replaceable via configuration.
- No hard-coded secrets. Use Railway / GitHub Secrets / environment variables or SDK token managers.
- Designed to be extended and forked; comes with examples and deployment scripts.

## Files of interest
- `index.js` / `src/` — main bot entrypoints (cleaned).
- `README.md` — this file.
- `deploy/` — contains deployment guidance and scripts.

## How authentication works (clean, public-ready)
This repository does **not** contain API keys. When deploying, follow one of these recommended methods:
- Use Railway / Vercel / Heroku secret managers and set variables like `SDK_AUTH_PLACEHOLDER`.
- Use GitHub Actions secrets for CI deployments.
- Use local `.env` for development only (do not commit `.env`).

## Replacing SDKs
The code uses abstracted client modules. To switch SDKs:
1. Install the target SDK (Mistral / OpenAI / OpenRouter).
2. Provide credentials via platform secrets.
3. Update `config/sdk.js` to select the SDK adapter.

## License
MIT

## Maintainer
PolyXBT Dev — 2025-10-22
