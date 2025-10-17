import fetch from "node-fetch";

export class PolymarketPredictionService {
  constructor(mistralApiKey) {
    this.gammaUrl = "https://gamma-api.polymarket.com/events?limit=50&active=true&closed=false&archived=false";
    this.mistralApiKey = mistralApiKey;
  }

  async fetchPolymarketMarkets() {
    try {
      const res = await fetch(this.gammaUrl, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Polymarket API error: ${res.status}`);
      const data = await res.json();

      let events = [];
      if (Array.isArray(data)) events = data;
      else if (Array.isArray(data.data)) events = data.data;
      else if (Array.isArray(data.events)) events = data.events;

      return events
        .filter((e) => e.active && !e.closed && !e.archived)
        .sort((a, b) => Number.parseFloat(b.volume || 0) - Number.parseFloat(a.volume || 0));
    } catch (err) {
      console.error("Polymarket fetch error:", err.message);
      return [];
    }
  }

  async generatePrediction(query) {
    const events = await this.fetchPolymarketMarkets();
    if (!events.length) return "No active markets found. Try again later.";

    const topEvent = events[0];
    const mainMarket = topEvent.markets[0];
    const yesPrice = mainMarket ? (Number.parseFloat(mainMarket.outcomePrices[0] || 0) * 100).toFixed(1) : "N/A";
    const volume = (Number.parseFloat(topEvent.volume || "0") / 1_000_000).toFixed(2);

    const eventContext = `Market: ${topEvent.title}
Yes Probability: ${yesPrice}%
24h Volume: $${volume}M
Description: ${topEvent.description?.substring(0, 200) || "N/A"}...`;

    const systemPrompt = `You are a sharp Polymarket prediction analyst. Give concise 2-3 line predictions with key insights. Be conversational and engaging. After each prediction, ask if they want to see more trending markets or get deeper analysis on this one. NO LINKS.`;
    const userPrompt = `User Query: "${query}"\n\nTop Trending Market:\n${eventContext}\nProvide a sharp 2-3 line prediction, then ask if they want more markets or details. Be engaging.`;

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.mistralApiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) throw new Error(`Mistral API error: ${response.status}`);
      const data = await response.json();
      return data.choices[0]?.message?.content || "Unable to generate prediction at this time.";
    } catch (err) {
      console.error("Mistral API error:", err.message);
      return "Market analysis temporarily unavailable. Please try again.";
    }
  }
}
