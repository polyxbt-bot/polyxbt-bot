🧠 PolyXBT — Discord Prediction Bot
AI-Driven Market Intelligence from Polymarket
<p align="center"> <img src="https://raw.githubusercontent.com/polyxbt-bot/polyxbt-bot/main/assets/polyxbt-logo-dark.png" width="140" alt="PolyXBT Logo"> </p> <p align="center"> <img src="https://img.shields.io/badge/verified-project-blue?style=for-the-badge&logo=github" alt="Verified Project"> <img src="https://img.shields.io/badge/discord-live-blueviolet?style=for-the-badge&logo=discord" alt="Discord Integration"> <img src="https://img.shields.io/github/license/polyxbt-bot/polyxbt-bot?style=for-the-badge&color=blue" alt="License"> </p>
💬 Overview

PolyXBT is an open-source Discord bot that provides real-time prediction market insights and AI-assisted market reasoning.
It integrates with Polymarket’s live data client and supports AI via SDKs like OpenAI, Mistral, and OpenRouter, enabling Discord communities to access intelligent, market-aware responses without exposing API keys in code.

PolyXBT acts as a community trading assistant, fetching real-time event data, analyzing probabilities, and summarizing sentiment — all within Discord.

🧩 Key Features

⚡ Real-time market data directly from Polymarket

🤖 AI-generated insights using OpenAI, Mistral, or open-source language models via SDK

🔄 Dynamic command framework — easily extend or add new market modules

🧠 Hybrid SDK integration layer — switch AI providers without changing code

🔒 No exposed credentials — compatible with Railway, Vercel, or GitHub Actions

📊 Structured market reasoning — not random text, but data-driven insights

🏗️ Project Structure
Folder / File	Description
index.js	Bot entrypoint — loads Discord client, commands, and AI SDK handlers
src/	Core source files (commands, API connectors, adapters)
src/ai/	AI SDK integration logic (OpenAI, Mistral, OpenRouter)
src/market/	Polymarket API connectors for real-time data
config/	SDK selection and configuration
deploy/	Deployment scripts and CI/CD setup
.env.example	Local secret management example
README.md	Documentation
🔐 Authentication & Secrets

PolyXBT does not store API keys in the code. All SDK authentication is handled via environment variables:

# .env example
DISCORD_TOKEN=your-discord-bot-token
POLYMARKET_API=https://clob.polymarket.com
OPENAI_API_KEY=your-openai-api-key
MISTRAL_API_KEY=your-mistral-api-key
OPENROUTER_API_KEY=your-openrouter-api-key


Supported secret storage:

Railway / Vercel / Heroku environment variables

GitHub Actions secrets

Local .env (for development only)

The bot will automatically detect which AI SDK to use based on the available keys.

⚙️ How the AI SDKs Work

PolyXBT uses a modular SDK architecture:

User sends a command in Discord, e.g.:

/predict "Who will win the US Election?"


PolyXBT fetches data from Polymarket via the open API:

https://clob.polymarket.com/markets


Or via the official real-time-data-client
.

Format the data into a structured prompt:

const prompt = `Analyze this Polymarket event: ${marketTitle}, 
with probabilities ${outcomeData}. Provide insights for traders.`;


Send prompt to selected AI SDK (example: Mistral):

import { MistralClient } from "@mistralai/mistralai";

const client = new MistralClient({ apiKey: process.env.MISTRAL_API_KEY });
const response = await client.chat({
  model: "mistral-medium",
  messages: [{ role: "user", content: prompt }],
});

channel.send(`🧠 PolyXBT Insight:\n${response.output}`);


You can swap OpenAI or OpenRouter by updating config/sdk.js.

SDK usage avoids exposing raw API keys in commands or logs.

🪙 Polymarket Data Integration

PolyXBT fetches and parses market data to create Discord-friendly responses:

Key endpoints:

GET https://clob.polymarket.com/markets
GET https://polymarket.com/api/events


Discord embeds include:

Event title

Market probability

Current price or odds

AI-generated reasoning summary

🧠 SDK Integration Diagram
Discord User → PolyXBT Bot → Polymarket API
                     ↓
             AI Adapter Layer (SDK)
     ├─ OpenAI GPT-4
     ├─ Mistral Medium
     └─ OpenRouter / OSS Models
                     ↓
              Discord Response

🪄 Example Command
/predict "Who will win the US Election?"


Discord Response:

🧠 PolyXBT Insight
Based on Polymarket data, Candidate X has a 63% implied probability.
Market sentiment remains bullish due to strong polling in swing states.

📦 Deployment

Run locally:

npm install
npm run start


Deploy:

Railway: zero-config with environment variables

Vercel: GitHub deploy + set environment variables

GitHub Actions: use /deploy/deploy.yml for automated CI/CD

🖼️ Visual Identity
<p align="center"> <img src="https://raw.githubusercontent.com/polyxbt-bot/polyxbt-bot/main/assets/polyxbt-logo-blue.png" width="130" alt="PolyXBT"> <img src="https://raw.githubusercontent.com/polyxbt-bot/polyxbt-bot/main/assets/polymarket-logo.png" width="120" alt="Polymarket"> </p>
📜 License

MIT License — free to use, modify, and redistribute.
See LICENSE
 for details.
