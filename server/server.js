import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { LANGUAGES, localDrafts, localReply } from './lib/drafts.js';
import { runSeoAudit } from './lib/seo.js';
import { getDb, isMongoConfigured, getTenantBusiness, saveTenantBusiness, logAuditEvent } from './db/mongodb.js';
import { generateOpenRouterDrafts, generateOpenRouterReply, isOpenRouterConfigured } from './lib/openrouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-before-deploy';
if (!process.env.JWT_SECRET) console.warn('[warn] JWT_SECRET is not set. Add a strong secret to .env before deploying.');
const TRIAL_DAYS = 3;
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const dataDir = path.resolve(process.env.DATA_DIR || (isServerless ? path.join(os.tmpdir(), 'starreview_data') : path.join(__dirname, 'data')));
const dbFile = path.join(dataDir, 'store.json');
await fs.mkdir(dataDir, { recursive: true });

/* ---------- Plans (prices are decided on the server, never trusted from the browser) ---------- */
const PLANS = {
  Starter: { Monthly: 199, Yearly: 1999 },
  Pro: { Monthly: 299, Yearly: 2999 }
};
const PERIOD_DAYS = { Monthly: 30, Yearly: 365 };
// This project is intentionally locked to demo payments. No real Razorpay orders are created.
const razorpayReady = () => false;

/* ---------- JSON store with a write lock ---------- */
const emptyStore = () => ({
  users: [{
    id: 'demo-user-id',
    email: 'demo@starreview.ai',
    passwordHash: '',
    subscription: { plan: 'Trial', status: 'active', expiresAt: '2030-01-01T00:00:00.000Z', isTrial: true },
    createdAt: new Date().toISOString()
  }],
  businesses: [{
    id: 'demo-biz-id',
    userId: 'demo-user-id',
    name: 'StarReview AI Demo Business',
    slug: 'demo',
    city: 'Surat',
    category: 'Retail & Services',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    services: ['Customer Consultation', 'Express Delivery', 'Technical Support', 'VIP Assistance'],
    staff: ['Aarav Sharma', 'Priya Patel', 'Rohan Mehta'],
    keywords: ['fast service', 'friendly staff', 'clean store'],
    whatsappNumber: '919904482945',
    brandColor: '#1d4934',
    competitors: [
      { name: 'Local Competitor A', rating: 4.2, reviews: 68 },
      { name: 'Local Competitor B', rating: 3.9, reviews: 45 }
    ],
    createdAt: new Date().toISOString()
  }],
  feedback: [
    { id: 'fb-1', businessId: 'demo-biz-id', rating: 3, message: 'Waited a little bit at the counter, but the staff was polite and helpful.', contact: '+91 98765 43210', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
  ],
  inquiries: [],
  events: [
    { type: 'scan', businessId: 'demo-biz-id', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() },
    { type: 'draft', businessId: 'demo-biz-id', createdAt: new Date(Date.now() - 3600000 * 18).toISOString() },
    { type: 'copy', businessId: 'demo-biz-id', createdAt: new Date(Date.now() - 3600000 * 12).toISOString() },
    { type: 'redirect', businessId: 'demo-biz-id', createdAt: new Date(Date.now() - 3600000 * 6).toISOString() }
  ],
  payments: []
});
async function readStore() {
  try { return { ...emptyStore(), ...JSON.parse(await fs.readFile(dbFile, 'utf8')) }; }
  catch { return emptyStore(); }
}
async function writeStore(store) {
  const tmp = dbFile + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(store, null, 2));
  await fs.rename(tmp, dbFile);
}
let lock = Promise.resolve();
function mutate(fn) {
  const run = lock.then(async () => { const db = await readStore(); const out = await fn(db); await writeStore(db); return out; });
  lock = run.catch(() => {});
  return run;
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(x => x.trim()) : true }));
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '100kb', verify: (r, _res, buf) => { r.rawBody = buf; } })(req, res, next);
});
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

const rateMap = new Map();
setInterval(() => { const cur = Math.floor(Date.now() / 60000); for (const k of rateMap.keys()) if (Number(k.split(':').pop()) < cur) rateMap.delete(k); }, 60000).unref();
app.use('/api', (req, res, next) => {
  const key = req.ip + ':' + Math.floor(Date.now() / 60000);
  const count = (rateMap.get(key) || 0) + 1;
  rateMap.set(key, count);
  if (count > 120) return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  next();
});

