import type { Client, TextChannel } from "discord.js"
import type { PolymarketClient, Market } from "./polymarket-client"

interface TrackedMarket {
  marketId: string
  channelId: string
  lastPrices: number[]
  threshold: number // Percentage change to trigger alert
}

export class MarketTracker {
  private trackedMarkets: Map<string, TrackedMarket>
  private polymarket: PolymarketClient
  private client: Client
  private intervalId?: NodeJS.Timeout

  constructor(client: Client, polymarket: PolymarketClient) {
    this.trackedMarkets = new Map()
    this.polymarket = polymarket
    this.client = client
  }

  start(intervalMs = 60000): void {
    if (this.intervalId) {
      console.log("[v0] Market tracker already running")
      return
    }

    console.log("[v0] Starting market tracker...")
    this.intervalId = setInterval(() => this.checkMarkets(), intervalMs)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
      console.log("[v0] Market tracker stopped")
    }
  }

  trackMarket(marketId: string, channelId: string, threshold = 5): void {
    this.trackedMarkets.set(marketId, {
      marketId,
      channelId,
      lastPrices: [],
      threshold,
    })
    console.log(`[v0] Now tracking market ${marketId} in channel ${channelId}`)
  }

  untrackMarket(marketId: string): void {
    this.trackedMarkets.delete(marketId)
    console.log(`[v0] Stopped tracking market ${marketId}`)
  }

  getTrackedMarkets(): TrackedMarket[] {
    return Array.from(this.trackedMarkets.values())
  }

  private async checkMarkets(): Promise<void> {
    for (const tracked of this.trackedMarkets.values()) {
      try {
        const market = await this.polymarket.getMarket(tracked.marketId)

        if (!market) {
          console.log(`[v0] Could not fetch market ${tracked.marketId}`)
          continue
        }

        // Check for significant price changes
        if (tracked.lastPrices.length > 0) {
          const changes = market.prices.map((price, i) => {
            const lastPrice = tracked.lastPrices[i] || 0
            return Math.abs(price - lastPrice) * 100
          })

          const maxChange = Math.max(...changes)

          if (maxChange >= tracked.threshold) {
            await this.sendAlert(tracked.channelId, market, maxChange)
          }
        }

        // Update last prices
        tracked.lastPrices = market.prices
      } catch (error) {
        console.error(`[v0] Error checking market ${tracked.marketId}:`, error)
      }
    }
  }

  private async sendAlert(channelId: string, market: Market, change: number): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId)

      if (!channel || !channel.isTextBased()) {
        console.log(`[v0] Channel ${channelId} not found or not text-based`)
        return
      }

      const alert = `🚨 **Market Alert!**\n\n${this.polymarket.formatMarket(market)}\n\n**Price moved ${change.toFixed(1)}%!**`

      await (channel as TextChannel).send(alert)
    } catch (error) {
      console.error("[v0] Error sending alert:", error)
    }
  }
}
