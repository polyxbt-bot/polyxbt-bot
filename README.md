# PolyXBT Discord Bot

An autonomous prediction-market analyst AI Discord bot that fetches live Polymarket data and provides sharp insights with witty, degen-style commentary.

## Features

- **Live Polymarket Data**: Fetches real-time market data via the Gamma API
- **AI-Powered Analysis**: Uses Mistral AI to generate insightful commentary
- **Automated Hourly Posts**: Posts top 3 markets every hour to your Discord channel
- **Real-time Responses**: Replies to mentions and `!predict` command instantly
- **Rich Embeds**: Beautiful Discord embeds with market data and analysis
- **No Trading Keys Required**: Uses public APIs only

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Discord Bot Token
- Mistral AI API Key
- Discord Channel ID (for automated posts)

### Step 1: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and name it "PolyXBT"
3. Go to "Bot" section and click "Add Bot"
4. Enable these Privileged Gateway Intents:
   - **Message Content Intent** (required)
   - Server Members Intent (optional)
5. Copy the Bot Token
6. Copy the Application ID (Client ID)

### Step 2: Invite Bot to Server

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - Send Messages
   - Embed Links
   - Read Messages/View Channels
   - Read Message History
4. Copy the generated URL and open it in browser to invite bot

### Step 3: Get Channel ID

1. Enable Developer Mode in Discord (Settings > Advanced > Developer Mode)
2. Right-click the channel where you want hourly posts
3. Click "Copy Channel ID"

### Step 4: Get Mistral AI API Key

1. Go to [Mistral AI Console](https://console.mistral.ai/)
2. Sign up and create an API key
3. Add credits to your account (very affordable - ~$0.002 per 1K tokens)

### Step 5: Configure Environment

1. Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Fill in your credentials in `.env`:
   \`\`\`env
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_CLIENT_ID=your_discord_client_id_here
   DISCORD_CHANNEL_ID=your_channel_id_here
   MISTRAL_API_KEY=your_mistral_api_key_here
   \`\`\`

### Step 6: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 7: Run the Bot

Development mode (with auto-reload):
\`\`\`bash
npm run dev
\`\`\`

Production mode:
\`\`\`bash
npm start
\`\`\`

## Deploy to Railway

Railway provides free hosting for Discord bots with no local machine needed.

### Quick Deploy

1. Push your code to GitHub
2. Go to [Railway](https://railway.app/)
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in Railway dashboard:
   - `DISCORD_BOT_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CHANNEL_ID`
   - `MISTRAL_API_KEY`
6. Deploy!

### Railway Configuration

The bot includes `railway.json` and `nixpacks.toml` for automatic deployment configuration.

## Commands

- `!predict` - Ask PolyXBT about market predictions
- `!help` - Show available commands
- `!about` - Learn about PolyXBT
- `!markets` - Get top 3 trending Polymarket markets
- `!clear` - Clear conversation history

You can also mention the bot directly: `@PolyXBT what's trending?`

## Usage

### Chat with PolyXBT

Simply mention the bot or use the `!predict` command:

\`\`\`
@PolyXBT what's pumping on Polymarket right now?
!predict what are the top markets?
\`\`\`

### Get Market Data

\`\`\`
!markets
\`\`\`

### Search Markets

\`\`\`
!search trump
!search bitcoin
!search AI regulation
\`\`\`

### Automated Posts

The bot automatically posts the top 3 markets every hour to the configured channel with AI-generated commentary.

## Character Personality

PolyXBT is designed to:
- Speak like a data analyst with meme IQ
- Never give investment advice
- Use percentages and odds to explain sentiment
- Be short, analytical, and witty
- Mix stats with humor
- Stay probabilistic, never emotional
- Make prediction markets sound alive

## Project Structure

\`\`\`
polyxbt-discord-bot/
├── src/
│   ├── config/
│   │   └── character.js      # Character configuration
│   ├── services/
│   │   ├── ai.js             # Mistral AI
│   │   ├── polymarket.js     # Polymarket Gamma API
│   │   └── scheduler.js      # Hourly posting scheduler
│   ├── commands/
│   │   └── index.js          # Bot commands
│   └── index.js              # Main bot entry point
├── .env.example              # Environment variables template
├── railway.json              # Railway deployment config
├── nixpacks.toml             # Nixpacks build config
├── package.json              # Dependencies
└── README.md                 # This file
\`\`\`

## API Information

### Polymarket Gamma API

- **Base URL**: `https://gamma-api.polymarket.com`
- **Endpoint**: `/events?limit=100&active=true`
- **Public Access**: No API key required
- **Filtering**: Active, non-closed, non-archived events with volume > 0
- **Sorting**: By volume (highest first)

### Mistral AI

- **Model**: `mistral-small-latest`
- **Cost**: ~$0.002 per 1K tokens (very affordable)
- **Speed**: Fast response times
- **Quality**: Excellent for short, engaging predictions
- **Max Tokens**: 150 per response (keeps responses concise)

## Customization

### Modify Character Personality

Edit `src/config/character.js` to adjust:
- System prompt
- Bio and lore
- Message examples
- Style guidelines
- Topics and adjectives

### Change Posting Frequency

Edit `src/services/scheduler.js` line 23:
\`\`\`js
// Change 3600000 (1 hour) to your desired interval in milliseconds
this.intervalId = setInterval(() => {
  this.postMarketUpdate()
}, 3600000) // 1 hour = 3600000ms
\`\`\`

### Add New Commands

Add new commands in `src/commands/index.js`:

\`\`\`js
export const commands = {
  mycommand: {
    name: 'mycommand',
    description: 'My custom command',
    execute: async (message, args, services) => {
      await message.reply('Response here');
    }
  }
};
\`\`\`

### Change AI Model

Edit `src/services/ai.js` line 47:
\`\`\`js
// Change model to mistral-medium-latest or mistral-large-latest
model: "mistral-small-latest",
\`\`\`

## Troubleshooting

### Bot doesn't respond
- Check that Message Content Intent is enabled in Discord Developer Portal
- Verify bot has proper permissions in your server
- Check console for error messages
- Try using `!predict` command instead of just mentioning

### Hourly posts not working
- Verify `DISCORD_CHANNEL_ID` is set correctly in `.env`
- Check bot has permission to send messages in that channel
- Look for scheduler logs in console

### API errors
- Mistral AI: Check your API key and account credits at console.mistral.ai
- Polymarket: Public API should work without authentication

### Railway deployment issues
- Ensure all environment variables are set in Railway dashboard
- Check deployment logs for errors
- Verify Node.js version compatibility

## Cost Estimate

- **Railway Hosting**: Free tier available (500 hours/month)
- **Mistral AI API**: ~$0.50-2.00/month for typical usage
- **Polymarket API**: Free (public access)

**Total**: ~$0.50-2.00/month

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
