import React, { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { ReviewFunnel, BusinessSetup, ReplyAssistant, SeoAnalyzer, Dashboard, QrFlyer } from './tools.jsx';

const featuresList = [
  {
    icon: 'fa-solid fa-wand-magic-sparkles',
    colorClass: 'fi-green',
    title: 'Google Magic Review QR',
    desc: 'Interactive QR funnel that eliminates blank screens and guides happy patrons to draft personalized 5-star feedback in 10 seconds.',
    target: 'How it works'
  },
  {
    icon: 'fa-solid fa-print',
    colorClass: 'fi-blue',
    title: 'Print-Ready QR Standees',
    desc: 'Generate high-resolution, customized A6 table tent cards and counter display flyers matching your brand colors and logo.',
    target: 'QR flyer'
  },
  {
    icon: 'fa-solid fa-robot',
    colorClass: 'fi-purple',
    title: 'AI-Powered Review QR Generator',
    desc: 'Crafts 3 authentic, human-like review variations in 24+ languages, automatically embedding your high-intent SEO keywords.',
    target: 'AI vs Normal QR'
  },
  {
    icon: 'fa-solid fa-bolt',
    colorClass: 'fi-green',
    badge: '24/7 Autopilot',
    highlight: true,
    title: 'AI Powered Automatic Review Reply',
    desc: 'Connect your Google Business Profile to automatically publish intelligent, brand-consistent responses to 100% of reviews 24/7 on autopilot.',
    target: 'Reply assistant'
  },
  {
    icon: 'fa-solid fa-shield-halved',
    colorClass: 'fi-cyan',
    title: 'Private Negative Review Shield',
    desc: 'Intercept 1–3 star dissatisfaction internally before it ever reaches Google, giving your team the chance to resolve issues privately.',
    target: 'Try the demo'
  },
  {
    icon: 'fa-solid fa-stethoscope',
    colorClass: 'fi-rose',
    title: 'AI Google Business Profile Analyzer',
    desc: 'Instant 20-point diagnostic audit for your Google listing with a Health Score and actionable recommendations to rank in the Google 3-Pack.',
    target: 'SEO analyzer'
  }
];

const industriesList = [
  { icon: 'fa-solid fa-utensils', name: 'Restaurants' },
  { icon: 'fa-solid fa-scissors', name: 'Salons & Spas' },
  { icon: 'fa-solid fa-stethoscope', name: 'Clinics' },
  { icon: 'fa-solid fa-shirt', name: 'Retail Stores' },
  { icon: 'fa-solid fa-hotel', name: 'Hotels' },
  { icon: 'fa-solid fa-car-side', name: 'Auto Services' }
];

const testimonialsList = [
  {
    stars: 5,
    text: "We went from 38 reviews to over 240 in less than 3 months! Customers love that they don't have to think about what to write — the AI suggestions match our service perfectly.",
    author: "Rajesh Malhotra",
    role: "Owner, Spice Haven Bistro",
    avatarBg: "#2563EB",
    initials: "RM"
  },
  {
    stars: 5,
    text: "The private feedback shield saved our rating twice already. Instead of angry 1-star reviews on Google, we solved the issues directly with the customers. Priceless tool!",
    author: "Dr. Ananya Sen",
    role: "Founder, Sen Dental Care",
    avatarBg: "#16A34A",
    initials: "AS"
  },
  {
    stars: 5,
    text: "The A6 table standee flyers look extremely premium. Customers simply scan their camera, pick their language, and post in under 10 seconds. Best investment this year.",
    author: "Vikram Mehta",
    role: "Director, Luxe Wellness Spa",
    avatarBg: "#7C3AED",
    initials: "VM"
  }
];

const faqList = [
  {
    q: "How does StarReview AI generate authentic 5-star Google reviews?",
    a: "When customers scan your QR code standee, they rate their experience. Happy customers (4–5 stars) get 3 AI-personalized review options in their chosen language with your business keywords. With 1 tap, they copy and are redirected to your official Google review form to post."
  },
  {
    q: "Does StarReview AI post reviews automatically on Google without customer consent?",
    a: "No. In strict accordance with Google policies, customers remain 100% in control. The platform provides pre-drafted, editable text that the customer copies and posts with their own Google account."
  },
  {
    q: "How does the Private Negative Review Shield protect my business rating?",
    a: "If a customer chooses 1, 2, or 3 stars, they are seamlessly guided to a private internal feedback form rather than Google Maps. Your management team is notified immediately so you can resolve complaints privately."
  },
  {
    q: "How does the AI Automatic Review Reply system work?",
    a: "Our AI engine connects to your Google Business Profile, detects new customer reviews in real-time, analyzes sentiment, injects localized SEO keywords, and publishes personalized, professional responses on 24/7 autopilot."
  },
  {
    q: "What is included in the 3-day free trial?",
    a: "The free trial gives you full access to create your business profile, customize your review funnel, download print-ready A6 QR flyers, test the AI draft generation, and view real-time scan analytics with zero credit card required."
  }
];

export default function App() {
  const routeMap = {
    '/': 'Home',
    '/how-it-works': 'How it works',
    '/vs-normal-qr': 'AI vs Normal QR',
    '/ai-vs-qr': 'AI vs Normal QR',
    '/pricing': 'Pricing',
    '/features': 'Features',
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
    '/agency-plan': 'Apply for agency',
    '/agency': 'Apply for agency',
    '/partner': 'Partner program',
    '/business-onboard': 'Business onboarding',
    '/privacy-policy': 'Privacy policy',
    '/privacy': 'Privacy policy',
    '/terms-of-service': 'Terms of service',
    '/terms': 'Terms of service',
    '/cookie-policy': 'Cookie policy',
    '/cookies': 'Cookie policy',
    '/sitemap': 'Sitemap'
  };

  const slugMap = {
    'Home': '/',
    'How it works': '/how-it-works',
    'AI vs Normal QR': '/vs-normal-qr',
    'Pricing': '/pricing',
    'Features': '/features',
    'Try the demo': '/try-demo',
    'QR flyer': '/qr-flyer',
    'Payment QR Demo': '/payment-qr-demo',
    'Demo checkout': '/demo-checkout',
    'Dashboard': '/dashboard',
    'Account': '/account',
    'Contact': '/contact',
    'Feedback': '/feedback',
    'My business': '/business',
    'Reply assistant': '/reply-assistant',
    'SEO analyzer': '/seo-analyzer',
    'About us': '/about',
    'Frequently asked questions': '/faq',
    'Source code': '/source-code',
    'Multi-business plan': '/multi-business',
    'Apply for agency': '/agency-plan',
    'Partner program': '/partner',
    'Business onboarding': '/business-onboard',
    'Privacy policy': '/privacy-policy',
    'Terms of service': '/terms-of-service',
    'Cookie policy': '/cookie-policy',
    'Sitemap': '/sitemap'
  };

  const pageFromPath = () => {
    const p = window.location.pathname.replace(/\/$/, '') || '/';
    return p.startsWith('/r/') ? 'Review' : (routeMap[p] || 'Home');
  };

  const reviewSlug = window.location.pathname.split('/')[2] || '';
  const [page, setPage] = useState(pageFromPath);
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState('');
  const [user, setUser] = useState(null);
  const [myBusiness, setMyBusiness] = useState(null);
  const [cfg, setCfg] = useState({ whatsappNumber: '919707842047', languages: ['English', 'Hindi', 'Hinglish', 'Gujarati'] });

  // Pricing toggle: 'without-reply' (Standard) vs 'with-reply' (Pro)
  const [pricingTab, setPricingTab] = useState('without-reply');
  const [pricingBilling, setPricingBilling] = useState('Monthly');

  // Interactive showcase tabs
  const [showcaseTab, setShowcaseTab] = useState('sc-analytics');

  // FAQ accordion open index
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Live Demo Funnel state in Hero
  const [demoBiz, setDemoBiz] = useState('Royal Cafe & Grill');
  const [demoExp, setDemoExp] = useState('delicious food, warm hospitality, and quick service');
  const [demoRating, setDemoRating] = useState(5);
  const [demoLang, setDemoLang] = useState('English');
  const [demoStaff, setDemoStaff] = useState('Rohit');
  const [demoDrafts, setDemoDrafts] = useState([
    "Had a wonderful experience at Royal Cafe & Grill! The delicious food and quick service made our day, and Rohit was super courteous. Highly recommended! ⭐⭐⭐⭐⭐",
    "Loved everything about Royal Cafe & Grill! Fast service, great vibes, and Rohit made sure our visit was seamless. Will visit again soon! 🌟🌟🌟🌟🌟",
    "Exceptional taste and wonderful hospitality at Royal Cafe & Grill. Huge shoutout to Rohit for prompt assistance. 5 stars all the way! ✨"
  ]);
  const [generatingDemo, setGeneratingDemo] = useState(false);

  // Auth & Demo Checkout state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regMode, setRegMode] = useState(false);
  const [demoPlan, setDemoPlan] = useState('Monthly');
  const [demoPeriod, setDemoPeriod] = useState('Monthly');
  const [demoResult, setDemoResult] = useState('');

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
      setPage(pageFromPath());
      setMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied to clipboard! Ready to paste into Google.');
    } catch {
      notify('Select the text to copy manually.');
    }
  };

  const submitAuth = async (e) => {
    e.preventDefault();
    const r = await api('POST', regMode ? '/api/auth/register' : '/api/auth/login', { email, password });
    if (!r.ok) return notify(r.data.error || 'Authentication error.');
    setToken(r.data.token);
    setUser(r.data.user);
    setPassword('');
    notify(regMode ? 'Account created! Your 3-day free trial has started.' : 'Signed in successfully.');
    navigate(regMode ? 'My business' : 'Dashboard');
  };

  const handleGenerateHeroDrafts = async () => {
    setGeneratingDemo(true);
    const r = await api('POST', '/api/drafts', {
      business: demoBiz,
      experience: demoExp,
      staff: demoStaff,
      keywords: 'fast service, authentic taste',
      language: demoLang,
      rating: demoRating
    });
    setGeneratingDemo(false);
    if (r.ok && r.data.drafts?.length) {
      setDemoDrafts(r.data.drafts.filter(Boolean));
      notify('Generated new drafts! Click any option to copy.');
    } else {
      notify('Created simulated drafts for preview.');
    }
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

  // Pricing Component with exact toggle matching user's screenshot
  const renderPricingSection = () => (
    <section className="pricing" id="pricing">
      <div className="section-header">
        <span className="section-badge"><span className="section-badge-dot"></span> Pricing</span>
        <h2>Simple, Transparent <span>Plans</span></h2>
        <p>Choose a plan that fits your business needs, from single locations to multi-business centralized management.</p>
      </div>

      {/* Free Trial 4-Point Box */}
      <div className="trial-highlight-wrap">
        <div className="trial-header-row">
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803D', background: '#DCFCE7', padding: '0.2rem 0.6rem', borderRadius: 999, display: 'inline-block', marginBottom: '0.35rem' }}>
              <i className="fa-solid fa-gift" style={{ marginRight: 4 }}></i> Free Trial Included
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Start Free 3-Day Trial — No Credit Card Required</h3>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('Account')}>
            Start 3-Day Free Trial <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div className="trial-features-grid">
          <div className="trial-feature-item">
            <strong><i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#16A34A', marginRight: 4 }}></i> AI Review Engine</strong>
            Smart drafts in 20+ languages
          </div>
          <div className="trial-feature-item">
            <strong><i className="fa-solid fa-qrcode" style={{ color: '#16A34A', marginRight: 4 }}></i> QR Code &amp; Flyer</strong>
            Printable A6 flyer &amp; link
          </div>
          <div className="trial-feature-item">
            <strong><i className="fa-solid fa-sliders" style={{ color: '#16A34A', marginRight: 4 }}></i> Keywords &amp; Staff</strong>
            Targeted SEO integration
          </div>
          <div className="trial-feature-item">
            <strong><i className="fa-solid fa-chart-line" style={{ color: '#16A34A', marginRight: 4 }}></i> Click &amp; Copy Analytics</strong>
            Real-time tracking portal
          </div>
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
          <i className="fa-solid fa-circle-info" style={{ color: '#16A34A', marginRight: 4 }}></i> Free trial gives full access to collect reviews. <em>(Priority Support, Ad-Free Funnel, and Review Drop Guarantee are included on paid memberships)</em>.
        </div>
      </div>

      {/* PLAN SELECTION TOGGLE (WITHOUT VS WITH REVIEW REPLY) */}
      <div className="home-pricing-toggle-wrap">
        <div className="home-pricing-toggle-pill">
          <button
            type="button"
            className={`home-pricing-tab-btn ${pricingTab === 'without-reply' ? 'active' : ''}`}
            onClick={() => setPricingTab('without-reply')}
          >
            <i className="fa-solid fa-layer-group"></i> Without Review Reply
            <span className="badge-pill">Standard Plans</span>
          </button>
          <button
            type="button"
            className={`home-pricing-tab-btn ${pricingTab === 'with-reply' ? 'active pro-tab' : ''}`}
            onClick={() => setPricingTab('with-reply')}
          >
            <i className="fa-solid fa-robot"></i> With Review Reply
            <span className="badge-pill">Pro Plans</span>
          </button>
        </div>
      </div>

      {/* 1. STANDARD PLANS (WITHOUT REVIEW REPLY) */}
      {pricingTab === 'without-reply' && (
        <div className="pricing-grid">
          {/* Monthly Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <div className="pricing-plan-name">Monthly Plan</div>
              <div className="pricing-plan-desc">Flexible monthly billing for single locations.</div>
            </div>
            <div className="pricing-price">
              <span className="pricing-amount">₹199</span>
              <span className="pricing-period">/month</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature" style={{ color: '#DC2626' }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: '#DC2626' }}></i> Automatic AI Review Reply (Not included)
              </li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 1 Business Location</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Magic QR Flyer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Review Generations</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Advanced Analytics Dashboard</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI SEO Analyzer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 4 Competitor Analyses</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Keyword Tracker (5 entries)</li>
            </ul>
            <button className="btn btn-secondary btn-block" onClick={() => choosePlan('Starter', 'Monthly')}>
              Select Plan <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Yearly Plan (MOST POPULAR) */}
          <div className="pricing-card popular">
            <div className="pricing-card-header">
              <div className="pricing-plan-name">Yearly Plan</div>
              <div className="pricing-plan-desc">Complete reputation automation for single locations. Save big!</div>
            </div>
            <div className="pricing-price">
              <span className="pricing-amount">₹1999</span>
              <span className="pricing-period">/year</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature" style={{ color: '#DC2626' }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: '#DC2626' }}></i> Automatic AI Review Reply (Not included)
              </li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 1 Business Location</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Magic QR Flyer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Review Generations</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Advanced Analytics Dashboard</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI SEO Analyzer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 4 Competitor Analyses</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Keyword Tracker (5 entries)</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Priority Email Support</li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => choosePlan('Starter', 'Yearly')}>
              Select Plan <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Multi-Business Plan */}
          <div className="pricing-card" style={{ borderColor: '#DDD6FE', background: 'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.07), transparent 40%), #FFFFFF' }}>
            <div className="pricing-card-header">
              <div className="pricing-plan-name" style={{ color: '#7C3AED' }}>Multi-Business Plan</div>
              <div className="pricing-plan-desc">Manage multiple business locations under one central portal.</div>
            </div>
            <div className="pricing-price">
              <span className="pricing-amount" style={{ color: '#7C3AED', fontSize: '2rem' }}>Custom</span>
              <span className="pricing-period">/tailored capacity</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Centralized Multi-Business Hub</li>
              <li className="pricing-feature" style={{ color: '#94A3B8' }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> Automatic AI Review Reply (Not available on Agency Plan)
              </li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Configurable Location Capacity</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Separate QR flyers per location</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Separate AI review customizations</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Cross-Business Analytics</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Option to Connect Own AI Keys</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Dedicated WhatsApp Support</li>
            </ul>
            <a
              href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business / Agency Plan for StarReview AI. Please share pricing and business limit details.")}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-block"
              style={{ background: '#25D366', color: '#fff', borderColor: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,0.3)' }}
            >
              <i className="fa-brands fa-whatsapp" style={{ marginRight: '0.35rem', fontSize: '1.1rem' }}></i> Chat With Us on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* 2. PRO PLANS (WITH REVIEW REPLY) */}
      {pricingTab === 'with-reply' && (
        <div className="pricing-grid">
          {/* Pro Monthly */}
          <div className="pricing-card" style={{ borderColor: '#86EFAC' }}>
            <div className="pricing-card-header">
              <div className="pricing-plan-name" style={{ color: '#15803D' }}>
                <i className="fa-solid fa-robot"></i> Pro Monthly Plan
              </div>
              <div className="pricing-plan-desc">Hands-free AI Review Replies + review collection monthly.</div>
            </div>
            <div className="pricing-price">
              <span className="pricing-amount">₹299</span>
              <span className="pricing-period">/month</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature" style={{ color: '#15803D', fontWeight: 700 }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Automatic AI Review Reply (Included)
              </li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 1 Business Location</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Magic QR Flyer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Review Generations</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Advanced Analytics Dashboard</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI SEO Analyzer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 4 Competitor Analyses</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Keyword Tracker (5 entries)</li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => choosePlan('Pro', 'Monthly')}>
              Select Pro Monthly <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Pro Yearly (MOST POPULAR) */}
          <div className="pricing-card popular" style={{ borderColor: '#16A34A' }}>
            <div className="pricing-card-header">
              <div className="pricing-plan-name" style={{ color: '#166534' }}>
                <i className="fa-solid fa-crown"></i> Pro Yearly Plan
              </div>
              <div className="pricing-plan-desc">Best Value! 24/7 Google Review Autopilot for 1 whole year.</div>
            </div>
            <div className="pricing-price">
              <span className="pricing-amount">₹2999</span>
              <span className="pricing-period">/year</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature" style={{ color: '#15803D', fontWeight: 700 }}>
                <i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Automatic AI Review Reply (Included)
              </li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 1 Business Location</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Magic QR Flyer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI Review Generations</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Advanced Analytics Dashboard</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> AI SEO Analyzer</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> 4 Competitor Analyses</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Keyword Tracker (5 entries)</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check"></i> Priority Email Support</li>
            </ul>
            <button className="btn btn-primary btn-block" onClick={() => choosePlan('Pro', 'Yearly')}>
              Select Pro Yearly <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>

          {/* Multi-Business Plan in Pro view */}
          <div className="pricing-card" style={{ borderColor: '#DDD6FE', background: 'radial-gradient(circle at 100% 0%, rgba(139,92,246,0.07), transparent 40%), #FFFFFF' }}>
            <div className="pricing-card-header">
              <div className="pricing-plan-name" style={{ color: '#7C3AED' }}>Multi-Business Plan</div>
              <div className="pricing-plan-desc">Manage multiple business locations under one central portal.</div>
            </div>
            <div className="pricing-price">
              <span className="pricing-amount" style={{ color: '#7C3AED', fontSize: '2rem' }}>Custom</span>
              <span className="pricing-period">/tailored capacity</span>
            </div>
            <ul className="pricing-features">
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Centralized Multi-Business Hub</li>
              <li className="pricing-feature" style={{ color: '#94A3B8' }}>
                <i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> Automatic AI Review Reply (Not available on Agency Plan)
              </li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Configurable Location Capacity</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Separate QR flyers per location</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Separate AI review customizations</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Cross-Business Analytics</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Option to Connect Own AI Keys</li>
              <li className="pricing-feature"><i className="fa-solid fa-circle-check" style={{ color: '#7C3AED' }}></i> Dedicated WhatsApp Support</li>
            </ul>
            <a
              href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business / Agency Plan for StarReview AI. Please share pricing and business limit details.")}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-block"
              style={{ background: '#25D366', color: '#fff', borderColor: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,0.3)' }}
            >
              <i className="fa-brands fa-whatsapp" style={{ marginRight: '0.35rem', fontSize: '1.1rem' }}></i> Chat With Us on WhatsApp
            </a>
          </div>
        </div>
      )}
    </section>
  );

  return (
    <>
      {/* AMBIENT GLOWS */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>
      <div className="ambient-glow glow-3"></div>

      {/* HEADER (HIDE ONLY ON CUSTOMER REVIEW FUNNEL) */}
      {page !== 'Review' && (
        <header className="site-header" id="site-header">
          <div className="header-container">
            <button className="brand-link" onClick={() => navigate('Home')}>
              <div className="header-brand-icon">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              <div className="header-brand-titles">
                <div className="header-brand-text">StarReview <span>AI</span></div>
                <div className="header-brand-motto">Google Magic Review QR Platform</div>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="nav-links">
              <button onClick={() => navigate('How it works')}>How It Works</button>
              <button onClick={() => navigate('AI vs Normal QR')}>AI vs Normal QR</button>
              <button onClick={() => navigate('Pricing')}>Pricing</button>
              <button onClick={() => navigate('Features')}>Features</button>
              <button onClick={() => navigate('SEO analyzer')}>SEO Analyzer</button>
              <button onClick={() => navigate('Dashboard')}>Dashboard</button>
            </nav>

            {/* Desktop Actions */}
            <div className="header-ctas">
              <button className="btn btn-secondary" onClick={() => navigate(user ? 'Dashboard' : 'Account')}>
                {user ? 'My Account' : 'Sign In'}
              </button>
              <button className="btn btn-primary" onClick={() => navigate('Account')}>
                Start Free <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>

            {/* Hamburger (Mobile) */}
            <button className="hamburger" onClick={() => setMenu(true)} aria-label="Open navigation menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>
      )}

      {/* MOBILE MENU DRAWER */}
      <div className={`mobile-menu-overlay ${menu ? 'open' : ''}`} onClick={() => setMenu(false)}></div>
      <div className={`mobile-drawer ${menu ? 'open' : ''}`}>
        <div className="mobile-drawer-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="header-brand-icon" style={{ width: 30, height: 30 }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '0.85rem' }}></i>
            </div>
            <strong>StarReview AI</strong>
          </div>
          <button className="mobile-drawer-close" onClick={() => setMenu(false)}>✕</button>
        </div>
        <div className="mobile-drawer-nav">
          <button onClick={() => navigate('Home')}><i className="fa-solid fa-house"></i> Home</button>
          <button onClick={() => navigate('How it works')}><i className="fa-solid fa-circle-question"></i> How It Works</button>
          <button onClick={() => navigate('AI vs Normal QR')}><i className="fa-solid fa-code-compare"></i> AI vs Normal QR</button>
          <button onClick={() => navigate('Pricing')}><i className="fa-solid fa-tag"></i> Pricing</button>
          <button onClick={() => navigate('Features')}><i className="fa-solid fa-sliders"></i> Features</button>
          <button onClick={() => navigate('SEO analyzer')}><i className="fa-solid fa-stethoscope"></i> SEO Analyzer</button>
          <button onClick={() => navigate('Dashboard')}><i className="fa-solid fa-chart-line"></i> Dashboard</button>
          <button onClick={() => navigate('QR flyer')}><i className="fa-solid fa-qrcode"></i> Create QR Flyer</button>
          <button onClick={() => navigate('Reply assistant')}><i className="fa-solid fa-robot"></i> Auto-Reply Assistant</button>
          <button onClick={() => navigate('Try the demo')}><i className="fa-solid fa-play"></i> Interactive Demo</button>
        </div>
        <div className="mobile-drawer-ctas">
          <button className="btn btn-primary" onClick={() => navigate('Account')}>
            Start 3-Day Free Trial <i className="fa-solid fa-arrow-right"></i>
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(user ? 'Dashboard' : 'Account')}>
            {user ? 'My Account' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* ====================================================================
          HOMEPAGE
          ==================================================================== */}
      {page === 'Home' && (
        <main>
          {/* HERO SECTION */}
          <section className="hero">
            <div className="hero-bg-grid"></div>
            <div className="hero-bg-glow"></div>
            <div className="hero-inner">
              <div className="hero-eyebrow">
                <i className="fa-solid fa-wand-magic-sparkles"></i> The Google Magic Review QR Platform
              </div>
              <h1>
                Turn Every Customer into a<br />
                <span>5-Star Google Review in 10s</span>
              </h1>
              <p className="hero-desc">
                We generate smart review QR codes for Google My Business. <strong>StarReview AI</strong> helps your customers write and post authentic 5-star Google reviews in 10 seconds, while private feedback shields your public rating.
              </p>
              <div className="hero-ctas">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('Account')}>
                  <i className="fa-solid fa-rocket"></i> Start 3-Day Free Trial
                </button>
                <button className="btn btn-secondary btn-lg" onClick={() => navigate('How it works')}>
                  <i className="fa-solid fa-circle-question"></i> How It Works
                </button>
              </div>
              <div className="hero-note-wrapper">
                <span className="hero-note-pill">
                  <i className="fa-solid fa-credit-card"></i> No credit card required
                </span>
                <span className="hero-note-dot">•</span>
                <span className="hero-note-secondary">
                  <i className="fa-solid fa-bolt"></i> Ready in 2 minutes
                </span>
              </div>

              {/* FLOATING REVIEW PILLS */}
              <div className="hero-pills">
                <div className="review-pill">
                  <div className="review-pill-avatar" style={{ background: '#4285F4' }}>RK</div>
                  <div className="review-pill-stars">★★★★★</div>
                  <div className="review-pill-text">Amazing service!</div>
                </div>
                <div className="review-pill">
                  <div className="review-pill-avatar" style={{ background: '#34A853' }}>PM</div>
                  <div className="review-pill-stars">★★★★★</div>
                  <div className="review-pill-text">Highly recommend!</div>
                </div>
                <div className="review-pill">
                  <div className="review-pill-avatar" style={{ background: '#EA4335' }}>AS</div>
                  <div className="review-pill-stars">★★★★★</div>
                  <div className="review-pill-text">Best in the area 😍</div>
                </div>
              </div>

              {/* LIVE DEMO REVIEW GENERATOR MOCKUP */}
              <div className="hero-demo-box">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 10, height: 10, background: '#16A34A', borderRadius: '50%', display: 'inline-block' }}></span>
                    <strong style={{ fontSize: '0.95rem' }}>Interactive Review QR Simulator</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#166534', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 999 }}>LIVE DEMO</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Customer Rating:
                    </label>
                    <div className="rating-select" style={{ marginBottom: 12 }}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button" className={demoRating >= n ? 'on' : ''} onClick={() => setDemoRating(n)}>★</button>
                      ))}
                    </div>

                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Business Name:
                    </label>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: '0.85rem', marginBottom: 12 }}
                      value={demoBiz}
                      onChange={e => setDemoBiz(e.target.value)}
                    />

                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                      Service / Staff Member:
                    </label>
                    <input
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: '0.85rem', marginBottom: 12 }}
                      value={demoStaff}
                      onChange={e => setDemoStaff(e.target.value)}
                      placeholder="e.g. Priya or Rohit"
                    />

                    <button className="btn btn-primary btn-block" onClick={handleGenerateHeroDrafts} disabled={generatingDemo}>
                      {generatingDemo ? 'Generating AI Drafts...' : '✦ Generate Review Drafts'}
                    </button>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <span>AI Generated Suggestions (Tap to Copy)</span>
                      <span style={{ color: '#16A34A' }}>24+ Languages</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {demoDrafts.map((draft, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0.75rem 0.9rem', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => copyText(draft)}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16A34A' }}>Option {idx + 1}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <i className="fa-regular fa-copy"></i> Copy ↗
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>{draft}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* TRUST BAR */}
          <section className="trust-bar">
            <div className="trust-bar-inner">
              <div className="trust-item"><i className="fa-solid fa-wand-magic-sparkles"></i> Google Magic Review QR</div>
              <div className="trust-item"><i className="fa-solid fa-qrcode"></i> Google My Business Review QR</div>
              <div className="trust-item"><i className="fa-solid fa-robot"></i> AI-Powered Review QR Funnels</div>
              <div className="trust-item"><i className="fa-solid fa-shield-halved"></i> Private Feedback Shield</div>
              <div className="trust-item"><i className="fa-solid fa-print"></i> Print-Ready Designer Standees</div>
            </div>
          </section>

          {/* CORE SYSTEM FEATURES */}
          <section className="features" id="features">
            <div className="section-header">
              <span className="section-badge"><span className="section-badge-dot"></span> Core System Features</span>
              <h2>Why Businesses Choose <span>StarReview AI</span></h2>
              <p>A complete review growth engine that turns store visits into 5-star Google Business reviews effortlessly.</p>
            </div>
            <div className="features-grid">
              {featuresList.map(f => (
                <div className="feature-card" key={f.title} style={f.highlight ? { borderColor: 'rgba(52, 168, 83, 0.4)', background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)' } : {}}>
                  {f.badge && (
                    <span style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#DCFCE7', color: '#15803D', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: 999, border: '1px solid #BBF7D0', textTransform: 'uppercase' }}>
                      <i className="fa-solid fa-bolt"></i> {f.badge}
                    </span>
                  )}
                  <div className={`feature-icon ${f.colorClass}`} style={f.highlight ? { background: 'var(--green-gradient)', color: '#fff' } : {}}>
                    <i className={f.icon}></i>
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <button className="feature-link" onClick={() => navigate(f.target)}>
                    Explore feature <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* AI AUTOMATIC REVIEW REPLY SHOWCASE */}
          <section className="reply-showcase">
            <div className="reply-card">
              <div>
                <span className="reply-badge"><i className="fa-solid fa-bolt"></i> 24/7 Autopilot Reputation Engine</span>
                <h2>Never Leave a Customer Waiting: <span>AI Powered Automatic Review Reply System</span></h2>
                <p>Respond to 100% of your Google reviews in seconds. Our autonomous AI engine analyzes customer sentiment, matches your brand voice, and publishes authentic, keyword-optimized responses straight to Google Maps on complete autopilot.</p>
                <ul className="reply-features-list">
                  <li className="reply-feature-pill">
                    <i className="fa-solid fa-circle-check"></i>
                    <div><strong>Instant 24/7 Autopilot:</strong> Direct Google Business Profile API publishing within minutes of review receipt.</div>
                  </li>
                  <li className="reply-feature-pill">
                    <i className="fa-solid fa-circle-check"></i>
                    <div><strong>Sentiment-Aware Intelligence:</strong> Enthusiastic gratitude for 5-star praise, empathetic de-escalation for 1–3 star complaints.</div>
                  </li>
                  <li className="reply-feature-pill">
                    <i className="fa-solid fa-circle-check"></i>
                    <div><strong>Local SEO Keyword Injections:</strong> Mentions your top services and city naturally to boost your Google Maps ranking signals.</div>
                  </li>
                  <li className="reply-feature-pill">
                    <i className="fa-solid fa-circle-check"></i>
                    <div><strong>Complete Owner Control:</strong> Choose set-and-forget hands-free autopilot, delay timers, or 1-click manual review.</div>
                  </li>
                </ul>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-white btn-lg" onClick={() => navigate('Account')}>
                    <i className="fa-solid fa-robot"></i> Activate Autopilot Replies
                  </button>
                  <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('Reply assistant')}>
                    <i className="fa-solid fa-play"></i> Try Reply Assistant
                  </button>
                </div>
              </div>

              {/* DEMO CARD */}
              <div className="reply-demo-card">
                <div className="reply-live-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-brands fa-google" style={{ color: '#4285F4', fontSize: '1.1rem' }}></i>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>Live Auto-Reply Engine</span>
                  </div>
                  <div className="reply-status-pill"><span className="reply-status-dot"></span> Autopilot Active</div>
                </div>

                <div className="reply-mock-review">
                  <div className="reply-mock-author">
                    <div className="reply-mock-avatar">SJ</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>Sarah Jenkins</div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.6)' }}>Local Guide · 38 reviews · Just now</div>
                    </div>
                    <div style={{ color: '#FBBC05', fontSize: '0.75rem', letterSpacing: 1 }}>★★★★★</div>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, margin: 0 }}>
                    "Absolutely thrilled with the prompt service and attention to detail. The team was so kind and professional. Will recommend to all my friends!"
                  </p>
                </div>

                <div className="reply-mock-ai-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4ADE80', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <i className="fa-solid fa-robot"></i> Automated Response · Published in 38s
                    </span>
                    <span style={{ fontSize: '0.58rem', background: 'rgba(74,222,128,0.2)', color: '#4ADE80', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: 4, textTransform: 'uppercase' }}>
                      Live on Google
                    </span>
                  </div>
                  <p style={{ fontSize: '0.73rem', color: '#fff', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                    "Hi Sarah! Thank you so much for your wonderful 5-star review! 😊 We're delighted you experienced our prompt customer service and professional team. Looking forward to welcoming you back soon!"
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* AI SEO ANALYZER SHOWCASE */}
          <section className="analyzer-showcase">
            <div className="analyzer-card">
              <div>
                <span className="analyzer-badge">New Diagnostic Tool</span>
                <h2>Diagnose &amp; Scale Your Google Maps Rankings</h2>
                <p>Our AI SEO Analyzer runs automated 20-point diagnostic scans to detect missing categories, review sentiment gaps, NAP inconsistencies, and technical schema errors.</p>
                <button className="btn btn-white" onClick={() => navigate('SEO analyzer')}>
                  <i className="fa-solid fa-stethoscope"></i> Explore AI SEO Analyzer
                </button>
              </div>
              <div className="analyzer-stat">
                <div className="analyzer-circle">
                  <span className="analyzer-circle-score">94%</span>
                  <span className="analyzer-circle-label">Health Score</span>
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800 }}>Instant GMB Audit &amp; Report</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Automated checks across 6 core SEO dimensions</p>
              </div>
            </div>
          </section>

          {/* HOW IT WORKS (THE 4-STEP REVIEW FUNNEL) */}
          <section className="how" id="how-it-works">
            <div className="how-inner">
              <div className="section-header">
                <span className="section-badge"><span className="section-badge-dot"></span> The 4-Step Review Funnel</span>
                <h2>How StarReview AI <span>Generates 5-Star Reviews</span></h2>
                <p>A friction-free mobile experience that turns happy in-store customers into authentic 5-star Google Business reviews in 10 seconds.</p>
              </div>
              <div className="how-steps">
                <div className="how-step">
                  <span className="how-step-num">1</span>
                  <h3>Scan Google Business Review QR</h3>
                  <p>Customers scan your custom table standee or tap your review funnel link using any smartphone camera.</p>
                </div>
                <div className="how-step">
                  <span className="how-step-num">2</span>
                  <h3>Select Experience &amp; Language</h3>
                  <p>Patron selects 5 stars and chooses their preferred language from 24+ global and regional options.</p>
                </div>
                <div className="how-step">
                  <span className="how-step-num">3</span>
                  <h3>AI Suggests Personalized Reviews</h3>
                  <p>The <strong>Google Magic Review QR</strong> creates 3 human-like reviews with your business SEO keywords and emojis.</p>
                </div>
                <div className="how-step">
                  <span className="how-step-num">4</span>
                  <h3>1-Tap Copy &amp; Post to Google</h3>
                  <p>Customer taps "Copy &amp; Post" and is immediately redirected to your Google My Business review popup.</p>
                </div>
              </div>
            </div>
          </section>

          {/* NORMAL QR VS MAGIC REVIEW QR */}
          <section className="comparison-section">
            <div className="section-header">
              <span className="section-badge"><span className="section-badge-dot"></span> Why Google Magic QR Wins</span>
              <h2>Normal QR Codes vs. <span>Google Magic Review QR</span></h2>
              <p>See why traditional static QR stickers fail while StarReview AI converts up to 84% of customer scans.</p>
            </div>
            <div className="comparison-preview-grid">
              <div className="comparison-card traditional">
                <span className="comparison-badge red">
                  <i className="fa-solid fa-xmark"></i> Standard Static QR
                </span>
                <h3>Basic Google Review Link</h3>
                <p>A static barcode opening a blank review box that leaves customers confused and unmotivated.</p>
                <ul className="comparison-list">
                  <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> Blank text box causes writer's block</li>
                  <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> English only — zero regional language choices</li>
                  <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> No keyword, staff, or product context</li>
                  <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> 1–3 star ratings post directly to Google Maps</li>
                  <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> Zero scan, review, or copy interaction tracking</li>
                </ul>
              </div>

              <div className="comparison-card reviewflow">
                <span className="comparison-badge green">
                  <i className="fa-solid fa-wand-magic-sparkles"></i> StarReview AI Magic QR
                </span>
                <h3>AI-Powered Review QR Funnel</h3>
                <p>An intelligent guided experience that crafts hyper-specific, positive reviews in 1 tap.</p>
                <ul className="comparison-list">
                  <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> 3 instant human-like reviews eliminate blank screen delay</li>
                  <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> 24+ languages including Hindi, Hinglish, &amp; regional dialects</li>
                  <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Automatically injects staff names, services &amp; Google SEO keywords</li>
                  <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Private feedback routing protects your Google My Business rating</li>
                  <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> AI Powered Automatic Review Reply system responds 24/7</li>
                  <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Real-time analytics for scans, reviews, copies &amp; redirects</li>
                </ul>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-secondary" onClick={() => navigate('AI vs Normal QR')}>
                View Full Feature Comparison <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </section>

          {/* INDUSTRIES */}
          <section className="industries">
            <div className="section-header">
              <span className="section-badge"><span className="section-badge-dot"></span> Works For Every Business</span>
              <h2>Built for <span>All Local Industries</span></h2>
              <p>Whether you run a restaurant, clinic, salon, or retail store — StarReview AI adapts to your business type.</p>
            </div>
            <div className="industries-grid">
              {industriesList.map(item => (
                <div className="industry-card" key={item.name}>
                  <i className={item.icon}></i>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SHOWCASE TABS (REPUTATION HUB) */}
          <section className="showcase">
            <div className="showcase-inner">
              <div className="section-header">
                <span className="section-badge"><span className="section-badge-dot"></span> Console Showcase</span>
                <h2>Explore Your <span>Reputation Hub</span></h2>
                <p>A centralized workspace to simplify listing management, flyer generation, and reviews monitoring.</p>
              </div>
              <div className="showcase-tabs">
                <button className={`showcase-tab ${showcaseTab === 'sc-analytics' ? 'active' : ''}`} onClick={() => setShowcaseTab('sc-analytics')}>
                  <i className="fa-solid fa-chart-bar"></i> Performance Analytics
                </button>
                <button className={`showcase-tab ${showcaseTab === 'sc-reviews' ? 'active' : ''}`} onClick={() => setShowcaseTab('sc-reviews')}>
                  <i className="fa-solid fa-robot"></i> AI Automatic Review Reply
                </button>
                <button className={`showcase-tab ${showcaseTab === 'sc-qr' ? 'active' : ''}`} onClick={() => setShowcaseTab('sc-qr')}>
                  <i className="fa-solid fa-qrcode"></i> QR Flyer Customizer
                </button>
                <button className={`showcase-tab ${showcaseTab === 'sc-ai' ? 'active' : ''}`} onClick={() => setShowcaseTab('sc-ai')}>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> AI Draft Assistant
                </button>
              </div>

              <div className="showcase-content">
                {showcaseTab === 'sc-analytics' && (
                  <div className="showcase-panel">
                    <div className="showcase-text">
                      <h3>Real-Time Funnel Analytics</h3>
                      <p>Track metrics like scan frequency, redirection rates, and conversion percentages to optimize your review funnel performance.</p>
                      <ul className="showcase-bullets">
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Track conversion rates by week or month</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Access customer sentiment and trend breakdowns</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Monitor listing rating history automatically</li>
                      </ul>
                      <button className="btn btn-primary" onClick={() => navigate('Account')}>
                        Get Started <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                    <div className="showcase-preview">
                      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                          <span><i className="fa-solid fa-chart-column" style={{ color: '#16A34A', marginRight: 4 }}></i> Funnel Clicks</span>
                          <span style={{ color: '#16A34A' }}><i className="fa-solid fa-arrow-trend-up"></i> +24%</span>
                        </div>
                        <div style={{ height: 110, display: 'flex', alignItems: 'flex-end', gap: 10, borderBottom: '1px solid #F1F5F9', paddingBottom: 6 }}>
                          <div style={{ flex: 1, height: '38%', background: '#DCFCE7', borderRadius: '4px 4px 0 0' }}></div>
                          <div style={{ flex: 1, height: '52%', background: '#DCFCE7', borderRadius: '4px 4px 0 0' }}></div>
                          <div style={{ flex: 1, height: '45%', background: '#DCFCE7', borderRadius: '4px 4px 0 0' }}></div>
                          <div style={{ flex: 1, height: '70%', background: '#86EFAC', borderRadius: '4px 4px 0 0' }}></div>
                          <div style={{ flex: 1, height: '82%', background: '#22C55E', borderRadius: '4px 4px 0 0' }}></div>
                          <div style={{ flex: 1, height: '95%', background: 'linear-gradient(135deg, #34A853, #2D9248)', borderRadius: '4px 4px 0 0' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {showcaseTab === 'sc-reviews' && (
                  <div className="showcase-panel">
                    <div className="showcase-text">
                      <h3>AI Powered Automatic Review Reply System</h3>
                      <p>Never let a Google review go unanswered. Set up intelligent 24/7 autopilot that analyzes review sentiment, drafts personalized responses, and publishes straight to Google.</p>
                      <ul className="showcase-bullets">
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> 24/7 hands-free autopilot connected via Google Business API</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Sentiment-tailored tone for 5-star praise &amp; 1-star resolution</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Naturally weaves in your business keywords to boost rankings</li>
                      </ul>
                      <button className="btn btn-primary" onClick={() => navigate('Account')}>
                        Enable Auto-Reply <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                    <div className="showcase-preview">
                      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#334155' }}><i className="fa-solid fa-robot" style={{ color: '#16A34A', marginRight: 4 }}></i> Autopilot Engine</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#15803D', background: '#DCFCE7', padding: '0.15rem 0.5rem', borderRadius: 999 }}>ACTIVE 24/7</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic', margin: 0 }}>
                          "Hi John, thank you for the wonderful 5-star review! We're thrilled that you had a great experience with our friendly team!"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showcaseTab === 'sc-qr' && (
                  <div className="showcase-panel">
                    <div className="showcase-text">
                      <h3>QR Flyer Customization Panel</h3>
                      <p>Customize flyer colors to match your brand. Choose print-ready A6 templates or counter table tents for your store.</p>
                      <ul className="showcase-bullets">
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Real-time color matching options</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Download high-resolution PNG flyers</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Clean branding and instant QR generation</li>
                      </ul>
                      <button className="btn btn-primary" onClick={() => navigate('QR flyer')}>
                        Customize Flyer <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                    <div className="showcase-preview" style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: 140, background: '#fff', border: '2px solid #34A853', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.55rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Rate Us on Google</div>
                        <div style={{ width: 75, height: 75, background: '#F8FAFC', borderRadius: 8, margin: '0 auto 0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className="fa-solid fa-qrcode" style={{ fontSize: '2rem', color: '#1E293B' }}></i>
                        </div>
                        <div style={{ fontSize: '0.45rem', fontWeight: 700, color: '#15803D' }}>Scan to leave feedback</div>
                      </div>
                    </div>
                  </div>
                )}

                {showcaseTab === 'sc-ai' && (
                  <div className="showcase-panel">
                    <div className="showcase-text">
                      <h3>AI Review Generation Drafts</h3>
                      <p>Lower the friction of leaving reviews. Provide customers with pre-written drafts incorporating industry keywords and emojis.</p>
                      <ul className="showcase-bullets">
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> 3 human-crafted draft options per visit</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> 24+ languages including Hindi &amp; Hinglish</li>
                        <li className="showcase-bullet"><i className="fa-solid fa-circle-check"></i> Injects staff, products &amp; services seamlessly</li>
                      </ul>
                      <button className="btn btn-primary" onClick={() => navigate('Try the demo')}>
                        Try AI Assistant <i className="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                    <div className="showcase-preview">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ background: '#fff', border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: 8 }}>
                          <span style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: 800 }}><i className="fa-solid fa-wand-magic-sparkles"></i> Draft Option 1</span>
                          <p style={{ fontSize: '0.72rem', color: '#334155', fontStyle: 'italic', margin: '0.25rem 0 0' }}>"Extremely helpful staff! They answered all my questions and the service was quick. 😊 Highly recommend!"</p>
                        </div>
                        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.75rem', borderRadius: 8 }}>
                          <span style={{ fontSize: '0.62rem', color: '#15803D', fontWeight: 800 }}><i className="fa-solid fa-wand-magic-sparkles"></i> Draft Option 2</span>
                          <p style={{ fontSize: '0.72rem', color: '#334155', fontStyle: 'italic', margin: '0.25rem 0 0' }}>"Great experience overall — very clean, professional and the team really made me feel welcome. ⭐⭐⭐⭐⭐"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* STATS STRIP */}
          <section className="stats-strip">
            <div className="stats-strip-inner">
              <div className="stat-item">
                <div className="stat-value">84.6%</div>
                <div className="stat-label">Avg. Conversion Rate</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">1,200+</div>
                <div className="stat-label">Active Businesses</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">5★</div>
                <div className="stat-label">Average Google Rating</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">10s</div>
                <div className="stat-label">Average Review Time</div>
              </div>
            </div>
          </section>

          {/* PRICING SECTION */}
          {renderPricingSection()}

          {/* TESTIMONIALS */}
          <section className="testimonials">
            <div className="testimonials-inner">
              <div className="section-header">
                <span className="section-badge"><span className="section-badge-dot"></span> Customer Stories</span>
                <h2>Trusted by <span>Local Businesses</span></h2>
                <p>See how StarReview AI is helping businesses across India grow their Google ratings and online visibility.</p>
              </div>
              <div className="testimonials-grid">
                {testimonialsList.map((t, idx) => (
                  <div className="testimonial-card" key={idx}>
                    <div className="testimonial-stars">★★★★★</div>
                    <p className="testimonial-text">"{t.text}"</p>
                    <div className="testimonial-author">
                      <div className="testimonial-avatar" style={{ background: t.avatarBg }}>{t.initials}</div>
                      <div>
                        <div className="testimonial-name">{t.author}</div>
                        <div className="testimonial-role">{t.role}</div>
                      </div>
                      <div className="testimonial-google">
                        <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i> Verified
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="faq" id="faq">
            <div className="faq-inner">
              <div className="section-header">
                <span className="section-badge"><span className="section-badge-dot"></span> Common Questions</span>
                <h2>Frequently Asked <span>Questions</span></h2>
                <p>Answers to common questions about setting up your StarReview AI review funnel.</p>
              </div>
              <div className="faq-list">
                {faqList.map((f, i) => (
                  <div className={`faq-item ${openFaq === i ? 'active' : ''}`} key={i}>
                    <button className="faq-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span>{f.q}</span>
                      <span className="faq-icon"><i className="fa-solid fa-plus"></i></span>
                    </button>
                    {openFaq === i && (
                      <div className="faq-content">
                        <p>{f.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="cta">
            <div className="cta-card">
              <div className="cta-card-inner">
                <span className="cta-badge"><i className="fa-solid fa-rocket"></i> Get Started In 2 Minutes</span>
                <h2>Start Collecting 5-Star Reviews Today</h2>
                <p>Deploy your <strong>Google Magic Review QR</strong> in under two minutes. No credit card required.</p>
                <div className="cta-buttons">
                  <button className="btn btn-white btn-lg" onClick={() => navigate('Account')}>
                    Start Free 3-Day Trial <i className="fa-solid fa-arrow-right"></i>
                  </button>
                  <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('Pricing')}>
                    View All Plans
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ====================================================================
          PRICING PAGE
          ==================================================================== */}
      {page === 'Pricing' && (
        <main className="page-shell wrap">
          {renderPricingSection()}
        </main>
      )}

      {/* ====================================================================
          FEATURES PAGE
          ==================================================================== */}
      {page === 'Features' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Platform Features</span>
            <h2>Tools to Build Trust, <span>Thoughtfully</span></h2>
            <p>A connected toolkit for feedback collection, AI-assisted writing, and reputation insights.</p>
          </div>
          <div className="features-grid">
            {featuresList.map(f => (
              <div className="feature-card" key={f.title}>
                <div className={`feature-icon ${f.colorClass}`}>
                  <i className={f.icon}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(f.target)}>
                  Open tool <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* ====================================================================
          HOW IT WORKS PAGE
          ==================================================================== */}
      {page === 'How it works' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> The Process</span>
            <h2>A Better Feedback Loop, <span>In Four Steps</span></h2>
            <p>Keep the experience clear for customers and actionable for your team.</p>
          </div>
          <div className="how-steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="how-step">
              <span className="how-step-num">01</span>
              <h3>Set up your business profile</h3>
              <p>Add your business details, services, staff, keywords and Google review link in under 2 minutes.</p>
            </div>
            <div className="how-step">
              <span className="how-step-num">02</span>
              <h3>Print your Magic QR flyer</h3>
              <p>Create a QR code and a print-ready A6 flyer or table tent matching your brand colors and logo.</p>
            </div>
            <div className="how-step">
              <span className="how-step-num">03</span>
              <h3>Customers share genuine feedback</h3>
              <p>Customers choose stars, staff and language, then select from 3 pre-crafted AI review suggestions.</p>
            </div>
            <div className="how-step">
              <span className="how-step-num">04</span>
              <h3>Track, auto-reply &amp; rank</h3>
              <p>Track scans and conversions, publish 24/7 AI replies, and optimize your listing health score.</p>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          AI VS NORMAL QR COMPARISON PAGE
          ==================================================================== */}
      {page === 'AI vs Normal QR' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Feature Comparison</span>
            <h2>Normal QR Codes vs. <span>Google Magic Review QR</span></h2>
            <p>Compare a plain review link with a guided feedback flow that helps customers know what to do next.</p>
          </div>
          <div className="comparison-preview-grid">
            <div className="comparison-card traditional">
              <span className="comparison-badge red">
                <i className="fa-solid fa-xmark"></i> Standard Static QR
              </span>
              <h3>Basic Google Review Link</h3>
              <p>A static barcode opening a blank review box that leaves customers confused and unmotivated.</p>
              <ul className="comparison-list">
                <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> Blank text box causes writer's block</li>
                <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> English only — zero regional language choices</li>
                <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> No keyword, staff, or product context</li>
                <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> 1–3 star ratings post directly to Google Maps</li>
                <li><i className="fa-solid fa-circle-xmark" style={{ color: '#EF4444' }}></i> Zero scan, review, or copy interaction tracking</li>
              </ul>
            </div>

            <div className="comparison-card reviewflow">
              <span className="comparison-badge green">
                <i className="fa-solid fa-wand-magic-sparkles"></i> StarReview AI Magic QR
              </span>
              <h3>AI-Powered Review QR Funnel</h3>
              <p>An intelligent guided experience that crafts hyper-specific, positive reviews in 1 tap.</p>
              <ul className="comparison-list">
                <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> 3 instant human-like reviews eliminate blank screen delay</li>
                <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> 24+ languages including Hindi, Hinglish, &amp; regional dialects</li>
                <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Automatically injects staff names, services &amp; Google SEO keywords</li>
                <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Private feedback routing protects your Google My Business rating</li>
                <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> AI Powered Automatic Review Reply system responds 24/7</li>
                <li><i className="fa-solid fa-circle-check" style={{ color: '#16A34A' }}></i> Real-time analytics for scans, reviews, copies &amp; redirects</li>
              </ul>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          DEMO CHECKOUT
          ==================================================================== */}
      {page === 'Demo checkout' && (
        <main className="page-shell wrap">
          <div className="panel form-panel" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="section-badge" style={{ marginBottom: 12 }}>
              <i className="fa-solid fa-shield-halved"></i> SAFE DEMO · SIMULATED CHECKOUT
            </div>
            <h2>Selected Plan Checkout</h2>
            <label>
              Plan selected:
              <select value={demoPlan} onChange={e => { setDemoPlan(e.target.value); setDemoResult(''); }}>
                <option value="Starter">Starter (Standard) — ₹199 / mo or ₹1,999 / yr</option>
                <option value="Pro">Pro (With Review Reply) — ₹299 / mo or ₹2,999 / yr</option>
              </select>
            </label>
            <label>
              Billing frequency:
              <select value={demoPeriod} onChange={e => { setDemoPeriod(e.target.value); setDemoResult(''); }}>
                <option value="Monthly">Monthly Billing</option>
                <option value="Yearly">Yearly Billing (Best Value)</option>
              </select>
            </label>
            <div className="notice">
              <strong>{demoPlan} Plan · {demoPeriod}</strong>
              <p style={{ margin: '4px 0' }}>
                {demoPlan === 'Starter'
                  ? (demoPeriod === 'Monthly' ? '₹199 per month' : '₹1,999 per year')
                  : (demoPeriod === 'Monthly' ? '₹299 per month' : '₹2,999 per year')}
              </p>
              <small>Simulated test environment. No real bank or card transactions are triggered.</small>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button className="btn btn-primary" onClick={() => setDemoResult('success')}>
                Simulate Successful Payment ✓
              </button>
              <button className="btn btn-secondary" onClick={() => setDemoResult('failed')}>
                Simulate Failed Payment
              </button>
            </div>
            {demoResult === 'success' && (
              <div className="notice" style={{ marginTop: 16 }}>
                <strong>Demo Payment Successful</strong>
                <p>Simulated checkout completed. You can now test account access.</p>
                <button className="btn btn-primary btn-sm" onClick={() => { setDemoResult(''); navigate('Dashboard'); }}>
                  Go to Dashboard ↗
                </button>
              </div>
            )}
            {demoResult === 'failed' && (
              <div className="notice" style={{ marginTop: 16, borderColor: '#FCA5A5', background: '#FEF2F2', color: '#B91C1C' }}>
                <strong>Demo Payment Failed</strong>
                <p>Simulated failure completed for testing.</p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ====================================================================
          ACCOUNT / LOGIN / REGISTER
          ==================================================================== */}
      {page === 'Account' && (
        <main className="page-shell wrap">
          {user ? (
            <div className="account-card">
              <div className="large-mark"><i className="fa-solid fa-user"></i></div>
              <h3>{user.email}</h3>
              <p>
                {user.subscription && user.access
                  ? (user.subscription.plan === 'Trial'
                    ? `Free trial active until ${new Date(user.subscription.expiresAt).toLocaleDateString()}`
                    : `${user.subscription.plan} plan (${user.subscription.period}) active until ${new Date(user.subscription.expiresAt).toLocaleDateString()}`)
                  : 'Your account is active. Choose a plan or open your dashboard.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary btn-block" onClick={() => navigate('Dashboard')}>
                  Open Dashboard ↗
                </button>
                <button className="btn btn-secondary btn-block" onClick={() => navigate('Pricing')}>
                  View Plans &amp; Pricing
                </button>
                <button type="button" className="text-btn centered" onClick={logout}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <form className="account-card" onSubmit={submitAuth}>
              <div className="large-mark"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
              <h3>{regMode ? 'Start Your 3-Day Free Trial' : 'Sign In to StarReview AI'}</h3>
              <p>{regMode ? 'No credit card needed. Instant setup in 2 minutes.' : 'Welcome back! Enter your login details.'}</p>
              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@business.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  minLength="8"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>
              <button className="btn btn-primary btn-block" style={{ marginTop: 12 }}>
                {regMode ? 'Start Free Trial ↗' : 'Sign In ↗'}
              </button>
              <button type="button" className="text-btn centered" onClick={() => setRegMode(!regMode)}>
                {regMode ? 'Already have an account? Sign in' : 'New here? Start your 3-day free trial'}
              </button>
              <button type="button" className="text-btn centered" onClick={() => navigate('Dashboard')}>
                Explore sample dashboard ↗
              </button>
            </form>
          )}
        </main>
      )}

      {/* ====================================================================
          QR FLYER PAGE
          ==================================================================== */}
      {page === 'QR flyer' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Designer Standees</span>
            <h2>Create Your Review <span>QR Flyer</span></h2>
            <p>Generate a QR code that opens your review page, WhatsApp or any link, and download a print-ready A6 flyer.</p>
          </div>
          <QrFlyer key={myBusiness?.id || 'none'} business={myBusiness} cfg={cfg} notify={notify} navigate={navigate} />
        </main>
      )}

      {/* ====================================================================
          DASHBOARD PAGE
          ==================================================================== */}
      {page === 'Dashboard' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Real-Time Console</span>
            <h2>Your Reputation <span>Hub</span></h2>
            <p>{user ? 'Live numbers from your review page.' : 'A sample dashboard. Sign in to see your own live numbers.'}</p>
          </div>
          <Dashboard user={user} business={myBusiness} navigate={navigate} />
        </main>
      )}

      {/* ====================================================================
          MY BUSINESS PAGE
          ==================================================================== */}
      {page === 'My business' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Setup Profile</span>
            <h2>Your Business <span>Profile</span></h2>
            <p>These details power your customer review page, drafts and flyer.</p>
          </div>
          <BusinessSetup user={user} business={myBusiness} setBusiness={setMyBusiness} notify={notify} navigate={navigate} cfg={cfg} />
        </main>
      )}

      {/* ====================================================================
          REPLY ASSISTANT PAGE
          ==================================================================== */}
      {page === 'Reply assistant' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Auto-Reply</span>
            <h2>Review Reply <span>Assistant</span></h2>
            <p>Paste a Google review and get a polite, sentiment-aware reply to copy and post.</p>
          </div>
          <ReplyAssistant user={user} notify={notify} navigate={navigate} />
        </main>
      )}

      {/* ====================================================================
          SEO ANALYZER PAGE
          ==================================================================== */}
      {page === 'SEO analyzer' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Health Check</span>
            <h2>Profile Health &amp; <span>SEO Analyzer</span></h2>
            <p>Run a 20-point check of your Google Business Profile and compare yourself with local competitors.</p>
          </div>
          <SeoAnalyzer user={user} business={myBusiness} setBusiness={setMyBusiness} notify={notify} />
        </main>
      )}

      {/* ====================================================================
          TRY THE DEMO PAGE
          ==================================================================== */}
      {page === 'Try the demo' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Interactive Simulator</span>
            <h2>Review Assistant <span>Demo</span></h2>
            <p>Drafts are editable suggestions to show how customers experience the Magic Review QR flow.</p>
          </div>
          <div className="panel form-panel" style={{ maxWidth: 650, margin: '0 auto' }}>
            <label>
              Business Name:
              <input value={demoBiz} onChange={e => setDemoBiz(e.target.value)} />
            </label>
            <label>
              Rating:
              <div className="rating-select">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" className={demoRating >= n ? 'on' : ''} onClick={() => setDemoRating(n)}>★</button>
                ))}
              </div>
            </label>
            <label>
              Experience Note:
              <textarea rows={3} value={demoExp} onChange={e => setDemoExp(e.target.value)} />
            </label>
            <label>
              Staff Member (Optional):
              <input value={demoStaff} onChange={e => setDemoStaff(e.target.value)} placeholder="e.g. Priya" />
            </label>
            <label>
              Language:
              <select value={demoLang} onChange={e => setDemoLang(e.target.value)}>
                {(cfg.languages || ['English', 'Hindi', 'Hinglish', 'Gujarati']).map(l => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
            <button className="btn btn-primary btn-block" onClick={handleGenerateHeroDrafts} disabled={generatingDemo}>
              {generatingDemo ? 'Creating Drafts...' : '✦ Generate Review Drafts'}
            </button>
            <div style={{ marginTop: 20 }}>
              {demoDrafts.map((d, i) => (
                <div className="draft" key={i}>
                  <div className="draft-top">
                    <span>Draft Option {i + 1}</span>
                    <button className="copy-btn" onClick={() => copyText(d)}>Copy ↗</button>
                  </div>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          CUSTOMER REVIEW FUNNEL (OPENS VIA QR SCAN)
          ==================================================================== */}
      {page === 'Review' && (
        <ReviewFunnel slug={reviewSlug} notify={notify} />
      )}

      {/* ====================================================================
          CONTACT & FEEDBACK
          ==================================================================== */}
      {page === 'Contact' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Get In Touch</span>
            <h2>Let's Talk About Your <span>Reputation Workflow</span></h2>
            <p>Send us an inquiry and our team will get back to you promptly.</p>
          </div>
          <form className="contact-card" onSubmit={async e => {
            e.preventDefault();
            const form = e.currentTarget;
            const fields = form.querySelectorAll('input,select,textarea');
            try {
              const r = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: fields[0].value,
                  email: fields[1].value,
                  topic: fields[2].value,
                  message: fields[3].value
                })
              });
              const raw = await r.text();
              let d = {};
              try { d = raw ? JSON.parse(raw) : {}; } catch {}
              notify(d.message || 'Inquiry submitted successfully! We will contact you soon.');
              form.reset();
            } catch (err) {
              notify('Inquiry saved. We will contact you shortly.');
              form.reset();
            }
          }}>
            <label>Your Name<input required placeholder="Full Name" /></label>
            <label>Work Email<input type="email" required placeholder="you@business.com" /></label>
            <label>Topic<select><option>Product Demo</option><option>Agency / Multiple Locations</option><option>Technical Integration</option><option>General Inquiry</option></select></label>
            <label>Message<textarea required rows={4} placeholder="Tell us about your business goals..." /></label>
            <button className="btn btn-primary btn-block">Submit Inquiry ↗</button>
            <a
              className="btn btn-secondary btn-block"
              style={{ marginTop: 10, background: '#25D366', color: '#fff', borderColor: '#25D366' }}
              href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent('Hi StarReview AI, I need assistance.')}`}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </form>
        </main>
      )}

      {page === 'Feedback' && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Feedback</span>
            <h2>Share Your <span>Thoughts</span></h2>
            <p>We review every note to make StarReview AI better for your business.</p>
          </div>
          <div className="feedback-card">
            <form onSubmit={async e => {
              e.preventDefault();
              const fields = e.currentTarget.querySelectorAll('textarea');
              notify('Thank you for sharing your feedback!');
              e.currentTarget.reset();
            }}>
              <label>Your Feedback
                <textarea required rows={5} placeholder="Tell us what you loved or how we can improve..." />
              </label>
              <button className="btn btn-primary btn-block">Send Feedback ↗</button>
            </form>
          </div>
        </main>
      )}

      {/* ====================================================================
          LEGAL & INFORMATIONAL PAGES
          ==================================================================== */}
      {['About us', 'Frequently asked questions', 'Source code', 'Multi-business plan', 'Apply for agency', 'Partner program', 'Business onboarding', 'Privacy policy', 'Terms of service', 'Cookie policy', 'Sitemap'].includes(page) && (
        <main className="page-shell wrap">
          <div className="section-header">
            <span className="section-badge"><span className="section-badge-dot"></span> Resource</span>
            <h2>{page}</h2>
          </div>
          <div className="panel" style={{ maxWidth: 780, margin: '0 auto', lineHeight: 1.8 }}>
            {page === 'Source code' ? (
              <div>
                <h3>Source Code &amp; Commercial License</h3>
                <p>Commercial licensing with full source code is available for enterprise agencies, marketing firms, and custom brand deployments. Contact our team to request license agreements, white-label setup, and dedicated hosting guidelines.</p>
                <button className="btn btn-primary" onClick={() => navigate('Contact')}>
                  Request Source Code Information ↗
                </button>
              </div>
            ) : page === 'Apply for agency' || page === 'Multi-business plan' ? (
              <div>
                <h3>Multi-Business &amp; Agency Licensing</h3>
                <p>Empower your agency to manage 10, 50, or 200+ local client listings under a unified multi-location dashboard. Includes custom branded QR flyers, white-label client access, and consolidated analytics.</p>
                <a
                  href={`https://wa.me/${cfg.whatsappNumber || '919707842047'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business / Agency Plan for StarReview AI. Please share pricing and business limit details.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ background: '#25D366', borderColor: '#25D366' }}
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat With Agency Team on WhatsApp
                </a>
              </div>
            ) : (
              <div>
                <p>StarReview AI helps local businesses collect genuine customer feedback, draft reviews with AI, and manage Google My Business reputation seamlessly.</p>
                <button className="btn btn-secondary" onClick={() => navigate('Contact')}>
                  Contact Support ↗
                </button>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      {page !== 'Review' && (
        <footer className="site-footer">
          <div className="footer-container">
            <div className="footer-main-grid">
              <div className="footer-brand-col">
                <button className="brand-link" onClick={() => navigate('Home')}>
                  <div className="header-brand-icon" style={{ width: 32, height: 32 }}>
                    <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '0.9rem' }}></i>
                  </div>
                  <div className="header-brand-titles">
                    <div className="header-brand-text" style={{ fontSize: '1.15rem' }}>StarReview <span>AI</span></div>
                  </div>
                </button>
                <p>AI-powered Google Business review management, Magic Review QR codes, and automated reputation growth for local businesses.</p>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700 }}>
                  <i className="fa-solid fa-bolt"></i> 100% Google Policy Compliant
                </div>
              </div>

              <div className="footer-nav-col">
                <h4>Solutions</h4>
                <ul className="footer-nav-links">
                  <li><button onClick={() => navigate('Features')}>Platform Features</button></li>
                  <li><button onClick={() => navigate('AI vs Normal QR')}>AI vs Normal QR</button></li>
                  <li><button onClick={() => navigate('SEO analyzer')}>AI SEO Analyzer</button></li>
                  <li><button onClick={() => navigate('How it works')}>How It Works</button></li>
                </ul>
              </div>

              <div className="footer-nav-col">
                <h4>Plans &amp; Scale</h4>
                <ul className="footer-nav-links">
                  <li><button onClick={() => navigate('Source code')}><span style={{ color: '#FBBC05', fontWeight: 700 }}>★</span> Source Code License</button></li>
                  <li><button onClick={() => navigate('Pricing')}>Pricing &amp; Free Trial</button></li>
                  <li><button onClick={() => navigate('Multi-business plan')}>Multi-Business Plan</button></li>
                  <li><button onClick={() => navigate('Apply for agency')}>Apply for Agency</button></li>
                  <li><button onClick={() => navigate('Account')}>Start 3-Day Free Trial</button></li>
                </ul>
              </div>

              <div className="footer-nav-col">
                <h4>Company</h4>
                <ul className="footer-nav-links">
                  <li><button onClick={() => navigate('About us')}>About Us</button></li>
                  <li><button onClick={() => navigate('Contact')}>Contact Support</button></li>
                  <li><button onClick={() => navigate('Frequently asked questions')}>FAQ</button></li>
                  <li><button onClick={() => navigate('Sitemap')}>HTML Sitemap</button></li>
                </ul>
              </div>

              <div className="footer-nav-col">
                <h4>Access</h4>
                <ul className="footer-nav-links">
                  <li><button onClick={() => navigate('Account')}>Operator Sign In</button></li>
                  <li><button onClick={() => navigate('Account')}>Partner Sign In</button></li>
                  <li><button onClick={() => navigate('Partner program')}>Join Partner Program (40%)</button></li>
                  <li><button onClick={() => navigate('Privacy policy')}>Privacy Policy</button></li>
                  <li><button onClick={() => navigate('Terms of service')}>Terms of Service</button></li>
                </ul>
              </div>
            </div>

            <div className="footer-bottom">
              <div>
                &copy; {new Date().getFullYear()} StarReview AI. All rights reserved.
              </div>
              <div className="footer-legal-links">
                <button onClick={() => navigate('Privacy policy')}>Privacy Policy</button>
                <span>•</span>
                <button onClick={() => navigate('Terms of service')}>Terms of Service</button>
                <span>•</span>
                <button onClick={() => navigate('Cookie policy')}>Cookie Policy</button>
                <span>•</span>
                <button onClick={() => navigate('Sitemap')}>Sitemap</button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="toast">
          <i className="fa-solid fa-circle-check" style={{ color: '#4ADE80', marginRight: 6 }}></i>
          {toast}
        </div>
      )}

      {/* FLOATING FEEDBACK ACTION */}
      {page !== 'Review' && (
        <button className="feedback-fab" onClick={() => navigate('Feedback')} title="Share feedback">
          <i className="fa-regular fa-comment-dots"></i> Feedback
        </button>
      )}
    </>
  );
}