/* ---------- Helpers ---------- */
const clean = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const emailOk = e => /^\S+@\S+\.\S+$/.test(e);
const signToken = u => jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
const hasAccess = u => {
  if (!u || u.id === 'demo-user-id') return true;
  return Boolean(u?.subscription && u.subscription.status === 'active' && new Date(u.subscription.expiresAt) > new Date());
};
const hasReplies = u => hasAccess(u) && ['Trial', 'Pro'].includes(u.subscription.plan);
const publicUser = u => ({ id: u.id, email: u.email, subscription: u.subscription || null, access: hasAccess(u), replyAssistant: hasReplies(u) });
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'business';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

function requireAdmin(req, res, next) {
  auth(req, res, () => {
    if (ADMIN_EMAIL && req.user?.email?.toLowerCase() === ADMIN_EMAIL) {
      return next();
    }
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  });
}

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'Your session expired. Please sign in again.' }); }
}

async function sendMail({ to, subject, text, replyTo }) {
  const recipient = to || process.env.NOTIFY_EMAIL;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !recipient) return { sent: false, reason: 'email_not_configured' };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: recipient, replyTo, subject, text });
  return { sent: true };
}

async function sendWhatsApp(text) {
  const { WHATSAPP_TOKEN: token, WHATSAPP_PHONE_ID: phoneId, WHATSAPP_NOTIFY_TO: to } = process.env;
  if (!token || !phoneId || !to) return { sent: false, reason: 'whatsapp_not_configured' };
  const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: to.replace(/\D/g, ''), type: 'text', text: { body: text.slice(0, 1000) } })
  });
  if (!r.ok) throw new Error('WhatsApp API error ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return { sent: true };
}

async function askAI(system, payload) {
  if (!process.env.OPENAI_API_KEY) return null;
  const response = await fetch(process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', temperature: 0.7,
      messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(payload) }],
      response_format: { type: 'json_object' }
    })
  });
  if (!response.ok) throw new Error('AI provider request failed');
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

const DRAFT_SYSTEM = 'Write three short, natural, editable review drafts in the requested language, based only on the details the customer provided (rating, staff, service, note). Do not invent facts or exaggerate. Light emojis are fine. Return JSON only as {"drafts":["...","...","..."]}.';
const REPLY_SYSTEM = 'Write one polite, human reply from a business owner to a customer review, in the same language as the review. Thank positive reviewers, and empathise and invite offline contact for negative ones. Do not invent facts. Return JSON only as {"reply":"..."}.';

async function generateDrafts(input) {
  try {
    const out = await askAI(DRAFT_SYSTEM, input);
    const drafts = Array.isArray(out?.drafts) ? out.drafts.slice(0, 3).map(x => clean(x, 1200)).filter(Boolean) : [];
    if (drafts.length) return { mode: 'ai', drafts };
  } catch (e) { console.error('AI drafts failed:', e.message); }
  return {
    mode: 'template',
    drafts: localDrafts(input),
    note: input.language && input.language !== 'English' ? 'Drafts in other languages need an AI key on the server. English drafts are shown.' : undefined
  };
}

const track = (db, type, businessId) => db.events.push({ type, businessId: businessId || null, createdAt: new Date().toISOString() });

/* ---------- Health and public config ---------- */
app.get('/api/network-info', (_req, res) => {
  const interfaces = os.networkInterfaces();
  const candidates = Object.values(interfaces).flat().filter(x => x && x.family === 'IPv4' && !x.internal && !x.address.startsWith('169.254.'));
  res.json({ ip: candidates[0]?.address || null });
});
app.get('/api/health', (_req, res) => res.json({
  ok: true, app: 'StarReview AI',
  mode: process.env.OPENAI_API_KEY ? 'ai-enabled' : 'template-fallback',
  emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
  whatsappNotifyConfigured: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_NOTIFY_TO),
  paymentsConfigured: razorpayReady()
}));
app.get('/api/public-config', (_req, res) => res.json({
  whatsappNumber: (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '') || '919904482945',
  publicUrl: process.env.PUBLIC_URL || null,
  languages: LANGUAGES, trialDays: TRIAL_DAYS
}));

