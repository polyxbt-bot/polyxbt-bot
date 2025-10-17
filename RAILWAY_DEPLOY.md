# Deploy PolyXBT to Railway

This guide walks you through deploying your PolyXBT Discord bot to Railway for 24/7 hosting.

## Why Railway?

- Free tier with 500 hours/month (enough for one bot)
- No credit card required for free tier
- Automatic deployments from GitHub
- Easy environment variable management
- Built-in logging and monitoring

## Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Your Discord bot token and other credentials ready

## Step-by-Step Deployment

### 1. Push Code to GitHub

If you haven't already:

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/polyxbt-bot.git
git push -u origin main
\`\`\`

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your PolyXBT repository
6. Railway will automatically detect it's a Node.js project

### 3. Configure Environment Variables

1. In your Railway project, click on your service
2. Go to "Variables" tab
3. Add the following variables:

\`\`\`
DISCORD_BOT_TOKEN=your_actual_bot_token
DISCORD_CLIENT_ID=your_actual_client_id
DISCORD_CHANNEL_ID=your_actual_channel_id
MISTRAL_API_KEY=your_actual_mistral_api_key
\`\`\`

**Important**: Use your actual values, not the placeholder text!

**Get Mistral API Key**: Go to [console.mistral.ai](https://console.mistral.ai/) to create your API key.

### 4. Deploy

Railway will automatically deploy your bot. You'll see:
- Build logs
- Deployment status
- Runtime logs

### 5. Verify Deployment

1. Check the logs for `[Polymarket Bot] Logged in as...`
2. Go to your Discord server
3. Bot should show as online
4. Test with `!help` command
5. Wait for the first hourly post

## Managing Your Deployment

### View Logs

1. Go to your Railway project
2. Click on your service
3. Click "Deployments" tab
4. Click on the latest deployment
5. View real-time logs

### Update Environment Variables

1. Go to "Variables" tab
2. Edit or add variables
3. Railway will automatically redeploy

### Redeploy

Railway automatically redeploys when you push to GitHub:

\`\`\`bash
git add .
git commit -m "Update bot"
git push
\`\`\`

### Stop/Start Bot

1. Go to your service settings
2. Use the toggle to stop/start the service

## Monitoring

### Check Bot Status

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Deployment history

### Check Logs for Issues

Common log messages:
- `[Polymarket Bot] Logged in as...` - Bot started successfully
- `[Polymarket Bot] Bot is ready to predict!` - Bot is online
- `[Polymarket Bot] Scheduler started` - Hourly posts enabled
- `[Polymarket Bot] Market update posted successfully` - Hourly post successful
- `[Polymarket Bot] Fetched X events` - Successfully fetching market data
- `Error:` - Something went wrong (check the error message)

## Troubleshooting

### Bot shows offline in Discord

1. Check Railway logs for errors
2. Verify `DISCORD_BOT_TOKEN` is correct
3. Ensure bot has proper intents enabled in Discord Developer Portal

### Hourly posts not working

1. Verify `DISCORD_CHANNEL_ID` is correct
2. Check bot has permissions in that channel
3. Look for scheduler errors in logs

### Out of Railway hours

Free tier includes 500 hours/month:
- One bot = ~720 hours/month needed
- Upgrade to Hobby plan ($5/month) for unlimited hours
- Or use execution time limits

### Build fails

1. Check `package.json` is valid
2. Ensure all dependencies are listed
3. Verify Node.js version compatibility

## Cost Management

### Free Tier Limits

- 500 execution hours/month
- $5 credit/month
- Shared CPU/RAM

### Hobby Plan ($5/month)

- Unlimited execution hours
- Better performance
- Priority support

### Optimize Usage

To stay within free tier:
- Use execution time limits
- Deploy only when needed
- Monitor usage in Railway dashboard

## Advanced Configuration

### Custom Start Command

Edit `railway.json`:

\`\`\`json
{
  "deploy": {
    "startCommand": "node src/index.js"
  }
}
\`\`\`

### Environment-Specific Settings

Use Railway's environment feature to create separate staging/production environments.

### Automatic Deployments

Railway automatically deploys on:
- Push to main branch
- Pull request merge
- Manual trigger

Disable auto-deploy in service settings if needed.

## Backup and Recovery

### Export Environment Variables

1. Go to Variables tab
2. Copy all variables to a secure location
3. Never commit `.env` to GitHub

### Database Backups

If you add a database later:
1. Railway provides automatic backups
2. Export data regularly
3. Test restore procedures

## Security Best Practices

1. **Never commit secrets**: Use `.gitignore` for `.env`
2. **Rotate keys regularly**: Update API keys periodically
3. **Monitor logs**: Check for suspicious activity
4. **Use Railway secrets**: For sensitive data
5. **Enable 2FA**: On your Railway account

## Getting Help

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Bot Issues**: Check your repository issues

## Next Steps

After successful deployment:

1. Monitor the first few hourly posts
2. Test all commands in Discord
3. Adjust posting frequency if needed
4. Customize character personality
5. Add more features!

Your PolyXBT bot is now running 24/7 on Railway!
