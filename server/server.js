import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { LANGUAGES, localDrafts, localReply } from './lib/drafts.js';
import { runSeoAudit } from './lib/seo.js';
import { getDb, isMongoConfigured, getTenantBusiness, saveTenantBusiness, logAuditEvent } from './db/mongodb.js';
import { openSqlite, sqliteIsEmpty, sqliteRead, sqliteWrite } from './db/sqlite.js';
import { generateOpenRouterDrafts, generateOpenRouterReply, isOpenRouterConfigured } from './lib/openrouter.js';
import { searchIndianBusinesses, getPlaceDetails, getPlacesApiKey } from './lib/placesSearch.js';
import { searchIndiaOpenStreetMap } from './lib/osmSearch.js';
import { checkWebsite, pageSpeedMobile, toWebsiteUrl, SiteCheckError } from './lib/siteCheck.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const TRIAL_DAYS = 3;
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const isProduction = process.env.NODE_ENV === 'production' || isServerless;
// A known fallback secret would let anyone sign sessions, so production refuses to start without one
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  if (isProduction) throw new Error('JWT_SECRET must be set to a random string of at least 32 characters (openssl rand -hex 32).');
  console.warn('[warn] JWT_SECRET is missing or short. Using a development-only secret; set a strong one before deploying.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-before-deploy';
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
  payments: [],
  authCodes: [],
  reviews: []
});
// With MONGODB_URI set, the store lives in MongoDB so accounts survive serverless
// restarts (Vercel's disk is temporary). Without it, server/data/store.json is used.
// Without MongoDB the store lives in a local SQLite file (server/data/starreview.sqlite).
// The old store.json is imported once the first time SQLite starts empty.
const sqliteFile = path.join(dataDir, 'starreview.sqlite');
const useSqlite = !isMongoConfigured() && String(process.env.LOCAL_STORE || 'sqlite').toLowerCase() !== 'json';
let sqliteReady = null;
async function getSqlite() {
  if (!useSqlite) return null;
  if (!sqliteReady) {
    sqliteReady = (async () => {
      const db = await openSqlite(sqliteFile);
      if (db && sqliteIsEmpty()) {
        let seed = emptyStore();
        try { seed = { ...seed, ...JSON.parse(await fs.readFile(dbFile, 'utf8')) }; console.log('[sqlite] imported existing store.json'); } catch { /* no old data */ }
        sqliteWrite(seed);
      }
      return db;
    })();
  }
  return sqliteReady;
}

async function readStore() {
  if (await getSqlite()) return { ...emptyStore(), ...sqliteRead() };
  const mongo = await getDb();
  if (mongo) {
    const doc = await mongo.collection('app_store').findOne({ _id: 'main' });
    if (!doc) return emptyStore();
    const { _id, ...data } = doc;
    return { ...emptyStore(), ...data };
  }
  try { return { ...emptyStore(), ...JSON.parse(await fs.readFile(dbFile, 'utf8')) }; }
  catch { return emptyStore(); }
}
async function writeStore(store) {
  if (await getSqlite()) { sqliteWrite(store); return; }
  const mongo = await getDb();
  if (mongo) {
    const { _id, ...data } = store;
    await mongo.collection('app_store').replaceOne({ _id: 'main' }, data, { upsert: true });
    return;
  }
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
// Only trust X-Forwarded-For behind a real proxy (Vercel, or TRUST_PROXY=1); otherwise callers could fake their IP
if (process.env.VERCEL || process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
// Browsers may call the API only from the site itself (plus CORS_ORIGIN / APP_URL / PUBLIC_URL when set)
const allowedOrigins = [process.env.CORS_ORIGIN, process.env.APP_URL, process.env.PUBLIC_URL]
  .flatMap(v => String(v || '').split(',')).map(v => v.trim().replace(/\/$/, '')).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || !isProduction || allowedOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
    return cb(null, false);
  }
}));
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '100kb', verify: (r, _res, buf) => { r.rawBody = buf; } })(req, res, next);
});
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (req.path.startsWith('/api/')) res.setHeader('Cache-Control', 'no-store');
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
// Rejects made-up addresses: the email's domain must be able to receive mail
async function emailDomainReceivesMail(email) {
  const domain = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(domain);
    return mx.some(r => r.exchange && r.exchange !== '.');
  } catch (err) {
    // No such domain / no mail servers: fake. Any other DNS problem: don't block a real user
    return !['ENOTFOUND', 'ENODATA'].includes(err.code);
  }
}
// Confirms a Firebase Google sign-in token with Google and returns the verified account
async function verifyFirebaseIdToken(idToken) {
  const key = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
  if (!key || !idToken) return null;
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  if (!r.ok) return null;
  const account = (await r.json()).users?.[0];
  if (!account?.email || !account.emailVerified) return null;
  return { email: account.email.toLowerCase(), name: account.displayName || '', uid: account.localId };
}
const signToken = u => jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: '7d' });
const hasAccess = u => {
  if (!u || u.id === 'demo-user-id') return true;
  return Boolean(u?.subscription && u.subscription.status === 'active' && new Date(u.subscription.expiresAt) > new Date());
};
const hasReplies = u => hasAccess(u) && ['Trial', 'Pro'].includes(u.subscription.plan);
const publicUser = u => ({ id: u.id, email: u.email, name: u.name || '', mobile: u.mobile || '', subscription: u.subscription || null, emailVerified: u.emailVerified === true, access: hasAccess(u), replyAssistant: hasReplies(u) });
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

