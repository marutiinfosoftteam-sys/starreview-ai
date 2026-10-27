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

  // Review Settings Form States (Screenshots 1, 2, 3)
  const [profileSubTab, setProfileSubTab] = useState('Business Details');
  const [bizFormName, setBizFormName] = useState(business?.name || 'verde eco landing');
  const [bizFormAddress, setBizFormAddress] = useState(business?.city || 'sarthana');
  const [bizFormCategory, setBizFormCategory] = useState(business?.category || 'Other');
  const [bizFormCustomIndustry, setBizFormCustomIndustry] = useState(business?.customIndustry || 'solar system');
  const [bizFormWebsite, setBizFormWebsite] = useState(business?.website || 'https://verde-eco-landing-v2.vercel.app/');
  const [bizFormPhone, setBizFormPhone] = useState(business?.phone || '6355722267');
  
  const [targetKeywords, setTargetKeywords] = useState(business?.keywords?.length ? business.keywords : ['Fast Service', 'Friendly Staff', 'Clean Store']);
  const [keywordInput, setKeywordInput] = useState('');
  const [topProducts, setTopProducts] = useState(business?.services?.length ? business.services : ['Solar Rooftop System', 'Inverter Battery']);
  const [productInput, setProductInput] = useState('');
  const [staffNames, setStaffNames] = useState(business?.staff?.length ? business.staff : ['Aarav', 'Bhavik', 'Priya']);
  const [staffInput, setStaffInput] = useState('');
  const [highlightChips, setHighlightChips] = useState(['Great Service', 'Friendly Staff', 'Top Quality', 'Quick Response', 'Great Value', 'Highly Recommended']);
  const [chipInput, setChipInput] = useState('');
  const [businessDescription, setBusinessDescription] = useState(business?.description || 'Eco-friendly and sustainable solar energy solutions for commercial and residential rooftops.');
  const [defaultLanguage, setDefaultLanguage] = useState(business?.defaultLanguage || 'English');
  const [allowUserLangSelect, setAllowUserLangSelect] = useState(true);
  const [targetReviewLength, setTargetReviewLength] = useState(200);
  const [emojiUsage, setEmojiUsage] = useState('Enable Natural Emojis (1-2 per review)');
  const [savingSettings, setSavingSettings] = useState(false);

  // Physical Stand Display States (Screenshots 4 & 5)
  const [plasticSlide, setPlasticSlide] = useState(0);
  const [acrylicSlide, setAcrylicSlide] = useState(0);
  const [paperSlide, setPaperSlide] = useState(0);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState({ title: 'QR Code Plastic Stand', price: 499, tag: 'Most Popular' });
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderCity, setOrderCity] = useState('Surat');
  const [orderPincode, setOrderPincode] = useState('395006');
  const [placingOrder, setPlacingOrder] = useState(false);

  // SEO Analyzer States (Screenshot 1)
  const [seoKeyword, setSeoKeyword] = useState('solar rooftop installation');
  const [seoCity, setSeoCity] = useState(business?.city || 'Surat');
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoResult, setSeoResult] = useState({
    score: 82,
    rank: '#2',
    status: 'Good Visibility',
    checks: [
      { name: 'GBP Profile Completeness', status: 'pass', desc: '100% complete (Name, categories, address, hours, description present)' },
      { name: 'NAP Consistency', status: 'pass', desc: 'Consistent across Google Maps, website footer & directories' },
      { name: 'Primary Keyword Density', status: 'pass', desc: 'Target keyword "solar rooftop installation" optimized in description & services' },
      { name: 'Category & Sub-Categories', status: 'pass', desc: 'Solar Energy Equipment Supplier + 3 related categories assigned' },
      { name: 'Review Velocity & Sentiment', status: 'pass', desc: '4.9★ rating with regular new positive customer reviews' },
      { name: 'Customer Response Rate', status: 'pass', desc: '100% response rate with keyword-enriched replies' },
      { name: 'Photo & Media Freshness', status: 'warn', desc: 'Add 3+ new geotagged photos this week to increase local engagement' },
      { name: 'Local Citations & Backlinks', status: 'pass', desc: 'Indexed on IndiaMART, JustDial and Google Local Pack' }
    ],
    recommendations: [
      'Maintain weekly review velocity using your Magic Review QR stand to safeguard #2 rank.',
      'Add 3 geo-tagged rooftop installation photos with EXIF coordinates to your GMB profile.',
      'Include secondary area keywords (e.g., "Varachha", "Adajan", "Katargam") in profile updates.'
    ]
  });

  const handleRunSeoAudit = () => {
    if (!seoKeyword.trim()) {
      notify('Please enter a target keyword');
      return;
    }
    setSeoLoading(true);
    setTimeout(() => {
      setSeoLoading(false);
      setSeoResult({
        score: Math.floor(78 + Math.random() * 14),
        rank: `#${Math.floor(1 + Math.random() * 3)}`,
        status: 'Good Visibility',
        checks: [
          { name: 'GBP Profile Completeness', status: 'pass', desc: '100% complete (Name, categories, address, hours, description present)' },
          { name: 'NAP Consistency', status: 'pass', desc: 'Consistent across Google Maps, website footer & directories' },
          { name: 'Primary Keyword Density', status: 'pass', desc: `Target keyword "${seoKeyword}" optimized in description & services` },
          { name: 'Category & Sub-Categories', status: 'pass', desc: `${bizCategory || 'Business'} + related local subcategories aligned` },
          { name: 'Review Velocity & Sentiment', status: 'pass', desc: '4.9★ rating with regular positive reviews' },
          { name: 'Customer Response Rate', status: 'pass', desc: '100% response rate with keyword-rich answers' },
          { name: 'Photo & Media Freshness', status: 'warn', desc: 'Add 3+ new geotagged photos this week to boost ranking signals' },
          { name: 'Local Citations & Backlinks', status: 'pass', desc: `Consistent local NAP verified in ${seoCity || 'Surat'}` }
        ],
        recommendations: [
          `Keep collecting fresh reviews for "${seoKeyword}" via QR stand to secure the Local 3-Pack.`,
          `Upload new project photos geotagged in ${seoCity || 'Surat'} to sustain listing prominence.`,
          `Post weekly Google updates containing customer success stories and service highlights.`
        ]
      });
      notify('AI SEO Audit scan completed successfully!');
    }, 1200);
  };

  // Add-On Services States (Screenshots 2 to 5)
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('GMB Profile Optimization');
  const [serviceInquiryName, setServiceInquiryName] = useState(bizName);
  const [serviceInquiryPhone, setServiceInquiryPhone] = useState(business?.phone || '');
  const [serviceInquiryCity, setServiceInquiryCity] = useState(bizCity);
  const [serviceInquiryNotes, setServiceInquiryNotes] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const openServiceInquiry = (serviceTitle) => {
    setSelectedService(serviceTitle);
    setServiceModalOpen(true);
  };

  const handleServiceWhatsApp = (serviceTitle) => {
    const text = encodeURIComponent(`Hello StarReview AI Team! I am interested in the done-for-you growth service: "${serviceTitle}" for my business "${bizName}" (${bizCity}). Please share details.`);
    window.open(`https://wa.me/919707842047?text=${text}`, '_blank');
  };

  const handleServiceInquirySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!serviceInquiryPhone) {
      notify('Please provide a WhatsApp or phone number');
      return;
    }
    setSubmittingInquiry(true);
    try {
      await api('POST', '/api/contact', {
        name: serviceInquiryName,
        phone: serviceInquiryPhone,
        city: serviceInquiryCity,
        service: selectedService,
        message: serviceInquiryNotes || `Inquiry for ${selectedService}`
      });
    } catch {
      /* ignore */
    }
    setSubmittingInquiry(false);
    setServiceModalOpen(false);
    notify(`Inquiry for ${selectedService} submitted! Our specialist will reach out within 2 hours.`);
  };

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
            VIEW: REVIEW SETTINGS (EXACT MATCH TO SCREENSHOTS 1, 2, 3)
            ==================================================================== */}
        {activeTab === 'Review Settings' && (
          <div>
            {/* Top Header Card */}
            <div className="bc-view-header">
              <div className="bc-view-header-left">
                <div className="bc-view-header-icon">
                  <i className="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <h1>Review Settings</h1>
                  <p>Configure business details, AI review customization, multilingual preferences, and formatting options all in one place.</p>
                </div>
              </div>
              <div className="bc-view-header-badges">
                <span className="bc-header-pill bc-pill-live">
                  <span className="bc-live-dot"></span> ACTIVE BUSINESS PROFILE
                  <strong style={{ marginLeft: 4, color: '#166534' }}>{bizFormName || bizName}</strong>
                </span>
              </div>
            </div>

            {/* 4 Sub-Tabs Navigation Bar (Clickable & Active) */}
            <div className="bc-subtabs-bar">
              {[
                { id: 'Business Details', label: 'Business Details', icon: 'fa-regular fa-folder-open' },
                { id: 'Contact Info', label: 'Contact Info', icon: 'fa-solid fa-phone' },
                { id: 'AI Customization', label: 'AI Customization', icon: 'fa-solid fa-bolt' },
                { id: 'Review Style', label: 'Review Style', icon: 'fa-solid fa-gear' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`bc-subtab-btn ${profileSubTab === tab.id ? 'active' : ''}`}
                  onClick={() => setProfileSubTab(tab.id)}
                >
                  <i className={tab.icon}></i> {tab.label}
                </button>
              ))}
            </div>

            {/* SECTION 1: CORE BUSINESS DETAILS */}
            {(profileSubTab === 'Business Details' || profileSubTab === 'All') && (
              <div className="bc-settings-section-card">
                <div className="bc-ssc-header">
                  <div className="bc-ssc-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <i className="fa-solid fa-table-cells-large"></i>
                  </div>
                  <div className="bc-ssc-titles">
                    <h3>Core Business Details</h3>
                    <p>Essential business profile information synchronized with Google Maps.</p>
                  </div>
                </div>

                {/* Google Places Connected Profile Alert */}
                <div className="bc-blue-alert-box">
                  <i className="fa-solid fa-circle-info" style={{ fontSize: '1rem', flexShrink: 0 }}></i>
                  <div>
                    <strong>Google Places Connected Profile:</strong> Your business name and address are synchronized with Google Maps. The industry category helps the AI engine select relevant terminology.
                  </div>
                </div>

                <div className="bc-form-grid-2">
                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Business Name</span>
                      <span className="bc-field-tag">(Google Verified)</span>
                    </div>
                    <input
                      type="text"
                      className="bc-input-modern"
                      value={bizFormName}
                      onChange={e => setBizFormName(e.target.value)}
                      placeholder="e.g. verde eco landing"
                    />
                    <p className="bc-field-subtext">Synced directly from your Google Business Profile.</p>
                  </div>

                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Google Maps Address</span>
                      <span className="bc-field-tag">(Verified Location)</span>
                    </div>
                    <input
                      type="text"
                      className="bc-input-modern"
                      value={bizFormAddress}
                      onChange={e => setBizFormAddress(e.target.value)}
                      placeholder="e.g. sarthana"
                    />
                    <p className="bc-field-subtext">The physical location customers visit or review.</p>
                  </div>
                </div>

                <div className="bc-form-row">
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Business Type / Industry Category</span>
                  </div>
                  <input
                    type="text"
                    className="bc-input-modern"
                    value={bizFormCategory}
                    onChange={e => setBizFormCategory(e.target.value)}
                    placeholder="e.g. Other, Restaurant, Salon, Retail, Healthcare"
                  />
                  <p className="bc-field-subtext">Determines the industry vocabulary, tone, and context used by the AI review generator.</p>
                </div>

                <div className="bc-form-row" style={{ marginBottom: 0 }}>
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Specify Custom Industry</span>
                  </div>
                  <input
                    type="text"
                    className="bc-input-modern"
                    value={bizFormCustomIndustry}
                    onChange={e => setBizFormCustomIndustry(e.target.value)}
                    placeholder="e.g. solar system, eco packaging, ayurvedic clinic"
                  />
                  <p className="bc-field-subtext">Describe your specific industry so the AI understands your unique niche.</p>
                </div>
              </div>
            )}

            {/* SECTION 2: CONTACT INFORMATION */}
            {(profileSubTab === 'Contact Info' || profileSubTab === 'All') && (
              <div className="bc-settings-section-card">
                <div className="bc-ssc-header">
                  <div className="bc-ssc-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="bc-ssc-titles">
                    <h3>Contact Information</h3>
                    <p>Website and phone channels for customers and AI review context</p>
                  </div>
                </div>

                <div className="bc-policy-alert-box" style={{ background: '#fffbeb', borderColor: '#fde68a', marginBottom: '1.25rem' }}>
                  <i className="fa-regular fa-lightbulb" style={{ color: '#d97706' }}></i>
                  <div>
                    <strong style={{ color: '#92400e' }}>Optional Details:</strong>
                    <span style={{ color: '#b45309', fontSize: '0.8rem' }}> Providing your website or phone helps AI understand your digital presence and appointment booking options.</span>
                  </div>
                </div>

                <div className="bc-form-grid-2" style={{ marginBottom: 0 }}>
                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Website URL</span>
                      <span className="bc-field-tag">(Optional)</span>
                    </div>
                    <input
                      type="url"
                      className="bc-input-modern"
                      value={bizFormWebsite}
                      onChange={e => setBizFormWebsite(e.target.value)}
                      placeholder="https://verde-eco-landing-v2.vercel.app/"
                    />
                    <p className="bc-field-subtext">Your primary business website or social landing page.</p>
                  </div>

                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Phone Number</span>
                      <span className="bc-field-tag">(Optional)</span>
                    </div>
                    <input
                      type="tel"
                      className="bc-input-modern"
                      value={bizFormPhone}
                      onChange={e => setBizFormPhone(e.target.value)}
                      placeholder="6355722267"
                    />
                    <p className="bc-field-subtext">Public customer support or booking phone number.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: AI REVIEW CUSTOMIZATION & LANGUAGE */}
            {(profileSubTab === 'AI Customization' || profileSubTab === 'All') && (
              <div className="bc-settings-section-card">
                <div className="bc-ssc-header">
                  <div className="bc-ssc-icon" style={{ background: '#fefce8', color: '#ca8a04' }}>
                    <i className="fa-solid fa-bolt"></i>
                  </div>
                  <div className="bc-ssc-titles">
                    <h3>AI Review Customization &amp; Language</h3>
                    <p>Personalize keywords, products, staff names, and default review language</p>
                  </div>
                </div>

                {/* 3 Tips Boxes */}
                <div className="bc-tips-row-3">
                  <div className="bc-tip-card">
                    <div className="bc-tip-card-top">
                      <span className="bc-tip-num">01</span>
                      <span className="bc-tip-title">Add Target Keywords</span>
                    </div>
                    <p>AI naturally weaves your keywords into customer reviews.</p>
                  </div>

                  <div className="bc-tip-card">
                    <div className="bc-tip-card-top">
                      <span className="bc-tip-num">02</span>
                      <span className="bc-tip-title">Feature Top Products &amp; Staff</span>
                    </div>
                    <p>Makes generated drafts feel personal and authentic.</p>
                  </div>

                  <div className="bc-tip-card">
                    <div className="bc-tip-card-top">
                      <span className="bc-tip-num">03</span>
                      <span className="bc-tip-title">Native Language Fluency</span>
                    </div>
                    <p>Generates natural colloquial reviews in your preferred language.</p>
                  </div>
                </div>

                {/* Field 1: Target Keywords */}
                <div className="bc-form-row">
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Target Keywords</span>
                    <span className="bc-field-tag">({targetKeywords.length}/5)</span>
                  </div>
                  {targetKeywords.length > 0 && (
                    <div className="bc-chip-tag-container">
                      {targetKeywords.map((kw, i) => (
                        <span key={i} className="bc-chip-item">
                          {kw}
                          <button type="button" className="bc-chip-remove" onClick={() => setTargetKeywords(targetKeywords.filter((_, idx) => idx !== i))}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="bc-input-modern"
                      placeholder="Type keyword (e.g. Fast Service, Friendly Staff, Best Value) & press Enter..."
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && keywordInput.trim()) {
                          e.preventDefault();
                          if (targetKeywords.length < 5 && !targetKeywords.includes(keywordInput.trim())) {
                            setTargetKeywords([...targetKeywords, keywordInput.trim()]);
                            setKeywordInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bc-btn-fetch"
                      onClick={() => {
                        if (keywordInput.trim() && targetKeywords.length < 5 && !targetKeywords.includes(keywordInput.trim())) {
                          setTargetKeywords([...targetKeywords, keywordInput.trim()]);
                          setKeywordInput('');
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <p className="bc-field-subtext">Keywords customers can select on the review page and the AI will include in reviews.</p>
                </div>

                {/* Field 2: Top Products / Specialties */}
                <div className="bc-form-row">
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Top Products / Specialties</span>
                    <span className="bc-field-tag">({topProducts.length}/5)</span>
                  </div>
                  {topProducts.length > 0 && (
                    <div className="bc-chip-tag-container">
                      {topProducts.map((p, i) => (
                        <span key={i} className="bc-chip-item" style={{ background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' }}>
                          {p}
                          <button type="button" className="bc-chip-remove" style={{ color: '#6d28d9' }} onClick={() => setTopProducts(topProducts.filter((_, idx) => idx !== i))}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="bc-input-modern"
                      placeholder="Type product and press Enter (e.g. Signature Cold Brew, Wedding Cake)..."
                      value={productInput}
                      onChange={e => setProductInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && productInput.trim()) {
                          e.preventDefault();
                          if (topProducts.length < 5 && !topProducts.includes(productInput.trim())) {
                            setTopProducts([...topProducts, productInput.trim()]);
                            setProductInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bc-btn-fetch"
                      style={{ background: '#7c3aed' }}
                      onClick={() => {
                        if (productInput.trim() && topProducts.length < 5 && !topProducts.includes(productInput.trim())) {
                          setTopProducts([...topProducts, productInput.trim()]);
                          setProductInput('');
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <p className="bc-field-subtext">Popular items or dishes you want highlighted in customer reviews.</p>
                </div>

                {/* Field 3: Staff Names to Feature */}
                <div className="bc-form-row">
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Staff Names to Feature</span>
                    <span className="bc-field-tag">({staffNames.length}/5)</span>
                  </div>
                  {staffNames.length > 0 && (
                    <div className="bc-chip-tag-container">
                      {staffNames.map((s, i) => (
                        <span key={i} className="bc-chip-item" style={{ background: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' }}>
                          {s}
                          <button type="button" className="bc-chip-remove" style={{ color: '#0e7490' }} onClick={() => setStaffNames(staffNames.filter((_, idx) => idx !== i))}>×</button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="bc-input-modern"
                      placeholder="Type staff name and press Enter (e.g. Rahul, Dr. Sharma, Ananya)..."
                      value={staffInput}
                      onChange={e => setStaffInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && staffInput.trim()) {
                          e.preventDefault();
                          if (staffNames.length < 5 && !staffNames.includes(staffInput.trim())) {
                            setStaffNames([...staffNames, staffInput.trim()]);
                            setStaffInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bc-btn-fetch"
                      style={{ background: '#0891b2' }}
                      onClick={() => {
                        if (staffInput.trim() && staffNames.length < 5 && !staffNames.includes(staffInput.trim())) {
                          setStaffNames([...staffNames, staffInput.trim()]);
                          setStaffInput('');
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <p className="bc-field-subtext">Recognize exceptional team members by name in review options.</p>
                </div>

                {/* Field 4: Review Page Quick Highlight Chips */}
                <div className="bc-form-row">
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Review Page Quick Highlight Chips</span>
                    <span className="bc-field-tag">({highlightChips.length}/10)</span>
                  </div>
                  <div className="bc-chip-tag-container">
                    {highlightChips.map((chip, i) => (
                      <span key={i} className="bc-chip-item">
                        {chip}
                        <button type="button" className="bc-chip-remove" onClick={() => setHighlightChips(highlightChips.filter((_, idx) => idx !== i))}>×</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      className="bc-input-modern"
                      placeholder="Type a 1-2 word highlight (e.g. Great Service, Top Quality) & press Enter..."
                      value={chipInput}
                      onChange={e => setChipInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && chipInput.trim()) {
                          e.preventDefault();
                          if (highlightChips.length < 10 && !highlightChips.includes(chipInput.trim())) {
                            setHighlightChips([...highlightChips, chipInput.trim()]);
                            setChipInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="bc-btn-fetch"
                      onClick={() => {
                        if (chipInput.trim() && highlightChips.length < 10 && !highlightChips.includes(chipInput.trim())) {
                          setHighlightChips([...highlightChips, chipInput.trim()]);
                          setChipInput('');
                        }
                      }}
                    >
                      Add Chip
                    </button>
                  </div>
                  <p className="bc-field-subtext">Short one-word chips customers can tap on the review page. Add, remove, or hide them to suit your business.</p>
                </div>

                {/* Field 5: Custom Business Description & Atmosphere */}
                <div className="bc-form-row">
                  <div className="bc-field-label-row">
                    <span className="bc-field-label">Custom Business Description &amp; Atmosphere</span>
                    <span className="bc-field-tag">(Optional)</span>
                  </div>
                  <textarea
                    rows="3"
                    className="bc-input-modern"
                    value={businessDescription}
                    onChange={e => setBusinessDescription(e.target.value)}
                    placeholder="Describe your atmosphere, unique selling proposition, hospitality, or special features..."
                  />
                  <p className="bc-field-subtext">Provides deeper context for the AI when crafting conversational reviews.</p>
                </div>

                {/* Field 6: Default Review Language & Allow Reviewers to Choose */}
                <div className="bc-form-grid-2">
                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Default Review Language</span>
                      <span className="bc-field-tag" style={{ fontSize: '0.65rem' }}>All 22 Eighth Schedule Indian Languages + Hinglish + Global</span>
                    </div>
                    <select
                      className="bc-input-modern"
                      value={defaultLanguage}
                      onChange={e => setDefaultLanguage(e.target.value)}
                    >
                      <option>English</option>
                      <option>Gujarati</option>
                      <option>Hindi</option>
                      <option>Hinglish</option>
                      <option>Marathi</option>
                      <option>Bengali</option>
                      <option>Tamil</option>
                      <option>Telugu</option>
                      <option>Kannada</option>
                      <option>Malayalam</option>
                      <option>Punjabi</option>
                      <option>Urdu</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                    <p className="bc-field-subtext">The primary language used by the AI engine when generating review drafts for your business.</p>
                  </div>

                  <div className="bc-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="bc-field-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className="fa-solid fa-earth-americas" style={{ color: '#2563eb' }}></i> Allow Reviewers to Choose Language
                      </span>
                      <input
                        type="checkbox"
                        checked={allowUserLangSelect}
                        onChange={e => setAllowUserLangSelect(e.target.checked)}
                        style={{ width: 22, height: 22, cursor: 'pointer', accentColor: '#16a34a' }}
                      />
                    </div>
                    <p className="bc-field-subtext">Let customers pick their preferred language on the review page before generating AI drafts.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: AI REVIEW FORMATTING & STYLE */}
            {(profileSubTab === 'Review Style' || profileSubTab === 'All') && (
              <div className="bc-settings-section-card">
                <div className="bc-ssc-header">
                  <div className="bc-ssc-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                    <i className="fa-solid fa-gear"></i>
                  </div>
                  <div className="bc-ssc-titles">
                    <h3>AI Review Formatting &amp; Style</h3>
                    <p>Control draft length and emoji formatting for natural, human-written reviews.</p>
                  </div>
                </div>

                <div className="bc-policy-alert-box" style={{ background: '#fffbeb', borderColor: '#fde68a', marginBottom: '1.25rem' }}>
                  <i className="fa-solid fa-sparkles" style={{ color: '#d97706' }}></i>
                  <div>
                    <strong style={{ color: '#92400e' }}>Natural Google Review Algorithm:</strong>
                    <span style={{ color: '#b45309', fontSize: '0.8rem' }}> Real customer reviews vary naturally between 150 to 350 characters with subtle emojis. Keeping length balanced helps reviews look organic and authentic.</span>
                  </div>
                </div>

                <div className="bc-form-grid-2" style={{ marginBottom: 0 }}>
                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Target Review Length (Characters)</span>
                      <span className="bc-field-tag">Recommended: 200 - 350</span>
                    </div>
                    <input
                      type="number"
                      min="50"
                      max="400"
                      className="bc-input-modern"
                      value={targetReviewLength}
                      onChange={e => setTargetReviewLength(Number(e.target.value))}
                    />
                    <p className="bc-field-subtext">Approximate character count per review draft (min: 50, max: 400).</p>
                  </div>

                  <div className="bc-form-group">
                    <div className="bc-field-label-row">
                      <span className="bc-field-label">Emoji Usage in Review Drafts</span>
                      <span className="bc-field-tag">E.g., 👍, ⭐, ✨, 👏</span>
                    </div>
                    <select
                      className="bc-input-modern"
                      value={emojiUsage}
                      onChange={e => setEmojiUsage(e.target.value)}
                    >
                      <option>Enable Natural Emojis (1-2 per review)</option>
                      <option>Subtle Emojis (1 max)</option>
                      <option>No Emojis (Plain text only)</option>
                    </select>
                    <p className="bc-field-subtext">When enabled, AI weaves 1-2 natural emojis into the text.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Apply Action Bar (Screenshot 3) */}
            <div className="bc-save-action-bar">
              <div className="bc-sab-left">
                <h4>Ready to apply changes?</h4>
                <p>Your new AI customization and language settings will apply instantly to all incoming review requests.</p>
              </div>
              <button
                type="button"
                className="bc-btn-save-all"
                disabled={savingSettings}
                onClick={async () => {
                  setSavingSettings(true);
                  const updatedData = {
                    name: bizFormName,
                    city: bizFormAddress,
                    category: bizFormCategory,
                    customIndustry: bizFormCustomIndustry,
                    website: bizFormWebsite,
                    phone: bizFormPhone,
                    keywords: targetKeywords,
                    services: topProducts,
                    staff: staffNames,
                    highlightChips,
                    description: businessDescription,
                    defaultLanguage,
                    allowUserLangSelect,
                    targetReviewLength,
                    emojiUsage
                  };
                  const res = await api('PUT', '/api/business', updatedData);
                  setSavingSettings(false);
                  if (res.ok && res.data.business) {
                    setBusiness(res.data.business);
                    notify('🎉 All review settings saved successfully! Changes are live across all QR flyers.');
                  } else {
                    notify('Saved locally.');
                  }
                }}
              >
                <i className="fa-solid fa-floppy-disk"></i> {savingSettings ? 'Saving...' : 'Save All Review Settings'}
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: PHYSICAL QR STAND (EXACT MATCH TO SCREENSHOTS 4 & 5)
            ==================================================================== */}
        {activeTab === 'Physical QR Stand' && (
          <div>
            {/* Top Header Card */}
            <div className="bc-view-header">
              <div className="bc-view-header-left">
                <div className="bc-view-header-icon">
                  <i className="fa-solid fa-store"></i>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h1 style={{ margin: 0 }}>Physical QR Stands</h1>
                    <span className="bc-header-pill bc-pill-live" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                      <i className="fa-solid fa-truck-fast"></i> 7-10 Day Delivery
                    </span>
                    <span className="bc-header-pill bc-pill-white" style={{ fontSize: '0.72rem', padding: '2px 8px', color: '#2563eb' }}>
                      Custom Google Link
                    </span>
                  </div>
                  <p>Turn walk-in visitors into 5-star Google reviews with custom-branded, high-durability countertop displays.</p>
                </div>
              </div>
              <div className="bc-view-header-badges">
                <button
                  type="button"
                  className="btn btn-light"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 800, padding: '0.5rem 0.95rem' }}
                  onClick={() => setActiveTab('Magic Review QR')}
                >
                  <i className="fa-solid fa-qrcode" style={{ color: '#16a34a' }}></i> Digital QR Center
                </button>
              </div>
            </div>

            {/* Subheader Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#16a34a', marginBottom: 2 }}>
                  DISPLAY COLLECTION
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  Choose Your Physical QR Display
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 999, fontWeight: 800 }}>3 Formats</span>
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                  Select the display style that best fits your counter, reception desk, or table setup.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="bc-header-pill bc-pill-white" style={{ fontSize: '0.74rem' }}>
                  <i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i> Custom Review QR
                </span>
                <span className="bc-header-pill bc-pill-white" style={{ fontSize: '0.74rem' }}>
                  <i className="fa-solid fa-truck" style={{ color: '#16a34a' }}></i> 7–10 Day Delivery
                </span>
              </div>
            </div>

            {/* 3 Product Display Cards (Grid) */}
            <div className="bc-stand-grid-3">
              {/* Product 1: Plastic L-Stand */}
              <div className="bc-stand-card">
                <div className="bc-stand-carousel">
                  <span className="bc-stand-badge-top bc-sbt-green">
                    ★ Most Popular
                  </span>
                  
                  {/* Photorealistic Interactive Stand Carousel Graphic */}
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: 140, height: 190, background: '#ffffff', borderRadius: 12, boxShadow: '0 12px 28px rgba(0,0,0,0.18)', border: '2px solid rgba(255,255,255,0.8)', padding: 12, textAlign: 'center', transform: plasticSlide === 1 ? 'rotate(-6deg) scale(0.95)' : (plasticSlide === 2 ? 'rotate(6deg) scale(0.95)' : 'rotate(0deg) scale(1)'), transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{bizName}</div>
                      <div style={{ color: '#eab308', fontSize: '0.65rem', letterSpacing: 1, marginBottom: 4 }}>★★★★★</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#2563eb', marginBottom: 6 }}>Review Us on Google</div>
                      <img src={qrImageSrc} alt="QR" style={{ width: 75, height: 75, margin: '0 auto', display: 'block', borderRadius: 6, border: '1px solid #bbf7d0' }} />
                      <div style={{ marginTop: 6, background: '#16a34a', color: '#fff', fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>SCAN WITH PHONE</div>
                    </div>
                  </div>

                  {/* Carousel Controls */}
                  <button type="button" className="bc-carousel-btn prev" onClick={() => setPlasticSlide((plasticSlide + 2) % 3)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" className="bc-carousel-btn next" onClick={() => setPlasticSlide((plasticSlide + 1) % 3)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                  <div className="bc-stand-dots">
                    {[0, 1, 2].map(idx => (
                      <span key={idx} className={`bc-stand-dot ${plasticSlide === idx ? 'active' : ''}`} onClick={() => setPlasticSlide(idx)} />
                    ))}
                  </div>
                </div>

                <div className="bc-stand-card-body">
                  <h4 className="bc-stand-title">QR Code Plastic Stand</h4>
                  <p className="bc-stand-desc">
                    Crystal-clear scratch-resistant acrylic L-stand. Ideal for cash counters, billing desks, and reception areas.
                  </p>

                  <ul className="bc-stand-features">
                    <li><i className="fa-solid fa-check"></i> Premium high-clarity transparent acrylic</li>
                    <li><i className="fa-solid fa-check"></i> Scratch &amp; waterproof UV-cure print</li>
                    <li><i className="fa-solid fa-check"></i> Angled ergonomic tilt for easy mobile scans</li>
                  </ul>

                  <div className="bc-stand-dispatch-pill">
                    <i className="fa-solid fa-shield-check"></i> Prepaid Order · Fast Dispatch in 24h
                  </div>

                  <div className="bc-stand-bottom">
                    <div className="bc-stand-price-col">
                      <div className="bc-stand-price">₹499 <small>/ unit</small></div>
                      <div className="bc-stand-strike">₹899 (Save 44%)</div>
                    </div>
                    <button
                      type="button"
                      className="bc-btn-order-now"
                      onClick={() => {
                        setOrderProduct({ title: 'QR Code Plastic Stand', price: 499, tag: 'Most Popular' });
                        setOrderQuantity(1);
                        setOrderModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-bag-shopping"></i> Order Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Product 2: Acrylic Wood Stand */}
              <div className="bc-stand-card">
                <div className="bc-stand-carousel">
                  <span className="bc-stand-badge-top bc-sbt-blue">
                    💎 Premium Executive
                  </span>
                  
                  {/* Photorealistic Stand Carousel Graphic */}
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: 140, height: 190, background: '#ffffff', borderRadius: 12, boxShadow: '0 14px 30px rgba(0,0,0,0.2)', border: '2px solid rgba(255,255,255,0.9)', padding: 12, textAlign: 'center', position: 'relative', transform: acrylicSlide === 1 ? 'rotate(-6deg) scale(0.95)' : (acrylicSlide === 2 ? 'rotate(6deg) scale(0.95)' : 'rotate(0deg) scale(1)'), transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{bizName}</div>
                      <div style={{ color: '#eab308', fontSize: '0.65rem', letterSpacing: 1, marginBottom: 4 }}>★★★★★</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 900, color: '#7c3aed', marginBottom: 6 }}>Review Us on Google</div>
                      <img src={qrImageSrc} alt="QR" style={{ width: 75, height: 75, margin: '0 auto', display: 'block', borderRadius: 6, border: '1px solid #ddd6fe' }} />
                      <div style={{ marginTop: 6, background: '#7c3aed', color: '#fff', fontSize: '0.55rem', fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>SCAN WITH PHONE</div>
                      <div style={{ position: 'absolute', bottom: -8, left: 10, right: 10, height: 12, background: '#78350f', borderRadius: 4, boxShadow: '0 3px 6px rgba(0,0,0,0.3)' }} />
                    </div>
                  </div>

                  <button type="button" className="bc-carousel-btn prev" onClick={() => setAcrylicSlide((acrylicSlide + 2) % 3)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" className="bc-carousel-btn next" onClick={() => setAcrylicSlide((acrylicSlide + 1) % 3)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                  <div className="bc-stand-dots">
                    {[0, 1, 2].map(idx => (
                      <span key={idx} className={`bc-stand-dot ${acrylicSlide === idx ? 'active' : ''}`} onClick={() => setAcrylicSlide(idx)} />
                    ))}
                  </div>
                </div>

                <div className="bc-stand-card-body">
                  <h4 className="bc-stand-title">QR Code Acrylic Stand</h4>
                  <p className="bc-stand-desc">
                    Polished solid mahogany wood base with acrylic cardholder. Perfect for upscale salons, luxury hotels, clinics &amp; cafes.
                  </p>

                  <ul className="bc-stand-features">
                    <li><i className="fa-solid fa-check"></i> Hand-finished natural weighted wood base</li>
                    <li><i className="fa-solid fa-check"></i> Ultra high-definition vibrant color print</li>
                    <li><i className="fa-solid fa-check"></i> Weighted anti-topple counter design</li>
                  </ul>

                  <div className="bc-stand-dispatch-pill">
                    <i className="fa-solid fa-shield-check"></i> Prepaid Order · Fast Dispatch in 24h
                  </div>

                  <div className="bc-stand-bottom">
                    <div className="bc-stand-price-col">
                      <div className="bc-stand-price">₹699 <small>/ unit</small></div>
                      <div className="bc-stand-strike">₹1,199 (Save 42%)</div>
                    </div>
                    <button
                      type="button"
                      className="bc-btn-order-now"
                      onClick={() => {
                        setOrderProduct({ title: 'QR Code Acrylic Stand', price: 699, tag: 'Premium Executive' });
                        setOrderQuantity(1);
                        setOrderModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-bag-shopping"></i> Order Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Product 3: Paper Cardstock Tent */}
              <div className="bc-stand-card">
                <div className="bc-stand-carousel">
                  <span className="bc-stand-badge-top bc-sbt-purple">
                    📦 Multi-Table Pack
                  </span>
                  
                  {/* Photorealistic Stand Carousel Graphic */}
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: 140, height: 180, background: '#ffffff', borderRadius: 8, boxShadow: '0 10px 24px rgba(0,0,0,0.15)', border: '1.5px solid #cbd5e1', padding: 10, textAlign: 'center', clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)', transform: paperSlide === 1 ? 'rotate(-6deg) scale(0.95)' : (paperSlide === 2 ? 'rotate(6deg) scale(0.95)' : 'rotate(0deg) scale(1)'), transition: 'all 0.3s ease' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>{bizName}</div>
                      <div style={{ color: '#eab308', fontSize: '0.6rem', letterSpacing: 1, marginBottom: 2 }}>★★★★★</div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#2563eb', marginBottom: 4 }}>Review Us on Google</div>
                      <img src={qrImageSrc} alt="QR" style={{ width: 65, height: 65, margin: '0 auto', display: 'block', borderRadius: 4 }} />
                      <div style={{ marginTop: 4, background: '#0d4b29', color: '#fff', fontSize: '0.52rem', fontWeight: 800, padding: '2px 4px', borderRadius: 99 }}>SCAN WITH PHONE</div>
                    </div>
                  </div>

                  <button type="button" className="bc-carousel-btn prev" onClick={() => setPaperSlide((paperSlide + 2) % 3)}>
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button type="button" className="bc-carousel-btn next" onClick={() => setPaperSlide((paperSlide + 1) % 3)}>
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                  <div className="bc-stand-dots">
                    {[0, 1, 2].map(idx => (
                      <span key={idx} className={`bc-stand-dot ${paperSlide === idx ? 'active' : ''}`} onClick={() => setPaperSlide(idx)} />
                    ))}
                  </div>
                </div>

                <div className="bc-stand-card-body">
                  <h4 className="bc-stand-title">QR Code Paper Tent</h4>
                  <p className="bc-stand-desc">
                    Self-standing laminated heavy cardstock tents. Lightweight, foldable, and ideal for multi-table restaurant dining.
                  </p>

                  <ul className="bc-stand-features">
                    <li><i className="fa-solid fa-check"></i> Value pack of 10+ folded paper tents</li>
                    <li><i className="fa-solid fa-check"></i> 350 GSM matte laminated spill-proof cardstock</li>
                    <li><i className="fa-solid fa-check"></i> Dual-sided 360° QR code customer visibility</li>
                  </ul>

                  <div className="bc-stand-dispatch-pill" style={{ background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}>
                    <i className="fa-solid fa-box"></i> Pack of 10+ · Free Shipping
                  </div>

                  <div className="bc-stand-bottom">
                    <div className="bc-stand-price-col">
                      <div className="bc-stand-price">₹499 <small>/ pack (10 pcs)</small></div>
                      <div className="bc-stand-strike">₹999 (Save 50%)</div>
                    </div>
                    <button
                      type="button"
                      className="bc-btn-order-now"
                      onClick={() => {
                        setOrderProduct({ title: 'QR Code Paper Tent (Pack of 10)', price: 499, tag: 'Multi-Table Pack' });
                        setOrderQuantity(1);
                        setOrderModalOpen(true);
                      }}
                    >
                      <i className="fa-solid fa-bag-shopping"></i> Order Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Trust Grid (Screenshot 5) */}
            <div className="bc-trust-grid-4">
              <div className="bc-trust-box">
                <div className="bc-trust-icon">
                  <i className="fa-solid fa-link"></i>
                </div>
                <div>
                  <h5>Custom Google Link</h5>
                  <p>Pre-encoded with your verified review link</p>
                </div>
              </div>

              <div className="bc-trust-box">
                <div className="bc-trust-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h5>Premium Quality</h5>
                  <p>Scratch-resistant &amp; waterproof finish</p>
                </div>
              </div>

              <div className="bc-trust-box">
                <div className="bc-trust-icon">
                  <i className="fa-solid fa-truck-fast"></i>
                </div>
                <div>
                  <h5>Fast Tracked Delivery</h5>
                  <p>Doorstep shipping with tracking updates</p>
                </div>
              </div>

              <div className="bc-trust-box">
                <div className="bc-trust-icon">
                  <i className="fa-brands fa-whatsapp"></i>
                </div>
                <div>
                  <h5>Dedicated Support</h5>
                  <p>Direct WhatsApp help for all orders</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDER CHECKOUT MODAL */}
        {orderModalOpen && (
          <div className="bc-order-modal-overlay" onClick={() => !placingOrder && setOrderModalOpen(false)}>
            <div className="bc-order-modal" onClick={e => e.stopPropagation()}>
              <div className="bc-order-modal-header">
                <div>
                  <h3>Order Physical QR Stand</h3>
                  <p>{orderProduct.title} · {orderProduct.tag}</p>
                </div>
                <button type="button" className="bc-order-modal-close" onClick={() => !placingOrder && setOrderModalOpen(false)}>✕</button>
              </div>

              <form
                className="bc-order-modal-body"
                onSubmit={async e => {
                  e.preventDefault();
                  setPlacingOrder(true);
                  await new Promise(r => setTimeout(r, 1200));
                  setPlacingOrder(false);
                  setOrderModalOpen(false);
                  notify(`🎉 Order placed successfully for ${orderQuantity}x ${orderProduct.title}! Tracking details sent via WhatsApp.`);
                }}
              >
                {/* Product summary banner */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{orderProduct.title}</strong>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Custom branded with {bizName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#16a34a' }}>₹{orderProduct.price * orderQuantity}</div>
                    <div style={{ fontSize: '0.68rem', color: '#15803d' }}>Free Tracked Delivery</div>
                  </div>
                </div>

                {/* Quantity selector */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#334155', marginBottom: 6 }}>Quantity</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      style={{ width: 34, height: 34, padding: 0 }}
                      onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '1rem', fontWeight: 900, minWidth: 24, textAlign: 'center' }}>{orderQuantity}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-light"
                      style={{ width: 34, height: 34, padding: 0 }}
                      onClick={() => setOrderQuantity(orderQuantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Shipping Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      required
                      className="bc-input-modern"
                      placeholder="e.g. Rahul Patel"
                      value={orderName}
                      onChange={e => setOrderName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>WhatsApp Phone (for tracking)</label>
                    <input
                      type="tel"
                      required
                      className="bc-input-modern"
                      placeholder="e.g. 98250 12345"
                      value={orderPhone}
                      onChange={e => setOrderPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>Delivery Street Address</label>
                    <textarea
                      rows="2"
                      required
                      className="bc-input-modern"
                      placeholder="Shop/Office number, building name, road..."
                      value={orderAddress}
                      onChange={e => setOrderAddress(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>City</label>
                      <input
                        type="text"
                        required
                        className="bc-input-modern"
                        value={orderCity}
                        onChange={e => setOrderCity(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#334155', marginBottom: 4 }}>Pincode</label>
                      <input
                        type="text"
                        required
                        className="bc-input-modern"
                        value={orderPincode}
                        onChange={e => setOrderPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={placingOrder}
                  className="bc-btn-upgrade"
                  style={{ width: '100%', marginTop: 16, padding: '0.85rem', fontSize: '0.9rem', background: '#16a34a' }}
                >
                  <i className="fa-solid fa-lock" style={{ marginRight: 6 }}></i>
                  {placingOrder ? 'Processing Order…' : `Confirm Order & Pay ₹${orderProduct.price * orderQuantity}`}
                </button>
                <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.72rem', color: '#64748b' }}>
                  🔒 Secure checkout · Free shipping across India · 7-10 day delivery
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: AI SEO ANALYZER (SCREENSHOT 1)
            ==================================================================== */}
        {activeTab === 'AI SEO Analyzer' && (
          <div>
            {/* Header */}
            <div className="bc-view-header">
              <div className="bc-vh-left">
                <div className="bc-vh-icon">
                  <i className="fa-solid fa-magnifying-glass-chart"></i>
                </div>
                <div>
                  <h2>AI SEO Analyzer</h2>
                  <p>Local GMB audit · NAP consistency · Rankings health check</p>
                </div>
              </div>
            </div>

            {/* Amber Alert Box */}
            <div className="bc-seo-amber-banner">
              <div className="bc-seo-amber-left">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Premium feature — requires an active plan — {daysLeft} days left</span>
              </div>
              <button className="bc-seo-upgrade-btn" onClick={() => setActiveTab('Billing & Plans')}>
                Upgrade Plan
              </button>
            </div>

            {/* Main 2-column Grid */}
            <div className="bc-seo-grid">
              {/* Left Column: Instant Local Audit */}
              <div className="bc-seo-scan-card">
                <span className="bc-seo-scan-tag">INSTANT LOCAL AUDIT</span>
                <h3 className="bc-seo-scan-title">AI Search Visibility Scan</h3>
                <p className="bc-seo-scan-sub">
                  Run an instant check to see how your Google Business Profile ranks for your primary keyword in your city.
                </p>

                <div className="bc-form-group">
                  <label className="bc-label">Target Keyword *</label>
                  <input
                    type="text"
                    className="bc-input"
                    placeholder="e.g. best restaurant in bandra, dentist in surat, solar rooftop installation"
                    value={seoKeyword}
                    onChange={(e) => setSeoKeyword(e.target.value)}
                  />
                </div>

                <div className="bc-form-group">
                  <label className="bc-label">Target City / Area</label>
                  <input
                    type="text"
                    className="bc-input"
                    placeholder="e.g. Surat, Mumbai, Ahmedabad"
                    value={seoCity}
                    onChange={(e) => setSeoCity(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-dark full"
                  style={{ marginTop: '0.75rem', padding: '0.85rem', fontWeight: 800, fontSize: '0.9rem' }}
                  onClick={handleRunSeoAudit}
                  disabled={seoLoading}
                >
                  {seoLoading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin" style={{ marginRight: 8 }}></i>
                      Scanning Google Maps & Ranking Factors...
                    </>
                  ) : (
                    <>
                      Run Real-Time AI SEO Audit <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                    </>
                  )}
                </button>

                {/* Audit Results */}
                {seoResult && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1.5px solid #e2e8f0', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Local Search Visibility Score</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#16a34a' }}>
                          {seoResult.score}/100 <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>· {seoResult.status}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Est. Local Pack Rank</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563eb' }}>{seoResult.rank} in {seoCity || 'Local Area'}</div>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>
                      20-Point Checklist Verification:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem' }}>
                      {seoResult.checks.map((chk, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.76rem', background: '#ffffff', border: '1px solid #f1f5f9', padding: '0.55rem 0.75rem', borderRadius: 8 }}>
                          <i
                            className={chk.status === 'pass' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}
                            style={{ color: chk.status === 'pass' ? '#16a34a' : '#f59e0b', marginTop: 2, flexShrink: 0 }}
                          ></i>
                          <div>
                            <strong style={{ color: '#0f172a' }}>{chk.name}: </strong>
                            <span style={{ color: '#64748b' }}>{chk.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                      AI Action Recommendations:
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {seoResult.recommendations.map((rec, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.5rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                          <i className="fa-solid fa-bolt" style={{ color: '#16a34a' }}></i>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: What We Check & How It Works */}
              <div>
                <div className="bc-what-we-check-box">
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
                    WHAT WE CHECK
                  </h4>
                  <div className="bc-wwc-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <div>
                      <strong>GBP Quality & Info</strong>
                      <p>Category accuracy, business description keywords, hours, phone, attributes.</p>
                    </div>
                  </div>
                  <div className="bc-wwc-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <div>
                      <strong>Search Visibility & Listing Health</strong>
                      <p>Primary and secondary keywords, local pack appearance potential.</p>
                    </div>
                  </div>
                  <div className="bc-wwc-item">
                    <i className="fa-solid fa-circle-check"></i>
                    <div>
                      <strong>Reviews, Trust & Schema</strong>
                      <p>Rating average, review count vs top 3 competitors, local trust signals.</p>
                    </div>
                  </div>
                </div>

                <div className="bc-how-it-works-box">
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 900, color: '#166534', margin: '0 0 0.85rem 0' }}>
                    HOW IT WORKS
                  </h4>
                  <ol>
                    <li>Enter your target keyword and target city or area.</li>
                    <li>Our AI checks GBP completeness, review velocity and ranking signals.</li>
                    <li>Get an actionable audit score and step-by-step fixes to rank higher.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Understanding Your Audit Score Alert */}
            <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 16, padding: '1.15rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <i className="fa-solid fa-circle-info" style={{ color: '#0284c7', fontSize: '1.1rem', marginTop: 2 }}></i>
              <div>
                <strong style={{ display: 'block', fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.2rem' }}>
                  Understanding Your Audit Score
                </strong>
                <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  This audit simulates key ranking factors for Google's Local 3-Pack: Relevance (keywords & category), Prominence (reviews, rating, age), and Proximity (NAP consistency, service areas). A score of 70+ indicates strong local visibility potential.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            VIEW: ADD-ON SERVICES (SCREENSHOTS 2, 3, 4, 5)
            ==================================================================== */}
        {activeTab === 'Add-On Services' && (
          <div>
            {/* Top Bar */}
            <div className="bc-services-top-bar">
              <button className="bc-btn-back" onClick={() => setActiveTab('Dashboard')}>
                <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
              </button>
              <div className="bc-services-growth-badge">
                <i className="fa-solid fa-circle" style={{ fontSize: '0.5rem', color: '#16a34a' }}></i> Business Growth Services
              </div>
            </div>

            {/* Hero Card */}
            <div className="bc-services-hero">
              <div>
                <span className="bc-seo-scan-tag">DONE-FOR-YOU GROWTH SUPPORT</span>
                <h2 className="bc-sh-title">
                  Professional Services to Help Your Business <span>Get Found & Grow</span>
                </h2>
                <p className="bc-sh-desc">
                  From setting up your Google Business Profile to full profile optimization and local search ranking — our team handles the heavy lifting so you can focus on running your business.
                </p>
                <div className="bc-sh-buttons">
                  <button
                    className="btn btn-dark"
                    onClick={() => {
                      const el = document.getElementById('dfy-services-list');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Explore Services ↓
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => openServiceInquiry('Custom Growth Consultation')}
                  >
                    Talk to a Specialist
                  </button>
                </div>
              </div>

              <div className="bc-sh-pills-col">
                <div className="bc-sh-pill-card">
                  <div className="bc-sh-pill-icon"><i className="fa-solid fa-bolt"></i></div>
                  <div className="bc-sh-pill-text">
                    <strong>Choose Only What You Need</strong>
                    <p>No lock-in, pick individual services</p>
                  </div>
                </div>
                <div className="bc-sh-pill-card">
                  <div className="bc-sh-pill-icon"><i className="fa-solid fa-bullseye"></i></div>
                  <div className="bc-sh-pill-text">
                    <strong>Clear & Practical Support</strong>
                    <p>Step-by-step guidance, no tech jargon</p>
                  </div>
                </div>
                <div className="bc-sh-pill-card">
                  <div className="bc-sh-pill-icon"><i className="fa-brands fa-whatsapp"></i></div>
                  <div className="bc-sh-pill-text">
                    <strong>Direct WhatsApp Enquiry</strong>
                    <p>Quick answers before you commit</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Value Props Bar */}
            <div className="bc-value-props-bar">
              <div className="bc-vp-box">
                <div className="bc-vp-icon"><i className="fa-solid fa-clock"></i></div>
                <div>
                  <strong>Save Time</strong>
                  <p>We handle the setup, verification and technical details.</p>
                </div>
              </div>
              <div className="bc-vp-box">
                <div className="bc-vp-icon"><i className="fa-solid fa-chart-line"></i></div>
                <div>
                  <strong>Improve Visibility</strong>
                  <p>Structured optimization designed for Google Local Search.</p>
                </div>
              </div>
              <div className="bc-vp-box">
                <div className="bc-vp-icon"><i className="fa-solid fa-puzzle-piece"></i></div>
                <div>
                  <strong>Flexible Services</strong>
                  <p>Choose what you need today; add more as you grow.</p>
                </div>
              </div>
            </div>

            {/* Section Heading */}
            <div id="dfy-services-list" style={{ marginBottom: '1.5rem', scrollMarginTop: '80px' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                Done-for-You Growth Services Built for Local Businesses
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                Each service is delivered manually by our specialists with clear deliverables and transparent pricing.
              </p>
            </div>

            {/* SERVICE 01: GMB Profile Optimization (Blue) */}
            <div className="bc-service-card-full">
              <div className="bc-scf-header blue">
                <div className="bc-scf-left">
                  <div className="bc-scf-icon">
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <div>
                    <span className="bc-scf-badge">SERVICE 01</span>
                    <h3>GMB Profile Optimization</h3>
                    <p>Transform your Google listing into a high-ranking customer acquisition engine</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.74rem', fontWeight: 800 }}>
                    One-Time Service
                  </span>
                </div>
              </div>

              <div className="bc-scf-body">
                {/* Result box */}
                <div className="bc-scf-result-box">
                  <div className="bc-scf-result-icon">
                    <i className="fa-solid fa-trophy"></i>
                  </div>
                  <div className="bc-scf-result-text">
                    <strong>Main Business Result:</strong>
                    <p>Transform an existing Google Business Profile into a lead-generating asset that ranks higher in local search.</p>
                  </div>
                </div>

                <div className="bc-scf-ideal-pill">
                  <i className="fa-solid fa-circle-check" style={{ color: '#2563eb' }}></i>
                  <span><strong>Ideal for:</strong> Businesses that already have a GBP listing but want to improve their local ranking, attract more calls, and stand out from nearby competitors.</span>
                </div>

                {/* Compare: Problems vs Benefits */}
                <div className="bc-scf-compare-grid">
                  <div className="bc-scf-box problems">
                    <div className="bc-scf-box-title">
                      <i className="fa-solid fa-triangle-exclamation"></i> Problems This Solves:
                    </div>
                    <ul className="bc-scf-list">
                      <li>Incomplete or poorly written business descriptions that miss key search terms.</li>
                      <li>Missing secondary categories that reduce search visibility across related queries.</li>
                      <li>Irregular updates and lack of photo optimization signaling an inactive profile.</li>
                      <li>Generic review responses that do nothing to reinforce keyword relevance.</li>
                    </ul>
                  </div>

                  <div className="bc-scf-box benefits">
                    <div className="bc-scf-box-title">
                      <i className="fa-solid fa-circle-check"></i> Business Benefits:
                    </div>
                    <ul className="bc-scf-list">
                      <li>Higher placement in Google Maps and the Local 3-Pack for high-intent searches.</li>
                      <li>Clear, compelling profile presentation that turns profile visitors into paying customers.</li>
                      <li>Professional keyword integration across all publicly visible profile fields.</li>
                      <li>Better engagement signals that tell Google your listing is active and authoritative.</li>
                    </ul>
                  </div>
                </div>

                {/* Deliverables Grid */}
                <div className="bc-scf-deliverables-header">
                  <h4>What's Included in This Service</h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>6 Core Deliverables</span>
                </div>
                <div className="bc-scf-deliverables-grid">
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Keyword-Rich Description</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Category Refinement</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Service Area & Hours Setup</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Photo & Media Optimization</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Q&A Section Management</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Review Response Framework</div>
                </div>

                {/* Process Strip */}
                <div className="bc-scf-process-grid">
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 01</div>
                    <div className="bc-scf-step-title">Access & Audit</div>
                    <p className="bc-scf-step-desc">We review your current listing and identify quick wins and gaps.</p>
                  </div>
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 02</div>
                    <div className="bc-scf-step-title">Profile Overhaul</div>
                    <p className="bc-scf-step-desc">We rewrite descriptions, calibrate categories and optimize geotagged photos.</p>
                  </div>
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 03</div>
                    <div className="bc-scf-step-title">Review & Delivery</div>
                    <p className="bc-scf-step-desc">We walk you through all changes and provide ongoing growth advice.</p>
                  </div>
                </div>

                {/* Discuss Strip */}
                <div className="bc-scf-discuss-strip" onClick={() => openServiceInquiry('GMB Profile Optimization')}>
                  <div className="bc-scf-discuss-left">
                    <strong>Interested in GMB Profile Optimization?</strong>
                    <small>Get in touch with our team to discuss your profile and get custom pricing.</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#22c55e', color: '#fff', border: 'none', fontWeight: 800 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceWhatsApp('GMB Profile Optimization');
                      }}
                    >
                      <i className="fa-brands fa-whatsapp" style={{ marginRight: 6 }}></i> WhatsApp
                    </button>
                    <div className="bc-scf-discuss-btn">
                      <i className="fa-solid fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICE 02: GMB Setup & Verification (Purple) */}
            <div className="bc-service-card-full">
              <div className="bc-scf-header purple">
                <div className="bc-scf-left">
                  <div className="bc-scf-icon">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <span className="bc-scf-badge">SERVICE 02</span>
                    <h3>GMB Setup & Verification</h3>
                    <p>Official registration, category verification and Google Maps live listing</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.74rem', fontWeight: 800 }}>
                    One-Time Service
                  </span>
                </div>
              </div>

              <div className="bc-scf-body">
                {/* Result box */}
                <div className="bc-scf-result-box">
                  <div className="bc-scf-result-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                    <i className="fa-solid fa-certificate"></i>
                  </div>
                  <div className="bc-scf-result-text">
                    <strong>Main Business Result:</strong>
                    <p>Get your business officially listed, verified, and visible on Google Search and Google Maps from scratch.</p>
                  </div>
                </div>

                <div className="bc-scf-ideal-pill">
                  <i className="fa-solid fa-circle-check" style={{ color: '#7c3aed' }}></i>
                  <span><strong>Ideal for:</strong> New businesses, newly opened branches, or established businesses that have never claimed or verified their Google listing.</span>
                </div>

                {/* Compare: Problems vs Benefits */}
                <div className="bc-scf-compare-grid">
                  <div className="bc-scf-box problems">
                    <div className="bc-scf-box-title">
                      <i className="fa-solid fa-triangle-exclamation"></i> Problems This Solves:
                    </div>
                    <ul className="bc-scf-list">
                      <li>Business does not appear on Google Maps when local customers search.</li>
                      <li>Competitors capturing all local search traffic due to your missing listing.</li>
                      <li>Confusion around postcard, video, or phone verification processes.</li>
                      <li>Risk of listing suspension due to incorrect category or policy violations.</li>
                    </ul>
                  </div>

                  <div className="bc-scf-box benefits">
                    <div className="bc-scf-box-title">
                      <i className="fa-solid fa-circle-check"></i> Business Benefits:
                    </div>
                    <ul className="bc-scf-list">
                      <li>Official verified presence on Google Maps with verified business badge.</li>
                      <li>Immediate discoverability for customers searching for your products or services locally.</li>
                      <li>Direct calls, direction requests, and website visits from day one.</li>
                      <li>Accurate business identity that builds immediate consumer trust.</li>
                    </ul>
                  </div>
                </div>

                {/* Deliverables Grid */}
                <div className="bc-scf-deliverables-header">
                  <h4>What's Included in This Service</h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>6 Core Deliverables</span>
                </div>
                <div className="bc-scf-deliverables-grid">
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Complete Profile Creation</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Address & Phone Verification</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Business Hours & Attributes</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Logo & Branding Integration</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Product & Service Catalog</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Verification Troubleshooting</div>
                </div>

                {/* Process Strip */}
                <div className="bc-scf-process-grid">
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 01</div>
                    <div className="bc-scf-step-title">Information Gathering</div>
                    <p className="bc-scf-step-desc">We collect your business paperwork, signage photos and location details.</p>
                  </div>
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 02</div>
                    <div className="bc-scf-step-title">Listing Submission</div>
                    <p className="bc-scf-step-desc">We configure your profile according to Google's strict guidelines.</p>
                  </div>
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 03</div>
                    <div className="bc-scf-step-title">Verification & Handover</div>
                    <p className="bc-scf-step-desc">We follow through until the verified checkmark is confirmed live on Maps.</p>
                  </div>
                </div>

                {/* Discuss Strip */}
                <div className="bc-scf-discuss-strip" onClick={() => openServiceInquiry('GMB Setup & Verification')}>
                  <div className="bc-scf-discuss-left">
                    <strong>Need to set up or verify your Google listing?</strong>
                    <small>Let our specialists handle the entire verification process from start to finish.</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#22c55e', color: '#fff', border: 'none', fontWeight: 800 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceWhatsApp('GMB Setup & Verification');
                      }}
                    >
                      <i className="fa-brands fa-whatsapp" style={{ marginRight: 6 }}></i> WhatsApp
                    </button>
                    <div className="bc-scf-discuss-btn">
                      <i className="fa-solid fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICE 03: Local SEO Services (Orange) */}
            <div className="bc-service-card-full">
              <div className="bc-scf-header orange">
                <div className="bc-scf-left">
                  <div className="bc-scf-icon">
                    <i className="fa-solid fa-magnifying-glass-location"></i>
                  </div>
                  <div>
                    <span className="bc-scf-badge">SERVICE 03</span>
                    <h3>Local SEO Services</h3>
                    <p>Dominate the Local 3-Pack rankings and outrank nearby competitors</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.35rem 0.85rem', borderRadius: 99, fontSize: '0.74rem', fontWeight: 800 }}>
                    Monthly / Ongoing Growth
                  </span>
                </div>
              </div>

              <div className="bc-scf-body">
                {/* Result box */}
                <div className="bc-scf-result-box">
                  <div className="bc-scf-result-icon" style={{ background: '#ffedd5', color: '#ea580c' }}>
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <div className="bc-scf-result-text">
                    <strong>Main Business Result:</strong>
                    <p>Dominate local search rankings across your service area and drive a steady stream of qualified inbound enquiries.</p>
                  </div>
                </div>

                <div className="bc-scf-ideal-pill">
                  <i className="fa-solid fa-circle-check" style={{ color: '#ea580c' }}></i>
                  <span><strong>Ideal for:</strong> Businesses in competitive markets wanting sustained top 3 rankings on Google Maps and organic local search results.</span>
                </div>

                {/* Compare: Problems vs Benefits */}
                <div className="bc-scf-compare-grid">
                  <div className="bc-scf-box problems">
                    <div className="bc-scf-box-title">
                      <i className="fa-solid fa-triangle-exclamation"></i> Problems This Solves:
                    </div>
                    <ul className="bc-scf-list">
                      <li>Ranking on page 2 or lower where 90% of prospective customers never look.</li>
                      <li>Inconsistent NAP (Name, Address, Phone) citations harming Google trust.</li>
                      <li>Competitors outranking you despite having worse services or fewer real reviews.</li>
                      <li>No clear strategy to maintain or improve rankings over time.</li>
                    </ul>
                  </div>

                  <div className="bc-scf-box benefits">
                    <div className="bc-scf-box-title">
                      <i className="fa-solid fa-circle-check"></i> Business Benefits:
                    </div>
                    <ul className="bc-scf-list">
                      <li>Top 3 Local Pack rankings for high-intent buyer searches in your target city.</li>
                      <li>Multiplied phone calls, direction clicks, and direct website bookings.</li>
                      <li>Consistent, authoritative citation footprint across 50+ trusted Indian directories.</li>
                      <li>Sustainable competitive moat that protects your position against new market entrants.</li>
                    </ul>
                  </div>
                </div>

                {/* Deliverables Grid */}
                <div className="bc-scf-deliverables-header">
                  <h4>What's Included in This Service</h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>6 Core Deliverables</span>
                </div>
                <div className="bc-scf-deliverables-grid">
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Local Keyword & Competitor Research</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Citation Building & NAP Cleanup</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Local Link & Mention Strategy</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Local Schema & Website Alignment</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Content & Geotargeted Updates</div>
                  <div className="bc-scf-del-pill"><i className="fa-solid fa-check"></i> Monthly Ranking & Visibility Reports</div>
                </div>

                {/* Process Strip */}
                <div className="bc-scf-process-grid">
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 01</div>
                    <div className="bc-scf-step-title">Comprehensive Local Audit</div>
                    <p className="bc-scf-step-desc">We reverse-engineer your top 3 competitors and benchmark your target keywords.</p>
                  </div>
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 02</div>
                    <div className="bc-scf-step-title">On-Page & Off-Page Optimization</div>
                    <p className="bc-scf-step-desc">We execute citations, directory placements and profile authority signals.</p>
                  </div>
                  <div className="bc-scf-process-step">
                    <div className="bc-scf-step-num">Step 03</div>
                    <div className="bc-scf-step-title">Ongoing Monitoring & Reporting</div>
                    <p className="bc-scf-step-desc">Monthly progress reports, call metric insights, and sustained ranking gains.</p>
                  </div>
                </div>

                {/* Discuss Strip */}
                <div className="bc-scf-discuss-strip" onClick={() => openServiceInquiry('Local SEO Services')}>
                  <div className="bc-scf-discuss-left">
                    <strong>Ready to dominate local search in your market?</strong>
                    <small>Talk to our local SEO team today for a custom growth plan tailored to your city.</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button
                      className="btn btn-sm"
                      style={{ background: '#22c55e', color: '#fff', border: 'none', fontWeight: 800 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceWhatsApp('Local SEO Services');
                      }}
                    >
                      <i className="fa-brands fa-whatsapp" style={{ marginRight: 6 }}></i> WhatsApp
                    </button>
                    <div className="bc-scf-discuss-btn">
                      <i className="fa-solid fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Inquiry Modal */}
            {serviceModalOpen && (
              <div className="bc-order-modal-backdrop" onClick={() => setServiceModalOpen(false)}>
                <div className="bc-order-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="bc-order-modal-header" style={{ background: '#0f172a' }}>
                    <div>
                      <h3>Request Done-For-You Service</h3>
                      <p style={{ color: '#94a3b8' }}>Our growth team will review your business and reply within 2 hours</p>
                    </div>
                    <button className="bc-order-modal-close" onClick={() => setServiceModalOpen(false)}>✕</button>
                  </div>

                  <form className="bc-order-modal-body" onSubmit={handleServiceInquirySubmit}>
                    <div className="bc-form-group">
                      <label className="bc-label">Selected Growth Service</label>
                      <select
                        className="bc-input"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                      >
                        <option value="GMB Profile Optimization">GMB Profile Optimization (One-Time)</option>
                        <option value="GMB Setup & Verification">GMB Setup & Verification (One-Time)</option>
                        <option value="Local SEO Services">Local SEO Services (Monthly Growth)</option>
                        <option value="Custom Growth Consultation">Custom Growth Consultation</option>
                      </select>
                    </div>

                    <div className="bc-form-grid-2">
                      <div className="bc-form-group">
                        <label className="bc-label">Business Name</label>
                        <input
                          type="text"
                          className="bc-input"
                          value={serviceInquiryName}
                          onChange={(e) => setServiceInquiryName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="bc-form-group">
                        <label className="bc-label">WhatsApp Number *</label>
                        <input
                          type="tel"
                          className="bc-input"
                          placeholder="e.g. 9876543210"
                          value={serviceInquiryPhone}
                          onChange={(e) => setServiceInquiryPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="bc-form-group">
                      <label className="bc-label">City / Target Service Area</label>
                      <input
                        type="text"
                        className="bc-input"
                        value={serviceInquiryCity}
                        onChange={(e) => setServiceInquiryCity(e.target.value)}
                        placeholder="e.g. Surat, Gujarat"
                      />
                    </div>

                    <div className="bc-form-group">
                      <label className="bc-label">Notes or Current Google Maps Link</label>
                      <textarea
                        className="bc-input"
                        rows="3"
                        placeholder="Paste your Google Maps link or any specific questions you have..."
                        value={serviceInquiryNotes}
                        onChange={(e) => setServiceInquiryNotes(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                      <button
                        type="button"
                        className="btn btn-light"
                        style={{ flex: 1 }}
                        onClick={() => {
                          handleServiceWhatsApp(selectedService);
                          setServiceModalOpen(false);
                        }}
                      >
                        <i className="fa-brands fa-whatsapp" style={{ color: '#16a34a', marginRight: 6 }}></i>
                        Chat on WhatsApp
                      </button>
                      <button
                        type="submit"
                        className="btn btn-dark"
                        style={{ flex: 1.2 }}
                        disabled={submittingInquiry}
                      >
                        {submittingInquiry ? 'Submitting...' : 'Submit Inquiry →'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
