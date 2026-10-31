// StarReview AI — Official Privacy Policy Page
// Comprehensive, compliant, and transparent privacy disclosures

import React from 'react';

export default function PrivacyPolicyPage({ navigate }) {
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
            <i className="fa-solid fa-shield-halved"></i> PRIVACY &amp; DATA PROTECTION
          </span>
        </div>

        {/* Hero Banner */}
        <header className="rf-privacy-header">
          <h1>Privacy Policy</h1>
          <p className="rf-privacy-effective">
            <strong>StarReview AI</strong> &bull; Effective Date: October 29, 2026 &bull; Last Updated: October 2026
          </p>
          <p className="rf-privacy-lead">
            At StarReview AI, we are committed to protecting your business and customer data with transparent, security-first practices. This Privacy Policy outlines what information we collect, how it is handled, and the strict controls in place to safeguard your privacy.
          </p>
        </header>

        {/* Policy Content Sections */}
        <div className="rf-privacy-content">
          {/* 1. Information Collected */}
          <section className="rf-privacy-section">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that is strictly necessary to deliver our reputation management, review funnel, and AI review drafting services:
            </p>
            <ul>
              <li><strong>Account Credentials:</strong> Name, business email, contact telephone number (+91 9904482945 for platform support), and encrypted authentication tokens.</li>
              <li><strong>Business Profile Details:</strong> Business name, address, Google Maps Place ID, industry category, services offered, staff names (for review personalization), and brand colors.</li>
              <li><strong>Customer Interaction Data:</strong> Number of QR scans, review suggestions generated, draft copy events, and redirects to official Google review pages.</li>
              <li><strong>Private Customer Feedback:</strong> Ratings, constructive suggestions, and optional contact details submitted through your private feedback filter form.</li>
            </ul>
          </section>

          {/* 2. Account & Authentication Data */}
          <section className="rf-privacy-section">
            <h2>2. Account &amp; Authentication Data</h2>
            <p>
              We utilize Google OAuth 2.0 and Firebase Authentication to provide secure, credential-less sign-in whenever selected:
            </p>
            <ul>
              <li>We never view or store your raw Google account passwords.</li>
              <li>Session verification is performed server-side via trusted cryptographic tokens.</li>
              <li>Logging out securely terminates your active session tokens without deleting your saved business configuration, reviews, or subscription entitlements.</li>
            </ul>
          </section>

          {/* 3. Business Information & Review-Related Data */}
          <section className="rf-privacy-section">
            <h2>3. Business Information &amp; Review-Related Data</h2>
            <p>
              StarReview AI connects to official Google Places APIs only upon your explicit authorization:
            </p>
            <ul>
              <li>We only access publicly available business listing attributes (name, public rating, review counts, Place ID).</li>
              <li>We do not scrape private Google user profiles, bypass Google security, or publish fake reviews.</li>
              <li>Your review funnels encourage genuine customer sentiment while directing unsatisfied customers to your private inbox for resolution.</li>
            </ul>
          </section>

          {/* 4. How Information Is Used */}
          <section className="rf-privacy-section">
            <h2>4. How Information Is Used</h2>
            <p>
              Your data is utilized solely for legitimate operational purposes:
            </p>
            <ul>
              <li>Generating personalized, print-ready QR standees and flyers.</li>
              <li>Crafting sentiment-aware AI draft suggestions to overcome customer writer's block.</li>
              <li>Monitoring analytics, scans, and conversion progress in your Business Console.</li>
              <li>Notifying you of urgent customer feedback submitted through the private firewall.</li>
              <li>Managing subscription status, renewals, and invoice receipts.</li>
            </ul>
          </section>

          {/* 5. Data Storage & Security */}
          <section className="rf-privacy-section">
            <h2>5. Data Storage &amp; Security</h2>
            <p>
              All customer data is stored in isolated, production-grade databases (MongoDB Atlas) with tenant separation:
            </p>
            <ul>
              <li><strong>Tenant Isolation:</strong> Data queries are strictly scoped by your verified account ID. One business user can never access or modify another business user's data.</li>
              <li><strong>Encryption:</strong> All network communication is protected via industry-standard 256-bit TLS/SSL encryption in transit and encrypted storage at rest.</li>
              <li><strong>No Financial Storage:</strong> We never store credit card numbers, CVVs, or bank secrets on our servers. All transactions are processed through certified payment partners (e.g., Razorpay).</li>
            </ul>
          </section>

          {/* 6. Third-Party Service Providers */}
          <section className="rf-privacy-section">
            <h2>6. Third-Party Service Providers</h2>
            <p>
              To deliver our SaaS services reliably, we partner with industry-leading infrastructure providers:
            </p>
            <ul>
              <li><strong>Google Cloud &amp; Google Places API:</strong> For verified business discovery and Google review routing.</li>
              <li><strong>MongoDB Atlas:</strong> For secure, fault-tolerant cloud database hosting.</li>
              <li><strong>Firebase (Google LLC):</strong> For identity validation and multi-factor authentication.</li>
              <li><strong>Payment Processors (Razorpay):</strong> For PCI-DSS compliant checkout and subscription billing.</li>
            </ul>
          </section>

          {/* 7. AI Processing & External AI Providers */}
          <section className="rf-privacy-section">
            <h2>7. AI Processing &amp; External AI Providers</h2>
            <p>
              Our review assistant features utilize server-side AI integrations (OpenRouter / Large Language Models):
            </p>
            <ul>
              <li>Only anonymized review context (e.g., service mentioned, business category, sentiment score) is transmitted for draft generation.</li>
              <li>We do not send customer credit card details, phone numbers, or confidential trade secrets to external AI providers.</li>
              <li>AI providers do not use your proprietary business prompts to train public models.</li>
            </ul>
          </section>

          {/* 8. Data Retention & Deletion */}
          <section className="rf-privacy-section">
            <h2>8. Data Retention &amp; Deletion</h2>
            <p>
              We retain your business configuration and analytics for as long as your account remains active. If you choose to delete your account:
            </p>
            <ul>
              <li>You may request complete data erasure at any time by contacting our privacy team.</li>
              <li>Upon request verification, all associated business records, feedback entries, and review history will be permanently deleted from our primary databases within 30 days.</li>
            </ul>
          </section>

          {/* 9. Customer Rights & Privacy Requests */}
          <section className="rf-privacy-section">
            <h2>9. Customer Rights &amp; Privacy Requests</h2>
            <p>
              Under applicable data protection laws, you retain full rights regarding your personal information:
            </p>
            <ul>
              <li><strong>Right to Access:</strong> Request a full copy of all information stored regarding your business.</li>
              <li><strong>Right to Rectification:</strong> Update inaccurate business, phone, or location records instantly in your console.</li>
              <li><strong>Right to Portability:</strong> Export review logs and customer feedback in standard digital formats.</li>
            </ul>
          </section>

          {/* 10. Cookies & Session Management */}
          <section className="rf-privacy-section">
            <h2>10. Cookies &amp; Session Management</h2>
            <p>
              We use minimal, strictly necessary cookies and secure tokens to maintain your authenticated login state and remember your console preferences across page visits. We do not sell tracking cookies or provide ad-retargeting trackers to third-party data brokers.
            </p>
          </section>

          {/* 11. Contact Information */}
          <section className="rf-privacy-section rf-privacy-contact-box">
            <h2>11. Contact Our Privacy Team</h2>
            <p>
              If you have any questions regarding this Privacy Policy or wish to exercise your data rights, please contact our dedicated support team:
            </p>
            <div className="rf-privacy-contact-grid">
              <div>
                <strong>Platform:</strong> StarReview AI
              </div>
              <div>
                <strong>Direct Phone:</strong> <a href="tel:+919904482945" target="_blank" rel="noopener noreferrer">+91 9904482945</a>
              </div>
              <div>
                <strong>WhatsApp Support:</strong> <a href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20have%20a%20privacy%20inquiry." target="_blank" rel="noopener noreferrer">+91 9904482945</a>
              </div>
              <div>
                <strong>Headquarters:</strong> Surat, Gujarat, India
              </div>
            </div>
          </section>
        </div>

        {/* Bottom CTA */}
        <div className="rf-privacy-footer-cta">
          <button
            type="button"
            className="rf-btn-dark"
            onClick={() => navigate('Home')}
          >
            <i className="fa-solid fa-arrow-left"></i> Return to Homepage
          </button>
          <a
            href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20know%20more%20about%20your%20plans."
            target="_blank"
            rel="noopener noreferrer"
            className="rf-btn-whatsapp"
          >
            <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
