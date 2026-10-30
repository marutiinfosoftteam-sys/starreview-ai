import React, { useState, useEffect } from 'react';

export default function PartnerProgramPage({ user, navigate, notify }) {
  // Plan Selector & Calculator States (Screenshot 2 Match)
  const plans = [
    { id: 'monthly', name: 'Monthly Plan', price: 99, commission: 39.60 },
    { id: 'yearly', name: 'Yearly Plan', price: 999, commission: 399.60 },
    { id: 'multi', name: 'Multi-Business Plan', price: 4999, commission: 1999.60 }
  ];

  const [selectedPlanId, setSelectedPlanId] = useState('monthly');
  const [referredCount, setReferredCount] = useState(10);

  // Partner Auth & Dashboard Modal States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [partnerUser, setPartnerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sr_partner_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showDashboardModal, setShowDashboardModal] = useState(false);

  // Form inputs
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pUpi, setPUpi] = useState('');
  const [pCode, setPCode] = useState('PARTNER40');
  const [copiedLink, setCopiedLink] = useState(false);
  const [payoutRequested, setPayoutRequested] = useState(false);

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
  const totalCommission = (selectedPlan.commission * referredCount).toFixed(2);

  const openRegister = () => {
    if (partnerUser) {
      setShowDashboardModal(true);
    } else {
      setAuthMode('register');
      setShowAuthModal(true);
    }
  };

  const openLogin = () => {
    if (partnerUser) {
      setShowDashboardModal(true);
    } else {
      setAuthMode('login');
      setShowAuthModal(true);
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'register' && !pEmail.trim()) {
      notify('Please enter a valid email address.');
      return;
    }

    const partnerProfile = {
      name: pName.trim() || 'Partner Specialist',
      email: pEmail.trim() || 'partner@reviewflow.ai',
      code: pCode.trim().toUpperCase() || 'PARTNER40',
      upi: pUpi.trim() || 'partner@okhdfcbank',
      balance: 1000,
      totalEarned: 1999.60,
      referralsCount: 3,
      joinedAt: new Date().toLocaleDateString()
    };

    setPartnerUser(partnerProfile);
    try {
      localStorage.setItem('sr_partner_user', JSON.stringify(partnerProfile));
    } catch {}

    setShowAuthModal(false);
    setShowDashboardModal(true);
    notify(authMode === 'register' ? '🎉 Welcome to the Partner Program! Your referral link is ready.' : '✓ Signed in to Partner Console.');
  };

  const copyReferralLink = () => {
    const code = partnerUser?.code || pCode || 'PARTNER40';
    const link = `${window.location.origin}/?ref=${code}`;
    navigator.clipboard?.writeText(link);
    setCopiedLink(true);
    notify('Copied 40% Partner referral link to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const shareWhatsApp = () => {
    const code = partnerUser?.code || pCode || 'PARTNER40';
    const link = `${window.location.origin}/?ref=${code}`;
    const text = `Hey! Check out StarReview AI to turn your store walk-ins into authentic 5-star Google reviews in 10 seconds: ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const requestPayout = () => {
    setPayoutRequested(true);
    notify('✓ Payout request of ₹1,000 submitted! Funds will be credited to your UPI within 24-48 business hours.');
  };

  const logoutPartner = () => {
    setPartnerUser(null);
    try {
      localStorage.removeItem('sr_partner_user');
    } catch {}
    setShowDashboardModal(false);
    notify('Signed out of Partner Console.');
  };

  return (
    <div className="rf-partner-page-wrap">
      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 1: HERO & 4 STAT CARDS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-partner-hero">
        <div className="wrap">
          <div className="rf-partner-badge">
            <span className="rf-badge-dot">●</span>
            <span>DEDICATED PARTNER PROGRAM • FLAT 40% COMMISSION</span>
          </div>

          <h1 className="rf-partner-title">
            Recommend StarReview AI.<br />
            Earn <span className="rf-text-emerald">40% On Every Subscription.</span>
          </h1>

          <p className="rf-partner-subtitle">
            Share our AI-powered Google Review funnel with local businesses, agencies, and retail stores. When they purchase any subscription within 48 hours of clicking your link, you earn a 40% cash payout.
          </p>

          <div className="rf-partner-cta-row">
            <button
              type="button"
              className="rf-btn-partner-primary"
              onClick={openRegister}
            >
              Join Referral Program Free →
            </button>
            <button
              type="button"
              className="rf-btn-partner-secondary"
              onClick={openLogin}
            >
              Partner Sign In
            </button>
          </div>

          {/* 4 Feature/Stat Cards (Screenshot 1) */}
          <div className="rf-partner-stat-strip">
            <div className="rf-pstat-card">
              <div className="rf-pstat-icon"><i className="fa-solid fa-percent"></i></div>
              <div className="rf-pstat-val">40%</div>
              <div className="rf-pstat-lbl">Direct Cash Commission</div>
            </div>

            <div className="rf-pstat-card">
              <div className="rf-pstat-icon"><i className="fa-regular fa-clock"></i></div>
              <div className="rf-pstat-val">48 Hours</div>
              <div className="rf-pstat-lbl">Cookie Tracking Window</div>
            </div>

            <div className="rf-pstat-card">
              <div className="rf-pstat-icon"><i className="fa-solid fa-wallet"></i></div>
              <div className="rf-pstat-val">₹1,000</div>
              <div className="rf-pstat-lbl">Low Minimum Payout</div>
            </div>

            <div className="rf-pstat-card">
              <div className="rf-pstat-icon"><i className="fa-solid fa-building-columns"></i></div>
              <div className="rf-pstat-val">UPI &amp; Bank</div>
              <div className="rf-pstat-lbl">Direct Account Transfers</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 2: LIVE COMMISSION CALCULATOR & SLIDER
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-calc-section">
        <div className="wrap">
          <div className="rf-calc-header">
            <div className="rf-calc-eyebrow">INSTANT EARNINGS ESTIMATOR</div>
            <h2 className="rf-calc-title">Live Commission Calculator</h2>
            <p className="rf-calc-sub">
              Select a subscription plan and adjust the number of referred businesses to see your exact 40% cash payout.
            </p>
          </div>

          {/* Calculator Card Container */}
          <div className="rf-calc-card">
            {/* 3 Plan Cards */}
            <div className="rf-calc-plans-grid">
              {plans.map(p => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`rf-calc-plan-box ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedPlanId(p.id)}
                  >
                    {isSelected && <span className="rf-calc-selected-tag">✓ SELECTED</span>}
                    <h4 className="rf-calc-plan-name">{p.name}</h4>
                    <div className="rf-calc-plan-price">₹{p.price.toLocaleString('en-IN')}</div>
                    <div className="rf-calc-plan-earn">You Earn: ₹{p.commission.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>

            {/* Slider Section */}
            <div className="rf-calc-slider-wrap">
              <div className="rf-calc-slider-labels">
                <span className="rf-slider-lbl-left">Number of Referred Businesses:</span>
                <span className="rf-slider-lbl-val">{referredCount} Accounts</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                className="rf-calc-range"
                value={referredCount}
                onChange={e => setReferredCount(parseInt(e.target.value, 10))}
              />
            </div>

            {/* Green Result Banner (Screenshot 2 Match) */}
            <div className="rf-calc-result-banner">
              <div className="rf-result-left">
                <span className="rf-result-lbl">YOUR TOTAL 40% CASH COMMISSION</span>
                <div className="rf-result-val">₹{Number(totalCommission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                <div className="rf-result-sub">
                  {referredCount} accounts × {selectedPlan.commission.toFixed(2)} (40% of ₹{selectedPlan.price} {selectedPlan.name})
                </div>
              </div>
              <div className="rf-result-right">
                <button
                  type="button"
                  className="rf-btn-claim-link"
                  onClick={openRegister}
                >
                  Claim Your 40% Link →
                </button>
              </div>
            </div>

            {/* 4 Quick Preset Cards */}
            <div className="rf-calc-presets-grid">
              {[1, 10, 20, 50].map(cnt => (
                <div
                  key={cnt}
                  className="rf-preset-card"
                  onClick={() => setReferredCount(cnt)}
                  title={`Click to preview earnings for ${cnt} referrals`}
                >
                  <span className="rf-preset-count">{cnt} Referral{cnt > 1 ? 's' : ''}</span>
                  <span className="rf-preset-val">₹{(selectedPlan.commission * cnt).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 3: HOW THE PARTNER PROGRAM WORKS (3 STEPS)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-how-partner-sec">
        <div className="wrap">
          <div className="rf-how-header">
            <div className="rf-how-eyebrow">SIMPLE 3-STEP PROCESS</div>
            <h2 className="rf-how-title">How the Partner Program Works</h2>
            <p className="rf-how-sub">
              No business setup or technical knowledge needed. Start earning within minutes.
            </p>
          </div>

          <div className="rf-how-steps-grid">
            <div className="rf-step-card">
              <div className="rf-step-num-badge">1</div>
              <h3 className="rf-step-card-title">Join Free &amp; Get Your Code</h3>
              <p className="rf-step-card-desc">
                Sign up on our dedicated partner page. Instantly receive your unique partner code and customizable referral tracking link.
              </p>
            </div>

            <div className="rf-step-card">
              <div className="rf-step-num-badge">2</div>
              <h3 className="rf-step-card-title">Share with Local Businesses</h3>
              <p className="rf-step-card-desc">
                Share via WhatsApp, social media, or in person. When they visit your link, our 48-hour tracking cookie connects their account to you.
              </p>
            </div>

            <div className="rf-step-card">
              <div className="rf-step-num-badge">3</div>
              <h3 className="rf-step-card-title">Receive 40% Direct Payout</h3>
              <p className="rf-step-card-desc">
                When the business purchases any plan, 40% is instantly credited to your ledger. Request payouts to your UPI or Bank starting at ₹1,000.
              </p>
            </div>
          </div>

          {/* Callout Box below steps (Screenshot 3) */}
          <div className="rf-partner-callout-card">
            <div className="rf-callout-badge">SEPARATE PARTNER PORTAL</div>
            <h3 className="rf-callout-title">Ready to Start Earning 40% Commissions?</h3>
            <p className="rf-callout-sub">
              Join our network of partners recommending StarReview AI to businesses across India. Fast approvals, instant tracking, and direct bank payouts.
            </p>
            <div className="rf-callout-actions">
              <button
                type="button"
                className="rf-btn-partner-primary"
                onClick={openRegister}
              >
                Create Partner Account →
              </button>
              <button
                type="button"
                className="rf-btn-partner-secondary"
                onClick={openLogin}
              >
                Partner Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SCREENSHOT 4: PARTNER FREQUENTLY ASKED QUESTIONS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="rf-partner-faq-sec">
        <div className="wrap">
          <div className="rf-faq-header">
            <div className="rf-faq-eyebrow">PARTNER FAQ</div>
            <h2 className="rf-faq-title">Frequently Asked Questions</h2>
            <p className="rf-faq-sub">
              Everything you need to know about the StarReview AI Referral Partner Program.
            </p>
          </div>

          <div className="rf-faq-list">
            <div className="rf-faq-item">
              <h4 className="rf-faq-q">
                <i className="fa-regular fa-circle-question"></i>
                <span>How is the Referral Program separated from normal user accounts?</span>
              </h4>
              <p className="rf-faq-a">
                Referral Partners have their own dedicated authentication and dashboard. As a partner, you do not need to register a business, set up Google places, or purchase a subscription. You can focus 100% on sharing your link and earning commissions.
              </p>
            </div>

            <div className="rf-faq-item">
              <h4 className="rf-faq-q">
                <i className="fa-regular fa-circle-question"></i>
                <span>When and how do I get paid?</span>
              </h4>
              <p className="rf-faq-a">
                Once your available commission balance reaches the ₹1,000 minimum limit, you can submit a withdrawal request directly from your dashboard. Payouts are transferred to your saved UPI ID or Bank Account via NEFT/IMPS within 24-48 business hours.
              </p>
            </div>

            <div className="rf-faq-item">
              <h4 className="rf-faq-q">
                <i className="fa-regular fa-circle-question"></i>
                <span>How does the 48-hour referral tracking window work?</span>
              </h4>
              <p className="rf-faq-a">
                When a business owner clicks your referral link, a 48-hour tracking cookie is saved in their browser. If they register or purchase any subscription plan within 48 hours, the 40% commission is automatically attributed and credited to your partner account.
              </p>
            </div>

            <div className="rf-faq-item">
              <h4 className="rf-faq-q">
                <i className="fa-regular fa-circle-question"></i>
                <span>Can I customize my referral code?</span>
              </h4>
              <p className="rf-faq-a">
                Yes! You can customize your referral code into a branded word or name (e.g. RAHUL40) from the "Referral Links" tab inside your partner dashboard, provided it hasn't been taken by another partner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PARTNER AUTH MODAL (REGISTER & SIGN IN)
          ═══════════════════════════════════════════════════════════════ */}
      {showAuthModal && (
        <div className="rf-partner-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="rf-partner-modal-box" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              className="rf-partner-modal-close"
              onClick={() => setShowAuthModal(false)}
            >
              ✕
            </button>

            <div className="rf-partner-modal-tabs">
              <button
                type="button"
                className={`rf-pmodal-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => setAuthMode('register')}
              >
                Create Partner Account
              </button>
              <button
                type="button"
                className={`rf-pmodal-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => setAuthMode('login')}
              >
                Partner Sign In
              </button>
            </div>

            <div className="rf-pmodal-badge-row">
              <span className="rf-pmodal-badge">
                <i className="fa-solid fa-bolt" style={{ color: '#16a34a' }}></i> 40% Commission Partner Portal
              </span>
            </div>

            <h3 className="rf-pmodal-title">
              {authMode === 'register' ? 'Join StarReview Partner Program' : 'Sign In to Partner Console'}
            </h3>
            <p className="rf-pmodal-sub">
              {authMode === 'register'
                ? 'Create your free partner profile to generate your 40% referral links instantly.'
                : 'Enter your partner email and password to view your commissions and requests.'}
            </p>

            <form onSubmit={handleAuthSubmit} className="rf-pmodal-form">
              {authMode === 'register' && (
                <div className="rf-pmodal-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                  />
                </div>
              )}

              <div className="rf-pmodal-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={pEmail}
                  onChange={e => setPEmail(e.target.value)}
                />
              </div>

              <div className="rf-pmodal-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={pPassword}
                  onChange={e => setPPassword(e.target.value)}
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div className="rf-pmodal-group">
                    <label>Preferred Referral Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. RAHUL40"
                      value={pCode}
                      onChange={e => setPCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    />
                  </div>

                  <div className="rf-pmodal-group">
                    <label>UPI ID for Payouts (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={pUpi}
                      onChange={e => setPUpi(e.target.value)}
                    />
                  </div>
                </>
              )}

              <button type="submit" className="rf-btn-pmodal-submit">
                {authMode === 'register' ? 'Create Partner Account & Open Console →' : 'Sign In to Partner Console →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DEDICATED PARTNER DASHBOARD MODAL
          ═══════════════════════════════════════════════════════════════ */}
      {showDashboardModal && partnerUser && (
        <div className="rf-partner-modal-backdrop" onClick={() => setShowDashboardModal(false)}>
          <div className="rf-partner-modal-box rf-partner-dash-box" onClick={e => e.stopPropagation()}>
            <div className="rf-pdash-header">
              <div>
                <span className="rf-pdash-active-badge">● Active Referral Partner</span>
                <h3 className="rf-pdash-title">Partner Console — {partnerUser.name}</h3>
                <span className="rf-pdash-email">{partnerUser.email}</span>
              </div>
              <div className="rf-pdash-header-actions">
                <button
                  type="button"
                  className="rf-pdash-btn-logout"
                  onClick={logoutPartner}
                >
                  Sign Out
                </button>
                <button
                  type="button"
                  className="rf-partner-modal-close"
                  onClick={() => setShowDashboardModal(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Unique Referral Link Box */}
            <div className="rf-pdash-link-box">
              <label>Your Unique 40% Commission Referral Link</label>
              <div className="rf-pdash-input-row">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/?ref=${partnerUser.code || 'PARTNER40'}`}
                />
                <button
                  type="button"
                  className="rf-pdash-copy-btn"
                  onClick={copyReferralLink}
                >
                  {copiedLink ? '✓ Copied' : 'Copy Link'}
                </button>
                <button
                  type="button"
                  className="rf-pdash-wa-btn"
                  onClick={shareWhatsApp}
                >
                  <i className="fa-brands fa-whatsapp"></i> Share
                </button>
              </div>
              <small>Cookie tracking window: 48 hours • Commission: 40% on all plans</small>
            </div>

            {/* 4 Stat Boxes */}
            <div className="rf-pdash-stats-grid">
              <div className="rf-pdash-stat">
                <span className="lbl">Referred Clicks</span>
                <strong className="val">42</strong>
              </div>
              <div className="rf-pdash-stat">
                <span className="lbl">Active Businesses</span>
                <strong className="val">{partnerUser.referralsCount || 3}</strong>
              </div>
              <div className="rf-pdash-stat">
                <span className="lbl">Total Earned</span>
                <strong className="val" style={{ color: '#16a34a' }}>₹{partnerUser.totalEarned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="rf-pdash-stat">
                <span className="lbl">Available Payout</span>
                <strong className="val" style={{ color: '#15803d' }}>₹{partnerUser.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            {/* Payout Withdrawal Box */}
            <div className="rf-pdash-payout-box">
              <div className="rf-payout-left">
                <h4>Withdraw Earnings to UPI / Bank</h4>
                <p>Saved Payout Method: <strong>{partnerUser.upi || 'yourname@okhdfcbank'}</strong></p>
                <small>Minimum limit: ₹1,000 • Transfer time: 24-48 business hours via IMPS/NEFT</small>
              </div>
              <div className="rf-payout-right">
                <button
                  type="button"
                  className="rf-btn-payout"
                  disabled={payoutRequested}
                  onClick={requestPayout}
                >
                  {payoutRequested ? '✓ Request Submitted' : 'Request ₹1,000 Payout →'}
                </button>
              </div>
            </div>

            <div className="rf-pdash-footer">
              <button
                type="button"
                className="btn btn-light"
                onClick={() => setShowDashboardModal(false)}
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