async function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' });
  let payload;
  try { payload = jwt.verify(token, JWT_SECRET); }
  catch { return res.status(401).json({ error: 'Your session expired. Please sign in again.' }); }
  try {
    // Sessions end when the account is gone or its password was changed after the token was issued
    const db = await readStore();
    const u = db.users.find(x => x.id === payload.sub);
    if (!u) return res.status(401).json({ error: 'Account not found. Please sign in again.' });
    if (u.passwordChangedAt && payload.iat * 1000 < new Date(u.passwordChangedAt).getTime() - 1000) {
      return res.status(401).json({ error: 'Your password was changed. Please sign in again.' });
    }
  } catch (e) { console.error('[auth]', e.message); return res.status(503).json({ error: 'Please try again in a moment.' }); }
  req.user = payload;
  next();
}

// Without SMTP, mail for the company's own inbox goes through FormSubmit (no key needed).
// FormSubmit emails an activation link to that inbox the first time; after one click it delivers.
const COMPANY_INBOX = (process.env.DELETION_REQUEST_EMAIL || 'marutiinfosoftteam@gmail.com').toLowerCase();
async function sendViaFormSubmit({ to, subject, fields, replyTo }) {
  if (String(process.env.FORMSUBMIT || 'on').toLowerCase() === 'off') return { sent: false, reason: 'email_not_configured' };
  const site = process.env.APP_URL || 'https://starreview-ai-alpha.vercel.app';
  const r = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', Origin: site, Referer: site + '/' },
    body: JSON.stringify({ _subject: subject, _template: 'table', _captcha: 'false', ...(replyTo ? { _replyto: replyTo } : {}), ...fields })
  });
  const data = await r.json().catch(() => ({}));
  if (String(data.success) === 'true') return { sent: true, via: 'formsubmit' };
  const needsActivation = /activat/i.test(data.message || '');
  return { sent: false, reason: needsActivation ? 'needs_activation' : 'formsubmit_failed', message: data.message };
}

async function sendMail({ to, subject, text, replyTo, fields }) {
  const recipient = to || process.env.NOTIFY_EMAIL;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !recipient) {
    if (recipient && recipient.toLowerCase() === COMPANY_INBOX) {
      return sendViaFormSubmit({ to: recipient, subject, replyTo, fields: fields || { Message: text } });
    }
    return { sent: false, reason: 'email_not_configured' };
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  // Same details as a neat two-column table for mail apps that show HTML
  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const html = fields ? `<h2 style="font-family:Arial,sans-serif;font-size:18px">${esc(subject)}</h2>` +
    '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' +
    Object.entries(fields).map(([k, v]) =>
      `<tr><th align="left" style="border:1px solid #ddd;background:#f6f6f6;white-space:nowrap">${esc(k)}</th>` +
      `<td style="border:1px solid #ddd;white-space:pre-wrap">${esc(v)}</td></tr>`).join('') +
    '</table>' : undefined;
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to: recipient, replyTo, subject, text, html });
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

const MAX_EVENTS = 50000;
const track = (db, type, businessId) => {
  db.events.push({ type, businessId: businessId || null, createdAt: new Date().toISOString() });
  if (db.events.length > MAX_EVENTS) db.events.splice(0, db.events.length - MAX_EVENTS); // keep the newest
};

/* ---------- Health and public config ---------- */
app.get('/api/network-info', (_req, res) => {
  // Only used to build LAN QR links during local development; never reveal server IPs in production
  if (isProduction) return res.json({ ip: null });
  const interfaces = os.networkInterfaces();
  const candidates = Object.values(interfaces).flat().filter(x => x && x.family === 'IPv4' && !x.internal && !x.address.startsWith('169.254.'));
  res.json({ ip: candidates[0]?.address || null });
});
app.get('/api/health', (_req, res) => res.json({
  ok: true, app: 'StarReview AI',
  mode: process.env.OPENAI_API_KEY ? 'ai-enabled' : 'template-fallback',
  emailConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  whatsappNotifyConfigured: Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_NOTIFY_TO),
  paymentsConfigured: razorpayReady()
}));
app.get('/api/public-config', (_req, res) => res.json({
  whatsappNumber: (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '') || '919904482945',
  publicUrl: process.env.PUBLIC_URL || null,
  languages: LANGUAGES, trialDays: TRIAL_DAYS
}));

