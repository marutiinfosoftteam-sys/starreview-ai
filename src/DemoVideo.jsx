import React, { useEffect, useRef, useState } from 'react';
import './demoVideo.css';

// "Virtual demo video": a ~40 second animated walkthrough of how StarReview AI works.
// Everything is drawn from the clock `t`, so it can play, pause, seek and replay like a video.

const SCENES = [
  { id: 'scan', title: 'Customer scans your QR', caption: 'A happy customer scans the QR standee on your counter. No app to install.', ms: 6000 },
  { id: 'stars', title: 'Taps the stars', caption: 'Your review page opens instantly and asks one simple question.', ms: 5500 },
  { id: 'pick', title: 'Picks a ready review', caption: '3, 4 or 5 stars? Ready-made reviews written for your type of business. No typing.', ms: 7500 },
  { id: 'post', title: 'Posts it on Google', caption: 'One tap copies the review and opens Google. Paste, tap Post, done.', ms: 8000 },
  { id: 'private', title: '1–2 stars stay private', caption: 'Unhappy customers send their feedback privately to you, so you can make it right.', ms: 7000 },
  { id: 'dash', title: 'You track everything', caption: 'Scans, reviews and complaints arrive in your dashboard, newest first.', ms: 6000 }
];
const TOTAL = SCENES.reduce((a, s) => a + s.ms, 0);
const STARTS = SCENES.reduce((acc, s, i) => [...acc, i ? acc[i - 1] + SCENES[i - 1].ms : 0], []);

const BIZ = 'Krishna Café';
const REVIEWS = [
  'Had a fantastic experience at Krishna Café. The coffee is rich and perfectly made. Will visit again!',
  'So glad I chose Krishna Café! The cakes are fresh and soft. Special thanks to Ravi for the great service. Highly recommended! ⭐⭐⭐⭐⭐',
  'Great place to hang out with friends. Keep up the great work, Krishna Café!'
];
const COMPLAINT = 'Coffee was cold today and we waited 20 minutes.';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const span = (p, a, b) => clamp((p - a) / (b - a)); // 0→1 while p goes a→b
const ease = x => 1 - Math.pow(1 - x, 3);
const fmt = ms => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const typed = (text, x) => text.slice(0, Math.round(text.length * clamp(x)));

function Phone({ children, className = '', style }) {
  return (
    <div className={`dv-phone ${className}`} style={style}>
      <div className="dv-phone-notch" />
      <div className="dv-phone-screen">{children}</div>
    </div>
  );
}

function PageTop() {
  return (
    <div className="dv-page-top">
      <span className="dv-page-biz">{BIZ.toUpperCase()}</span>
      <b>How was your experience?</b>
    </div>
  );
}

function Stars({ filled, tapIndex = -1, size = 26 }) {
  return (
    <div className="dv-stars" style={{ fontSize: size }}>
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} className={`${i < filled ? 'on' : ''} ${i === tapIndex ? 'tap' : ''}`}>★</span>
      ))}
    </div>
  );
}

function SceneScan({ p }) {
  const move = ease(span(p, 0, 0.35));
  const scanned = p > 0.72;
  return (
    <div className="dv-scene dv-scene-scan">
      <div className="dv-standee">
        <div className="dv-standee-top"><i className="fa-solid fa-star" /> Review us on Google</div>
        <div className="dv-qr"><i className="fa-solid fa-qrcode" /></div>
        <div className="dv-standee-foot">★★★★★ Scan · Tap · Post</div>
        <div className="dv-standee-name">{BIZ}</div>
      </div>
      <Phone className="dv-phone-scan" style={{ transform: `translateX(${(1 - move) * 90}px) rotate(${(1 - move) * 8}deg)` }}>
        {!scanned ? (
          <div className="dv-camera">
            <div className="dv-camera-frame">
              <i className="fa-solid fa-qrcode" />
              {p > 0.35 && <div className="dv-scanline" style={{ top: `${(span(p, 0.35, 0.7) * 100) % 100}%` }} />}
            </div>
            <small>Point the camera at the QR</small>
          </div>
        ) : (
          <div className="dv-camera dv-camera-done">
            <div className="dv-link-pill"><i className="fa-solid fa-link" /> starreview.ai/r/krishna-cafe</div>
            <div className="dv-opening"><i className="fa-solid fa-circle-check" /> Opening review page…</div>
          </div>
        )}
      </Phone>
    </div>
  );
}