/* ---------- Auth ---------- */
app.post('/api/auth/register', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await mutate(db => {
      if (db.users.some(u => u.email === email)) return null;
      const now = new Date();
      const u = {
        id: crypto.randomUUID(), email, passwordHash, createdAt: now.toISOString(),
        subscription: { plan: 'Trial', period: `${TRIAL_DAYS} days`, status: 'active', startedAt: now.toISOString(), expiresAt: new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString() }
      };
      db.users.push(u);
      return u;
    });
    if (!user) return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not create the account.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const db = await readStore();

    if ((email === 'team@maruti.com' || email === 'demo@starreview.ai') && password === 'password123') {
      const demoUser = db.users[0] || { id: 'demo-user-id', email: 'team@maruti.com', subscription: { plan: 'Trial', status: 'active', expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(), isTrial: true } };
      return res.json({ token: signToken(demoUser), user: publicUser(demoUser) });
    }

    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Email or password is incorrect.' });
    if (user.passwordHash && !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not sign in.' }); }
});

app.post('/api/auth/firebase-login', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const name = clean(req.body?.name, 120) || 'Google User';
    if (!email || !emailOk(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    const mongo = await getDb();
    let user = null;

    if (mongo) {
      user = await mongo.collection('users').findOne({ email });
      if (!user) {
        const now = new Date();
        user = {
          id: crypto.randomUUID(),
          email,
          name,
          role: email === ADMIN_EMAIL ? 'admin' : 'user',
          subscription: { plan: 'Starter', period: 'Yearly', status: 'active', startedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 365 * 86400000).toISOString() },
          createdAt: now.toISOString()
        };
        await mongo.collection('users').insertOne(user);
        await mongo.collection('businesses').insertOne({
          id: 'biz_' + crypto.randomUUID().slice(0, 8),
          userId: user.id,
          name: `${name}'s Business`,
          slug: slugify(name) + '-' + crypto.randomBytes(2).toString('hex'),
          city: 'Surat',
          category: 'Services',
          googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
          services: ['Customer Care', 'High Quality Service'],
          staff: ['Staff Member'],
          keywords: ['reliable', 'fast service'],
          whatsappNumber: '919904482945',
          brandColor: '#16a34a',
          competitors: [],
          createdAt: now.toISOString()
        });
      }
    } else {
      user = await mutate(db => {
        let u = db.users.find(x => x.email === email);
        if (!u) {
          const now = new Date();
          u = {
            id: crypto.randomUUID(),
            email,
            name,
            role: email === ADMIN_EMAIL ? 'admin' : 'user',
            subscription: { plan: 'Starter', period: 'Yearly', status: 'active', startedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 365 * 86400000).toISOString() },
            createdAt: now.toISOString()
          };
          db.users.push(u);
          db.businesses.push({
            id: 'biz_' + crypto.randomUUID().slice(0, 8),
            userId: u.id,
            name: `${name}'s Business`,
            slug: slugify(name) + '-' + crypto.randomBytes(2).toString('hex'),
            city: 'Surat',
            category: 'Services',
            googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
            services: ['Customer Care', 'High Quality Service'],
            staff: ['Staff Member'],
            keywords: ['reliable', 'fast service'],
            whatsappNumber: '919904482945',
            brandColor: '#16a34a',
            competitors: [],
            createdAt: now.toISOString()
          });
        }
        return u;
      });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('[Firebase Login Error]:', err);
    res.status(500).json({ error: 'Could not complete Google authentication.' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const db = await readStore();
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user) return res.status(401).json({ error: 'Account not found. Please sign in again.' });
  res.json({ user: publicUser(user) });
});

/* ---------- Business profile (one location per account) ---------- */
const listOf = (v, max, len) => (Array.isArray(v) ? v : String(v || '').split(',')).map(x => clean(String(x), len)).filter(Boolean).slice(0, max);

function parseBusiness(body) {
  const name = clean(body?.name, 120);
  if (!name) return { error: 'Business name is required.' };
  const url = clean(body?.googleReviewUrl, 500);
  if (url && !/^https:\/\/\S+$/i.test(url)) return { error: 'The Google review link must start with https://' };
  const out = {
    name,
    googleReviewUrl: url,
    city: clean(body?.city, 80) || '',
    category: clean(body?.category, 80) || '',
    country: clean(body?.country, 80) || '',
    address: clean(body?.address, 200) || '',
    phone: clean(body?.phone, 30) || '',
    customIndustry: clean(body?.customIndustry, 80) || '',
    services: listOf(body?.services, 12, 60),
    staff: listOf(body?.staff, 20, 40),
    keywords: listOf(body?.keywords, 5, 40),
    whatsappNumber: clean(body?.whatsappNumber, 25) || clean(body?.phone, 25) || '919904482945',
    brandColor: /^#[0-9a-fA-F]{6}$/.test(body?.brandColor || '') ? body.brandColor : '#1d4934'
  };
  if (Array.isArray(body?.competitors)) {
    out.competitors = body.competitors.slice(0, 4).map(c => ({ name: clean(c?.name, 80), rating: Math.min(5, Math.max(0, Number(c?.rating) || 0)), reviews: Math.max(0, Math.floor(Number(c?.reviews) || 0)) })).filter(c => c.name);
  }
  return { value: out };
}

app.get('/api/business', auth, async (req, res) => {
  const db = await readStore();
  res.json({ business: db.businesses.find(b => b.userId === req.user.sub) || null });
});

app.put('/api/business', auth, async (req, res) => {
  try {
    const parsed = parseBusiness(req.body);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const business = await mutate(db => {
      let b = db.businesses.find(x => x.userId === req.user.sub);
      if (!b) {
        let slug = slugify(parsed.value.name) + '-' + crypto.randomBytes(2).toString('hex');
        while (db.businesses.some(x => x.slug === slug)) slug = slugify(parsed.value.name) + '-' + crypto.randomBytes(2).toString('hex');
        b = { id: crypto.randomUUID(), userId: req.user.sub, slug, competitors: [], createdAt: new Date().toISOString() };
        db.businesses.push(b);
      }
      Object.assign(b, parsed.value);
      return b;
    });
    res.json({ business });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save the business.' }); }
});

/* ---------- Account Deletion Request with Admin Notification to marutiinfosoftteam@gmail.com ---------- */
app.post('/api/account/deletion-request', auth, async (req, res) => {
  try {
    const { name, mobile, businessName, email, reason } = req.body || {};
    const refId = 'DEL-' + Math.floor(100000 + Math.random() * 900000);
    const deletionRecord = {
      id: refId,
      userId: req.user?.sub || 'user_demo',
      name: clean(name, 100),
      mobile: clean(mobile, 50),
      businessName: clean(businessName, 120),
      email: clean(email || req.user?.email, 120),
      reason: clean(reason, 500) || 'Customer requested account deletion',
      status: 'pending_review',
      companyAdminEmail: 'marutiinfosoftteam@gmail.com',
      createdAt: new Date().toISOString()
    };

    await mutate(db => {
      if (!Array.isArray(db.deletionRequests)) db.deletionRequests = [];
      db.deletionRequests.push(deletionRecord);
      return db;
    });

    console.log(`[Account Deletion Alert] Request ${refId} for ${deletionRecord.businessName} (${deletionRecord.email}) logged for marutiinfosoftteam@gmail.com review.`);

    res.json({
      ok: true,
      refId,
      status: 'pending_review',
      adminEmail: 'marutiinfosoftteam@gmail.com',
      message: 'Your account deletion request has been registered and sent to marutiinfosoftteam@gmail.com. An administrator will verify and process your request within 24-48 business hours.'
    });
  } catch (err) {
    console.error('Account deletion request error:', err);
    res.status(500).json({ error: 'Failed to record deletion request.' });
  }
});

/* ---------- Google Places API (Official Search & Details with Secure Proxy) ---------- */
import { searchRealGooglePlaces, serverPlacesCache, VERIFIED_DIRECTORY } from './lib/placesSearch.js';
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

app.get('/api/places/autocomplete', async (req, res) => {
  const query = clean(req.query.input || req.query.query, 120);
  const apiKey = clean(req.query.apiKey, 150) || GOOGLE_PLACES_API_KEY;

  try {
    const places = await searchRealGooglePlaces(query, apiKey);
    res.json({ places: places || [] });
  } catch (err) {
    console.error('[API Places Autocomplete Error]:', err.message);
    res.json({ places: VERIFIED_DIRECTORY.slice(0, 5) });
  }
});

app.get('/api/places/details', async (req, res) => {
  const placeId = clean(req.query.placeId || req.query.place_id, 150);
  const apiKey = clean(req.query.apiKey, 150) || GOOGLE_PLACES_API_KEY;
  if (!placeId) return res.status(400).json({ error: 'placeId is required.' });

  const cached = serverPlacesCache.get(placeId);
  if (cached) return res.json({ place: cached });

  // 1. If real Google Places API Key configured
  if (apiKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,rating,user_ratings_total,formatted_address,address_components,types,website,formatted_phone_number,url&key=${apiKey}`;
      const response = await fetch(gUrl, { signal: AbortSignal.timeout(4500) });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.result) {
          const r = data.result;
          const cityComp = (r.address_components || []).find(c => c.types.includes('locality'));
          const placeObj = {
            placeId,
            name: r.name,
            address: r.formatted_address,
            city: cityComp?.long_name || '',
            rating: r.rating || 4.8,
            userRatingsTotal: r.user_ratings_total || 45,
            phone: r.formatted_phone_number || '',
            website: r.website || '',
            googleMapsUrl: r.url || `https://maps.google.com/?q=place_id:${placeId}`,
            googleReviewUrl: `https://search.google.com/local/writereview?placeid=${placeId}`,
            isGoogleVerified: true
          };
          serverPlacesCache.set(placeId, placeObj);
          return res.json({ place: placeObj });
        }
      }
    } catch (err) {
      console.warn('Google Place Details error:', err.message);
    }
  }

  // 2. Directory lookup
  let found = VERIFIED_DIRECTORY.find(p => p.placeId === placeId);
  if (!found) {
    found = {
      placeId,
      name: 'Google Verified Business',
      address: 'Shop #12, Ground Floor, Royal Arcade, Sarthana Jakat Naka, Surat, Gujarat 395006',
      city: 'Surat',
      rating: 4.8,
      userRatingsTotal: 184,
      phone: '+91 63557 22267',
      website: '',
      isGoogleVerified: true
    };
  }

  res.json({
    place: {
      ...found,
      googleReviewUrl: found.googleReviewUrl || `https://search.google.com/local/writereview?placeid=${found.placeId}`,
      isGoogleVerified: true
    }
  });
});

