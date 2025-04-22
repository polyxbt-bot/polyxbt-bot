import { SlashCommandBuilder } from "discord.js"

// Predict command
const predictCommand = {
  data: new SlashCommandBuilder()
    .setName("predict")
    .setDescription("Get PolyCBT's prediction on a market")
    .addStringOption((option) =>
      option.setName("market").setDescription("Market ID or question to analyze").setRequired(true),
    ),
  execute: async (interaction, { polymarketService, mistralService }) => {
    await interaction.deferReply()

    const marketQuery = interaction.options.getString("market", true)
    const market = polymarketService.getMarket(marketQuery)

    if (!market) {
      await interaction.editReply({
        content: `🔍 I couldn't find that specific market. Try using \`/markets\` to see available markets, or I can still provide general analysis based on your query.`,
      })

      try {
        const analysis = await mistralService.chat(`Provide analysis and prediction for: ${marketQuery}`)
        await interaction.followUp({
          content: `📊 **General Analysis**\n\n${analysis}`,
        })
      } catch (error) {
        console.error("Error generating prediction:", error)
      }

      return
    }

    try {
      const analysis = await mistralService.analyzeMarket(market)

      const embed = {
        color: 0x7c3aed,
        title: `🎯 PolyCBT's Prediction`,
        description: analysis,
        fields: [
          {
            name: "📈 Current Prices",
            value:
              Object.entries(market.prices)
                .map(([outcome, price]) => `**${outcome}**: ${(price * 100).toFixed(1)}%`)
                .join("\n") || "No price data available",
            inline: true,
          },
          {
            name: "💰 Volume",
            value: `$${market.volume.toLocaleString()}`,
            inline: true,
          },
        ],
        timestamp: new Date(market.lastUpdate).toISOString(),
        footer: {
          text: "PolyCBT • Powered by Mistral AI & Polymarket",
        },
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error("Error generating prediction:", error)
      await interaction.editReply({
        content: "❌ Failed to generate prediction. Please try again later.",
      })
    }
  },
}

// Markets command
const marketsCommand = {
  data: new SlashCommandBuilder()
    .setName("markets")
    .setDescription("View top active Polymarket markets")
    .addIntegerOption((option) =>
      option.setName("limit").setDescription("Number of markets to show (default: 5)").setMinValue(1).setMaxValue(10),
    ),
  execute: async (interaction, { polymarketService }) => {
    await interaction.deferReply()

    const limit = interaction.options.getInteger("limit") || 5
    const topMarkets = polymarketService.getTopMarkets(limit)

    if (topMarkets.length === 0) {
      await interaction.editReply({
        content: "📊 No market data available yet. The bot is still collecting data from Polymarket.",
      })
      return
    }

    const embed = {
      color: 0x7c3aed,
      title: "📊 Top Active Polymarket Markets",
      description: "Here are the most active prediction markets right now:",
      fields: topMarkets.map((market, index) => ({
        name: `${index + 1}. ${market.question || market.condition_id}`,
        value: `**Prices**: ${
          Object.entries(market.prices)
            .map(([outcome, price]) => `${outcome}: ${(price * 100).toFixed(1)}%`)
            .join(", ") || "Loading..."
        }\n**Volume**: $${market.volume.toLocaleString()}\n**ID**: \`${market.condition_id}\``,
        inline: false,
      })),
      timestamp: new Date().toISOString(),
      footer: {
        text: "PolyCBT • Real-time Polymarket Data",
      },
    }

    await interaction.editReply({ embeds: [embed] })
  },
}

// Ask command
const askCommand = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask PolyCBT anything about prediction markets")
    .addStringOption((option) => option.setName("question").setDescription("Your question").setRequired(true)),
  execute: async (interaction, { mistralService }) => {
    await interaction.deferReply()

    const question = interaction.options.getString("question", true)

    try {
      const response = await mistralService.chat(question)

      const embed = {
        color: 0x7c3aed,
        title: "💬 PolyCBT",
        description: response,
        timestamp: new Date().toISOString(),
        footer: {
          text: "PolyCBT • Powered by Mistral AI",
        },
      }

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error("Error generating response:", error)
      await interaction.editReply({
        content: "❌ Failed to generate response. Please try again later.",
      })
    }
  },
}

// Track command
const trackCommand = {
  data: new SlashCommandBuilder()
    .setName("track")
    .setDescription("Track a market and get real-time updates")
    .addStringOption((option) => option.setName("market").setDescription("Market ID to track").setRequired(true)),
  execute: async (interaction, { polymarketService }) => {
    await interaction.deferReply()

    const marketId = interaction.options.getString("market", true)
    const market = polymarketService.getMarket(marketId)

    if (!market) {
      await interaction.editReply({
        content: `❌ Market not found. Use \`/markets\` to see available markets.`,
      })
      return
    }

    await interaction.editReply({
      content: `✅ Now tracking **${market.question || marketId}**\n\nI'll send updates when significant price changes occur. Use \`/untrack ${marketId}\` to stop tracking.`,
    })

    const callback = (data) => {
      const priceChange = Math.abs(Number.parseFloat(data.price) - (market.prices[data.outcome || ""] || 0))

      if (priceChange > 0.02) {
        interaction
          .followUp({
            content: `🚨 **Market Update**: ${market.question || marketId}\n**${data.outcome}**: ${(Number.parseFloat(data.price) * 100).toFixed(1)}% (${priceChange > 0 ? "+" : ""}${(priceChange * 100).toFixed(1)}%)`,
          })
          .catch(console.error)
      }
    }

    polymarketService.subscribeToMarket(marketId, callback)

    setTimeout(() => {
      polymarketService.unsubscribeFromMarket(marketId, callback)
    }, 3600000)
  },
}

// Help command
const helpCommand = {
  data: new SlashCommandBuilder().setName("help").setDescription("Learn how to use PolyCBT"),
  execute: async (interaction) => {
    const embed = {
      color: 0x7c3aed,
      title: "🤖 PolyCBT - Your Polymarket Prediction Assistant",
      description: "I analyze real-time Polymarket data using AI to provide predictions and insights.",
      fields: [
        {
          name: "📊 Commands",
          value: `\`/predict [market]\` - Get AI prediction for a market
\`/markets [limit]\` - View top active markets
\`/ask [question]\` - Ask me anything about prediction markets
\`/track [market]\` - Get real-time updates for a market
\`/help\` - Show this help message`,
          inline: false,
        },
        {
          name: "🎯 About Me",
          value:
            "I'm PolyCBT, powered by Mistral AI and connected to live Polymarket data. I analyze market trends, probabilities, and provide data-driven predictions.",
          inline: false,
        },
        {
          name: "🔗 Data Source",
          value: "Real-time data from [Polymarket](https://polymarket.com)",
          inline: false,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "PolyCBT • Powered by Mistral AI & Polymarket",
      },
    }

    await interaction.reply({ embeds: [embed] })
  },
}

export const commands = [predictCommand, marketsCommand, askCommand, trackCommand, helpCommand]
