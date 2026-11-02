// Real website SEO check: the site is fetched live and every result comes from
// what the page actually returns. A website that does not exist is reported as such.
import dns from 'node:dns/promises';
import net from 'node:net';

const UA = 'Mozilla/5.0 (compatible; StarReviewAI-SEO-Check/1.0; +https://starreview-ai-alpha.vercel.app)';
const MAX_BYTES = 1_500_000;

export class SiteCheckError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// "example.com", "www.example.com/page", "https://example.com" -> URL; anything else -> null
export function toWebsiteUrl(input) {
  let s = String(input || '').trim();
  if (!s || /\s/.test(s)) return null;
  if (!/^https?:\/\//i.test(s)) {
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?(\/.*)?$/i.test(s)) return null;
    s = `https://${s}`;
  }
  try {
    const u = new URL(s);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return null;
    return u;
  } catch {
    return null;
  }
}

const isPrivateIp = ip => {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateIp(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
};

// Only public internet hosts may be fetched (no localhost or internal network)
async function assertPublicHost(hostname) {
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new SiteCheckError('Please enter a public website address.');
    return;
  }
  let addrs;
  try {
    addrs = await dns.lookup(hostname, { all: true });
  } catch {
    throw new SiteCheckError(`"${hostname}" does not exist. No website was found at this address — check the spelling.`, 404);
  }
  if (!addrs.length || addrs.some(a => isPrivateIp(a.address))) throw new SiteCheckError('Please enter a public website address.');
}

async function readLimited(res) {
  const reader = res.body?.getReader?.();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.length;
  }
  try { reader.cancel(); } catch {}
  return Buffer.concat(chunks.map(c => Buffer.from(c))).toString('utf8');
}

