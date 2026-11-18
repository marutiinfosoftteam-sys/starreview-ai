// StarReview AI — Official Platform Features Page
// Comprehensive, visually rich showcase of all StarReview AI capabilities

import React from 'react';

export default function PlatformFeaturesPage({ navigate, user }) {
  const coreFeatures = [
    {
      id: 'qr-funnel',
      icon: 'fa-solid fa-wand-magic-sparkles',
      tag: '10-SECOND CONVERSION',
      title: 'Google Magic Review QR Funnel',
      subtitle: 'Eliminate friction and turn everyday happy customers into published Google reviews on the spot.',
      desc: 'Traditional static QR codes dump customers onto an empty Google review text box where 95% leave due to writer’s block. Our Magic Review QR opens a fast, branded mobile page where customers tap a star rating, select from 3 tailored AI drafts, and 1-tap copy and publish on Google in just 10 seconds.',
      bullets: [
        'Works with standard phone cameras — zero app download required',
        'Auto-redirects to official Google Maps review dialogue with stars selected',
        '3.4x higher review conversion than traditional static QR codes',
        'Instant loading on 4G/5G mobile connections'
      ],
      actionLabel: 'Try Live Funnel Demo →',
      actionTarget: 'Try the demo'
    },
    {
      id: 'ai-engine',
      icon: 'fa-solid fa-brain',
      tag: 'AI-POWERED DRAFTS',
      title: 'AI Review Drafting Engine',
      subtitle: 'Personalized, natural, and keyword-rich reviews crafted in real-time.',
      desc: 'Customers frequently struggle to find the right words. Our AI analyzes your business category, custom service keywords, and mentioned staff members to instantly generate 3 unique, authentic review variations tailored to the customer’s positive experience.',
      bullets: [
        'Supports 24+ languages including English, Hindi, Gujarati, Spanish & more',
        'Weaves in high-ranking local SEO keywords naturally',
        'Highlight specific staff members, dishes, services, or ambience',
        'Customer maintains 100% control to edit, modify, or rewrite before posting'
      ],
      actionLabel: 'Explore Review Assistant →',
      actionTarget: 'Try the demo'
    },
    {
      id: 'private-shield',
      icon: 'fa-solid fa-shield-heart',
      tag: 'REPUTATION FIREWALL',
      title: 'Private Negative Feedback Shield',
      subtitle: 'Catch unhappy customer feedback privately before it damages your public Google Maps rating.',
      desc: 'Not every experience is perfect. When a customer indicates a 1, 2, or 3-star rating, our intelligent funnel offers them a private direct-to-owner resolution form. Instead of venting publicly on Google, complaints land directly in your private dashboard and WhatsApp inbox so you can fix the issue immediately.',
      bullets: [
        'Filters 1, 2, and 3-star complaints to a confidential private inbox',
        'Instant WhatsApp and email notifications for urgent customer issues',
        'Gives management the opportunity to issue apologies or refunds before public escalations',
        '100% compliant with consumer review protection regulations'
      ],
      actionLabel: 'See How Shield Works →',
      actionTarget: 'How it works'
    },
    {
      id: 'reply-assistant',
      icon: 'fa-solid fa-reply-all',
      tag: '24/7 ENGAGEMENT',
      title: 'Autopilot Review Reply Assistant',
      subtitle: 'Draft sentiment-aware, professional responses to all incoming Google reviews in seconds.',
      desc: 'Google ranks businesses higher when owners reply to 90%+ of their customer reviews. Our Reply Assistant analyzes incoming reviews and generates thoughtful, grateful, and professional replies tailored to positive, neutral, or critical feedback.',
      bullets: [
        'Sentiment-aware response tone (Grateful, Professional, Warm, or Apologetic)',
        'Includes your business name and service keywords naturally',
        '1-click copy to paste directly into your Google Business Profile manager',
        'Saves hours of repetitive typing every week'
      ],
      actionLabel: 'Open Reply Assistant →',
      actionTarget: 'Reply assistant'
    },
    {
      id: 'print-standees',
      icon: 'fa-solid fa-print',
      tag: 'PRINT-READY MERCHANDISE',
      title: 'Custom Standees & Physical QR Collateral',
      subtitle: 'High-resolution counter standees, table tents, and billing receipt inserts.',
      desc: 'Bring your review funnel into the physical world. Generate print-ready vector graphics and high-resolution PNGs customized with your business logo, brand color, and direct review URL in seconds.',
      bullets: [
        'A6 counter standee, acrylic table tent, and counter sticker formats',
        'Choose from Classic, Minimalist, Vibrant, or Plain QR palettes',
        'Built-in Google review stars and official Google branding badges',
        'Download instant print-ready PNG files for your local printer'
      ],
      actionLabel: 'Generate QR Standee →',
      actionTarget: 'QR flyer'
    },
    {
      id: 'analytics',
      icon: 'fa-solid fa-chart-line',
      tag: 'GROWTH METRICS',
      title: 'Real-Time Reputation & Scan Analytics',
      subtitle: 'Track total scans, review completions, and conversion velocities in one unified console.',
      desc: 'Know exactly how your review funnels are performing. Monitor scan volume day-by-day, track draft copy events, count Google redirects, and analyze overall customer sentiment from a single dashboard.',
      bullets: [
        'Daily and monthly scan trend graphs',
        'Funnel conversion rate: Scans &rarr; Drafts &rarr; Google Redirects',
        'Private customer feedback log with customer contact details',
        'Exportable growth data for weekly staff reviews'
      ],
      actionLabel: user ? 'View Your Dashboard →' : 'Sign In to View Demo →',
      actionTarget: user ? 'Dashboard' : 'Account'
    },
    {
      id: 'agency-console',
      icon: 'fa-solid fa-building',
      tag: 'SCALE & MULTI-LOCATION',
      title: 'Multi-Business & Agency Central Console',
      subtitle: 'Centralized multi-location management for franchises, dental chains, and marketing agencies.',
      desc: 'Manage 5 to 500+ client locations under a single master login. Assign custom review keywords, configure distinct brand standees for each store, and connect your own AI API keys (Gemini, OpenAI, Claude) for unlimited review generation.',
      bullets: [
        'Centralized dashboard switching across all business branches',
        'Independent QR funnels and unique Google Place IDs per location',
        'Bring-Your-Own-API Key (BYO-AI) support for enterprise agencies',
        'Dedicated account management and wholesale volume discounts'
      ],
      actionLabel: 'Apply for Agency Plan →',
      actionTarget: 'Apply for agency'
    }
  ];

  return (
    <div className="rf-privacy-page-shell" style={{ background: '#f8fafc' }}>
      <div className="wrap" style={{ maxWidth: 1160, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Top Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <button
            type="button"
            className="rf-privacy-back-btn"
            onClick={() => navigate('Home')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Homepage
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            <i className="fa-solid fa-wand-magic-sparkles"></i> STARREVIEW AI PLATFORM FEATURES
          </span>
        </div>

        {/* Hero Banner */}
        <header style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 50px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
            The Complete <span style={{ color: '#16a34a' }}>Google Review</span> Growth Platform
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
            Turn everyday walk-in and online customers into glowing 5-star Google reviews in 10 seconds. Explore our integrated suite of AI writing assistance, smart QR standees, private reputation protection, and profile analytics.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-dark"
              onClick={() => navigate('Try the demo')}
              style={{ background: '#16a34a', border: 'none', padding: '12px 24px', fontWeight: 700, borderRadius: 10, fontSize: '0.95rem' }}
            >
              <i className="fa-solid fa-play" style={{ marginRight: 6 }}></i> Try Interactive Demo
            </button>
            <button
              className="btn btn-light"
              onClick={() => navigate('Pricing')}
              style={{ border: '1.5px solid #cbd5e1', padding: '12px 24px', fontWeight: 700, borderRadius: 10, fontSize: '0.95rem', background: '#fff', color: '#0f172a' }}
            >
              View Pricing Plans
            </button>
          </div>
        </header>

        {/* Metrics Highlights Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 60 }}>
          {[
            { val: '10 Sec', lbl: 'Average Scan-to-Review Time', icon: 'fa-solid fa-bolt' },
            { val: '3.4x', lbl: 'Higher Conversion vs Plain QR', icon: 'fa-solid fa-arrow-trend-up' },
            { val: '24+', lbl: 'AI Draft Languages Supported', icon: 'fa-solid fa-language' },
            { val: '100%', lbl: 'Google Review Policy Compliant', icon: 'fa-solid fa-shield-check' }
          ].map((m, idx) => (
            <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
              <i className={m.icon} style={{ color: '#16a34a', fontSize: '1.4rem', marginBottom: 8, display: 'inline-block' }}></i>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{m.val}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: 4 }}>{m.lbl}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 60 }}>
          {coreFeatures.map((feat) => (
            <div
              key={feat.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 6px 18px rgba(15, 23, 42, 0.04)',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center', fontSize: '1.25rem' }}>
                  <i className={feat.icon}></i>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em', color: '#16a34a', background: '#f0fdf4', padding: '4px 10px', borderRadius: 20 }}>
                  {feat.tag}
                </span>
              </div>

              <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                {feat.title}
              </h2>

              <p style={{ fontSize: '0.86rem', color: '#047857', fontWeight: 600, margin: '0 0 12px' }}>
                {feat.subtitle}
              </p>

              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 18px', flexGrow: 1 }}>
                {feat.desc}
              </p>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, marginBottom: 18 }}>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
                  {feat.bullets.map((b, bIdx) => (
                    <li key={bIdx} style={{ marginBottom: 4 }}>{b}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => navigate(feat.actionTarget)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 10,
                  padding: '10px 16px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'background 0.2s'
                }}
              >
                {feat.actionLabel}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', borderRadius: 20, padding: '44px 32px', textAlign: 'center', color: '#fff', boxShadow: '0 16px 36px rgba(20, 83, 45, 0.2)' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 14 }}>
            Ready to 10x Your Google Reviews on Autopilot?
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Join hundreds of salons, restaurants, healthcare clinics, and retail stores collecting glowing 5-star Google reviews with StarReview AI.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => navigate('Account', true)}
              style={{ background: '#fff', color: '#166534', border: 'none', padding: '14px 28px', fontWeight: 800, borderRadius: 10, fontSize: '0.95rem' }}
            >
              Start 3-Day Free Trial →
            </button>
            <a
              href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20want%20to%20learn%20more%20about%20your%20review%20platform."
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '14px 28px', fontWeight: 800, borderRadius: 10, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.1rem' }}></i> WhatsApp Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
