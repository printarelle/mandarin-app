# 路上中文 · Mandarin for the Road

## Deploy to Vercel in 5 minutes

### Step 1 — GitHub
1. Go to github.com and create a free account if you don't have one
2. Click the + button → New repository
3. Name it `mandarin-app`, keep it Public, click Create
4. Click "uploading an existing file", drag ALL files from this zip into the uploader
5. Commit changes

### Step 2 — Vercel
1. Go to vercel.com, sign up free with your GitHub account
2. Click Add New → Project
3. Find `mandarin-app` in the list, click Import
4. Before clicking Deploy, click Environment Variables and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (get one free at console.anthropic.com)
5. Click Deploy

### Step 3 — Use it
- Vercel gives you a URL like `mandarin-app.vercel.app`
- Open in Chrome on your phone
- Tap the three-dot menu → Add to Home screen
- It works like a native app from your home screen

## How audio works
- Every 🔊 button sends the Chinese text to `/api/tts`
- The Vercel function fetches the audio from Youdao (Chinese TTS server)
- Audio is decoded and played via Web Audio API (the same engine as the beep test)
- Falls back to tone-pattern sounds if network is unavailable

## Files
```
public/index.html   — the full app
api/tts.js          — audio proxy (fetches Youdao TTS server-side)
api/chat.js         — Anthropic API proxy for the Speak/conversation tab
package.json        — tells Vercel this is a Node project
```

## v19+ Build Notes
The app is now pre-compiled. Vercel runs `npm run build` automatically on each deploy.
You do NOT need to commit `bundle.js` or `node_modules` — Vercel creates the bundle during deployment.

Files to commit to GitHub:
- src/app.jsx
- public/index.html
- api/*.js
- package.json
- vercel.json
- .gitignore