/* ---------- Auth ---------- */
// Email + password accounts must confirm their email with a 6-digit code before they can sign in.
// Codes are stored hashed, expire after 10 minutes and allow 5 wrong tries.
// Codes go out by SMTP (Gmail app password in .env). Without SMTP, local development prints
// the code in the API terminal instead; production refuses to sign people up without email.
const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_MAX_ATTEMPTS = 5;
const RESEND_GAP_MS = 60 * 1000;
const smtpReady = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const devCodeLogging = () => !smtpReady() && !isServerless && process.env.NODE_ENV !== 'production';
const canSendCodes = () => smtpReady() || devCodeLogging();
const hashCode = (email, purpose, code) => crypto.createHash('sha256').update(`${JWT_SECRET}|${email}|${purpose}|${code}`).digest('hex');
const isVerified = u => u?.emailVerified === true;
const newTrial = now => ({ plan: 'Trial', period: `${TRIAL_DAYS} days`, status: 'active', startedAt: now.toISOString(), expiresAt: new Date(now.getTime() + TRIAL_DAYS * 86400000).toISOString() });
const EMAIL_NOT_READY = 'Email verification is not set up on the server yet. Please try again later or contact support.';

// Small in-memory rate limiter (per server instance)
const rateHits = new Map();
function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const recent = (rateHits.get(key) || []).filter(t => now - t < windowMs);
  recent.push(now);
  rateHits.set(key, recent);
  if (rateHits.size > 5000) for (const [k, v] of rateHits) if (!v.some(t => now - t < windowMs)) rateHits.delete(k);
  return recent.length > limit;
}

async function sendCodeEmail(email, code, purpose) {
  const verify = purpose === 'verify';
  const subject = verify ? `${code} is your StarReview AI verification code` : `${code} is your StarReview AI password reset code`;
  const intro = verify ? 'Use this code to verify your email and finish creating your StarReview AI account:' : 'Use this code to reset your StarReview AI password:';
  const text = `${intro}\n\n${code}\n\nThe code expires in 10 minutes. If you did not request it, you can ignore this email.\n\n— StarReview AI`;
  if (!smtpReady()) {
    if (!devCodeLogging()) return false;
    console.log(`\n[dev email] SMTP is not configured, so the code is shown here instead.\n  To: ${email}\n  Purpose: ${purpose}\n  Code: ${code}\n`);
    return true;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false') === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
    <h2 style="margin:0 0 12px;color:#166534">StarReview AI</h2>
    <p style="font-size:15px;color:#111827">${intro}</p>
    <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111827;margin:20px 0">${code}</p>
    <p style="font-size:13px;color:#6b7280">The code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`;
  try {
    await transporter.sendMail({ from: process.env.MAIL_FROM || `StarReview AI <${process.env.SMTP_USER}>`, to: email, subject, text, html });
    return true;
  } catch (err) {
    console.error('[email] could not send code:', err.message);
    return false;
  }
}

// Creates (or reuses, within the resend gap) a code and emails it.
// Returns { ok } or { ok:false, status, error }.
async function issueCode(email, purpose, { reuseRecent = false } = {}) {
  if (!canSendCodes()) return { ok: false, status: 503, error: EMAIL_NOT_READY };
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const now = Date.now();
  const r = await mutate(db => {
    db.authCodes = (db.authCodes || []).filter(c => new Date(c.expiresAt).getTime() > now);
    const existing = db.authCodes.find(c => c.email === email && c.purpose === purpose);
    if (existing && now - new Date(existing.sentAt).getTime() < RESEND_GAP_MS) {
      return { wait: Math.ceil((RESEND_GAP_MS - (now - new Date(existing.sentAt).getTime())) / 1000) };
    }
    db.authCodes = db.authCodes.filter(c => !(c.email === email && c.purpose === purpose));
    db.authCodes.push({ id: crypto.randomUUID(), email, purpose, codeHash: hashCode(email, purpose, code), attempts: 0, sentAt: new Date(now).toISOString(), expiresAt: new Date(now + CODE_TTL_MS).toISOString() });
    return {};
  });
  if (r.wait) return reuseRecent ? { ok: true } : { ok: false, status: 429, error: `Please wait ${r.wait} seconds before asking for a new code.` };
  if (!(await sendCodeEmail(email, code, purpose))) {
    await mutate(db => { db.authCodes = (db.authCodes || []).filter(c => !(c.email === email && c.purpose === purpose)); });
    return { ok: false, status: 502, error: 'We could not send the email right now. Please try again in a minute.' };
  }
  return { ok: true };
}

// Checks a code; returns null when it is right, otherwise an error message.
async function checkCode(email, purpose, code) {
  const given = String(code || '').replace(/\D/g, '');
  if (given.length !== 6) return 'Enter the 6-digit code from the email.';
  return mutate(db => {
    const now = Date.now();
    db.authCodes = (db.authCodes || []).filter(c => new Date(c.expiresAt).getTime() > now);
    const entry = db.authCodes.find(c => c.email === email && c.purpose === purpose);
    if (!entry) return 'This code has expired or was already used. Please ask for a new one.';
    if (entry.attempts >= CODE_MAX_ATTEMPTS) return 'Too many wrong tries. Please ask for a new code.';
    const ok = crypto.timingSafeEqual(Buffer.from(entry.codeHash), Buffer.from(hashCode(email, purpose, given)));
    if (!ok) {
      entry.attempts += 1;
      const left = CODE_MAX_ATTEMPTS - entry.attempts;
      return left > 0 ? `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong tries. Please ask for a new code.';
    }
    db.authCodes = db.authCodes.filter(c => c !== entry);
    return null;
  });
}

