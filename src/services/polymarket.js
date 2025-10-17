export class PolymarketService {
  constructor() {
    this.gammaUrl = "https://gamma-api.polymarket.com"
  }

  async fetchActiveEvents() {
    try {
      console.log("[Polymarket Bot] Fetching events from Gamma API...")
      const response = await fetch(`${this.gammaUrl}/events?limit=100&active=true`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const events = await response.json()
      console.log(`[Polymarket Bot] Fetched ${events.length} events`)

      // Filter for active, non-closed events with volume
      const activeEvents = events.filter(
        (event) => event.active === true && event.closed === false && event.archived === false && event.volume > 0,
      )

      // Sort by volume (highest first)
      activeEvents.sort((a, b) => Number.parseFloat(b.volume) - Number.parseFloat(a.volume))

      console.log(`[Polymarket Bot] ${activeEvents.length} active events after filtering`)
      return activeEvents
    } catch (error) {
      console.error("[Polymarket Bot] Error fetching events:", error)
      return []
    }
  }

  async getTop3Markets() {
    try {
      const events = await this.fetchActiveEvents()

      if (!events || events.length === 0) {
        return null
      }

      // Return top 3 events
      return events.slice(0, 3).map((event) => this.formatEventForDiscord(event))
    } catch (error) {
      console.error("[Polymarket Bot] Error fetching top 3 markets:", error)
      return null
    }
  }

  formatEventForDiscord(event) {
    const volumeInM = (Number.parseFloat(event.volume) / 1000000).toFixed(2)

    return {
      title: event.title,
      volume: `$${volumeInM}M`,
      active: event.active,
      slug: event.slug,
      url: `https://polymarket.com/event/${event.slug}`,
    }
  }

  formatMarketContext(events) {
    // Format top 5 events for AI context
    return events
      .slice(0, 5)
      .map((event, idx) => {
        const volumeInM = (Number.parseFloat(event.volume) / 1000000).toFixed(2)
        return `${idx + 1}. "${event.title}" - Volume: $${volumeInM}M, Active: ${event.active}`
      })
      .join("\n")
  }
}
