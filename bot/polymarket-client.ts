import { ClobClient } from "@polymarket/clob-client"

export interface Market {
  id: string
  question: string
  description: string
  outcomes: string[]
  prices: number[]
  volume: number
  liquidity: number
  endDate: string
}

export class PolymarketClient {
  private client: ClobClient

  constructor() {
    // Initialize with public read-only access
    this.client = new ClobClient(
      "https://clob.polymarket.com",
      137, // Polygon mainnet
      undefined, // No private key needed for read-only
    )
  }

  async getMarket(marketId: string): Promise<Market | null> {
    try {
      const market = await this.client.getMarket(marketId)

      return {
        id: market.condition_id,
        question: market.question,
        description: market.description || "",
        outcomes: market.outcomes,
        prices: market.outcomes.map((_, i) => market.outcomePrices?.[i] || 0),
        volume: market.volume || 0,
        liquidity: market.liquidity || 0,
        endDate: market.end_date_iso || "",
      }
    } catch (error) {
      console.error("[v0] Error fetching market:", error)
      return null
    }
  }

  async searchMarkets(query: string, limit = 5): Promise<Market[]> {
    try {
      const markets = await this.client.getMarkets()

      // Filter markets by query
      const filtered = markets
        .filter(
          (m) =>
            m.question.toLowerCase().includes(query.toLowerCase()) ||
            m.description?.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, limit)

      return filtered.map((market) => ({
        id: market.condition_id,
        question: market.question,
        description: market.description || "",
        outcomes: market.outcomes,
        prices: market.outcomes.map((_, i) => market.outcomePrices?.[i] || 0),
        volume: market.volume || 0,
        liquidity: market.liquidity || 0,
        endDate: market.end_date_iso || "",
      }))
    } catch (error) {
      console.error("[v0] Error searching markets:", error)
      return []
    }
  }

  async getTrendingMarkets(limit = 10): Promise<Market[]> {
    try {
      const markets = await this.client.getMarkets()

      // Sort by volume and take top N
      const trending = markets.sort((a, b) => (b.volume || 0) - (a.volume || 0)).slice(0, limit)

      return trending.map((market) => ({
        id: market.condition_id,
        question: market.question,
        description: market.description || "",
        outcomes: market.outcomes,
        prices: market.outcomes.map((_, i) => market.outcomePrices?.[i] || 0),
        volume: market.volume || 0,
        liquidity: market.liquidity || 0,
        endDate: market.end_date_iso || "",
      }))
    } catch (error) {
      console.error("[v0] Error fetching trending markets:", error)
      return []
    }
  }

  formatMarket(market: Market): string {
    const priceInfo = market.outcomes
      .map((outcome, i) => `${outcome}: ${(market.prices[i] * 100).toFixed(1)}%`)
      .join(" | ")

    return `**${market.question}**\n${priceInfo}\nVolume: $${(market.volume / 1000).toFixed(1)}K | Liquidity: $${(market.liquidity / 1000).toFixed(1)}K`
  }
}