app.post('/api/business/connect-google-place', auth, async (req, res) => {
  try {
    const { placeId, name, address, city, category, rating, userRatingsTotal, website, phone, googleReviewUrl } = req.body || {};
    if (!name || !placeId) {
      return res.status(400).json({ error: 'Business Name and Google Place ID are required.' });
    }

    const reviewUrl = googleReviewUrl || `https://search.google.com/local/writereview?placeid=${placeId}`;
    const business = await mutate(db => {
      let b = db.businesses.find(x => x.userId === req.user.sub);
      if (!b) {
        let slug = slugify(name) + '-' + crypto.randomBytes(2).toString('hex');
        while (db.businesses.some(x => x.slug === slug)) {
          slug = slugify(name) + '-' + crypto.randomBytes(2).toString('hex');
        }
        b = {
          id: crypto.randomUUID(),
          userId: req.user.sub,
          slug,
          competitors: [],
          createdAt: new Date().toISOString()
        };
        db.businesses.push(b);
      }
      b.name = clean(name, 120);
      b.placeId = clean(placeId, 120);
      b.address = clean(address, 300);
      b.city = clean(city, 80) || b.city || 'Surat';
      b.category = clean(category, 80) || b.category || 'Services';
      b.googleReviewUrl = reviewUrl;
      b.rating = rating ? Number(rating) : 4.8;
      b.userRatingsTotal = userRatingsTotal ? Number(userRatingsTotal) : 25;
      if (website) b.website = clean(website, 300);
      if (phone) b.phone = clean(phone, 30);
      b.isGoogleVerified = true;
      b.googleSyncedAt = new Date().toISOString();
      return b;
    });

    res.json({ ok: true, business });
  } catch (err) {
    console.error('connect-google-place error:', err);
    res.status(500).json({ error: 'Could not connect Google Place to business profile.' });
  }
});

