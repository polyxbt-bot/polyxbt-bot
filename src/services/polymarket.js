export class PolymarketService {
  constructor() {
    this.gammaUrl = "https://gamma-api.polymarket.com"
  }

  async fetchActiveEvents() {
    try {
      console.log("[v0] Fetching events from Gamma API...")
      const response = await fetch(`${this.gammaUrl}/events?limit=100&active=true`)

      if (!response.ok) {
        console.error(`[v0] API returned status: ${response.status}`)
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log(`[v0] Raw API response type:`, typeof data)
      console.log(`[v0] Is array:`, Array.isArray(data))

      const events = Array.isArray(data) ? data : data.data || data.events || []

      console.log(`[v0] Total events received: ${events.length}`)

      if (events.length > 0) {
        console.log(`[v0] Sample event structure:`, JSON.stringify(events[0], null, 2))
      }

      const activeEvents = events.filter((event) => {
        const hasVolume = event.volume && Number.parseFloat(event.volume) > 0
        const isActive = event.active !== false && event.closed !== true

        console.log(`[v0] Event "${event.title?.substring(0, 50)}..." - active: ${isActive}, volume: ${event.volume}`)

        return hasVolume && isActive
      })

      // Sort by volume (highest first)
      activeEvents.sort((a, b) => Number.parseFloat(b.volume || 0) - Number.parseFloat(a.volume || 0))

      console.log(`[v0] ${activeEvents.length} active events after filtering`)

      if (activeEvents.length > 0) {
        console.log(`[v0] Top event: "${activeEvents[0].title}" with volume: ${activeEvents[0].volume}`)
      }

      return activeEvents
    } catch (error) {
      console.error("[v0] Error fetching events:", error.message)
      console.error("[v0] Full error:", error)
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
