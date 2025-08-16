import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import cors from 'cors';
import mongoose from 'mongoose';
import Url from './models/Url.js';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/url_shortener';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);

// MongoDB connection
mongoose
  .connect(MONGODB_URI, {
    dbName: new URL(MONGODB_URI).pathname.replace(/^\//, '') || 'url_shortener',
  })
  .then(async () => {
    console.log('Connected to MongoDB');
    // optional one-time migration from legacy file store
    try {
      const count = await Url.estimatedDocumentCount();
      if (count === 0) {
        const raw = await fs.readFile(DATA_FILE, 'utf-8').catch(() => null);
        if (raw) {
          const db = JSON.parse(raw);
          const docs = Object.entries(db).map(([code, v]) => ({
            code,
            url: v.url,
            clicks: v.clicks || 0,
            createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
          }));
          if (docs.length) {
            await Url.insertMany(docs, { ordered: false }).catch(() => {});
            console.log(`Migrated ${docs.length} short links from data.json`);
          }
        }
      }
    } catch (e) {
      // ignore migration errors
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// In production, serve client build
const clientDist = path.join(__dirname, '..', 'Client', 'dist');
app.use(express.static(clientDist));

function normalizeUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

app.post('/api/shorten', async (req, res) => {
  const { longUrl, custom } = req.body || {};
  if (!longUrl || typeof longUrl !== 'string') {
    return res.status(400).json({ error: 'longUrl is required' });
  }
  const normalized = normalizeUrl(longUrl.trim());
  let code = (custom || '').trim();
  if (code) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid custom code' });
    }
    // custom path: fail if taken
    const exists = await Url.findOne({ code }).lean();
    if (exists) return res.status(409).json({ error: 'Code already in use' });
    await Url.create({ code, url: normalized });
  } else {
    // auto-generate and retry on rare duplicate
    let attempts = 0;
    while (attempts < 5) {
      const candidate = nanoid(7);
      try {
        await Url.create({ code: candidate, url: normalized });
        code = candidate;
        break;
      } catch (err) {
        if (err && err.code === 11000) {
          attempts += 1;
          continue;
        }
        throw err;
      }
    }
    if (!code) return res.status(500).json({ error: 'Could not allocate code, try again' });
  }
  const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
  res.json({ code, shortUrl });
});

app.get('/api/stats/:code', async (req, res) => {
  const entry = await Url.findOne({ code: req.params.code }).lean();
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json({ code: entry.code, url: entry.url, clicks: entry.clicks, createdAt: entry.createdAt });
});

app.get('/:code', async (req, res) => {
  const { code } = req.params;
  const entry = await Url.findOneAndUpdate(
    { code },
    { $inc: { clicks: 1 } },
    { new: true }
  );
  if (!entry) return res.status(404).send('Short URL not found');
  res.redirect(entry.url);
});

// Fallback to client for any other route (so React Router would work if added)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`URL Shortener running on http://localhost:${PORT}`);
});