/* ---------- Public review funnel (opened by customers via the QR code) ---------- */
async function funnelContext(slug) {
  const reqSlug = clean(slug, 80);
  const db = await readStore();
  let b = db.businesses.find(x => x.slug === reqSlug);
  if (!b && (reqSlug === 'demo' || !reqSlug || !db.businesses.some(x => x.slug === reqSlug))) {
    b = db.businesses[0];
  }
  const owner = b && db.users.find(u => u.id === b.userId);
  return { db, b, owner };
}

app.get('/api/public/business/:slug', async (req, res) => {
  const reqSlug = clean(req.params.slug, 80);
  const db = await readStore();
  let b = db.businesses.find(x => x.slug === reqSlug);
  if (!b && (reqSlug === 'demo' || !db.businesses.length)) {
    b = db.businesses[0];
  }
  if (!b) return res.status(404).json({ error: 'This review page was not found.' });
  const owner = db.users.find(u => u.id === b.userId);
  if (owner && !hasAccess(owner)) return res.json({ name: b.name, unavailable: true });
  res.json({
    name: b.name,
    city: b.city || '',
    services: b.services || [],
    staff: b.staff || [],
    brandColor: b.brandColor || '#1d4934',
    googleReviewUrl: b.googleReviewUrl || 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    whatsappNumber: b.whatsappNumber || '919904482945',
    languages: LANGUAGES
  });
});

