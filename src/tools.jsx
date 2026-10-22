import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api } from './api.js';

const Stars = ({ value, onChange }) => (
  <div className="rating-select">
    {[1, 2, 3, 4, 5].map(n => <button type="button" key={n} className={value >= n ? 'on' : ''} onClick={() => onChange(n)} aria-label={`${n} stars`}>★</button>)}
  </div>
);
const SignInPrompt = ({ navigate, text }) => (
  <div className="panel narrow center-text"><h3>Sign in required</h3><p>{text}</p><button className="btn btn-dark" onClick={() => navigate('Account')}>Sign in or start free trial ↗</button></div>
);
export const funnelUrl = (cfg, business) => `${(cfg?.publicUrl || window.location.origin).replace(/\/$/, '')}/r/${business.slug}`;

/* ---------- Public review funnel (customers open this from the QR code) ---------- */
export function ReviewFunnel({ slug, notify }) {
  const [biz, setBiz] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('rate');
  const [rating, setRating] = useState(0);
  const [staff, setStaff] = useState('');
  const [service, setService] = useState('');
  const [language, setLanguage] = useState('English');
  const [note, setNote] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api('GET', `/api/public/business/${slug}`).then(r => {
      if (!r.ok) return setError(r.data.error);
      setBiz(r.data);
      if (!r.data.unavailable) api('POST', '/api/public/track', { slug, type: 'scan' });
    });
  }, [slug]);

  const chooseRating = n => { setRating(n); setStep(n >= 4 ? 'compose' : 'private'); };
  const createDrafts = async () => {
    setBusy(true);
    const r = await api('POST', '/api/public/drafts', { slug, rating, staff, service, language, note });
    setBusy(false);
    if (!r.ok) return notify(r.data.error);
    setDrafts(r.data.drafts);
    if (r.data.note) notify(r.data.note);
    setStep('drafts');
  };
  const copyAndPost = async text => {
    const copied = navigator.clipboard ? navigator.clipboard.writeText(text).then(() => true, () => false) : Promise.resolve(false);
    api('POST', '/api/public/track', { slug, type: 'copy' });
    if (biz.googleReviewUrl) {
      window.open(biz.googleReviewUrl, '_blank', 'noopener');
      api('POST', '/api/public/track', { slug, type: 'redirect' });
      notify((await copied) ? 'Review copied. Paste it on the Google page.' : 'Select the text and copy it, then paste it on Google.');
    } else notify('This business has not added its Google review link yet.');
  };
  const sendPrivate = async e => {
    e.preventDefault();
    setBusy(true);
    const r = await api('POST', '/api/public/feedback', { slug, rating, message, contact });
    setBusy(false);
    r.ok ? setStep('thanks') : notify(r.data.error);
  };

  const shell = body => <main className="page-shell wrap"><div className="page-heading"><div className="eyebrow">{biz ? biz.name.toUpperCase() : 'REVIEW PAGE'}</div><h1>{biz && !biz.unavailable ? 'How was your experience?' : 'Review page'}</h1></div><div className="feedback-card">{body}</div></main>;
  if (error) return shell(<p>{error}</p>);
  if (!biz) return shell(<p>Loading…</p>);
  if (biz.unavailable) return shell(<p>This review page is temporarily unavailable.</p>);

  if (step === 'rate') return shell(<><p>Tap a star rating to continue.</p><Stars value={rating} onChange={chooseRating} /></>);
  if (step === 'compose') return shell(<div>
    <p>Thanks for the great rating! Tell us a little more and we will suggest a review you can edit.</p>
    {biz.staff.length > 0 && <label>Who helped you? (optional)<select value={staff} onChange={e => setStaff(e.target.value)}><option value="">Select</option>{biz.staff.map(s => <option key={s}>{s}</option>)}</select></label>}
    {biz.services.length > 0 && <label>What did you use? (optional)<select value={service} onChange={e => setService(e.target.value)}><option value="">Select</option>{biz.services.map(s => <option key={s}>{s}</option>)}</select></label>}
    <label>Review language<select value={language} onChange={e => setLanguage(e.target.value)}>{biz.languages.map(l => <option key={l}>{l}</option>)}</select></label>
    <label>Anything you especially liked? (optional)<textarea rows="3" value={note} onChange={e => setNote(e.target.value)} placeholder="Tell us in a few words" /></label>
    <button className="btn btn-dark full" disabled={busy} onClick={createDrafts}>{busy ? 'Creating drafts…' : '✦ Create my review drafts'}</button>
  </div>);
  if (step === 'drafts') return shell(<div>
    <p>Edit a draft if you like, then copy it and post it on Google.</p>
    {drafts.map((d, i) => <div className="draft" key={i}><div className="draft-top"><b>Option {i + 1}</b></div><textarea rows="4" value={d} onChange={e => setDrafts(drafts.map((x, j) => j === i ? e.target.value : x))} /><button className="btn btn-dark full" onClick={() => copyAndPost(d)}>Copy & post on Google ↗</button></div>)}
    <button className="text-btn centered" onClick={() => setStep('compose')}>← Back</button>
  </div>);
  if (step === 'private') return shell(<form onSubmit={sendPrivate}>
    <p>We are sorry we did not meet your expectations. Please tell us what happened so we can make it right.</p>
    <label>Your feedback<textarea required rows="5" value={message} onChange={e => setMessage(e.target.value)} placeholder="What could we do better?" /></label>
    <label>Phone or email (optional)<input value={contact} onChange={e => setContact(e.target.value)} placeholder="So we can follow up" /></label>
    <button className="btn btn-dark full" disabled={busy}>{busy ? 'Sending…' : 'Send private feedback'}</button>
  </form>);
  return shell(<div className="success-state"><div className="success-icon">✓</div><h3>Thank you!</h3><p>Your feedback was sent to the team.</p></div>);
}

