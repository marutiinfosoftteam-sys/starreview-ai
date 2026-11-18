// StarReview AI — Official Growing Businesses Page
// Dedicated industry growth playbooks, review velocity stages, and ROI insights

import React, { useState } from 'react';

export default function GrowingBusinessesPage({ navigate }) {
  const [activeTab, setActiveTab] = useState('restaurants');

  const industryPlaybooks = {
    restaurants: {
      title: 'Restaurants, Cafes & Bakeries',
      icon: 'fa-solid fa-utensils',
      subtitle: 'Turn table turns into 5-star Google Maps recognition and pack your weekend seatings.',
      challenge: 'Diners enjoy their meal, pay the bill, and leave. 95% never write a review unless prompted on the spot.',
      solution: 'Place our high-res acrylic QR table tents on every table and a billing receipt insert with every check. Customers scan while waiting for the bill, tap 5 stars, select an AI draft highlighting your signature dishes and service, and post in 10 seconds.',
      results: [
        '+280% increase in weekly Google review volume',
        'Specific mentions of signature dishes boost local Google food searches',
        'Private negative filter catches cold-food complaints before public escalations'
      ],
      qrPlacement: 'Table tents, checkout billing folders, takeout bag stickers',
      sampleReview: '“Outstanding dinner at Spice Haven! The paneer tikka and garlic naan were fresh and delicious. Staff was attentive and welcoming. Will definitely be back!”'
    },
    salons: {
      title: 'Salons, Spas & Wellness',
      icon: 'fa-solid fa-scissors',
      subtitle: 'Attract high-ticket styling and skincare clients by highlighting specific stylists and therapies.',
      challenge: 'Clients love their new look but forget to review once they step out into their busy day.',
      solution: 'Place sleek branded mirror stickers at each styling station and counter standees at the billing desk. Encourage customers to tap the stylist’s name so the AI weaves personalized praise into the review draft.',
      results: [
        'Top styling staff receive direct public recognition',
        'Climb to #1 ranking for "hair salon near me" and "luxury spa in Surat"',
        'New clients book high-margin treatments with complete confidence'
      ],
      qrPlacement: 'Styling station mirrors, reception checkout standee, appointment reminder cards',
      sampleReview: '“Had an amazing haircut and facial with Priya at Glow Studio. Super professional, clean ambience, and great attention to detail. Highly recommend to everyone!”'
    },
    clinics: {
      title: 'Clinics, Dental & Healthcare',
      icon: 'fa-solid fa-stethoscope',
      subtitle: 'Build patient trust with compassionate, authentic feedback while filtering anxious complaints privately.',
      challenge: 'Prospective patients are anxious and read 10+ reviews before choosing a healthcare provider.',
      solution: 'Place a professional reception standee at the discharge desk. Patients leave compassionate, reassuring feedback in 10 seconds, helping nervous patients feel safe choosing your practice.',
      results: [
        'Overcome patient skepticism with verified 5-star reviews',
        'Private firewall catches billing or wait-time concerns before Google escalations',
        '100% compliant with medical advertising and patient privacy standards'
      ],
      qrPlacement: 'Discharge reception desk, consultation waiting lounge, prescription card QR',
      sampleReview: '“Dr. Ananya and the team at CarePoint Clinic were so gentle and reassuring. Clean clinic, minimal wait time, and excellent dental care. Thank you!”'
    },
    retail: {
      title: 'Retail Stores & Boutiques',
      icon: 'fa-solid fa-bag-shopping',
      subtitle: 'Convert everyday shoppers into loyal brand advocates right at the cash register.',
      challenge: 'Walk-in retail shoppers are in a hurry and rarely think to review a physical storefront.',
      solution: 'Display a vibrant A6 standee right next to the payment terminal (UPI / Card machine). While the receipt is printing, customers scan and post their 5-star experience.',
      results: [
        'High scan-to-review conversion during checkout wait time',
        'Showcase store collection variety, cleanliness, and friendly staff',
        'Beat nearby competing retail outlets on Google Maps 3-Pack'
      ],
      qrPlacement: 'Next to billing terminal, packaging bag inserts, storefront exit door',
      sampleReview: '“Fantastic collection and very helpful staff! Found exactly what I was looking for at a great price. A must-visit store in the area!”'
    },
    auto: {
      title: 'Auto Garages & Car Care',
      icon: 'fa-solid fa-car-side',
      subtitle: 'Eliminate customer repair skepticism with transparent, verified 5-star mechanic ratings.',
      challenge: 'Car owners fear being overcharged and search intensely for reputable, honest garages.',
      solution: 'Hand the vehicle key back with a branded keytag or invoice QR code. Satisfied vehicle owners review the honest service and quick turnaround on the spot.',
      results: [
        'Build bulletproof reputation for fair pricing and reliable mechanics',
        'Capture roadside breakdown and scheduled service searches locally',
        'Private feedback catches any missed detail before the customer leaves angry'
      ],
      qrPlacement: 'Key handover counter, final invoice printout, car dashboard reminder tag',
      sampleReview: '“Honest, fast, and reliable car servicing! Explained all parts clearly and delivered on time without hidden costs. Best garage in town!”'
    },
    services: {
      title: 'Home Trades & Professional Services',
      icon: 'fa-solid fa-house-chimney-user',
      subtitle: 'Plumbers, electricians, contractors, and legal firms collecting reviews on the job site.',
      challenge: 'Service calls happen at the customer’s home or office where physical store standees don’t exist.',
      solution: 'Technicians show the StarReview AI digital QR on their phone or leave a printed leave-behind card immediately after completing high-quality work.',
      results: [
        'Capture 5-star reviews while the customer’s relief and gratitude are fresh',
        'Reward top-performing technicians based on customer review mentions',
        'Dominate local service searches across your entire metropolitan service area'
      ],
      qrPlacement: 'Technician smartphone screen, job completion leave-behind card, WhatsApp message',
      sampleReview: '“Prompt, polite, and very professional technician. Fixed our electrical wiring quickly and left the work area completely clean. 5 stars!”'
    }
  };

  const growthStages = [
    {
      stage: 'STAGE 1',
      range: '0 – 50 Google Reviews',
      title: 'The Initial Review Jumpstart',
      badge: 'BUILDING FOUNDATIONAL TRUST',
      badgeColor: '#16a34a',
      challenge: 'New or quiet business with few reviews. Customers hesitate to visit because low review count looks unverified.',
      solution: 'Deploy your first Google Magic Review QR standee. AI review drafts eliminate customer writer’s block, getting you your first 50 glowing reviews within 30 days.',
      keyMetric: 'Jump from 0 to 50+ reviews in 30 days'
    },
    {
      stage: 'STAGE 2',
      range: '50 – 200 Google Reviews',
      title: 'Dominating the Google 3-Pack',
      badge: 'LOCAL MAPS TOP RANKING',
      badgeColor: '#2563eb',
      challenge: 'Competing against established local stores with steady ratings. Stagnant review velocity holds back your ranking.',
      solution: 'Activate service keywords and staff mentions. Google’s algorithm detects high review velocity and keyword-rich customer text, lifting your listing into the top 3 spots.',
      keyMetric: 'Capture 70%+ of local customer calls and map clicks'
    },
    {
      stage: 'STAGE 3',
      range: '200+ Google Reviews',
      title: 'Reputation Shielding & Market Leadership',
      badge: 'UNTOUCHABLE LOCAL BRAND',
      badgeColor: '#7c3aed',
      challenge: 'High customer volume increases the probability of occasional bad reviews hurting your hard-earned star rating.',
      solution: 'The Private Feedback Shield filters 1 to 3 star ratings to management first. Issues are resolved amicably, keeping your public Google Maps rating at 4.8+ stars.',
      keyMetric: 'Protect 4.8+ rating while scaling foot traffic'
    }
  ];

  const currentPlaybook = industryPlaybooks[activeTab];

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
            <i className="fa-solid fa-arrow-trend-up"></i> REPUTATION PLAYBOOKS FOR GROWING BUSINESSES
          </span>
        </div>

        {/* Hero Header */}
        <header style={{ textAlign: 'center', maxWidth: 880, margin: '0 auto 48px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 16 }}>
            How Growing Businesses Win on <span style={{ color: '#16a34a' }}>Google Maps</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>
            Tailored Google review acceleration playbooks for restaurants, salons, clinics, retail stores, and service contractors. See how ambitious local storefronts turn everyday walk-in customers into published 5-star reviews on autopilot.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-dark"
              onClick={() => navigate('Account', true)}
              style={{ background: '#16a34a', border: 'none', padding: '12px 24px', fontWeight: 700, borderRadius: 10, fontSize: '0.95rem' }}
            >
              Start 3-Day Free Trial →
            </button>
            <a
              href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20want%20to%20learn%20how%20StarReview%20can%20grow%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
              style={{ border: '1.5px solid #cbd5e1', padding: '12px 24px', fontWeight: 700, borderRadius: 10, fontSize: '0.95rem', background: '#fff', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            >
              <i className="fa-brands fa-whatsapp" style={{ color: '#22c55e', fontSize: '1.1rem' }}></i> WhatsApp Consultation
            </a>
          </div>
        </header>

        {/* Harvard Business Review ROI Bar */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px 28px', marginBottom: 54, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
            The Proven ROI of Google Reviews for Local Storefronts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>+5% to 9%</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>Revenue increase for every +0.1 star rating jump on Google Maps (Harvard Business School).</p>
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>93%</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>Of local consumers read Google reviews before deciding to visit a local business.</p>
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>3.4x</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>Review velocity increase achieved by businesses switching from static QR to StarReview AI.</p>
            </div>
            <div>
              <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>70%+</div>
              <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b', lineHeight: 1.45 }}>Of high-intent customer phone calls and direction requests go to the top 3 Google listings.</p>
            </div>
          </div>
        </div>

        {/* 3 Growth Stages Section */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 36px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              The 3 Stages of Business Growth
            </span>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', margin: '8px 0 12px' }}>
              Where Does Your Business Stand Today?
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Whether you are just getting started or defending your position as the #1 brand in your city, StarReview AI gives you the exact tools you need.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {growthStages.map((s, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: s.badgeColor, background: `${s.badgeColor}15`, padding: '4px 10px', borderRadius: 20 }}>
                    {s.stage} · {s.range}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                  {s.title}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }}></i>
                  The Challenge:
                </div>
                <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>
                  {s.challenge}
                </p>
                <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 600, marginBottom: 8 }}>
                  <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 6 }}></i>
                  StarReview AI Strategy:
                </div>
                <p style={{ fontSize: '0.86rem', color: '#334155', margin: '0 0 18px', lineHeight: 1.5, flexGrow: 1 }}>
                  {s.solution}
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                  <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginRight: 6 }}></i>
                  {s.keyMetric}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Industry Playbooks Interactive Section */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 32px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Industry-Specific Growth Playbooks
            </span>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', margin: '8px 0 12px' }}>
              Customized for Your Exact Business Vertical
            </h2>
            <p style={{ fontSize: '0.96rem', color: '#64748b', margin: 0, lineHeight: 1.55 }}>
              Select your industry below to see how StarReview AI customizes review funnels, AI drafts, and physical standees for your business.
            </p>
          </div>

          {/* Industry Tabs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
            {[
              { id: 'restaurants', label: 'Restaurants & Cafes', icon: 'fa-solid fa-utensils' },
              { id: 'salons', label: 'Salons & Spas', icon: 'fa-solid fa-scissors' },
              { id: 'clinics', label: 'Clinics & Dental', icon: 'fa-solid fa-stethoscope' },
              { id: 'retail', label: 'Retail Stores', icon: 'fa-solid fa-bag-shopping' },
              { id: 'auto', label: 'Auto & Garages', icon: 'fa-solid fa-car-side' },
              { id: 'services', label: 'Home & Trades', icon: 'fa-solid fa-house-chimney-user' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: activeTab === tab.id ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  background: activeTab === tab.id ? '#16a34a' : '#ffffff',
                  color: activeTab === tab.id ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === tab.id ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none'
                }}
              >
                <i className={tab.icon}></i> {tab.label}
              </button>
            ))}
          </div>

          {/* Active Playbook Card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '36px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: '#dcfce7', color: '#16a34a', display: 'grid', placeItems: 'center', fontSize: '1.4rem' }}>
                <i className={currentPlaybook.icon}></i>
              </div>
              <div>
                <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {currentPlaybook.title}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                  {currentPlaybook.subtitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginTop: 24 }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  The In-Store Challenge:
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.55, margin: '0 0 16px' }}>
                  {currentPlaybook.challenge}
                </p>

                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  The StarReview AI Funnel:
                </div>
                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.55, margin: '0 0 16px' }}>
                  {currentPlaybook.solution}
                </p>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem', color: '#475569' }}>
                  <strong>Recommended QR Placement:</strong> {currentPlaybook.qrPlacement}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Proven Business Results:
                </div>
                <ul style={{ margin: '0 0 20px', paddingLeft: 18, fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                  {currentPlaybook.results.map((r, rIdx) => (
                    <li key={rIdx} style={{ marginBottom: 6 }}>{r}</li>
                  ))}
                </ul>

                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
                  Sample 10-Second AI Customer Draft:
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '16px', fontSize: '0.86rem', color: '#166534', fontStyle: 'italic', lineHeight: 1.6 }}>
                  {currentPlaybook.sampleReview}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Local Business Testimonials */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 32px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Real Customer Stories
            </span>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#0f172a', margin: '8px 0 12px' }}>
              Trusted by Hundreds of Local Businesses
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                stars: '★★★★★',
                text: "We went from 38 reviews to over 240 in less than 3 months! Customers love that they don't have to think about what to write — the AI suggestions match our restaurant perfectly.",
                author: "Rajesh Malhotra",
                role: "Owner, Spice Haven Bistro"
              },
              {
                stars: '★★★★★',
                text: "The private feedback shield saved our rating twice already. Instead of angry 1-star reviews on Google, we solved the issues directly with the patients. Truly priceless tool!",
                author: "Dr. Ananya Sen",
                role: "Founder, Sen Dental Care"
              },
              {
                stars: '★★★★★',
                text: "Our stylists love seeing their names mentioned in 5-star Google reviews. It motivated the entire salon, and we climbed to #1 for wellness spas in our area.",
                author: "Vikram Mehta",
                role: "Director, Luxe Wellness Spa"
              }
            ].map((t, idx) => (
              <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
                <div style={{ color: '#eab308', fontSize: '1.1rem', letterSpacing: 2, marginBottom: 12 }}>{t.stars}</div>
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, flexGrow: 1, margin: '0 0 16px' }}>{t.text}</p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{t.author}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <div style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)', borderRadius: 20, padding: '44px 32px', textAlign: 'center', color: '#fff', boxShadow: '0 16px 36px rgba(20, 83, 45, 0.2)' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, marginBottom: 14 }}>
            Accelerate Your Local Business Reviews Today
          </h2>
          <p style={{ fontSize: '1.05rem', opacity: 0.9, maxWidth: 640, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Set up your custom review page, connect your Google Place ID, and download your branded print-ready standees in under 60 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              className="btn"
              onClick={() => navigate('Account', true)}
              style={{ background: '#fff', color: '#166534', border: 'none', padding: '14px 28px', fontWeight: 800, borderRadius: 10, fontSize: '0.95rem' }}
            >
              Start 3-Day Free Trial →
            </button>
            <button
              className="btn"
              onClick={() => navigate('Pricing')}
              style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.7)', padding: '14px 28px', fontWeight: 800, borderRadius: 10, fontSize: '0.95rem' }}
            >
              View Plans &amp; Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