const signedIn = (res, user, status = 200) => res.status(status).json({ token: signToken(user), user: publicUser(user) });

app.post('/api/auth/register', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (rateLimited('register:' + req.ip, 10, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many sign-up attempts. Please try again later.' });
    if (!canSendCodes()) return res.status(503).json({ error: EMAIL_NOT_READY });
    if (!(await emailDomainReceivesMail(email))) {
      return res.status(400).json({ error: 'This email address does not exist. Please use your real email (for example your Gmail).' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const outcome = await mutate(db => {
      const existing = db.users.find(u => u.email === email);
      if (existing && isVerified(existing)) return 'exists';
      const name = clean(req.body?.fullName || req.body?.name, 120);
      const mobile = clean(req.body?.mobile || req.body?.phone, 30);
      const company = clean(req.body?.company, 120);
      if (existing) {
        // Unverified sign-up: whoever proves the email owns it, so the newest details win
        Object.assign(existing, { passwordHash, ...(name && { name }), ...(mobile && { mobile }), ...(company && { company }) });
        return 'updated';
      }
      const now = new Date();
      db.users.push({
        id: crypto.randomUUID(), email, passwordHash, emailVerified: false, createdAt: now.toISOString(),
        name, mobile, ...(company && { company }), ...(req.body?.role === 'agency' && { role: 'agency' }),
        subscription: newTrial(now)
      });
      return 'created';
    });
    if (outcome === 'exists') return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    const sent = await issueCode(email, 'verify', { reuseRecent: true });
    if (!sent.ok) return res.status(sent.status).json({ error: sent.error });
    res.status(201).json({ needsVerification: true, email, message: `We sent a 6-digit code to ${email}. Enter it to activate your account.` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not create the account.' }); }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (rateLimited('verify:' + req.ip, 30, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    const problem = await checkCode(email, 'verify', req.body?.code);
    if (problem) return res.status(400).json({ error: problem });
    const user = await mutate(db => {
      const u = db.users.find(x => x.email === email);
      if (u) { u.emailVerified = true; u.verifiedAt = new Date().toISOString(); }
      return u;
    });
    if (!user) return res.status(404).json({ error: 'Account not found. Please create it again.' });
    signedIn(res, user);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not verify the email.' }); }
});

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const purpose = req.body?.purpose === 'reset' ? 'reset' : 'verify';
    if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (rateLimited('resend:' + req.ip, 10, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    const db = await readStore();
    const u = db.users.find(x => x.email === email);
    const eligible = u && u.id !== 'demo-user-id' && (purpose === 'reset' ? true : !isVerified(u));
    if (eligible) {
      const sent = await issueCode(email, purpose);
      if (!sent.ok) return res.status(sent.status).json({ error: sent.error });
    }
    res.json({ ok: true, message: `If ${email} needs a code, a new one is on its way.` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not send a new code.' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailOk(email) || !password) return res.status(400).json({ error: 'Enter your email and password.' });
    if (rateLimited('login:' + req.ip + ':' + email, 10, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many sign-in attempts. Please wait 15 minutes or reset your password.' });
    }
    const db = await readStore();
    const user = db.users.find(x => x.email === email);
    if (user && !user.passwordHash && user.googleLinked) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Use "Sign in with Google", or reset your password to add one.' });
    }
    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }
    if (!isVerified(user)) {
      const sent = await issueCode(email, 'verify', { reuseRecent: true });
      if (!sent.ok) return res.status(sent.status).json({ error: sent.error });
      return res.status(403).json({ needsVerification: true, email, error: `Please verify your email first. We sent a 6-digit code to ${email}.` });
    }
    signedIn(res, user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not sign in.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (rateLimited('forgot:' + req.ip, 10, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    if (!canSendCodes()) return res.status(503).json({ error: EMAIL_NOT_READY });
    const db = await readStore();
    if (db.users.some(x => x.email === email && x.id !== 'demo-user-id')) {
      const sent = await issueCode(email, 'reset', { reuseRecent: true });
      if (!sent.ok) return res.status(sent.status).json({ error: sent.error });
    }
    res.json({ ok: true, message: `If an account exists for ${email}, we sent a 6-digit reset code to it.` });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not start the password reset.' }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!emailOk(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    if (rateLimited('reset:' + req.ip, 30, 15 * 60 * 1000)) return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    const problem = await checkCode(email, 'reset', req.body?.code);
    if (problem) return res.status(400).json({ error: problem });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await mutate(db => {
      const u = db.users.find(x => x.email === email);
      if (u) Object.assign(u, { passwordHash, emailVerified: true, verifiedAt: u.verifiedAt || new Date().toISOString(), passwordChangedAt: new Date().toISOString() });
      return u;
    });
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    signedIn(res, user);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not reset the password.' }); }
});

// Google sign-in: only accepted with a Firebase ID token that Google confirms.
app.post('/api/auth/firebase-login', async (req, res) => {
  try {
    if (!(process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY)) {
      return res.status(503).json({ error: 'Google sign-in is not set up yet. Please use email and password.' });
    }
    const verified = await verifyFirebaseIdToken(clean(req.body?.idToken, 4096));
    if (!verified) return res.status(401).json({ error: 'Google sign-in could not be verified. Please try again.' });

    const user = await mutate(db => {
      let u = db.users.find(x => x.email === verified.email);
      const now = new Date();
      if (!u) {
        u = {
          id: crypto.randomUUID(), email: verified.email, name: verified.name || verified.email.split('@')[0],
          firebaseUid: verified.uid, googleLinked: true, emailVerified: true, verifiedAt: now.toISOString(),
          role: verified.email === ADMIN_EMAIL ? 'admin' : 'user', subscription: newTrial(now), createdAt: now.toISOString()
        };
        db.users.push(u);
      } else {
        // An unverified password sign-up for this email was never proven by its maker: drop that password
        if (!isVerified(u)) u.passwordHash = '';
        Object.assign(u, { firebaseUid: u.firebaseUid || verified.uid, googleLinked: true, emailVerified: true, verifiedAt: u.verifiedAt || now.toISOString() });
        if (!u.name) u.name = verified.name;
      }
      return u;
    });
    signedIn(res, user);
  } catch (err) {
    console.error('[Firebase Login Error]:', err);
    res.status(500).json({ error: 'Could not complete Google sign-in.' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  const db = await readStore();
  const user = db.users.find(u => u.id === req.user.sub);
  if (!user) return res.status(401).json({ error: 'Account not found. Please sign in again.' });
  // Sessions made before email verification existed must sign in again and verify
  if (user.id !== 'demo-user-id' && !isVerified(user)) return res.status(401).json({ error: 'Please verify your email to continue.' });
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
    const body = req.body || {};
    const companyEmail = process.env.DELETION_REQUEST_EMAIL || 'marutiinfosoftteam@gmail.com';
    const refId = /^DEL-\d{6}$/.test(body.refId || '') ? body.refId : 'DEL-' + Math.floor(100000 + Math.random() * 900000);
    const record = {
      id: refId,
      userId: req.user?.sub || '',
      name: clean(body.name, 100),
      mobile: clean(body.mobile, 50),
      businessName: clean(body.businessName, 120),
      address: clean(body.address, 400),
      email: clean(body.email || req.user?.email, 120),
      reason: clean(body.reason, 500) || 'Not specified',
      status: 'pending_review',
      createdAt: new Date().toISOString()
    };
    if (!record.name || !record.mobile || !record.businessName || !record.address) {
      return res.status(400).json({ error: 'Please fill in your name, mobile number, company name and company address.' });
    }

    await mutate(db => {
      if (!Array.isArray(db.deletionRequests)) db.deletionRequests = [];
      db.deletionRequests.push(record);
      return db;
    });

    let emailSent = false;
    let emailStatus = 'not_sent';
    try {
      const result = await sendMail({
        to: companyEmail,
        replyTo: emailOk(record.email) ? record.email : undefined,
        subject: `Account deletion request - ${record.businessName} (${refId})`,
        fields: {
          Request: 'Please delete this StarReview AI account',
          Reference: refId,
          'Company name': record.businessName,
          'Company address': record.address,
          'Owner name': record.name,
          Mobile: record.mobile,
          'Account email': record.email,
          Reason: record.reason,
          Submitted: new Date(record.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
          'User ID': record.userId || 'Not signed in'
        },
        text:
          `A customer has asked to delete their StarReview AI account.\n\n` +
          `Reference: ${refId}\n` +
          `Company name: ${record.businessName}\n` +
          `Company address: ${record.address}\n` +
          `Owner name: ${record.name}\n` +
          `Mobile: ${record.mobile}\n` +
          `Account email: ${record.email}\n` +
          `User ID: ${record.userId}\n` +
          `Reason: ${record.reason}\n` +
          `Submitted: ${record.createdAt}\n`
      });
      emailSent = Boolean(result?.sent);
      emailStatus = emailSent ? 'sent' : (result?.reason || 'not_sent');
      if (!emailSent) console.warn(`[Account deletion] ${refId}: email not sent (${result?.reason}${result?.message ? ': ' + result.message : ''}).`);
    } catch (mailErr) {
      console.error(`[Account deletion] ${refId}: email failed:`, mailErr.message);
    }

    res.json({ ok: true, refId, emailSent, emailStatus, status: 'pending_review' });
  } catch (err) {
    console.error('Account deletion request error:', err);
    res.status(500).json({ error: 'Failed to record deletion request.' });
  }
});

/* ---------- Google Places API (New): business search for onboarding ---------- */
// The key is read on the server only; the browser never sees it.
// Search: /api/places/search?q=...&pageToken=...  (/api/places/autocomplete kept as an alias)
const placesSearchHandler = async (req, res) => {
  if (rateLimited('places:' + req.ip, 60, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many searches. Please wait a little and try again.', places: [] });
  const query = clean(req.query.q || req.query.input || req.query.query, 150);
  const pageToken = clean(req.query.pageToken, 2000);
  // Google Places when a key is set; otherwise (or if Google fails) free OpenStreetMap search
  if (getPlacesApiKey()) {
    try {
      return res.json({ ...(await searchIndianBusinesses(query, pageToken)), source: 'google' });
    } catch (err) {
      if (err.status === 404 || err.status === 400 || pageToken) return res.status(err.status || 502).json({ error: err.message, places: [] });
    }
  }
  try {
    res.json(await searchIndiaOpenStreetMap(query));
  } catch (err) {
    console.warn('[OpenStreetMap search]', err.message);
    res.status(502).json({ error: 'Business search is not available right now. Please try again or enter your details manually.', places: [] });
  }
};
app.get('/api/places/search', placesSearchHandler);
app.get('/api/places/autocomplete', placesSearchHandler);

app.get('/api/places/details', async (req, res) => {
  if (rateLimited('places:' + req.ip, 60, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many searches. Please wait a little and try again.' });
  const placeId = clean(req.query.placeId || req.query.place_id, 300);
  if (!placeId) return res.status(400).json({ error: 'placeId is required.' });
  try {
    const place = await getPlaceDetails(placeId);
    res.json({ place });
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message });
  }
});

app.post('/api/business/connect-google-place', auth, async (req, res) => {
  try {
    const body = req.body || {};
    const name = clean(body.name, 120);
    const placeId = clean(body.placeId, 300);
    const fromGoogle = Boolean(placeId) && body.source === 'google';
    if (!name) return res.status(400).json({ error: 'Business name is required.' });

    const reviewUrl = clean(body.googleReviewUrl, 500) || (placeId ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}` : '');
    const num = v => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? null : Number(v));

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
          services: [],
          staff: [],
          keywords: [],
          competitors: [],
          createdAt: new Date().toISOString()
        };
        db.businesses.push(b);
      }
      b.name = name;
      b.placeId = placeId;
      b.address = clean(body.address, 300);
      b.area = clean(body.area, 80);
      b.city = clean(body.city, 80);
      b.state = clean(body.state, 80);
      b.postcode = clean(body.postcode, 12);
      b.country = clean(body.country, 60);
      b.category = clean(body.category, 80);
      b.googleReviewUrl = reviewUrl;
      b.googleMapsUrl = clean(body.googleMapsUrl, 500);
      b.rating = num(body.rating);
      b.userRatingsTotal = num(body.userRatingsTotal);
      b.website = clean(body.website, 300);
      b.phone = clean(body.phone, 30);
      b.isGoogleVerified = fromGoogle;
      b.googleSyncedAt = fromGoogle ? new Date().toISOString() : null;
      return b;
    });

    res.json({ ok: true, business });
  } catch (err) {
    console.error('connect-google-place error:', err);
    res.status(500).json({ error: 'Could not save the business profile.' });
  }
});

/* ---------- Public review funnel (opened by customers via the QR code) ---------- */
async function funnelContext(slug) {
  const reqSlug = clean(slug, 80) || 'demo';
  const db = await readStore();
  // Unknown slugs must not fall back to another business, or its owner would receive strangers' feedback
  let b = db.businesses.find(x => x.slug === reqSlug);
  if (!b && reqSlug === 'demo') b = db.businesses.find(x => x.id === 'demo-biz-id') || null;
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
    category: b.category || '',
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
  if (rateLimited('track:' + req.ip, 120, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests.' });
  const { b } = await funnelContext(req.body?.slug);
  if (b) await mutate(db => track(db, type, b.id));
  res.status(201).json({ ok: true });
});

app.post('/api/public/drafts', async (req, res) => {
  try {
    if (rateLimited('pdrafts:' + req.ip, 40, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    const { b, owner } = await funnelContext(req.body?.slug);
    if (!b || !hasAccess(owner)) return res.status(404).json({ error: 'Review page not found.' });
    const rating = Math.min(5, Math.max(1, Math.floor(Number(req.body?.rating) || 5)));
    const language = LANGUAGES.includes(req.body?.language) ? req.body.language : 'English';
    const bizName = clean(req.body?.business, 120) || b.name;
    const bizCity = typeof req.body?.city === 'string' ? clean(req.body.city, 80) : b.city;
    const result = await generateDrafts({
      business: bizName, city: bizCity, rating, language,
      staff: clean(req.body?.staff, 60), service: clean(req.body?.service, 80),
      note: clean(req.body?.note, 300), keywords: b.keywords.join(', ')
    });
    await mutate(db => track(db, 'draft_generated', b.id));
    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not create drafts right now.' }); }
});

app.post('/api/public/feedback', async (req, res) => {
  try {
    if (rateLimited('feedback:' + req.ip, 10, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many messages from this device. Please try again later.' });
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
    if (rateLimited('drafts:' + req.ip, 40, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many requests. Please try again later.' });
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

// Live website / Google listing check. Each IP gets a fair number of checks per 10 minutes.
const siteCheckHits = new Map();
const siteCheckAllowed = ip => {
  const now = Date.now();
  const hits = (siteCheckHits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  if (hits.length >= 30) return false;
  hits.push(now);
  siteCheckHits.set(ip, hits);
  return true;
};

const findBusinessOnMaps = async query => {
  if (getPlacesApiKey()) {
    try { return { ...(await searchIndianBusinesses(query)), source: 'google' }; } catch (err) { console.warn('[site-check places]', err.message); }
  }
  return searchIndiaOpenStreetMap(query);
};

app.post('/api/seo/site-check', async (req, res) => {
  const query = clean(req.body?.query, 300);
  const keyword = clean(req.body?.keyword, 80);
  const city = clean(req.body?.city, 80);
  if (query.length < 3) return res.status(400).json({ error: 'Enter your website address or your business name as it appears on Google.' });
  if (!siteCheckAllowed(req.ip || 'ip')) return res.status(429).json({ error: 'Too many checks. Please wait a few minutes and try again.' });
  try {
    // 1. A website address: open it live
    if (toWebsiteUrl(query)) return res.json({ type: 'website', site: await checkWebsite(query, { keyword, city }) });

    // 2. A business name: it must exist on Google Maps (or OpenStreetMap when no Google key is set)
    const found = await findBusinessOnMaps(city && !query.toLowerCase().includes(city.toLowerCase()) ? `${query} ${city}` : query);
    const place = (found.places || [])[0];
    if (!place) {
      return res.status(404).json({ error: `"${query}" was not found on ${getPlacesApiKey() ? 'Google Maps' : 'the map'}${city ? ` in ${city}` : ''}. Check the spelling, add your city, or paste your website address.` });
    }
    const listing = {
      name: place.name, address: place.address, phone: place.phone || '', website: place.website || '',
      rating: place.rating, reviews: place.userRatingsTotal, category: place.category || '',
      mapsUrl: place.googleMapsUrl || '', source: found.source || place.source || 'openstreetmap',
      others: (found.places || []).slice(1, 4).map(p => ({ name: p.name, address: p.address }))
    };
    let site = null, siteError = '';
    if (listing.website) {
      try { site = await checkWebsite(listing.website, { keyword, city }); } catch (err) { siteError = err.message; }
    }
    res.json({ type: 'business', listing, site, siteError });
  } catch (err) {
    if (err instanceof SiteCheckError) return res.status(err.status).json({ error: err.message });
    console.error('[site-check]', err);
    res.status(502).json({ error: 'Could not check this website right now. Please try again.' });
  }
});

app.post('/api/seo/pagespeed', async (req, res) => {
  const url = clean(req.body?.url, 500);
  if (!siteCheckAllowed(req.ip || 'ip')) return res.status(429).json({ error: 'Too many checks. Please wait a few minutes.' });
  try {
    res.json(await pageSpeedMobile(url, process.env.GOOGLE_PAGESPEED_API_KEY || ''));
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message || 'Google PageSpeed is not available right now.' });
  }
});

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

/* ---------- Customer reviews from the QR review page (no login for customers) ---------- */
// Saved when a customer taps "Copy review & post on Google". We only know the review was copied
// for Google, not that Google published it, so the status says "copied".
app.post('/api/public/reviews', async (req, res) => {
  try {
    if (rateLimited('review:' + req.ip, 30, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many reviews from this device. Please try later.' });
    const { b, owner } = await funnelContext(req.body?.slug);
    if (!b || (owner && !hasAccess(owner))) return res.status(404).json({ error: 'Review page not found.' });
    const text = clean(req.body?.text, 3000);
    const rating = Number(req.body?.rating || 0);
    if (!text) return res.status(400).json({ error: 'Review text is empty.' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Choose a rating from 1 to 5.' });
    const now = Date.now();
    const saved = await mutate(db => {
      db.reviews = db.reviews || [];
      // Same review copied again within 30 minutes (e.g. "Copy review again"): keep one entry
      const dup = db.reviews.find(r => r.businessId === b.id && r.text === text && now - new Date(r.createdAt).getTime() < 30 * 60 * 1000);
      if (dup) { dup.copies = (dup.copies || 1) + 1; return dup; }
      const item = { id: crypto.randomUUID(), businessId: b.id, rating, text, status: 'copied', copies: 1, source: 'qr', createdAt: new Date(now).toISOString() };
      db.reviews.push(item);
      return item;
    });
    res.status(201).json({ ok: true, id: saved.id });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Could not save the review.' }); }
});

// Owner view: every customer review (3-5 star copied for Google + 1-2 star private feedback), newest first
app.get('/api/business/reviews', auth, async (req, res) => {
  const db = await readStore();
  const b = db.businesses.find(x => x.userId === req.user.sub);
  if (!b) return res.json({ reviews: [] });
  const posted = (db.reviews || []).filter(r => r.businessId === b.id)
    .map(r => ({ id: r.id, kind: 'google', rating: r.rating, text: r.text, status: r.status || 'copied', copies: r.copies || 1, createdAt: r.createdAt }));
  const privateFb = db.feedback.filter(f => f.businessId === b.id)
    .map(f => ({ id: f.id, kind: 'private', rating: f.rating, text: f.message, contact: f.contact || '', status: f.status || 'active', createdAt: f.createdAt }));
  res.json({ reviews: [...posted, ...privateFb].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt)) });
});

app.delete('/api/business/reviews/:id', auth, async (req, res) => {
  const removed = await mutate(db => {
    const b = db.businesses.find(x => x.userId === req.user.sub);
    if (!b) return false;
    const r = (db.reviews || []).find(x => x.id === req.params.id && x.businessId === b.id);
    if (r) { db.reviews = db.reviews.filter(x => x !== r); return true; }
    const f = db.feedback.find(x => x.id === req.params.id && x.businessId === b.id);
    if (f) { db.feedback = db.feedback.filter(x => x !== f); return true; }
    return false;
  });
  if (!removed) return res.status(404).json({ error: 'Review not found.' });
  res.json({ ok: true });
});

/* ---------- Negative reviews (1-2 star private feedback from the review page) ---------- */
// Newest first. Each item: { id, rating, message, contact, createdAt, status: 'active' | 'archived' }
const ownerFeedback = (db, userId) => {
  const b = db.businesses.find(x => x.userId === userId);
  return b ? db.feedback.filter(f => f.businessId === b.id) : [];
};
app.get('/api/business/feedback', auth, async (req, res) => {
  const db = await readStore();
  const list = ownerFeedback(db, req.user.sub)
    .map(({ id, rating, message, contact, createdAt, status, resolvedAt }) => ({ id, rating, message, contact, createdAt, status: status || 'active', resolvedAt: resolvedAt || null }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ feedback: list });
});
app.patch('/api/business/feedback/:id', auth, async (req, res) => {
  const status = req.body?.status === 'archived' ? 'archived' : 'active';
  const item = await mutate(db => {
    const f = ownerFeedback(db, req.user.sub).find(x => x.id === req.params.id);
    if (f) { f.status = status; f.resolvedAt = status === 'archived' ? new Date().toISOString() : null; }
    return f;
  });
  if (!item) return res.status(404).json({ error: 'Feedback not found.' });
  res.json({ ok: true });
});
app.delete('/api/business/feedback/:id', auth, async (req, res) => {
  const removed = await mutate(db => {
    const f = ownerFeedback(db, req.user.sub).find(x => x.id === req.params.id);
    if (f) db.feedback = db.feedback.filter(x => x !== f);
    return Boolean(f);
  });
  if (!removed) return res.status(404).json({ error: 'Feedback not found.' });
  res.json({ ok: true });
});

/* ---------- Platform feedback and contact ---------- */
app.post('/api/feedback', async (req, res) => {
  try {
    if (rateLimited('pfeedback:' + req.ip, 5, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many messages. Please try again later.' });
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
    if (rateLimited('contact:' + req.ip, 5, 60 * 60 * 1000)) return res.status(429).json({ error: 'Too many messages. Please try again later or contact us on WhatsApp.' });
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

app.post('/api/billing/verify', auth, async (req, res) => {
  try {
    if (!razorpayReady() || req.body?.mode === 'demo') {
      // Demo checkout only simulates a payment: no money is taken and the plan is NOT changed
      const plan = clean(req.body?.plan, 40);
      const period = clean(req.body?.period, 20) === 'Yearly' ? 'Yearly' : 'Monthly';
      if (!PLANS[plan]) return res.status(400).json({ error: 'Choose a valid plan.' });
      const db = await readStore();
      const user = db.users.find(u => u.id === req.user.sub);
      if (!user) return res.status(404).json({ error: 'Account not found.' });
      return res.json({ ok: true, demo: true, user: publicUser(user), message: `Demo payment for ${plan} (${period}) succeeded. This is a demo: no money was taken and your plan was not changed.` });
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