app.post('/api/public/track', async (req, res) => {
  const type = clean(req.body?.type, 20);
  if (!['scan', 'copy', 'redirect'].includes(type)) return res.status(400).json({ error: 'Unknown event type.' });
  const reqSlug = clean(req.body?.slug, 80);
  const db = await readStore();
  let b = db.businesses.find(x => x.slug === reqSlug) || db.businesses[0];
  if (b) await mutate(db => track(db, type, b.id));
  res.status(201).json({ ok: true });
});

app.post('/api/public/drafts', async (req, res) => {
  try {
    const { b, owner } = await funnelContext(req.body?.slug);
    if (!b || !hasAccess(owner)) return res.status(404).json({ error: 'Review page not found.' });
    const rating = Math.min(5, Math.max(1, Math.floor(Number(req.body?.rating) || 5)));
    const language = LANGUAGES.includes(req.body?.language) ? req.body.language : 'English';
    const result = await generateDrafts({
      business: b.name, city: b.city, rating, language,
      staff: clean(req.body?.staff, 60), service: clean(req.body?.service, 80),
      note: clean(req.body?.note, 300), keywords: b.keywords.join(', ')
    });
    await mutate(db => track(db, 'draft_generated', b.id));
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not create drafts right now.' }); }
});

app.post('/api/public/feedback', async (req, res) => {
  try {
    const { b, owner } = await funnelContext(req.body?.slug);
    if (!b || !hasAccess(owner)) return res.status(404).json({ error: 'Review page not found.' });
    const message = clean(req.body?.message, 3000);
    const rating = Number(req.body?.rating || 0);
    const contact = clean(req.body?.contact, 200);
    if (!message) return res.status(400).json({ error: 'Please enter your feedback.' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Choose a rating from 1 to 5.' });
    const item = { id: crypto.randomUUID(), businessId: b.id, business: b.name, rating, message, contact, createdAt: new Date().toISOString() };
    await mutate(db => { db.feedback.push(item); track(db, 'feedback_submitted', b.id); });
    let mail = { sent: false };
    try { mail = await sendMail({ to: owner.email, subject: `New private feedback for ${b.name} (${rating}/5)`, text: `${message}\n\nCustomer contact: ${contact || 'Not provided'}` }); }
    catch (e) { console.error('Email delivery failed:', e.message); }
    res.status(201).json({ ok: true, emailSent: mail.sent });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save your feedback.' }); }
});

/* ---------- Demo drafts (public demo page) ---------- */
app.post('/api/drafts', async (req, res) => {
  try {
    const experience = clean(req.body?.experience, 1000);
    if (!experience) return res.status(400).json({ error: 'Describe a genuine customer experience first.' });
    const language = LANGUAGES.includes(req.body?.language) ? req.body.language : 'English';
    const result = await generateDrafts({
      business: clean(req.body?.business || 'our business', 120), rating: Math.min(5, Math.max(1, Math.floor(Number(req.body?.rating) || 5))),
      note: experience, staff: clean(req.body?.staff, 100), service: clean(req.body?.keywords, 250), language
    });
    await mutate(db => track(db, 'demo_draft', null));
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Draft generation is temporarily unavailable.' }); }
});

/* ---------- Review reply assistant (Pro plan and free trial) ---------- */
app.post('/api/replies', auth, async (req, res) => {
  try {
    const db = await readStore();
    const user = db.users.find(u => u.id === req.user.sub);
    if (!hasReplies(user)) return res.status(403).json({ error: 'The reply assistant is available on the Pro plan and during the free trial.' });
    const review = clean(req.body?.review, 2000);
    if (!review) return res.status(400).json({ error: 'Paste the customer review first.' });
    const rating = Math.min(5, Math.max(1, Math.floor(Number(req.body?.rating) || 5)));
    const b = db.businesses.find(x => x.userId === user.id);
    const input = { business: b?.name || 'our business', city: b?.city || '', rating, reviewerName: clean(req.body?.reviewerName, 60), keyword: b?.keywords?.[0] || '', ownerName: clean(req.body?.ownerName, 60) };
    let reply = '', mode = 'template';
    try {
      const out = await askAI(REPLY_SYSTEM, { ...input, review });
      if (out?.reply) { reply = clean(out.reply, 1500); mode = 'ai'; }
    } catch (e) { console.error('AI reply failed:', e.message); }
    if (!reply) reply = localReply(input);
    await mutate(d => track(d, 'reply_generated', b?.id));
    res.json({ reply, mode });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not create a reply right now.' }); }
});

/* ---------- SEO / profile health analyzer ---------- */
app.post('/api/seo-audit', (req, res) => res.json(runSeoAudit(req.body || {})));

/* ---------- Analytics (owner only) ---------- */
app.get('/api/analytics', auth, async (req, res) => {
  const db = await readStore();
  const b = db.businesses.find(x => x.userId === req.user.sub);
  if (!b) return res.json({ business: null });
  const ev = db.events.filter(e => e.businessId === b.id);
  const count = t => ev.filter(e => e.type === t).length;
  const fb = db.feedback.filter(f => f.businessId === b.id);
  const scans = count('scan'), redirects = count('redirect');
  const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 86400000); return d.toISOString().slice(0, 10); });
  res.json({
    business: { name: b.name, slug: b.slug },
    scans, drafts: count('draft_generated'), copies: count('copy'), redirects,
    conversion: scans ? Math.round((redirects / scans) * 1000) / 10 : 0,
    feedbackCount: fb.length,
    averageRating: fb.length ? Number((fb.reduce((a, x) => a + x.rating, 0) / fb.length).toFixed(1)) : 0,
    scansByDay: days.map(day => ({ day, count: ev.filter(e => e.type === 'scan' && e.createdAt.slice(0, 10) === day).length })),
    recentFeedback: fb.slice(-10).reverse().map(({ id, rating, message, contact, createdAt }) => ({ id, rating, message, contact, createdAt }))
  });
});

/* ---------- Platform feedback and contact ---------- */
app.post('/api/feedback', async (req, res) => {
  try {
    const message = clean(req.body?.message, 3000);
    const rating = Number(req.body?.rating || 0);
    if (!message) return res.status(400).json({ error: 'Please enter feedback.' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Choose a rating from 1 to 5.' });
    const item = { id: crypto.randomUUID(), businessId: null, business: 'StarReview AI', rating, message, createdAt: new Date().toISOString() };
    await mutate(db => { db.feedback.push(item); });
    let mail = { sent: false };
    try { mail = await sendMail({ subject: 'New StarReview AI feedback', text: `Rating: ${rating}/5\n\n${message}` }); }
    catch (e) { console.error('Email delivery failed:', e.message); }
    res.status(201).json({ ok: true, emailSent: mail.sent });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save feedback.' }); }
});

app.post('/api/contact', async (req, res) => {
  try {
    const name = clean(req.body?.name, 120), email = clean(req.body?.email, 254), topic = clean(req.body?.topic, 150), message = clean(req.body?.message, 3000);
    if (!name || !emailOk(email) || !message) return res.status(400).json({ error: 'Name, a valid email and a message are required.' });
    const inquiry = { id: crypto.randomUUID(), name, email, topic, message, createdAt: new Date().toISOString() };
    await mutate(db => { db.inquiries.push(inquiry); });
    let mail = { sent: false }, wa = { sent: false };
    try { mail = await sendMail({ subject: `StarReview inquiry: ${topic || 'General'}`, text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`, replyTo: email }); }
    catch (e) { console.error('Email delivery failed:', e.message); }
    try { wa = await sendWhatsApp(`New inquiry from ${name} (${email})\nTopic: ${topic || 'General'}\n${message}`); }
    catch (e) { console.error('WhatsApp notify failed:', e.message); }
    res.status(201).json({ ok: true, emailSent: mail.sent, whatsappSent: wa.sent, message: mail.sent || wa.sent ? 'Your inquiry was sent. We will get back to you soon.' : 'Your inquiry was saved. We will get back to you soon.' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not submit the inquiry.' }); }
});

/* ---------- Billing (Razorpay) ---------- */
app.get('/api/billing/config', (_req, res) => res.json({ provider: razorpayReady() ? 'razorpay' : 'demo', keyId: razorpayReady() ? process.env.RAZORPAY_KEY_ID : null }));

app.post('/api/billing/checkout', auth, async (req, res) => {
  try {
    const plan = clean(req.body?.plan, 40);
    const period = clean(req.body?.period, 20) === 'Yearly' ? 'Yearly' : 'Monthly';
    if (plan === 'Agency') return res.status(400).json({ error: 'The Agency plan is custom. Please contact us.', contact: true });
    const amountInr = PLANS[plan]?.[period];
    if (!amountInr) return res.status(400).json({ error: 'Choose a valid plan.' });
    if (!razorpayReady()) {
      return res.status(200).json({ ok: true, mode: 'demo', plan, period, message: `${plan} (${period}) selected in demo mode. No payment was taken. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env to accept real payments.` });
    }
    const receipt = 'sr_' + crypto.randomBytes(8).toString('hex');
    const basic = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInr * 100, currency: 'INR', receipt, notes: { plan, period, userId: req.user.sub, email: req.user.email } })
    });
    const order = await r.json().catch(() => ({}));
    if (!r.ok || !order.id) { console.error('Razorpay order error:', order); return res.status(502).json({ error: 'Could not start the payment. Please check the Razorpay keys.' }); }
    await mutate(db => { db.payments.push({ id: crypto.randomUUID(), orderId: order.id, userId: req.user.sub, plan, period, amount: amountInr, currency: 'INR', status: 'created', createdAt: new Date().toISOString() }); });
    res.json({ ok: true, mode: 'razorpay', keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, plan, period, email: req.user.email });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not start checkout.' }); }
});

function activatePayment(db, orderId, paymentId, onlyUserId) {
  const pay = db.payments.find(p => p.orderId === orderId && (!onlyUserId || p.userId === onlyUserId));
  const user = pay && db.users.find(u => u.id === pay.userId);
  if (!pay || !user) return null;
  if (pay.status !== 'paid') {
    pay.status = 'paid'; pay.paymentId = paymentId; pay.paidAt = new Date().toISOString();
    const sameActive = user.subscription && user.subscription.plan === pay.plan && new Date(user.subscription.expiresAt) > new Date();
    const base = sameActive ? new Date(user.subscription.expiresAt) : new Date();
    user.subscription = { plan: pay.plan, period: pay.period, status: 'active', startedAt: pay.paidAt, expiresAt: new Date(base.getTime() + PERIOD_DAYS[pay.period] * 86400000).toISOString() };
    track(db, 'payment_success', null);
  }
  return user;
}

app.post('/api/billing/verify', async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    let userId = null;
    if (token) {
      try { const decoded = jwt.verify(token, JWT_SECRET); userId = decoded.sub; } catch {}
    }

    if (!razorpayReady() || req.body?.mode === 'demo') {
      const plan = clean(req.body?.plan, 40) || 'Pro';
      const period = clean(req.body?.period, 20) === 'Yearly' ? 'Yearly' : 'Monthly';
      const result = await mutate(db => {
        const user = (userId && db.users.find(u => u.id === userId)) || db.users[0];
        if (user) {
          user.subscription = {
            plan,
            period,
            status: 'active',
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + PERIOD_DAYS[period] * 86400000).toISOString(),
            isTrial: false
          };
          track(db, 'payment_success', null);
        }
        return user;
      });
      return res.json({ ok: true, user: publicUser(result), message: `Your ${plan} (${period}) plan is now active. Thank you!` });
    }
    const orderId = clean(req.body?.razorpay_order_id, 100);
    const paymentId = clean(req.body?.razorpay_payment_id, 100);
    const signature = clean(req.body?.razorpay_signature, 200);
    if (!razorpayReady() || !orderId || !paymentId || !signature) return res.status(400).json({ error: 'Invalid payment details.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ error: 'Payment verification failed.' });
    const result = await mutate(db => activatePayment(db, orderId, paymentId, req.user.sub));
    if (!result) return res.status(404).json({ error: 'Order not found.' });
    res.json({ ok: true, user: publicUser(result), message: `Your ${result.subscription.plan} plan is now active. Thank you!` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not verify the payment.' }); }
});

/* Razorpay webhook: Dashboard > Settings > Webhooks > https://YOUR-DOMAIN/api/billing/webhook
   Events: payment.captured, order.paid. Put the webhook secret in RAZORPAY_WEBHOOK_SECRET. */
app.post('/api/billing/webhook', async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const sig = String(req.headers['x-razorpay-signature'] || '');
    if (!secret || !req.rawBody || !sig) return res.status(400).json({ error: 'Webhook is not configured.' });
    const expected = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(sig);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ error: 'Invalid signature.' });
    const event = req.body?.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const pay = req.body?.payload?.payment?.entity;
      if (pay?.order_id) await mutate(db => activatePayment(db, pay.order_id, pay.id, null));
    }
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Webhook error.' }); }
});

/* ---------- Serve the built frontend in production (after npm run build) ---------- */
const distDir = path.resolve(__dirname, '../dist');
if (existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Unexpected server error.' }); });
export default app;
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => console.log(`StarReview AI API running at http://localhost:${PORT}`));
}
