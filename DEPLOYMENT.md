# Deployment Guide

## Deploy to Production

### Option 1: Deploy to a VPS (Recommended)

1. **Setup VPS** (DigitalOcean, AWS, etc.)
   \`\`\`bash
   # SSH into your server
   ssh user@your-server-ip
   \`\`\`

2. **Install Node.js**
   \`\`\`bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   \`\`\`

3. **Clone and Setup**
   \`\`\`bash
   git clone your-repo-url
   cd polyxbt-discord-bot
   npm install
   \`\`\`

4. **Configure Environment**
   \`\`\`bash
   nano .env
   # Add your credentials
   \`\`\`

5. **Use PM2 for Process Management**
   \`\`\`bash
   npm install -g pm2
   pm2 start src/index.js --name polyxbt
   pm2 startup
   pm2 save
   \`\`\`

6. **Monitor Logs**
   \`\`\`bash
   pm2 logs polyxbt
   \`\`\`

### Option 2: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub"
3. Select your repository
4. Add environment variables in Railway dashboard
5. Railway will auto-deploy on push

### Option 3: Deploy to Heroku

1. Install Heroku CLI
2. Create new app:
   \`\`\`bash
   heroku create polyxbt-bot
   \`\`\`

3. Set environment variables:
   \`\`\`bash
   heroku config:set DISCORD_BOT_TOKEN=your_token
   heroku config:set OPENAI_API_KEY=your_key
   \`\`\`

4. Deploy:
   \`\`\`bash
   git push heroku main
   \`\`\`

### Option 4: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy

## Environment Variables for Production

Make sure to set these in your hosting platform:

\`\`\`
DISCORD_BOT_TOKEN=your_production_token
DISCORD_CLIENT_ID=your_client_id
OPENAI_API_KEY=your_openai_key
POLYMARKET_API_KEY=your_polymarket_key (optional)
NODE_ENV=production
\`\`\`

## Monitoring

### Health Checks

Add a simple HTTP server for health checks:

\`\`\`js
import http from 'http';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});

server.listen(process.env.PORT || 3000);
\`\`\`

### Logging

Consider using a logging service:
- Papertrail
- Loggly
- DataDog

## Security Best Practices

1. **Never commit `.env` file**
2. **Use environment variables for all secrets**
3. **Enable 2FA on Discord account**
4. **Regularly rotate API keys**
5. **Monitor bot usage and rate limits**
6. **Keep dependencies updated**

## Scaling

For high-traffic bots:
1. Use Redis for conversation history
2. Implement rate limiting
3. Use message queues for processing
4. Consider sharding for 2500+ servers
