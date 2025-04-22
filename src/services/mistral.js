import Mistral from "@mistralai/mistralai"

export class MistralService {
  constructor(apiKey) {
    this.client = new Mistral({ apiKey })
    this.systemPrompt = `You are PolyCBT, an expert Polymarket prediction analyst with a confident, analytical personality. 

Your role:
- Analyze Polymarket prediction markets with data-driven insights
- Provide probability assessments based on market data and trends
- Explain your reasoning clearly and concisely
- Use market psychology and statistical analysis in your predictions
- Be confident but acknowledge uncertainty when appropriate
- Keep responses engaging and professional

Style:
- Direct and analytical, but not robotic
- Use market terminology naturally
- Provide specific percentages and data points
- Explain the "why" behind predictions
- Occasionally use phrases like "Based on the current market dynamics..." or "The data suggests..."

Remember: You're analyzing real-time Polymarket data to help users understand prediction markets better.`
  }

  async generatePrediction(marketData, userQuery) {
    try {
      const response = await this.client.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: this.systemPrompt,
          },
          {
            role: "user",
            content: `Market Data:\n${marketData}\n\nUser Question: ${userQuery}`,
          },
        ],
        temperature: 0.7,
        maxTokens: 500,
      })

      return response.choices?.[0]?.message?.content || "Unable to generate prediction at this time."
    } catch (error) {
      console.error("Mistral API error:", error)
      throw new Error("Failed to generate AI prediction")
    }
  }

  async analyzeMarket(marketInfo) {
    const marketSummary = `
Market: ${marketInfo.question || marketInfo.condition_id}
Outcomes: ${JSON.stringify(marketInfo.outcomes)}
Current Prices: ${JSON.stringify(marketInfo.prices)}
Volume: ${marketInfo.volume}
Last Updated: ${new Date(marketInfo.lastUpdate).toLocaleString()}
    `.trim()

    try {
      const response = await this.client.chat.complete({
        model: "mistral-large-latest",
        messages: [
          {
            role: "system",
            content: this.systemPrompt,
          },
          {
            role: "user",
            content: `Analyze this Polymarket market and provide your prediction:\n\n${marketSummary}`,
          },
        ],
        temperature: 0.7,
        maxTokens: 600,
      })

      return response.choices?.[0]?.message?.content || "Unable to analyze market at this time."
    } catch (error) {
      console.error("Mistral API error:", error)
      throw new Error("Failed to analyze market")
    }
  }

  async chat(userMessage, conversationHistory = []) {
    try {
      const messages = [
        {
          role: "system",
          content: this.systemPrompt,
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ]

      const response = await this.client.chat.complete({
        model: "mistral-large-latest",
        messages: messages,
        temperature: 0.7,
        maxTokens: 500,
      })

      return response.choices?.[0]?.message?.content || "I apologize, but I cannot respond at this time."
    } catch (error) {
      console.error("Mistral API error:", error)
      throw new Error("Failed to generate response")
    }
  }
}
