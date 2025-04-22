import { WebSocket } from "ws"

export class PolymarketService {
  constructor() {
    this.ws = null
    this.markets = new Map()
    this.subscribers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.wsUrl = process.env.SDK_AUTH_PLACEHOLDER || "wss://ws-subscriptions-clob.polymarket.com/ws/market"
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl)

        this.ws.on("open", () => {
          console.log("📡 Connected to Polymarket WebSocket")
          this.reconnectAttempts = 0
          resolve()
        })

        this.ws.on("message", (data) => {
          try {
            const message = JSON.parse(data.toString())
            this.handleMessage(message)
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        })

        this.ws.on("error", (error) => {
          console.error("WebSocket error:", error)
          reject(error)
        })

        this.ws.on("close", () => {
          console.log("🔌 Disconnected from Polymarket WebSocket")
          this.attemptReconnect()
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      console.log(
        `🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`,
      )

      setTimeout(() => {
        this.connect().catch(console.error)
      }, delay)
    } else {
      console.error("❌ Max reconnection attempts reached")
    }
  }

  handleMessage(message) {
    if (message.event_type === "price_change" || message.type === "market") {
      const marketData = {
        market: message.market || message.condition_id,
        asset_id: message.asset_id || message.token_id,
        price: message.price,
        side: message.side,
        size: message.size || "0",
        timestamp: message.timestamp || Date.now(),
        outcome: message.outcome,
      }

      this.updateMarketCache(marketData)

      const subscribers = this.subscribers.get(marketData.market)
      if (subscribers) {
        subscribers.forEach((callback) => callback(marketData))
      }
    }
  }

  updateMarketCache(data) {
    const existing = this.markets.get(data.market)

    if (existing) {
      if (data.outcome) {
        existing.prices[data.outcome] = Number.parseFloat(data.price)
      }
      existing.lastUpdate = data.timestamp
    } else {
      this.markets.set(data.market, {
        condition_id: data.market,
        question: data.market,
        outcomes: data.outcome ? [data.outcome] : [],
        prices: data.outcome ? { [data.outcome]: Number.parseFloat(data.price) } : {},
        volume: Number.parseFloat(data.size),
        lastUpdate: data.timestamp,
      })
    }
  }

  subscribeToMarket(marketId, callback) {
    if (!this.subscribers.has(marketId)) {
      this.subscribers.set(marketId, new Set())
    }

    this.subscribers.get(marketId).add(callback)

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          market: marketId,
        }),
      )
    }
  }

  unsubscribeFromMarket(marketId, callback) {
    const subscribers = this.subscribers.get(marketId)
    if (subscribers) {
      subscribers.delete(callback)

      if (subscribers.size === 0) {
        this.subscribers.delete(marketId)

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(
            JSON.stringify({
              type: "unsubscribe",
              market: marketId,
            }),
          )
        }
      }
    }
  }

  getMarket(marketId) {
    return this.markets.get(marketId)
  }

  getAllMarkets() {
    return Array.from(this.markets.values())
  }

  getTopMarkets(limit = 10) {
    return Array.from(this.markets.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, limit)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.subscribers.clear()
  }
}
