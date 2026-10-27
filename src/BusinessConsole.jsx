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
            VIEW: ANALYTICS (DEEP DIVE)
            ==================================================================== */}
        {activeTab === 'Analytics' && (
          <div className="bc-panel">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Reputation Analytics</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Deep insights into customer review engagement, scan timing, and conversion ratios.
            </p>
            <div className="bc-stats-grid" style={{ marginBottom: '2rem' }}>
              <div className="bc-stat-card">
                <div className="bc-stat-label">Total Funnel Scans</div>
                <div className="bc-stat-val">{totals.scans}</div>
                <p className="bc-stat-sub">Lifetime QR impressions</p>
              </div>
              <div className="bc-stat-card">
                <div className="bc-stat-label">Drafts Generated</div>
                <div className="bc-stat-val">{totals.drafts}</div>
                <p className="bc-stat-sub">AI reviews created</p>
              </div>
              <div className="bc-stat-card">
                <div className="bc-stat-label">Reviews Copied</div>
                <div className="bc-stat-val">{totals.copies}</div>
                <p className="bc-stat-sub">Sent to Google Maps</p>
              </div>
              <div className="bc-stat-card solid-green">
                <div className="bc-stat-label">Overall Conversion</div>
                <div className="bc-stat-val">{totals.conversion}%</div>
                <p className="bc-stat-sub">Scan to Review ratio</p>
              </div>
            </div>
            <button className="btn btn-dark" onClick={() => notify('Analytics CSV report exported.')}>
              Export Analytics CSV ↓
            </button>
          </div>
        )}

        {/* ====================================================================
            VIEW: REVIEW REPLY
            ==================================================================== */}
        {activeTab === 'Review Reply' && (
          <div>
            <ReplyAssistant user={user} notify={notify} navigate={navigate} />
          </div>
        )}

        {/* ====================================================================
            VIEW: NEGATIVE REVIEWS (FEEDBACK SHIELD)
            ==================================================================== */}
        {activeTab === 'Negative Reviews' && (
          <div className="bc-panel">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Private Feedback Inbox</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Customer ratings of 1 to 3 stars are routed here privately before reaching Google. Contact customers directly to resolve their concerns.
            </p>

            {feedbackList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: 16 }}>
                <i className="fa-regular fa-circle-check" style={{ fontSize: '3rem', color: '#16a34a', marginBottom: '1rem', display: 'block' }}></i>
                <h4 style={{ fontWeight: 800, marginBottom: '0.35rem' }}>All Clean! No Negative Feedback</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>When a customer leaves 1–3 stars, their private feedback will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {feedbackList.map(f => (
                  <div key={f.id} style={{ background: '#fff', border: '1.5px solid #fde68a', borderRadius: 14, padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.6rem', borderRadius: 8, fontWeight: 900, fontSize: '0.85rem' }}>
                          {'★'.repeat(f.rating)} ({f.rating}/5)
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(f.createdAt).toLocaleDateString()}</span>
                      </div>
                      {f.contact && (
                        <a
                          href={`https://wa.me/${f.contact.replace(/\D/g, '')}?text=${encodeURIComponent('Hi, thank you for sharing your feedback with ' + bizName + '. We would like to make this right.')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm"
                          style={{ background: '#25d366', color: '#fff', fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <i className="fa-brands fa-whatsapp"></i> WhatsApp Customer
                        </a>
                      )}
                    </div>
                    <p style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>"{f.message}"</p>
                    {f.contact && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Contact info: <strong>{f.contact}</strong></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            VIEW: MAGIC REVIEW QR
            ==================================================================== */}
        {activeTab === 'Magic Review QR' && (
          <div>
            <QrFlyer business={business} cfg={{ whatsappNumber: business?.whatsappNumber || '919707842047' }} notify={notify} navigate={navigate} initialMode="funnel" />
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
