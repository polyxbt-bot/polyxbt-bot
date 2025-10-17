import { CHARACTER_CONFIG } from "../config/character.js"
import { EmbedBuilder } from "discord.js"

export const commands = {
  help: {
    name: "help",
    description: "Show available commands",
    execute: async (message) => {
      const helpText = `**PolyXBT Commands:**
\`!help\` - Show this help message
\`!about\` - Learn about PolyXBT
\`!markets\` - Get top trending Polymarket markets
\`!search <query>\` - Search for specific markets
\`!clear\` - Clear conversation history

Just mention me or reply to my messages to chat!`

      await message.reply(helpText)
    },
  },

  about: {
    name: "about",
    description: "Learn about PolyXBT",
    execute: async (message) => {
      const aboutText = `**${CHARACTER_CONFIG.name}**

${CHARACTER_CONFIG.bio
  .slice(0, 5)
  .map((b) => `• ${b}`)
  .join("\n")}

${CHARACTER_CONFIG.system}

**Lore:**
${CHARACTER_CONFIG.lore
  .slice(0, 3)
  .map((l) => `• ${l}`)
  .join("\n")}`

      await message.reply(aboutText)
    },
  },

  markets: {
    name: "markets",
    description: "Get trending Polymarket data",
    execute: async (message, args, { polymarketService, aiService }) => {
      try {
        await message.channel.sendTyping()

        const markets = await polymarketService.getTop3Markets()

        if (!markets || markets.length === 0) {
          await message.reply("Unable to fetch market data right now. Probability models recalibrating...")
          return
        }

        // Generate AI commentary about the markets
        const commentary = await aiService.generateMarketCommentary(markets)

        // Create rich embed
        const embed = new EmbedBuilder()
          .setColor(0x7c3aed)
          .setTitle("📊 Top Trending Polymarket Markets")
          .setDescription(commentary)
          .setTimestamp()
          .setFooter({ text: "PolyXBT • Real-time Market Analysis" })

        markets.forEach((market, i) => {
          embed.addFields({
            name: `${i + 1}. ${market.question}`,
            value: `**${market.probability}%** YES • Vol: ${market.volume} • ${market.change}\n[View Market](${market.url})`,
            inline: false,
          })
        })

        await message.reply({ embeds: [embed] })
      } catch (error) {
        console.error("Error in markets command:", error)
        await message.reply("Error fetching market data. Odds temporarily unavailable.")
      }
    },
  },

  search: {
    name: "search",
    description: "Search for specific markets",
    execute: async (message, args, { polymarketService }) => {
      if (args.length === 0) {
        await message.reply("Usage: `!search <query>` - Example: `!search trump`")
        return
      }

      try {
        await message.channel.sendTyping()

        const query = args.join(" ")
        const markets = await polymarketService.searchMarkets(query)

        if (!markets || markets.length === 0) {
          await message.reply(`No markets found for "${query}". Try different keywords.`)
          return
        }

        const embed = new EmbedBuilder()
          .setColor(0x7c3aed)
          .setTitle(`🔍 Search Results: "${query}"`)
          .setTimestamp()
          .setFooter({ text: "PolyXBT • Market Search" })

        markets.slice(0, 5).forEach((market) => {
          const formatted = polymarketService.formatMarketForDiscord(market)
          embed.addFields({
            name: formatted.question,
            value: `**${formatted.probability}%** YES • Vol: ${formatted.volume}\n[View Market](${formatted.url})`,
            inline: false,
          })
        })

        await message.reply({ embeds: [embed] })
      } catch (error) {
        console.error("Error in search command:", error)
        await message.reply("Error searching markets. Try again later.")
      }
    },
  },

  clear: {
    name: "clear",
    description: "Clear conversation history",
    execute: async (message, args, { aiService }) => {
      aiService.clearHistory(message.author.id)
      await message.reply("Conversation history cleared. Probability models reset.")
    },
  },
}

export function parseCommand(content) {
  const prefix = "!"
  if (!content.startsWith(prefix)) return null

  const args = content.slice(prefix.length).trim().split(/ +/)
  const commandName = args.shift().toLowerCase()

  return { commandName, args }
}
