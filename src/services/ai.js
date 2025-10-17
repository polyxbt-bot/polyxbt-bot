export class AIService {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.baseUrl = "https://api.mistral.ai/v1"
    this.conversationHistory = new Map()
  }

  buildSystemPrompt(marketContext = "") {
    return `You are a Polymarket prediction expert. Analyze markets and provide SHORT, engaging predictions.

RULES:
- Keep responses to 2-3 lines MAX
- Show ONE market at a time
- NO links or URLs in responses
- Be conversational and engaging
- Always ask follow-up questions like "Want to see more?" or "Need details on this one?"
- Focus on volume, trends, and win probability

${marketContext ? `Available markets:\n${marketContext}` : ""}`
  }

  async generateResponse(userId, userMessage, events = []) {
    try {
      // Get or create conversation context for this user
      if (!this.conversationHistory.has(userId)) {
        this.conversationHistory.set(userId, [])
      }

      const conversationHistory = this.conversationHistory.get(userId)

      // Build market context from events
      const marketContext = events.length > 0 ? this.formatMarketContext(events) : ""

      // Build messages array
      const messages = [
        {
          role: "system",
          content: this.buildSystemPrompt(marketContext),
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ]

      console.log("[Polymarket Bot] Generating prediction with Mistral...")

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: messages,
          temperature: 0.7,
          max_tokens: 150,
        }),
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data = await response.json()
      const prediction = data.choices[0].message.content

      // Update conversation history (keep last 6 messages)
      conversationHistory.push({ role: "user", content: userMessage }, { role: "assistant", content: prediction })

      if (conversationHistory.length > 6) {
        conversationHistory.splice(0, 2)
      }

      console.log("[Polymarket Bot] Prediction generated")
      return prediction
    } catch (error) {
      console.error("[Polymarket Bot] Error generating prediction:", error)
      return "Sorry, I encountered an error analyzing the markets. Please try again."
    }
  }

  formatMarketContext(events) {
    return events
      .slice(0, 5)
      .map((event, idx) => {
        const volumeInM = (Number.parseFloat(event.volume) / 1000000).toFixed(2)
        return `${idx + 1}. "${event.title}" - Volume: $${volumeInM}M, Active: ${event.active}`
      })
      .join("\n")
  }

  async generateMarketCommentary(events) {
    try {
      const marketContext = this.formatMarketContext(events)

      const messages = [
        {
          role: "system",
          content: this.buildSystemPrompt(marketContext),
        },
        {
          role: "user",
          content: "Give me a quick take on the top trending markets right now. Keep it short and engaging.",
        },
      ]

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: messages,
          temperature: 0.7,
          max_tokens: 150,
        }),
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error("[Polymarket Bot] Error generating commentary:", error)
      return "Markets are moving. Volume is flowing. Probabilities are shifting. 📊"
    }
  }

  clearHistory(userId) {
    this.conversationHistory.delete(userId)
  }
}
