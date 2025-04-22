import Mistral from "@mistralai/mistralai"

export class MistralAI {
  private client: Mistral
  private conversationHistory: Map<string, Array<{ role: string; content: string }>>

  constructor() {
    const apiKey = process.env.SDK_AUTH_PLACEHOLDER
    if (!apiKey) {
      throw new Error("SDK_AUTH_PLACEHOLDER is not set")
    }

    this.client = new Mistral({ apiKey })
    this.conversationHistory = new Map()
  }

  async chat(prompt: string, userId?: string): Promise<string> {
    try {
      const systemPrompt = `You are a witty and knowledgeable prediction market analyst bot. You help users understand Polymarket markets with humor and insight. You're enthusiastic about prediction markets and love discussing probabilities, market dynamics, and making predictions. Keep responses concise and engaging.`

      // Get or create conversation history for this user
      const history = userId ? this.conversationHistory.get(userId) || [] : []

      const messages = [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: prompt }]

      const response = await this.client.chat.complete({
        model: "mistral-large-latest",
        messages: messages as any,
        temperature: 0.7,
        maxTokens: 500,
      })

      const reply = response.choices?.[0]?.message?.content || "Sorry, I could not generate a response."

      // Update conversation history (keep last 10 messages)
      if (userId) {
        history.push({ role: "user", content: prompt })
        history.push({ role: "assistant", content: reply })
        if (history.length > 10) {
          history.splice(0, history.length - 10)
        }
        this.conversationHistory.set(userId, history)
      }

      return reply
    } catch (error) {
      console.error("[v0] Error with Mistral AI:", error)
      return "Oops! My prediction circuits are overloaded. Try again in a moment!"
    }
  }

  async analyzeMarket(marketData: string): Promise<string> {
    const prompt = `Analyze this prediction market and provide insights:\n\n${marketData}\n\nProvide a brief, witty analysis covering: key factors, probability assessment, and potential value.`
    return this.chat(prompt)
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId)
  }
}
