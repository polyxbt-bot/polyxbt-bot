import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { PolymarketPredictionService } from "./PolymarketPredictionService.js";

dotenv.config();

if (!process.env.DISCORD_BOT_TOKEN) throw new Error("DISCORD_BOT_TOKEN is required");
if (!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY is required");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const predictionService = new PolymarketPredictionService(process.env.MISTRAL_API_KEY);

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const content = message.content.toLowerCase();

  if (content.startsWith("!predict")) {
    const query = content.replace("!predict", "").trim() || "Provide me the top prediction";
    message.channel.sendTyping();

    const prediction = await predictionService.generatePrediction(query);
    message.reply(prediction);
  }

  else if (content === "!help") {
    message.reply("Commands:\n!predict <question> - Get prediction for top Polymarket events\n!help - Show this message");
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