// Follows redirects by hand so every hop is checked for a public host
async function safeFetch(startUrl, { method = 'GET', timeout = 10000 } = {}) {
  let url = new URL(startUrl);
  const hops = [];
  for (let i = 0; i < 6; i++) {
    await assertPublicHost(url.hostname);
    const res = await fetch(url, {
      method,
      redirect: 'manual',
      headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
      signal: AbortSignal.timeout(timeout)
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      hops.push(url.toString());
      url = new URL(res.headers.get('location'), url);
      try { res.body?.cancel(); } catch {}
      continue;
    }
    return { res, finalUrl: url, redirects: hops };
  }
  throw new SiteCheckError('This website redirects too many times.', 502);
}

const decode = s => String(s || '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const stripTags = s => decode(String(s || '').replace(/<[^>]+>/g, ' '));

function metaContent(html, attr, name) {
  const re = new RegExp(`<meta[^>]+${attr}\\s*=\\s*["']${name}["'][^>]*>`, 'i');
  const tag = html.match(re)?.[0];
  return tag ? decode(tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]) : '';
}

// The file must really be there: sites that answer every path with their home page do not count
async function existsOnSite(origin, path, looksRight) {
  try {
    const { res } = await safeFetch(new URL(path, origin), { timeout: 6000 });
    if (!res.ok) { try { res.body?.cancel(); } catch {} return false; }
    const body = (await readLimited(res)).slice(0, 5000);
    return looksRight(body, res.headers.get('content-type') || '');
  } catch {
    return false;
  }
}

export async function checkWebsite(input, { keyword = '', city = '' } = {}) {
  const url = toWebsiteUrl(input);
  if (!url) throw new SiteCheckError('Enter a valid website address, for example www.yourbusiness.com');

  const started = Date.now();
  let fetched;
  try {
    fetched = await safeFetch(url);
  } catch (err) {
    if (err instanceof SiteCheckError) throw err;
    // https failed: some small business sites only answer on http
    if (url.protocol === 'https:') {
      try {
        fetched = await safeFetch(new URL(url.toString().replace(/^https:/, 'http:')));
      } catch {}
    }
    if (!fetched) throw new SiteCheckError(`Could not open ${url.hostname}. The website is not responding — it may be down or not exist.`, 502);
  }
  const { res, finalUrl, redirects } = fetched;
  const responseMs = Date.now() - started;
  if (res.status === 404 || res.status === 410) throw new SiteCheckError(`${finalUrl.hostname} answered "page not found" (${res.status}). Check the website address.`, 404);
  if (res.status >= 500) throw new SiteCheckError(`${finalUrl.hostname} has a server error (${res.status}) right now. Try again later.`, 502);
  const type = res.headers.get('content-type') || '';
  if (!/html/i.test(type)) throw new SiteCheckError(`${finalUrl.hostname} did not return a web page.`, 422);

  const html = await readLimited(res);
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || html;
  const title = stripTags(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]);
  const description = metaContent(head, 'name', 'description');
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => stripTags(m[1])).filter(Boolean);
  const robots = metaContent(head, 'name', 'robots').toLowerCase();
  const viewport = metaContent(head, 'name', 'viewport');
  const canonical = /<link[^>]+rel\s*=\s*["']canonical["']/i.test(head);
  const lang = html.match(/<html[^>]*\slang\s*=\s*["']([^"']+)["']/i)?.[1] || '';
  const ogTitle = metaContent(head, 'property', 'og:title');
  const ogImage = metaContent(head, 'property', 'og:image');
  const favicon = /<link[^>]+rel\s*=\s*["'][^"']*icon[^"']*["']/i.test(head);
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  const imgsWithAlt = imgs.filter(t => /\salt\s*=\s*["'][^"']+["']/i.test(t)).length;
  const bodyText = stripTags((html.match(/<body[\s\S]*<\/body>/i)?.[0] || html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' '));
  const words = bodyText ? bodyText.split(' ').length : 0;
  const jsonLd = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]).join(' ');
  const schemaTypes = [...new Set([...jsonLd.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(m => m[1]))];
  const hasTel = /href\s*=\s*["']tel:/i.test(html);
  const hasWhatsapp = /wa\.me\/|api\.whatsapp\.com/i.test(html);
  const hasMap = /google\.[a-z.]+\/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl\/maps/i.test(html);
  const [hasRobotsTxt, hasSitemap] = await Promise.all([
    existsOnSite(finalUrl.origin, '/robots.txt', (b, t) => !/html/i.test(t) && !/<html/i.test(b) && /(user-agent|sitemap|disallow|allow)\s*:/i.test(b)),
    existsOnSite(finalUrl.origin, '/sitemap.xml', b => /<(urlset|sitemapindex)\b/i.test(b))
  ]);

  const kw = keyword.trim().toLowerCase();
  const cityLc = city.trim().toLowerCase();
  const titleLc = title.toLowerCase();
  const pageLc = `${title} ${description} ${h1s.join(' ')} ${bodyText}`.toLowerCase();

  const checks = [];
  const add = (group, name, pass, desc, weight, warn = false) => checks.push({ group, name, status: pass ? 'pass' : (warn ? 'warn' : 'fail'), desc, weight });

  add('Technical', 'Secure HTTPS', finalUrl.protocol === 'https:', finalUrl.protocol === 'https:' ? 'The site opens on a secure https:// address.' : 'The site opens without https. Add an SSL certificate — Google marks it "Not secure".', 8);
  add('Technical', 'Page loads', res.ok, res.ok ? `Answered ${res.status} OK.` : `Answered with status ${res.status}.`, 6);
  add('Technical', 'Response speed', responseMs < 1500, `First response in ${(responseMs / 1000).toFixed(1)} s${responseMs < 1500 ? '.' : ' — aim for under 1.5 s (faster hosting, caching, smaller images).'}`, 6, responseMs < 3000);
  add('Technical', 'Mobile friendly (viewport)', Boolean(viewport), viewport ? 'Has a mobile viewport tag.' : 'No mobile viewport tag — the site may look tiny on phones.', 8);
  add('Technical', 'Google can index the page', !robots.includes('noindex'), robots.includes('noindex') ? 'The page tells Google NOT to index it (noindex). Remove it to appear in search.' : 'Nothing blocks Google from listing this page.', 10);
  add('Technical', 'robots.txt', hasRobotsTxt, hasRobotsTxt ? 'robots.txt found.' : 'No robots.txt file found.', 3, true);
  add('Technical', 'XML sitemap', hasSitemap, hasSitemap ? 'sitemap.xml found.' : 'No /sitemap.xml found — add one and submit it in Google Search Console.', 4, true);

  add('On-page', 'Page title', title.length >= 10 && title.length <= 65, title ? `"${title}" (${title.length} characters${title.length > 65 ? ' — too long, keep it under 65' : title.length < 10 ? ' — too short' : ''}).` : 'The page has no title.', 10, Boolean(title));
  add('On-page', 'Meta description', description.length >= 50 && description.length <= 165, description ? `${description.length} characters${description.length > 165 ? ' — too long, keep it under 160' : description.length < 50 ? ' — too short, write 120–160 characters' : ''}.` : 'No meta description. Write a 120–160 character summary with your service and city.', 8, Boolean(description));
  add('On-page', 'Main heading (H1)', h1s.length === 1, h1s.length ? `${h1s.length} H1 heading${h1s.length > 1 ? 's' : ''}: "${h1s[0].slice(0, 80)}"${h1s.length > 1 ? ' — use exactly one.' : ''}` : 'No H1 heading on the page.', 6, h1s.length > 1);
  const jsRendered = words < 50 && /<div[^>]+id\s*=\s*["'](root|app|__next)["']/i.test(html);
  add('On-page', 'Content length', words >= 300, jsRendered
    ? 'The page text is loaded by JavaScript, so search engines first see an almost empty page. Pre-render or add real text in the HTML.'
    : `About ${words} words on the page${words < 300 ? ' — add more useful text about your services (300+ words).' : '.'}`, 5, words >= 150);
  add('On-page', 'Image alt text', !imgs.length || imgsWithAlt / imgs.length >= 0.8, imgs.length ? `${imgsWithAlt} of ${imgs.length} images have alt text.` : 'No images found on the page.', 4, true);
  add('On-page', 'Canonical tag', canonical, canonical ? 'Canonical URL is set.' : 'No canonical tag — add one to avoid duplicate pages.', 3, true);
  add('On-page', 'Page language', Boolean(lang), lang ? `Language set to "${lang}".` : 'The <html> tag has no lang attribute.', 2, true);

  add('Local & social', 'Business schema (structured data)', schemaTypes.length > 0, schemaTypes.length ? `Found: ${schemaTypes.slice(0, 5).join(', ')}.` : 'No structured data. Add LocalBusiness JSON-LD with name, address and phone.', 6, true);
  add('Local & social', 'Click-to-call phone', hasTel, hasTel ? 'Has a tap-to-call phone link.' : 'No tel: phone link — mobile visitors cannot call in one tap.', 4, true);
  add('Local & social', 'Google Maps / location', hasMap, hasMap ? 'Links to or embeds Google Maps.' : 'No Google Maps link or embed found.', 3, true);
  add('Local & social', 'WhatsApp contact', hasWhatsapp, hasWhatsapp ? 'Has a WhatsApp chat link.' : 'No WhatsApp link found.', 2, true);
  add('Local & social', 'Social share preview', Boolean(ogTitle && ogImage), ogTitle && ogImage ? 'Open Graph title and image set.' : 'Missing og:title / og:image — links shared on WhatsApp/Facebook show no preview.', 3, true);
  add('Local & social', 'Favicon', favicon, favicon ? 'Site icon found.' : 'No favicon set.', 1, true);
  if (kw) add('Keyword', `Keyword "${keyword.trim()}" in title`, titleLc.includes(kw), titleLc.includes(kw) ? 'Your keyword is in the page title.' : 'Add your main keyword to the page title.', 6, pageLc.includes(kw));
  if (kw) add('Keyword', `Keyword "${keyword.trim()}" on the page`, pageLc.includes(kw), pageLc.includes(kw) ? 'Your keyword appears in the page content.' : 'Your keyword does not appear anywhere on the page.', 5);
  if (cityLc) add('Keyword', `City "${city.trim()}" mentioned`, pageLc.includes(cityLc), pageLc.includes(cityLc) ? 'Your city is mentioned on the page.' : 'Mention your city on the page to rank in local searches.', 4, true);

  const max = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.status === 'pass' ? c.weight : c.status === 'warn' ? c.weight / 2 : 0), 0);
  const score = Math.round((got / max) * 100);
  return {
    verified: true,
    url: finalUrl.toString(),
    host: finalUrl.hostname,
    redirected: redirects.length > 0,
    httpStatus: res.status,
    responseMs,
    title,
    description,
    score,
    grade: score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 45 ? 'Needs work' : 'Weak',
    checks,
    recommendations: checks.filter(c => c.status !== 'pass').sort((a, b) => b.weight - a.weight).slice(0, 6).map(c => `${c.name}: ${c.desc}`),
    checkedAt: new Date().toISOString()
  };
}

