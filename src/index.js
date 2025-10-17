// src/index.js

import { Client, GatewayIntentBits, Events } from "discord.js";
import dotenv from "dotenv";
import { PolymarketPredictionService } from "./PolymarketPredictionService.js";

dotenv.config();

if (!process.env.DISCORD_BOT_TOKEN || !process.env.MISTRAL_API_KEY) {
  console.error("❌ Missing DISCORD_BOT_TOKEN or MISTRAL_API_KEY in .env");
  process.exit(1);
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize Polymarket prediction service
const polymarketService = new PolymarketPredictionService();

// Helper function to simulate streaming chunks in Discord
async function replyInChunks(channel, text, chunkSize = 1000, delay = 100) {
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.slice(i, i + chunkSize);
    await channel.send(chunk);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

// Ready event
client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Message event
client.on(Events.MessageCreate, async (message) => {
  try {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if bot is mentioned
    if (message.mentions.has(client.user)) {
      // Remove mention from message content
      const query = message.content.replace(/<@!?(\d+)>/, "").trim();

      if (!query) {
        await message.reply(
          "Hi! Ask me anything about Polymarket predictions. For example: `@BotName who will win?`"
        );
        return;
      }

      await message.reply("🔄 Fetching latest Polymarket prediction...");

      // Fetch prediction
      const prediction = await polymarketService.generatePrediction(query);

      if (!prediction) {
        await message.reply(
          "❌ Sorry, I couldn't fetch any active markets right now. Please try again later."
        );
        return;
      }

      // Send prediction in chunks for better readability
      await replyInChunks(message.channel, prediction);
    }
  } catch (err) {
    console.error("❌ Error handling message:", err);
    await message.reply(
      "⚠️ Something went wrong while fetching predictions. Please try again later."
    );
  }
});

// Login
client.login(process.env.DISCORD_BOT_TOKEN);
