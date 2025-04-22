import { Client, GatewayIntentBits, Events, REST, Routes } from "discord.js"
import { config } from "dotenv"
import { PolymarketService } from "./services/polymarket.js"
import { MistralService } from "./services/mistral.js"
import { commands } from "./commands/index.js"

config()

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

// Initialize services
const polymarketService = new PolymarketService()
const mistralService = new MistralService(process.env.SDK_AUTH_PLACEHOLDER)

// Register slash commands
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.SDK_AUTH_PLACEHOLDER)

  try {
    console.log("Started refreshing application (/) commands.")

    await rest.put(Routes.applicationCommands(process.env.SDK_AUTH_PLACEHOLDER), {
      body: commands.map((cmd) => cmd.data.toJSON()),
    })

    console.log("Successfully reloaded application (/) commands.")
  } catch (error) {
    console.error("Error registering commands:", error)
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ PolyCBT is online! Logged in as ${c.user.tag}`)

  // Register commands
  await registerCommands()

  // Connect to Polymarket real-time data
  await polymarketService.connect()
  console.log("📊 Connected to Polymarket real-time data feed")
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.find((cmd) => cmd.data.name === interaction.commandName)

  if (!command) return

  try {
    await command.execute(interaction, { polymarketService, mistralService })
  } catch (error) {
    console.error("Error executing command:", error)
    const errorMessage = "There was an error executing this command!"

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true })
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true })
    }
  }
})

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down PolyCBT...")
  polymarketService.disconnect()
  await client.destroy()
  process.exit(0)
})

client.login(process.env.SDK_AUTH_PLACEHOLDER)
