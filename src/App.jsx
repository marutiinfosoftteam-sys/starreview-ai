import React, { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { ReviewFunnel, BusinessSetup, ReplyAssistant, SeoAnalyzer, Dashboard, QrFlyer } from './tools.jsx';
import BusinessConsole from './BusinessConsole.jsx';
import BusinessOnboarding from './BusinessOnboarding.jsx';
import AboutPage from './AboutPage.jsx';

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
    '/login': 'Account',
    '/signin': 'Account',
    '/register': 'Account',
    '/signup': 'Account',
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
    '/sitemap': 'Sitemap',
    '/index.php': 'Dashboard',
    '/console': 'Dashboard',
    '/admin': 'Dashboard'
  };

  const slugMap = Object.fromEntries(Object.entries(routeMap).map(([path, name]) => [name, path]));
  const getReviewSlug = () => {
    const p = window.location.pathname.replace(/\/$/, '') || '';
    if (p.startsWith('/r/')) {
      return p.split('/')[2] || 'demo';
    }
    try {
      const search = new URLSearchParams(window.location.search);
      return search.get('r') || search.get('review') || '';
    } catch {
      return '';
    }
  };

  const pageFromPath = () => {
    const p = window.location.pathname.replace(/\/$/, '') || '/';
    if (p.startsWith('/r/') || getReviewSlug()) return 'Review';
    if (p === '/login' || p === '/signin') {
      return 'Account';
    }
    if (p === '/register' || p === '/signup') {
      return 'Account';
    }
    try {
      const search = new URLSearchParams(window.location.search);
      const route = search.get('route');
      const tab = search.get('tab');
      if (route && (route.includes('register') || route.includes('agency/register'))) {
        return 'Account';
      }
      if (route && (route.startsWith('business') || route.includes('feedback') || route.includes('qr') || route.includes('service') || route.includes('billing') || route.includes('stand'))) {
        return 'Dashboard';
      }
      if (tab) {
        return 'Dashboard';
      }
    } catch {}
    if (p === '/index.php' || p === '/index.html') {
      return 'Dashboard';
    }
    return routeMap[p] || 'Home';
  };

  const reviewSlug = getReviewSlug() || 'demo';
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
  const [regMode, setRegMode] = useState(() => {
    const p = window.location.pathname.replace(/\/$/, '') || '';
    if (p === '/register' || p === '/signup') return true;
    try {
      const search = new URLSearchParams(window.location.search);
      if (search.get('register') || search.get('signup') || search.get('route')?.includes('register')) return true;
    } catch {}
    return false;
  });
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [myBusiness, setMyBusiness] = useState(null);
  const [cfg, setCfg] = useState({ whatsappNumber: '919707842047', languages: ['English', 'Hindi', 'Hinglish', 'Gujarati'] });
  const [demoPlan, setDemoPlan] = useState('Starter');
  const [demoPeriod, setDemoPeriod] = useState('Monthly');
  const [demoResult, setDemoResult] = useState('');

  // ReviewFlow AI Pricing Toggle: 'without-reply' (Standard) vs 'with-reply' (Pro)
  const [pricingTab, setPricingTab] = useState('without-reply');

  // Agency Registration Form State
  const [agencyForm, setAgencyForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [agencySubmitted, setAgencySubmitted] = useState(false);
  const [showAgencyPass, setShowAgencyPass] = useState(false);
  const [showAgencyConfPass, setShowAgencyConfPass] = useState(false);

  // Razorpay Checkout Modal Simulator State
  const [razorpayModal, setRazorpayModal] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState({ name: 'Pro', period: 'Monthly', amount: 299 });
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [paymentUpiApp, setPaymentUpiApp] = useState('gpay'); // 'gpay', 'phonepe', 'paytm', 'qr'
  const [paymentEmail, setPaymentEmail] = useState('');
  const [paymentPhone, setPaymentPhone] = useState('9876543210');
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'success', 'failed'
  const [paymentTxnId, setPaymentTxnId] = useState('');

  const executePayment = async (planToActivate, periodToActivate, simulateFail = false) => {
    setPaymentStep('processing');
    await new Promise(r => setTimeout(r, 1200));

    if (simulateFail) {
      setPaymentStep('failed');
      return;
    }

    const txnId = 'pay_' + Math.random().toString(36).substring(2, 9).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    setPaymentTxnId(txnId);

    const r = await api('POST', '/api/billing/verify', {
      plan: planToActivate,
      period: periodToActivate,
      mode: 'demo',
      razorpay_payment_id: txnId
    });

    const days = periodToActivate === 'Yearly' ? 365 : 30;
    const updatedUser = r.ok && r.data.user ? r.data.user : {
      id: user?.id || 'user_' + Date.now(),
      email: paymentEmail || user?.email || 'customer@mybusiness.com',
      subscription: {
        plan: planToActivate,
        period: periodToActivate,
        status: 'active',
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
        isTrial: false
      },
      access: true,
      replyAssistant: planToActivate === 'Pro' || planToActivate === 'Agency'
    };

    setUser(updatedUser);
    setPaymentStep('success');
    notify(`🎉 Payment Successful! ${planToActivate} (${periodToActivate}) plan is now active.`);
  };

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3800);
  };

  const navigate = (p, isRegister = false) => {
    // Dashboard is protected: unauthenticated users must sign in or register first
    if (p === 'Dashboard' && !user && !getToken()) {
      notify('Please sign in or start a free trial to access your dashboard.');
      setRegMode(false);
      p = 'Account';
    }
    if (p === 'Account') {
      setRegMode(!!isRegister);
      const nextPath = isRegister ? '/register' : '/login';
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ page: 'Account' }, '', nextPath);
      }
      setPage('Account');
      setMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    notify('Signed out successfully.');
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
      const p = window.location.pathname.replace(/\/$/, '') || '/';
      if (p === '/login' || p === '/signin') {
        setRegMode(false);
        setPage('Account');
      } else if (p === '/register' || p === '/signup') {
        setRegMode(true);
        setPage('Account');
      } else {
        setPage(pageFromPath());
      }
      setMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Dashboard & Console require active authentication (user must sign in)
  const isConsoleView = !!user && (page === 'Dashboard' || page === 'Account');

  const submitAuth = async (e) => {
    e.preventDefault();
    const r = await api('POST', regMode ? '/api/auth/register' : '/api/auth/login', { email, password });
    if (!r.ok) return notify(r.data.error || 'Authentication failed');
    setToken(r.data.token);
    setUser(r.data.user);
    setPassword('');
    notify(regMode ? 'Account created. Welcome to StarReview AI!' : 'Signed in successfully.');
    const bRes = await api('GET', '/api/business');
    if (bRes.ok && bRes.data && bRes.data.business) {
      setMyBusiness(bRes.data.business);
      // Guide new signups or unverified profiles through official Google Places onboarding
      if (regMode || !bRes.data.business.isGoogleVerified) {
        navigate('Business onboarding');
        return;
      }
    } else {
      navigate('Business onboarding');
      return;
    }
    navigate('Dashboard');
  };

  const loginDemoConsole = async () => {
    const r = await api('POST', '/api/auth/login', { email: 'team@maruti.com', password: 'password123' });
    if (r.ok) {
      setToken(r.data.token);
      setUser(r.data.user);
      const bRes = await api('GET', '/api/business');
      if (bRes.ok) setMyBusiness(bRes.data.business);
      notify('Welcome to Business Console (Demo Mode)');
      navigate('Dashboard');
    }
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
    const amount = planName === 'Starter'
      ? (period === 'Yearly' ? 1999 : 199)
      : (period === 'Yearly' ? 2999 : 299);

    setPaymentPlan({ name: planName, period, amount });
    setDemoPlan(planName);
    setDemoPeriod(period);
    setPaymentEmail(user?.email || 'customer@mybusiness.com');
    setPaymentStep('select');
    setPaymentTxnId('');
    setRazorpayModal(true);
  };

  const navItems = [
    { label: 'How It Works', page: 'How it works' },
    { label: 'AI vs Normal QR', page: 'AI vs QR' },
    { label: 'Pricing', page: 'Pricing' },
    { label: 'Source Code', page: 'Source code' },
    { label: 'Apply for Agency', page: 'Apply for agency' }
  ];

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
      {page !== 'Review' && !isConsoleView && page !== 'Account' && (
        <header className="rf-top-header">
          <div className="rf-top-header-inner">
            <button className="rf-nav-brand" onClick={() => navigate('Home')} title="StarReview AI">
              <div className="rf-nav-brand-icon">
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="rf-nav-brand-info">
                <span className="rf-nav-brand-title">StarReview <span>AI</span></span>
                <span className="rf-nav-brand-sub">Helping customers share better reviews</span>
              </div>
            </button>

            <button className="menu-toggle rf-menu-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle menu">☰</button>

            <nav className={menu ? 'rf-nav-links open' : 'rf-nav-links'}>
              {navItems.map(item => (
                <button
                  key={item.page}
                  className={`rf-nav-link ${page === item.page ? 'active' : ''}`}
                  onClick={() => { navigate(item.page); setMenu(false); }}
                >
                  {item.label}
                </button>
              ))}

              <div className="rf-mobile-drawer-actions">
                {!user ? (
                  <>
                    <button
                      type="button"
                      className="rf-btn-signin full"
                      onClick={() => { setRegMode(false); navigate('Account', false); setMenu(false); }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      className="rf-btn-startfree full"
                      onClick={() => { setRegMode(true); navigate('Account', true); setMenu(false); }}
                    >
                      Start Free <span className="rf-nav-arrow">→</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="rf-btn-startfree full"
                      onClick={() => { navigate('Dashboard'); setMenu(false); }}
                    >
                      Dashboard ↗
                    </button>
                    <button
                      type="button"
                      className="rf-btn-signin full"
                      onClick={() => { logout(); setMenu(false); }}
                    >
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </nav>

            <div className="rf-nav-actions">
              {!user ? (
                <>
                  <button
                    type="button"
                    className="rf-btn-signin"
                    onClick={() => {
                      setRegMode(false);
                      navigate('Account', false);
                    }}
                    title="Sign In to Dashboard"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="rf-btn-startfree"
                    onClick={() => {
                      setRegMode(true);
                      navigate('Account', true);
                    }}
                    title="Start 3-Day Free Trial"
                  >
                    Start Free <span className="rf-nav-arrow">→</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="rf-btn-startfree"
                    style={{ padding: '7px 14px' }}
                    onClick={() => navigate('Dashboard')}
                    title="Open Business Dashboard"
                  >
                    <span className="rf-online-dot"></span> Dashboard
                  </button>
                  <button
                    type="button"
                    className="rf-btn-signin"
                    onClick={logout}
                    title="Sign Out"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
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
          SOURCE CODE & COMMERCIAL LICENSE PAGE (MATCHING REVIEWFLOW AI)
          ==================================================================== */}
      {page === 'Source code' && (
        <main>
          {/* Hero Section */}
          <section className="wl-hero-section">
            <div className="wl-container">
              <div className="wl-badge">
                <span></span> Commercial License • Full Source Code for ₹10,000 (One-Time)
              </div>
              <h1 className="wl-hero-title">
                Launch Your Own <span className="gradient-text">AI Google Review SaaS</span> Business
              </h1>
              <p className="wl-hero-desc">
                Own the complete, production-ready source code of StarReview AI for a single one-time payment of ₹10,000 with a full Commercial License. You have complete freedom to modify the code, build new features, rebrand everything, and launch unlimited client portals — <strong>you can do anything with the code except reselling it</strong>. Full server installation &amp; deployment included.
              </p>

              {/* Commercial License Pill */}
              <div className="wl-hero-license-pill">
                <span className="wl-hero-license-badge">
                  <i className="fa-solid fa-file-contract"></i> Lifetime Commercial License Included
                </span>
                <span className="wl-hero-license-tag">₹10,000 One-Time • Zero Royalties</span>
              </div>

              {/* CTA Group */}
              <div className="wl-cta-group">
                <a
                  href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I want to purchase the complete StarReview AI Source Code with Commercial License for ₹10,000. Please share payment and server setup details.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="wl-btn-primary"
                >
                  <i className="fa-solid fa-file-shield" style={{ fontSize: '1.1rem' }}></i>
                  Get Full Source Code for ₹10,000
                </a>
                <button
                  type="button"
                  className="wl-btn-secondary"
                  onClick={() => {
                    const el = document.getElementById('license-terms');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <i className="fa-solid fa-scale-balanced"></i>
                  View License Terms
                </button>
              </div>

              {/* 4 Quick Stat Cards */}
              <div className="wl-stats-grid">
                <div className="wl-stat-card">
                  <div className="wl-stat-icon"><i className="fa-solid fa-code"></i></div>
                  <div className="wl-stat-title">100% Unencrypted</div>
                  <p className="wl-stat-desc">Pure, clean modern source code with zero encryption or license lockers.</p>
                </div>
                <div className="wl-stat-card">
                  <div className="wl-stat-icon"><i className="fa-solid fa-server"></i></div>
                  <div className="wl-stat-title">Full Setup Included</div>
                  <p className="wl-stat-desc">Our developers deploy and configure everything on your server for free.</p>
                </div>
                <div className="wl-stat-card">
                  <div className="wl-stat-icon"><i className="fa-solid fa-building-user"></i></div>
                  <div className="wl-stat-title">Unlimited Portals</div>
                  <p className="wl-stat-desc">Host unlimited businesses, agencies, and locations without restrictions.</p>
                </div>
                <div className="wl-stat-card">
                  <div className="wl-stat-icon"><i className="fa-solid fa-scale-balanced"></i></div>
                  <div className="wl-stat-title">Commercial Freedom</div>
                  <p className="wl-stat-desc">Full commercial license included. You can do anything with the code except reselling it.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Turnkey Package Section */}
          <section className="wl-light-section">
            <div className="wl-container">
              <div className="wl-section-header">
                <span className="wl-section-tag">Complete Turnkey Package</span>
                <h2 className="wl-section-title">Everything You Need to Run a Profitable SaaS</h2>
                <p className="wl-section-desc">You get the entire web application, frontend marketing pages, multi-business portals, AI generation engine, and automated tooling.</p>
              </div>

              <div className="wl-features-grid">
                <div className="wl-feature-card">
                  <div className="wl-feature-icon"><i className="fa-solid fa-robot"></i></div>
                  <h3 className="wl-feature-title">AI Review Engine</h3>
                  <p className="wl-feature-desc">Integrated with Google Gemini Flash (free/ultra-low cost), OpenAI GPT-4o, and Claude. Generates human-style, authentic reviews based on customer feelings.</p>
                  <ul className="wl-feature-list">
                    <li><i className="fa-solid fa-check"></i> Multi-language review drafting</li>
                    <li><i className="fa-solid fa-check"></i> Staff &amp; service keywords</li>
                    <li><i className="fa-solid fa-check"></i> Natural short-form wording</li>
                  </ul>
                </div>

                <div className="wl-feature-card">
                  <div className="wl-feature-icon"><i className="fa-solid fa-qrcode"></i></div>
                  <h3 className="wl-feature-title">Dynamic Standee &amp; Flyer Designer</h3>
                  <p className="wl-feature-desc">Built-in visual flyer generator. Clients can download print-ready table tents and QR posters with custom instructions and color themes.</p>
                  <ul className="wl-feature-list">
                    <li><i className="fa-solid fa-check"></i> 4 modern visual color schemes</li>
                    <li><i className="fa-solid fa-check"></i> Instant SVG / PNG flyer download</li>
                    <li><i className="fa-solid fa-check"></i> Custom incentive text customization</li>
                  </ul>
                </div>

                <div className="wl-feature-card">
                  <div className="wl-feature-icon"><i className="fa-solid fa-filter"></i></div>
                  <h3 className="wl-feature-title">Smart Review Funnel</h3>
                  <p className="wl-feature-desc">Intelligent 5-star gatekeeper. 5-star ratings route straight to the Google Business Profile, while lower ratings are captured in a private inbox.</p>
                  <ul className="wl-feature-list">
                    <li><i className="fa-solid fa-check"></i> Private feedback collection</li>
                    <li><i className="fa-solid fa-check"></i> Customer phone &amp; email capture</li>
                    <li><i className="fa-solid fa-check"></i> Real-time interaction tracking</li>
                  </ul>
                </div>

                <div className="wl-feature-card">
                  <div className="wl-feature-icon"><i className="fa-solid fa-users-gear"></i></div>
                  <h3 className="wl-feature-title">Multi-Business &amp; Agency Suite</h3>
                  <p className="wl-feature-desc">Agency sub-portal allowing marketing agencies and franchises to manage multiple client locations under one single dashboard.</p>
                  <ul className="wl-feature-list">
                    <li><i className="fa-solid fa-check"></i> Multi-location switching</li>
                    <li><i className="fa-solid fa-check"></i> Bring Your Own AI API key</li>
                    <li><i className="fa-solid fa-check"></i> White label agency management</li>
                  </ul>
                </div>
              </div>

              {/* License Box */}
              <div className="wl-license-box" id="license-terms">
                <div className="wl-license-header">
                  <div className="wl-license-header-icon">
                    <i className="fa-solid fa-scale-balanced"></i>
                  </div>
                  <div className="wl-license-header-text">
                    <h3>Commercial License Terms &amp; Permissions</h3>
                    <p>Total operational and development freedom. You can do anything with the code except reselling it.</p>
                  </div>
                </div>

                <div className="wl-license-columns">
                  <div className="wl-license-col can-do">
                    <div className="wl-license-col-title">
                      <i className="fa-solid fa-circle-check"></i> What You CAN Do (Complete Freedom)
                    </div>
                    <ul className="wl-license-items">
                      <li className="wl-license-item">
                        <i className="fa-solid fa-check"></i>
                        <span><strong>100% White Label &amp; Rebrand:</strong> Place your own brand name, domain, logo, color palette, and email notifications.</span>
                      </li>
                      <li className="wl-license-item">
                        <i className="fa-solid fa-check"></i>
                        <span><strong>Modify &amp; Customize Source Code:</strong> Edit backend, database schema, CSS, and frontend design however you like.</span>
                      </li>
                      <li className="wl-license-item">
                        <i className="fa-solid fa-check"></i>
                        <span><strong>Build Custom Features:</strong> Integrate proprietary payment gateways, custom AI models, or third-party APIs.</span>
                      </li>
                      <li className="wl-license-item">
                        <i className="fa-solid fa-check"></i>
                        <span><strong>Unlimited Paying Clients:</strong> Charge clients monthly, yearly, or one-time fees. You keep 100% of revenue.</span>
                      </li>
                      <li className="wl-license-item">
                        <i className="fa-solid fa-check"></i>
                        <span><strong>Zero Royalties Forever:</strong> No recurring license fees, revenue share, or hidden developer costs.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="wl-license-col cannot-do">
                    <div className="wl-license-col-title">
                      <i className="fa-solid fa-circle-xmark"></i> What You CANNOT Do
                    </div>
                    <ul className="wl-license-items">
                      <li className="wl-license-item">
                        <i className="fa-solid fa-xmark"></i>
                        <span><strong>Resell Raw Source Code:</strong> You cannot resell, distribute, or publish the raw codebase, scripts, or templates to others.</span>
                      </li>
                      <li className="wl-license-item">
                        <i className="fa-solid fa-xmark"></i>
                        <span><strong>Create Source Code Competitors:</strong> You cannot operate a digital asset store, marketplace, or repository selling this software codebase.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Banner */}
              <div style={{ marginTop: '3.5rem', textAlign: 'center', background: 'linear-gradient(135deg, #1d4934 0%, #2f6747 100%)', padding: '3rem 2rem', borderRadius: 24, color: '#fff' }}>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.75rem', color: '#fff' }}>Ready to Launch Your Own AI Review SaaS?</h3>
                <p style={{ maxWidth: 650, margin: '0 auto 1.75rem', color: '#d1e2d7', fontSize: '1rem', lineHeight: 1.6 }}>
                  One-time payment of ₹10,000 includes full source code, commercial license, free deployment assistance, and lifetime ownership.
                </p>
                <a
                  href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm ready to buy the StarReview AI Source Code for ₹10,000. Please assist me with the purchase.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ background: '#22c55e', color: '#092113', fontWeight: 800, padding: '0.9rem 2rem', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                  Get Source Code on WhatsApp (₹10,000)
                </a>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ====================================================================
          APPLY FOR AGENCY / MULTI-BUSINESS PORTAL (MATCHING REVIEWFLOW AI)
          ==================================================================== */}
      {page === 'Apply for agency' && (
        <main>
          <div className="agency-page-wrapper">
            <div className="agency-app-grid">
              {/* LEFT: VALUE PROPOSITION */}
              <div className="agency-info-col">
                <div className="agency-info-badge">
                  <i className="fa-solid fa-briefcase"></i> Multi-Business &amp; Agency Portal
                </div>
                <h1>Scale Google Reviews for <span>All Your Locations</span></h1>
                <p className="lead-desc">
                  Designed for marketing agencies, multi-location franchises, and brand managers seeking a centralized Google review acceleration system.
                </p>

                <div className="agency-perks">
                  <div className="perk-item">
                    <div className="perk-icon"><i className="fa-solid fa-layer-group"></i></div>
                    <div className="perk-text">
                      <h4>Centralized Multi-Location Console</h4>
                      <p>Manage dozens of client or branch listings from a single intuitive agency dashboard.</p>
                    </div>
                  </div>
                  <div className="perk-item">
                    <div className="perk-icon"><i className="fa-solid fa-qrcode"></i></div>
                    <div className="perk-text">
                      <h4>Dedicated QR Flyers &amp; Standees</h4>
                      <p>Generate isolated QR standees, tracking links, and custom AI prompt rules for each location.</p>
                    </div>
                  </div>
                  <div className="perk-item">
                    <div className="perk-icon"><i className="fa-solid fa-chart-pie"></i></div>
                    <div className="perk-text">
                      <h4>Cross-Location Analytics</h4>
                      <p>Monitor scans, drafted reviews, conversion rates, and negative feedback across all accounts.</p>
                    </div>
                  </div>
                  <div className="perk-item">
                    <div className="perk-icon"><i className="fa-solid fa-key"></i></div>
                    <div className="perk-text">
                      <h4>Bring Your Own AI API (Gemini, OpenAI, or Claude)</h4>
                      <p>For Multi-Business plans, review generation requires your own AI API key (choose any one: Google Gemini, OpenAI, or Claude). We do not provide API keys for Multi-Business plans or panels.</p>
                    </div>
                  </div>
                  <div className="perk-item">
                    <div className="perk-icon"><i className="fa-brands fa-whatsapp"></i></div>
                    <div className="perk-text">
                      <h4>VIP Dedicated Onboarding Support</h4>
                      <p>Direct WhatsApp &amp; priority concierge setup for rapid assistance and capacity scaling.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: REGISTRATION FORM */}
              <div className="auth-card-agency">
                <h2>Start Multi-Business Free Trial</h2>
                <p className="subtitle">Create your account to instantly access the Multi-Business Panel with a 48-hour free trial.</p>

                <div className="pending-notice">
                  <strong><i className="fa-solid fa-bolt"></i> Instant Automated Approval:</strong> Accounts are approved immediately upon registration. Enjoy full access with a 48-hour free trial — no credit card required.
                  <div style={{ marginTop: '0.4rem', borderTop: '1px dashed #bbf7d0', paddingTop: '0.4rem', fontSize: '0.78rem', color: '#166534' }}>
                    <i className="fa-solid fa-circle-info"></i> <strong>API Key Notice:</strong> Multi-business review generation requires your own AI API key (Google Gemini, OpenAI, or Claude).
                  </div>
                </div>

                {agencySubmitted ? (
                  <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 16, padding: '2rem 1.5rem', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 1rem' }}>✓</div>
                    <h3 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>Multi-Business Trial Activated!</h3>
                    <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                      Welcome, <strong>{agencyForm.name}</strong>! Your 48-hour agency trial is now live. You can manage multiple client locations and bring your own AI API key.
                    </p>
                    <button
                      className="btn btn-dark"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setUser({ name: agencyForm.name, email: agencyForm.email, plan: 'Multi-Business (48-Hr Trial)' });
                        navigate('Dashboard');
                      }}
                    >
                      Go to Agency Dashboard →
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (agencyForm.password !== agencyForm.confirmPassword) {
                        alert('Passwords do not match. Please verify.');
                        return;
                      }
                      setAgencySubmitted(true);
                      setToast('48-Hour Multi-Business trial activated!');
                    }}
                  >
                    <div className="agency-form-row">
                      <div className="agency-form-group">
                        <label>Your Name *</label>
                        <input
                          type="text"
                          className="agency-form-control"
                          placeholder="Jane Doe"
                          required
                          value={agencyForm.name}
                          onChange={e => setAgencyForm({ ...agencyForm, name: e.target.value })}
                        />
                      </div>
                      <div className="agency-form-group">
                        <label>Agency / Business Name</label>
                        <input
                          type="text"
                          className="agency-form-control"
                          placeholder="Acme Media Group"
                          value={agencyForm.company}
                          onChange={e => setAgencyForm({ ...agencyForm, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="agency-form-row">
                      <div className="agency-form-group">
                        <label>Work Email *</label>
                        <input
                          type="email"
                          className="agency-form-control"
                          placeholder="jane@acmemedia.com"
                          required
                          value={agencyForm.email}
                          onChange={e => setAgencyForm({ ...agencyForm, email: e.target.value })}
                        />
                      </div>
                      <div className="agency-form-group">
                        <label>WhatsApp / Phone *</label>
                        <input
                          type="tel"
                          className="agency-form-control"
                          placeholder="+91 97000 00000"
                          required
                          value={agencyForm.phone}
                          onChange={e => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="agency-form-group">
                      <label>Choose Password *</label>
                      <div className="agency-pwd-wrap">
                        <input
                          type={showAgencyPass ? 'text' : 'password'}
                          className="agency-form-control"
                          placeholder="Min. 8 characters"
                          required
                          value={agencyForm.password}
                          onChange={e => setAgencyForm({ ...agencyForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="agency-pwd-toggle"
                          onClick={() => setShowAgencyPass(!showAgencyPass)}
                          aria-label="Toggle password visibility"
                        >
                          <i className={showAgencyPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                        </button>
                      </div>
                    </div>

                    <div className="agency-form-group">
                      <label>Confirm Password *</label>
                      <div className="agency-pwd-wrap">
                        <input
                          type={showAgencyConfPass ? 'text' : 'password'}
                          className="agency-form-control"
                          placeholder="Re-enter password"
                          required
                          value={agencyForm.confirmPassword}
                          onChange={e => setAgencyForm({ ...agencyForm, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="agency-pwd-toggle"
                          onClick={() => setShowAgencyConfPass(!showAgencyConfPass)}
                          aria-label="Toggle password visibility"
                        >
                          <i className={showAgencyConfPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                        </button>
                      </div>
                      {agencyForm.confirmPassword && agencyForm.password !== agencyForm.confirmPassword && (
                        <span style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.2rem' }}>Passwords do not match.</span>
                      )}
                    </div>

                    <button type="submit" className="btn-submit-agency">
                      Start 48-Hour Free Trial <i className="fa-solid fa-arrow-right"></i>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          DEMO CHECKOUT (WORKING RAZORPAY FLOW)
          ==================================================================== */}
      {page === 'Demo checkout' && (
        <PageShell title="Secure Checkout" subtitle="Activate your plan instantly with our simulated Razorpay gateway.">
          <div className="panel form-panel" style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="demo-tag" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
              ✓ LIVE TEST CHECKOUT · SECURED BY RAZORPAY SIMULATOR
            </div>
            <h2 style={{ marginTop: 16 }}>Select &amp; Activate Plan</h2>
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
            <div className="notice" style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}>
              <strong>{demoPlan} · {demoPeriod}</strong>
              <p style={{ fontSize: '1.3rem', fontWeight: 900, color: '#15803d', margin: '0.35rem 0' }}>
                {demoPlan === 'Starter' ? (demoPeriod === 'Monthly' ? '₹199 per month' : '₹1,999 per year') : (demoPeriod === 'Monthly' ? '₹299 per month' : '₹2,999 per year')}
              </p>
              <small>Click below to open the interactive Razorpay payment modal with UPI, Card, and Netbanking options.</small>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                className="btn btn-dark full"
                style={{ padding: '0.95rem', fontSize: '1.05rem', background: 'linear-gradient(135deg, #1d4934 0%, #15803d 100%)' }}
                onClick={() => {
                  const amt = demoPlan === 'Starter' ? (demoPeriod === 'Yearly' ? 1999 : 199) : (demoPeriod === 'Yearly' ? 2999 : 299);
                  setPaymentPlan({ name: demoPlan, period: demoPeriod, amount: amt });
                  setPaymentEmail(user?.email || 'customer@mybusiness.com');
                  setPaymentStep('select');
                  setPaymentTxnId('');
                  setRazorpayModal(true);
                }}
              >
                Proceed to Razorpay Checkout ↗
              </button>
            </div>

            <div className="hero-cta" style={{ marginTop: 16 }}>
              <button
                className="btn btn-light"
                style={{ flex: 1 }}
                onClick={async () => {
                  const amt = demoPlan === 'Starter' ? (demoPeriod === 'Yearly' ? 1999 : 199) : (demoPeriod === 'Yearly' ? 2999 : 299);
                  setPaymentPlan({ name: demoPlan, period: demoPeriod, amount: amt });
                  await executePayment(demoPlan, demoPeriod, false);
                  setDemoResult('success');
                }}
              >
                1-Click Quick Activate ✓
              </button>
              <button
                className="btn btn-light"
                style={{ flex: 1 }}
                onClick={() => {
                  setDemoResult('failed');
                }}
              >
                Simulate Payment Failure
              </button>
            </div>

            {demoResult === 'success' && (
              <div className="notice" role="status" style={{ marginTop: 18, background: '#f0fdf4', border: '1.5px solid #86efac' }}>
                <strong style={{ color: '#15803d' }}>🎉 Plan Activated Successfully!</strong>
                <p>Your {demoPlan} ({demoPeriod}) subscription is now ACTIVE. All features have been unlocked on your account.</p>
                <button className="btn btn-dark" onClick={() => { setDemoResult(''); navigate('Dashboard'); }}>Open Dashboard ↗</button>
              </div>
            )}
            {demoResult === 'failed' && (
              <div className="notice" role="status" style={{ marginTop: 18, background: '#fef2f2', border: '1.5px solid #fca5a5' }}>
                <strong style={{ color: '#dc2626' }}>Simulated Payment Failed</strong>
                <p>This was a simulated failure test. You can try the payment again or click 1-Click Quick Activate.</p>
                <button className="btn btn-dark" onClick={() => setDemoResult('')}>Try again</button>
              </div>
            )}
          </div>
        </PageShell>
      )}

      {/* ====================================================================
          BUSINESS CONSOLE ADMIN PANEL (REVIEWFLOW AI STYLE)
          ==================================================================== */}
      {isConsoleView && (
        <BusinessConsole
          user={user}
          setUser={setUser}
          business={myBusiness}
          setBusiness={setMyBusiness}
          navigate={navigate}
          notify={notify}
          choosePlan={choosePlan}
        />
      )}

      {/* ====================================================================
          ACCOUNT / LOGIN / REGISTER (REVIEWFLOW AI EXACT SHOWCASE & FORM)
          ==================================================================== */}
      {/* ====================================================================
          ACCOUNT / LOGIN / REGISTER (REVIEWFLOW AI SCREENSHOT 2 EXACT MATCH)
          ==================================================================== */}
      {(page === 'Account' || (page === 'Dashboard' && !user)) && (
        <div className="rf-login-viewport">
          <div className="rf-login-container">
            {/* ═══════ LEFT COLUMN: LANDING SHOWCASE & TRUST ═══════ */}
            <div className="rf-login-showcase">
              <button type="button" className="rf-login-back-btn" onClick={() => navigate('Home')}>
                <i className="fa-solid fa-arrow-left"></i> Back to Homepage
              </button>

              <div className="rf-login-brand-row" onClick={() => navigate('Home')} style={{ cursor: 'pointer' }} title="Return to Homepage">
                <div className="rf-login-brand-icon">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div className="rf-login-brand-titles">
                  <div className="rf-login-brand-name">StarReview <span>AI</span></div>
                  <div className="rf-login-brand-motto">Helping customers share better reviews</div>
                </div>
              </div>

              <div className="rf-login-badge">
                <span className="rf-login-badge-dot"></span>
                AI GOOGLE REVIEW PLATFORM &bull; BUSINESS PORTAL
              </div>

              <h1 className="rf-login-heading">
                Grow Your Google Reviews &amp; <span>Rank #1 Locally</span>
              </h1>

              <p className="rf-login-desc">
                Log in to your business dashboard to manage AI review funnels, generate custom QR standees, monitor new customer feedback, and build online reputation.
              </p>

              {/* 4 Key Perks */}
              <div className="rf-login-perks-grid">
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                  <div className="rf-perk-content">
                    <h4>1-Click AI Review Drafter</h4>
                    <p>Customers write detailed 5-star Google reviews in seconds using smart AI assistance.</p>
                  </div>
                </div>
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-qrcode"></i></div>
                  <div className="rf-perk-content">
                    <h4>Smart QR Standees &amp; Flyers</h4>
                    <p>Place on checkout counters or tables to collect customer reviews on the spot.</p>
                  </div>
                </div>
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-shield-halved"></i></div>
                  <div className="rf-perk-content">
                    <h4>Negative Review Firewall</h4>
                    <p>Route unhappy feedback to private inbox before it ever reaches public Google Maps.</p>
                  </div>
                </div>
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-chart-line"></i></div>
                  <div className="rf-perk-content">
                    <h4>Real-Time Growth Analytics</h4>
                    <p>Track scans, review completions, customer sentiment, and local search ranking.</p>
                  </div>
                </div>
              </div>

              {/* Trust Strip */}
              <div className="rf-login-trust-strip">
                <span className="rf-login-trust-item"><i className="fa-solid fa-star gold-star"></i> 4.9/5 Trusted by Businesses</span>
                <span className="rf-login-trust-item"><i className="fa-solid fa-bolt green-icon"></i> 3x More Reviews</span>
                <span className="rf-login-trust-item"><i className="fa-solid fa-lock green-icon"></i> 256-Bit SSL Secured</span>
              </div>
            </div>

            {/* ═══════ RIGHT COLUMN: AUTH CARD (SCREENSHOT 2 EXACT MATCH) ═══════ */}
            <div className="rf-login-card">
              {page === 'Dashboard' && !user && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: '#92400e', marginBottom: 16, lineHeight: 1.4 }}>
                  <i className="fa-solid fa-lock" style={{ marginRight: 6 }}></i>
                  Sign In Required: Please sign in or create an account to access the Business Console &amp; Dashboard.
                </div>
              )}

              <h2 className="rf-login-card-title">{regMode ? 'Start Multi-Business Free Trial' : 'Business Login'}</h2>
              <p className="rf-login-card-sub">{regMode ? 'Create your account to instantly access your review dashboard with a 3-day free trial.' : 'Enter your credentials to access your review dashboard'}</p>

              {regMode && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 12px', fontSize: '0.78rem', color: '#166534', marginBottom: 16, lineHeight: 1.45 }}>
                  <i className="fa-solid fa-bolt" style={{ color: '#16a34a', marginRight: 5 }}></i>
                  <strong>Instant Automated Approval:</strong> Accounts are approved immediately upon registration. Enjoy full access with a 3-day free trial — no credit card required.
                </div>
              )}

              {/* Instant 1-Click Demo Shortcut */}
              <div style={{ marginBottom: 16, background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                  <i className="fa-solid fa-bolt" style={{ color: '#16a34a', marginRight: 4 }}></i>
                  Instant review test:
                </span>
                <button
                  type="button"
                  style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', cursor: 'pointer' }}
                  onClick={loginDemoConsole}
                >
                  ⚡ Instant Demo Console ↗
                </button>
              </div>

              <form onSubmit={submitAuth}>
                {regMode && (
                  <div className="rf-login-form-group">
                    <label className="rf-login-label">Business Name</label>
                    <input
                      className="rf-login-input"
                      type="text"
                      placeholder="e.g. Acme Dental Clinic or Cafe"
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                    />
                  </div>
                )}

                <div className="rf-login-form-group">
                  <label className="rf-login-label">EMAIL OR USERNAME</label>
                  <input
                    className="rf-login-input"
                    type="text"
                    required
                    placeholder="WebpressHub or name@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="rf-login-form-group">
                  <label className="rf-login-label">PASSWORD</label>
                  <div className="rf-pwd-wrapper">
                    <input
                      className="rf-login-input rf-pwd-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength="6"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="rf-pwd-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <i className={showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                    </button>
                  </div>
                </div>

                {!regMode && (
                  <div className="rf-login-aux-row">
                    <label className="rf-login-remember">
                      <input type="checkbox" defaultChecked />
                      <span>Remember me</span>
                    </label>
                    <button
                      type="button"
                      className="rf-login-forgot-link"
                      onClick={() => notify('Password reset instructions sent to your registered email.')}
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button className="rf-login-submit-btn" type="submit">
                  {regMode ? 'Start 3-Day Free Trial ' : 'Sign In to Dashboard '}
                  <span className="rf-nav-arrow">→</span>
                </button>
              </form>

              {/* Divider */}
              <div className="rf-login-divider">
                <span>OR CONTINUE WITH</span>
              </div>

              {/* Google Sign In */}
              <button
                type="button"
                className="rf-google-btn"
                onClick={loginDemoConsole}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>

              {/* Switch Mode Link */}
              <div className="rf-login-switch-row">
                {regMode ? (
                  <>Already have an account? <button type="button" className="rf-login-switch-btn" onClick={() => { setRegMode(false); window.history.pushState({}, '', '/login'); }}>Sign In</button></>
                ) : (
                  <>Don't have an account? <button type="button" className="rf-login-switch-btn" onClick={() => { setRegMode(true); window.history.pushState({}, '', '/register'); }}>Start 3-Day Free Trial</button></>
                )}
              </div>

              {/* Security Strip */}
              <div className="rf-login-security-footer">
                <span><i className="fa-solid fa-bolt"></i> Instant Access</span>
                <span>&bull;</span>
                <span><i className="fa-solid fa-lock"></i> 256-Bit SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
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
            const r = await api('POST', '/api/contact', {
              name: fields[0].value,
              email: fields[1].value,
              topic: fields[2].value,
              message: fields[3].value
            });
            if (r.ok) {
              notify(r.data.message || 'Inquiry submitted successfully! We will contact you shortly.');
              form.reset();
            } else {
              notify(r.data.error || 'Could not send inquiry.');
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

      {page === 'Business onboarding' && (
        <BusinessOnboarding
          user={user}
          business={myBusiness}
          setBusiness={setMyBusiness}
          notify={notify}
          navigate={navigate}
        />
      )}

      {page === 'About us' && (
        <AboutPage
          user={user}
          navigate={navigate}
          setRegMode={setRegMode}
          notify={notify}
          logout={logout}
          choosePlan={choosePlan}
        />
      )}

      {['Frequently asked questions', 'Multi-business plan', 'Partner program', 'Privacy policy', 'Terms of service', 'Cookie policy', 'Sitemap'].includes(page) && (
        <PageShell
          title={({ 'Frequently asked questions': 'Frequently asked questions', 'Source code': 'Source code and commercial licensing', 'Multi-business plan': 'Manage multiple business locations', 'Apply for agency': 'Agency partnerships', 'Partner program': 'Partner program', 'Privacy policy': 'Privacy policy', 'Terms of service': 'Terms of service', 'Cookie policy': 'Cookie policy', 'Sitemap': 'Website sitemap' })[page]}
          subtitle={({ 'Frequently asked questions': 'Helpful answers about trials, plans, reviews, and payments.', 'Source code': 'Ask our team about source-code access and commercial licensing.', 'Multi-business plan': 'A scalable workflow for teams managing more than one location.', 'Apply for agency': 'Tell us about your agency and the businesses you support.', 'Partner program': 'Contact us to learn about partner eligibility and commission terms.', 'Privacy policy': 'We aim to collect only the information needed to provide the service.', 'Terms of service': 'Use the platform responsibly.', 'Cookie policy': 'Cookies and local storage may be used to support sign-in and core site functionality.', 'Sitemap': 'Browse the main sections of StarReview AI.' })[page]}
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
      {/* ====================================================================
          RAZORPAY CHECKOUT MODAL SIMULATOR
          ==================================================================== */}
      {razorpayModal && (
        <div className="rzp-overlay" onClick={() => paymentStep !== 'processing' && setRazorpayModal(false)}>
          <div className="rzp-modal" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="rzp-header">
              <div className="rzp-header-top">
                <div className="rzp-brand">
                  <div className="rzp-logo">✦</div>
                  <div>
                    <div className="rzp-title">StarReview AI</div>
                    <div className="rzp-badge">
                      <i className="fa-solid fa-shield-halved"></i> Razorpay · Test Mode
                    </div>
                  </div>
                </div>
                {paymentStep !== 'processing' && (
                  <button className="rzp-close" onClick={() => setRazorpayModal(false)}>✕</button>
                )}
              </div>
              <div className="rzp-amount-row">
                <div>
                  <small style={{ opacity: 0.8, fontSize: '0.78rem' }}>AMOUNT TO PAY</small>
                  <div className="rzp-amount">₹{paymentPlan.amount}.00</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="rzp-plan-tag">{paymentPlan.name} · {paymentPlan.period}</span>
                </div>
              </div>
            </div>

            {/* Processing State */}
            {paymentStep === 'processing' && (
              <div className="rzp-center-box">
                <div className="rzp-spinner"></div>
                <h4 style={{ color: '#0f172a', fontWeight: 800, marginBottom: '0.4rem' }}>Processing Payment...</h4>
                <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                  Securing 256-bit bank connection. Please do not close this window.
                </p>
              </div>
            )}

            {/* Success State */}
            {paymentStep === 'success' && (
              <div className="rzp-center-box">
                <div className="rzp-success-icon">✓</div>
                <h3 style={{ color: '#15803d', margin: '0 0 0.5rem', fontWeight: 900 }}>Payment Successful!</h3>
                <p style={{ margin: '0 0 1.25rem', color: '#475569', fontSize: '0.9rem' }}>
                  ₹{paymentPlan.amount}.00 successfully paid to StarReview AI.
                </p>
                <div className="rzp-receipt-card">
                  <div><span>Transaction ID:</span> <b>{paymentTxnId}</b></div>
                  <div><span>Plan Activated:</span> <b>{paymentPlan.name} ({paymentPlan.period})</b></div>
                  <div><span>Status:</span> <b style={{ color: '#16a34a' }}>Active ✓</b></div>
                  <div><span>Expiry Date:</span> <b>{new Date(Date.now() + (paymentPlan.period === 'Yearly' ? 365 : 30) * 86400000).toLocaleDateString()}</b></div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    className="btn btn-dark full"
                    onClick={() => {
                      setRazorpayModal(false);
                      navigate('Dashboard');
                    }}
                  >
                    Open Dashboard ↗
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={() => {
                      setRazorpayModal(false);
                      notify('Invoice receipt downloaded.');
                    }}
                  >
                    Receipt ↓
                  </button>
                </div>
              </div>
            )}

            {/* Failed State */}
            {paymentStep === 'failed' && (
              <div className="rzp-center-box">
                <div className="rzp-failed-icon">✕</div>
                <h3 style={{ color: '#dc2626', margin: '0 0 0.5rem', fontWeight: 900 }}>Payment Declined</h3>
                <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                  The bank transaction was simulated as declined. No money was deducted.
                </p>
                <button className="btn btn-dark full" onClick={() => setPaymentStep('select')}>Try Again</button>
              </div>
            )}

            {/* Method Selection */}
            {paymentStep === 'select' && (
              <>
                {/* Contact strip */}
                <div className="rzp-contact-strip">
                  <input
                    type="email"
                    placeholder="Billing Email"
                    value={paymentEmail}
                    onChange={e => setPaymentEmail(e.target.value)}
                    className="rzp-input-small"
                  />
                  <input
                    type="tel"
                    placeholder="Mobile (+91)"
                    value={paymentPhone}
                    onChange={e => setPaymentPhone(e.target.value)}
                    className="rzp-input-small"
                  />
                </div>

                {/* Tabs */}
                <div className="rzp-tabs">
                  <button
                    type="button"
                    className={paymentMethod === 'upi' ? 'rzp-tab active' : 'rzp-tab'}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <i className="fa-solid fa-mobile-screen-button"></i> UPI / QR
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === 'card' ? 'rzp-tab active' : 'rzp-tab'}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <i className="fa-regular fa-credit-card"></i> Cards
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === 'netbanking' ? 'rzp-tab active' : 'rzp-tab'}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <i className="fa-solid fa-building-columns"></i> Netbanking
                  </button>
                </div>

                <div className="rzp-body">
                  {/* UPI Tab */}
                  {paymentMethod === 'upi' && (
                    <div>
                      <div className="rzp-upi-grid">
                        <button
                          type="button"
                          className={paymentUpiApp === 'gpay' ? 'rzp-upi-card selected' : 'rzp-upi-card'}
                          onClick={() => setPaymentUpiApp('gpay')}
                        >
                          <i className="fa-brands fa-google" style={{ color: '#ea4335' }}></i> Google Pay
                        </button>
                        <button
                          type="button"
                          className={paymentUpiApp === 'phonepe' ? 'rzp-upi-card selected' : 'rzp-upi-card'}
                          onClick={() => setPaymentUpiApp('phonepe')}
                        >
                          <i className="fa-solid fa-mobile-retro" style={{ color: '#5f259f' }}></i> PhonePe
                        </button>
                        <button
                          type="button"
                          className={paymentUpiApp === 'paytm' ? 'rzp-upi-card selected' : 'rzp-upi-card'}
                          onClick={() => setPaymentUpiApp('paytm')}
                        >
                          <i className="fa-solid fa-wallet" style={{ color: '#00b9f1' }}></i> Paytm
                        </button>
                        <button
                          type="button"
                          className={paymentUpiApp === 'qr' ? 'rzp-upi-card selected' : 'rzp-upi-card'}
                          onClick={() => setPaymentUpiApp('qr')}
                        >
                          <i className="fa-solid fa-qrcode" style={{ color: '#16a34a' }}></i> Scan UPI QR
                        </button>
                      </div>

                      {paymentUpiApp === 'qr' ? (
                        <div style={{ textAlign: 'center', padding: '0.75rem', background: '#f8fafc', borderRadius: 12, margin: '0.85rem 0', border: '1px dashed #cbd5e1' }}>
                          <div style={{ width: 130, height: 130, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fa-solid fa-qrcode" style={{ fontSize: '5rem', color: '#0f172a' }}></i>
                          </div>
                          <small style={{ display: 'block', marginTop: '0.4rem', color: '#64748b' }}>Scan with GPay, PhonePe, Paytm, or BHIM</small>
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.85rem' }}>
                          <label style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700 }}>Enter UPI ID / VPA</label>
                          <input
                            type="text"
                            defaultValue="user@okhdfcbank"
                            className="rzp-form-control"
                            placeholder="username@bank"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Tab */}
                  {paymentMethod === 'card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>CARD NUMBER</label>
                        <input
                          type="text"
                          defaultValue="4242 •••• •••• 4242"
                          className="rzp-form-control"
                          placeholder="Card number"
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>EXPIRY</label>
                          <input type="text" defaultValue="12 / 28" className="rzp-form-control" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>CVV</label>
                          <input type="password" defaultValue="123" maxLength="3" className="rzp-form-control" />
                        </div>
                      </div>
                      <small style={{ color: '#16a34a', fontSize: '0.74rem' }}>✓ Visa, Mastercard, RuPay &amp; Amex supported</small>
                    </div>
                  )}

                  {/* Netbanking Tab */}
                  {paymentMethod === 'netbanking' && (
                    <div className="rzp-upi-grid">
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak'].map(bank => (
                        <button key={bank} type="button" className="rzp-upi-card selected">
                          <i className="fa-solid fa-building-columns"></i> {bank}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div style={{ marginTop: '1.15rem' }}>
                    <button
                      type="button"
                      className="rzp-submit-btn"
                      onClick={() => executePayment(paymentPlan.name, paymentPlan.period, false)}
                    >
                      Pay ₹{paymentPlan.amount}.00 <span>🔒</span>
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => executePayment(paymentPlan.name, paymentPlan.period, true)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Simulate Payment Failure
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {page !== 'Review' && !isConsoleView && <Footer navigate={navigate} />}
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
        ['★ Source Code & License', 'Source code'],
        ['Pricing & Free Trial', 'Pricing'],
        ['Multi-Business Plan', 'Pricing'],
        ['Apply for Agency', 'Apply for agency'],
        ['Start 3-Day Free Trial', 'Account'],
        ['Payment QR Demo', 'Demo checkout']
      ]
    },
    {
      title: 'Company',
      items: [
        ['About Us', 'About us'],
        ['Contact Support', 'Contact'],
        ['Frequently Asked Questions', 'Frequently asked questions'],
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
        ['Business Onboard', 'Business onboarding'],
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
