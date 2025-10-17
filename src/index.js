import { Client, GatewayIntentBits, Events, EmbedBuilder } from "discord.js"
import dotenv from "dotenv"
import { AIService } from "./services/ai.js"
import { PolymarketService } from "./services/polymarket.js"
import { SchedulerService } from "./services/scheduler.js"
import { commands, parseCommand } from "./commands/index.js"

dotenv.config()

if (!process.env.DISCORD_BOT_TOKEN) {
  console.error("Error: DISCORD_BOT_TOKEN is required in .env file")
  process.exit(1)
}

if (!process.env.MISTRAL_API_KEY) {
  console.error("Error: MISTRAL_API_KEY is required in .env file")
  process.exit(1)
}

const aiService = new AIService(process.env.MISTRAL_API_KEY)
const polymarketService = new PolymarketService()

let scheduler = null

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
})

client.once(Events.ClientReady, (c) => {
  console.log(`[Polymarket Bot] Logged in as ${c.user.tag}`)
  console.log("[Polymarket Bot] Bot is ready to predict!")

  client.user.setPresence({
    activities: [{ name: "Polymarket predictions | !predict" }],
    status: "online",
  })

  if (process.env.DISCORD_CHANNEL_ID) {
    scheduler = new SchedulerService(client, aiService, polymarketService, process.env.DISCORD_CHANNEL_ID)
    scheduler.start()
  } else {
    console.log("[Polymarket Bot] DISCORD_CHANNEL_ID not set - hourly posts disabled")
  }
})

client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages
  if (message.author.bot) return

  try {
    // Check for commands first
    const commandParse = parseCommand(message.content)
    if (commandParse) {
      const { commandName, args } = commandParse
      const command = commands[commandName]

      if (command) {
        await command.execute(message, args, { aiService, polymarketService })
        return
      }
    }

    // Only respond to messages that mention the bot or start with !predict
    const isMentioned = message.mentions.has(client.user)
    const isCommand = message.content.toLowerCase().startsWith("!predict")

    if (!isMentioned && !isCommand) return

    // Extract user message
    let userMessage = message.content.replace(`<@${client.user.id}>`, "").replace("!predict", "").trim()

    if (!userMessage) {
      userMessage = "What is trending?"
    }

    await message.channel.sendTyping()

    console.log(`[v0] User ${message.author.username} asked: "${userMessage}"`)
    const events = await polymarketService.fetchActiveEvents()
    console.log(`[v0] Received ${events.length} events for response`)

    if (events.length === 0) {
      await message.reply(
        "Sorry, I couldn't fetch any active markets right now. The Polymarket API might be temporarily unavailable. Please try again in a moment! 🔄",
      )
      return
    }

    // Generate prediction with events context
    const prediction = await aiService.generateResponse(message.author.id, userMessage, events)

    // Create embed for better formatting
    const embed = new EmbedBuilder()
      .setColor("#8B5CF6") // Purple color
      .setTitle("📊 Polymarket Prediction")
      .setDescription(prediction)
      .setFooter({ text: "Powered by Mistral AI & Polymarket" })
      .setTimestamp()

    // Send response
    await message.reply({ embeds: [embed] })
  } catch (error) {
    console.error("[v0] Error handling message:", error)
    console.error("[v0] Error stack:", error.stack)
    await message.reply("Sorry, I encountered an error processing your request. Please try again! ⚠️")
  }
})

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error)
})

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error)
})

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down...")
  if (scheduler) {
    scheduler.stop()
  }
  client.destroy()
  process.exit(0)
})

client.login(process.env.DISCORD_BOT_TOKEN)