/* ---------- Business profile ---------- */
export function BusinessSetup({ user, business, setBusiness, notify, navigate, cfg }) {
  const blank = { name: '', city: '', category: '', googleReviewUrl: '', services: '', staff: '', keywords: '', brandColor: '#1d4934' };
  const fromBiz = b => b ? { ...b, services: b.services.join(', '), staff: b.staff.join(', '), keywords: b.keywords.join(', ') } : blank;
  const [f, setF] = useState(fromBiz(business));
  useEffect(() => setF(fromBiz(business)), [business]);
  if (!user) return <SignInPrompt navigate={navigate} text="Create a free account to set up your business and get your review link." />;
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const save = async e => {
    e.preventDefault();
    const r = await api('PUT', '/api/business', { ...f, competitors: business?.competitors });
    if (!r.ok) return notify(r.data.error);
    setBusiness(r.data.business);
    notify('Business saved.');
  };
  return (
    <form className="panel form-panel narrow" onSubmit={save}>
      <label>Business name<input required value={f.name} onChange={set('name')} placeholder="e.g. Glow Studio" /></label>
      <label>City<input value={f.city} onChange={set('city')} placeholder="e.g. Surat" /></label>
      <label>Category<input value={f.category} onChange={set('category')} placeholder="e.g. Hair salon" /></label>
      <label>Google review link<input value={f.googleReviewUrl} onChange={set('googleReviewUrl')} placeholder="https://search.google.com/local/writereview?placeid=..." /></label>
      <p className="tiny-note">Find it in your Google Business Profile: Get more reviews → Share review form. Customers are sent here after they copy their review.</p>
      <label>Services (comma separated)<input value={f.services} onChange={set('services')} placeholder="Haircut, Facial, Spa" /></label>
      <label>Staff names (comma separated)<input value={f.staff} onChange={set('staff')} placeholder="Priya, Rahul" /></label>
      <label>Keywords, up to 5 (comma separated)<input value={f.keywords} onChange={set('keywords')} placeholder="bridal makeup, hair spa" /></label>
      <label>Brand color<input type="color" value={f.brandColor} onChange={set('brandColor')} /></label>
      <button className="btn btn-dark full">Save business</button>
      {business && <div className="notice small-notice">Your customer review page: <b>{funnelUrl(cfg, business)}</b>
        <div className="row-gap"><button type="button" className="btn btn-light btn-sm" onClick={() => window.open(funnelUrl(cfg, business), '_blank')}>Open ↗</button><button type="button" className="btn btn-light btn-sm" onClick={() => navigate('QR flyer')}>Create QR flyer ↗</button></div></div>}
    </form>
  );
}

