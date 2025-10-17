import axios from "axios";

export class PolymarketService {
  constructor() {
    this.gammaUrl = "https://gamma-api.polymarket.com";
  }

  /**
   * Fetch all active events from Polymarket
   */
  async fetchActiveEvents() {
    try {
      console.log("[Polymarket] Fetching events...");

      const response = await axios.get(`${this.gammaUrl}/events`, {
        params: { limit: 100, active: true },
        timeout: 10000,
      });

      // DEBUG: log raw API response
      console.log("[Polymarket] Raw response:", JSON.stringify(response.data, null, 2));

      // Parse response correctly depending on API structure
      const events =
        Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.result)
          ? response.data.result
          : Array.isArray(response.data.data)
          ? response.data.data
          : [];

      if (!events.length) {
        console.log("[Polymarket] No events returned from API");
        return [];
      }

      // Filter active events with volume > 0 and not closed
      const activeEvents = events.filter((event) => {
        const hasVolume = Number.parseFloat(event.volume || 0) > 0;
        const isActive = event.active !== false;
        const notClosed = event.closed !== true;
        return hasVolume && isActive && notClosed;
      });

      // Sort by volume descending
      activeEvents.sort((a, b) => Number.parseFloat(b.volume || 0) - Number.parseFloat(a.volume || 0));

      console.log(`[Polymarket] ${activeEvents.length} active events after filtering`);

      return activeEvents;
    } catch (error) {
      console.error("[Polymarket] Error fetching events:", error.message);
      if (error.response) {
        console.error("[Polymarket] Response status:", error.response.status);
        console.error("[Polymarket] Response data:", error.response.data);
      }
      return [];
    }
  }

  /**
   * Return top N markets formatted for Discord
   */
  async getTopMarkets(count = 3) {
    const events = await this.fetchActiveEvents();

    if (!events.length) return [];

    return events.slice(0, count).map((event) => this.formatEventForDiscord(event));
  }

  /**
   * Format a single event for Discord message
   */
  formatEventForDiscord(event) {
    const volumeInM = (Number.parseFloat(event.volume || 0) / 1000000).toFixed(2);

    return {
      title: event.title || "Unknown Event",
      volume: `$${volumeInM}M`,
      active: event.active,
      slug: event.slug,
      url: `https://polymarket.com/event/${event.slug}`,
    };
  }

  /**
   * Provide a simple suggestion for prediction (randomly)
   * Example: “Market X is likely to go YES/NO”
   */
  getPredictionSuggestion(event) {
    if (!event) return "No market data available to suggest.";

    // Pick random YES or NO
    const options = ["YES", "NO"];
    const choice = options[Math.floor(Math.random() * options.length)];

    return `For "${event.title}", my suggestion is: **${choice}**. 🔮`;
  }

  /**
   * Prepare context string for AI / Discord replies
   */
  formatMarketContext(events, limit = 5) {
    return events
      .slice(0, limit)
      .map((event, idx) => {
        const volumeInM = (Number.parseFloat(event.volume || 0) / 1000000).toFixed(2);
        return `${idx + 1}. "${event.title}" - Volume: $${v