function SceneStars({ p }) {
  const filled = p < 0.2 ? 0 : clamp(Math.floor((p - 0.2) / 0.11) + 1, 0, 5);
  return (
    <div className="dv-scene">
      <Phone>
        <PageTop />
        <p className="dv-hint">Tap a star. We'll write a ready review for you to post on Google.</p>
        <Stars filled={filled} tapIndex={filled - 1} size={30} />
        {filled === 5 && <div className="dv-chip dv-pop">⭐ 5 stars. Thank you!</div>}
        <div className="dv-trust"><span>⚡ Quick</span><span>✦ Ready-made</span><span>🔒 Secure</span></div>
      </Phone>
    </div>
  );
}

function ReviewOptions({ p, selected }) {
  return (
    <div className="dv-options">
      {REVIEWS.map((r, i) => (
        <div key={i} className={`dv-option ${selected === i ? 'selected' : ''}`} style={{ opacity: span(p, 0.08 + i * 0.1, 0.18 + i * 0.1), transform: `translateY(${(1 - ease(span(p, 0.08 + i * 0.1, 0.22 + i * 0.1))) * 14}px)` }}>
          <span>{r}</span>
          <em>{selected === i ? '✓ Selected' : 'Use this'}</em>
        </div>
      ))}
    </div>
  );
}

function ScenePick({ p }) {
  const selected = p > 0.58 ? 1 : -1;
  return (
    <div className="dv-scene">
      <Phone>
        <div className="dv-rating-bar"><span>Your rating</span><Stars filled={5} size={14} /><b>5/5</b></div>
        <div className="dv-step-title"><span>1</span> Tap the review you like</div>
        <ReviewOptions p={p} selected={selected} />
        {p > 0.75 && <div className="dv-more dv-pop">🔄 Show different reviews</div>}
      </Phone>
      <div className="dv-side-note" style={{ opacity: span(p, 0.3, 0.45) }}>
        <b>3,300 to 25,000+</b>
        <span>different reviews for each star rating, written for cafés, salons, clinics, shops and more</span>
      </div>
    </div>
  );
}

function ScenePost({ p }) {
  const onGoogle = p > 0.4;
  const pressed = p > 0.18 && p < 0.26;
  return (
    <div className="dv-scene">
      <Phone>
        {!onGoogle ? (
          <>
            <div className="dv-step-title"><span>2</span> Your review <small>(you can edit it)</small></div>
            <div className="dv-final">{REVIEWS[1]}</div>
            <div className={`dv-btn ${pressed ? 'pressed' : ''}`}>Copy review &amp; post 5★ on Google</div>
            {p > 0.24 && <div className="dv-toast dv-pop">✓ Review copied! Paste &amp; tap Post on Google.</div>}
          </>
        ) : (
          <div className="dv-google">
            <div className="dv-google-head"><i className="fa-brands fa-google" /> <b>{BIZ}</b></div>
            <small>Posting publicly across Google</small>
            <Stars filled={p > 0.45 ? 5 : 0} size={24} />
            <div className="dv-google-box">{typed(REVIEWS[1], span(p, 0.5, 0.8))}<span className="dv-caret" /></div>
            <div className={`dv-google-post ${p > 0.84 && p < 0.9 ? 'pressed' : ''}`}>Post</div>
            {p > 0.88 && <div className="dv-posted dv-pop"><i className="fa-solid fa-circle-check" /> Review posted on Google</div>}
          </div>
        )}
      </Phone>
    </div>
  );
}

