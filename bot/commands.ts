import type { Message } from "discord.js"
import type { PolymarketClient } from "./polymarket-client"
import type { MistralAI } from "./mistral-ai"

export async function handleCommand(message: Message, polymarket: PolymarketClient, mistral: MistralAI): Promise<void> {
  const args = message.content.slice(1).trim().split(/\s+/)
  const command = args[0].toLowerCase()

  try {
    switch (command) {
      case "help":
        await handleHelp(message)
        break

      case "trending":
        await handleTrending(message, polymarket)
        break

      case "search":
        await handleSearch(message, args.slice(1), polymarket)
        break

      case "market":
        await handleMarket(message, args.slice(1), polymarket)
        break

      case "analyze":
        await handleAnalyze(message, args.slice(1), polymarket, mistral)
        break

      case "ask":
        await handleAsk(message, args.slice(1), mistral)
        break

      default:
        await message.reply("Unknown command! Use `!help` to see available commands.")
    }
  } catch (error) {
    console.error("[v0] Error handling command:", error)
    await message.reply("Something went wrong processing your command. Please try again!")
  }
}

async function handleHelp(message: Message): Promise<void> {
  const helpText = `
**Polymarket Bot Commands**

\`!trending\` - Show top trending markets
\`!search <query>\` - Search for markets
\`!market <id>\` - Get details about a specific market
\`!analyze <id>\` - Get AI analysis of a market
\`!ask <question>\` - Ask me anything about prediction markets
\`!help\` - Show this help message

You can also mention me to chat!
  `.trim()

  await message.reply(helpText)
}

async function handleTrending(message: Message, polymarket: PolymarketClient): Promise<void> {
  await message.channel.sendTyping()

  const markets = await polymarket.getTrendingMarkets(5)

  if (markets.length === 0) {
    await message.reply("Could not fetch trending markets right now. Try again later!")
    return
  }

  const response =
    "**Top Trending Markets**\n\n" + markets.map((m, i) => `${i + 1}. ${polymarket.formatMarket(m)}`).join("\n\n")

  await message.reply(response)
}

async function handleSearch(message: Message, args: string[], polymarket: PolymarketClient): Promise<void> {
  if (args.length === 0) {
    await message.reply("Please provide a search query! Example: `!search election`")
    return
  }

  await message.channel.sendTyping()

  const query = args.join(" ")
  const markets = await polymarket.searchMarkets(query, 5)

  if (markets.length === 0) {
    await message.reply(`No markets found for "${query}". Try a different search term!`)
    return
  }

  const response =
    `**Search Results for "${query}"**\n\n` +
    markets.map((m, i) => `${i + 1}. ${polymarket.formatMarket(m)}`).join("\n\n")

  await message.reply(response)
}

async function handleMarket(message: Message, args: string[], polymarket: PolymarketClient): Promise<void> {
  if (args.length === 0) {
    await message.reply("Please provide a market ID! Example: `!market 0x123...`")
    return
  }

  await message.channel.sendTyping()

  const marketId = args[0]
  const market = await polymarket.getMarket(marketId)

  if (!market) {
    await message.reply(`Could not find market with ID: ${marketId}`)
    return
  }

  const response = polymarket.formatMarket(market) + (market.description ? `\n\n${market.description}` : "")

  await message.reply(response)
}

async function handleAnalyze(
  message: Message,
  args: string[],
  polymarket: PolymarketClient,
  mistral: MistralAI,
): Promise<void> {
  if (args.length === 0) {
    await message.reply("Please provide a market ID! Example: `!analyze 0x123...`")
    return
  }

  await message.channel.sendTyping()

  const marketId = args[0]
  const market = await polymarket.getMarket(marketId)

  if (!market) {
    await message.reply(`Could not find market with ID: ${marketId}`)
    return
  }

  const marketData = polymarket.formatMarket(market)
  const analysis = await mistral.analyzeMarket(marketData)

  await message.reply(`${marketData}\n\n**AI Analysis:**\n${analysis}`)
}

async function handleAsk(message: Message, args: string[], mistral: MistralAI): Promise<void> {
  if (args.length === 0) {
    await message.reply("Please ask a question! Example: `!ask What are prediction markets?`")
    return
  }

  await message.channel.sendTyping()

  const question = args.join(" ")
  const response = await mistral.chat(question, message.author.id)

  await message.reply(response)
}
