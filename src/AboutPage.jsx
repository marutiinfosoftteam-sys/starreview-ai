import React from 'react';

export default function AboutPage({ user, navigate, setRegMode, notify }) {
  const handleGetStarted = () => {
    if (user) {
      navigate('Dashboard');
    } else {
      if (setRegMode) setRegMode(true);
      navigate('Account', true);
    }
  };

  const handleHowItWorks = () => {
    navigate('Home');
    setTimeout(() => {
      const el = document.getElementById('how-it-works') || document.querySelector('.rf-how-it-works-sec') || document.querySelector('.features');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  return (
    <div className="rf-about-page-wrap">
      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 2: HEADER & SUBTITLE
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-about-hero">
        <div className="wrap">
          <div className="rf-about-badge">
            <span className="rf-about-badge-star">☆</span>
            <span>About Review Flow AI</span>
          </div>

          <h1 className="rf-about-main-title">
            Empowering Businesses with<br />
            <span className="rf-about-green-text">Google Magic Review QR</span><br />
            Technology
          </h1>

          <p className="rf-about-main-sub">
            Review Flow AI was founded to solve a massive challenge faced by local storefronts, restaurants, clinics, and service providers: turning everyday happy visitors into published 5-star Google reviews consistently.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 2 & 3: TWO-COLUMN STORY & MISSION SECTION
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-about-story-sec">
        <div className="wrap rf-about-story-grid">
          {/* Left Column: Story & Velocity Stats */}
          <div className="rf-about-story-left">
            <h2 className="rf-about-sec-heading">
              The Story Behind Our <span className="rf-about-green-text">AI-Powered Review QR</span>
            </h2>

            <p className="rf-about-text">
              Every business owner knows that 95% of satisfied customers walk out without reviewing. It isn't because they were unhappy—it's because typing a paragraph on a tiny phone screen creates immediate writer's block.
            </p>

            <p className="rf-about-text">
              Meanwhile, normal static QR codes simply redirect customers to an empty text box. That's why we created <strong>Review Flow AI</strong> and the <strong>Google Magic Review QR</strong>: a smart, interactive review funnel that crafts authentic, human-like drafts in 24+ languages, weaves in high-ranking SEO keywords, and guides customers to post in <strong>just 10 seconds</strong>.
            </p>

            <p className="rf-about-text">
              We also built an intelligent negative sentiment filter that routes 1–3 star ratings privately to management—protecting your Google Maps ranking while delivering real actionable insights.
            </p>

            {/* Two Stat Boxes (Screenshot 3) */}
            <div className="rf-about-stats-grid">
              <div className="rf-about-stat-card">
                <div className="rf-about-stat-val">300%+</div>
                <div className="rf-about-stat-lbl">HIGHER REVIEW VELOCITY</div>
              </div>
              <div className="rf-about-stat-card">
                <div className="rf-about-stat-val">10 Sec</div>
                <div className="rf-about-stat-lbl">AVERAGE REVIEW TIME</div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission & Ethics Card (Screenshot 2) */}
          <div className="rf-about-story-right">
            <div className="rf-about-ethics-card">
              <h3 className="rf-about-ethics-title">Our Mission &amp; Ethics</h3>

              <p className="rf-about-ethics-p">
                At <strong>Review Flow AI</strong>, we believe genuine customer reviews should be earned effortlessly through exceptional real-world customer service. We never generate fake reviews or automated bots.
              </p>

              <p className="rf-about-ethics-p">
                Our <strong>Google Business Review QR</strong> technology empowers your real in-store patrons to express their positive experiences clearly and authentically on your verified Google My Business profile.
              </p>

              <div className="rf-about-compliance-badge">
                <i className="fa-solid fa-check"></i>
                <span>100% compliant with Google Business review guidelines.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 3 & 4: WHY BUSINESSES TRUST REVIEW FLOW AI (3 CARDS)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-about-trust-sec">
        <div className="wrap">
          <div className="rf-about-center-header">
            <h2 className="rf-about-sec-heading-centered">Why Businesses Trust Review Flow AI</h2>
            <p className="rf-about-sec-sub-centered">
              Designed from the ground up to give local brands the unfair local SEO advantage on Google Maps.
            </p>
          </div>

          <div className="rf-about-features-grid">
            {/* Card 1 */}
            <div className="rf-about-feat-card">
              <div className="rf-about-feat-icon">
                <i className="fa-solid fa-qrcode"></i>
              </div>
              <h3 className="rf-about-feat-title">Google Magic Review QR</h3>
              <p className="rf-about-feat-desc">
                Dynamic QR standees with integrated brand styling, customized flyers (A6, tent cards), and direct frictionless mobile routing.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rf-about-feat-card">
              <div className="rf-about-feat-icon">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <h3 className="rf-about-feat-title">AI-Powered Review Generation</h3>
              <p className="rf-about-feat-desc">
                Natural, authentic drafting in 24+ languages that automatically weaves in your priority services, products, and staff names.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rf-about-feat-card">
              <div className="rf-about-feat-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h3 className="rf-about-feat-title">Reputation Shield &amp; Analytics</h3>
              <p className="rf-about-feat-desc">
                Internal routing for critical 1–3 star ratings, full scan tracking, draft copy metrics, and real-time conversion insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 4: BOTTOM CTA BANNER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-about-cta-sec">
        <div className="wrap">
          <div className="rf-about-cta-banner">
            <h2 className="rf-about-cta-title">Ready to Scale Your Google Business Reviews?</h2>
            <p className="rf-about-cta-sub">
              Deploy your personalized Google Magic Review QR standees and start turning daily visitors into glowing 5-star Google reviews.
            </p>
            <div className="rf-about-cta-btns">
              <button
                type="button"
                className="rf-about-btn-primary"
                onClick={handleGetStarted}
              >
                Get Started Now →
              </button>
              <button
                type="button"
                className="rf-about-btn-secondary"
                onClick={handleHowItWorks}
              >
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