function ScenePrivate({ p }) {
  const sent = p > 0.74;
  return (
    <div className="dv-scene">
      <Phone>
        <PageTop />
        <Stars filled={p > 0.08 ? 2 : 0} tapIndex={p > 0.08 && p < 0.2 ? 1 : -1} size={24} />
        {!sent ? (
          <div className="dv-private" style={{ opacity: span(p, 0.15, 0.25) }}>
            <p>We are sorry we did not meet your expectations. Please tell us what happened.</p>
            <div className="dv-input">{typed(COMPLAINT, span(p, 0.28, 0.62))}<span className="dv-caret" /></div>
            <div className={`dv-btn dark ${p > 0.66 ? 'pressed' : ''}`}>Send private feedback</div>
          </div>
        ) : (
          <div className="dv-sent dv-pop">
            <i className="fa-solid fa-lock" />
            <b>Sent privately to the owner</b>
            <span>It is not posted on Google.</span>
          </div>
        )}
      </Phone>
      <div className="dv-side-note warn" style={{ opacity: span(p, 0.3, 0.45) }}>
        <b>🔒 Private</b>
        <span>1–2 star feedback goes to your Negative Reviews inbox instead of Google</span>
      </div>
    </div>
  );
}

function SceneDash({ p }) {
  const k = ease(span(p, 0.05, 0.6));
  const bars = [38, 52, 45, 70, 62, 84, 96];
  return (
    <div className="dv-scene">
      <div className="dv-dash">
        <div className="dv-dash-top">
          <span className="dv-dash-logo"><i className="fa-solid fa-star" /></span>
          <b>{BIZ}</b>
          <span className="dv-live"><span /> LIVE</span>
        </div>
        <div className="dv-tiles">
          <div><small>QR scans</small><strong>{Math.round(1248 * k).toLocaleString('en-IN')}</strong></div>
          <div><small>Reviews posted</small><strong>{Math.round(842 * k).toLocaleString('en-IN')}</strong></div>
          <div><small>Google rating</small><strong>{(4.1 + 0.7 * k).toFixed(1)}★</strong></div>
          <div><small>Complaints caught</small><strong>{Math.round(37 * k)}</strong></div>
        </div>
        <div className="dv-dash-bottom">
          <div className="dv-chart">
            <small>Scans this week</small>
            <div className="dv-bars">{bars.map((h, i) => <span key={i} style={{ height: `${h * ease(span(p, 0.1 + i * 0.04, 0.4 + i * 0.04))}%` }} />)}</div>
          </div>
          <div className="dv-neg">
            <small>Negative reviews · newest first</small>
            <div className="dv-neg-item new" style={{ opacity: span(p, 0.55, 0.65), transform: `translateX(${(1 - ease(span(p, 0.55, 0.7))) * 30}px)` }}>
              <span className="dv-neg-stars">★★☆☆☆</span><span>{COMPLAINT}</span><em>just now</em>
            </div>
            <div className="dv-neg-item"><span className="dv-neg-stars">★☆☆☆☆</span><span>Billing counter was slow on Sunday.</span><em>2 days ago</em></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const RENDER = { scan: SceneScan, stars: SceneStars, pick: ScenePick, post: ScenePost, private: ScenePrivate, dash: SceneDash };

export default function DemoVideo() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const boxRef = useRef(null);
  const frameRef = useRef(null);
  const last = useRef(0);

  // Video frame: 16:9 on desktop/tablet, 9:20 on phones. Scenes are drawn on a fixed canvas
  // and scaled to the frame, so the demo looks identical at every screen size.
  const phoneQuery = '(max-width: 760px)';
  const [portrait, setPortrait] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(phoneQuery).matches);
  const [scale, setScale] = useState(1);
  const CANVAS = portrait ? { w: 360, h: 800 } : { w: 960, h: 540 };
  useEffect(() => {
    const mq = window.matchMedia?.(phoneQuery);
    if (!mq) return undefined;
    const on = () => setPortrait(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on));
  }, []);
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return undefined;
    const fit = () => setScale(el.clientWidth / CANVAS.w);
    fit();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit); }
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [CANVAS.w]);

  // Clock
  useEffect(() => {
    if (!playing) return undefined;
    let id;
    last.current = performance.now();
    const tick = now => {
      const dt = now - last.current;
      last.current = now;
      setT(prev => {
        const next = prev + dt;
        if (next >= TOTAL) { setPlaying(false); return TOTAL; }
        return next;
      });
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [playing]);

  // Autoplay (muted, it has no sound) the first time it scrolls into view; pause when it leaves
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
        if (!started && !reduce) { setStarted(true); setPlaying(true); }
      } else if (!entry.isIntersecting) {
        setPlaying(false);
      }
    }, { threshold: [0, 0.5] });
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  const sceneIndex = Math.max(0, STARTS.findIndex((s, i) => t >= s && t < s + SCENES[i].ms));
  const idx = t >= TOTAL ? SCENES.length - 1 : sceneIndex;

  // Keep the current chapter chip visible when chapters scroll sideways (tablet / phone)
  const chaptersRef = useRef(null);
  useEffect(() => {
    const box = chaptersRef.current;
    const chip = box?.children[idx];
    if (!box || !chip || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({ left: chip.offsetLeft - (box.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
  }, [idx]);
  const scene = SCENES[idx];
  const p = t >= TOTAL ? 1 : clamp((t - STARTS[idx]) / scene.ms);
  const Scene = RENDER[scene.id];
  const ended = t >= TOTAL;

  const toggle = () => {
    setStarted(true);
    if (ended) { setT(0); setPlaying(true); return; }
    setPlaying(v => !v);
  };
  const seekTo = ms => { setStarted(true); setT(clamp(ms, 0, TOTAL - 1)); };
  const onBar = e => {
    const r = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - r.left) / r.width) * TOTAL);
  };

  return (
    <div className="dv-player" ref={boxRef}>
      <div className="dv-chapters" ref={chaptersRef} role="tablist" aria-label="Demo chapters">
        {SCENES.map((s, i) => (
          <button type="button" key={s.id} role="tab" aria-selected={i === idx} className={i === idx ? 'active' : i < idx ? 'done' : ''}
            onClick={() => { seekTo(STARTS[i]); setPlaying(true); }}>
            <span className="dv-ch-num">{i < idx ? '✓' : i + 1}</span>
            <span className="dv-ch-title">{s.title}</span>
          </button>
        ))}
      </div>

      <div className={`dv-frame ${portrait ? 'portrait' : 'landscape'}`} ref={frameRef}>
        <div className={`dv-canvas ${portrait ? 'portrait' : 'landscape'}`}
          style={{ width: CANVAS.w, height: CANVAS.h, transform: `scale(${scale})` }}>
          <div className="dv-stage" onClick={toggle} role="button" tabIndex={0} aria-label={playing ? 'Pause demo' : 'Play demo'}
            onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } }}>
            <div className="dv-stage-inner" key={scene.id}>
              <Scene p={p} />
            </div>
            <div className="dv-caption"><span>{idx + 1}/{SCENES.length}</span>{scene.caption}</div>
            {(!playing || ended) && (
              <div className="dv-overlay">
                <span className="dv-big-play"><i className={`fa-solid ${ended ? 'fa-rotate-right' : 'fa-play'}`} /></span>
                <b>{ended ? 'Watch again' : started ? 'Paused' : 'Watch the 40-second demo'}</b>
              </div>
            )}
          </div>

          <div className="dv-controls">
            <button type="button" className="dv-ctl" onClick={toggle} aria-label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}>
              <i className={`fa-solid ${playing ? 'fa-pause' : ended ? 'fa-rotate-right' : 'fa-play'}`} />
            </button>
            <div className="dv-bar" onClick={onBar} role="slider" aria-label="Demo progress" aria-valuemin={0} aria-valuemax={Math.round(TOTAL / 1000)} aria-valuenow={Math.round(t / 1000)}>
              {SCENES.map((s, i) => (
                <span key={s.id} className="dv-seg" style={{ flex: s.ms }}>
                  <span style={{ width: `${i < idx ? 100 : i === idx ? p * 100 : 0}%` }} />
                </span>
              ))}
            </div>
            <span className="dv-time">{fmt(t)} / {fmt(TOTAL)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
