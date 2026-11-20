// StarReview AI — Official Cookie & Storage Preferences Page
// Distinctive interactive privacy center & local storage transparency

import React, { useState } from 'react';

export default function CookiePolicyPage({ navigate }) {
  const [cleared, setCleared] = useState(false);
  const [prefAnalytics, setPrefAnalytics] = useState(true);

  const handleClearCache = () => {
    try {
      localStorage.removeItem('starreview_business');
      localStorage.removeItem('selected_theme');
      sessionStorage.clear();
      setCleared(true);
      setTimeout(() => setCleared(false), 4000);
    } catch {
      setCleared(true);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 20px 80px' }}>
      <div className="wrap" style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Top Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <button
            type="button"
            className="rf-privacy-back-btn"
            onClick={() => navigate('Home')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
          >
            <i className="fa-solid fa-arrow-left"></i> Back to Homepage
          </button>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            <i className="fa-solid fa-cookie-bite"></i> COOKIE &amp; STORAGE TRANSPARENCY
          </span>
        </div>

        {/* Hero Header */}
        <header style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 40px' }}>
          <h1 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
            Cookie &amp; Local Storage <span style={{ color: '#16a34a' }}>Policy</span>
          </h1>
          <p style={{ fontSize: '1.02rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            StarReview AI uses minimal, policy-safe browser storage to authenticate dashboard sessions and preserve review funnel states. We never use third-party advertising trackers or sell customer data.
          </p>
        </header>

        {/* Quick Privacy Status Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 36 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.02)' }}>
            <i className="fa-solid fa-lock" style={{ color: '#16a34a', fontSize: '1.25rem', marginBottom: 6 }}></i>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Session Tokens</div>
            <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>Secure &amp; Encrypted</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.02)' }}>
            <i className="fa-solid fa-qrcode" style={{ color: '#16a34a', fontSize: '1.25rem', marginBottom: 6 }}></i>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Funnel Cache</div>
            <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>Zero App Required</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.02)' }}>
            <i className="fa-solid fa-ban" style={{ color: '#dc2626', fontSize: '1.25rem', marginBottom: 6 }}></i>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Ad Pixels</div>
            <div style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 700, marginTop: 2 }}>100% Blocked</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.02)' }}>
            <i className="fa-solid fa-user-shield" style={{ color: '#16a34a', fontSize: '1.25rem', marginBottom: 6 }}></i>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0f172a' }}>Data Selling</div>
            <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700, marginTop: 2 }}>Never Monetized</div>
          </div>
        </div>

        {/* Interactive Preferences Cards */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '32px', marginBottom: 36, boxShadow: '0 4px 16px rgba(15,23,42,0.03)' }}>
          <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Storage Categories &amp; Purpose
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
            Review how StarReview AI uses storage technologies on your device. Essential elements are required for service operation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* 1. Essential Auth Session */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-key" style={{ color: '#16a34a', fontSize: '1.1rem' }}></i>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Essential Authentication Session</span>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 12 }}>
                  ALWAYS ACTIVE · REQUIRED
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 8px', lineHeight: 1.5 }}>
                Stores your encrypted authentication token (`token`) when you log in to the Business Console. This ensures you remain securely signed in across tabs without re-entering your email and password.
              </p>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'monospace' }}>
                Key: token &bull; Type: Session Cookie / LocalStorage &bull; Expiry: 30 Days or Logout
              </div>
            </div>

            {/* 2. Review Funnel State */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-star" style={{ color: '#eab308', fontSize: '1.1rem' }}></i>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Review Funnel State &amp; Rating Cache</span>
                </div>
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 12 }}>
                  ALWAYS ACTIVE · CORE FUNCTION
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 8px', lineHeight: 1.5 }}>
                When a customer scans your QR code, their chosen star rating and selected AI draft are temporarily preserved in browser memory. This allows 1-click clipboard copying so the text is instantly ready to paste on Google Maps.
              </p>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'monospace' }}>
                Key: starreview_funnel &bull; Type: Temporary Session State &bull; Expiry: Cleared upon completion
              </div>
            </div>

            {/* 3. Dashboard UI Preferences */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-palette" style={{ color: '#6366f1', fontSize: '1.1rem' }}></i>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Workspace &amp; Theme Preferences</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPrefAnalytics(!prefAnalytics)}
                  style={{
                    background: prefAnalytics ? '#16a34a' : '#cbd5e1',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 12,
                    padding: '4px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {prefAnalytics ? '✓ ENABLED' : 'DISABLED'}
                </button>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0 0 8px', lineHeight: 1.5 }}>
                Remembers your chosen QR standee color palette (Classic, Minimalist, Vibrant) and active dashboard tab so you never lose your visual setup upon refreshing.
              </p>
              <div style={{ fontSize: '0.76rem', color: '#64748b', fontFamily: 'monospace' }}>
                Key: activeTab, selected_theme &bull; Type: LocalStorage &bull; Expiry: Persistent
              </div>
            </div>

            {/* 4. Third-Party Ad Trackers */}
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 14, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <i className="fa-solid fa-shield-virus" style={{ color: '#e11d48', fontSize: '1.1rem' }}></i>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#9f1239' }}>Third-Party Advertising Trackers</span>
                </div>
                <span style={{ background: '#ffe4e6', color: '#e11d48', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 12 }}>
                  100% BLOCKED · NEVER USED
                </span>
              </div>
              <p style={{ fontSize: '0.86rem', color: '#881337', margin: 0, lineHeight: 1.5 }}>
                StarReview AI maintains a zero-ad-tracker guarantee. We do not permit Facebook Pixel, Google AdSense, or cross-site behavioral retargeting scripts on customer review funnels. Your customers experience clean, professional review pages.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Local Cache Action Box */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '28px', marginBottom: 36, boxShadow: '0 4px 16px rgba(15,23,42,0.03)', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Manage Your Local Browser Storage
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 auto 18px', maxWidth: 600, lineHeight: 1.5 }}>
            You can clear locally stored demo previews, theme preferences, and cached draft configurations on this browser with one click.
          </p>
          <button
            type="button"
            onClick={handleClearCache}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <i className="fa-solid fa-trash-can" style={{ color: '#64748b' }}></i>
            {cleared ? '✓ Local Funnel Cache Cleared!' : 'Clear Local Funnel Cache'}
          </button>
          {cleared && (
            <div style={{ color: '#16a34a', fontSize: '0.82rem', fontWeight: 700, marginTop: 10 }}>
              Local browser storage has been successfully refreshed.
            </div>
          )}
        </div>

        {/* Browser Settings Guide & Privacy Contact */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px' }}>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
              <i className="fa-solid fa-gear" style={{ color: '#16a34a', marginRight: 8 }}></i>
              How to Clear Cookies in Your Browser
            </h4>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.84rem', color: '#475569', lineHeight: 1.6 }}>
              <li><strong>Chrome:</strong> Settings &rarr; Privacy and security &rarr; Clear browsing data.</li>
              <li><strong>Safari:</strong> Preferences &rarr; Privacy &rarr; Manage Website Data.</li>
              <li><strong>Firefox:</strong> Settings &rarr; Privacy &amp; Security &rarr; Cookies and Site Data.</li>
              <li><strong>Edge:</strong> Settings &rarr; Cookies and site permissions &rarr; Manage and delete.</li>
            </ul>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '24px' }}>
            <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
              <i className="fa-solid fa-envelope" style={{ color: '#16a34a', marginRight: 8 }}></i>
              Privacy &amp; Data Questions?
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.55, margin: '0 0 12px' }}>
              Our team is committed to complete data transparency. Feel free to contact us with any questions regarding cookies or data privacy.
            </p>
            <div style={{ fontSize: '0.84rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <a href="mailto:marutiinfosoftteam@gmail.com" style={{ color: '#16a34a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-solid fa-paper-plane"></i> marutiinfosoftteam@gmail.com
              </a>
              <a href="https://wa.me/919904482945?text=Hello%20Maruti%20InfoSoft%2C%20I%20have%20a%20privacy%20or%20cookie%20inquiry." target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }}></i> +91 99044 82945
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