/* ---------- Review reply assistant ---------- */
export function ReplyAssistant({ user, notify, navigate }) {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewer, setReviewer] = useState('');
  const [owner, setOwner] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  if (!user) return <SignInPrompt navigate={navigate} text="Sign in to draft replies to your Google reviews." />;
  const run = async () => {
    setBusy(true);
    const r = await api('POST', '/api/replies', { review, rating, reviewerName: reviewer, ownerName: owner });
    setBusy(false);
    r.ok ? setReply(r.data.reply) : notify(r.data.error);
  };
  return (
    <div className="tool-layout">
      <div className="panel form-panel">
        <label>Customer review<textarea rows="5" value={review} onChange={e => setReview(e.target.value)} placeholder="Paste the review here" /></label>
        <label>Star rating<Stars value={rating} onChange={setRating} /></label>
        <label>Reviewer name (optional)<input value={reviewer} onChange={e => setReviewer(e.target.value)} /></label>
        <label>Your name for the sign-off (optional)<input value={owner} onChange={e => setOwner(e.target.value)} /></label>
        <button className="btn btn-dark full" disabled={busy} onClick={run}>{busy ? 'Writing…' : '✦ Write a reply'}</button>
        <p className="tiny-note">Replies are drafted for you to copy and post on Google. Automatic publishing to Google needs approved Google Business Profile API access and is not included.</p>
      </div>
      <div className="panel drafts-panel">
        <div className="panel-heading"><h3>Suggested reply</h3></div>
        {reply ? <div className="draft"><textarea rows="7" value={reply} onChange={e => setReply(e.target.value)} /><button className="btn btn-dark full" onClick={() => { navigator.clipboard?.writeText(reply); notify('Reply copied.'); }}>Copy reply ↗</button></div>
          : <div className="empty-state"><div className="empty-icon">✉</div><h3>Your reply will appear here</h3><p>Paste a review and choose its star rating.</p></div>}
      </div>
    </div>
  );
}

