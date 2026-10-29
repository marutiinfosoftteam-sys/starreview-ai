import React, { useState } from 'react';

export default function AboutPage({ user, navigate, setRegMode, notify, logout }) {
  const [activeReplyTab, setActiveReplyTab] = useState('demo');

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
              onClick={() => navigate('How it works')}
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
                    <span className="star-icon">★</span> ReviewFlow <b>AI</b>
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
                        <strong>WebPress Hub</strong>
                        <div style={{ color: '#eab308', fontSize: '0.7rem' }}>★★★★★</div>
                      </div>
                    </div>
                    <div className="rf-msp-title">Review Us on Google</div>
                    <div className="rf-msp-qr-box">
                      <div className="rf-msp-qr-center">
                        <i className="fa-solid fa-qrcode" style={{ fontSize: '4.5rem', color: '#0f172a' }}></i>
                      </div>
                    </div>
                    <div className="rf-msp-footer">Takes less than <b>30 seconds</b></div>
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
            Why Businesses Choose <span className="rf-text-green">Review Flow AI</span>
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
      <section className="rf-funnel-section wrap">
        <div className="rf-section-center-head">
          <div className="rf-badge-sub">
            <span>&bull;</span> THE 4-STEP REVIEW FUNNEL
          </div>
          <h2>
            How Review Flow AI <span className="rf-text-green">Generates 5-Star Reviews</span>
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
            See why traditional static QR stickers fail while Review Flow AI converts up to 84% of customer scans.
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
              <i className="fa-solid fa-wand-magic-sparkles"></i> REVIEW FLOW AI MAGIC QR
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
          FLOATING WHATSAPP BUTTON (SCREENSHOTS 1, 2, 3, 4, 5)
          ==================================================================== */}
      <a
        href="https://wa.me/919707842047?text=Hello%20ReviewFlow%20AI%20Team!%20I%20want%20to%20learn%20more%20about%20the%20Google%20Magic%20Review%20QR."
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
