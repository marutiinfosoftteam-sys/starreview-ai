import React, { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { ReviewFunnel, BusinessSetup, ReplyAssistant, SeoAnalyzer, Dashboard, QrFlyer } from './tools.jsx';

const features = [
  ['✦', 'AI review assistant', 'Help customers express their genuine experience with three editable draft suggestions in 24 languages.'],
  ['▦', 'Smart QR funnels', 'Create a customer review page and a print-ready A6 QR flyer for your counter, table or receipt.'],
  ['♡', 'Private feedback', 'Route unhappy customers to a private form so concerns reach your team first.'],
  ['↗', 'Reputation analytics', 'Track QR scans, drafts, copies, Google redirects and conversion in one dashboard.'],
  ['✉', 'Reply assistant', 'Draft sentiment-aware replies to your Google reviews. Included in Pro and the free trial.'],
  ['▤', 'Print-ready flyers', 'Pick your brand color and download a clean A6 flyer as a high-resolution PNG.'],
  ['◎', 'Profile health check', 'Run a 20-point check of your Google Business Profile and get a 0 to 100 score with fixes.'],
  ['◈', 'Staff and service mentions', 'Customers can mention the staff member and service they used, so drafts feel specific and real.'],
  ['⇄', 'Competitor comparison', 'Add up to four local competitors and see how your rating and reviews compare.']
];

const toolTarget = {
  'Smart QR funnels': 'QR flyer',
  'Print-ready flyers': 'QR flyer',
  'AI review assistant': 'Try the demo',
  'Reply assistant': 'Reply assistant',
  'Profile health check': 'SEO analyzer',
  'Competitor comparison': 'SEO analyzer',
  'Staff and service mentions': 'My business'
};

const industries = [
  { icon: 'fa-solid fa-utensils', name: 'Restaurants' },
  { icon: 'fa-solid fa-scissors', name: 'Salons & Spas' },
  { icon: 'fa-solid fa-stethoscope', name: 'Clinics' },
  { icon: 'fa-solid fa-shirt', name: 'Retail Stores' },
  { icon: 'fa-solid fa-hotel', name: 'Hotels' },
  { icon: 'fa-solid fa-car-side', name: 'Auto Services' }
];

const testimonials = [
  {
    stars: '★★★★★',
    text: "We went from 38 reviews to over 240 in less than 3 months! Customers love that they don't have to think about what to write — the AI suggestions match our service perfectly.",
    author: "Rajesh Malhotra",
    role: "Owner, Spice Haven Bistro"
  },
  {
    stars: '★★★★★',
    text: "The private feedback shield saved our rating twice already. Instead of angry 1-star reviews on Google, we solved the issues directly with the customers. Priceless tool!",
    author: "Dr. Ananya Sen",
    role: "Founder, Sen Dental Care"
  },
  {
    stars: '★★★★★',
    text: "The A6 table standee flyers look extremely premium. Customers simply scan their camera, pick their language, and post in under 10 seconds. Best investment this year.",
    author: "Vikram Mehta",
    role: "Director, Luxe Wellness Spa"
  }
];

export default function App() {
  const routeMap = {
    '/': 'Home',
    '/features': 'Features',
    '/how-it-works': 'How it works',
    '/ai-vs-qr': 'AI vs QR',
    '/pricing': 'Pricing',
    '/try-demo': 'Try the demo',
    '/qr-flyer': 'QR flyer',
    '/payment-qr-demo': 'Payment QR Demo',
    '/demo-checkout': 'Demo checkout',
    '/dashboard': 'Dashboard',
    '/account': 'Account',
    '/contact': 'Contact',
    '/feedback': 'Feedback',
    '/business': 'My business',
    '/reply-assistant': 'Reply assistant',
    '/seo-analyzer': 'SEO analyzer',
    '/about': 'About us',
    '/faq': 'Frequently asked questions',
    '/source-code': 'Source code',
    '/multi-business': 'Multi-business plan',
    '/agency': 'Apply for agency',
    '/partner': 'Partner program',
    '/business-onboard': 'Business onboarding',
    '/privacy': 'Privacy policy',
    '/terms': 'Terms of service',
    '/cookies': 'Cookie policy',
    '/sitemap': 'Sitemap'
  };

  const slugMap = Object.fromEntries(Object.entries(routeMap).map(([path, name]) => [name, path]));
  const pageFromPath = () => {
    const p = window.location.pathname.replace(/\/$/, '') || '/';
    return p.startsWith('/r/') ? 'Review' : (routeMap[p] || 'Home');
  };

  const reviewSlug = window.location.pathname.split('/')[2] || '';
  const [page, setPage] = useState(pageFromPath);
  const [menu, setMenu] = useState(false);
  const [rating, setRating] = useState(5);
  const [business, setBusiness] = useState('StarReview Demo Business');
  const [experience, setExperience] = useState('friendly service and a great experience');
  const [staff, setStaff] = useState('');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('English');
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [toast, setToast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regMode, setRegMode] = useState(false);
  const [user, setUser] = useState(null);
  const [myBusiness, setMyBusiness] = useState(null);
  const [cfg, setCfg] = useState({ whatsappNumber: '919707842047', languages: ['English', 'Hindi', 'Hinglish', 'Gujarati'] });
  const [demoPlan, setDemoPlan] = useState('Starter');
  const [demoPeriod, setDemoPeriod] = useState('Monthly');
  const [demoResult, setDemoResult] = useState('');

  // ReviewFlow AI Pricing Toggle: 'without-reply' (Standard) vs 'with-reply' (Pro)
  const [pricingTab, setPricingTab] = useState('without-reply');

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3800);
  };

  const navigate = (p) => {
    const nextPath = slugMap[p] || '/';
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ page: p }, '', nextPath);
    }
    setPage(p);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setMyBusiness(null);
    notify('Signed out.');
    navigate('Home');
  };

  const loadUser = async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    const r = await api('GET', '/api/auth/me');
    if (r.ok) setUser(r.data.user);
    else if (r.status === 401) {
      setToken('');
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    api('GET', '/api/public-config').then(r => {
      if (r.ok) setCfg(r.data);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setMyBusiness(null);
      return;
    }
    api('GET', '/api/business').then(r => {
      if (r.ok) setMyBusiness(r.data.business);
    });
  }, [user?.id]);

  useEffect(() => {
    const onPopState = () => {
      setPage(pageFromPath());
      setMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const submitAuth = async (e) => {
    e.preventDefault();
    const r = await api('POST', regMode ? '/api/auth/register' : '/api/auth/login', { email, password });
    if (!r.ok) return notify(r.data.error);
    setToken(r.data.token);
    setUser(r.data.user);
    setPassword('');
    notify(regMode ? 'Account created. Your 3-day free trial has started!' : 'Signed in successfully.');
    navigate(regMode ? 'My business' : 'Dashboard');
  };

  const generate = async () => {
    setLoading(true);
    const r = await api('POST', '/api/drafts', { business, experience, staff, keywords, language, rating });
    setLoading(false);
    if (!r.ok) return notify(r.data.error);
    setDrafts(r.data.drafts.filter(Boolean));
    if (r.data.note) notify(r.data.note);
  };

  const copy = async (t) => {
    try {
      await navigator.clipboard.writeText(t);
      notify('Copied to clipboard.');
    } catch {
      notify('Select the text and copy it manually.');
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    const r = await api('POST', '/api/feedback', { rating, message: feedback });
    if (!r.ok) return notify(r.data.error);
    setFeedbackSent(true);
    notify('Thank you! Your feedback was saved.');
  };

  const choosePlan = (planName, period = 'Monthly') => {
    if (planName === 'Multi-Business' || planName === 'Agency') {
      window.open(`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business / Agency Plan for StarReview AI. Please share pricing and business limit details.")}`, '_blank');
      return;
    }
    setDemoPlan(planName);
    setDemoPeriod(period);
    setDemoResult('');
    navigate('Demo checkout');
  };

  const navItems = ['Features', 'How it works', 'AI vs QR', 'Pricing'];

  // Exact Pricing Section from User Screenshot (in StarReview Design Theme)
  const renderPricingSection = () => (
    <section className="section wrap" id="pricing-plans" style={{ paddingTop: 20 }}>
      {/* 1. HERO */}
      <div className="pricing-hero">
        <div className="pricing-hero-badge">
          <span></span> Simple &amp; Transparent Plans
        </div>
        <h1>Turn More Customers Into <span>Google Reviews</span></h1>
        <p>Start free for 3 days, then select the plan that matches your business growth. Scale easily with automated AI drafts, smart QR standees, and centralized multi-business tools.</p>
        <div className="pricing-trust-row">
          <span><i className="fa-solid fa-check"></i> No credit card for 3-day trial</span>
          <span><i className="fa-solid fa-check"></i> Single &amp; Multi-Business Options</span>
          <span><i className="fa-solid fa-check"></i> Upgrade or chat anytime</span>
        </div>
      </div>

      {/* 2. 3-DAY FREE TRIAL HIGHLIGHT BOX */}
      <div className="trial-highlight-card">
        <div className="trial-header-flex">
          <div className="trial-title-wrap">
            <div className="trial-gift-icon">
              <i className="fa-solid fa-gift"></i>
            </div>
            <div>
              <div className="trial-badge"><i className="fa-solid fa-check"></i> No Credit Card Required</div>
              <h3>3 Days Free Trial — Explore Everything Risk-Free</h3>
            </div>
          </div>
          <button className="pricing-cta cta-primary" style={{ padding: '0.65rem 1.4rem', width: 'auto' }} onClick={() => navigate('Account')}>
            Start 3-Day Free Trial <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
          </button>
        </div>

        <div className="trial-features-grid">
          <div className="trial-feature-box">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <div>
              <strong>AI Review Generator</strong>
              <span>3 human-like drafts in 24+ languages</span>
            </div>
          </div>
          <div className="trial-feature-box">
            <i className="fa-solid fa-qrcode"></i>
            <div>
              <strong>Smart QR Standee</strong>
              <span>Printable A6 flyer &amp; direct link</span>
            </div>
          </div>
          <div className="trial-feature-box">
            <i className="fa-solid fa-sliders"></i>
            <div>
              <strong>Keywords &amp; Staff</strong>
              <span>Inject custom products &amp; services</span>
            </div>
          </div>
          <div className="trial-feature-box">
            <i className="fa-solid fa-chart-line"></i>
            <div>
              <strong>Click &amp; Copy Analytics</strong>
              <span>Track scans, generations &amp; copies</span>
            </div>
          </div>
        </div>

        <div className="trial-footer-note">
          <div><i className="fa-solid fa-circle-info" style={{ color: '#16a34a', marginRight: 4 }}></i> The 3-day free trial gives you full access to test review collection. Priority Support, Ad-Free Funnel, and Review Drop Guarantee are activated upon upgrading to a paid plan.</div>
          <div><i className="fa-solid fa-bolt" style={{ color: '#ca8a04', marginRight: 4 }}></i> Instant activation · Cancel anytime</div>
        </div>
      </div>

      {/* 3. PLAN TOGGLE TABS */}
      <div className="pricing-toggle-wrap">
        <div className="pricing-toggle-pill">
          <button
            type="button"
            className={`pricing-tab-btn ${pricingTab === 'without-reply' ? 'active' : ''}`}
            onClick={() => setPricingTab('without-reply')}
          >
            <i className="fa-solid fa-layer-group"></i>
            <span>Without Review Reply</span>
            <span className="tab-badge-pill">Standard Plans</span>
          </button>
          <button
            type="button"
            className={`pricing-tab-btn ${pricingTab === 'with-reply' ? 'active pro-tab' : ''}`}
            onClick={() => setPricingTab('with-reply')}
          >
            <i className="fa-solid fa-robot"></i>
            <span>With Review Reply</span>
            <span className="tab-badge-pill">Pro Plans</span>
          </button>
        </div>
      </div>

      {/* 4. PRICING CARDS GRID */}
      <div className="pricing-cards-section">
        {pricingTab === 'without-reply' ? (
          <div className="pricing-grid-modern">
            {/* Standard Monthly Plan */}
            <article className="pricing-card">
              <div className="plan-topline">
                <span className="plan-type-chip monthly">Standard Monthly</span>
                <span className="plan-fit">Best for starting out</span>
              </div>
              <div className="plan-icon monthly"><i className="fa-solid fa-calendar-days"></i></div>
              <h2>Monthly Plan</h2>
              <div className="plan-label">Monthly billing · 1 business · QR funnel &amp; AI drafts</div>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">199</span>
                <span className="period">/ month</span>
              </div>
              <div className="plan-value-note">
                <strong>Standard platform capabilities</strong>
                Deploy AI-assisted review drafting, customizable QR standees, and full growth analytics.
              </div>
              <ul className="pricing-features">
                <li className="feature-row feature-excluded">
                  <span className="icon-cross"><i className="fa-solid fa-xmark"></i></span>
                  <span>Automatic AI Review Reply <strong>(Not included in Standard)</strong></span>
                </li>
                {[
                  'Human-Like AI Written Reviews',
                  'Custom Keywords, Services, Products & Staff',
                  'Emoji Support & Multiple Review Styles',
                  'Personalized AI Review Suggestions',
                  'Smart & Customizable Google Review QR Code',
                  'Printable QR Standee & Direct Review Link',
                  'Review, Rating & Growth Analytics',
                  'AI Google Business Profile Analyzer',
                  'Customer Review Tracking',
                  'No Review Drop / Loss Guarantee',
                  '100% Ad-Free Funnel Experience',
                  'Priority Support'
                ].map(feat => (
                  <li className="feature-row" key={feat}>
                    <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className="pricing-cta cta-outline" onClick={() => choosePlan('Starter', 'Monthly')}>
                Choose Monthly Plan <i className="fa-solid fa-arrow-right"></i>
              </button>
            </article>

            {/* Standard Yearly Plan */}
            <article className="pricing-card pricing-card-yearly">
              <span className="recommended-ribbon"><i className="fa-solid fa-crown" style={{ marginRight: 4 }}></i> RECOMMENDED / BEST VALUE</span>
              <div className="plan-topline">
                <span className="plan-type-chip yearly">Best Value · Save 16%</span>
                <span className="plan-fit">Best for established growth</span>
              </div>
              <div className="plan-icon yearly"><i className="fa-solid fa-crown"></i></div>
              <h2>Yearly Plan</h2>
              <div className="plan-label">1 year · 1 business · Maximum savings</div>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">1999</span>
                <span className="period">/ year</span>
              </div>
              <div className="yearly-saving-box">
                <div>
                  <strong>Annual membership</strong>
                  <span>Lower effective cost per month</span>
                </div>
                <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: 16 }}></i>
              </div>
              <ul className="pricing-features">
                <li className="feature-row feature-excluded">
                  <span className="icon-cross"><i className="fa-solid fa-xmark"></i></span>
                  <span>Automatic AI Review Reply <strong>(Not included in Standard)</strong></span>
                </li>
                {[
                  'Human-Like AI Written Reviews',
                  'Custom Keywords, Services, Products & Staff',
                  'Emoji Support & Multiple Review Styles',
                  'Personalized AI Review Suggestions',
                  'Smart & Customizable Google Review QR Code',
                  'Printable QR Standee & Direct Review Link',
                  'Review, Rating & Growth Analytics',
                  'AI Google Business Profile Analyzer',
                  'Customer Review Tracking',
                  'No Review Drop / Loss Guarantee',
                  '100% Ad-Free Funnel Experience',
                  'Priority Support'
                ].map(feat => (
                  <li className="feature-row" key={feat}>
                    <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className="pricing-cta cta-primary" onClick={() => choosePlan('Starter', 'Yearly')}>
                Choose Yearly Plan <i className="fa-solid fa-arrow-right"></i>
              </button>
            </article>

            {/* Multi-Business Plan */}
            <article className="pricing-card pricing-card-agency">
              <div className="plan-topline">
                <span className="plan-type-chip agency">Multi-Business</span>
                <span className="plan-fit">For agencies &amp; chains</span>
              </div>
              <div className="plan-icon agency"><i className="fa-solid fa-building"></i></div>
              <h2>Multi-Business Plan</h2>
              <div className="plan-label">Multiple locations · Centralized dashboard</div>
              <div className="pricing-price">
                <span className="amount" style={{ fontSize: '1.9rem' }}>Custom</span>
                <span className="period">/ Tailored capacity</span>
              </div>
              <div className="agency-note-box">
                <div>
                  <strong>Centralized management</strong>
                  <span>Scale across unlimited locations</span>
                </div>
                <i className="fa-solid fa-layer-group" style={{ fontSize: 16 }}></i>
              </div>
              <div className="agency-byo-api">
                <i className="fa-solid fa-key" style={{ marginRight: 4 }}></i>
                <strong>Bring Your Own AI API:</strong> Connect your own API key (Gemini, OpenAI, or Claude) for review generation (API keys not provided with Multi-Business plans).
              </div>
              <ul className="pricing-features">
                {[
                  'Multi-Business Centralized Dashboard',
                  'Configurable Business Capacity Limit',
                  'Separate AI Customization & Languages per Location',
                  'Individual QR Flyers & Printable Downloads',
                  'Private Negative Feedback Routing (1–3 Stars)',
                  'Cross-Business Conversion & Activity Analytics',
                  'Dedicated WhatsApp Support & Onboarding'
                ].map(feat => (
                  <li className="feature-row" key={feat}>
                    <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business Plan for StarReview AI.")}`}
                target="_blank"
                rel="noreferrer"
                className="pricing-cta cta-whatsapp"
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: 16 }}></i> Chat With Us on WhatsApp
              </a>
            </article>
          </div>
        ) : (
          <div className="pricing-grid-modern">
            {/* Pro Monthly Plan */}
            <article className="pricing-card" style={{ borderColor: '#86efac' }}>
              <div className="plan-topline">
                <span className="plan-type-chip yearly">Pro Monthly</span>
                <span className="plan-fit">Autopilot Reputation</span>
              </div>
              <div className="plan-icon yearly"><i className="fa-solid fa-robot"></i></div>
              <h2>Pro Monthly Plan</h2>
              <div className="plan-label">Monthly billing · 1 business · 24/7 Autopilot Replies</div>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">299</span>
                <span className="period">/ month</span>
              </div>
              <div className="plan-value-note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <strong style={{ color: '#166534' }}>24/7 Autopilot Review Replies</strong>
                Direct publishing to Google Maps in under 45s of review receipt.
              </div>
              <ul className="pricing-features">
                <li className="feature-row feature-pro-highlight">
                  <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                  <span><strong>Automatic AI Review Reply (24/7 Autopilot Included)</strong></span>
                </li>
                {[
                  'Human-Like AI Written Reviews',
                  'Custom Keywords, Services, Products & Staff',
                  'Emoji Support & Multiple Review Styles',
                  'Personalized AI Review Suggestions',
                  'Smart & Customizable Google Review QR Code',
                  'Printable QR Standee & Direct Review Link',
                  'Review, Rating & Growth Analytics',
                  'AI Google Business Profile Analyzer',
                  'Customer Review Tracking',
                  'No Review Drop / Loss Guarantee',
                  '100% Ad-Free Funnel Experience',
                  'Priority Support'
                ].map(feat => (
                  <li className="feature-row" key={feat}>
                    <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className="pricing-cta cta-primary" onClick={() => choosePlan('Pro', 'Monthly')}>
                Choose Pro Monthly <i className="fa-solid fa-arrow-right"></i>
              </button>
            </article>

            {/* Pro Yearly Plan */}
            <article className="pricing-card pricing-card-yearly" style={{ borderColor: '#15803d' }}>
              <span className="recommended-ribbon"><i className="fa-solid fa-crown" style={{ marginRight: 4 }}></i> RECOMMENDED / PRO VALUE</span>
              <div className="plan-topline">
                <span className="plan-type-chip yearly">Best Pro Value · Save 16%</span>
                <span className="plan-fit">Maximum ROI on Autopilot</span>
              </div>
              <div className="plan-icon yearly"><i className="fa-solid fa-crown"></i></div>
              <h2>Pro Yearly Plan</h2>
              <div className="plan-label">1 year · 1 business · 24/7 Autopilot Replies</div>
              <div className="pricing-price">
                <span className="currency">₹</span>
                <span className="amount">2999</span>
                <span className="period">/ year</span>
              </div>
              <div className="yearly-saving-box">
                <div>
                  <strong>Maximum Savings &amp; 24/7 Autopilot</strong>
                  <span>Complete hands-free Google review engine</span>
                </div>
                <i className="fa-solid fa-arrow-trend-up" style={{ fontSize: 16 }}></i>
              </div>
              <ul className="pricing-features">
                <li className="feature-row feature-pro-highlight">
                  <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                  <span><strong>Automatic AI Review Reply (24/7 Autopilot Included)</strong></span>
                </li>
                {[
                  'Human-Like AI Written Reviews',
                  'Custom Keywords, Services, Products & Staff',
                  'Emoji Support & Multiple Review Styles',
                  'Personalized AI Review Suggestions',
                  'Smart & Customizable Google Review QR Code',
                  'Printable QR Standee & Direct Review Link',
                  'Review, Rating & Growth Analytics',
                  'AI Google Business Profile Analyzer',
                  'Customer Review Tracking',
                  'No Review Drop / Loss Guarantee',
                  '100% Ad-Free Funnel Experience',
                  'Priority Support'
                ].map(feat => (
                  <li className="feature-row" key={feat}>
                    <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className="pricing-cta cta-primary" onClick={() => choosePlan('Pro', 'Yearly')}>
                Choose Pro Yearly <i className="fa-solid fa-arrow-right"></i>
              </button>
            </article>

            {/* Multi-Business Plan */}
            <article className="pricing-card pricing-card-agency">
              <div className="plan-topline">
                <span className="plan-type-chip agency">Multi-Business</span>
                <span className="plan-fit">For agencies &amp; chains</span>
              </div>
              <div className="plan-icon agency"><i className="fa-solid fa-building"></i></div>
              <h2>Multi-Business Plan</h2>
              <div className="plan-label">Multiple locations · Centralized dashboard</div>
              <div className="pricing-price">
                <span className="amount" style={{ fontSize: '1.9rem' }}>Custom</span>
                <span className="period">/ Tailored capacity</span>
              </div>
              <div className="agency-note-box">
                <div>
                  <strong>Centralized management</strong>
                  <span>Scale across unlimited locations</span>
                </div>
                <i className="fa-solid fa-layer-group" style={{ fontSize: 16 }}></i>
              </div>
              <div className="agency-byo-api">
                <i className="fa-solid fa-key" style={{ marginRight: 4 }}></i>
                <strong>Bring Your Own AI API:</strong> Connect your own API key (Gemini, OpenAI, or Claude) for review generation (API keys not provided with Multi-Business plans).
              </div>
              <ul className="pricing-features">
                {[
                  'Multi-Business Centralized Dashboard',
                  'Configurable Business Capacity Limit',
                  'Separate AI Customization & Languages per Location',
                  'Individual QR Flyers & Printable Downloads',
                  'Private Negative Feedback Routing (1–3 Stars)',
                  'Cross-Business Conversion & Activity Analytics',
                  'Dedicated WhatsApp Support & Onboarding'
                ].map(feat => (
                  <li className="feature-row" key={feat}>
                    <span className="icon-check"><i className="fa-solid fa-check"></i></span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business Plan for StarReview AI.")}`}
                target="_blank"
                rel="noreferrer"
                className="pricing-cta cta-whatsapp"
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: 16 }}></i> Chat With Us on WhatsApp
              </a>
            </article>
          </div>
        )}
      </div>

      {/* 5. DETAILED COMPARISON TABLE ACROSS ALL PLANS */}
      <div className="pricing-table-section">
        <div className="comparison-heading">
          <span className="comparison-kicker">Plan Breakdown</span>
          <h2>Compare Features Across Plans</h2>
          <p>Pick the right plan based on whether you need hands-free AI Review Replies and single vs multi-location scale. Test risk-free with our 3-day trial.</p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th style={{ width: '26%' }}>Feature</th>
                <th className="trial-col">
                  <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#166534', fontWeight: 800 }}>Risk-Free</span>
                  3-Day Free Trial
                </th>
                <th>Standard Monthly</th>
                <th className="yearly-col">Standard Yearly</th>
                <th className="pro-col">Pro Monthly</th>
                <th className="pro-col">Pro Yearly</th>
                <th>Agency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature-name">Business Locations</td>
                <td className="tbl-text trial-col">1 Location</td>
                <td className="tbl-text">1 Location</td>
                <td className="tbl-text yearly-col">1 Location</td>
                <td className="tbl-text pro-col">1 Location</td>
                <td className="tbl-text pro-col">1 Location</td>
                <td className="tbl-text"><strong>Multiple</strong></td>
              </tr>
              <tr>
                <td className="feature-name" style={{ color: '#15803d' }}><strong>Automatic AI Review Reply</strong></td>
                <td className="trial-col"><span className="tbl-cross"><i className="fa-solid fa-xmark"></i> No</span></td>
                <td><span className="tbl-cross"><i className="fa-solid fa-xmark"></i> No</span></td>
                <td className="yearly-col"><span className="tbl-cross"><i className="fa-solid fa-xmark"></i> No</span></td>
                <td className="pro-col"><span className="tbl-check"><i className="fa-solid fa-check"></i> Yes (24/7)</span></td>
                <td className="pro-col"><span className="tbl-check"><i className="fa-solid fa-check"></i> Yes (24/7)</span></td>
                <td><span className="tbl-cross"><i className="fa-solid fa-xmark"></i> No</span></td>
              </tr>
              {[
                ['Human-Like AI Written Reviews', true, true, true, true, true, true],
                ['Custom Keywords, Services, Products & Staff', true, true, true, true, true, true],
                ['Emoji Support & Multiple Review Styles', true, true, true, true, true, true],
                ['Personalized AI Review Suggestions', true, true, true, true, true, true],
                ['Smart & Customizable Google Review QR Code', true, true, true, true, true, true],
                ['Printable QR Standee & Direct Review Link', true, true, true, true, true, true],
                ['Review, Rating & Growth Analytics', true, true, true, true, true, true],
                ['AI Google Business Profile Analyzer', true, true, true, true, true, true],
                ['Customer Review Tracking', true, true, true, true, true, true],
                ['No Review Drop / Loss Guarantee', false, true, true, true, true, true],
                ['100% Ad-Free Funnel Experience', false, true, true, true, true, true],
                ['Priority Support', false, true, true, true, true, true]
              ].map(([feat, tr, sm, sy, pm, py, ag]) => (
                <tr key={feat}>
                  <td className="feature-name">{feat}</td>
                  <td className="trial-col">
                    {tr ? <span className="tbl-check"><i className="fa-solid fa-check"></i></span> : <span className="tbl-cross"><i className="fa-solid fa-xmark"></i></span>}
                  </td>
                  <td>
                    {sm ? <span className="tbl-check"><i className="fa-solid fa-check"></i></span> : <span className="tbl-cross"><i className="fa-solid fa-xmark"></i></span>}
                  </td>
                  <td className="yearly-col">
                    {sy ? <span className="tbl-check"><i className="fa-solid fa-check"></i></span> : <span className="tbl-cross"><i className="fa-solid fa-xmark"></i></span>}
                  </td>
                  <td className="pro-col">
                    {pm ? <span className="tbl-check"><i className="fa-solid fa-check"></i></span> : <span className="tbl-cross"><i className="fa-solid fa-xmark"></i></span>}
                  </td>
                  <td className="pro-col">
                    {py ? <span className="tbl-check"><i className="fa-solid fa-check"></i></span> : <span className="tbl-cross"><i className="fa-solid fa-xmark"></i></span>}
                  </td>
                  <td>
                    {ag ? <span className="tbl-check"><i className="fa-solid fa-check"></i></span> : <span className="tbl-cross"><i className="fa-solid fa-xmark"></i></span>}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="feature-name">Pricing / Billing Cycle</td>
                <td className="tbl-text trial-col"><strong style={{ color: '#16a34a' }}>Free (3 Days)</strong></td>
                <td className="tbl-text">₹199/mo</td>
                <td className="tbl-text yearly-col"><strong>₹1999/yr</strong></td>
                <td className="tbl-text pro-col">₹299/mo</td>
                <td className="tbl-text pro-col"><strong>₹2999/yr</strong></td>
                <td className="tbl-text"><strong>WhatsApp</strong></td>
              </tr>
              <tr>
                <td className="feature-name">Get Started</td>
                <td className="trial-col">
                  <button className="pricing-cta cta-primary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', borderRadius: 8 }} onClick={() => navigate('Account')}>
                    Start Free
                  </button>
                </td>
                <td>
                  <button className="pricing-cta cta-outline" style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', borderRadius: 8 }} onClick={() => choosePlan('Starter', 'Monthly')}>
                    Choose
                  </button>
                </td>
                <td className="yearly-col">
                  <button className="pricing-cta cta-primary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', borderRadius: 8 }} onClick={() => choosePlan('Starter', 'Yearly')}>
                    Choose
                  </button>
                </td>
                <td className="pro-col">
                  <button className="pricing-cta cta-outline" style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', borderRadius: 8 }} onClick={() => choosePlan('Pro', 'Monthly')}>
                    Choose
                  </button>
                </td>
                <td className="pro-col">
                  <button className="pricing-cta cta-primary" style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', borderRadius: 8 }} onClick={() => choosePlan('Pro', 'Yearly')}>
                    Choose
                  </button>
                </td>
                <td>
                  <a
                    href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business Plan for StarReview AI.")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pricing-cta cta-outline"
                    style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem', borderRadius: 8 }}
                  >
                    Inquire
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
          <i className="fa-solid fa-circle-info" style={{ color: '#16a34a', marginRight: '0.35rem' }}></i>
          All accounts start with our instant 3-day free trial. Experience human-like AI review drafting and smart Google Review QR funnels before deciding to upgrade.
        </div>
      </div>
    </section>
  );

  return (
    <>
      {page !== 'Review' && (
        <header className="header">
          <button className="brand" onClick={() => navigate('Home')}>
            <span className="brand-mark">✦</span>
            <span>StarReview <b>AI</b></span>
          </button>
          <button className="menu-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle menu">☰</button>
          <nav className={menu ? 'nav open' : 'nav'}>
            {navItems.map(n => (
              <button key={n} onClick={() => navigate(n)}>{n}</button>
            ))}
            <button onClick={() => navigate('Dashboard')}>Dashboard</button>
          </nav>
          <div className="header-actions">
            <button className="text-btn" onClick={() => navigate('Account')}>{user ? 'My account' : 'Sign in'}</button>
            <button className="btn btn-dark btn-sm" onClick={() => navigate('Account')}>Start free <span>↗</span></button>
          </div>
        </header>
      )}

      {/* ====================================================================
          HOMEPAGE (ORIGINAL STARREVIEW AI DESIGN + REVIEWFLOW WORKING SECTIONS)
          ==================================================================== */}
      {page === 'Home' && (
        <>
          <main>
            {/* 1. ORIGINAL HERO SECTION */}
            <section className="hero wrap">
              <div className="hero-copy">
                <div className="eyebrow"><span className="pulse"></span> SMARTER CUSTOMER FEEDBACK</div>
                <h1>Turn great service into <em>great reviews.</em></h1>
                <p className="hero-sub">A simpler way to collect genuine customer feedback, create review drafts with AI, and understand what your customers love.</p>
                <div className="hero-cta">
                  <button className="btn btn-dark" onClick={() => navigate('Account')}>Get started free <span>↗</span></button>
                  <button className="btn btn-light" onClick={() => navigate('How it works')}>Explore how it works <span>▶</span></button>
                </div>
                <div className="hero-note">
                  <span>✓ No credit card required</span>
                  <span>✓ 3-day free trial</span>
                  <span>✓ Your customers stay in control</span>
                </div>
              </div>
              <div className="hero-art">
                <div className="art-glow"></div>
                <div className="float-pill pill-top">✦ AI-powered drafts <span className="pill-dot"></span></div>
                <div className="review-card">
                  <div className="review-card-top">
                    <div className="avatar">SR</div>
                    <div><b>Customer experience</b><small>Just now · Example preview</small></div>
                    <span className="dots">•••</span>
                  </div>
                  <div className="stars">★★★★★</div>
                  <h3>“Such a lovely experience!”</h3>
                  <p>The team was welcoming, attentive, and made everything feel effortless. I’ll definitely be back.</p>
                  <div className="card-divider"></div>
                  <div className="ai-label">✦ Suggested response</div>
                  <p className="reply">Thank you for your kind words! We’re so glad you had a great experience and look forward to welcoming you again.</p>
                  <button className="copy-demo" onClick={() => copy('Thank you for your kind words! We’re so glad you had a great experience and look forward to welcoming you again.')}>Copy response ↗</button>
                </div>
                <div className="float-pill pill-bottom"><span className="green-check">✓</span> Feedback made simple</div>
                <div className="sparkle s1">✳</div>
                <div className="sparkle s2">✦</div>
              </div>
            </section>

            {/* 2. ORIGINAL TRUST STRIP */}
            <section className="trust-strip">
              <div className="wrap trust-inner">
                <span>BUILT FOR EVERYDAY BUSINESSES</span>
                <div>Restaurants</div>
                <div>Wellness &amp; beauty</div>
                <div>Clinics</div>
                <div>Retail</div>
                <div>Local services</div>
              </div>
            </section>

            {/* 3. ORIGINAL FEATURES SECTION */}
            <section className="section wrap">
              <div className="section-heading">
                <div className="eyebrow">THE STARREVIEW ADVANTAGE</div>
                <h2>Good experiences deserve<br />to be <em>heard.</em></h2>
                <p>Everything you need to make feedback easier for customers and more useful for your team.</p>
              </div>
              <div className="feature-grid">
                {features.map(f => (
                  <article className="feature-card" key={f[1]}>
                    <div className="feature-icon">{f[0]}</div>
                    <h3>{f[1]}</h3>
                    <p>{f[2]}</p>
                    <button className="learn-link" onClick={() => navigate('Features')}>Learn more <span>↗</span></button>
                  </article>
                ))}
              </div>
            </section>

            {/* 4. LIVE DEMO BAND */}
            <section className="demo-band">
              <div className="wrap demo-layout">
                <div>
                  <div className="eyebrow">TRY THE LIVE DEMO</div>
                  <h2>Make it easy to say<br /><em>something wonderful.</em></h2>
                  <p>Explore a sample customer flow. Choose a rating, describe a real experience, and see editable draft suggestions.</p>
                  <button className="btn btn-dark" onClick={() => navigate('Try the demo')}>Try review assistant <span>↗</span></button>
                </div>
                <div className="mini-dashboard">
                  <div className="mini-top">
                    <span className="mini-logo">✦</span>
                    <div><b>Review assistant</b><small>Interactive demo</small></div>
                    <span className="live-tag">DEMO</span>
                  </div>
                  <div className="mini-question">How was your experience?</div>
                  <div className="mini-stars">★★★★★</div>
                  <div className="mini-line"></div>
                  <div className="mini-line short"></div>
                  <div className="mini-suggestion">
                    <span>✦</span>
                    <div><b>Ready to draft</b><small>Personalized suggestions in seconds</small></div>
                    <span>↗</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. 24/7 AUTOPILOT REVIEW REPLY SHOWCASE (FROM REVIEWFLOW IN STARREVIEW PALETTE) */}
            <div className="wrap">
              <div className="sr-reply-showcase">
                <div>
                  <span className="sr-reply-badge">✦ 24/7 Autopilot Reputation Engine</span>
                  <h2>Never leave a customer waiting: <em>AI review replies.</em></h2>
                  <p>Respond to 100% of your Google reviews in seconds. Our autonomous AI engine analyzes customer sentiment, matches your brand voice, and publishes authentic responses straight to Google Maps on complete autopilot.</p>
                  <ul className="sr-reply-bullets">
                    <li className="sr-reply-bullet"><i className="fa-solid fa-circle-check"></i> <div><strong>Instant 24/7 Autopilot:</strong> Direct Google Business Profile publishing within minutes of review receipt.</div></li>
                    <li className="sr-reply-bullet"><i className="fa-solid fa-circle-check"></i> <div><strong>Sentiment-Aware Intelligence:</strong> Gratitude for 5-star reviews, empathetic resolution for low ratings.</div></li>
                    <li className="sr-reply-bullet"><i className="fa-solid fa-circle-check"></i> <div><strong>Local SEO Keyword Injections:</strong> Mentions your top services and city naturally to boost rankings.</div></li>
                  </ul>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button className="btn btn-white" onClick={() => navigate('Account')}>Activate Autopilot Replies <span>↗</span></button>
                    <button className="btn btn-light" onClick={() => navigate('Reply assistant')}>Try Reply Assistant</button>
                  </div>
                </div>
                <div className="sr-reply-mock">
                  <div className="sr-reply-mock-header">
                    <span>✦ Live Auto-Reply Engine</span>
                    <span style={{ color: '#82c99b' }}>AUTOPILOT ACTIVE</span>
                  </div>
                  <div className="sr-reply-mock-rev">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <b style={{ fontSize: 12 }}>Sarah Jenkins</b>
                      <span style={{ color: '#e9aa35' }}>★★★★★</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 11, color: '#d3e2d7', lineHeight: 1.5 }}>
                      "Absolutely thrilled with the prompt service and attention to detail. The team was so kind and professional!"
                    </p>
                  </div>
                  <div className="sr-reply-mock-box">
                    <div style={{ fontSize: 10, color: '#82c99b', fontWeight: 800, marginBottom: 4 }}>
                      ✦ Automated Response · Live on Google in 38s
                    </div>
                    <p style={{ margin: 0, fontSize: 11, fontStyle: 'italic', color: '#ffffff', lineHeight: 1.5 }}>
                      "Hi Sarah! Thank you so much for your wonderful 5-star review! 😊 We're delighted you experienced our prompt customer service and professional team!"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. HOW IT WORKS IN 3 SIMPLE STEPS */}
            <section className="section wrap steps-section">
              <div className="section-heading">
                <div className="eyebrow">THE 3-STEP MAGIC FLOW</div>
                <h2>How It Works In <em>3 Simple Steps</em></h2>
                <p>A friction-free mobile review flow that turns in-store visitors into published 5-star Google Business reviews on autopilot.</p>
              </div>
              <div className="sr-steps-list" style={{ marginTop: 24 }}>
                {/* Step 1 */}
                <div className="sr-step-card">
                  <div className="sr-step-info">
                    <div className="sr-step-tag"><i className="fa-solid fa-qrcode"></i> Step 1: Scan &amp; Launch</div>
                    <h3>Customer Scans Your Google Business Review QR</h3>
                    <p>Display your designer Google Review QR standee on dining tables, counters or bills. Patrons point their phone camera — no app required.</p>
                    <ul className="sr-step-bullets">
                      <li><i className="fa-solid fa-circle-check"></i> Instant browser launch in under 1 second on iOS and Android</li>
                      <li><i className="fa-solid fa-circle-check"></i> Customized with your business branding, logo, and friendly greeting</li>
                      <li><i className="fa-solid fa-circle-check"></i> Supports 24+ languages with instant language selection</li>
                    </ul>
                  </div>
                  <div className="sr-step-preview">
                    <div className="sr-phone-mockup">
                      <div className="sr-mockup-header">
                        <div className="sr-mockup-avatar"><i className="fa-solid fa-store"></i></div>
                        <div>
                          <div className="sr-mockup-biz-name">Your Google Business Profile</div>
                          <div className="sr-mockup-biz-sub">Google Maps Verified Listing</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'center', padding: '6px 0' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#17251c', margin: '0 0 4px' }}>How was your visit today?</p>
                        <span style={{ fontSize: 10, color: '#768578' }}>Tap stars to share feedback</span>
                        <div className="sr-mockup-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
                      </div>
                      <div className="sr-mockup-btn">
                        <i className="fa-solid fa-hand-pointer"></i> Customer taps 5 Stars
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="sr-step-card reverse">
                  <div className="sr-step-info">
                    <div className="sr-step-tag"><i className="fa-solid fa-wand-magic-sparkles"></i> Step 2: AI Magic Reviews</div>
                    <h3>AI-Powered Review Generation &amp; Smart Filter</h3>
                    <p>StarReview AI solves customer writer's block while shielding your public reputation:</p>
                    <ul className="sr-step-bullets">
                      <li><i className="fa-solid fa-circle-check"></i> <div><strong>Happy Customers (4–5 Stars):</strong> 3 personalized AI review drafts with target SEO keywords.</div></li>
                      <li><i className="fa-solid fa-circle-check"></i> <div><strong>Unhappy Customers (1–3 Stars):</strong> Routed to private feedback form before negative reviews hit Google.</div></li>
                    </ul>
                  </div>
                  <div className="sr-step-preview">
                    <div className="sr-phone-mockup">
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1b4d2e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <i className="fa-solid fa-sparkles"></i> AI Generated Review Suggestions:
                      </div>
                      <div className="sr-mockup-draft-chip">
                        "Outstanding service and very polite staff! Everything was quick and high quality. Will definitely return! ⭐⭐⭐⭐⭐"
                      </div>
                      <div className="sr-mockup-draft-chip alt">
                        "Superb experience from start to finish. Clean atmosphere and very professional team. Highly recommend!"
                      </div>
                      <div className="sr-mockup-shield">
                        <i className="fa-solid fa-shield-halved"></i>
                        <div><strong>Private Feedback Shield:</strong> 1-3 star ratings stay private for your eyes only.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="sr-step-card">
                  <div className="sr-step-info">
                    <div className="sr-step-tag"><i className="fa-brands fa-google"></i> Step 3: Google Maps 1-Tap Post</div>
                    <h3>1-Tap Copy &amp; Publish to Google My Business</h3>
                    <p>The review is automatically copied to clipboard. Tapping "Continue to Google" opens Google Maps directly with 5 stars selected!</p>
                    <ul className="sr-step-bullets">
                      <li><i className="fa-solid fa-circle-check"></i> Automatically opens Google Maps on customer's logged-in account</li>
                      <li><i className="fa-solid fa-circle-check"></i> Injected service keywords boost your Google Business Profile local search rank</li>
                      <li><i className="fa-solid fa-circle-check"></i> Boosts Google Maps 3-Pack local ranking with authentic keyword velocity</li>
                    </ul>
                    <div style={{ marginTop: 20 }}>
                      <button className="btn btn-dark btn-sm" onClick={() => navigate('How it works')}>Explore full roadmap &amp; comparison <span>↗</span></button>
                    </div>
                  </div>
                  <div className="sr-step-preview">
                    <div className="sr-phone-mockup" style={{ textAlign: 'center', padding: '16px 14px' }}>
                      <div className="sr-copied-badge"><i className="fa-solid fa-check"></i></div>
                      <div style={{ fontWeight: 800, color: '#17251c', fontSize: 15, marginBottom: 4 }}>Review Copied!</div>
                      <p style={{ fontSize: 11, color: '#68776b', margin: '0 0 14px' }}>Paste and publish to Google in 1 tap.</p>
                      <div className="sr-mockup-btn blue" style={{ cursor: 'pointer' }} onClick={() => copy("Outstanding service and very polite staff! Everything was quick and high quality. Will definitely return!")}>
                        <i className="fa-brands fa-google"></i> Continue to Google Reviews
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. INDUSTRIES GRID (FROM REVIEWFLOW IN STARREVIEW PALETTE) */}
            <section className="wrap" style={{ paddingBottom: 60 }}>
              <div className="section-heading" style={{ marginBottom: 20 }}>
                <div className="eyebrow">WORKS FOR EVERY LOCAL BUSINESS</div>
                <h2>Built for <em>all local industries.</em></h2>
              </div>
              <div className="sr-ind-grid">
                {industries.map(item => (
                  <div className="sr-ind-card" key={item.name}>
                    <i className={item.icon}></i>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. STATS STRIP */}
            <section className="sr-stats-strip">
              <div className="wrap sr-stats-inner">
                <div>
                  <div className="sr-stat-val">84.6%</div>
                  <div className="sr-stat-lbl">Avg. Conversion Rate</div>
                </div>
                <div>
                  <div className="sr-stat-val">1,200+</div>
                  <div className="sr-stat-lbl">Active Businesses</div>
                </div>
                <div>
                  <div className="sr-stat-val">5★</div>
                  <div className="sr-stat-lbl">Average Google Rating</div>
                </div>
                <div>
                  <div className="sr-stat-val">10s</div>
                  <div className="sr-stat-lbl">Average Review Time</div>
                </div>
              </div>
            </section>

            {/* 9. EXACT PRICING SECTION (FROM USER SCREENSHOT) */}
            {renderPricingSection()}

            {/* 10. TESTIMONIALS (FROM REVIEWFLOW IN STARREVIEW PALETTE) */}
            <section className="section wrap" style={{ paddingTop: 40, paddingBottom: 60 }}>
              <div className="section-heading">
                <div className="eyebrow">CUSTOMER STORIES</div>
                <h2>Trusted by <em>local businesses.</em></h2>
                <p>See how everyday businesses use StarReview AI to protect and grow their Google reputation.</p>
              </div>
              <div className="sr-test-grid">
                {testimonials.map((t, idx) => (
                  <div className="sr-test-card" key={idx}>
                    <div style={{ color: '#e9aa35', fontSize: 13, letterSpacing: 2 }}>{t.stars}</div>
                    <p className="sr-test-text">"{t.text}"</p>
                    <div className="sr-test-author">
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 10 }}>SR</div>
                      <div>
                        <b style={{ fontSize: 11, display: 'block' }}>{t.author}</b>
                        <small style={{ color: '#7b877d', fontSize: 10 }}>{t.role}</small>
                      </div>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#3b7a4e', fontWeight: 700 }}>
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 11. FAQ */}
            <section className="section wrap" style={{ paddingTop: 20 }}>
              <div className="section-heading">
                <div className="eyebrow">FAQ</div>
                <h2>Questions, <em>answered.</em></h2>
              </div>
              <div className="faq">
                {[
                  ['How does StarReview AI work?', 'Customers scan your QR code, rate their visit and, if happy, get three editable review drafts to copy and post on Google. Unhappy customers are sent to a private feedback form instead.'],
                  ['Does it post reviews for customers?', 'No. Customers always copy, edit and post their own review. Nothing is posted automatically without customer action.'],
                  ['Which languages are supported?', 'Drafts can be created in 24 languages, including Hindi, Hinglish and Gujarati.'],
                  ['Can I customize the QR flyer?', 'Yes. Choose your brand color, headline and text, then download a print-ready A6 flyer.'],
                  ['What does the free trial include?', 'All features for 3 days, with no credit card required.']
                ].map(q => (
                  <details key={q[0]}>
                    <summary>{q[0]}</summary>
                    <p>{q[1]}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* 12. CTA WRAP */}
            <section className="cta-wrap wrap">
              <div className="cta-card">
                <div>
                  <div className="eyebrow">YOUR NEXT GREAT REVIEW STARTS HERE</div>
                  <h2>Make every customer voice <em>count.</em></h2>
                  <p>Start your 3-day free trial and set up your review page in minutes.</p>
                </div>
                <button className="btn btn-white" onClick={() => navigate('Account')}>Get started free <span>↗</span></button>
              </div>
            </section>
          </main>
        </>
      )}

      {/* ====================================================================
          PRICING PAGE
          ==================================================================== */}
      {page === 'Pricing' && (
        <main className="wrap vs-page-wrapper" style={{ paddingTop: 20 }}>
          {renderPricingSection()}
        </main>
      )}

      {/* ====================================================================
          FEATURES PAGE
          ==================================================================== */}
      {page === 'Features' && (
        <PageShell title="Tools to build trust, thoughtfully." subtitle="A connected toolkit for feedback collection, AI-assisted writing, and reputation insights.">
          <div className="feature-grid">
            {features.map(f => (
              <article className="feature-card" key={f[1]}>
                <div className="feature-icon">{f[0]}</div>
                <h3>{f[1]}</h3>
                <p>{f[2]}</p>
                <button className="learn-link" onClick={() => navigate(toolTarget[f[1]] || 'Dashboard')}>Open tool ↗</button>
              </article>
            ))}
          </div>
          <div className="notice">Note: AI drafts in languages other than English need an AI key on the server. Replies are generated for you to copy and post. Automatic publishing to Google needs approved Google Business Profile API access and is not included.</div>
        </PageShell>
      )}

      {/* ====================================================================
          HOW IT WORKS PAGE (FULL REVIEWFLOW 3-STEP ROADMAP IN STARREVIEW PALETTE)
          ==================================================================== */}
      {page === 'How it works' && (
        <main className="wrap sr-works-page">
          {/* HERO SECTION */}
          <section className="sr-works-hero">
            <div className="eyebrow">
              <span className="pulse"></span> THE GOOGLE MAGIC REVIEW QR EXPERIENCE
            </div>
            <h1>How <span>StarReview AI</span> Turns Customers into 5-Star Reviews</h1>
            <p>
              We generate review QR codes for Google My Business. See how our <strong>Google Magic Review QR</strong> helps your customers write and post authentic 5-star Google reviews in 3 easy steps.
            </p>

            {/* Quick Metrics Bar */}
            <div className="sr-metrics-bar">
              <div className="sr-metric-item">
                <div className="sr-metric-val">10 <span>Sec</span></div>
                <div className="sr-metric-lbl">Scan to Publish</div>
              </div>
              <div className="sr-metric-item">
                <div className="sr-metric-val">3.4<span>x</span></div>
                <div className="sr-metric-lbl">Review Conversion Rate</div>
              </div>
              <div className="sr-metric-item">
                <div className="sr-metric-val">100<span>%</span></div>
                <div className="sr-metric-lbl">Zero App Required</div>
              </div>
            </div>
          </section>

          {/* 3-STEP VISUAL ROADMAP */}
          <section className="sr-roadmap-section">
            <div className="section-heading">
              <div className="eyebrow">THE 3-STEP FLOW</div>
              <h2>How It Works In <em>3 Simple Steps</em></h2>
              <p>A friction-free mobile review flow that turns satisfied in-store visitors into published 5-star Google Business reviews on autopilot.</p>
            </div>

            <div className="sr-steps-list">
              {/* STEP 1 */}
              <div className="sr-step-card">
                <div className="sr-step-info">
                  <div className="sr-step-tag"><i className="fa-solid fa-qrcode"></i> Step 1: Scan &amp; Launch</div>
                  <h3>Customer Scans Your Google Business Review QR</h3>
                  <p>Display your designer <strong>Google Business Review QR</strong> standee on dining tables, checkout counters, reception desks, or invoices. The customer points their phone camera — no app download or sign-up needed.</p>
                  <ul className="sr-step-bullets">
                    <li><i className="fa-solid fa-circle-check"></i> Instant browser launch in under 1 second on both iOS and Android</li>
                    <li><i className="fa-solid fa-circle-check"></i> Tailored with your business branding, logo, and friendly custom greeting</li>
                    <li><i className="fa-solid fa-circle-check"></i> Supports 24+ languages with instant language selection for international and regional patrons</li>
                  </ul>
                </div>
                <div className="sr-step-preview">
                  <div className="sr-phone-mockup">
                    <div className="sr-mockup-header">
                      <div className="sr-mockup-avatar"><i className="fa-solid fa-store"></i></div>
                      <div>
                        <div className="sr-mockup-biz-name">Your Google Business Profile</div>
                        <div className="sr-mockup-biz-sub">Google Maps Verified Listing</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#17251c', margin: '0 0 4px' }}>How was your visit today?</p>
                      <span style={{ fontSize: 11, color: '#768578' }}>Tap stars to share feedback</span>
                      <div className="sr-mockup-stars">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                      </div>
                    </div>
                    <div className="sr-mockup-btn">
                      <i className="fa-solid fa-hand-pointer"></i> Customer taps 5 Stars
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2 */}
              <div className="sr-step-card reverse">
                <div className="sr-step-info">
                  <div className="sr-step-tag"><i className="fa-solid fa-wand-magic-sparkles"></i> Step 2: AI Magic Reviews</div>
                  <h3>AI-Powered Review Generation &amp; Smart Filter</h3>
                  <p><strong>StarReview AI</strong> instantly solves customer writer's block while shielding your business reputation:</p>
                  <ul className="sr-step-bullets">
                    <li><i className="fa-solid fa-circle-check"></i> <div><strong>Happy Customers (4–5 Stars):</strong> Given 3 personalized, human-like AI review options infused with your target SEO keywords (friendly staff, speedy service, signature products).</div></li>
                    <li><i className="fa-solid fa-circle-check"></i> <div><strong>Unhappy Customers (1–3 Stars):</strong> Safely guided to a private internal feedback form sent straight to you, solving grievances before a public negative review hits Google.</div></li>
                  </ul>
                </div>
                <div className="sr-step-preview">
                  <div className="sr-phone-mockup">
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1b4d2e', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="fa-solid fa-sparkles"></i> AI Generated Review Suggestions:
                    </div>
                    <div className="sr-mockup-draft-chip">
                      "Outstanding service and very polite staff! Everything was quick and high quality. Will definitely return! ⭐⭐⭐⭐⭐"
                    </div>
                    <div className="sr-mockup-draft-chip alt">
                      "Superb experience from start to finish. Clean atmosphere and very professional team. Highly recommend!"
                    </div>
                    <div className="sr-mockup-shield">
                      <i className="fa-solid fa-shield-halved"></i>
                      <div><strong>Private Feedback Shield:</strong> 1-3 star ratings stay private for your eyes only.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="sr-step-card">
                <div className="sr-step-info">
                  <div className="sr-step-tag"><i className="fa-brands fa-google"></i> Step 3: Google Maps 1-Tap Post</div>
                  <h3>1-Tap Copy &amp; Publish to Google My Business</h3>
                  <p>The chosen review is automatically copied to the customer's phone clipboard. With one tap on "Continue to Google", Google Maps opens with 5 stars selected — the customer simply taps "Paste" and "Post"!</p>
                  <ul className="sr-step-bullets">
                    <li><i className="fa-solid fa-circle-check"></i> Automatically opens Google Maps on their logged-in Google account</li>
                    <li><i className="fa-solid fa-circle-check"></i> Injected service keywords boost your Google Business Profile local search rank</li>
                    <li><i className="fa-solid fa-circle-check"></i> Your monthly review velocity climbs, outranking competitors in the Google Maps 3-Pack</li>
                  </ul>
                </div>
                <div className="sr-step-preview">
                  <div className="sr-phone-mockup" style={{ textAlign: 'center', padding: '16px 14px' }}>
                    <div className="sr-copied-badge">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <div style={{ fontWeight: 800, color: '#17251c', fontSize: 15, marginBottom: 4 }}>Review Copied!</div>
                    <p style={{ fontSize: 11, color: '#68776b', margin: '0 0 16px' }}>Click below to open Google Maps and paste your review in 1 tap.</p>
                    <div className="sr-mockup-btn blue" style={{ cursor: 'pointer' }} onClick={() => copy("Outstanding service and very polite staff! Everything was quick and high quality. Will definitely return!")}>
                      <i className="fa-brands fa-google"></i> Continue to Google Reviews
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRADITIONAL VS STARREVIEW COMPARISON SECTION */}
          <section className="sr-compare-section">
            <div className="section-heading">
              <div className="eyebrow">HEAD TO HEAD COMPARISON</div>
              <h2>Normal QR Code vs <em>Google Magic Review QR</em></h2>
              <p>Why standard Google QR codes fail to produce results, and how our <strong>Google Magic Review QR</strong> delivers 300%+ more reviews.</p>
            </div>

            <div className="sr-compare-grid">
              {/* Bad Way */}
              <div className="sr-compare-box sr-compare-bad">
                <h4><i className="fa-solid fa-circle-xmark"></i> Standard Google Review QR</h4>
                <ul>
                  <li><i className="fa-solid fa-xmark"></i> Forces patrons to write reviews in an intimidating blank box (70%+ abandonment rate).</li>
                  <li><i className="fa-solid fa-xmark"></i> Zero defense against unhappy guests posting instant 1-star ratings publicly.</li>
                  <li><i className="fa-solid fa-xmark"></i> Short reviews lack the keywords required to climb Google Maps rankings.</li>
                  <li><i className="fa-solid fa-xmark"></i> No scan tracking, copy metrics, or funnel conversion visibility.</li>
                </ul>
              </div>

              {/* Good Way */}
              <div className="sr-compare-box sr-compare-good">
                <h4><i className="fa-solid fa-circle-check"></i> StarReview AI – Magic Review QR</h4>
                <ul>
                  <li><i className="fa-solid fa-check"></i> Instant, human-like AI written reviews eliminate writer's block in 10 seconds.</li>
                  <li><i className="fa-solid fa-check"></i> Private sentiment filter routes 1-3 star feedback internally before Google sees it.</li>
                  <li><i className="fa-solid fa-check"></i> Automatically embeds your target business services and location SEO keywords.</li>
                  <li><i className="fa-solid fa-check"></i> Comprehensive dashboard tracks scans, AI generations, and clipboard copies.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* CTA CARD */}
          <div className="cta-wrap">
            <div className="cta-card">
              <div>
                <div className="eyebrow">READY TO GROW?</div>
                <h2>Ready to turn visits into<br /><em>5-star Google reviews?</em></h2>
                <p>Join businesses boosting review conversion with smart QR and AI assistance.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn btn-dark" onClick={() => navigate('Account')}>Get started free <span>↗</span></button>
                <button className="btn btn-white" onClick={() => navigate('Try the demo')}>Try live demo <span>▶</span></button>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          AI VS QR COMPARISON PAGE (FULL REVIEWFLOW STYLE IN STARREVIEW THEME)
          ==================================================================== */}
      {page === 'AI vs QR' && (
        <main className="wrap vs-page-wrapper">
          {/* 1. HERO SECTION */}
          <section className="vs-hero">
            <div className="vs-hero-shell">
              <div className="vs-hero-copy">
                <div className="vs-badge">
                  <i className="fa-solid fa-code-compare"></i> Google Magic Review QR vs Normal QR
                </div>
                <h1>Standard QR Codes Only Redirect.<br /><span>StarReview AI Helps Customers Write 5-Star Reviews.</span></h1>
                <p>
                  Compare a standard, static <strong>Google Business Review QR</strong> with the <strong>Google Magic Review QR</strong> powered by <strong>StarReview AI</strong>. Discover how an <strong>AI-Powered Review QR</strong> guides customers, personalizes authentic review drafts, supports 24+ languages, and boosts your <strong>Google My Business Review QR</strong> conversion rate by 300%.
                </p>
                <div className="vs-hero-actions">
                  <button className="btn btn-dark" onClick={() => navigate('Account')}>
                    Start 3-Day Free Trial <i className="fa-solid fa-arrow-right" style={{ marginLeft: 6 }}></i>
                  </button>
                  <button className="btn btn-light" onClick={() => {
                    const el = document.getElementById('comparison-table');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    <i className="fa-solid fa-table-columns" style={{ marginRight: 6 }}></i> View Full Comparison
                  </button>
                </div>
              </div>

              <div className="vs-hero-visual">
                <div className="compare-flow-card basic-flow">
                  <div className="flow-label">Normal QR Code</div>
                  <div className="flow-icon"><i className="fa-solid fa-qrcode"></i></div>
                  <strong>Scan → Google Box</strong>
                  <span>Blank screen &amp; writer's block</span>
                </div>
                <div className="flow-arrow"><i className="fa-solid fa-arrow-right"></i></div>
                <div className="compare-flow-card smart-flow">
                  <div className="flow-label">Google Magic Review QR</div>
                  <div className="flow-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                  <strong>Scan → AI Review Flow</strong>
                  <span>Instant personalized drafts</span>
                  <div className="mini-feature-row">
                    <span>24+ Languages</span>
                    <span>Keyword SEO</span>
                    <span>1-Tap Copy</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. SIDE-BY-SIDE SUMMARY CARDS */}
          <section className="vs-section-intro">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>SIDE-BY-SIDE COMPARISON</div>
            <h2>Normal QR Code vs Google Magic Review QR</h2>
            <p>The difference isn't the QR code itself — it is the frictionless experience that happens the second your customer scans it.</p>
          </section>

          <section className="vs-summary-grid">
            {/* Traditional QR Card */}
            <div className="summary-card traditional">
              <div className="card-topline">
                <span>Traditional Normal QR</span>
                <i className="fa-solid fa-arrow-right"></i>
                <span>Empty Google Form</span>
              </div>
              <div className="summary-chip bad">
                <i className="fa-solid fa-xmark"></i> Standard Static QR
              </div>
              <h3>Standard Google Review QR Code</h3>
              <p className="card-desc">A generic barcode that dumps customers directly into an intimidating, empty Google review text box with zero help or direction.</p>
              <ul className="summary-points bad">
                <li>
                  <span className="point-icon"><i className="fa-solid fa-xmark"></i></span>
                  <div>
                    <strong>Customer Writer's Block</strong>
                    <span>Customers stare at a blank text box, struggle to find words, and over 70% give up without posting anything.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-xmark"></i></span>
                  <div>
                    <strong>Weak Local SEO Value</strong>
                    <span>Reviews often end up as 1-word comments like "Good" or "Nice", missing your target keywords, services, and staff names.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-xmark"></i></span>
                  <div>
                    <strong>No Multi-Language Assistance</strong>
                    <span>Cannot adapt to international tourists or regional language speakers who prefer reviewing in their native tongue.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-xmark"></i></span>
                  <div>
                    <strong>Unfiltered Negative Public Reviews</strong>
                    <span>Unhappy customers post directly to Google Maps, damaging your public rating without giving you a chance to resolve issues.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-xmark"></i></span>
                  <div>
                    <strong>Zero Funnel Analytics</strong>
                    <span>You have no data on how many patrons scanned, how many copied drafts, or where drop-offs occurred.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* StarReview AI Card */}
            <div className="summary-card reviewflow">
              <div className="card-topline smart">
                <span>Google Magic Review QR</span>
                <i className="fa-solid fa-arrow-right"></i>
                <span>Smart AI Funnel</span>
              </div>
              <div className="summary-chip good">
                <i className="fa-solid fa-wand-magic-sparkles"></i> StarReview AI Magic QR
              </div>
              <h3>AI-Powered Review QR by StarReview AI</h3>
              <p className="card-desc">An intelligent <strong>Google Magic Review QR</strong> funnel that crafts human-like, keyword-optimized review options ready to publish in 10 seconds.</p>
              <ul className="summary-points good">
                <li>
                  <span className="point-icon"><i className="fa-solid fa-check"></i></span>
                  <div>
                    <strong>3 Human-Like AI Drafts</strong>
                    <span>Customers pick from 3 genuine, natural review variations tailored to their positive experience. Zero writer's block.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-check"></i></span>
                  <div>
                    <strong>Injected Google Business Review QR Keywords</strong>
                    <span>Drafts naturally incorporate your specific dishes, treatments, staff names, and local business SEO keywords.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-check"></i></span>
                  <div>
                    <strong>24+ Native Languages</strong>
                    <span>Customers choose English, Hindi, Spanish, Arabic, or regional languages with effortless 1-tap switching.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-check"></i></span>
                  <div>
                    <strong>Smart Negative Review Shield</strong>
                    <span>1 to 3 star ratings are directed to a private management feedback form, keeping your public Google score safe.</span>
                  </div>
                </li>
                <li>
                  <span className="point-icon"><i className="fa-solid fa-check"></i></span>
                  <div>
                    <strong>Real-Time Conversion Tracking</strong>
                    <span>Measure scan counts, generated reviews, clipboard copies, and actual Google My Business Review QR growth.</span>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* 3. DETAILED COMPARISON TABLE */}
          <section className="vs-table-section" id="comparison-table">
            <div className="vs-table-heading">
              <div className="vs-table-kicker">Feature Breakdown</div>
              <h2>Side-by-Side Capabilities</h2>
              <p>A detailed point-by-point comparison between basic QR codes and StarReview AI.</p>
            </div>

            <div className="vs-table-wrapper">
              <table className="vs-table">
                <thead>
                  <tr>
                    <th style={{ width: '38%' }}>Feature / Capability</th>
                    <th style={{ width: '31%' }}>Basic Review QR Code</th>
                    <th style={{ width: '31%' }} className="rf-col">StarReview AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['AI Review Draft Suggestions', 'Helps customers draft authentic feedback without writer\'s block', 'Blank Text Box', '3 Instant AI Drafts'],
                    ['Language Support & Reviewer Chooser', 'Multi-language generation with on-screen language dropdown', 'Single Language Only', '24+ Languages + Chooser'],
                    ['SEO Keyword, Staff & Service Injection', 'Injects your high-ranking business keywords into review drafts', 'None (Generic Text)', 'Custom Keywords & Staff'],
                    ['Natural Human-Style Writing & Emojis', 'Drafts written with natural conversational tone and appropriate emojis', 'Plain / None', 'Human Tone + Emojis'],
                    ['Negative Feedback Interceptor (1–3 Stars)', 'Routes poor customer ratings to private manager feedback', 'Goes Public on Google', 'Private Offline Form'],
                    ['1-Tap Copy & Auto-Redirect', 'Copies AI review draft to clipboard and opens Google Review popup', 'Manual Typing', '1-Tap Copy & Open Google'],
                    ['Review Customization & Length Limits', 'Configure review character count, tone, and active services', 'Not Configurable', 'Full Business Controls'],
                    ['Real-Time Interaction Tracking', 'Track QR scans, generated drafts, clicks, and copied reviews', 'Zero Tracking', 'Deep Activity Metrics'],
                    ['Printable Designer Standees', 'Custom A6 flyers and table tent cards ready for print', 'Raw Square QR Only', 'Ready-to-Print Standees']
                  ].map(([feat, desc, basicVal, smartVal]) => (
                    <tr key={feat}>
                      <td className="feature-title-cell">
                        {feat}
                        <small>{desc}</small>
                      </td>
                      <td>
                        <span className="status-pill no"><i className="fa-solid fa-xmark"></i> {basicVal}</span>
                      </td>
                      <td className="rf-col">
                        <span className="status-pill yes"><i className="fa-solid fa-check"></i> {smartVal}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. DEEP DIVE HIGHLIGHTS */}
          <section className="vs-deep-dive">
            <div className="deep-dive-grid">
              <div className="deep-dive-card">
                <div className="deep-dive-icon"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                <h4>Bypasses Writer's Block Instantly</h4>
                <p>Most satisfied customers genuinely want to leave 5 stars, but abandon when forced to compose a paragraph from scratch. Our <strong>Google Magic Review QR</strong> creates 3 distinct, authentic drafts ready to copy and post in seconds.</p>
              </div>

              <div className="deep-dive-card">
                <div className="deep-dive-icon"><i className="fa-solid fa-language"></i></div>
                <h4>24+ Native Languages &amp; On-Screen Chooser</h4>
                <p>Customers can select their preferred language directly on the review screen. The <strong>AI-Powered Review QR</strong> generates natural regional idioms and phrases, unlocking reviews from diverse demographic segments.</p>
              </div>

              <div className="deep-dive-card">
                <div className="deep-dive-icon"><i className="fa-solid fa-magnifying-glass-chart"></i></div>
                <h4>Supercharges Google Maps SEO</h4>
                <p>Google’s algorithm heavily ranks listings whose reviews mention specific high-intent keywords. StarReview AI seamlessly integrates your target services, menu items, and staff names into your <strong>Google My Business Review QR</strong> flow.</p>
              </div>
            </div>
          </section>

          {/* 5. UPGRADE CTA BANNER */}
          <section className="vs-cta-banner">
            <h2>Upgrade to Google Magic Review QR Today</h2>
            <p>Join smart business owners using <strong>StarReview AI</strong> to transform daily foot traffic into genuine, high-converting 5-star Google Business reviews effortlessly.</p>
            <button className="vs-cta-btn" onClick={() => navigate('Account')}>
              Start 3-Day Free Trial <i className="fa-solid fa-arrow-right"></i>
            </button>
          </section>
        </main>
      )}

      {/* ====================================================================
          DEMO CHECKOUT
          ==================================================================== */}
      {page === 'Demo checkout' && (
        <PageShell title="Demo checkout" subtitle="Practice the full payment journey without connecting to Razorpay or moving real money.">
          <div className="panel form-panel" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="demo-tag">SAFE DEMO · NO REAL PAYMENT</div>
            <h2 style={{ marginTop: 16 }}>Review your plan</h2>
            <label>
              Choose a plan
              <select value={demoPlan} onChange={e => { setDemoPlan(e.target.value); setDemoResult(''); }}>
                <option value="Starter">Starter — ₹199 / mo or ₹1,999 / yr</option>
                <option value="Pro">Pro (With Review Reply) — ₹299 / mo or ₹2,999 / yr</option>
              </select>
            </label>
            <label>
              Billing period
              <select value={demoPeriod} onChange={e => { setDemoPeriod(e.target.value); setDemoResult(''); }}>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </label>
            <div className="notice">
              <strong>{demoPlan} · {demoPeriod}</strong>
              <p>{demoPlan === 'Starter' ? (demoPeriod === 'Monthly' ? '₹199 per month' : '₹1,999 per year') : (demoPeriod === 'Monthly' ? '₹299 per month' : '₹2,999 per year')}</p>
              <small>This is a simulated checkout. No card, UPI PIN or bank details are requested. No money will be taken and no subscription will be activated.</small>
            </div>
            <div className="hero-cta" style={{ marginTop: 18 }}>
              <button className="btn btn-dark" onClick={() => setDemoResult('success')}>Simulate successful payment ✓</button>
              <button className="btn btn-light" onClick={() => setDemoResult('failed')}>Simulate failed payment</button>
            </div>
            {demoResult === 'success' && (
              <div className="notice" role="status" style={{ marginTop: 18 }}>
                <strong>Demo payment successful</strong>
                <p>Payment flow completed for practice. No money was taken and your plan has not been activated.</p>
                <button className="btn btn-dark" onClick={() => { setDemoResult(''); navigate('Pricing'); }}>Back to pricing</button>
              </div>
            )}
            {demoResult === 'failed' && (
              <div className="notice" role="status" style={{ marginTop: 18 }}>
                <strong>Demo payment failed</strong>
                <p>This is a simulated failure. No payment was attempted. You can retry the demo.</p>
                <button className="btn btn-dark" onClick={() => setDemoResult('')}>Try again</button>
              </div>
            )}
            <p className="tiny-note" style={{ marginTop: 18 }}>Demo only. This page does not load Razorpay Checkout and does not call any payment provider.</p>
          </div>
        </PageShell>
      )}

      {/* ====================================================================
          ACCOUNT / LOGIN / REGISTER
          ==================================================================== */}
      {page === 'Account' && (
        <PageShell title="Welcome to StarReview AI" subtitle={user ? 'You are signed in.' : 'Create an account to start your 3-day free trial, or sign in.'}>
          {user ? (
            <div className="account-card">
              <div className="brand-mark large-mark">✦</div>
              <h3>{user.email}</h3>
              <p>{user.subscription && user.access ? (user.subscription.plan === 'Trial' ? `Free trial active until ${new Date(user.subscription.expiresAt).toLocaleDateString()}` : `${user.subscription.plan} plan (${user.subscription.period}) active until ${new Date(user.subscription.expiresAt).toLocaleDateString()}`) : 'Your plan has expired. Choose a plan to reactivate your review page.'}</p>
              <button className="btn btn-dark full" onClick={() => navigate(user.access && user.subscription?.plan !== 'Trial' ? 'Dashboard' : 'Pricing')}>{user.access && user.subscription?.plan !== 'Trial' ? 'Open dashboard' : 'Choose a plan'} ↗</button>
              <button type="button" className="text-btn centered" onClick={() => navigate('Dashboard')}>Go to dashboard</button>
              <button type="button" className="text-btn centered" onClick={logout}>Sign out</button>
            </div>
          ) : (
            <form className="account-card" onSubmit={submitAuth}>
              <div className="brand-mark large-mark">✦</div>
              <h3>{regMode ? 'Create your account' : 'Sign in'}</h3>
              <p>{regMode ? 'No credit card needed. Your 3-day free trial starts now.' : 'Welcome back.'}</p>
              <label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" /></label>
              <label>Password<input type="password" required minLength="8" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" /></label>
              <button className="btn btn-dark full">{regMode ? 'Start free trial' : 'Sign in'}</button>
              <button type="button" className="text-btn centered" onClick={() => setRegMode(!regMode)}>{regMode ? 'Already have an account? Sign in' : 'New here? Start your free trial'}</button>
              <button type="button" className="text-btn centered" onClick={() => navigate('Dashboard')}>Explore the sample dashboard ↗</button>
            </form>
          )}
        </PageShell>
      )}

      {/* ====================================================================
          OTHER PAGES (ORIGINAL TOOLS)
          ==================================================================== */}
      {page === 'Try the demo' && (
        <PageShell title="Review assistant demo" subtitle="Use an honest experience you could genuinely share. Drafts are editable examples, not published reviews.">
          <div className="tool-layout">
            <div className="panel form-panel">
              <label>Business name<input value={business} onChange={e => setBusiness(e.target.value)} placeholder="Your business" /></label>
              <label>How was your experience?<div className="rating-select">{[1, 2, 3, 4, 5].map(n => <button key={n} className={rating >= n ? 'on' : ''} onClick={() => setRating(n)} aria-label={`${n} stars`}>★</button>)}</div></label>
              <label>Describe your real experience<textarea value={experience} onChange={e => setExperience(e.target.value)} rows="3" placeholder="What did you appreciate?" /></label>
              <label>Staff member (optional)<input value={staff} onChange={e => setStaff(e.target.value)} placeholder="e.g. Priya" /></label>
              <label>Service or keyword (optional)<input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="e.g. quick appointment" /></label>
              <label>Language<select value={language} onChange={e => setLanguage(e.target.value)}>{(cfg.languages || ['English', 'Hindi', 'Hinglish', 'Gujarati']).map(l => <option key={l}>{l}</option>)}</select></label>
              <button className="btn btn-dark full" onClick={generate} disabled={loading}>{loading ? 'Creating drafts…' : '✦ Generate drafts'}</button>
              <p className="tiny-note">Drafts are suggestions only. No review is ever posted automatically.</p>
            </div>
            <div className="panel drafts-panel">
              <div className="panel-heading"><div><div className="eyebrow">YOUR SUGGESTIONS</div><h3>Drafts you can edit</h3></div><span className="demo-tag">DEMO MODE</span></div>
              {drafts.length ? drafts.map((d, i) => (
                <div className="draft" key={i}>
                  <div className="draft-top"><b>Option {i + 1}</b><button className="copy-btn" onClick={() => copy(d)}>Copy ↗</button></div>
                  <p>{d}</p>
                </div>
              )) : (
                <div className="empty-state">
                  <div className="empty-icon">✦</div>
                  <h3>Your drafts will appear here</h3>
                  <p>Enter a business and describe a real experience, then generate suggestions.</p>
                </div>
              )}
            </div>
          </div>
        </PageShell>
      )}

      {page === 'QR flyer' && (
        <PageShell title="Create your review QR flyer" subtitle="Generate a QR code that opens your review page, WhatsApp or any link, and download a print-ready A6 flyer.">
          <QrFlyer key={myBusiness?.id || 'none'} business={myBusiness} cfg={cfg} notify={notify} navigate={navigate} />
        </PageShell>
      )}

      {page === 'Payment QR Demo' && (
        <PageShell title="Razorpay demo payment QR" subtitle="Generate a QR code customers can scan to open the safe demo checkout. No Razorpay connection or real payment is used.">
          <QrFlyer key={'payment-demo'} initialMode="paymentDemo" business={myBusiness} cfg={cfg} notify={notify} navigate={navigate} />
          <p className="fineprint">Demo only: scanning the code opens the built-in demo checkout where you can simulate successful and failed payment outcomes. No money is taken.</p>
        </PageShell>
      )}

      {page === 'Dashboard' && (
        <PageShell title="Your reputation hub" subtitle={user ? 'Live numbers from your review page.' : 'A sample dashboard. Sign in to see your own live numbers.'}>
          <Dashboard user={user} business={myBusiness} navigate={navigate} />
        </PageShell>
      )}

      {page === 'My business' && (
        <PageShell title="Your business profile" subtitle="These details power your customer review page, drafts and flyer.">
          <BusinessSetup user={user} business={myBusiness} setBusiness={setMyBusiness} notify={notify} navigate={navigate} cfg={cfg} />
        </PageShell>
      )}

      {page === 'Reply assistant' && (
        <PageShell title="Review reply assistant" subtitle="Paste a Google review and get a polite, sentiment-aware reply to copy and post.">
          <ReplyAssistant user={user} notify={notify} navigate={navigate} />
        </PageShell>
      )}

      {page === 'SEO analyzer' && (
        <PageShell title="Profile health and SEO analyzer" subtitle="Run a 20-point check of your Google Business Profile and compare yourself with local competitors.">
          <SeoAnalyzer user={user} business={myBusiness} setBusiness={setMyBusiness} notify={notify} />
        </PageShell>
      )}

      {page === 'Review' && (
        <ReviewFunnel slug={reviewSlug} notify={notify} />
      )}

      {page === 'Contact' && (
        <PageShell title="Let's talk about your feedback workflow." subtitle="Send us a message and we will get back to you soon.">
          <form className="contact-card" onSubmit={async e => {
            e.preventDefault();
            const form = e.currentTarget;
            const fields = form.querySelectorAll('input,select,textarea');
            try {
              const r = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: fields[0].value, email: fields[1].value, topic: fields[2].value, message: fields[3].value })
              });
              const raw = await r.text();
              let d = {};
              try { d = raw ? JSON.parse(raw) : {}; } catch {}
              notify(d.message || 'Inquiry saved.');
              form.reset();
            } catch (err) {
              notify(err.message || 'Could not send inquiry.');
            }
          }}>
            <label>Your name<input required placeholder="Full name" /></label>
            <label>Work email<input type="email" required placeholder="you@company.com" /></label>
            <label>What can we help with?<select><option>Product demo</option><option>Agency / multiple locations</option><option>Technical integrations</option><option>General question</option></select></label>
            <label>Message<textarea required rows="4" placeholder="Tell us about your business…" /></label>
            <button className="btn btn-dark">Submit inquiry ↗</button>
            {cfg.whatsappNumber && (
              <a className="btn btn-light" href={`https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent('Hi StarReview AI, I need help.')}`} target="_blank" rel="noreferrer">
                Chat on WhatsApp ↗
              </a>
            )}
          </form>
        </PageShell>
      )}

      {page === 'Feedback' && (
        <PageShell title="Share your feedback" subtitle="Tell us about your experience. Your message is saved securely and reviewed by the team.">
          <div className="feedback-card">
            {feedbackSent ? (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <h3>Thank you for your feedback.</h3>
                <p>Your feedback has been saved.</p>
                <button className="btn btn-dark" onClick={() => { setFeedbackSent(false); setFeedback(''); }}>Send another response</button>
              </div>
            ) : (
              <form onSubmit={submitFeedback}>
                <div className="eyebrow">SHARE YOUR FEEDBACK</div>
                <h3>How can we improve?</h3>
                <label>Your rating<div className="rating-select">{[1, 2, 3, 4, 5].map(n => <button type="button" key={n} className={rating >= n ? 'on' : ''} onClick={() => setRating(n)}>★</button>)}</div></label>
                <label>Your feedback<textarea required rows="5" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Please tell us what happened…" /></label>
                <button className="btn btn-dark full">Send feedback</button>
              </form>
            )}
          </div>
        </PageShell>
      )}

      {['About us', 'Frequently asked questions', 'Source code', 'Multi-business plan', 'Apply for agency', 'Partner program', 'Business onboarding', 'Privacy policy', 'Terms of service', 'Cookie policy', 'Sitemap'].includes(page) && (
        <PageShell
          title={({ 'About us': 'About StarReview AI', 'Frequently asked questions': 'Frequently asked questions', 'Source code': 'Source code and commercial licensing', 'Multi-business plan': 'Manage multiple business locations', 'Apply for agency': 'Agency partnerships', 'Partner program': 'Partner program', 'Business onboarding': 'Business onboarding', 'Privacy policy': 'Privacy policy', 'Terms of service': 'Terms of service', 'Cookie policy': 'Cookie policy', 'Sitemap': 'Website sitemap' })[page]}
          subtitle={({ 'About us': 'Tools to help businesses collect genuine feedback and build customer trust.', 'Frequently asked questions': 'Helpful answers about trials, plans, reviews, and payments.', 'Source code': 'Ask our team about source-code access and commercial licensing.', 'Multi-business plan': 'A scalable workflow for teams managing more than one location.', 'Apply for agency': 'Tell us about your agency and the businesses you support.', 'Partner program': 'Contact us to learn about partner eligibility and commission terms.', 'Business onboarding': 'Get help setting up your business profile and review funnel.', 'Privacy policy': 'We aim to collect only the information needed to provide the service.', 'Terms of service': 'Use the platform responsibly.', 'Cookie policy': 'Cookies and local storage may be used to support sign-in and core site functionality.', 'Sitemap': 'Browse the main sections of StarReview AI.' })[page]}
        >
          <div className="legal-content">
            {page === 'Frequently asked questions' ? (
              <>
                {[
                  ['How does the free trial work?', 'New accounts receive a 3-day trial. No payment card is required to start.'],
                  ['How do paid plans work?', 'Starter and Pro are available monthly or yearly. Payments are processed through Razorpay when live keys are configured.'],
                  ['Does StarReview AI post reviews automatically?', 'No. Customers remain in control and must review, edit, and post their own feedback.'],
                  ['Can I manage multiple locations?', 'Contact us about the multi-business and agency options.'],
                  ['How can I contact support?', 'Use the Contact Support link or the inquiry form on this website.']
                ].map(([q, a]) => (
                  <details key={q}><summary>{q}</summary><p>{a}</p></details>
                ))}
              </>
            ) : page === 'Sitemap' ? (
              <div className="sitemap-links">
                {[['Home', 'Home'], ['Features', 'Features'], ['How it works', 'How it works'], ['AI vs Normal QR', 'AI vs QR'], ['Pricing', 'Pricing'], ['AI review assistant', 'Try the demo'], ['QR flyer builder', 'QR flyer'], ['Dashboard', 'Dashboard'], ['Contact support', 'Contact'], ['Feedback', 'Feedback'], ['Privacy policy', 'Privacy policy'], ['Terms of service', 'Terms of service'], ['Cookie policy', 'Cookie policy']].map(([label, target]) => (
                  <button className="learn-link" key={label} onClick={() => navigate(target)}>{label} ↗</button>
                ))}
              </div>
            ) : (
              <>
                <p>StarReview AI helps local businesses create a clear customer feedback workflow, prepare editable review drafts, and understand feedback trends.</p>
                <button className="btn btn-dark" onClick={() => navigate('Contact')}>Contact support ↗</button>
              </>
            )}
          </div>
        </PageShell>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
      {page !== 'Review' && (
        <button className="feedback-fab" onClick={() => navigate('Feedback')} title="Share feedback">
          ♡ <span>Feedback</span>
        </button>
      )}
      {page !== 'Review' && <Footer navigate={navigate} />}
    </>
  );
}

function PageShell({ title, subtitle, children }) {
  return (
    <main className="page-shell wrap">
      <div className="page-heading">
        <div className="eyebrow">STARREVIEW AI PLATFORM</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </main>
  );
}

function Footer({ navigate }) {
  const groups = [
    {
      title: 'Solutions',
      items: [
        ['Platform Features', 'Features'],
        ['AI vs Normal QR', 'AI vs QR'],
        ['Source Code', 'Features'],
        ['AI SEO Analyzer', 'Features'],
        ['How It Works', 'How it works'],
        ['Growing Businesses', 'Features']
      ]
    },
    {
      title: 'Plans & Scale',
      items: [
        ['★ Source Code & License', 'Pricing'],
        ['Pricing & Free Trial', 'Pricing'],
        ['Multi-Business Plan', 'Pricing'],
        ['Apply for Agency', 'Contact'],
        ['Start 3-Day Free Trial', 'Account'],
        ['Payment QR Demo', 'Demo checkout']
      ]
    },
    {
      title: 'Company',
      items: [
        ['About Us', 'Features'],
        ['Contact Support', 'Contact'],
        ['Frequently Asked Questions', 'How it works'],
        ['HTML Sitemap', 'Sitemap'],
        ['XML Sitemap', 'Sitemap']
      ]
    },
    {
      title: 'Access',
      items: [
        ['Operator Sign In', 'Account'],
        ['Partner Sign In', 'Account'],
        ['Join Partner Program (40%)', 'Contact'],
        ['Business Onboard', 'Account'],
        ['Privacy Policy', 'Privacy policy'],
        ['Terms of Service', 'Terms of service'],
        ['Cookie Policy', 'Cookie policy']
      ]
    }
  ];

  return (
    <footer className="footer">
      <div className="wrap footer-container">
        {/* Brand Column */}
        <div className="footer-brand-box">
          <button className="brand" onClick={() => navigate('Home')} style={{ textAlign: 'left', padding: 0 }}>
            <span className="brand-mark">✦</span>
            <span>StarReview <b>AI</b></span>
          </button>
          <div className="footer-brand-motto">Helping customers share better reviews</div>
          <p className="footer-brand-tagline">
            AI-Powered Google Review Growth System — helping local businesses gather authentic 5-star reviews, resolve private feedback, and boost local search rankings.
          </p>
          <div className="footer-powered-link">
            Powered by <strong>StarReview AI</strong>
          </div>
        </div>

        {/* 4 Nav Columns */}
        {groups.map(col => (
          <div className="footer-nav-col" key={col.title}>
            <h4>{col.title}</h4>
            {col.items.map(([label, target]) => (
              <button key={label} onClick={() => navigate(target)}>{label}</button>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="wrap footer-bottom-bar">
        <span>© 2026 StarReview AI. All rights reserved.</span>
        <div>
          <button onClick={() => navigate('Privacy policy')}>Privacy Policy</button>
          <i>·</i>
          <button onClick={() => navigate('Terms of service')}>Terms of Service</button>
          <i>·</i>
          <button onClick={() => navigate('Cookie policy')}>Cookie Policy</button>
          <i>·</i>
          <button onClick={() => navigate('Sitemap')}>Sitemap</button>
        </div>
      </div>
    </footer>
  );
}
