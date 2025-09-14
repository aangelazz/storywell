# Storywell Backend Setup & Usage Guide 🚀

## Quick Start

### 1. Install Node.js
If you don't have Node.js installed:
- Visit [nodejs.org](https://nodejs.org/)
- Download and install the latest LTS version

### 2. Setup Backend
```bash
cd backend
npm install
```

### 3. Start Backend Server
```bash
npm start
```

You should see:
```
🚀 Storywell backend server running on port 3001
🔗 Frontend can connect to: http://localhost:3001
🔑 Claude API key configured: true
```

### 4. Test Your Frontend
1. Keep backend running in one terminal
2. In another terminal, start your frontend:
   ```bash
   npx http-server
   ```
3. Visit `http://localhost:8080/app.html`
4. Record a story and watch the magic! ✨

## How It Works

- **Frontend** (port 8080): Your web app
- **Backend** (port 3001): Handles Claude API calls
- **No CORS issues**: Backend acts as a proxy

## Endpoints

- `POST /api/generate-story` - Generate kid-friendly story
- `GET /api/health` - Check if backend is working

## Deployment

For production, you'll need to deploy the backend to a service like:
- Heroku
- Vercel
- Railway
- DigitalOcean

Then update the `backendUrl` in `claude-ai.js` to your deployed backend URL.

## Troubleshooting

**Backend won't start?**
- Make sure Node.js is installed: `node --version`
- Check if port 3001 is free: `lsof -i :3001`

**Frontend can't connect to backend?**
- Make sure backend is running
- Check console for CORS errors
- Verify URL in `claude-ai.js`

**AI not working?**
- Check Claude API key in `.env` file
- Look at backend console for errors
- Test health endpoint: `http://localhost:3001/api/health`