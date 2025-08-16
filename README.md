# URL Shortener

A minimal URL shortener built with Express + MongoDB (via Mongoose) and a Vite + React client.

- POST /api/shorten { longUrl, custom? } -> { code, shortUrl }
- GET /:code -> 302 redirect to original URL
- GET /api/stats/:code -> metadata

Data persistence:
- Uses MongoDB for lifetime storage of short links.
- On first run, if the database is empty and `Server/data.json` exists, the server will migrate existing entries into MongoDB automatically.

## Prerequisites

- Node.js 18+ (22+ recommended)
- MongoDB running locally OR MongoDB Atlas account

### MongoDB Setup Options:

**Option 1: Local MongoDB**
- Install MongoDB Community Server from https://www.mongodb.com/try/download/community
- Start MongoDB service (usually `mongod` or as a Windows service)
- Use default connection: `mongodb://127.0.0.1:27017/url_shortener`

**Option 2: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Replace the MONGODB_URI in `Server/.env`

## Quick start (two terminals)

1) Backend

```bash
cd Server
cp .env.example .env   # adjust if needed; default points to local MongoDB
npm install
npm run dev             # starts Express on http://localhost:3000
```

2) Frontend

```bash
cd Client
npm install
npm run dev             # starts Vite on http://localhost:5173 with /api proxy to :3000
```

Open the client at http://localhost:5173. The Vite dev server proxies `/api/*` to the backend.

## Production build (serve client from Express)

```bash
cd Server
npm run build   # builds Client to Client/dist
npm run start   # Express serves API and static files from Client/dist
```

## Configuration

Set `MONGODB_URI` in `Server/.env` (or environment) to point to your MongoDB instance.

Examples:

```
# Local
MONGODB_URI=mongodb://127.0.0.1:27017/url_shortener

# Atlas
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority&appName=<app>
```

## Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Create a new **Web Service** on Render
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `Server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variable: `MONGODB_URI` (your MongoDB Atlas connection string)
6. Deploy!

### Deploy Frontend to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. From project root: `vercel`
3. Follow prompts to deploy
4. Vercel will automatically build the client and serve it

**Alternative: Full-stack on Render**
- Use the root directory and Render will run both build and start commands
- The Express server serves both API and static client files

### Environment Variables for Production

Set these in your deployment platform:

```
MONGODB_URI=mongodb+srv://...  (your MongoDB Atlas connection)
NODE_ENV=production
PORT=3000  (or let platform set it)
```

## Notes

- Custom short codes must match `[A-Za-z0-9_-]{3,30}` and are unique.
- `GET /api/stats/:code` returns creation time and click count.
- The backend normalizes URLs by prepending `http://` if no scheme is provided.