/* ---------- SEO / profile health analyzer and competitors ---------- */
const CHECKBOXES = [
  ['hasAddress', 'Address added'], ['hasPhone', 'Phone number added'], ['hasWebsite', 'Website linked'], ['hasHours', 'Opening hours set'],
  ['napConsistent', 'Name, address and phone match everywhere'], ['keywordInDescription', 'Description mentions main keywords'],
  ['hasServices', 'Services or products listed'], ['hasLogo', 'Logo uploaded'], ['hasCover', 'Cover photo set'],
  ['hasQA', 'Questions and answers filled in'], ['hasBookingLink', 'Booking or order link added'], ['hasAttributes', 'Attributes selected']
];
const NUMBERS = [
  ['rating', 'Average rating (0-5)'], ['reviewCount', 'Total reviews'], ['reviewsLast30Days', 'Reviews in last 30 days'], ['replyRatePercent', 'Reply rate to reviews (%)'],
  ['photoCount', 'Number of photos'], ['categoryCount', 'Categories selected'], ['descriptionLength', 'Description length (characters)'], ['postsLast30Days', 'Posts in last 30 days']
];
export function SeoAnalyzer({ user, business, setBusiness, notify }) {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [comps, setComps] = useState(business?.competitors?.length ? business.competitors : [{ name: '', rating: '', reviews: '' }]);
  useEffect(() => { if (business?.competitors?.length) setComps(business.competitors); }, [business]);
  const run = async () => { const r = await api('POST', '/api/seo-audit', form); r.ok ? setResult(r.data) : notify(r.data.error); };
  const saveComps = async () => {
    if (!business) return notify('Set up your business first.');
    const r = await api('PUT', '/api/business', { ...business, competitors: comps });
    r.ok ? (setBusiness(r.data.business), notify('Competitors saved.')) : notify(r.data.error);
  };
  const avgRating = comps.filter(c => Number(c.rating)).length ? (comps.reduce((a, c) => a + (Number(c.rating) || 0), 0) / comps.filter(c => Number(c.rating)).length).toFixed(1) : null;
  return (
    <>
      <div className="tool-layout">
        <div className="panel form-panel">
          {NUMBERS.map(([k, label]) => <label key={k}>{label}<input type="number" min="0" step={k === 'rating' ? '0.1' : '1'} value={form[k] ?? ''} onChange={e => setForm({ ...form, [k]: e.target.value })} /></label>)}
          <div className="check-grid">{CHECKBOXES.map(([k, label]) => <label className="check" key={k}><input type="checkbox" checked={!!form[k]} onChange={e => setForm({ ...form, [k]: e.target.checked })} /> {label}</label>)}</div>
          <button className="btn btn-dark full" onClick={run}>Run 20-point check</button>
          <p className="tiny-note">This check scores the details you enter. It does not read data from Google.</p>
        </div>
        <div className="panel drafts-panel">
          {result ? <>
            <div className="panel-heading"><div><div className="eyebrow">PROFILE HEALTH</div><h3>{result.score}/100 · {result.grade}</h3></div></div>
            {result.dimensions.map(d => <div className="bar-row" key={d.name}><span>{d.name}</span><div className="bar"><i style={{ width: `${(d.score / d.max) * 100}%` }} /></div><b>{d.score}/{d.max}</b></div>)}
            <h3 className="space-top">Fix these first</h3>
            {result.failed.length ? result.failed.slice(0, 8).map(f => <div className="draft" key={f.label}><div className="draft-top"><b>{f.label}</b></div><p>{f.tip}</p></div>) : <p>Everything passed. Great work!</p>}
          </> : <div className="empty-state"><div className="empty-icon">◎</div><h3>Your health score will appear here</h3><p>Fill in your profile details and run the check.</p></div>}
        </div>
      </div>
      <div className="panel narrow space-top">
        <div className="panel-heading"><h3>Competitor comparison</h3></div>
        {!user && <p className="tiny-note">Sign in to save competitors.</p>}
        {comps.map((c, i) => (
          <div className="comp-row" key={i}>
            <input placeholder="Competitor name" value={c.name} onChange={e => setComps(comps.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
            <input type="number" step="0.1" min="0" max="5" placeholder="Rating" value={c.rating} onChange={e => setComps(comps.map((x, j) => j === i ? { ...x, rating: e.target.value } : x))} />
            <input type="number" min="0" placeholder="Reviews" value={c.reviews} onChange={e => setComps(comps.map((x, j) => j === i ? { ...x, reviews: e.target.value } : x))} />
          </div>
        ))}
        <div className="row-gap">
          {comps.length < 4 && <button className="btn btn-light btn-sm" onClick={() => setComps([...comps, { name: '', rating: '', reviews: '' }])}>+ Add competitor</button>}
          <button className="btn btn-dark btn-sm" onClick={saveComps}>Save</button>
        </div>
        {avgRating && form.rating && <div className="notice small-notice">Your rating is {form.rating} and the average of your competitors is {avgRating}. {Number(form.rating) >= Number(avgRating) ? 'You are ahead. Keep collecting fresh reviews.' : 'You are behind. Focus on service feedback and more reviews.'}</div>}
      </div>
    </>
  );
}

/* ---------- Dashboard ---------- */
const sampleReviews = [
  { name: 'Aarav Mehta', business: 'The Green Table', stars: 5, text: 'Wonderful service and a really welcoming team. The food was fresh and the whole experience was excellent.' },
  { name: 'Maya Shah', business: 'Glow Studio', stars: 5, text: 'Very professional, friendly staff and great attention to detail. I will definitely come back.' },
  { name: 'Rohan Patel', business: 'CarePoint Clinic', stars: 4, text: 'The staff were helpful and the appointment was smooth. Thank you for the support.' }
];
export function Dashboard({ user, business, navigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { if (user) api('GET', '/api/analytics').then(r => setStats(r.ok && r.data.business ? r.data : null)); else setStats(null); }, [user?.id]);
  const live = !!stats;
  const cards = live
    ? [['QR scans', stats.scans, 'all time'], ['Drafts created', stats.drafts, `${stats.copies} copied`], ['Sent to Google', stats.redirects, `${stats.conversion}% of scans`], ['Private feedback', stats.feedbackCount, stats.feedbackCount ? `${stats.averageRating} ★ average` : 'none yet']]
    : [['Total scans', '1,482', '↑ 18.4% this month'], ['Drafts created', '846', '↑ 12.6% this month'], ['Sent to Google', '624', '42% of scans'], ['Private feedback', '126', '4.8 ★ average']];
  const rows = live ? stats.recentFeedback.map(f => ({ name: `${f.rating}-star feedback`, business: new Date(f.createdAt).toLocaleDateString() + (f.contact ? ` · ${f.contact}` : ''), stars: f.rating, text: f.message })) : sampleReviews;
  const max = live ? Math.max(1, ...stats.scansByDay.map(d => d.count)) : 1;
  const sub = user?.subscription;
  return (
    <>
      {user && sub && <div className="notice">{sub.plan === 'Trial' ? `Free trial active until ${new Date(sub.expiresAt).toLocaleDateString()}.` : `${sub.plan} plan active until ${new Date(sub.expiresAt).toLocaleDateString()}.`}{!user.access && ' Your plan has expired. Your review page is paused until you renew.'}</div>}
      {user && !business && <div className="notice">Set up your business to get your review page and live numbers. <button className="text-btn" onClick={() => navigate('My business')}>Set up now ↗</button></div>}
      <div className="dash-grid">{cards.map(m => <div className="metric-card" key={m[0]}><span>{m[0]}</span><strong>{m[1]}</strong><small>{m[2]}</small></div>)}</div>
      <div className="dash-bottom">
        <div className="panel">
          <div className="panel-heading"><h3>{live ? 'Recent private feedback' : 'Sample customer feedback'}</h3><span className="demo-tag">{live ? 'LIVE DATA' : 'SAMPLE DATA'}</span></div>
          {live && <div className="bars">{stats.scansByDay.map(d => <div key={d.day} title={`${d.day}: ${d.count} scans`}><i style={{ height: `${(d.count / max) * 100}%` }} /><small>{d.day.slice(8)}</small></div>)}</div>}
          {live && !rows.length && <p className="tiny-note">No private feedback yet.</p>}
          {rows.map((r, i) => <div className="review-row" key={i}><div className="avatar">{r.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div><div className="review-row-copy"><b>{r.name} <span className="stars small-stars">{'★'.repeat(r.stars)}</span></b><small>{r.business}</small><p>{r.text}</p></div></div>)}
        </div>
        <div className="panel">
          <h3>Quick actions</h3>
          <div className="quick-actions">
            <button onClick={() => navigate('My business')}>◈ Business profile <span>↗</span></button>
            <button onClick={() => navigate('QR flyer')}>▦ QR flyer <span>↗</span></button>
            <button onClick={() => navigate('Reply assistant')}>✉ Reply assistant <span>↗</span></button>
            <button onClick={() => navigate('SEO analyzer')}>◎ SEO analyzer <span>↗</span></button>
            <button onClick={() => navigate('Pricing')}>◇ Plans <span>↗</span></button>
          </div>
          <div className="notice small-notice">{user ? 'Numbers update as customers use your review page.' : 'Sign in to see your own live numbers.'}</div>
        </div>
      </div>
    </>
  );
}

/* ---------- QR flyer builder ---------- */
const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, y); line = word; y += lineHeight; } else line = test;
  }
  ctx.fillText(line, x, y);
  return y;
};

