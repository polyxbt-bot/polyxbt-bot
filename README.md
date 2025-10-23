**🧠 PolyXBT — Discord Prediction Bot**
AI-Driven Market Intelligence from Polymarket
<p align="center"> <img src="https://raw.githubusercontent.com/polyxbt-bot/polyxbt-bot/main/assets/polyxbt-logo-dark.png" width="140" alt="PolyXBT Logo"> </p> 


**💬 Overview**
PolyXBT is an open-source Discord bot that provides real-time prediction market insights and AI-assisted market reasoning.
It integrates with Polymarket’s live data client and supports AI via SDKs like OpenAI, Mistral, and OpenRouter, enabling Discord communities to access intelligent, market-aware responses.

PolyXBT acts as a community trading assistant, fetching real-time event data, analyzing probabilities, and summarizing sentiment — all within Discord.

**🧩 Key Features**

⚡ Real-time market data directly from Polymarket

🤖 AI-generated insights using OpenAI, Mistral, or open-source language models via SDK

🔄 Dynamic command framework — easily extend or add new market modules

🧠 Hybrid SDK integration layer — switch AI providers without changing code

🔒 No exposed credentials — compatible with Railway, Vercel, or GitHub Actions

📊 Structured market reasoning — not random text, but data-driven insights

**🏗️ Project Structure**
Folder / File	Description
index.js	Bot entrypoint — loads Discord client, commands, and AI SDK handlers
src/	Core source files (commands, SDK connectors, adapters)
src/ai/	AI SDK integration logic (OpenAI, Mistral, OpenRouter)
src/market/	Polymarket API connectors for real-time data
config/	SDK selection and configuration
deploy/	Deployment scripts and CI/CD setup
README.md	Documentation

<p align="center"> <img src="https://raw.githubusercontent.com/polyxbt-bot/polyxbt-bot/main/assets/polymarket-logo.png" width="120" alt="Polymarket"> </p>



All SDK authentication is handled via environment variables:

**Supported secret storage:**

Railway / Vercel / Heroku environment variables

GitHub Actions secrets

Local .env (for development only)

The bot will automatically detect which AI SDK to use based on the available keys.

**⚙️ How the AI SDKs Work**

PolyXBT uses a modular SDK architecture:

User sends a command in Discord, e.g.:

/predict "Who will win the US Election?"


PolyXBT fetches data from Polymarket via the openai / Mistral / openrouter SDK:

https://clob.polymarket.com/markets


Or via the official real-time-data-client
.

Format the data into a structured prompt:

const prompt = `Analyze this Polymarket event: ${marketTitle}, 
with probabilities ${outcomeData}. Provide insights for traders.`;


Send prompt to selected AI SDK (example: Mistral):

import { MistralClient } from "@mistralai/mistralai";

channel.send(`🧠 PolyXBT Insight:\n${response.output}`);


**You can swap OpenAI or OpenRouter by updating config/sdk.js.**

SDK usage avoids exposing raw in commands or logs.

**🪙 Polymarket Data Integration**

PolyXBT fetches and parses market data to create Discord-friendly responses:

**Key endpoints:**

GET https://clob.polymarket.com/markets
GET https://polymarket.com/events


Discord embeds include:

Event title

Market probability

Current price or odds

AI-generated reasoning summary

🧠 SDK Integration Diagram
Discord User → PolyXBT Bot → Polymarket API
                     ↓
             AI Adapter Layer (SDK)
     ├─ OpenAI GPT-4 - sdk model
     ├─ Mistral Medium - sdk model
     └─ OpenRouter / OSS Models
                     ↓
              Discord Response

🪄 Example Command
/predict "Who will win the US Election?"


**Discord Response:**

🧠 PolyXBT Insight
Based on Polymarket data, Candidate X has a 63% implied probability.
Market sentiment remains bullish due to strong polling in swing states.

**📦 Deployment**

Run locally:

npm install
npm run start


<p align="center"> <img src="https://raw.githubusercontent.com/polyxbt-bot/polyxbt-bot/main/assets/polyxbt-logo-blue.png" width="130" alt="PolyXBT"> 

  
This project is licensed under the Apache License 2.0. You may freely use, modify, and distribute the software in accordance with the Apache-2.0 License.
