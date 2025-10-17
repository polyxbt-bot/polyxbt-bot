import { EmbedBuilder } from "discord.js"

export class SchedulerService {
  constructor(client, aiService, polymarketService, channelId) {
    this.client = client
    this.aiService = aiService
    this.polymarketService = polymarketService
    this.channelId = channelId
    this.intervalId = null
  }

  start() {
    console.log("[Polymarket Bot] Scheduler started - posting every hour")

    // Post immediately on start
    this.postMarketUpdate()

    // Then post every hour (3600000 ms)
    this.intervalId = setInterval(() => {
      this.postMarketUpdate()
    }, 3600000) // 1 hour
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log("[Polymarket Bot] Scheduler stopped")
    }
  }

  async postMarketUpdate() {
    try {
      const channel = await this.client.channels.fetch(this.channelId)

      if (!channel) {
        console.error("[Polymarket Bot] Channel not found:", this.channelId)
        return
      }

      console.log("[Polymarket Bot] Fetching active events for hourly post...")
      const events = await this.polymarketService.fetchActiveEvents()

      if (!events || events.length === 0) {
        console.error("[Polymarket Bot] No market data available")
        return
      }

      // Get top 3 events
      const top3 = events.slice(0, 3)

      console.log("[Polymarket Bot] Generating AI commentary...")
      const commentary = await this.aiService.generateMarketCommentary(events)

      // Create embed
      const embed = new EmbedBuilder()
        .setColor("#8B5CF6") // Purple color
        .setTitle("📊 Top 3 Polymarket Markets")
        .setDescription(commentary)
        .setTimestamp()
        .setFooter({ text: "PolyXBT • Autonomous Market Analyst" })

      top3.forEach((event, i) => {
        const volumeInM = (Number.parseFloat(event.volume) / 1000000).toFixed(2)
        embed.addFields({
          name: `${i + 1}. ${event.title}`,
          value: `Volume: $${volumeInM}M • Active: ${event.active ? "✅" : "❌"}`,
          inline: false,
        })
      })

      await channel.send({ embeds: [embed] })
      console.log("[Polymarket Bot] Market update posted successfully")
    } catch (error) {
      console.error("[Polymarket Bot] Error posting market update:", error)
    }
  }
}