async function buildFlyerPng({ qrUrl, color, headline, sub, name, qrLabel }) {
  const W = 1240, H = 1748; // A6 at 300 dpi
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = color; ctx.fillRect(0, 0, W, 280);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff'; ctx.font = '700 76px sans-serif'; wrapText(ctx, name || 'Your business', W / 2, 170, W - 160, 90);
  ctx.fillStyle = '#18251d'; ctx.font = '700 96px sans-serif';
  const endY = wrapText(ctx, headline, W / 2, 470, W - 200, 112);
  ctx.fillStyle = '#6c786f'; ctx.font = '400 52px sans-serif'; wrapText(ctx, sub, W / 2, endY + 90, W - 240, 64);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = qrUrl; });
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = color; ctx.lineWidth = 8;
  ctx.fillRect(220, 800, 800, 800); ctx.strokeRect(220, 800, 800, 800);
  ctx.drawImage(img, 250, 830, 740, 740);
  ctx.fillStyle = color; ctx.font = '700 56px sans-serif'; ctx.fillText(qrLabel || 'Scan to leave a review', W / 2, 1670);
  return new Promise(res => canvas.toBlob(res, 'image/png'));
}

export function QrFlyer({ business, cfg, notify, navigate, initialMode }) {
  const [resolvedQrTarget, setResolvedQrTarget] = useState('');
  const [mode, setMode] = useState(initialMode || (business ? 'funnel' : 'url'));
  const [url, setUrl] = useState('');
  const [wa, setWa] = useState(cfg?.whatsappNumber || '');
  const [waMsg, setWaMsg] = useState('Hi! I would like to share my feedback.');
  const [color, setColor] = useState(business?.brandColor || '#1d4934');
  const [headline, setHeadline] = useState('Enjoyed your visit?');
  const [sub, setSub] = useState('Scan the code and share your experience in 30 seconds.');
  const [qr, setQr] = useState('');
  const name = business?.name || 'Your business';
  useEffect(() => { if (cfg?.whatsappNumber && !wa) setWa(cfg.whatsappNumber); }, [cfg]);

  const target = async () => {
    let t = '';
    if (mode === 'paymentDemo') t = `${window.location.origin.replace(/\/$/, '')}/demo-checkout`;
    else if (mode === 'funnel') t = business ? funnelUrl(cfg, business) : '';
    else if (mode === 'url') t = url.trim();
    else {
      let d = wa.replace(/\D/g, '');
      if (d.length === 10) d = '91' + d;
      t = d.length >= 11 && d.length <= 15 ? `https://wa.me/${d}?text=${encodeURIComponent(waMsg)}` : '';
    }
    if (t && /localhost|127\.0\.0\.1/.test(t)) {
      try {
        const r = await fetch('/api/network-info');
        const info = await r.json();
        if (info?.ip) { const parsed = new URL(t); parsed.hostname = info.ip; if (parsed.port === '5000' || !parsed.port) parsed.port = window.location.port || '5173'; t = parsed.toString(); }
      } catch { /* keep the local URL and show the note below */ }
    }
    return t;
  };
  const makeQr = async () => {
    const t = await target();
    if (!t) return notify(mode === 'funnel' ? 'Set up your business first to get a review link.' : mode === 'whatsapp' ? 'Enter a valid WhatsApp number with country code, for example 919876543210.' : mode === 'url' ? 'Enter a link first.' : 'Could not create the demo payment link.');
    if (/localhost|127\.0\.0\.1/.test(t)) notify('Heads up: a localhost link will not open on a customer’s phone. Deploy the site or set PUBLIC_URL.');
    const data = await QRCode.toDataURL(t, { width: 740, margin: 1, color: { dark: '#152b20', light: '#ffffff' } });
    setResolvedQrTarget(t);
    setQr(data);
    return data;
  };
  const download = async () => {
    const qrUrl = qr || await makeQr();
    if (!qrUrl) return;
    const blob = await buildFlyerPng({ qrUrl, color, headline, sub, name, qrLabel: mode === 'paymentDemo' ? 'Scan to view payment plans' : 'Scan to leave a review' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = mode === 'paymentDemo' ? 'razorpay-demo-payment-flyer-a6.png' : 'review-flyer-a6.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const tab = (id, label) => <button type="button" className={mode === id ? 'selected' : ''} onClick={() => { setMode(id); setQr(''); }}>{label}</button>;
  return (
    <div className="tool-layout">
      <div className="panel form-panel">
        <label>What should the QR open?<div className="pricing-toggle">{tab('funnel', 'Review page')}{tab('whatsapp', 'WhatsApp')}{tab('url', 'Custom link')}{tab('paymentDemo', 'Payment demo')}</div></label>
        {mode === 'funnel' && !business && <p className="tiny-note">Set up your business first. <button type="button" className="text-btn" onClick={() => navigate('My business')}>Open business profile ↗</button></p>}
        {mode === 'funnel' && business && <p className="tiny-note">Opens your customer review page: {resolvedQrTarget || funnelUrl(cfg, business)}</p>}
        {mode === 'whatsapp' && <><label>WhatsApp number with country code<input value={wa} onChange={e => setWa(e.target.value)} placeholder="919876543210" /></label><label>Pre-filled message<textarea rows="2" value={waMsg} onChange={e => setWaMsg(e.target.value)} /></label></>}
        {mode === 'url' && <label>Link<input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-link.com" /></label>}
        {mode === 'paymentDemo' && <div className="notice"><strong>Payment flow demo — no real money</strong><p>This QR opens the built-in demo checkout where you can select a plan and simulate success or failure. No Razorpay transaction is created.</p><small>On the same Wi-Fi, the generator tries to use your computer’s local network IP for phone scanning. For testing outside your Wi-Fi, deploy the site to an HTTPS URL.</small></div>}
        <label>Headline<input value={headline} onChange={e => setHeadline(e.target.value)} /></label>
        <label>Sub text<textarea rows="2" value={sub} onChange={e => setSub(e.target.value)} /></label>
        <label>Flyer color<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label>
        <button className="btn btn-dark full" onClick={makeQr}>Generate QR code</button>
        <p className="tiny-note">For phone scanning, keep the phone and computer on the same Wi-Fi. For scans from anywhere, deploy the site and set PUBLIC_URL to its HTTPS address.</p>
      </div>
      <div className="panel qr-panel">
        <div className="flyer-preview" style={{ borderColor: color }}>
          <span className="brand-mark" style={{ background: color }}>✦</span>
          <h3 style={{ color }}>{headline}</h3>
          <p>{sub}</p>
          {qr ? <img src={qr} alt="Generated QR code" /> : <div className="qr-placeholder">▦<small>QR PREVIEW</small></div>}
          <b>{mode === 'paymentDemo' ? 'Scan to view payment plans' : 'Scan to leave a review'}</b>
          <small>{name}</small>
        </div>
        <div className="flyer-actions">
          <button className="btn btn-light" onClick={() => { const a = document.createElement('a'); if (!qr) return makeQr(); a.href = qr; a.download = mode === 'paymentDemo' ? 'razorpay-demo-payment-qr.png' : 'qr-code.png'; a.click(); }}>QR only ↓</button>
          <button className="btn btn-dark" onClick={download}>Download A6 flyer ↓</button>
        </div>
      </div>
    </div>
  );
}
