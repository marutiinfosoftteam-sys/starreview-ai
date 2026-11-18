// StarReview AI — Official Cookie & Storage Policy Page
// Clear, detailed disclosures about browser cookies and local storage

import React from 'react';

export default function CookiePolicyPage({ navigate }) {
  return (
    <div className="rf-privacy-page-shell">
      <div className="rf-privacy-container">
        {/* Breadcrumb & Navigation */}
        <div className="rf-privacy-top-bar">
          <button
            type="button"
            className="rf-privacy-back-btn"
            onClick={() => navigate('Home')}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Homepage
          </button>
          <span className="rf-privacy-badge">
            <i className="fa-solid fa-cookie-bite"></i> COOKIE POLICY · DATA TRANSPARENCY
          </span>
        </div>

        {/* Hero Banner */}
        <header className="rf-privacy-header">
          <h1>Cookie &amp; Local Storage Policy</h1>
          <p className="rf-privacy-effective">
            <strong>StarReview AI</strong> &bull; Effective Date: November 2026 &bull; Version 2.2
          </p>
          <p className="rf-privacy-lead">
            This Cookie Policy explains how StarReview AI uses minimal cookies, local browser storage (`localStorage`), and session tokens to provide our Google Review acceleration service, preserve your dashboard state, and deliver seamless QR review funnels.
          </p>
        </header>

        {/* Policy Content */}
        <div className="rf-privacy-content">
          {/* 1. What Are Cookies */}
          <section className="rf-privacy-section">
            <h2>1. What Are Cookies and Local Browser Storage?</h2>
            <p>
              Cookies are small text files placed on your computer or mobile device when you visit a website. In addition to cookies, modern web applications utilize <strong>Local Storage (`localStorage`)</strong> and <strong>Session Storage</strong>, which allow your browser to remember user preferences and state locally without constantly re-sending data across the network.
            </p>
            <p>
              StarReview AI adopts a privacy-first approach: we use storage mechanisms strictly to enable platform functionality and security, never for third-party ad profiling.
            </p>
          </section>

          {/* 2. How StarReview AI Uses Cookies & Storage */}
          <section className="rf-privacy-section">
            <h2>2. How StarReview AI Uses Cookies &amp; Storage</h2>
            <p>
              We categorize our browser storage into the following functional purposes:
            </p>
            <ul>
              <li>
                <strong>Essential Authentication Sessions:</strong> When you sign in to your StarReview AI Business Console (via email/password or Google OAuth), an encrypted token is securely stored in your browser session. This verifies your identity and keeps you logged in as you navigate between tabs.
              </li>
              <li>
                <strong>Review Funnel State:</strong> When a customer scans your QR code and selects a 5-star rating, their chosen rating and draft selection are temporarily held in browser state. This ensures that when the customer taps &ldquo;Copy review &amp; post on Google&rdquo;, their text is seamlessly pre-filled and clipboard-ready.
              </li>
              <li>
                <strong>Onboarding &amp; Setup Persistence:</strong> While setting up your business profile or connecting your Google Place ID, draft changes are cached locally to prevent accidental data loss if you refresh or switch tabs.
              </li>
              <li>
                <strong>Dashboard Preferences:</strong> Remembers your active dashboard tab (e.g., Overview, QR Flyer, Reply Assistant, SEO Analyzer, or Billing) and theme choices (e.g., Standee color, Classic, Minimalist, Vibrant).
              </li>
            </ul>
          </section>

          {/* 3. Detailed Storage Table */}
          <section className="rf-privacy-section">
            <h2>3. Specific Storage Elements We Use</h2>
            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                    <th style={{ padding: '10px 12px' }}>Name / Key</th>
                    <th style={{ padding: '10px 12px' }}>Type</th>
                    <th style={{ padding: '10px 12px' }}>Purpose</th>
                    <th style={{ padding: '10px 12px' }}>Lifespan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>token</td>
                    <td style={{ padding: '10px 12px' }}>Session Cookie / Local</td>
                    <td style={{ padding: '10px 12px' }}>Authenticated user authorization token</td>
                    <td style={{ padding: '10px 12px' }}>Session / 30 Days</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>activeTab</td>
                    <td style={{ padding: '10px 12px' }}>Local Storage</td>
                    <td style={{ padding: '10px 12px' }}>Remembers currently selected dashboard view</td>
                    <td style={{ padding: '10px 12px' }}>Persistent</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>starreview_business</td>
                    <td style={{ padding: '10px 12px' }}>Local Storage</td>
                    <td style={{ padding: '10px 12px' }}>Cached Google Place ID &amp; business display name</td>
                    <td style={{ padding: '10px 12px' }}>Persistent until logout</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>selected_theme</td>
                    <td style={{ padding: '10px 12px' }}>Local Storage</td>
                    <td style={{ padding: '10px 12px' }}>Stores QR flyer background &amp; standee palette</td>
                    <td style={{ padding: '10px 12px' }}>Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Zero Third-Party Ad Trackers */}
          <section className="rf-privacy-section">
            <h2>4. Strict Zero Third-Party Advertising Policy</h2>
            <p>
              Unlike conventional ad-supported web applications, <strong>StarReview AI does NOT use third-party behavioral advertising cookies, cross-site trackers, or data-broker pixels</strong>:
            </p>
            <ul>
              <li>We do not sell, rent, or trade your personal data or your customers&rsquo; review patterns to marketing conglomerates.</li>
              <li>We do not allow third-party ad networks to place tracking beacons on your branded review funnels.</li>
              <li>Your customer review experience remains 100% clean, professional, and free of banner ads or retargeting scripts.</li>
            </ul>
          </section>

          {/* 5. Managing & Disabling Cookies */}
          <section className="rf-privacy-section">
            <h2>5. How You Can Manage or Clear Cookies</h2>
            <p>
              You can control and manage cookies through your browser settings at any time:
            </p>
            <ul>
              <li><strong>Google Chrome:</strong> Settings &rarr; Privacy and security &rarr; Cookies and other site data.</li>
              <li><strong>Apple Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data.</li>
              <li><strong>Microsoft Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete cookies.</li>
            </ul>
            <p>
              <em>Note:</em> Because our session tokens are essential for verifying your account, disabling all browser cookies or local storage will prevent you from signing in to the StarReview AI Business Console.
            </p>
          </section>

          {/* 6. Questions */}
          <section className="rf-privacy-section rf-privacy-contact-box">
            <h2>6. Cookie &amp; Privacy Questions</h2>
            <p>
              If you have any questions about our use of cookies or local data storage, our team is available to help:
            </p>
            <div className="rf-privacy-contact-grid">
              <div>
                <strong>Email:</strong>
                <a href="mailto:marutiinfosoftteam@gmail.com">marutiinfosoftteam@gmail.com</a>
              </div>
              <div>
                <strong>WhatsApp / Phone:</strong>
                <a href="https://wa.me/919904482945" target="_blank" rel="noopener noreferrer">+91 99044 82945</a>
              </div>
              <div>
                <strong>Location:</strong>
                <span>Surat, Gujarat, India</span>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom Return CTA */}
        <div className="rf-privacy-footer-cta">
          <button
            type="button"
            className="rf-privacy-back-btn"
            onClick={() => navigate('Home')}
          >
            ← Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
