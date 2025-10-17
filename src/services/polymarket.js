import axios from "axios"

export class PolymarketService {
  constructor() {
    this.gammaUrl = "https://gamma-api.polymarket.com"
  }

  async fetchActiveEvents() {
    try {
      console.log("[v0] Fetching events from Gamma API...")
      console.log("[v0] URL:", `${this.gammaUrl}/events?limit=100&active=true`)

      const response = await axios.get(`${this.gammaUrl}/events`, {
        params: {
          limit: 100,
          active: true,
        },
        timeout: 10000, // 10 second timeout
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response data type:", typeof response.data)
      console.log("[v0] Is array:", Array.isArray(response.data))

      const events = Array.isArray(response.data) ? response.data : response.data.data || response.data.events || []

      console.log(`[v0] Total events received: ${events.length}`)

      if (events.length > 0) {
        console.log(`[v0] Sample event keys:`, Object.keys(events[0]))
        console.log(`[v0] Sample event:`, {
          title: events[0].title,
          volume: events[0].volume,
          active: events[0].active,
          closed: events[0].closed,
        })
      }

      const activeEvents = events.filter((event) => {
        const hasVolume = event.volume && Number.parseFloat(event.volume) > 0
        const notClosed = event.closed !== true
        const isActive = event.active !== false

        if (hasVolume && notClosed && isActive) {
          console.log(
            `[v0] ✓ Including: "${event.title?.substring(0, 40)}..." - Volume: $${(Number.parseFloat(event.volume) / 1000000).toFixed(2)}M`,
          )
        }

        return hasVolume && notClosed && isActive
      })

      // Sort by volume (highest first)
      activeEvents.sort((a, b) => Number.parseFloat(b.volume || 0) - Number.parseFloat(a.volume || 0))

      console.log(`[v0] ✓ ${activeEvents.length} active events after filtering`)

      return activeEvents
    } catch (error) {
      console.error("[v0] ❌ Error fetching events:")
      console.error("[v0] Error message:", error.message)
      if (error.response) {
        console.error("[v0] Response status:", error.response.status)
        console.error("[v0] Response data:", error.response.data)
      } else if (error.request) {
        console.error("[v0] No response received from API")
        console.error("[v0] Request details:", error.request)
      } else {
        console.error("[v0] Error setting up request:", error.message)
      }
      return []
    }
  }

  async getTop3Markets() {
    try {
      const events = await this.fetchActiveEvents()

      if (!events || events.length === 0) {
        console.log("[v0] No events available for top 3 markets")
        return null
      }

      console.log(`[v0] Returning top 3 markets from ${events.length} total events`)
      // Return top 3 events
      return events.slice(0, 3).map((event) => this.formatEventForDiscord(event))
    } catch (error) {
      console.error("[v0] Error in getTop3Markets:", error)
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
