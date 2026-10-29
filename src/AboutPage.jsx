import React, { useState } from 'react';
import { api } from './api.js';

export default function AboutPage({ user, navigate, setRegMode, notify, logout, choosePlan }) {
  // Live Demo States
  const [demoBiz, setDemoBiz] = useState('Verde Eco Landing');
  const [demoRating, setDemoRating] = useState(5);
  const [demoExp, setDemoExp] = useState('super quick service and very friendly staff');
  const [demoStaff, setDemoStaff] = useState('Priya');
  const [demoKeyword, setDemoKeyword] = useState('eco packaging');
  const [demoLang, setDemoLang] = useState('English');
  const [demoDrafts, setDemoDrafts] = useState([
    "Loved the eco packaging at Verde Eco Landing! Priya helped us find exactly what we needed. Highly recommend for great customer service! ★★★★★",
    "Fantastic experience with Verde Eco Landing. Quick appointment, friendly team, and the eco packaging quality was outstanding. Thanks Priya!",
    "Best place in town! The staff was super welcoming and attentive. Five stars all the way for exceptional service and great value."
  ]);
  const [demoLoading, setDemoLoading] = useState(false);

  // Pricing Toggle: 'without-reply' vs 'with-reply'
  const [pricingToggle, setPricingToggle] = useState('without-reply');

  const handleStartFree = () => {
    if (user) {
      navigate('Dashboard');
    } else {
      if (setRegMode) setRegMode(true);
      navigate('Account');
    }
  };

  const handleSignIn = () => {
    if (user) {
      navigate('Dashboard');
    } else {
      if (setRegMode) setRegMode(false);
      navigate('Account');
    }
  };

  const handleGenerateDrafts = async (e) => {
    e?.preventDefault?.();
    setDemoLoading(true);
    try {
      const r = await api('POST', '/api/drafts', {
        business: demoBiz,
        experience: demoExp,
        staff: demoStaff,
        keywords: demoKeyword,
        language: demoLang,
        rating: demoRating
      });
      if (r.ok && r.data && Array.isArray(r.data.drafts) && r.data.drafts.length > 0) {
        setDemoDrafts(r.data.drafts);
        if (notify) notify('✦ 3 New AI drafts created! Ready to copy.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    if (notify) notify('Copied review draft to clipboard! ↗');
  };

  return (
    <div className="rf-landing-page">
      {/* ====================================================================
          SCREENSHOT 1: HERO SECTION & FLOATING CHIPS + VIDEO PREVIEW
          ==================================================================== */}
      <section className="rf-hero-container">
        {/* Background Grid Pattern */}
        <div className="rf-grid-bg"></div>

        <div className="rf-hero-content wrap">
          {/* Top Pill Badge */}
          <div className="rf-pill-badge">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>THE GOOGLE MAGIC REVIEW QR PLATFORM</span>
          </div>

          {/* Main Headline */}
          <h1 className="rf-hero-heading">
            Turn Every Customer into a<br />
            <span className="rf-text-green">5-Star Google Review in 10s</span>
          </h1>

          {/* Subtitle */}
          <p className="rf-hero-subtitle">
            We generate smart review QR codes for Google My Business. <strong>StarReview AI</strong> helps your customers write and post authentic 5-star Google reviews in 10 seconds, while private feedback shields your public rating.
          </p>

          {/* CTA Buttons */}
          <div className="rf-hero-cta-group">
            <button
              type="button"
              className="rf-btn-green-main"
              onClick={handleStartFree}
            >
              <i className="fa-solid fa-rocket"></i>
              Start 3-Day Free Trial
            </button>
            <button
              type="button"
              className="rf-btn-outline-main"
              onClick={() => {
                const el = document.getElementById('working-process');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigate('How it works');
              }}
            >
              <i className="fa-regular fa-circle-question"></i>
              How It Works
            </button>
          </div>

          {/* Micro Trust Strip */}
          <div className="rf-micro-trust">
            <span className="rf-trust-pill">No credit card required</span>
            <span className="rf-trust-sep">&bull;</span>
            <span className="rf-trust-bolt">
              <i className="fa-solid fa-bolt" style={{ color: '#ca8a04', marginRight: 4 }}></i> Ready in 2 minutes
            </span>
          </div>

          {/* Floating Customer Review Chips */}
          <div className="rf-floating-chips-row">
            {/* Chip 1 */}
            <div className="rf-review-chip">
              <div className="rf-chip-avatar" style={{ background: '#2563eb' }}>RK</div>
              <div className="rf-chip-stars">★★★★★</div>
              <span className="rf-chip-text">Amazing service!</span>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>

            {/* Chip 2 */}
            <div className="rf-review-chip">
              <div className="rf-chip-avatar" style={{ background: '#16a34a' }}>PM</div>
              <div className="rf-chip-stars">★★★★★</div>
              <span className="rf-chip-text">Highly recommend!</span>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>

            {/* Chip 3 */}
            <div className="rf-review-chip">
              <div className="rf-chip-avatar" style={{ background: '#dc2626' }}>AS</div>
              <div className="rf-chip-stars">★★★★★</div>
              <span className="rf-chip-text">Best in the area 😍</span>
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
          </div>

          {/* YouTube Video / Standee Graphic Card */}
          <div className="rf-video-showcase-wrap">
            <div className="rf-video-inner" onClick={() => navigate('Try the demo')}>
              <div className="rf-video-banner-art">
                <div className="rf-vba-left">
                  <div className="rf-vba-logo">
                    <span className="star-icon">★</span> StarReview <b>AI</b>
                  </div>
                  <div className="rf-vba-gmb">
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google My Business</span>
                  </div>
                  <h3 className="rf-vba-title">
                    AI POWERED<br />REVIEW QR<br /><span>FOR GOOGLE MY BUSINESS</span>
                  </h3>
                  <div className="rf-vba-perks">
                    <span>✓ Real Reviews</span>
                    <span>✓ Quick &amp; Easy</span>
                    <span>✓ Secure</span>
                  </div>
                </div>

                {/* Right: Mock Standee Preview */}
                <div className="rf-vba-right">
                  <div className="rf-mock-standee-preview">
                    <div className="rf-msp-header">
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      </svg>
                      <div>
                        <strong>Team Maruti InfoSoft</strong>
                        <div style={{ color: '#eab308', fontSize: '0.7rem' }}>★★★★★</div>
                      </div>
                    </div>
                    <div className="rf-msp-title">Review Us on Google</div>
                    <div className="rf-msp-qr-box">
                      <div className="rf-msp-qr-center">
                        <i className="fa-solid fa-qrcode" style={{ fontSize: '4.5rem', color: '#0f172a' }}></i>
                      </div>
                    </div>
                    <div className="rf-msp-footer">Takes less than <b>10 seconds</b></div>
                  </div>
                </div>
              </div>

              {/* YouTube Play Icon Overlay */}
              <div className="rf-play-btn-circle" title="Play Video Demo">
                <i className="fa-brands fa-youtube"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SCREENSHOT 2: FEATURE PILLS & CORE SYSTEM FEATURES (6 CARDS)
          ==================================================================== */}
      <section className="rf-features-section wrap">
        {/* Sub-bar Pills Row */}
        <div className="rf-subbar-pills">
          <span><i className="fa-solid fa-wand-magic-sparkles"></i> Google Magic Review QR</span>
          <span><i className="fa-brands fa-google"></i> Google My Business Review QR</span>
          <span><i className="fa-solid fa-bolt"></i> AI-Powered Review QR Funnels</span>
          <span><i className="fa-solid fa-shield-halved"></i> Private Feedback Shield</span>
          <span><i className="fa-solid fa-print"></i> Print-Ready Designer Standees</span>
        </div>

        {/* Section Header */}
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> CORE SYSTEM FEATURES
          </div>
          <h2>
            Why Businesses Choose <span className="rf-text-green">StarReview AI</span>
          </h2>
          <p>
            A complete review growth engine that turns store visits into 5-star Google Business reviews effortlessly.
          </p>
        </div>

        {/* 6 Features Cards Grid */}
        <div className="rf-six-grid">
          {/* Card 1 */}
          <div className="rf-six-card">
            <div className="rf-sc-icon green">
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h3>Google Magic Review QR</h3>
            <p>
              Interactive QR funnel that eliminates blank screens and guides happy patrons to draft personalized 5-star feedback in 10 seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rf-six-card">
            <div className="rf-sc-icon blue">
              <i className="fa-solid fa-print"></i>
            </div>
            <h3>Print-Ready QR Standees</h3>
            <p>
              Generate high-resolution, customized A6 table tent cards and counter display flyers matching your brand colors and logo.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rf-six-card">
            <div className="rf-sc-icon purple">
              <i className="fa-solid fa-robot"></i>
            </div>
            <h3>AI-Powered Review QR Generator</h3>
            <p>
              Crafts 3 authentic, human-like review variations in 24+ languages, automatically embedding your high-intent SEO keywords.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rf-six-card">
            <div className="rf-sc-top-flex">
              <div className="rf-sc-icon dark-green">
                <i className="fa-solid fa-robot"></i>
              </div>
              <span className="rf-autopilot-tag">⚡ 24/7 AUTOPILOT</span>
            </div>
            <h3>AI Powered Automatic Review Reply</h3>
            <p>
              Connect your Google Business Profile to automatically publish intelligent, brand-consistent responses to 100% of reviews 24/7 on autopilot.
            </p>
          </div>

          {/* Card 5 */}
          <div className="rf-six-card">
            <div className="rf-sc-icon teal">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3>Private Negative Review Shield</h3>
            <p>
              Intercept 1–3 star dissatisfaction internally before it ever reaches Google, giving your team the chance to resolve issues privately.
            </p>
          </div>

          {/* Card 6 */}
          <div className="rf-six-card">
            <div className="rf-sc-icon red">
              <i className="fa-solid fa-stethoscope"></i>
            </div>
            <h3>AI Google Business Profile Analyzer</h3>
            <p>
              Instant 20-point diagnostic audit for your Google listing with a Health Score and actionable recommendations to rank in the Google 3-Pack.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SCREENSHOT 3: 24/7 AUTOPILOT REVIEW REPLY SYSTEM (DARK GREEN CONTAINER)
          ==================================================================== */}
      <section className="rf-autopilot-section wrap">
        <div className="rf-autopilot-container">
          <div className="rf-autopilot-grid">
            {/* Left Content */}
            <div className="rf-ap-left">
              <div className="rf-ap-badge">
                <i className="fa-solid fa-bolt"></i> 24/7 AUTOPILOT REPUTATION ENGINE
              </div>
              <h2>
                Never Leave a Customer Waiting:<br />
                <span className="rf-text-mint">AI Powered Automatic Review Reply System</span>
              </h2>
              <p className="rf-ap-desc">
                Respond to 100% of your Google reviews in seconds. Our autonomous AI engine analyzes customer sentiment, matches your brand voice, and publishes authentic, keyword-optimized responses straight to Google Maps on complete autopilot.
              </p>

              <ul className="rf-ap-checklist">
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <div>
                    <strong>Instant 24/7 Autopilot:</strong> Direct Google Business Profile API publishing within minutes of review receipt.
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <div>
                    <strong>Sentiment-Aware Intelligence:</strong> Enthusiastic gratitude for 5-star praise, empathetic de-escalation for 1–3 star complaints.
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <div>
                    <strong>Local SEO Keyword Injections:</strong> Mentions your top services and city naturally to boost your Google Maps ranking signals.
                  </div>
                </li>
                <li>
                  <i className="fa-solid fa-circle-check"></i>
                  <div>
                    <strong>Complete Owner Control:</strong> Choose set-and-forget hands-free autopilot, delay timers, or 1-click manual review.
                  </div>
                </li>
              </ul>

              <div className="rf-ap-actions">
                <button
                  type="button"
                  className="rf-btn-white-solid"
                  onClick={handleStartFree}
                >
                  <i className="fa-solid fa-robot"></i>
                  Activate Autopilot Replies
                </button>
                <button
                  type="button"
                  className="rf-btn-dark-outline"
                  onClick={() => navigate('Try the demo')}
                >
                  <i className="fa-solid fa-play"></i>
                  See Live Demo
                </button>
              </div>
            </div>

            {/* Right: Live Interactive Mock Reply Card */}
            <div className="rf-ap-right">
              <div className="rf-live-engine-card">
                <div className="rf-lec-header">
                  <div className="rf-lec-brand">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <strong>Live Auto-Reply Engine</strong>
                  </div>
                  <span className="rf-lec-badge">
                    <span className="rf-dot-pulse"></span> AUTOPILOT ACTIVE
                  </span>
                </div>

                {/* Customer Review Box */}
                <div className="rf-customer-review-box">
                  <div className="rf-cr-author-row">
                    <div className="rf-cr-avatar">SJ</div>
                    <div className="rf-cr-meta">
                      <strong>Sarah Jenkins</strong>
                      <small>Local Guide &bull; 38 reviews &bull; Just now</small>
                    </div>
                    <div className="rf-cr-stars">★★★★★</div>
                  </div>
                  <p className="rf-cr-text">
                    "Absolutely thrilled with the prompt service and attention to detail. The team was so kind and professional. Will recommend to all my friends!"
                  </p>
                </div>

                {/* Automated Response Box */}
                <div className="rf-auto-response-box">
                  <div className="rf-arb-header">
                    <span className="rf-arb-tag">
                      <i className="fa-solid fa-robot"></i> Automated Response &bull; Published in 38s
                    </span>
                    <span className="rf-arb-status">LIVE ON GOOGLE</span>
                  </div>
                  <p className="rf-arb-text">
                    "Hi Sarah! Thank you so much for your wonderful 5-star review! 😍 We're delighted you experienced our prompt customer service and professional team. Your recommendation means the world to our local staff. Looking forward to welcoming you back soon!"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SCREENSHOT 4: THE 4-STEP REVIEW FUNNEL
          ==================================================================== */}
      <section className="rf-funnel-section wrap" id="working-process">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> THE 4-STEP REVIEW FUNNEL
          </div>
          <h2>
            How StarReview AI <span className="rf-text-green">Generates 5-Star Reviews</span>
          </h2>
          <p>
            A friction-free mobile experience that turns happy in-store customers into authentic 5-star Google Business reviews in 10 seconds.
          </p>
        </div>

        <div className="rf-funnel-steps-grid">
          {/* Step 1 */}
          <div className="rf-funnel-step-card">
            <div className="rf-fsc-number">1</div>
            <h4>Scan Google Business Review QR</h4>
            <p>
              Customers scan your custom table standee or tap your review funnel link using any smartphone camera.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rf-funnel-step-card">
            <div className="rf-fsc-number">2</div>
            <h4>Select Experience &amp; Language</h4>
            <p>
              Patron selects 5 stars and chooses their preferred language from 24+ global and regional options.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rf-funnel-step-card">
            <div className="rf-fsc-number">3</div>
            <h4>AI Suggests Personalized Reviews</h4>
            <p>
              The <strong>Google Magic Review QR</strong> creates 3 human-like reviews with your business SEO keywords and emojis.
            </p>
          </div>

          {/* Step 4 */}
          <div className="rf-funnel-step-card">
            <div className="rf-fsc-number">4</div>
            <h4>1-Tap Copy &amp; Post to Google</h4>
            <p>
              Customer taps "Copy &amp; Post" and is immediately redirected to your Google My Business review popup.
            </p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SCREENSHOT 5: NORMAL QR CODES VS. GOOGLE MAGIC REVIEW QR
          ==================================================================== */}
      <section className="rf-comparison-section wrap">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> WHY GOOGLE MAGIC QR WINS
          </div>
          <h2>
            Normal QR Codes vs. <span className="rf-text-green">Google Magic Review QR</span>
          </h2>
          <p>
            See why traditional static QR stickers fail while StarReview AI converts up to 84% of customer scans.
          </p>
        </div>

        <div className="rf-comparison-grid">
          {/* Left: Standard Static QR */}
          <div className="rf-comp-card static-qr">
            <div className="rf-comp-badge red">
              <i className="fa-solid fa-xmark"></i> STANDARD STATIC QR
            </div>
            <h3>Basic Google Review Link</h3>
            <p className="rf-comp-sub">
              A static barcode opening a blank review box that leaves customers confused and unmotivated.
            </p>

            <ul className="rf-comp-list red-cross">
              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <span>Blank text box causes writer's block</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <span>English only — zero regional language choices</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <span>No keyword, staff, or product context</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <span>1–3 star ratings post directly to Google Maps</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-xmark"></i>
                <span>Zero scan, review, or copy interaction tracking</span>
              </li>
            </ul>
          </div>

          {/* Right: Review Flow AI Magic QR */}
          <div className="rf-comp-card magic-qr">
            <div className="rf-comp-badge green">
              <i className="fa-solid fa-wand-magic-sparkles"></i> STARREVIEW AI MAGIC QR
            </div>
            <h3>AI-Powered Review QR Funnel</h3>
            <p className="rf-comp-sub">
              An intelligent guided experience that crafts hyper-specific, positive reviews in 1 tap.
            </p>

            <ul className="rf-comp-list green-check">
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <span>3 instant human-like reviews eliminate blank screen delay</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <span>24+ languages including Hindi, Hinglish, &amp; regional dialects</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <span>Automatically injects staff names, services &amp; Google SEO keywords</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <span>Private feedback routing protects your Google My Business rating</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <span>AI Powered Automatic Review Reply system responds to all reviews 24/7</span>
              </li>
              <li>
                <i className="fa-solid fa-circle-check"></i>
                <span>Real-time analytics for scans, reviews, copies &amp; redirects</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Button */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button
            type="button"
            className="rf-btn-outline-center"
            onClick={() => navigate('AI vs QR')}
          >
            View Full Feature Comparison <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6: WORKING PROCESS - LIVE INTERACTIVE REVIEW GENERATOR TOOL
          ==================================================================== */}
      <section className="rf-interactive-demo-section wrap">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> LIVE WORKING PROCESS DEMO
          </div>
          <h2>
            Test the AI Review Generator <span className="rf-text-green">Right Now</span>
          </h2>
          <p>
            Experience the exact working flow your customers will see. Select your rating, enter your details, and see instant AI suggestions.
          </p>
        </div>

        <div className="rf-demo-box-card">
          <div className="rf-demo-form-side">
            <div className="rf-dfs-title">
              <i className="fa-solid fa-sliders" style={{ color: '#16a34a' }}></i>
              <span>Interactive Customer Review Form</span>
            </div>

            <div className="rf-demo-group">
              <label>Business Name</label>
              <input
                type="text"
                value={demoBiz}
                onChange={e => setDemoBiz(e.target.value)}
                placeholder="e.g. Verde Eco Landing"
              />
            </div>

            <div className="rf-demo-group">
              <label>How was your experience?</label>
              <div className="rf-demo-stars-select">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    type="button"
                    key={n}
                    className={`rf-star-btn ${demoRating >= n ? 'on' : ''}`}
                    onClick={() => setDemoRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="rf-demo-group">
              <label>Describe your real experience</label>
              <textarea
                rows="2"
                value={demoExp}
                onChange={e => setDemoExp(e.target.value)}
                placeholder="What did you appreciate?"
              />
            </div>

            <div className="rf-demo-row-2">
              <div className="rf-demo-group">
                <label>Staff Member (Optional)</label>
                <input
                  type="text"
                  value={demoStaff}
                  onChange={e => setDemoStaff(e.target.value)}
                  placeholder="e.g. Priya"
                />
              </div>

              <div className="rf-demo-group">
                <label>Language</label>
                <select value={demoLang} onChange={e => setDemoLang(e.target.value)}>
                  <option>English</option>
                  <option>Hindi</option>
                  <option>Hinglish</option>
                  <option>Gujarati</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-dark full rf-btn-generate"
              disabled={demoLoading}
              onClick={handleGenerateDrafts}
            >
              {demoLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Generating 3 AI Drafts...
                </>
              ) : (
                <>
                  ✦ Generate Real-Time Drafts <i className="fa-solid fa-arrow-right"></i>
                </>
              )}
            </button>
            <p className="rf-demo-tiny-hint">
              Drafts are suggestions only. Customers always review, edit and post themselves.
            </p>
          </div>

          {/* Right Drafts Preview */}
          <div className="rf-demo-drafts-side">
            <div className="rf-dds-header">
              <div>
                <span className="rf-dds-badge">3 EDITABLE SUGGESTIONS</span>
                <h4>Ready-to-Post Review Variations</h4>
              </div>
              <span className="rf-dds-live-tag">LIVE PREVIEW</span>
            </div>

            <div className="rf-dds-list">
              {demoDrafts.map((draft, i) => (
                <div className="rf-dds-card" key={i}>
                  <div className="rf-dds-top">
                    <span className="rf-dds-opt">Option {i + 1}</span>
                    <button
                      type="button"
                      className="rf-dds-copy-btn"
                      onClick={() => handleCopy(draft)}
                    >
                      <i className="fa-regular fa-copy"></i> Copy Draft ↗
                    </button>
                  </div>
                  <p>{draft}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 7: PHYSICAL QR STANDEES & TABLE DISPLAYS
          ==================================================================== */}
      <section className="rf-standees-section wrap">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> PHYSICAL &amp; DIGITAL MARKETING KITS
          </div>
          <h2>
            Custom Designer <span className="rf-text-green">QR Standees &amp; Table Displays</span>
          </h2>
          <p>
            Place these beautiful acrylic and flyer displays at billing counters, dining tables, and reception desks to boost review volume by up to 340%.
          </p>
        </div>

        <div className="rf-standees-grid">
          {/* Stand 1 */}
          <div className="rf-stand-card">
            <div className="rf-stand-tag">MOST POPULAR</div>
            <div className="rf-stand-img-box">
              <i className="fa-solid fa-cube" style={{ fontSize: '3.5rem', color: '#16a34a' }}></i>
            </div>
            <h4>Clear Acrylic L-Stand</h4>
            <p>Durable 3mm scratch-resistant acrylic stand with laser-engraved QR code and Google review branding.</p>
            <div className="rf-stand-price">₹ 699 <small>per unit</small></div>
            <button
              type="button"
              className="btn btn-dark full"
              onClick={handleStartFree}
            >
              Order for Your Business ↗
            </button>
          </div>

          {/* Stand 2 */}
          <div className="rf-stand-card">
            <div className="rf-stand-tag" style={{ background: '#eff6ff', color: '#2563eb' }}>TABLE TOP</div>
            <div className="rf-stand-img-box">
              <i className="fa-solid fa-shapes" style={{ fontSize: '3.5rem', color: '#2563eb' }}></i>
            </div>
            <h4>Double-Sided Table Tent</h4>
            <p>Perfect for restaurants, salons, and waiting lounges. Readable from both sides with NFC contactless tap support.</p>
            <div className="rf-stand-price">₹ 899 <small>per unit</small></div>
            <button
              type="button"
              className="btn btn-dark full"
              onClick={handleStartFree}
            >
              Order for Your Business ↗
            </button>
          </div>

          {/* Stand 3 */}
          <div className="rf-stand-card">
            <div className="rf-stand-tag" style={{ background: '#fef3c7', color: '#b45309' }}>PRINT-READY</div>
            <div className="rf-stand-img-box">
              <i className="fa-solid fa-file-pdf" style={{ fontSize: '3.5rem', color: '#d97706' }}></i>
            </div>
            <h4>Print-Ready A6 Flyers</h4>
            <p>Instant high-resolution vector PDF &amp; PNG downloads customized with your logo, colors, and direct review URL.</p>
            <div className="rf-stand-price">Included Free <small>in all plans</small></div>
            <button
              type="button"
              className="btn btn-light full"
              onClick={() => navigate('QR flyer')}
            >
              Customize &amp; Download ↗
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8: EXACT PRICING SECTION (FROM USER SCREENSHOT)
          ==================================================================== */}
      <section className="rf-pricing-section wrap" id="pricing-section">
        {/* Pricing Hero */}
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> SIMPLE &amp; TRANSPARENT PLANS
          </div>
          <h2>
            Turn More Customers Into <span className="rf-text-green">Google Reviews</span>
          </h2>
          <p>
            Start free for 3 days, then select the plan that matches your business growth. Scale easily with automated AI drafts, smart QR standees, and centralized multi-business tools.
          </p>
          <div className="rf-pricing-trust-pills">
            <span><i className="fa-solid fa-check"></i> No credit card for 3-day trial</span>
            <span><i className="fa-solid fa-check"></i> Single &amp; Multi-Business Options</span>
            <span><i className="fa-solid fa-check"></i> Upgrade or chat anytime</span>
          </div>
        </div>

        {/* 3-Day Free Trial Highlight Card */}
        <div className="rf-trial-highlight-box">
          <div className="rf-thb-left">
            <div className="rf-thb-icon">
              <i className="fa-solid fa-gift"></i>
            </div>
            <div>
              <div className="rf-thb-tag">
                <i className="fa-solid fa-check"></i> No Credit Card Required
              </div>
              <h3>3 Days Free Trial — Explore Everything Risk-Free</h3>
              <p>Full access to AI review drafting, QR flyers, and private feedback shielding.</p>
            </div>
          </div>
          <button
            type="button"
            className="rf-btn-green-main"
            onClick={handleStartFree}
          >
            Start 3-Day Free Trial <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>

        {/* Plan Toggle Tab: Without Reply vs With Reply */}
        <div className="rf-pricing-toggle-wrap">
          <div className="rf-pricing-toggle-pill">
            <button
              type="button"
              className={`rf-pt-btn ${pricingToggle === 'without-reply' ? 'active' : ''}`}
              onClick={() => setPricingToggle('without-reply')}
            >
              Starter (Without Review Reply)
            </button>
            <button
              type="button"
              className={`rf-pt-btn ${pricingToggle === 'with-reply' ? 'active pro-tab' : ''}`}
              onClick={() => setPricingToggle('with-reply')}
            >
              <span>⚡</span> Pro (With 24/7 AI Review Reply)
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="rf-pricing-grid">
          {/* Card 1: Monthly */}
          <div className="rf-pricing-card">
            <div className="rf-pc-badge top-green">FLEXIBLE MONTHLY</div>
            <h3>Monthly Plan</h3>
            <p className="rf-pc-sub">Complete review growth suite for single locations.</p>
            <div className="rf-pc-price">
              ₹ {pricingToggle === 'without-reply' ? '99' : '299'} <span>/ month</span>
            </div>

            <div className={`rf-pc-ai-notice ${pricingToggle === 'without-reply' ? 'off' : 'on'}`}>
              <i className={pricingToggle === 'without-reply' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'}></i>
              <span>{pricingToggle === 'without-reply' ? 'AI Auto Review Replies: Not Included' : '24/7 AI Auto Review Replies: Included & Active'}</span>
            </div>

            <ul className="rf-pc-features">
              <li><i className="fa-solid fa-circle-check"></i> 1 Google Business Location</li>
              <li><i className="fa-solid fa-circle-check"></i> Unlimited Smart QR Scans</li>
              <li><i className="fa-solid fa-circle-check"></i> AI Review Generator (24 Languages)</li>
              <li><i className="fa-solid fa-circle-check"></i> Private Feedback Shield (1-3★)</li>
              <li><i className="fa-solid fa-circle-check"></i> Print-Ready A6 QR Flyer Download</li>
              <li><i className="fa-solid fa-circle-check"></i> Standard Analytics &amp; Conversion Funnel</li>
            </ul>

            <button
              type="button"
              className="rf-btn-card-action"
              onClick={() => {
                if (choosePlan) choosePlan(pricingToggle === 'without-reply' ? 'Starter' : 'Pro', 'Monthly');
                else handleStartFree();
              }}
            >
              {pricingToggle === 'without-reply' ? 'Upgrade to Starter (₹99/mo)' : 'Upgrade to Pro (₹299/mo)'}
            </button>
          </div>

          {/* Card 2: Yearly (Featured - Save 16%) */}
          <div className="rf-pricing-card featured">
            <div className="rf-pc-badge top-orange">BEST VALUE - SAVE 16%</div>
            <h3>Annual Membership</h3>
            <p className="rf-pc-sub">Maximum savings for 12 full months of continuous growth.</p>
            <div className="rf-pc-price">
              ₹ {pricingToggle === 'without-reply' ? '999' : '2,999'} <span>/ year</span>
            </div>
            <div className="rf-pc-savings-strip">
              ⚡ Save 16% &bull; {pricingToggle === 'without-reply' ? '₹83/mo · Save ₹189/yr' : '₹250/mo · Save ₹589/yr'}
            </div>

            <div className={`rf-pc-ai-notice ${pricingToggle === 'without-reply' ? 'off' : 'on'}`}>
              <i className={pricingToggle === 'without-reply' ? 'fa-solid fa-circle-xmark' : 'fa-solid fa-circle-check'}></i>
              <span>{pricingToggle === 'without-reply' ? 'AI Auto Review Replies: Not Included' : '24/7 AI Auto Review Replies: Included & Active'}</span>
            </div>

            <ul className="rf-pc-features">
              <li><i className="fa-solid fa-circle-check"></i> Everything in Monthly Plan</li>
              <li><i className="fa-solid fa-circle-check"></i> 1 Full Year Active Service (Save 16%)</li>
              <li><i className="fa-solid fa-circle-check"></i> Priority WhatsApp Support</li>
              <li><i className="fa-solid fa-circle-check"></i> Custom QR Standee Vector Graphics</li>
              <li><i className="fa-solid fa-circle-check"></i> SEO Competitor Health Analyzer</li>
            </ul>

            <button
              type="button"
              className="rf-btn-card-action featured-btn"
              onClick={() => {
                if (choosePlan) choosePlan(pricingToggle === 'without-reply' ? 'Starter' : 'Pro', 'Yearly');
                else handleStartFree();
              }}
            >
              {pricingToggle === 'without-reply' ? 'Upgrade Yearly (₹999/yr)' : 'Upgrade Yearly (₹2,999/yr)'}
            </button>
          </div>

          {/* Card 3: Multi-Business */}
          <div className="rf-pricing-card">
            <div className="rf-pc-badge outline-green">MULTI-BUSINESS - 10 LOCATIONS</div>
            <h3>Multi-Location Agency</h3>
            <p className="rf-pc-sub">Centralized console for managing up to 10 businesses.</p>
            <div className="rf-pc-price">
              ₹ 999 <span>/ month</span>
            </div>

            <ul className="rf-pc-features" style={{ marginTop: '1rem' }}>
              <li><i className="fa-solid fa-circle-check"></i> Up to 10 Business Locations</li>
              <li><i className="fa-solid fa-circle-check"></i> Multi-Location Central Dashboard</li>
              <li><i className="fa-solid fa-circle-check"></i> Individual QR Funnels for Each Branch</li>
              <li><i className="fa-solid fa-circle-check"></i> Full AI Review Generator for All Branches</li>
              <li><i className="fa-solid fa-circle-check"></i> Dedicated Account Manager &amp; WhatsApp</li>
            </ul>

            <button
              type="button"
              className="rf-btn-card-action"
              onClick={() => navigate('Apply for agency')}
            >
              Apply for Multi-Business &amp; Agency ↗
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 9: TESTIMONIALS & REAL BUSINESS RESULTS
          ==================================================================== */}
      <section className="rf-testimonials-section wrap">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> VERIFIED REPUTATION RESULTS
          </div>
          <h2>
            Trusted by Hundreds of <span className="rf-text-green">Local Businesses</span>
          </h2>
          <p>
            Real results from retail shops, clinics, restaurants, and salons using StarReview AI.
          </p>
        </div>

        <div className="rf-testimonials-grid">
          {/* Testimonial 1 */}
          <div className="rf-test-card">
            <div className="rf-test-stars">★★★★★</div>
            <p className="rf-test-quote">
              "We went from 38 reviews to over 240 in less than 3 months! Customers love that they don't have to think about what to write — the AI suggestions match our restaurant service perfectly."
            </p>
            <div className="rf-test-author">
              <div className="rf-author-avatar" style={{ background: '#2563eb' }}>RM</div>
              <div>
                <strong>Rajesh Malhotra</strong>
                <small>Owner, Spice Haven Bistro</small>
              </div>
              <span className="rf-verified-badge">✓ Verified Business</span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="rf-test-card">
            <div className="rf-test-stars">★★★★★</div>
            <p className="rf-test-quote">
              "The private feedback shield saved our clinic rating twice already! Instead of angry 1-star reviews on Google, we resolved patient issues directly within an hour. Essential tool."
            </p>
            <div className="rf-test-author">
              <div className="rf-author-avatar" style={{ background: '#16a34a' }}>AS</div>
              <div>
                <strong>Dr. Ananya Sen</strong>
                <small>Founder, Sen Dental Care</small>
              </div>
              <span className="rf-verified-badge">✓ Verified Clinic</span>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="rf-test-card">
            <div className="rf-test-stars">★★★★★</div>
            <p className="rf-test-quote">
              "The A6 table standee flyers look extremely premium. Customers simply scan their camera, pick their language, and post in under 10 seconds. Best ROI this year."
            </p>
            <div className="rf-test-author">
              <div className="rf-author-avatar" style={{ background: '#9333ea' }}>VM</div>
              <div>
                <strong>Vikram Mehta</strong>
                <small>Director, Luxe Wellness Spa</small>
              </div>
              <span className="rf-verified-badge">✓ Verified Salon</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 10: FAQ ACCORDION
          ==================================================================== */}
      <section className="rf-faq-section wrap">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> FREQUENTLY ASKED QUESTIONS
          </div>
          <h2>
            Got Questions? <span className="rf-text-green">We Have Answers</span>
          </h2>
        </div>

        <div className="rf-faq-accordion">
          {[
            ['How does the 3-day free trial work?', 'You get 100% full access to StarReview AI for 3 full days. You can connect your Google Places listing, test AI review drafting, download your print-ready QR flyer, and test review funnels. No credit card is required.'],
            ['Does StarReview AI post reviews automatically?', 'No. In full compliance with Google Review Guidelines, customers remain in total control. They select a draft or edit it, and tap once to paste it into the official Google Maps review composer.'],
            ['Which languages are supported?', 'Over 24 languages are supported, including English, Hindi, Gujarati, Hinglish, Marathi, Bengali, Tamil, Telugu, and more.'],
            ['How does the Private Negative Review Shield protect my rating?', 'Customers who tap 1, 2, or 3 stars are smoothly directed to a private resolution inbox instead of the public Google review composer. You receive instant notifications to solve their concern privately before public damage occurs.'],
            ['How do I connect my Google Business Profile Place ID?', 'You can search your business listing via our official Google Places API integration right after sign up, or configure it manually at any time from your Business Console.'],
            ['Can I manage multiple locations or client accounts?', 'Yes. Our Multi-Business and Agency packages allow managing up to 10 or more business locations with a single centralized dashboard.']
          ].map(([q, a], idx) => (
            <details className="rf-faq-item" key={idx}>
              <summary className="rf-faq-summary">
                <span>{q}</span>
                <i className="fa-solid fa-chevron-down"></i>
              </summary>
              <p className="rf-faq-answer">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ====================================================================
          SECTION 11: FINAL CALL TO ACTION BANNER
          ==================================================================== */}
      <section className="rf-final-cta-section wrap">
        <div className="rf-final-cta-box">
          <h2>Ready to Skyrocket Your Google Reviews?</h2>
          <p>
            Join hundreds of local businesses capturing authentic 5-star reviews effortlessly with StarReview AI.
          </p>
          <div className="rf-final-cta-actions">
            <button
              type="button"
              className="rf-btn-green-main"
              onClick={handleStartFree}
            >
              <i className="fa-solid fa-rocket"></i> Start Free 3-Day Trial
            </button>
            <button
              type="button"
              className="rf-btn-outline-main"
              onClick={handleSignIn}
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Dashboard
            </button>
            <button
              type="button"
              className="rf-btn-outline-main"
              onClick={() => navigate('Business onboarding')}
            >
              <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i> Onboard with Google Places
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          FLOATING WHATSAPP BUTTON (SCREENSHOTS 1, 2, 3, 4, 5)
          ==================================================================== */}
      <a
        href="https://wa.me/919707842047?text=Hello%20StarReview%20AI%20Team!%20I%20want%20to%20learn%20more%20about%20the%20Google%20Magic%20Review%20QR."
        target="_blank"
        rel="noreferrer"
        className="rf-floating-whatsapp-btn"
        title="Chat on WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>
    </div>
  );
}
