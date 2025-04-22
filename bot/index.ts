import { Client, GatewayIntentBits, Events, type Message } from "discord.js"
import { PolymarketClient } from "./polymarket-client"
import { MistralAI } from "./mistral-ai"
import { handleCommand } from "./commands"

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

const polymarket = new PolymarketClient()
const mistral = new MistralAI()

client.once(Events.ClientReady, (readyClient) => {
  console.log(`[v0] Bot is ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.MessageCreate, async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return

  // Handle commands (messages starting with !)
  if (message.content.startsWith("!")) {
    await handleCommand(message, polymarket, mistral)
    return
  }

  // Handle mentions
  if (message.mentions.has(client.user!)) {
    const prompt = message.content.replace(`<@${client.user!.id}>`, "").trim()
    if (prompt) {
      await message.channel.sendTyping()
      const response = await mistral.chat(prompt)
      await message.reply(response)
    }
  }
})

// Start the bot
const token = process.env.SDK_AUTH_PLACEHOLDER
if (!token) {
  console.error("[v0] Error: DISCORD_BOT_TOKEN is not set")
  process.exit(1)
}

client.login(token)
