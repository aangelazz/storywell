# Railway Deployment Guide

## 1. Sign up at railway.app

- Connect your GitHub account

## 2. Deploy from GitHub

- Click "Deploy from GitHub repo"
- Select your storywell repository
- Railway will auto-detect the backend folder

## 3. Set Environment Variables

In Railway dashboard:

- Go to Variables tab
- Add: CLAUDE_API_KEY = your-api-key
- Add: PORT = 3001

## 4. Your backend will be live at:

https://your-app-name.railway.app

## 5. Update frontend

Replace the backend URL in claude-ai.js