// Google PageSpeed Insights (mobile). Works without a key at low volume; a key raises the limit.
export async function pageSpeedMobile(siteUrl, apiKey = '') {
  const url = toWebsiteUrl(siteUrl);
  if (!url) throw new SiteCheckError('Enter a valid website address.');
  await assertPublicHost(url.hostname);
  const params = new URLSearchParams({ url: url.toString(), strategy: 'mobile' });
  ['performance', 'seo', 'accessibility', 'best-practices'].forEach(c => params.append('category', c));
  if (apiKey) params.set('key', apiKey);
  const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, { signal: AbortSignal.timeout(55000) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.warn('[pagespeed]', r.status, data?.error?.message);
    const busy = r.status === 429 || /quota/i.test(data?.error?.message || '');
    throw new SiteCheckError(busy ? "Google's speed test limit is reached for now. Please try again later." : 'Google PageSpeed is not available right now.', busy ? 429 : 502);
  }
  const cats = data?.lighthouseResult?.categories || {};
  const pct = c => (typeof c?.score === 'number' ? Math.round(c.score * 100) : null);
  const audits = data?.lighthouseResult?.audits || {};
  return {
    performance: pct(cats.performance),
    seo: pct(cats.seo),
    accessibility: pct(cats.accessibility),
    bestPractices: pct(cats['best-practices']),
    lcp: audits['largest-contentful-paint']?.displayValue || '',
    cls: audits['cumulative-layout-shift']?.displayValue || ''
  };
}
