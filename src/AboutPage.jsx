import React from 'react';

export default function AboutPage({ navigate }) {
  return (
    <div className="rf-about-page wrap">
      {/* 1. HERO SECTION */}
      <section className="rf-about-hero">
        <div className="rf-about-pill">
          <i className="fa-solid fa-sparkles" style={{ color: '#16a34a' }}></i>
          <span>REPUTATION INTELLIGENCE PLATFORM</span>
        </div>
        <h1 className="rf-about-title">
          Empowering Local Businesses with <span>AI-Powered 5-Star Reviews</span>
        </h1>
        <p className="rf-about-lead">
          StarReview AI bridges the gap between satisfied customers and explosive Google Business Profile growth using official Google Places API, native multilingual AI drafts, and smart sentiment shielding.
        </p>

        <div className="rf-about-cta-row">
          <button
            type="button"
            className="btn btn-dark rf-about-hero-btn"
            onClick={() => navigate('Business onboarding')}
          >
            <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i>
            Onboard Business with Google Places
          </button>

          <button
            type="button"
            className="btn btn-light rf-about-hero-btn-outline"
            onClick={() => {
              if (window.history.pushState) {
                window.history.pushState({}, '', '/dashboard?tab=billing');
              }
              navigate('Dashboard');
            }}
          >
            <i className="fa-regular fa-credit-card"></i>
            Explore Billing &amp; Plans
          </button>
        </div>

        <div className="rf-about-stats-grid">
          <div className="rf-stat-card">
            <div className="rf-stat-number">12,400+</div>
            <div className="rf-stat-label">Google Reviews Generated</div>
            <p className="rf-stat-desc">Authentic customer reviews posted across retail, dining, salons &amp; clinics.</p>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-number">94.2%</div>
            <div className="rf-stat-label">QR Funnel Conversion</div>
            <p className="rf-stat-desc">Customers who scan complete and submit their review in under 30 seconds.</p>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-number">&lt; 15 sec</div>
            <div className="rf-stat-label">Average Review Time</div>
            <p className="rf-stat-desc">Zero writer's block. AI drafts eliminate hesitation instantly.</p>
          </div>
          <div className="rf-stat-card">
            <div className="rf-stat-number">100%</div>
            <div className="rf-stat-label">Google Policy Compliant</div>
            <p className="rf-stat-desc">Customer-controlled submissions adhering to Google Maps Platform terms.</p>
          </div>
        </div>
      </section>

      {/* 2. THE PROBLEM & INNOVATION */}
      <section className="rf-about-section">
        <div className="rf-section-header-center">
          <span className="rf-section-eyebrow">THE REPUTATION GAP</span>
          <h2>Why Normal QR Codes Fail &amp; How AI Changes Everything</h2>
          <p>Over 72% of happy in-store customers say they intend to leave a review, yet less than 4% ever do. Here is why traditional methods struggle:</p>
        </div>

        <div className="rf-problem-solution-grid">
          <div className="rf-ps-card rf-ps-problem">
            <div className="rf-ps-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3>Traditional QR Codes (Friction-Heavy)</h3>
            <ul className="rf-ps-list">
              <li>
                <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
                <div><strong>Customer Writer's Block:</strong> Staring at a blank review box on a small phone keyboard leads to drop-offs.</div>
              </li>
              <li>
                <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
                <div><strong>No Sentiment Filter:</strong> Disgruntled customers post directly to Google Maps, damaging your public rating permanently.</div>
              </li>
              <li>
                <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
                <div><strong>Zero SEO Optimization:</strong> Reviews lack key search terms like "fast service", "hair spa", or staff names.</div>
              </li>
              <li>
                <i className="fa-solid fa-xmark" style={{ color: '#ef4444' }}></i>
                <div><strong>No Analytics:</strong> Business owners have zero visibility into daily scan counts, drop-offs, or conversion rates.</div>
              </li>
            </ul>
          </div>

          <div className="rf-ps-card rf-ps-solution">
            <div className="rf-ps-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <h3>StarReview AI (Seamless Flow)</h3>
            <ul className="rf-ps-list">
              <li>
                <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                <div><strong>3 Instant Multilingual Drafts:</strong> AI creates natural, authentic reviews in English, Hindi, Gujarati, or Hinglish in 1 tap.</div>
              </li>
              <li>
                <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                <div><strong>Private Feedback Shield:</strong> 1–3 star ratings are automatically routed to a private resolution inbox so you can fix issues first.</div>
              </li>
              <li>
                <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                <div><strong>Keyword &amp; Staff Injection:</strong> Automatically weaves target SEO keywords and team member names into drafts.</div>
              </li>
              <li>
                <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i>
                <div><strong>Full Analytics Console:</strong> Real-time conversion funnel tracking scans, draft generations, copies, and Google redirects.</div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE ARCHITECTURAL PILLARS */}
      <section className="rf-about-section">
        <div className="rf-section-header-center">
          <span className="rf-section-eyebrow">CORE TECHNOLOGY</span>
          <h2>Four Pillars of the StarReview AI Ecosystem</h2>
          <p>Engineered for high performance, maximum compliance, and effortless day-to-day operation for retail &amp; service businesses.</p>
        </div>

        <div className="rf-pillars-grid">
          <div className="rf-pillar-card">
            <div className="rf-pillar-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <i className="fa-brands fa-google"></i>
            </div>
            <h4>1. Official Google Places API</h4>
            <p>
              Direct server-side integration with the official Google Maps Platform. Automatically resolves Place IDs, address verification, live review counts, and deep-links straight into the native Google review composer.
            </p>
            <div className="rf-pillar-badge">Official Places Proxy</div>
          </div>

          <div className="rf-pillar-card">
            <div className="rf-pillar-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
              <i className="fa-solid fa-brain"></i>
            </div>
            <h4>2. Context-Aware AI Generator</h4>
            <p>
              Trained on tens of thousands of natural consumer reviews. Never sounds robotic or generic. Adapts instantly to industry niches from dental clinics to fine dining and specialty retail stores.
            </p>
            <div className="rf-pillar-badge">24+ Languages Supported</div>
          </div>

          <div className="rf-pillar-card">
            <div className="rf-pillar-icon" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h4>3. Sentiment Protection Shield</h4>
            <p>
              Smart dual-path routing ensures glowing 5-star experiences reach Google Maps while dissatisfied feedback is intercepted into an owner-only private ticket for prompt customer recovery.
            </p>
            <div className="rf-pillar-badge">Protects 4.8+ Rating</div>
          </div>

          <div className="rf-pillar-card">
            <div className="rf-pillar-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <i className="fa-solid fa-qrcode"></i>
            </div>
            <h4>4. Physical &amp; Digital Marketing Kit</h4>
            <p>
              Premium laser-engraved acrylic stands, NFC contactless tap stands, counter flyers, and receipt cards designed to catch customer attention right at checkout when happiness is highest.
            </p>
            <div className="rf-pillar-badge">Print-Ready Vector Files</div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT TEAM MARUTI INFOSOFT */}
      <section className="rf-about-company-box">
        <div className="rf-company-inner">
          <div className="rf-company-content">
            <div className="rf-company-eyebrow">ENGINEERING &amp; TRUST</div>
            <h2>Built by Team Maruti InfoSoft</h2>
            <p>
              StarReview AI was built from the ground up by <strong>Team Maruti InfoSoft</strong> in Surat, Gujarat. We observed local business owners losing tens of thousands in revenue every month simply because they didn't have an automated system to capture the goodwill of their regular customers.
            </p>
            <p>
              Our philosophy is simple: <em>Reputation should be frictionless.</em> We build robust, privacy-first software backed by 24/7 human support, transparent pricing, and zero long-term lock-in contracts.
            </p>

            <div className="rf-company-badges">
              <span className="rf-cbadge">
                <i className="fa-solid fa-location-dot" style={{ color: '#2563eb' }}></i> Surat, Gujarat, India
              </span>
              <span className="rf-cbadge">
                <i className="fa-brands fa-whatsapp" style={{ color: '#16a34a' }}></i> Dedicated WhatsApp Concierge
              </span>
              <span className="rf-cbadge">
                <i className="fa-solid fa-shield-check" style={{ color: '#7c3aed' }}></i> 256-Bit SSL Encryption
              </span>
            </div>
          </div>

          <div className="rf-company-card-side">
            <div className="rf-company-card">
              <div className="rf-company-avatar">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <h4>Team Maruti InfoSoft</h4>
              <p className="rf-cc-sub">Software Development &amp; Reputation Engineering</p>
              <div className="rf-cc-divider"></div>
              <div className="rf-cc-detail">
                <span>Location:</span>
                <strong>Royal Arcade, Sarthana Jakat Naka, Surat 395006</strong>
              </div>
              <div className="rf-cc-detail">
                <span>Support Email:</span>
                <strong>team@maruti.com</strong>
              </div>
              <div className="rf-cc-detail">
                <span>Direct WhatsApp:</span>
                <strong>+91 97078 42047</strong>
              </div>
              <button
                type="button"
                className="btn btn-dark full"
                style={{ marginTop: '1rem' }}
                onClick={() => window.open('https://wa.me/919707842047?text=Hello%20Team%20Maruti!%20I%20have%20a%20question%20about%20StarReview%20AI.', '_blank')}
              >
                <i className="fa-brands fa-whatsapp" style={{ marginRight: 6 }}></i> Contact Support on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. READY TO ACCELERATE CTA BANNER */}
      <section className="rf-about-cta-banner">
        <h2>Ready to Skyrocket Your Google Reviews?</h2>
        <p>Join hundreds of local businesses capturing 5-star reviews effortlessly with StarReview AI.</p>
        <div className="rf-about-cta-actions">
          <button
            type="button"
            className="btn btn-dark"
            onClick={() => navigate('Business onboarding')}
          >
            Start Free 3-Day Trial <i className="fa-solid fa-arrow-right"></i>
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => navigate('Try the demo')}
          >
            Try Interactive Review Generator ✦
          </button>
          <button
            type="button"
            className="btn btn-light"
            onClick={() => {
              if (window.history.pushState) {
                window.history.pushState({}, '', '/dashboard?tab=billing');
              }
              navigate('Dashboard');
            }}
          >
            View Billing &amp; Pricing Plans ↗
          </button>
        </div>
      </section>
    </div>
  );
}
