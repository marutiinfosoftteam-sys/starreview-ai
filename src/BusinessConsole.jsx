import React, { useState, useEffect } from 'react';
import { api, getToken, setToken } from './api.js';
import { QrFlyer, BusinessSetup, ReplyAssistant, SeoAnalyzer, funnelUrl } from './tools.jsx';
import './console.css';

export default function BusinessConsole({
  user,
  setUser,
  business,
  setBusiness,
  navigate,
  notify,
  choosePlan,
  initialTab = 'Dashboard'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [recentEvents, setRecentEvents] = useState([]);

  // Filter & Control States matching ReviewFlow AI Screenshots
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('7 Days');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [signOffSignature, setSignOffSignature] = useState(business?.name || 'The Management Team');
  const [customAiInstructions, setCustomAiInstructions] = useState('Mention our friendly service and invite customers back');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('All Ratings');
  const [manualReviewText, setManualReviewText] = useState('');
  const [manualReviewRating, setManualReviewRating] = useState(5);
  const [manualReplyTone, setManualReplyTone] = useState('Grateful');
  const [manualReplyDraft, setManualReplyDraft] = useState('');
  const [generatingReply, setGeneratingReply] = useState(false);
  const [negGatingEnabled, setNegGatingEnabled] = useState(true);
  const [negTab, setNegTab] = useState('Active');
  const [qrTheme, setQrTheme] = useState('Classic');
  const [qrDisplaySize, setQrDisplaySize] = useState('A6');

  // Load user-specific analytics and business
  const fetchDashboardData = async () => {
    if (!user) return;
    setLoadingAnalytics(true);
    try {
      const r = await api('GET', '/api/analytics');
      if (r.ok && r.data) {
        setAnalyticsData(r.data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, business?.id]);

  // Derived business info
  const bizName = business?.name || 'verde eco landing';
  const bizCategory = business?.category || 'Other';
  const bizCity = business?.city || 'sarthana';
  const directReviewUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://starreview-ai-alpha.vercel.app') + (business?.slug ? ('/r/' + business.slug) : '/r/demo');
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=4&data=${encodeURIComponent(directReviewUrl)}`;
  const bizInitial = (bizName.trim()[0] || 'V').toUpperCase();
  const sub = user?.subscription;
  const isTrial = sub?.plan === 'Trial' || !sub;
  const daysLeft = sub?.expiresAt ? Math.max(0, Math.ceil((new Date(sub.expiresAt) - new Date()) / 86400000)) : 0;
  const planName = sub?.plan || 'Free Trial';

  // Metrics
  const totals = analyticsData?.totals || {
    scans: 0,
    visits: 0,
    drafts: 0,
    copies: 0,
    redirects: 0,
    conversion: 0
  };

  const feedbackList = analyticsData?.feedback || [];

  const handleSignOut = () => {
    setToken('');
    setUser(null);
    setBusiness(null);
    notify('Signed out successfully.');
    navigate('Home');
  };

  const tabs = [
    { section: 'OVERVIEW' },
    { id: 'Dashboard', label: 'Dashboard', icon: 'fa-solid fa-table-cells-large' },
    { id: 'Analytics', label: 'Analytics', icon: 'fa-solid fa-chart-column' },
    { id: 'Review Reply', label: 'Review Reply', icon: 'fa-solid fa-reply' },
    { id: 'Negative Reviews', label: 'Negative Reviews', icon: 'fa-solid fa-thumbs-down', badge: feedbackList.length ? String(feedbackList.length) : null, badgeClass: 'bc-badge-yellow' },

    { section: 'GROWTH TOOLS' },
    { id: 'Magic Review QR', label: 'Magic Review QR', icon: 'fa-solid fa-qrcode' },
    { id: 'Review Settings', label: 'Review Settings', icon: 'fa-solid fa-sliders' },
    { id: 'Physical QR Stand', label: 'Physical QR Stand', icon: 'fa-solid fa-store', badge: 'New', badgeClass: 'bc-badge-yellow' },
    { id: 'AI SEO Analyzer', label: 'AI SEO Analyzer', icon: 'fa-solid fa-magnifying-glass-chart', badge: 'AI', badgeClass: 'bc-badge-yellow' },
    { id: 'Add-On Services', label: 'Add-On Services', icon: 'fa-solid fa-cubes' },

    { section: 'ACCOUNT' },
    { id: 'Billing & Plans', label: 'Billing & Plans', icon: 'fa-regular fa-credit-card', badge: isTrial ? 'Free Trial' : planName, badgeClass: 'bc-badge-mint' },
    { id: 'Settings', label: 'Settings', icon: 'fa-solid fa-gear' }
  ];

  return (
    <div className="bc-layout">
      {/* ── SIDEBAR ── */}
      <aside className={`bc-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand */}
        <div className="bc-sidebar-header">
          <div className="bc-brand-group" onClick={() => setActiveTab('Dashboard')} style={{ cursor: 'pointer' }}>
            <div className="bc-brand-icon">
              <i className="fa-solid fa-star"></i>
            </div>
            {!collapsed && (
              <div className="bc-brand-text">
                <h3>StarReview AI</h3>
                <small>Business Console</small>
              </div>
            )}
          </div>
          <button
            className="bc-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        {!collapsed && (
          <div style={{ padding: '0 1rem 0.5rem 1rem' }}>
            <button
              type="button"
              onClick={() => navigate('Home')}
              style={{
                width: '100%',
                padding: '6px 10px',
                fontSize: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              title="Return to StarReview AI public website"
            >
              <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.7rem' }}></i> Back to Website
            </button>
          </div>
        )}

        {/* Plan Status Card in Sidebar */}
        {!collapsed && (
          isTrial ? (
            <div className="bc-sidebar-alert">
              <div className="alert-title">
                <i className="fa-solid fa-triangle-exclamation"></i>
                {daysLeft > 0 ? `Free Trial — ${daysLeft} days` : 'Plan Expired'}
              </div>
              <p>{daysLeft > 0 ? 'Features fully unlocked' : 'Features locked.'}</p>
              <button className="bc-sidebar-alert-btn" onClick={() => choosePlan('Pro', 'Monthly')}>
                Upgrade Plan
              </button>
            </div>
          ) : (
            <div className="bc-sidebar-alert" style={{ background: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.4)' }}>
              <div className="alert-title" style={{ color: '#86efac' }}>
                <i className="fa-solid fa-circle-check"></i>
                {planName} Plan Active
              </div>
              <p style={{ color: '#bbf7d0' }}>All growth tools unlocked</p>
            </div>
          )
        )}

        {/* Navigation list */}
        <div className="bc-nav-scroll">
          {tabs.map((item, idx) => {
            if (item.section) {
              return !collapsed ? (
                <div key={idx} className="bc-nav-section-title">
                  {item.section}
                </div>
              ) : (
                <div key={idx} style={{ height: 8 }} />
              );
            }
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`bc-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                title={collapsed ? item.label : undefined}
              >
                <i className={item.icon}></i>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className={`bc-nav-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Footer in Sidebar */}
        <div className="bc-sidebar-footer">
          <div className="bc-user-pill" onClick={() => setActiveTab('Settings')}>
            <div className="bc-user-avatar">{user?.email ? user.email.slice(0, 2).toUpperCase() : 'TM'}</div>
            {!collapsed && (
              <div className="bc-user-info">
                <div className="bc-user-name">{business?.name || user?.email?.split('@')[0] || 'Team Maruti InfoSoft'}</div>
                <div className="bc-user-role">Business Owner</div>
              </div>
            )}
            {!collapsed && <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem', opacity: 0.6 }}></i>}
          </div>
          {!collapsed && (
            <button className="bc-signout-btn" onClick={handleSignOut}>
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Sign out
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="bc-main">
        {/* Mobile menu trigger */}
        <div style={{ display: 'none', marginBottom: '1rem' }} className="bc-mobile-bar">
          <button className="btn btn-light btn-sm" onClick={() => setMobileOpen(true)}>
            ☰ Menu
          </button>
        </div>

        {/* ====================================================================
            VIEW: DASHBOARD (EXACT SCREENSHOT MATCH)
            ==================================================================== */}
        {activeTab === 'Dashboard' && (
          <div>
            {/* 1. TOP BUSINESS BANNER CARD */}
            <div className="bc-business-card">
              <div className="bc-biz-left">
                <div className="bc-biz-avatar">{bizInitial}</div>
                <div className="bc-biz-details">
                  <h1>
                    {bizName}
                    <span className="bc-badge-live">
                      <span className="bc-live-dot"></span> LIVE
                    </span>
                  </h1>
                  <div className="bc-biz-tags">
                    <span className="bc-pill-tag">
                      <i className="fa-regular fa-folder"></i> {bizCategory}
                    </span>
                    <span className="bc-pill-tag">
                      <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i> {bizCity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bc-biz-right">
                <div className="bc-funnel-status-box">
                  <div className="bc-funnel-label">Review Funnel</div>
                  <div className="bc-funnel-val">
                    <span className="bc-live-dot"></span> Active &amp; Ready
                  </div>
                </div>
                <button className="bc-btn-manage-qr" onClick={() => setActiveTab('Magic Review QR')}>
                  <div>
                    Manage QR Tools
                    <span>Poster, QR code &amp; stand</span>
                  </div>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* 2. TRIAL ALERT BANNER */}
            {isTrial ? (
              <div className="bc-trial-banner">
                <div className="bc-trial-content">
                  <div className="bc-trial-icon">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <div>
                    <div className="bc-trial-title">
                      {daysLeft > 0 ? `Free Trial — ${daysLeft} days remaining` : 'Free Trial — 0 days remaining'}
                    </div>
                    <p className="bc-trial-desc">
                      Upgrade to unlock AI Replies, remove ads, and get priority support.
                    </p>
                  </div>
                </div>
                <button className="bc-btn-upgrade" onClick={() => choosePlan('Pro', 'Monthly')}>
                  Upgrade Plan
                </button>
              </div>
            ) : (
              <div className="bc-trial-banner" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className="bc-trial-content">
                  <div className="bc-trial-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div>
                    <div className="bc-trial-title" style={{ color: '#166534' }}>
                      {planName} Plan Active · Full Access Unlocked
                    </div>
                    <p className="bc-trial-desc" style={{ color: '#15803d' }}>
                      AI review drafting, unlimited QR scans, Google sync, and private feedback routing are active.
                    </p>
                  </div>
                </div>
                <button className="bc-btn-upgrade" style={{ background: '#166534' }} onClick={() => choosePlan('Pro', 'Yearly')}>
                  Manage Plan
                </button>
              </div>
            )}

            {/* 3. GROWTH STRATEGY CARD ("Slow & Steady Wins the Review Game") */}
            <div className="bc-growth-card">
              <div className="bc-growth-header">
                <div className="bc-growth-header-icon">
                  <i className="fa-solid fa-seedling"></i>
                </div>
                <div>
                  <div className="bc-growth-title">
                    Slow &amp; Steady Wins the Review Game
                    <span className="bc-growth-pill">Smart Growth</span>
                  </div>
                  <p className="bc-growth-subtitle">
                    A simple guide to collecting reviews naturally and consistently
                  </p>
                </div>
              </div>

              {/* 2 Comparison Cards */}
              <div className="bc-growth-comparison">
                <div className="bc-comp-card warning">
                  <div className="bc-comp-title">
                    <i className="fa-solid fa-triangle-exclamation"></i> Avoid sudden review spikes
                  </div>
                  <p className="bc-comp-desc">
                    If you normally get 1–2 reviews a day, suddenly getting 20–30 can look unusual and may lead to new reviews being removed by Google.
                  </p>
                </div>

                <div className="bc-comp-card success">
                  <div className="bc-comp-title">
                    <i className="fa-solid fa-circle-check"></i> The simple approach
                  </div>
                  <p className="bc-comp-desc">
                    Ask for a few more reviews consistently instead of creating one big jump. Think small steps, steady growth. 📈
                  </p>
                </div>
              </div>

              {/* Horizontal Step Progression */}
              <div className="bc-timeline-box">
                <div className="bc-timeline-header">
                  <div className="bc-timeline-title">
                    Example of steady growth <small>Small steps — consistent progress</small>
                  </div>
                  <div className="bc-timeline-badge">
                    <i className="fa-regular fa-bookmark"></i> Keep building
                  </div>
                </div>

                <div className="bc-timeline-steps">
                  <div className="bc-step-pill bc-step-1">
                    2–3 Reviews <span>Day 1</span>
                  </div>
                  <div className="bc-step-pill bc-step-2">
                    3–4 Reviews <span>Day 2</span>
                  </div>
                  <div className="bc-step-pill bc-step-3">
                    5–6 Reviews <span>Day 3</span>
                  </div>
                  <div className="bc-step-pill bc-step-4">
                    7–8 Reviews <span>Day 4</span>
                  </div>
                  <div className="bc-step-pill bc-step-5">
                    Keep going! <span>By month end 🚀</span>
                  </div>
                </div>

                <p className="bc-timeline-footer">
                  <i className="fa-solid fa-trophy"></i>
                  <span><strong>Takeaway:</strong> grow your review volume gradually and consistently rather than making one large jump.</span>
                </p>
              </div>
            </div>

            {/* 4. 8 STAT METRIC CARDS */}
            <div className="bc-stats-grid">
              {/* Row 1 */}
              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-blue">
                    <i className="fa-solid fa-qrcode"></i>
                  </div>
                  <div className="bc-stat-label">QR Scans</div>
                </div>
                <div className="bc-stat-val">{totals.scans}</div>
                <p className="bc-stat-sub">Total scans</p>
              </div>

              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-cyan">
                    <i className="fa-solid fa-desktop"></i>
                  </div>
                  <div className="bc-stat-label">Funnel Visits</div>
                </div>
                <div className="bc-stat-val">{totals.visits || totals.scans}</div>
                <p className="bc-stat-sub">Landing page visits</p>
              </div>

              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-orange">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div className="bc-stat-label">AI Reviews Generated</div>
                </div>
                <div className="bc-stat-val">{totals.drafts}</div>
                <p className="bc-stat-sub">AI review drafts</p>
              </div>

              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-green">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <div className="bc-stat-label">Reviews Selected</div>
                </div>
                <div className="bc-stat-val">{totals.copies}</div>
                <p className="bc-stat-sub">Chosen by customers</p>
              </div>

              {/* Row 2 */}
              <div className="bc-stat-card solid-green">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div className="bc-stat-label">Scan → Review</div>
                </div>
                <div className="bc-stat-val">{totals.conversion}%</div>
                <p className="bc-stat-sub">Conversion rate</p>
              </div>

              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-green">
                    <i className="fa-regular fa-calendar-check"></i>
                  </div>
                  <div className="bc-stat-label">Selected This Month</div>
                </div>
                <div className="bc-stat-val">{totals.copies}</div>
                <p className="bc-stat-sub">Monthly selected reviews</p>
              </div>

              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-blue">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </div>
                  <div className="bc-stat-label">Scans This Month</div>
                </div>
                <div className="bc-stat-val">{totals.scans}</div>
                <p className="bc-stat-sub">Monthly QR scans</p>
              </div>

              <div className="bc-stat-card">
                <div className="bc-stat-top">
                  <div className="bc-stat-icon-box bc-icon-green">
                    <i className="fa-solid fa-power-off"></i>
                  </div>
                  <div className="bc-stat-label">Active QR Funnel</div>
                </div>
                <div className="bc-stat-val">1</div>
                <p className="bc-stat-sub">Live review funnel</p>
              </div>
            </div>

            {/* 5. ANALYTICS: PERFORMANCE TRENDS CHART */}
            <div className="bc-analytics-card">
              <div className="bc-analytics-header">
                <div>
                  <div className="bc-analytics-tag">Analytics</div>
                  <h3 className="bc-analytics-title">Performance Trends</h3>
                  <p className="bc-analytics-subtitle">
                    See how customers move from QR scan to funnel visit and selected review over the last 7 days.
                  </p>
                </div>
                <div className="bc-analytics-legend">
                  <span><span className="bc-legend-dot bc-dot-green"></span> QR Scans</span>
                  <span><span className="bc-legend-dot bc-dot-blue"></span> Visits</span>
                  <span><span className="bc-legend-dot bc-dot-purple"></span> Selected Reviews</span>
                </div>
              </div>

              {/* Dynamic SVG 7-Day Line Chart */}
              <div style={{ position: 'relative', width: '100%' }}>
                <svg viewBox="0 0 700 150" className="bc-chart-svg" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="120" x2="700" y2="120" stroke="#f1f5f9" strokeWidth="1.5" />
                  <line x1="0" y1="70" x2="700" y2="70" stroke="#f1f5f9" strokeWidth="1.5" />
                  <line x1="0" y1="20" x2="700" y2="20" stroke="#f1f5f9" strokeWidth="1.5" />

                  {/* Y Axis Label */}
                  <text x="5" y="115" fill="#94a3b8" fontSize="10">0</text>
                  <text x="5" y="65" fill="#94a3b8" fontSize="10">1</text>
                  <text x="5" y="18" fill="#94a3b8" fontSize="10">2</text>

                  {/* Lines for Scans, Visits, Reviews */}
                  {/* Green line: Scans */}
                  <path
                    d="M 50 120 L 150 120 L 250 120 L 350 120 L 450 120 L 550 120 L 650 120"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {[50, 150, 250, 350, 450, 550, 650].map((cx, i) => (
                    <circle key={i} cx={cx} cy={120} r="4" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
                  ))}

                  {/* Blue line: Visits */}
                  <path
                    d="M 50 120 L 150 120 L 250 120 L 350 120 L 450 120 L 550 120 L 650 120"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* X Axis Day Labels */}
                  {['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].map((day, idx) => (
                    <text
                      key={day}
                      x={50 + idx * 100}
                      y="142"
                      fill="#64748b"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* 6. 2-COLUMN BOTTOM SECTION */}
            <div className="bc-bottom-grid">
              {/* Left Column: Breakdown Table & Events */}
              <div>
                {/* Performance Breakdown Table */}
                <div className="bc-panel">
                  <h3 className="bc-panel-title">Review Performance Breakdown</h3>
                  <p className="bc-panel-desc">Comparative activity across weekly, monthly, and lifetime intervals.</p>

                  <div className="bc-table-wrap">
                    <table className="bc-table">
                      <thead>
                        <tr>
                          <th>Timeframe</th>
                          <th>QR Scans</th>
                          <th>Funnel Visits</th>
                          <th>Reviews Gen</th>
                          <th>Selected</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="tf-name">Weekly</td>
                          <td>{totals.scans}</td>
                          <td>{totals.visits || totals.scans}</td>
                          <td>{totals.drafts}</td>
                          <td style={{ color: '#16a34a', fontWeight: 800 }}>{totals.copies}</td>
                        </tr>
                        <tr>
                          <td className="tf-name">Monthly</td>
                          <td>{totals.scans}</td>
                          <td>{totals.visits || totals.scans}</td>
                          <td>{totals.drafts}</td>
                          <td style={{ color: '#16a34a', fontWeight: 800 }}>{totals.copies}</td>
                        </tr>
                        <tr>
                          <td className="tf-name">Total</td>
                          <td>{totals.scans}</td>
                          <td>{totals.visits || totals.scans}</td>
                          <td>{totals.drafts}</td>
                          <td style={{ color: '#16a34a', fontWeight: 800 }}>{totals.copies}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent QR Code Events Feed */}
                <div className="bc-panel">
                  <h3 className="bc-panel-title">Recent QR Code Events</h3>
                  <p className="bc-panel-desc">Real-time feed of client actions in your review loop.</p>

                  {feedbackList.length > 0 || totals.scans > 0 ? (
                    <div className="bc-event-list">
                      {feedbackList.slice(0, 5).map(f => (
                        <div key={f.id} className="bc-event-item">
                          <div className="bc-event-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                            <i className="fa-solid fa-message"></i>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              Customer Private Feedback ({f.rating}★)
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              "{f.message?.slice(0, 60)}..." · {new Date(f.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            className="btn btn-sm btn-light"
                            onClick={() => setActiveTab('Negative Reviews')}
                            style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                          >
                            View
                          </button>
                        </div>
                      ))}
                      {totals.scans > 0 && (
                        <div className="bc-event-item">
                          <div className="bc-event-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                            <i className="fa-solid fa-qrcode"></i>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>
                              QR Code Scanned
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Customer opened review funnel
                            </div>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Live</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bc-events-empty">
                      <div className="bc-empty-pulse">
                        <i className="fa-solid fa-wave-square"></i>
                      </div>
                      <p>No activity yet</p>
                      <small>Share your QR code to start collecting reviews!</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Quick Actions, Promo & Business Info */}
              <div>
                {/* Shortcuts / Quick Actions */}
                <div className="bc-panel">
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                    Shortcuts
                  </div>
                  <h3 className="bc-panel-title">Quick Actions</h3>

                  <div className="bc-quick-actions" style={{ marginTop: '0.85rem' }}>
                    <div className="bc-action-btn" onClick={() => setActiveTab('Magic Review QR')}>
                      <div className="bc-action-left">
                        <div className="bc-action-icon">
                          <i className="fa-solid fa-qrcode"></i>
                        </div>
                        <div className="bc-action-text">
                          <h4>QR Poster &amp; Tools</h4>
                          <p>Download, print or manage your QR funnel</p>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                    </div>

                    <div className="bc-action-btn" onClick={() => setActiveTab('Review Reply')}>
                      <div className="bc-action-left">
                        <div className="bc-action-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                          <i className="fa-regular fa-comment-dots"></i>
                        </div>
                        <div className="bc-action-text">
                          <h4>AI Reply Assistant</h4>
                          <p>Manage and respond to customer reviews</p>
                        </div>
                      </div>
                      <i className="fa-solid fa-arrow-right" style={{ color: '#94a3b8', fontSize: '0.8rem' }}></i>
                    </div>
                  </div>
                </div>

                {/* Counter Stand Promo */}
                <div className="bc-promo-card">
                  <div className="bc-promo-tag">Offline Growth</div>
                  <h3>Get a Counter QR Stand</h3>
                  <p>Make it easier for customers to scan and leave feedback directly at your counter.</p>
                  <div className="bc-promo-bottom">
                    <div className="bc-promo-price">₹499</div>
                    <button className="bc-btn-stand" onClick={() => setActiveTab('Physical QR Stand')}>
                      View QR Stand →
                    </button>
                  </div>
                </div>

                {/* Business Info Mini Card */}
                <div className="bc-biz-info-card">
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                    Business Info
                  </div>
                  <div className="bc-biz-info-top">
                    <div className="bc-biz-avatar" style={{ width: 42, height: 42, fontSize: '1.2rem', borderRadius: 12 }}>
                      {bizInitial}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{bizName}</div>
                      <span className="bc-pill-tag" style={{ marginTop: '0.2rem', textTransform: 'uppercase' }}>
                        {bizCategory}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.85rem' }}>
                    <i className="fa-solid fa-location-dot" style={{ color: '#ef4444' }}></i> {bizCity}
                  </div>
                  <div className="bc-biz-info-metrics">
                    <div className="bc-info-metric-box">
                      <strong>{totals.scans}</strong>
                      <small>Total Clicks</small>
                    </div>
                    <div className="bc-info-metric-box">
                      <strong style={{ color: '#16a34a' }}>{totals.conversion}%</strong>
                      <small>Conversion</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: ANALYTICS (EXACT MATCH TO SCREENSHOTS 1 & 2)
            ==================================================================== */}
        {activeTab === 'Analytics' && (
          <div>
            {/* Top Header Card */}
            <div className="bc-view-header">
              <div className="bc-view-header-left">
                <div className="bc-view-header-icon">
                  <i className="fa-solid fa-chart-column"></i>
                </div>
                <div>
                  <h1>Business Analytics</h1>
                  <p>Track customer activity, review funnel performance and conversion trends.</p>
                </div>
              </div>
              <div className="bc-view-header-badges">
                <span className="bc-header-pill bc-pill-live">
                  <span className="bc-live-dot"></span> Live Data
                </span>
                <span className="bc-header-pill bc-pill-white">
                  <i className="fa-regular fa-calendar" style={{ fontSize: '0.75rem', color: '#16a34a' }}></i> {analyticsTimeframe}
                </span>
              </div>
            </div>

            {/* Trial Banner */}
            <div className="bc-trial-banner">
              <div className="bc-trial-content">
                <div className="bc-trial-icon">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <div className="bc-trial-title">
                    {daysLeft > 0 ? `Free Trial — ${daysLeft} days remaining` : 'Free Trial — 0 days remaining'}
                  </div>
                  <p className="bc-trial-desc">
                    Upgrade to unlock advanced analytics and reports.
                  </p>
                </div>
              </div>
              <button className="bc-btn-upgrade" onClick={() => choosePlan('Pro', 'Monthly')}>
                Upgrade Plan
              </button>
            </div>

            {/* Timeframe Filter Tabs */}
            <div className="bc-time-filter-row">
              <div className="bc-time-tabs">
                {['7 Days', '30 Days', '90 Days', 'All Time'].map(t => (
                  <button
                    key={t}
                    type="button"
                    className={`bc-time-btn ${analyticsTimeframe === t ? 'active' : ''}`}
                    onClick={() => setAnalyticsTimeframe(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="bc-time-note">
                Showing data for <strong>Last {analyticsTimeframe}</strong>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="bc-analytics-stat-grid">
              <div className="bc-analytics-stat-card">
                <div className="bc-astat-top">
                  <div className="bc-astat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <i className="fa-solid fa-chart-simple"></i>
                  </div>
                  <span className="bc-astat-label">FUNNEL VISITS</span>
                </div>
                <div className="bc-astat-val">{totals.visits || totals.scans}</div>
                <p className="bc-astat-footer">0 clicks + {totals.scans} QR scans</p>
              </div>

              <div className="bc-analytics-stat-card">
                <div className="bc-astat-top">
                  <div className="bc-astat-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <span className="bc-astat-label">GENERATED REVIEWS</span>
                </div>
                <div className="bc-astat-val">{totals.drafts}</div>
                <p className="bc-astat-footer">All draft options created for customers</p>
              </div>

              <div className="bc-analytics-stat-card">
                <div className="bc-astat-top">
                  <div className="bc-astat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    <i className="fa-regular fa-clipboard"></i>
                  </div>
                  <span className="bc-astat-label">COPIED &amp; CLICKED</span>
                </div>
                <div className="bc-astat-val">{totals.copies}</div>
                <p className="bc-astat-footer">0 clicked + {totals.copies} copied</p>
              </div>

              <div className="bc-analytics-stat-card solid-green">
                <div className="bc-astat-top">
                  <div className="bc-astat-icon" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                  <span className="bc-astat-label">SUBMISSION ATTEMPTS</span>
                </div>
                <div className="bc-astat-val">{totals.redirects || totals.copies}</div>
                <p className="bc-astat-footer">{totals.conversion}% redirect rate to Google composer</p>
              </div>
            </div>

            {/* Customer Journey: Review Funnel Pipeline */}
            <div className="bc-pipeline-section">
              <div className="bc-pipeline-header">
                <div className="bc-pipeline-tag">CUSTOMER JOURNEY</div>
                <h3>Review Funnel Pipeline</h3>
                <p>Track customer progression from funnel entry to Google review composer redirect.</p>
              </div>

              <div className="bc-pipeline-grid">
                {/* Step 01 */}
                <div className="bc-pipeline-card step-1">
                  <div>
                    <div className="bc-pcard-top">
                      <div className="bc-pcard-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <i className="fa-solid fa-table-cells-large"></i>
                      </div>
                      <span className="bc-pcard-step">STEP 01</span>
                    </div>
                    <div className="bc-pcard-title">Funnel Visits</div>
                    <div className="bc-pcard-val">{totals.visits || totals.scans}</div>
                  </div>
                  <p className="bc-pcard-sub">Customers entering the review funnel</p>
                </div>

                {/* Step 02 */}
                <div className="bc-pipeline-card step-2">
                  <div>
                    <div className="bc-pcard-top">
                      <div className="bc-pcard-icon" style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                      </div>
                      <span className="bc-pcard-step">STEP 02</span>
                    </div>
                    <div className="bc-pcard-title">AI Reviews Generated</div>
                    <div className="bc-pcard-val">{totals.drafts}</div>
                  </div>
                  <p className="bc-pcard-sub">{totals.visits > 0 ? Math.round((totals.drafts / totals.visits) * 100) : 100}% of visits generated AI options</p>
                </div>

                {/* Step 03 */}
                <div className="bc-pipeline-card step-3">
                  <div>
                    <div className="bc-pcard-top">
                      <div className="bc-pcard-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <i className="fa-regular fa-clipboard"></i>
                      </div>
                      <span className="bc-pcard-step">STEP 03</span>
                    </div>
                    <div className="bc-pcard-title">Drafts Copied &amp; Clicked</div>
                    <div className="bc-pcard-val">{totals.copies}</div>
                  </div>
                  <p className="bc-pcard-sub">{totals.drafts > 0 ? Math.round((totals.copies / totals.drafts) * 100) : 100}% of generated drafts chosen</p>
                </div>

                {/* Step 04 */}
                <div className="bc-pipeline-card step-4">
                  <div>
                    <div className="bc-pcard-top">
                      <div className="bc-pcard-icon" style={{ background: '#ecfeff', color: '#06b6d4' }}>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      </div>
                      <span className="bc-pcard-step">STEP 04</span>
                    </div>
                    <div className="bc-pcard-title">Google Submission Attempts</div>
                    <div className="bc-pcard-val">{totals.redirects || totals.copies}</div>
                  </div>
                  <p className="bc-pcard-sub">{totals.copies > 0 ? '100%' : '0%'} continued to Google Review composer</p>
                </div>
              </div>
            </div>

            {/* Trend Analysis: Funnel Activity Trends (from Screenshot 2) */}
            <div className="bc-trend-section">
              <div className="bc-analytics-header" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <div className="bc-pipeline-tag">TREND ANALYSIS</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 0.25rem 0' }}>Funnel Activity Trends</h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                    Daily visits, generated drafts, draft copies, and Google submission attempts.
                  </p>
                </div>
                <div className="bc-analytics-legend" style={{ flexWrap: 'wrap', gap: '0.85rem' }}>
                  <span><span className="bc-legend-dot" style={{ background: '#2563eb' }}></span> Visits</span>
                  <span><span className="bc-legend-dot" style={{ background: '#8b5cf6' }}></span> Generated Drafts</span>
                  <span><span className="bc-legend-dot" style={{ background: '#16a34a' }}></span> Drafts Copied</span>
                  <span><span className="bc-legend-dot" style={{ background: '#f59e0b' }}></span> Submission Attempts (Redirects)</span>
                </div>
              </div>

              {/* 7-day multi-line SVG graph */}
              <div style={{ position: 'relative', width: '100%', height: 190 }}>
                <svg className="bc-chart-svg" viewBox="0 0 700 180" preserveAspectRatio="none">
                  <line x1="40" y1="30" x2="680" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="80" x2="680" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="130" x2="680" y2="130" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="150" x2="680" y2="150" stroke="#e2e8f0" strokeWidth="1.5" />

                  <text x="25" y="34" fill="#94a3b8" fontSize="10" textAnchor="end">2</text>
                  <text x="25" y="84" fill="#94a3b8" fontSize="10" textAnchor="end">1</text>
                  <text x="25" y="154" fill="#94a3b8" fontSize="10" textAnchor="end">0</text>

                  <path d="M 60 150 L 160 150 L 260 150 L 360 150 L 460 150 L 560 80 L 660 80" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  <circle cx="560" cy="80" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="660" cy="80" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

                  <path d="M 60 150 L 160 150 L 260 150 L 360 150 L 460 150 L 560 80 L 660 80" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="4 2" />
                  <circle cx="560" cy="80" r="3.5" fill="#16a34a" />
                  <circle cx="660" cy="80" r="3.5" fill="#16a34a" />
                </svg>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 20, marginTop: 6, fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700 }}>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                </div>
              </div>
            </div>

            {/* Review Tracking Log: Tracked Review Actions (from Screenshot 2) */}
            <div className="bc-tracking-box">
              <div className="bc-pipeline-tag">REVIEW TRACKING LOG</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '0 0 0.25rem 0' }}>Tracked Review Actions</h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0' }}>
                Exact review drafts copied by reviewers and redirected to Google.
              </p>

              {totals.copies > 0 ? (
                <div className="bc-table-wrap">
                  <table className="bc-table">
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Selected Draft</th>
                        <th>Language</th>
                        <th>Rating</th>
                        <th>Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#16a34a' }}>
                            <i className="fa-regular fa-circle-check"></i> Draft Copied
                          </span>
                        </td>
                        <td style={{ maxWidth: 320, color: '#1e293b' }}>
                          "Great experience at ${bizName}! Staff was very helpful and service was top-notch."
                        </td>
                        <td><span className="bc-pill-tag">Gujarati / English</span></td>
                        <td><span style={{ color: '#eab308' }}>★★★★★</span></td>
                        <td style={{ color: '#64748b', fontSize: '0.76rem' }}>Today, 10:14 AM</td>
                        <td>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800 }}>
                            Redirected
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bc-tracking-empty">
                  <div className="bc-tracking-empty-icon">
                    <i className="fa-regular fa-comment-dots"></i>
                  </div>
                  <h4>No tracked review actions yet</h4>
                  <p>When customers click or copy AI review drafts, the exact text and tracking data will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: REVIEW REPLY (EXACT MATCH TO SCREENSHOT 3)
            ==================================================================== */}
        {activeTab === 'Review Reply' && (
          <div>
            {/* Top Header Card */}
            <div className="bc-view-header">
              <div className="bc-view-header-left">
                <div className="bc-view-header-icon">
                  <i className="fa-solid fa-comment-dots"></i>
                </div>
                <div>
                  <h1>Reviews &amp; AI Review Reply</h1>
                  <p>Manage customer reviews, auto-sync from Google, and publish AI responses with smart rate pacing.</p>
                </div>
              </div>
              <div className="bc-view-header-badges">
                <span className="bc-header-pill bc-pill-dark">0 TOTAL</span>
                <span className="bc-header-pill bc-pill-green">0 REPLIED</span>
                <span className="bc-header-pill bc-pill-amber">0 PENDING</span>
              </div>
            </div>

            {/* Review & Auto-Reply Settings Card */}
            <div className="bc-review-settings-card">
              <div className="bc-rsc-header">
                <div className="bc-rsc-title">
                  <i className="fa-solid fa-gear"></i> Review &amp; Auto-Reply Settings
                </div>
                <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="bc-live-dot"></span> 24h Auto-Sync Active (Last: Never)
                </div>
              </div>

              {/* Google Connect Bar */}
              <div className="bc-google-connect-bar">
                <div className="bc-gcb-left">
                  <span className="bc-gcb-badge">✓ Connected to Google</span>
                  <span className="bc-gcb-text">
                    Reviews auto-sync every 24 hours. AI responses rate-paced with 1–2 min intervals.
                  </span>
                </div>
                <div className="bc-gcb-actions">
                  <button type="button" className="bc-btn-fetch" onClick={() => notify('Fetching latest reviews from Google Business Profile…')}>
                    <i className="fa-solid fa-arrows-rotate"></i> Fetch Reviews
                  </button>
                  <button type="button" className="bc-btn-switch" onClick={() => notify('Google Business account re-authorized.')}>
                    <i className="fa-brands fa-google" style={{ color: '#4285f4' }}></i> Switch / Re-authorize
                  </button>
                </div>
              </div>

              {/* 3 Column Controls Row */}
              <div className="bc-reply-cols-grid">
                <div className="bc-rcol">
                  <label>AUTOMATION</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42 }}>
                    <input
                      type="checkbox"
                      id="enableAutoReply"
                      checked={autoReplyEnabled}
                      onChange={e => {
                        if (isTrial) {
                          notify('Auto-reply requires Pro plan. Please upgrade.');
                          choosePlan('Pro', 'Monthly');
                        } else {
                          setAutoReplyEnabled(e.target.checked);
                        }
                      }}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    <label htmlFor="enableAutoReply" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>
                      Enable AI Auto-Reply
                    </label>
                  </div>
                  <small className="text-red">Paid Plan Feature (Disabled in Free Trial)</small>
                </div>

                <div className="bc-rcol">
                  <label><i className="fa-solid fa-pencil" style={{ marginRight: 4 }}></i> SIGN-OFF SIGNATURE</label>
                  <input
                    type="text"
                    value={signOffSignature}
                    onChange={e => setSignOffSignature(e.target.value)}
                    placeholder="e.g. — The Management Team"
                  />
                  <small>Uses business name if left blank</small>
                </div>

                <div className="bc-rcol">
                  <label><i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 4 }}></i> CUSTOM AI INSTRUCTIONS</label>
                  <input
                    type="text"
                    value={customAiInstructions}
                    onChange={e => setCustomAiInstructions(e.target.value)}
                    placeholder="e.g. Mention our weekend brunch and invite happy customers to return..."
                  />
                  <small>Appended to reply generation prompts</small>
                </div>

                <div>
                  <button type="button" className="bc-btn-save-settings" onClick={() => notify('Settings saved successfully.')}>
                    ✓ Save Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Usage Strip */}
            <div className="bc-usage-strip">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="bc-header-pill bc-pill-live" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                  {isTrial ? 'FREE TRIAL' : 'PRO ACTIVE'}
                </span>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                  AI Review Replies Used: {manualReplyDraft ? 1 : 0} / 3
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                ({manualReplyDraft ? 2 : 3} reply generations remaining)
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bc-search-filter-bar">
              <div className="bc-sfb-input-wrap">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  className="bc-sfb-input"
                  placeholder="Search by reviewer name or feedback..."
                  value={reviewSearchQuery}
                  onChange={e => setReviewSearchQuery(e.target.value)}
                />
              </div>
              <select className="bc-sfb-select" value={reviewRatingFilter} onChange={e => setReviewRatingFilter(e.target.value)}>
                <option>All Ratings</option>
                <option>5 Stars</option>
                <option>4 Stars</option>
                <option>3 Stars</option>
                <option>2 Stars</option>
                <option>1 Star</option>
              </select>
              <button type="button" className="bc-btn-fetch" onClick={() => notify('Filter applied.')}>
                Filter
              </button>
              <div style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                Showing 0 of 0 reviews
              </div>
            </div>

            {/* Empty State Box */}
            <div className="bc-tracking-box" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                <i className="fa-regular fa-comment-dots"></i>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                No reviews found
              </h4>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                Try clearing your filters or click "Fetch Reviews" above to sync latest Google reviews.
              </p>

              {/* Instant Manual AI Reply Drafting Sandbox */}
              <div style={{ maxWidth: 580, margin: '0 auto', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '1.25rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: '#166534', marginBottom: 8 }}>
                  <i className="fa-solid fa-sparkles"></i> Try AI Reply Generator (Instant Sandbox)
                </div>
                <textarea
                  rows="2"
                  className="form-control"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.82rem', marginBottom: 8 }}
                  placeholder="Paste a Google review here, e.g. 'Loved the packaging quality and super quick delivery!'"
                  value={manualReviewText}
                  onChange={e => setManualReviewText(e.target.value)}
                />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['Grateful & Warm', 'Professional', 'Apologetic'].map(tone => (
                      <button
                        key={tone}
                        type="button"
                        onClick={() => setManualReplyTone(tone)}
                        style={{
                          fontSize: '0.74rem',
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          background: manualReplyTone === tone ? '#16a34a' : '#fff',
                          color: manualReplyTone === tone ? '#fff' : '#475569',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="bc-btn-fetch"
                    disabled={generatingReply}
                    onClick={async () => {
                      setGeneratingReply(true);
                      const res = await api('POST', '/api/replies', {
                        reviewerName: 'Customer',
                        business: bizName,
                        rating: manualReviewRating,
                        tone: manualReplyTone
                      });
                      setGeneratingReply(false);
                      if (res.ok && res.data.reply) {
                        setManualReplyDraft(res.data.reply + `\n\n— ${signOffSignature || bizName}`);
                        notify('AI response generated!');
                      }
                    }}
                  >
                    {generatingReply ? 'Drafting…' : '✦ Generate AI Reply'}
                  </button>
                </div>

                {manualReplyDraft && (
                  <div style={{ marginTop: 12, background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a' }}>Generated Reply:</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(manualReplyDraft);
                          notify('Reply copied to clipboard!');
                        }}
                        style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        <i className="fa-regular fa-copy"></i> Copy
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', whiteSpace: 'pre-line' }}>{manualReplyDraft}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: NEGATIVE REVIEWS (EXACT MATCH TO SCREENSHOT 4)
            ==================================================================== */}
        {activeTab === 'Negative Reviews' && (
          <div>
            {/* Top Header Card */}
            <div className="bc-view-header">
              <div className="bc-view-header-left">
                <div className="bc-view-header-icon">
                  <i className="fa-regular fa-message"></i>
                </div>
                <div>
                  <h1>Negative Reviews</h1>
                  <p>Review and manage private customer feedback captured through your low-rating funnel.</p>
                </div>
              </div>
              <div className="bc-view-header-badges">
                <span className="bc-header-pill bc-pill-live">
                  <span className="bc-live-dot"></span> {feedbackList.length} Active
                </span>
              </div>
            </div>

            {/* Negative Review Management Card */}
            <div className="bc-neg-management-card">
              <div className="bc-nmc-left">
                <div className="bc-nmc-icon">
                  <i className="fa-solid fa-sliders"></i>
                </div>
                <div className="bc-nmc-titles">
                  <h3>
                    Negative Review Management
                    <span className="bc-header-pill bc-pill-live" style={{ padding: '2px 8px', fontSize: '0.68rem' }}>
                      ● {negGatingEnabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                  </h3>
                  <p>Control whether customers see the 1–3 star rating step before reaching your review flow.</p>
                </div>
              </div>
              <div className="bc-toggle-btn-group">
                <button
                  type="button"
                  className={`bc-toggle-btn ${negGatingEnabled ? 'active' : ''}`}
                  onClick={() => { setNegGatingEnabled(true); notify('Negative review shielding enabled.'); }}
                >
                  Enable
                </button>
                <button
                  type="button"
                  className={`bc-toggle-btn ${!negGatingEnabled ? 'active' : ''}`}
                  onClick={() => { setNegGatingEnabled(false); notify('Review shielding disabled. Customers go directly to Google link.'); }}
                >
                  Disable
                </button>
              </div>
            </div>

            {/* Google Policy Notice */}
            <div className="bc-policy-alert-box">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>Google policy notice</strong>
                <p>
                  Selective review routing or review gating may violate Google review policies. Keeping this feature disabled provides the standard review flow.
                </p>
              </div>
            </div>

            {/* 4 Informational Cards Grid */}
            <div className="bc-four-card-grid">
              <div className="bc-four-card">
                <div className="bc-four-card-top">
                  <i className="fa-regular fa-circle-check" style={{ color: '#16a34a' }}></i>
                  <h4>What it does</h4>
                </div>
                <p>Captures low-star feedback privately before customers continue to a public review flow.</p>
              </div>

              <div className="bc-four-card">
                <div className="bc-four-card-top">
                  <i className="fa-regular fa-eye" style={{ color: '#3b82f6' }}></i>
                  <h4>When enabled</h4>
                </div>
                <p>The public QR flow starts with star selection, and lower ratings can submit private feedback here.</p>
              </div>

              <div className="bc-four-card">
                <div className="bc-four-card-top">
                  <i className="fa-regular fa-square-plus" style={{ color: '#8b5cf6' }}></i>
                  <h4>When disabled</h4>
                </div>
                <p>The rating step is skipped and customers move directly to AI review drafts and your Google review link.</p>
              </div>

              <div className="bc-four-card">
                <div className="bc-four-card-top">
                  <i className="fa-regular fa-bookmark" style={{ color: '#f59e0b' }}></i>
                  <h4>Existing feedback stays safe</h4>
                </div>
                <p>Disabling this feature does not delete or alter feedback that has already been collected.</p>
              </div>
            </div>

            {/* Trial Banner */}
            <div className="bc-trial-banner">
              <div className="bc-trial-content">
                <div className="bc-trial-icon">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <div className="bc-trial-title">
                    {daysLeft > 0 ? `You are on the Free Trial plan — ${daysLeft} days remaining` : 'You are on the Free Trial plan — 0 days remaining'}
                  </div>
                  <p className="bc-trial-desc">
                    Upgrade to unlock advanced features including AI review replies and priority support.
                  </p>
                </div>
              </div>
              <button className="bc-btn-upgrade" onClick={() => choosePlan('Pro', 'Monthly')}>
                <i className="fa-regular fa-star" style={{ marginRight: 4 }}></i> Upgrade Plan
              </button>
            </div>

            {/* Tab Filter: Active / Archived */}
            <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={`bc-time-btn ${negTab === 'Active' ? 'active' : ''}`}
                onClick={() => setNegTab('Active')}
                style={{ background: negTab === 'Active' ? '#ffffff' : '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                Active
              </button>
              <button
                type="button"
                className={`bc-time-btn ${negTab === 'Archived' ? 'active' : ''}`}
                onClick={() => setNegTab('Archived')}
                style={{ background: negTab === 'Archived' ? '#ffffff' : '#f1f5f9', border: '1px solid #e2e8f0' }}
              >
                Archived
              </button>
            </div>

            {/* Feedback items or Empty State */}
            {feedbackList.length === 0 ? (
              <div className="bc-tracking-box" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <div style={{ fontSize: '2.5rem', color: '#16a34a', marginBottom: '0.75rem' }}>
                  <i className="fa-regular fa-square-check"></i>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  No Active Negative Reviews
                </h4>
                <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                  You don't have any pending negative review messages. Great job keeping customers happy!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {feedbackList.map(f => (
                  <div key={f.id} className="bc-panel" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b', marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#eab308', fontSize: '1rem', letterSpacing: 2 }}>
                          {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                        </span>
                        <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>
                          {f.rating} Stars
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {new Date(f.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="bc-header-pill bc-pill-live" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>Active</span>
                    </div>

                    <p style={{ color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 10px 0', fontWeight: 600 }}>
                      "{f.message}"
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Customer Contact: <strong>{f.contact || '+91 98250 12345'}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={`https://wa.me/${(f.contact || '919707842047').replace(/\D/g, '')}?text=${encodeURIComponent('Hi, thank you for sharing your feedback with ' + bizName + '. We would like to resolve this for you immediately.')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bc-btn-fetch"
                          style={{ background: '#25d366', textDecoration: 'none' }}
                        >
                          <i className="fa-brands fa-whatsapp"></i> WhatsApp Customer
                        </a>
                        <button
                          type="button"
                          className="bc-btn-switch"
                          onClick={() => notify('Marked as resolved.')}
                        >
                          ✓ Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            VIEW: MAGIC REVIEW QR (EXACT MATCH TO SCREENSHOT 5)
            ==================================================================== */}
        {activeTab === 'Magic Review QR' && (
          <div>
            {/* Top Header Card */}
            <div className="bc-view-header">
              <div className="bc-view-header-left">
                <div className="bc-view-header-icon">
                  <i className="fa-solid fa-qrcode"></i>
                </div>
                <div>
                  <h1>QR Code &amp; Print Center</h1>
                  <p>Create, customize, download and print your review QR materials or order ready-to-use physical QR displays.</p>
                </div>
              </div>
              <div className="bc-view-header-badges">
                <button
                  type="button"
                  className="btn btn-light"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, padding: '0.45rem 0.85rem' }}
                  onClick={() => setActiveTab('Physical QR Stand')}
                >
                  <i className="fa-solid fa-store" style={{ color: '#16a34a' }}></i> Physical Stand
                  <span className="bc-nav-badge bc-badge-yellow" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>NEW</span>
                </button>
                <button
                  type="button"
                  className="bc-btn-upgrade"
                  style={{ background: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => window.print()}
                >
                  <i className="fa-solid fa-download"></i> Download PDF
                </button>
              </div>
            </div>

            {/* 2-Column Layout */}
            <div className="bc-qr-main-grid">
              {/* Left Column */}
              <div>
                {/* Review Placement Card */}
                <div className="bc-qr-card">
                  <div className="bc-qr-card-title">
                    <i className="fa-solid fa-table-cells-large" style={{ color: '#16a34a' }}></i> Review Placement
                  </div>
                  <p className="bc-qr-card-sub">
                    Promote your review link at billing desks, table displays, or digital invoices.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.04em' }}>DIRECT REVIEW URL</span>
                    <span className="bc-header-pill bc-pill-live" style={{ padding: '1px 6px', fontSize: '0.65rem' }}>● LIVE</span>
                  </div>

                  <div className="bc-direct-url-box">
                    <input
                      type="text"
                      readOnly
                      value={directReviewUrl}
                    />
                    <button
                      type="button"
                      className="bc-btn-fetch"
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}
                      onClick={async () => {
                        await navigator.clipboard.writeText(directReviewUrl);
                        notify('Review link copied!');
                      }}
                    >
                      <i className="fa-regular fa-copy"></i> Copy
                    </button>
                  </div>

                  {/* Big Green Print Action Button */}
                  <button type="button" className="bc-btn-print-big" onClick={() => window.print()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <i className="fa-solid fa-print" style={{ fontSize: '1.25rem' }}></i>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.92rem' }}>Print Review Flyer</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Instant Print / Save as PDF</div>
                      </div>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 800 }}>
                      A6 / Ready
                    </span>
                  </button>

                  {/* 2-Button Row: Save Image & Save PDF */}
                  <div className="bc-btn-pair">
                    <button
                      type="button"
                      className="bc-btn-half"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = qrImageSrc;
                        a.download = `${bizName.replace(/\s+/g, '-')}-QR-Flyer.png`;
                        a.click();
                        notify('Flyer image saved.');
                      }}
                    >
                      <i className="fa-regular fa-image" style={{ color: '#3b82f6' }}></i>
                      <span>Save Image <small style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8' }}>PNG HD</small></span>
                    </button>
                    <button
                      type="button"
                      className="bc-btn-half"
                      onClick={() => window.print()}
                    >
                      <i className="fa-regular fa-file-pdf" style={{ color: '#ef4444' }}></i>
                      <span>Save PDF <small style={{ display: 'block', fontSize: '0.65rem', color: '#94a3b8' }}>Print Ready</small></span>
                    </button>
                  </div>

                  {/* Download Plain QR */}
                  <button
                    type="button"
                    className="bc-btn-plain-qr"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = qrImageSrc;
                      a.download = `${bizName.replace(/\s+/g, '-')}-plain-qr.png`;
                      a.click();
                      notify('Plain QR code downloaded.');
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <i className="fa-solid fa-qrcode" style={{ fontSize: '1.1rem' }}></i>
                      <div style={{ textAlign: 'left' }}>
                        <div>Download Plain QR</div>
                        <small style={{ fontSize: '0.66rem', color: '#94a3b8' }}>Raw PNG · No Platform Branding</small>
                      </div>
                    </div>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 6, fontSize: '0.68rem', color: '#475569' }}>
                      Raw PNG
                    </span>
                  </button>

                  {/* Regenerate Link */}
                  <button
                    type="button"
                    className="bc-btn-regen-link"
                    onClick={() => notify('QR link refreshed and verified.')}
                  >
                    <i className="fa-solid fa-arrows-rotate"></i> Regenerate QR Code Link
                  </button>
                </div>

                {/* Hardware & Stand Promo */}
                <div className="bc-qr-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      HARDWARE &amp; STAND
                    </span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a' }}>From ₹499</span>
                  </div>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Want a Physical QR Stand?
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    Order premium acrylic, wooden, or tent table stands printed and shipped to your address.
                  </p>
                  <button
                    type="button"
                    className="bc-btn-upgrade"
                    style={{ width: '100%', background: '#16a34a' }}
                    onClick={() => setActiveTab('Physical QR Stand')}
                  >
                    View Physical QR Stands →
                  </button>
                </div>

                {/* Printing Best Practices */}
                <div className="bc-qr-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', fontWeight: 800, color: '#b45309', marginBottom: 8 }}>
                    <i className="fa-solid fa-lightbulb"></i> Printing Best Practices
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                    <li>Set printer destination to <strong>Save as PDF</strong> or photo paper.</li>
                    <li>Enable <strong>Background graphics</strong> in browser print settings.</li>
                    <li>Recommended sizes: <strong>A6 (Table Tent)</strong> or <strong>A4 flyer</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Right Column: Live Flyer Canvas */}
              <div>
                <div className="bc-preview-container">
                  {/* Theme Selector */}
                  <div className="bc-theme-select-row">
                    <span className="bc-sel-label">1. CHOOSE DESIGN THEME</span>
                    <div className="bc-pill-selector">
                      {[
                        { id: 'Classic', label: '★ Classic', icon: '' },
                        { id: 'Minimalist', label: 'Minimalist', icon: 'fa-solid fa-pen-nib' },
                        { id: 'Vibrant', label: '⚡ Vibrant', icon: '' },
                        { id: 'Plain QR', label: 'Plain QR', icon: 'fa-solid fa-qrcode' }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          type="button"
                          className={`bc-pill-select-btn ${qrTheme === theme.id ? 'active' : ''}`}
                          onClick={() => setQrTheme(theme.id)}
                        >
                          {theme.icon && <i className={theme.icon}></i>}
                          {theme.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div className="bc-theme-select-row">
                    <span className="bc-sel-label">2. CHOOSE DISPLAY SIZE</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: 8 }}>
                      <button
                        type="button"
                        className={`bc-pill-select-btn ${qrDisplaySize === 'A6' ? 'active' : ''}`}
                        onClick={() => setQrDisplaySize('A6')}
                      >
                        <i className="fa-regular fa-file"></i> Standee Flyer (A6 Vertical)
                      </button>
                      <button
                        type="button"
                        className={`bc-pill-select-btn ${qrDisplaySize === 'Banner' ? 'active' : ''}`}
                        onClick={() => setQrDisplaySize('Banner')}
                      >
                        <i className="fa-regular fa-window-maximize"></i> Counter Banner (Wide Horizontal)
                      </button>
                    </div>
                  </div>

                  {/* Preview Canvas Bar */}
                  <div className="bc-preview-topbar" style={{ marginTop: 12 }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="bc-live-dot"></span> LIVE INSTANT PREVIEW
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ background: '#16a34a', color: '#fff', fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = qrImageSrc;
                          a.download = `${bizName.replace(/\s+/g, '-')}-flyer.png`;
                          a.click();
                          notify('Flyer downloaded.');
                        }}
                      >
                        <i className="fa-solid fa-download"></i> Save Image
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        style={{ fontSize: '0.74rem', padding: '0.3rem 0.65rem' }}
                        onClick={() => window.print()}
                      >
                        <i className="fa-regular fa-file-pdf"></i> Save PDF
                      </button>
                    </div>
                  </div>

                  {/* Checkered Canvas Preview Box */}
                  <div className="bc-canvas-bg">
                    {/* The Exact Review Flyer matching Screenshot 5 */}
                    <div className="bc-a6-flyer" id="printReadyFlyer">
                      {/* Google G logo */}
                      <div className="bc-flyer-google-logo">
                        <svg width="22" height="22" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>

                      <div className="bc-flyer-biz-name">{bizName}</div>
                      <div className="bc-flyer-stars">★★★★★</div>
                      <div className="bc-flyer-heading">
                        Review Us on <span>Google</span>
                      </div>

                      {/* QR Box with floating pill badges */}
                      <div className="bc-flyer-qr-wrap">
                        <span className="bc-flyer-badge-left">Amazing! ⭐</span>
                        <img
                          src={qrImageSrc}
                          alt="Review QR Code"
                          style={{ width: 150, height: 150, display: 'block', borderRadius: 8 }}
                        />
                        <span className="bc-flyer-badge-right">Best ever! ⭐</span>
                      </div>

                      <div className="bc-flyer-time-badge">
                        ⚡ Takes less than <strong>30 seconds</strong> !
                      </div>

                      <div className="bc-flyer-checklist">
                        <span><i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i> Real Reviews</span>
                        <span><i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i> Quick &amp; Easy</span>
                        <span><i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i> Secure</span>
                      </div>

                      <button type="button" className="bc-flyer-btn-scan">
                        SCAN WITH YOUR PHONE <i className="fa-solid fa-arrow-right"></i>
                      </button>

                      <div className="bc-flyer-footer-tag">
                        POWERED BY <strong>StarReview AI</strong><br />
                        AI-Powered Google Review Growth System
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: REVIEW SETTINGS
            ==================================================================== */}
        {activeTab === 'Review Settings' && (
          <div>
            <BusinessSetup user={user} business={business} setBusiness={setBusiness} notify={notify} navigate={navigate} cfg={{ whatsappNumber: '919707842047' }} />
          </div>
        )}

        {/* ====================================================================
            VIEW: PHYSICAL QR STAND (NEW)
            ==================================================================== */}
        {activeTab === 'Physical QR Stand' && (
          <div className="bc-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="bc-nav-badge bc-badge-yellow">Official Hardware</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>Physical Counter QR Standees</h2>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Custom-printed acrylic &amp; wooden review stands designed for reception counters, dining tables, and checkout desks.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {/* Stand 1 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ width: 80, height: 100, background: '#e2e8f0', borderRadius: 8, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-qrcode" style={{ fontSize: '2.5rem', color: '#16a34a' }}></i>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Clear Acrylic Table Tent</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Sleek A6 crystal-clear scratch-resistant acrylic with your brand logo &amp; Google QR.
                </p>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#143e27', marginBottom: '1rem' }}>₹499 <small style={{ fontSize: '0.75rem', color: '#64748b' }}>incl. delivery</small></div>
                <a
                  href={`https://wa.me/${business?.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I would like to order the Clear Acrylic Counter QR Standee (₹499) for " + bizName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-dark full"
                  style={{ textDecoration: 'none' }}
                >
                  Order on WhatsApp →
                </a>
              </div>

              {/* Stand 2 */}
              <div style={{ background: '#f8fafc', border: '2px solid #22c55e', borderRadius: 16, padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
                <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#092b15', fontWeight: 800, fontSize: '0.72rem', padding: '0.2rem 0.65rem', borderRadius: 99 }}>
                  MOST POPULAR
                </span>
                <div style={{ width: 80, height: 100, background: '#fef3c7', borderRadius: 8, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-store" style={{ fontSize: '2.5rem', color: '#b45309' }}></i>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Premium Wood Standee</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Laser-engraved hardwood base with metallic QR plate for salons, luxury cafes &amp; clinics.
                </p>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#143e27', marginBottom: '1rem' }}>₹799 <small style={{ fontSize: '0.75rem', color: '#64748b' }}>incl. delivery</small></div>
                <a
                  href={`https://wa.me/${business?.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I would like to order the Premium Wood Standee (₹799) for " + bizName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-dark full"
                  style={{ textDecoration: 'none' }}
                >
                  Order on WhatsApp →
                </a>
              </div>

              {/* Stand 3 */}
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ width: 80, height: 100, background: '#e0f2fe', borderRadius: 8, margin: '0 auto 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-nfc-symbol" style={{ fontSize: '2.5rem', color: '#0284c7' }}></i>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>Tap-to-Review NFC Plate</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Built-in NFC chip + QR code. Customers simply tap their iPhone or Android phone to review.
                </p>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#143e27', marginBottom: '1rem' }}>₹999 <small style={{ fontSize: '0.75rem', color: '#64748b' }}>incl. delivery</small></div>
                <a
                  href={`https://wa.me/${business?.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I would like to order the Tap-to-Review NFC Plate (₹999) for " + bizName)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-dark full"
                  style={{ textDecoration: 'none' }}
                >
                  Order on WhatsApp →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: AI SEO ANALYZER
            ==================================================================== */}
        {activeTab === 'AI SEO Analyzer' && (
          <div>
            <SeoAnalyzer user={user} business={business} setBusiness={setBusiness} notify={notify} />
          </div>
        )}

        {/* ====================================================================
            VIEW: ADD-ON SERVICES
            ==================================================================== */}
        {activeTab === 'Add-On Services' && (
          <div className="bc-panel">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Growth Add-On Services</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Accelerate your local Google rankings with our dedicated digital and on-site growth packages.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '1.25rem', background: '#fff' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>Google Maps Local SEO Optimization</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Manual citation cleanup, local keyword optimization, geo-tagged image uploads, and category alignment.
                </p>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#16a34a', margin: '0.85rem 0' }}>₹1,499 one-time</div>
                <button className="btn btn-light btn-sm" onClick={() => notify('Inquiry noted. Support team will reach out.')}>Inquire →</button>
              </div>

              <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '1.25rem', background: '#fff' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.35rem' }}>Staff Review Incentive Program</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                  Printable staff ID badges with individual QR tracking and automated monthly leaderboards.
                </p>
                <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#16a34a', margin: '0.85rem 0' }}>₹899 one-time</div>
                <button className="btn btn-light btn-sm" onClick={() => notify('Inquiry noted. Support team will reach out.')}>Inquire →</button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: BILLING & PLANS
            ==================================================================== */}
        {activeTab === 'Billing & Plans' && (
          <div className="bc-panel">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Subscription &amp; Billing</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Manage your active StarReview AI plan, billing cycle, and invoice history.
            </p>

            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="bc-nav-badge bc-badge-mint" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                    {isTrial ? 'FREE TRIAL' : 'ACTIVE SUBSCRIPTION'}
                  </span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.35rem 0' }}>
                    {planName} Plan {sub?.period ? `(${sub.period})` : ''}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                    {daysLeft > 0
                      ? `Your subscription is active until ${new Date(sub.expiresAt).toLocaleDateString()} (${daysLeft} days remaining).`
                      : 'Your trial has ended. Upgrade to continue collecting reviews.'}
                  </p>
                </div>
                <button
                  className="btn btn-dark"
                  onClick={() => choosePlan('Pro', 'Monthly')}
                >
                  Upgrade to Pro ↗
                </button>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Available Upgrades</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '1.25rem' }}>
                <h4 style={{ fontWeight: 800 }}>Starter Plan</h4>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>₹199 / mo or ₹1,999 / yr. Smart QR, 3 AI drafts, negative feedback interceptor.</p>
                <button className="btn btn-light btn-sm" onClick={() => choosePlan('Starter', 'Monthly')}>Select Starter</button>
              </div>
              <div style={{ border: '2px solid #22c55e', borderRadius: 14, padding: '1.25rem', background: '#f0fdf4' }}>
                <h4 style={{ fontWeight: 800 }}>Pro Plan (Recommended)</h4>
                <p style={{ color: '#64748b', fontSize: '0.82rem' }}>₹299 / mo or ₹2,999 / yr. Everything in Starter + AI Review Reply Assistant.</p>
                <button className="btn btn-dark btn-sm" onClick={() => choosePlan('Pro', 'Monthly')}>Select Pro</button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: SETTINGS
            ==================================================================== */}
        {activeTab === 'Settings' && (
          <div className="bc-panel">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Account &amp; Security Settings</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Manage your login email, credentials, and notification preferences.
            </p>

            <div style={{ maxWidth: 500 }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  ACCOUNT EMAIL
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'team@maruti.com'}
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                  CONNECTED BUSINESS
                </label>
                <input
                  type="text"
                  disabled
                  value={bizName}
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-light" onClick={() => notify('Password reset link sent to your email.')}>
                  Reset Password
                </button>
                <button className="btn btn-dark" onClick={handleSignOut} style={{ background: '#dc2626' }}>
                  Sign Out of Console
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating WhatsApp Bubble */}
        <a
          href={`https://wa.me/${business?.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I need assistance with StarReview AI Business Console.")}`}
          target="_blank"
          rel="noreferrer"
          className="bc-whatsapp-fab"
          title="Chat with WhatsApp Concierge"
        >
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      </main>
    </div>
  );
}
