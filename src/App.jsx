import React, { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { ReviewFunnel, BusinessSetup, ReplyAssistant, SeoAnalyzer, Dashboard, QrFlyer } from './tools.jsx';
import BusinessConsole from './BusinessConsole.jsx';
import BusinessOnboarding from './BusinessOnboarding.jsx';
import AboutPage from './AboutPage.jsx';

const features = [
  ['fa-solid fa-wand-magic-sparkles', 'AI review assistant', 'Help customers express their genuine experience with three editable draft suggestions in 24 languages.'],
  ['fa-solid fa-qrcode', 'Smart QR funnels', 'Create a customer review page and a print-ready A6 QR flyer for your counter, table or receipt.'],
  ['fa-solid fa-shield-heart', 'Private feedback', 'Route unhappy customers to a private form so concerns reach your team first.'],
  ['fa-solid fa-chart-line', 'Reputation analytics', 'Track QR scans, drafts, copies, Google redirects and conversion in one dashboard.'],
  ['fa-solid fa-reply-all', 'Reply assistant', 'Draft sentiment-aware replies to your Google reviews. Included in Pro and Starter plans.'],
  ['fa-solid fa-print', 'Print-ready flyers', 'Pick your brand color and download a clean A6 flyer as a high-resolution PNG.'],
  ['fa-solid fa-gauge-high', 'Profile health check', 'Run a 20-point check of your Google Business Profile and get a 0 to 100 score with fixes.'],
  ['fa-solid fa-user-tag', 'Staff and service mentions', 'Customers can mention the staff member and service they used, so drafts feel specific and real.'],
  ['fa-solid fa-chart-simple', 'Competitor comparison', 'Add up to four local competitors and see how your rating and reviews compare.']
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
  { icon: 'fa-solid fa-utensils', name: 'Restaurants & Cafes' },
  { icon: 'fa-solid fa-scissors', name: 'Salons & Spas' },
  { icon: 'fa-solid fa-stethoscope', name: 'Clinics & Healthcare' },
  { icon: 'fa-solid fa-tooth', name: 'Dental Practices' },
  { icon: 'fa-solid fa-bag-shopping', name: 'Retail Stores & Boutiques' },
  { icon: 'fa-solid fa-hotel', name: 'Hotels & Hospitality' },
  { icon: 'fa-solid fa-car-side', name: 'Auto Services & Garages' },
  { icon: 'fa-solid fa-mug-hot', name: 'Coffee Shops & Bakeries' },
  { icon: 'fa-solid fa-dumbbell', name: 'Gyms & Fitness Centers' },
  { icon: 'fa-solid fa-scale-balanced', name: 'Legal & Financial Firms' },
  { icon: 'fa-solid fa-house-chimney-user', name: 'Real Estate & Home Trades' },
  { icon: 'fa-solid fa-paw', name: 'Pet Care & Veterinary' }
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

export const routeMap = {
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
  '/multi-business': 'Multi-business plan',
  '/agency': 'Apply for agency',
  '/business-onboard': 'Business onboarding',
  '/privacy': 'Privacy policy',
  '/terms': 'Terms of service',
  '/cookies': 'Cookie policy',
  '/index.php': 'Dashboard',
  '/console': 'Dashboard',
  '/admin': 'Dashboard'
};

export const slugMap = Object.fromEntries(Object.entries(routeMap).map(([path, name]) => [name, path]));

export default function App() {
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
    const hasStoredUser = (() => {
      try {
        return !!localStorage.getItem('sr_user');
      } catch {
        return false;
      }
    })();
    try {
      const search = new URLSearchParams(window.location.search);
      const route = search.get('route');
      const tab = search.get('tab');
      if (route && (route.includes('register') || route.includes('agency/register'))) {
        return 'Account';
      }
      if (route && (route.startsWith('business') || route.includes('feedback') || route.includes('qr') || route.includes('service') || route.includes('billing') || route.includes('stand'))) {
        return hasStoredUser ? 'Dashboard' : 'Account';
      }
      if (tab) {
        return hasStoredUser ? 'Dashboard' : 'Account';
      }
    } catch {}
    if (p === '/index.php' || p === '/index.html' || p === '/dashboard' || p === '/console' || p === '/admin') {
      return hasStoredUser ? 'Dashboard' : 'Account';
    }
    return routeMap[p] || 'Home';
  };

  const reviewSlug = getReviewSlug() || 'demo';
  const [page, setPage] = useState(pageFromPath);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [rating, setRating] = useState(5);
  const [business, setBusiness] = useState(() => {
    try {
      const stored = localStorage.getItem('sr_user');
      if (stored) {
        const u = JSON.parse(stored);
        return u.company || u.businessName || u.name || 'Team Maruti InfoSoft';
      }
    } catch {}
    return 'Team Maruti InfoSoft';
  });
  const [demoEmail, setDemoEmail] = useState(() => {
    try {
      return localStorage.getItem('sr_email') || JSON.parse(localStorage.getItem('sr_user') || '{}')?.email || 'marutiinfosoftteam@gmail.com';
    } catch {}
    return 'marutiinfosoftteam@gmail.com';
  });
  const [experience, setExperience] = useState('Outstanding service and extremely courteous staff! Everything was handled smoothly and with great attention to detail. Highly recommended!');
  const [staff, setStaff] = useState('');
  const [keywords, setKeywords] = useState('');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Natural');

  const ratingExperiences = {
    5: 'Outstanding service and extremely courteous staff! Everything was handled smoothly and with great attention to detail. Highly recommended!',
    4: 'Very good service and friendly staff. The overall experience was smooth and high quality. Will definitely come back.',
    3: 'Average experience. The staff was polite, but there is room for improvement in service speed and turnaround time.',
    2: 'Below average experience. Faced delays and inconsistent service. Hoping management resolves customer communication issues.',
    1: 'Very disappointing experience. Service was unsatisfactory and did not meet expectations. Needs serious improvement.'
  };

  const handleRatingSelect = (starCount) => {
    setRating(starCount);
    const text = ratingExperiences[starCount] || ratingExperiences[5];
    setExperience(text);
  };
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedDraftIndex, setCopiedDraftIndex] = useState(null);
  const [previewGoogleDraft, setPreviewGoogleDraft] = useState(null);
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
  const [fullName, setFullName] = useState('');
  const [mobileCode, setMobileCode] = useState('+1');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPlanForReg, setSelectedPlanForReg] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sr_user');
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  });
  const [myBusiness, setMyBusiness] = useState(null);

  // Auto-fill company name and Gmail ID if user is logged in or saved in storage
  useEffect(() => {
    let bName = '';
    if (myBusiness?.name) {
      bName = myBusiness.name;
    } else if (user?.company) {
      bName = user.company;
    } else if (user?.businessName) {
      bName = user.businessName;
    } else if (user?.name) {
      bName = user.name;
    }

    let userEmail = user?.email || '';
    if (!userEmail || !bName) {
      try {
        const storedEmail = localStorage.getItem('sr_email');
        if (storedEmail && !userEmail) userEmail = storedEmail;
        const storedUser = localStorage.getItem('sr_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.email && !userEmail) userEmail = parsed.email;
          if (!bName && (parsed?.company || parsed?.businessName || parsed?.name)) {
            bName = parsed.company || parsed.businessName || parsed.name;
          }
        }
      } catch {}
    }

    if (bName) setBusiness(bName);
    if (userEmail) setDemoEmail(userEmail);
  }, [myBusiness, user]);
  const [cfg, setCfg] = useState({ whatsappNumber: '919904482945', languages: ['English', 'Hindi', 'Hinglish', 'Gujarati'] });
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
    if (p === 'Dashboard' && !user) {
      notify('Sign In Required: Please sign in or create an account to access the dashboard.');
      setRegMode(false);
      const nextPath = '/login';
      if (window.location.pathname !== nextPath) {
        window.history.pushState({ page: 'Account' }, '', nextPath);
      }
      setPage('Account');
      setMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
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

  const handleNavClick = (e, p, isRegister = false) => {
    // If middle click (mouse wheel), Ctrl-click, Cmd-click, or Shift-click -> browser naturally opens new tab!
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    navigate(p, isRegister);
  };

  // Carousel states for Home Hero section
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroSlidePaused, setHeroSlidePaused] = useState(false);
  const [heroLangTab, setHeroLangTab] = useState('gu'); // 'gu', 'hi', 'en'

  useEffect(() => {
    if (heroSlidePaused) return;
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % 5);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroSlidePaused]);

  // Ensure browser back button navigates within website without exiting
  useEffect(() => {
    const curPath = window.location.pathname.replace(/\/$/, '') || '/';
    const initPage = pageFromPath();
    if (!window.history.state || !window.history.state.page) {
      window.history.replaceState({ page: initPage }, '', curPath);
    }
  }, []);

  const logout = () => {
    setToken('');
    setUser(null);
    setMyBusiness(null);
    try {
      localStorage.removeItem('sr_user');
      localStorage.removeItem('sr_token');
    } catch {}
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
    const onPopState = (e) => {
      const p = window.location.pathname.replace(/\/$/, '') || '/';
      if (p === '/login' || p === '/signin') {
        setRegMode(false);
        setPage('Account');
      } else if (p === '/register' || p === '/signup') {
        setRegMode(true);
        setPage('Account');
      } else {
        const targetPage = (e.state && e.state.page) ? e.state.page : pageFromPath();
        setPage(targetPage);
      }
      setMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Dashboard & Console require active authentication (user must sign in)
  const isConsoleView = page === 'Dashboard';

  useEffect(() => {
    if (page === 'Dashboard' && !user) {
      setRegMode(false);
      setPage('Account');
      notify('Sign In Required: Please sign in or create an account to access your dashboard.');
      window.history.pushState({ page: 'Account' }, '', '/login');
    }
  }, [page, user]);

  const submitAuth = async (e) => {
    e.preventDefault();
    if (regMode && confirmPassword && password !== confirmPassword) {
      notify('Passwords do not match');
      return;
    }
    const payload = regMode
      ? { email, password, fullName, mobile: `${mobileCode} ${mobileNumber}`, plan: selectedPlanForReg?.name || 'Starter' }
      : { email, password };
    const r = await api('POST', regMode ? '/api/auth/register' : '/api/auth/login', payload);
    if (!r.ok) return notify(r.data.error || 'Authentication failed');
    setToken(r.data.token);
    setUser(r.data.user);
    try {
      localStorage.setItem('sr_email', r.data.user.email);
      localStorage.setItem('sr_user', JSON.stringify(r.data.user));
    } catch {}
    setPassword('');
    setConfirmPassword('');
    notify(regMode ? '🎉 Account created successfully! Welcome to StarReview AI!' : 'Signed in successfully.');
    const bRes = await api('GET', '/api/business');
    let fetchedBiz = null;
    if (bRes.ok && bRes.data && bRes.data.business) {
      setMyBusiness(bRes.data.business);
      fetchedBiz = bRes.data.business;
    }
    if (regMode || !fetchedBiz?.isGoogleVerified) {
      navigate('Business onboarding');
    } else {
      navigate('Dashboard');
    }
  };

  const handleGoogleAuth = async () => {
    try {
      let emailToUse = email.trim();
      let nameToUse = fullName || 'Google Business Owner';
      let idToken = null;

      if (isFirebaseConfigured) {
        notify('Opening Google sign-in...');
        const fbResult = await loginWithGoogle();
        emailToUse = fbResult.user.email || emailToUse;
        nameToUse = fbResult.user.displayName || nameToUse;
        idToken = fbResult.idToken;
      }

      emailToUse = emailToUse || 'google.user@mybusiness.com';
      const r = await api('POST', '/api/auth/firebase-login', {
        email: emailToUse,
        name: nameToUse,
        idToken,
        plan: selectedPlanForReg?.name || 'Starter'
      });

      if (r.ok) {
        setToken(r.data.token);
        setUser(r.data.user);
        try {
          localStorage.setItem('sr_email', emailToUse);
          localStorage.setItem('sr_user', JSON.stringify(r.data.user));
        } catch {}
        const bRes = await api('GET', '/api/business');
        let fetchedBiz = null;
        if (bRes.ok && bRes.data && bRes.data.business) {
          setMyBusiness(bRes.data.business);
          fetchedBiz = bRes.data.business;
        }
        notify(`✓ Signed in as ${emailToUse}. Welcome to StarReview AI!`);
        if (regMode || !fetchedBiz?.isGoogleVerified) {
          navigate('Business onboarding');
        } else {
          navigate('Dashboard');
        }
      } else {
        loginDemoConsole();
      }
    } catch (err) {
      console.warn('[Google Auth Error]:', err.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        notify('Google sign-in was cancelled.');
        return;
      }
      const demoEmail = email.trim() || 'marutiinfosoftteam@gmail.com';
      const demoUser = {
        id: 'user_google_' + Date.now(),
        email: demoEmail,
        name: fullName || 'Google Business Owner',
        role: 'business',
        subscription: { plan: 'Starter', status: 'active', isTrial: false },
        access: true
      };
      setToken(demoUser.id);
      setUser(demoUser);
      try {
        localStorage.setItem('sr_email', demoEmail);
        localStorage.setItem('sr_user', JSON.stringify(demoUser));
      } catch {}
      notify(`✓ Signed in as ${demoEmail}. Welcome to StarReview AI!`);
      if (regMode || !myBusiness?.isGoogleVerified) {
        navigate('Business onboarding');
      } else {
        navigate('Dashboard');
      }
    }
  };

  const loginDemoConsole = async () => {
    const r = await api('POST', '/api/auth/login', { email: 'team@maruti.com', password: 'password123' });
    if (r.ok) {
      setToken(r.data.token);
      setUser(r.data.user);
      try {
        localStorage.setItem('sr_email', r.data.user.email);
        localStorage.setItem('sr_user', JSON.stringify(r.data.user));
      } catch {}
      const bRes = await api('GET', '/api/business');
      if (bRes.ok) setMyBusiness(bRes.data.business);
      notify('Welcome to Business Console');
      navigate('Dashboard');
    }
  };

  // Smart fallback review generator
  const generateLocalDemoDrafts = (biz, exp, stf, kw, lang, stars, reviewTone) => {
    const bizName = biz || 'StarReview Demo Business';
    const staffMention = stf ? `Special thanks to ${stf} for exceptional attention to detail.` : '';
    const kwMention = kw ? `The ${kw} was absolutely top-notch.` : '';
    
    if (stars >= 4) {
      if (lang === 'Hindi') {
        return [
          `${bizName} में हमारा अनुभव बहुत ही शानदार रहा! ${exp ? exp + '। ' : ''}${staffMention ? staffMention + ' ' : ''}${kwMention ? kwMention + ' ' : ''}सेवा और काम की गुणवत्ता उत्कृष्ट थी। हम निश्चित रूप से दोबारा आएंगे!`,
          `अगर आप बेहतरीन सेवा की तलाश में हैं तो ${bizName} सबसे बढ़िया विकल्प है। ${exp ? exp + '। ' : ''}पूरा स्टाफ बहुत ही मिलनसार और पेशेवर है। Highly recommended!`,
          `${bizName} की टीम को 5 स्टार! शुरुआत से अंत तक सब कुछ परफेक्ट था। ${kw ? 'विशेष रूप से ' + kw + ' कमाल का था। ' : ''}बहुत बढ़िया अनुभव!`
        ];
      }
      if (lang === 'Gujarati') {
        return [
          `${bizName} ખાતે અમારો અનુભવ ખૂબ જ ઉત્તમ રહ્યો! ${exp ? exp + '। ' : ''}${staffMention ? staffMention + ' ' : ''}સ્ટાફનો વ્યવહાર અને સર્વિસ ખૂબ જ પ્રશંસનીય છે. ચોક્કસ ફરી મુલાકાત લઈશું!`,
          `${bizName} ની સેવાઓ ખરેખર શ્રેષ્ઠ છે. ${exp ? exp + '। ' : ''}${kwMention ? kwMention + ' ' : ''}બધું જ સમયસર અને સુંદર રીતે થયું. પૂરો વિશ્વાસ રાખી શકો છો!`,
          `અદભૂત અનુભવ! ${bizName} ની ટીમે અપેક્ષા કરતાં પણ વધુ સારો સંતોષ આપ્યો. ${staffMention ? staffMention + ' ' : ''}બધા મિત્રો અને પરિવારને ખૂબ ભલામણ કરું છું.`
        ];
      }
      return [
        `Had a truly wonderful experience at ${bizName}! ${exp ? exp + '. ' : ''}${staffMention ? staffMention + ' ' : ''}${kwMention ? kwMention + ' ' : ''}The team is warm, prompt, and genuinely cares about delivering the best quality. Will definitely be returning!`,
        `I highly recommend ${bizName}. ${exp ? exp + '. ' : ''}From the moment you walk in, the professionalism and attention to detail stand out. ${kwMention ? kwMention + ' ' : ''}Truly a 5-star experience all around.`,
        `Outstanding visit to ${bizName}! ${exp ? exp + '. ' : ''}${staffMention ? staffMention + ' ' : ''}Everything was handled smoothly with complete courtesy. A reliable and trustworthy business that I won't hesitate to recommend to friends and family!`
      ];
    } else {
      return [
        `Visited ${bizName}. ${exp ? exp + '. ' : ''}While some aspects were satisfactory, there is definitely room for improvement in overall service and turnaround time.`,
        `My visit to ${bizName} was average. ${exp ? exp + '. ' : ''}Appreciate the effort, but hoping for better consistency and attention on future visits.`
      ];
    }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const r = await api('POST', '/api/drafts', { business, experience, staff, keywords, language, rating, tone });
      setLoading(false);
      if (r.ok && r.data?.drafts?.length) {
        const cleanDrafts = r.data.drafts.filter(Boolean);
        setDrafts(cleanDrafts);
        setPreviewGoogleDraft(cleanDrafts[0] || null);
        if (r.data.note) notify(r.data.note);
      } else {
        const fallback = generateLocalDemoDrafts(business, experience, staff, keywords, language, rating, tone);
        setDrafts(fallback);
        setPreviewGoogleDraft(fallback[0] || null);
      }
    } catch {
      setLoading(false);
      const fallback = generateLocalDemoDrafts(business, experience, staff, keywords, language, rating, tone);
      setDrafts(fallback);
      setPreviewGoogleDraft(fallback[0] || null);
    }
  };

  const submitAgencyApplication = async (e) => {
    e.preventDefault();
    if (!agencyForm.name || !agencyForm.company || !agencyForm.email || !agencyForm.phone) {
      notify('Please fill in all required fields.');
      return;
    }
    if (!agencyForm.password || agencyForm.password.length < 8) {
      notify('Password must be at least 8 characters long.');
      return;
    }
    if (agencyForm.password !== agencyForm.confirmPassword) {
      notify('Passwords do not match. Please verify.');
      return;
    }

    try {
      const r = await api('POST', '/api/auth/register', {
        name: agencyForm.name,
        company: agencyForm.company,
        email: agencyForm.email,
        phone: agencyForm.phone,
        password: agencyForm.password,
        role: 'agency',
        plan: 'Multi-Business Trial'
      });

      const registeredUser = r.ok && r.data?.user ? r.data.user : {
        name: agencyForm.name,
        email: agencyForm.email,
        company: agencyForm.company,
        phone: agencyForm.phone,
        role: 'agency',
        plan: 'Multi-Business Trial',
        access: true
      };

      setUser(registeredUser);
      localStorage.setItem('sr_user', JSON.stringify(registeredUser));
      setSub({
        plan: 'Multi-Business Standard',
        active: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
      });

      setAgencySubmitted(true);
      notify('Multi-Business account activated! Welcome to the Agency Console.');
    } catch {
      const fallbackUser = {
        name: agencyForm.name,
        email: agencyForm.email,
        company: agencyForm.company,
        phone: agencyForm.phone,
        role: 'agency',
        plan: 'Multi-Business Standard',
        access: true
      };
      setUser(fallbackUser);
      localStorage.setItem('sr_user', JSON.stringify(fallbackUser));
      setAgencySubmitted(true);
      notify('Multi-Business account activated!');
    }
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
      window.open(`https://wa.me/${cfg.whatsappNumber || '919904482945'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business / Agency Plan for StarReview AI. Please share pricing and business limit details.")}`, '_blank');
      return;
    }
    const amount = planName === 'Starter'
      ? (period === 'Yearly' ? 1999 : 199)
      : (period === 'Yearly' ? 2999 : 299);

    setPaymentPlan({ name: planName, period, amount });
    setDemoPlan(planName);
    setDemoPeriod(period);
    setSelectedPlanForReg({ name: planName, period, amount });
    setRazorpayModal(false);

    // Suppress Razorpay modal simulator and navigate directly to 3-Day Free Trial registration page
    setRegMode(true);
    navigate('Account', true);
  };

  const navItems = [
    { label: 'How It Works', page: 'How it works' },
    { label: 'AI vs Normal QR', page: 'AI vs QR' },
    { label: 'Pricing', page: 'Pricing' },
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
        <p>Choose the ideal reputation acceleration plan that matches your business growth. Scale easily with automated AI drafts, smart QR standees, and centralized multi-business tools.</p>
        <div className="pricing-trust-row">
          <span><i className="fa-solid fa-check"></i> Official Google Places Verified</span>
          <span><i className="fa-solid fa-check"></i> Single &amp; Multi-Business Options</span>
          <span><i className="fa-solid fa-check"></i> Upgrade or chat anytime</span>
        </div>
      </div>

      {/* 2. PLAN HIGHLIGHT BOX */}
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
          <div className="pricing-grid-modern animate-marquee">
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
                href={`https://wa.me/${cfg.whatsappNumber || '919904482945'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business Plan for StarReview AI.")}`}
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
                href={`https://wa.me/${cfg.whatsappNumber || '919904482945'}?text=${encodeURIComponent("Hi! I'm interested in the Multi-Business Plan for StarReview AI.")}`}
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
          </section>
  );

  return (
    <>
      {/* Background Animated Ambient Mesh (Screenshot 4 Style) */}
      <div className="rf-global-ambient-glow" aria-hidden="true">
        <div className="rf-ambient-blob rf-blob-1"></div>
        <div className="rf-ambient-blob rf-blob-2"></div>
        <div className="rf-ambient-blob rf-blob-3"></div>
      </div>

      {page !== 'Review' && !isConsoleView && page !== 'Account' && (
        <header className="rf-top-header">
          <div className="rf-top-header-inner">
            <a href="/" className="rf-nav-brand" onClick={(e) => handleNavClick(e, 'Home')} title="StarReview AI">
              <div className="rf-nav-brand-icon">
                <i className="fa-solid fa-star"></i>
              </div>
              <div className="rf-nav-brand-info">
                <span className="rf-nav-brand-title">StarReview <span>AI</span></span>
                <span className="rf-nav-brand-sub">Helping customers share better reviews</span>
              </div>
            </a>

            <button className="menu-toggle rf-menu-toggle" onClick={() => setMenu(!menu)} aria-label="Toggle menu">
              {menu ? '✕' : '☰'}
            </button>

            <nav className={menu ? 'rf-nav-links open' : 'rf-nav-links'}>
              {navItems.map(item => (
                <a
                  key={item.page}
                  href={slugMap[item.page] || '/'}
                  className={`rf-nav-link ${page === item.page ? 'active' : ''}`}
                  onClick={(e) => { handleNavClick(e, item.page); setMenu(false); }}
                >
                  {item.label}
                </a>
              ))}

              <div className="rf-mobile-drawer-actions">
                {!user ? (
                  <>
                    <a
                      href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20inquire%20about%20your%20plans."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rf-btn-whatsapp-nav full"
                      style={{ textDecoration: 'none', textAlign: 'center', justifyContent: 'center' }}
                    >
                      <i className="fa-brands fa-whatsapp"></i> WhatsApp Inquiry
                    </a>
                    <a
                      href="/login"
                      className="rf-btn-startfree full"
                      onClick={(e) => { setRegMode(false); handleNavClick(e, 'Account', false); setMenu(false); }}
                    >
                      Sign In <span className="rf-nav-arrow">→</span>
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="/dashboard"
                      className="rf-btn-startfree full"
                      onClick={(e) => { handleNavClick(e, 'Dashboard'); setMenu(false); }}
                    >
                      Dashboard →
                    </a>
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

            {menu && (
              <div
                className="rf-mobile-backdrop"
                onClick={() => setMenu(false)}
                aria-hidden="true"
              />
            )}

            <div className="rf-nav-actions">
              {!user ? (
                <>
                  <a
                    href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20inquire%20about%20your%20plans."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rf-nav-whatsapp-btn"
                    title="WhatsApp Inquiry"
                  >
                    <i className="fa-brands fa-whatsapp"></i> WhatsApp Inquiry
                  </a>
                  <a
                    href="/login"
                    className="rf-btn-signin"
                    onClick={(e) => {
                      setRegMode(false);
                      handleNavClick(e, 'Account', false);
                    }}
                    title="Sign In to Dashboard"
                  >
                    Sign In <span className="rf-nav-arrow">→</span>
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/dashboard"
                    className="rf-btn-startfree"
                    style={{ padding: '7px 14px' }}
                    onClick={(e) => handleNavClick(e, 'Dashboard')}
                    title="Open Business Dashboard"
                  >
                    <span className="rf-online-dot"></span> Dashboard
                  </a>
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
          {/* Animated Background Review Mockups & Floating Ambient Layer (Homepage Enhancement) */}
          <div className="rf-home-animated-bg-layer" aria-hidden="true">
            <div className="rf-bg-glow-orb rf-bg-orb-1"></div>
            <div className="rf-bg-glow-orb rf-bg-orb-2"></div>
            <div className="rf-bg-glow-orb rf-bg-orb-3"></div>

            {/* Floating Review Card Mockup 1 (Top Left) */}
            <div className="rf-floating-card rf-float-1">
              <div className="rf-float-top">
                <span className="rf-float-avatar" style={{ background: '#e0f2fe', color: '#0369a1' }}>RK</span>
                <div>
                  <div className="rf-float-author">Rahul K. <span className="rf-float-badge">Verified Visit</span></div>
                  <div className="rf-float-stars">★★★★★ <span className="rf-float-score">5.0</span></div>
                </div>
                <i className="fa-brands fa-google rf-float-google-icon"></i>
              </div>
              <p className="rf-float-text">"Google rating jumped from 4.2 to 4.9 in just 18 days! The smart QR standees make reviewing effortless."</p>
              <div className="rf-float-tag">⚡ Autopilot Google Review Flow</div>
            </div>

            {/* Floating Acrylic QR Standee Mockup (Top Right Behind Carousel) */}
            <div className="rf-floating-standee rf-float-2">
              <div className="rf-standee-acrylic">
                <div className="rf-standee-header">
                  <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i>
                  <span>Review Us On Google</span>
                </div>
                <div className="rf-standee-qr-frame">
                  <i className="fa-solid fa-qrcode rf-standee-qr-icon"></i>
                </div>
                <div className="rf-standee-footer">
                  <span>★★★★★ Tap or Scan</span>
                </div>
              </div>
            </div>

            {/* Floating Negative Review Shield Badge (Middle Left) */}
            <div className="rf-floating-badge rf-float-3">
              <div className="rf-float-shield-icon">
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <div className="rf-float-shield-title">100% Private Shield</div>
                <div className="rf-float-shield-sub">1-3 Star Feedback Handled Privately</div>
              </div>
            </div>

            {/* Floating AI Autopilot Reply Notification (Bottom Right) */}
            <div className="rf-floating-card rf-float-4">
              <div className="rf-float-top">
                <span className="rf-float-avatar" style={{ background: '#dcfce7', color: '#15803d' }}>AI</span>
                <div>
                  <div className="rf-float-author">Google Maps Auto-Reply <span className="rf-float-badge" style={{ background: '#dcfce7', color: '#166534' }}>Live</span></div>
                  <div className="rf-float-stars" style={{ color: '#16a34a' }}>⚡ Response time: 14s</div>
                </div>
              </div>
              <p className="rf-float-text">"Thank you for visiting! We're thrilled you loved our service in Surat. See you again soon!"</p>
            </div>
          </div>
          <main>
            {/* 1. ORIGINAL HERO SECTION */}
            <section className="hero wrap">
              <div className="hero-copy">
                <div className="eyebrow"><span className="pulse"></span> SMARTER CUSTOMER FEEDBACK</div>
                <h1>Turn great service into <em>great reviews.</em></h1>
                <p className="hero-sub">A simpler way to collect genuine customer feedback, create review drafts with AI, and understand what your customers love.</p>
                <div className="hero-cta">
                  <a
                    href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20inquire%20about%20your%20plans%20and%20pricing."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp-hero"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-brands fa-whatsapp" style={{ fontSize: 18, marginRight: 6 }}></i>
                    <span>Inquire on WhatsApp</span>
                  </a>
                  <a
                    href="/how-it-works"
                    className="btn btn-light"
                    onClick={(e) => handleNavClick(e, 'How it works')}
                  >
                    Explore how it works <span>▶</span>
                  </a>
                </div>
                <div className="hero-note">
                  <span><i className="fa-solid fa-check" style={{ color: '#16a34a', marginRight: 5 }}></i>Instant 60-Second Setup</span>
                  <span><i className="fa-solid fa-check" style={{ color: '#16a34a', marginRight: 5 }}></i>100% Private Negative Shield</span>
                  <span><i className="fa-solid fa-check" style={{ color: '#16a34a', marginRight: 5 }}></i>Your customers stay in control</span>
                </div>
              </div>

              {/* ROTATING FEATURE SHOWCASE CAROUSEL (SCREENSHOT 4 ENHANCEMENT) */}
              <div
                className="hero-art rf-hero-carousel-container"
                onMouseEnter={() => setHeroSlidePaused(true)}
                onMouseLeave={() => setHeroSlidePaused(false)}
              >
                <div className="art-glow"></div>

                {/* Left/Right Arrow Controls */}
                <button
                  type="button"
                  className="rf-carousel-nav-btn rf-carousel-prev"
                  onClick={() => setHeroSlide(prev => (prev - 1 + 5) % 5)}
                  aria-label="Previous slide"
                  title="Previous slide"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="rf-carousel-nav-btn rf-carousel-next"
                  onClick={() => setHeroSlide(prev => (prev + 1) % 5)}
                  aria-label="Next slide"
                  title="Next slide"
                >
                  ›
                </button>

                <div className="rf-carousel-viewport">
                  {/* SLIDE 0: 5-STAR REVIEW & AI RESPONSE DRAFT */}
                  <div className={`rf-carousel-slide ${heroSlide === 0 ? 'active' : ''}`}>
                    <div className="rf-carousel-badge-top">✦ AI-Powered Review Drafts</div>
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
                      <button className="copy-demo" onClick={() => copy('Thank you for your kind words! We’re so glad you had a great experience and look forward to welcoming you again.')}>Copy response</button>
                    </div>
                    <div className="rf-carousel-badge-bottom"><span className="green-check">✓</span> Feedback made simple</div>
                  </div>

                  {/* SLIDE 1: PRINT-READY SMART QR FLYER & STANDEE */}
                  <div className={`rf-carousel-slide ${heroSlide === 1 ? 'active' : ''}`}>
                    <div className="rf-carousel-badge-top">📱 Instant Camera Scan</div>
                    <div className="rf-slide-card rf-slide-standee">
                      <div className="rf-standee-header">
                        <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                        <span>Official Google Review Standee</span>
                      </div>
                      <div className="rf-standee-qr-frame">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <rect x="5" y="5" width="28" height="28" fill="#166534" rx="4"/>
                          <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="2"/>
                          <rect x="13" y="13" width="12" height="12" fill="#166534" rx="2"/>
                          <rect x="67" y="5" width="28" height="28" fill="#166534" rx="4"/>
                          <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="2"/>
                          <rect x="75" y="13" width="12" height="12" fill="#166534" rx="2"/>
                          <rect x="5" y="67" width="28" height="28" fill="#166534" rx="4"/>
                          <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="2"/>
                          <rect x="13" y="75" width="12" height="12" fill="#166534" rx="2"/>
                          <rect x="38" y="12" width="6" height="6" fill="#166534"/>
                          <rect x="48" y="8" width="8" height="8" fill="#166534"/>
                          <rect x="40" y="24" width="8" height="6" fill="#166534"/>
                          <rect x="12" y="42" width="8" height="8" fill="#166534"/>
                          <rect x="25" y="45" width="8" height="8" fill="#166534"/>
                          <rect x="68" y="42" width="8" height="6" fill="#166534"/>
                          <rect x="80" y="46" width="8" height="8" fill="#166534"/>
                          <rect x="42" y="42" width="16" height="16" fill="#16a34a" rx="4"/>
                          <text x="50" y="54" fontSize="11" fill="#ffffff" textAnchor="middle" fontWeight="bold">★</text>
                          <rect x="40" y="68" width="6" height="12" fill="#166534"/>
                          <rect x="52" y="72" width="10" height="8" fill="#166534"/>
                          <rect x="68" y="68" width="8" height="8" fill="#166534"/>
                          <rect x="80" y="75" width="8" height="12" fill="#166534"/>
                        </svg>
                      </div>
                      <h4 className="rf-standee-title">Review Us in 15 Seconds</h4>
                      <p className="rf-standee-sub">Scan camera → tap 5 stars → AI writes tailored review without typing!</p>
                      <div className="rf-standee-pills">
                        <span className="rf-standee-pill"><i className="fa-solid fa-file-pdf"></i> Print-Ready A6</span>
                        <span className="rf-standee-pill"><i className="fa-solid fa-bolt"></i> No App Required</span>
                        <span className="rf-standee-pill"><i className="fa-solid fa-store"></i> Acrylic Standee</span>
                      </div>
                    </div>
                    <div className="rf-carousel-badge-bottom">✓ Acrylic Counter Standees</div>
                  </div>

                  {/* SLIDE 2: MULTI-LOCATION LIVE ANALYTICS CONSOLE */}
                  <div className={`rf-carousel-slide ${heroSlide === 2 ? 'active' : ''}`}>
                    <div className="rf-carousel-badge-top">📊 Live Google Maps Sync</div>
                    <div className="rf-slide-card rf-slide-analytics">
                      <div className="rf-analytics-head">
                        <h4>Multi-Location Analytics</h4>
                        <span className="rf-analytics-live-tag"><span className="pulse"></span> LIVE SYNC</span>
                      </div>
                      <div className="rf-analytics-grid">
                        <div className="rf-stat-card">
                          <div className="rf-stat-val">1,480</div>
                          <div className="rf-stat-lbl">Reviews</div>
                          <div className="rf-stat-growth">▲ +284%</div>
                        </div>
                        <div className="rf-stat-card">
                          <div className="rf-stat-val">4.9 ★</div>
                          <div className="rf-stat-lbl">Rating</div>
                          <div className="rf-stat-growth">Top 1%</div>
                        </div>
                        <div className="rf-stat-card">
                          <div className="rf-stat-val">98.4%</div>
                          <div className="rf-stat-lbl">CSAT</div>
                          <div className="rf-stat-growth">Verified</div>
                        </div>
                      </div>
                      <div className="rf-analytics-bars">
                        <div className="rf-bar-row">
                          <span style={{ width: 44, fontWeight: 700, color: '#15803d' }}>5 Star</span>
                          <div className="rf-bar-track"><div className="rf-bar-fill" style={{ width: '92%', background: '#16a34a' }}></div></div>
                          <span style={{ width: 34, textAlign: 'right', fontWeight: 700 }}>92%</span>
                        </div>
                        <div className="rf-bar-row">
                          <span style={{ width: 44, fontWeight: 600, color: '#475569' }}>4 Star</span>
                          <div className="rf-bar-track"><div className="rf-bar-fill" style={{ width: '6%', background: '#86efac' }}></div></div>
                          <span style={{ width: 34, textAlign: 'right', fontWeight: 600 }}>6%</span>
                        </div>
                        <div className="rf-bar-row">
                          <span style={{ width: 44, fontWeight: 600, color: '#c2410c' }}>1-3 Star</span>
                          <div className="rf-bar-track"><div className="rf-bar-fill" style={{ width: '2%', background: '#fed7aa' }}></div></div>
                          <span style={{ width: 34, textAlign: 'right', fontWeight: 600, color: '#ea580c' }}>0%*</span>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 10, textAlign: 'center' }}>
                        *Negative feedback routed privately — 0 public 1-stars!
                      </div>
                    </div>
                    <div className="rf-carousel-badge-bottom">✓ Multi-Location Performance</div>
                  </div>

                  {/* SLIDE 3: 100% PRIVATE NEGATIVE FEEDBACK SHIELD */}
                  <div className={`rf-carousel-slide ${heroSlide === 3 ? 'active' : ''}`}>
                    <div className="rf-carousel-badge-top">🛡️ Zero Public 1-Star Damage</div>
                    <div className="rf-slide-card rf-slide-shield">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>Negative Feedback Filter</span>
                        <span style={{ color: '#ea580c', fontSize: 14 }}>★★☆☆☆</span>
                      </div>
                      <div className="rf-shield-banner">
                        <div className="rf-shield-banner-title">
                          <i className="fa-solid fa-shield-halved"></i> 100% Private Shield Triggered
                        </div>
                        <p className="rf-shield-banner-desc">
                          1 & 2-star reviews are instantly intercepted away from public Google Maps into private owner WhatsApp & dashboard!
                        </p>
                      </div>
                      <div className="rf-shield-steps">
                        <div className="rf-shield-step-item">
                          <div className="rf-shield-step-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✓</div>
                          <span>Google Maps public 5-star rating 100% protected</span>
                        </div>
                        <div className="rf-shield-step-item">
                          <div className="rf-shield-step-icon" style={{ background: '#ffedd5', color: '#c2410c' }}>🔔</div>
                          <span>Owner alerted instantly via private WhatsApp</span>
                        </div>
                        <div className="rf-shield-step-item">
                          <div className="rf-shield-step-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>🤝</div>
                          <span>Issue solved directly with customer in 10 minutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="rf-carousel-badge-bottom">✓ Turn Angry Customers into Fans</div>
                  </div>

                  {/* SLIDE 4: MULTI-LANGUAGE DRAFTS GENERATOR */}
                  <div className={`rf-carousel-slide ${heroSlide === 4 ? 'active' : ''}`}>
                    <div className="rf-carousel-badge-top">🌐 24+ Languages Supported</div>
                    <div className="rf-slide-card rf-slide-lang">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Instant AI Review in Any Language</h4>
                        <span style={{ fontSize: 10, background: '#f0fdf4', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: 999 }}>AUTO-DETECT</span>
                      </div>
                      <div className="rf-lang-selector-row">
                        <button type="button" className={`rf-lang-btn ${heroLangTab === 'gu' ? 'active' : ''}`} onClick={() => setHeroLangTab('gu')}>ગુજરાતી</button>
                        <button type="button" className={`rf-lang-btn ${heroLangTab === 'hi' ? 'active' : ''}`} onClick={() => setHeroLangTab('hi')}>हिंदी</button>
                        <button type="button" className={`rf-lang-btn ${heroLangTab === 'en' ? 'active' : ''}`} onClick={() => setHeroLangTab('en')}>English</button>
                      </div>
                      <div className="rf-lang-quote-box">
                        <p className="rf-lang-quote-text">
                          {heroLangTab === 'gu' && '“ખૂબ જ ઉત્કૃષ્ટ સર્વિસ અને સ્ટાફ ખૂબ સહાયક હતો! બધું જ સમયસર પત્યું અને વાતાવરણ ખૂબ સરસ હતું.”'}
                          {heroLangTab === 'hi' && '“शानदार अनुभव और बहुत ही बढ़िया सर्विस! स्टाफ का व्यवहार बहुत विनम्र और मददगार था।”'}
                          {heroLangTab === 'en' && '“Outstanding customer service and extremely courteous staff! Everything was handled smoothly.”'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b' }}>
                        <span><i className="fa-solid fa-check" style={{ color: '#16a34a' }}></i> 1-Tap Copy & Post</span>
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>5.0 ★ Google Ready</span>
                      </div>
                    </div>
                    <div className="rf-carousel-badge-bottom">✓ Solves Writer's Block Instantly</div>
                  </div>
                </div>

                {/* Dot Indicators */}
                <div className="rf-carousel-indicators">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <button
                      key={idx}
                      type="button"
                      className={`rf-carousel-dot ${heroSlide === idx ? 'active' : ''}`}
                      onClick={() => setHeroSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      title={`Slide ${idx + 1} of 5`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 2. FULL-WIDTH EDGE-TO-EDGE CONTINUOUS TICKER / SLIDER (SCREENSHOT 5 FIX) */}
            <section className="rf-full-marquee-section">
              <div className="rf-marquee-header-pill">
                <span className="rf-tag-pulse"></span>
                <span>BUILT FOR EVERYDAY LOCAL BUSINESSES</span>
              </div>
              <div className="rf-full-marquee-viewport">
                <div className="rf-full-marquee-track">
                  {[
                    { icon: 'fa-utensils', label: 'Restaurants & Cafes' },
                    { icon: 'fa-spa', label: 'Wellness, Salons & Beauty' },
                    { icon: 'fa-hospital-user', label: 'Healthcare & Clinics' },
                    { icon: 'fa-tooth', label: 'Dental Practices' },
                    { icon: 'fa-bag-shopping', label: 'Retail & Boutiques' },
                    { icon: 'fa-dumbbell', label: 'Gyms & Fitness Centers' },
                    { icon: 'fa-wrench', label: 'Auto Care & Mechanics' },
                    { icon: 'fa-mug-hot', label: 'Specialty Coffee & Bakeries' },
                    { icon: 'fa-hotel', label: 'Hotels & Hospitality' },
                    { icon: 'fa-scale-balanced', label: 'Legal & Professional Services' },
                    { icon: 'fa-house-circle-check', label: 'Real Estate & Home Trades' },
                    { icon: 'fa-paw', label: 'Pet Care & Veterinary' },
                    // Seamless duplicate list for infinite edge-to-edge glide
                    { icon: 'fa-utensils', label: 'Restaurants & Cafes' },
                    { icon: 'fa-spa', label: 'Wellness, Salons & Beauty' },
                    { icon: 'fa-hospital-user', label: 'Healthcare & Clinics' },
                    { icon: 'fa-tooth', label: 'Dental Practices' },
                    { icon: 'fa-bag-shopping', label: 'Retail & Boutiques' },
                    { icon: 'fa-dumbbell', label: 'Gyms & Fitness Centers' },
                    { icon: 'fa-wrench', label: 'Auto Care & Mechanics' },
                    { icon: 'fa-mug-hot', label: 'Specialty Coffee & Bakeries' },
                    { icon: 'fa-hotel', label: 'Hotels & Hospitality' },
                    { icon: 'fa-scale-balanced', label: 'Legal & Professional Services' },
                    { icon: 'fa-house-circle-check', label: 'Real Estate & Home Trades' },
                    { icon: 'fa-paw', label: 'Pet Care & Veterinary' }
                  ].map((item, idx) => (
                    <div className="rf-full-marquee-pill" key={idx}>
                      <i className={`fa-solid ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
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
                    <div className="feature-icon"><i className={f[0]}></i></div>
                    <h3>{f[1]}</h3>
                    <p>{f[2]}</p>
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
                  <a href="/try-demo" className="btn btn-dark" onClick={(e) => handleNavClick(e, 'Try the demo')}>Try review assistant →</a>
                </div>
                <div className="mini-dashboard">
                  <div className="mini-top">
                    <span className="mini-logo">✦</span>
                    <div><b>Review assistant</b><small>Interactive demo</small></div>
                    <span className="live-tag">DEMO</span>
                  </div>
                  <div className="mini-question">How was your experience?</div>
                  <div className="mini-customer-preview">
                    <div className="mini-avatar">PJ</div>
                    <div className="mini-meta">
                      <div className="mini-name">Priya Joshi <span className="mini-verified-badge"><i className="fa-solid fa-circle-check"></i> Verified</span></div>
                      <div className="mini-stars">★★★★★ <span className="mini-rating-num">5.0</span></div>
                    </div>
                  </div>
                  <div className="mini-review-text">
                    "Such a wonderful experience! The team was super attentive, welcoming, and everything felt fast and effortless."
                  </div>
                  <div className="mini-quick-chips">
                    <span className="mini-chip"><i className="fa-solid fa-check"></i> Friendly staff</span>
                    <span className="mini-chip"><i className="fa-solid fa-check"></i> Clean space</span>
                    <span className="mini-chip"><i className="fa-solid fa-check"></i> Fast service</span>
                  </div>
                  <div className="mini-suggestion">
                    <span>✦</span>
                    <div><b>Ready to draft</b><small>Personalized 5-star Google review generated</small></div>
                    <span>→</span>
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
                  <div className="sr-reply-cta-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
                    <a
                      href="/register"
                      className="sr-showcase-btn-primary"
                      onClick={(e) => handleNavClick(e, 'Account', true)}
                    >
                      <span>Activate Autopilot Replies</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </a>
                    <a
                      href="/reply-assistant"
                      className="sr-showcase-btn-secondary"
                      onClick={(e) => handleNavClick(e, 'Reply assistant')}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      <span>Try Reply Assistant</span>
                    </a>
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
                      <a href="/how-it-works" className="btn btn-dark btn-sm" onClick={(e) => handleNavClick(e, 'How it works')}>Explore full roadmap &amp; comparison →</a>
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
              <div className="wrap">
                <div className="sr-stats-ranking-grid">
                  <div className="sr-rank-card">
                    <div className="sr-rank-badge">
                      <span className="sr-rank-pulse"></span>
                      <span>#1 SPEED</span>
                    </div>
                    <div className="sr-stat-val">60s</div>
                    <div className="sr-stat-lbl">Instant Setup Time</div>
                    <div className="sr-stat-sub">Live automated Google Places setup in 1 min</div>
                  </div>

                  <div className="sr-rank-card">
                    <div className="sr-rank-badge">
                      <span className="sr-rank-pulse"></span>
                      <span>GRADE A+</span>
                    </div>
                    <div className="sr-stat-val">100%</div>
                    <div className="sr-stat-lbl">Private Negative Filter</div>
                    <div className="sr-stat-sub">Unhappy feedback routed to private resolution inbox</div>
                  </div>

                  <div className="sr-rank-card">
                    <div className="sr-rank-badge">
                      <span className="sr-rank-pulse"></span>
                      <span>GLOBAL</span>
                    </div>
                    <div className="sr-stat-val">24+</div>
                    <div className="sr-stat-lbl">AI Draft Languages</div>
                    <div className="sr-stat-sub">Natural customer voice in English, Hindi, Gujarati</div>
                  </div>

                  <div className="sr-rank-card highlight">
                    <div className="sr-rank-badge official">
                      <i className="fa-solid fa-circle-check"></i>
                      <span>CERTIFIED</span>
                    </div>
                    <div className="sr-stat-val">Official</div>
                    <div className="sr-stat-lbl">Google Places API</div>
                    <div className="sr-stat-sub">100% compliant direct Google Maps review flow</div>
                  </div>
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
                  ['Can I test or see a live demo?', 'Yes! You can explore our interactive QR demo or reach out on WhatsApp for a personalized walk-through.']
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
                  <p>Inquire with our team on WhatsApp and set up your review page in minutes.</p>
                </div>
                <a
                  href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20inquire%20about%20StarReview%20AI."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp-hero"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
                </a>
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
                <div className="feature-icon"><i className={f[0]}></i></div>
                <h3>{f[1]}</h3>
                <p>{f[2]}</p>
                <button className="learn-link" onClick={() => navigate(toolTarget[f[1]] || 'Dashboard')}>Open tool <i className="fa-solid fa-arrow-right" style={{ fontSize: 11, marginLeft: 4 }}></i></button>
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
            <div className="rf-pill-badge" style={{ margin: '0 auto 18px', width: 'fit-content' }}>
              <i className="fa-solid fa-wand-magic-sparkles"></i>
              <span>THE GOOGLE MAGIC REVIEW QR EXPERIENCE</span>
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
              <div className="rf-pill-badge" style={{ margin: '0 auto 14px', width: 'fit-content' }}>
                <span>THE 3-STEP FLOW</span>
              </div>
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
              <div className="rf-pill-badge" style={{ margin: '0 auto 14px', width: 'fit-content' }}>
                <span>HEAD TO HEAD COMPARISON</span>
              </div>
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
                <div className="rf-pill-badge" style={{ marginBottom: 12 }}>
                  <span>READY TO GROW?</span>
                </div>
                <h2>Ready to turn visits into<br /><em>5-star Google reviews?</em></h2>
                <p>Join businesses boosting review conversion with smart QR and AI assistance.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a
                    href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20inquire%20about%20StarReview%20AI."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rf-btn-whatsapp-nav"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
                  </a>
                <a href="/try-demo" className="rf-btn-signin" onClick={(e) => handleNavClick(e, 'Try the demo')}>Try live demo →</a>
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
                <div className="rf-pill-badge" style={{ marginBottom: 16 }}>
                  <i className="fa-solid fa-code-compare"></i>
                  <span>GOOGLE MAGIC REVIEW QR VS NORMAL QR</span>
                </div>
                <h1>Standard QR Codes Only Redirect.<br /><span>StarReview AI Helps Customers Write 5-Star Reviews.</span></h1>
                <p>
                  Compare a standard, static <strong>Google Business Review QR</strong> with the <strong>Google Magic Review QR</strong> powered by <strong>StarReview AI</strong>. Discover how an <strong>AI-Powered Review QR</strong> guides customers, personalizes authentic review drafts, supports 24+ languages, and boosts your <strong>Google My Business Review QR</strong> conversion rate by 300%.
                </p>
                <div className="vs-hero-actions">
                  <a
                    href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20inquire%20about%20Google%20Magic%20Review%20QR."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rf-btn-whatsapp-nav"
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
                  </a>
                  <button className="rf-btn-signin" onClick={() => {
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
            <div className="rf-pill-badge" style={{ margin: '0 auto 14px', width: 'fit-content' }}>
              <span>SIDE-BY-SIDE COMPARISON</span>
            </div>
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
              <div className="rf-pill-badge" style={{ margin: '0 auto 14px', width: 'fit-content' }}>
                <span>FEATURE BREAKDOWN</span>
              </div>
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
            <a
              href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20would%20like%20to%20upgrade%20to%20Google%20Magic%20Review%20QR."
              target="_blank"
              rel="noopener noreferrer"
              className="rf-btn-whatsapp-nav"
              style={{ textDecoration: 'none', margin: '0 auto', display: 'inline-flex' }}
            >
              <i className="fa-brands fa-whatsapp"></i> Inquire on WhatsApp
            </a>
          </section>
        </main>
      )}

      {/* ====================================================================
          APPLY FOR AGENCY / MULTI-BUSINESS PORTAL (MATCHING REVIEWFLOW AI EXACTLY)
          ==================================================================== */}
      {page === 'Apply for agency' && (
        <main className="rf-agency-page-wrapper">
          <div className="rf-agency-container wrap">
            <div className="rf-agency-layout-grid">
              {/* LEFT: VALUE PROPOSITION */}
              <div className="rf-agency-info-col">
                <div className="rf-agency-header-badge">
                  <i className="fa-solid fa-briefcase"></i>
                  <span>MULTI-BUSINESS &amp; AGENCY PORTAL</span>
                </div>
                <h1>Scale Google Reviews for <span>All Your Locations</span></h1>
                <p className="rf-agency-lead-desc">
                  Designed for marketing agencies, multi-location franchises, and brand managers seeking a centralized Google review acceleration system.
                </p>

                <div className="rf-agency-cards-list">
                  <div className="rf-agency-perk-card">
                    <div className="rf-agency-icon-box">
                      <i className="fa-solid fa-layer-group"></i>
                    </div>
                    <div className="rf-agency-perk-details">
                      <h4>Centralized Multi-Location Console</h4>
                      <p>Manage dozens of client or branch listings from a single intuitive agency dashboard.</p>
                    </div>
                  </div>

                  <div className="rf-agency-perk-card">
                    <div className="rf-agency-icon-box">
                      <i className="fa-solid fa-qrcode"></i>
                    </div>
                    <div className="rf-agency-perk-details">
                      <h4>Dedicated QR Flyers &amp; Standees</h4>
                      <p>Generate isolated QR standees, tracking links, and custom AI prompt rules for each location.</p>
                    </div>
                  </div>

                  <div className="rf-agency-perk-card">
                    <div className="rf-agency-icon-box">
                      <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    <div className="rf-agency-perk-details">
                      <h4>Cross-Location Analytics</h4>
                      <p>Monitor scans, drafted reviews, conversion rates, and negative feedback across all accounts.</p>
                    </div>
                  </div>

                  <div className="rf-agency-perk-card">
                    <div className="rf-agency-icon-box">
                      <i className="fa-solid fa-key"></i>
                    </div>
                    <div className="rf-agency-perk-details">
                      <h4>Bring Your Own AI API (Gemini, OpenAI, or Claude)</h4>
                      <p>For Multi-Business plans, review generation requires your own AI API key (choose any one: Google Gemini, OpenAI, or Claude). We do not provide AI API keys for Multi-Business plans or panels.</p>
                    </div>
                  </div>

                  <div className="rf-agency-perk-card">
                    <div className="rf-agency-icon-box">
                      <i className="fa-brands fa-whatsapp"></i>
                    </div>
                    <div className="rf-agency-perk-details">
                      <h4>VIP Dedicated Onboarding Support</h4>
                      <p>Direct WhatsApp &amp; priority concierge setup for rapid assistance and capacity scaling.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: REGISTRATION / APPLICATION CARD (SCREENSHOT 1 MATCH) */}
              <div className="rf-agency-form-card">
                <h2>Access Multi-Business Portal</h2>
                <p className="rf-agency-card-sub">
                  Create your account to instantly access the Multi-Business Console and Agency features.
                </p>

                {/* Callout Notice Box */}
                <div className="rf-agency-notice-callout">
                  <div className="rf-notice-point">
                    <i className="fa-solid fa-bolt" style={{ color: '#16a34a' }}></i>
                    <p>
                      <strong>Instant Automated Approval:</strong> Accounts are approved immediately upon registration. Enjoy full access with centralized business management.
                    </p>
                  </div>
                  <div className="rf-notice-point" style={{ marginTop: 10 }}>
                    <i className="fa-solid fa-key" style={{ color: '#15803d' }}></i>
                    <p>
                      <strong>Important:</strong> Multi-Business plans require you to use your own AI API key for review generation (any one: <strong>Google Gemini, OpenAI, or Claude</strong>). We do not provide AI API keys for Multi-Business plans or panels.
                    </p>
                  </div>
                </div>

                {agencySubmitted ? (
                  <div className="rf-agency-success-state">
                    <div className="rf-agency-success-icon">✓</div>
                    <h3>Multi-Business 48-Hour Trial Active!</h3>
                    <p>
                      Welcome, <strong>{agencyForm.name}</strong>! Your account for <strong>{agencyForm.company}</strong> is approved and ready.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                      <button
                        type="button"
                        className="btn btn-dark full"
                        onClick={() => navigate('Dashboard')}
                      >
                        Launch Agency Dashboard →
                      </button>
                      <a
                        href="https://wa.me/919904482945?text=Hello%20StarReview%20AI%2C%20I%20have%20activated%20my%20Multi-Business%20Agency%20Trial."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-light full"
                        style={{ textDecoration: 'none', textAlign: 'center', justifyContent: 'center', color: '#16a34a', borderColor: '#86efac' }}
                      >
                        <i className="fa-brands fa-whatsapp"></i> Chat with VIP Concierge
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitAgencyApplication}>
                    <div className="rf-form-row-2col">
                      <div className="rf-login-form-group">
                        <label className="rf-agency-form-label">YOUR NAME *</label>
                        <input
                          className="rf-agency-input"
                          type="text"
                          required
                          placeholder="Jane Doe"
                          value={agencyForm.name}
                          onChange={e => setAgencyForm({ ...agencyForm, name: e.target.value })}
                        />
                      </div>
                      <div className="rf-login-form-group">
                        <label className="rf-agency-form-label">AGENCY / BUSINESS NAME *</label>
                        <input
                          className="rf-agency-input"
                          type="text"
                          required
                          placeholder="Acme Media Group"
                          value={agencyForm.company}
                          onChange={e => setAgencyForm({ ...agencyForm, company: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="rf-form-row-2col">
                      <div className="rf-login-form-group">
                        <label className="rf-agency-form-label">WORK EMAIL *</label>
                        <input
                          className="rf-agency-input"
                          type="email"
                          required
                          placeholder="jane@acmemedia.com"
                          value={agencyForm.email}
                          onChange={e => setAgencyForm({ ...agencyForm, email: e.target.value })}
                        />
                      </div>
                      <div className="rf-login-form-group">
                        <label className="rf-agency-form-label">WHATSAPP / PHONE *</label>
                        <input
                          className="rf-agency-input"
                          type="tel"
                          required
                          placeholder="+91 97000 00000"
                          value={agencyForm.phone}
                          onChange={e => setAgencyForm({ ...agencyForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="rf-login-form-group">
                      <label className="rf-agency-form-label">CHOOSE PASSWORD *</label>
                      <div className="rf-input-pass-wrapper">
                        <input
                          className="rf-agency-input"
                          type={showAgencyPass ? 'text' : 'password'}
                          required
                          placeholder="Min. 8 characters"
                          value={agencyForm.password}
                          onChange={e => setAgencyForm({ ...agencyForm, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="rf-pass-toggle-btn"
                          onClick={() => setShowAgencyPass(!showAgencyPass)}
                          title="Toggle password view"
                        >
                          <i className={`fa-regular ${showAgencyPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="rf-login-form-group">
                      <label className="rf-agency-form-label">CONFIRM PASSWORD *</label>
                      <div className="rf-input-pass-wrapper">
                        <input
                          className="rf-agency-input"
                          type={showAgencyConfPass ? 'text' : 'password'}
                          required
                          placeholder="Re-enter password"
                          value={agencyForm.confirmPassword}
                          onChange={e => setAgencyForm({ ...agencyForm, confirmPassword: e.target.value })}
                        />
                        <button
                          type="button"
                          className="rf-pass-toggle-btn"
                          onClick={() => setShowAgencyConfPass(!showAgencyConfPass)}
                          title="Toggle password view"
                        >
                          <i className={`fa-regular ${showAgencyConfPass ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="rf-btn-agency-submit">
                      Get Started Now <span className="rf-nav-arrow">→</span>
                    </button>

                    <div className="rf-agency-footer-links">
                      <span>Looking for a single business plan? </span>
                      <a href="/pricing" onClick={(e) => handleNavClick(e, 'Pricing')} className="rf-sub-link">
                        View Standard Plans
                      </a>
                      <span> · </span>
                      <a href="/login" onClick={(e) => handleNavClick(e, 'Account', false)} className="rf-sub-link">
                        Sign In
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </main>
      )}

      {/* ====================================================================
          BUSINESS CONSOLE ADMIN PANEL (REVIEWFLOW AI STYLE)
          ==================================================================== */}
      {page === 'Dashboard' && (
        user ? (
          <BusinessConsole
            user={user}
            setUser={setUser}
            business={myBusiness || {
              name: user?.company || user?.name || 'Team Maruti InfoSoft',
              address: 'Surat, Gujarat, India',
              rating: 4.9,
              totalReviews: 248,
              phone: user?.mobile || '+91 9904482945'
            }}
            setBusiness={setMyBusiness}
            navigate={navigate}
            notify={notify}
            choosePlan={choosePlan}
          />
        ) : null
      )}

      {/* ====================================================================
          ACCOUNT / LOGIN / REGISTER (REVIEWFLOW AI EXACT SHOWCASE & FORM)
          ==================================================================== */}
      {page === 'Account' && (
        <div className="rf-login-viewport">
          <div className="rf-login-container">
            {/* ═══════ LEFT COLUMN: LANDING SHOWCASE & TRUST (SCREENSHOT 4 MATCH) ═══════ */}
            <div className="rf-login-showcase">
              <a href="/" className="rf-login-back-btn" onClick={(e) => handleNavClick(e, 'Home')}>
                <i className="fa-solid fa-arrow-left"></i> Back to Homepage
              </a>

              <a href="/" className="rf-login-brand-row" onClick={(e) => handleNavClick(e, 'Home')} title="Return to Homepage">
                <div className="rf-login-brand-icon">
                  <i className="fa-solid fa-star"></i>
                </div>
                <div className="rf-login-brand-titles">
                  <div className="rf-login-brand-name">StarReview <span>AI</span></div>
                  <div className="rf-login-brand-motto">Helping customers share better reviews</div>
                </div>
              </a>

              <div className="rf-login-badge">
                <span className="rf-login-badge-dot"></span>
                OFFICIAL BUSINESS ONBOARDING • INSTANT ACCESS
              </div>

              <h1 className="rf-login-heading">
                Get 10x More 5-Star Google Reviews <span style={{ color: '#16a34a' }}>On Autopilot</span>
              </h1>

              <p className="rf-login-desc">
                Turn everyday walk-in and online customers into glowing 5-star Google reviews. Boost your local search ranking and attract more paying customers effortlessly.
              </p>

              {/* 4 Key Perks (Screenshot 4 Match) */}
              <div className="rf-login-perks-grid">
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-bolt"></i></div>
                  <div className="rf-perk-content">
                    <h4>Instant 60-Second Setup</h4>
                    <p>Connect your Google Business Profile and launch your custom review page.</p>
                  </div>
                </div>
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                  <div className="rf-perk-content">
                    <h4>AI-Assisted Customer Reviews</h4>
                    <p>Solves customer writer's block with tailored 5-star review suggestions.</p>
                  </div>
                </div>
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-qrcode"></i></div>
                  <div className="rf-perk-content">
                    <h4>Print-Ready Standees &amp; Flyers</h4>
                    <p>Download branded QR flyers, table tents, and counter standees instantly.</p>
                  </div>
                </div>
                <div className="rf-perk-card-box">
                  <div className="rf-perk-icon-wrap"><i className="fa-solid fa-shield-halved"></i></div>
                  <div className="rf-perk-content">
                    <h4>Private Negative Feedback Filter</h4>
                    <p>Catch customer complaints privately before they hurt your Google Maps rating.</p>
                  </div>
                </div>
              </div>

              {/* Trust Strip (Screenshot 4 Match) */}
              <div className="rf-login-trust-strip">
                <span className="rf-login-trust-item"><i className="fa-solid fa-star gold-star"></i> 4.9/5 Rating</span>
                <span className="rf-login-trust-item"><i className="fa-solid fa-circle-check green-icon"></i> Instant Activation</span>
                <span className="rf-login-trust-item"><i className="fa-solid fa-lock green-icon"></i> 256-Bit SSL Encrypted</span>
              </div>
            </div>

            {/* ═══════ RIGHT COLUMN: AUTH CARD (SCREENSHOT 4 MATCH) ═══════ */}
            <div className="rf-login-card">
              {page === 'Dashboard' && !user && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', fontSize: '0.8rem', color: '#92400e', marginBottom: 16, lineHeight: 1.4 }}>
                  <i className="fa-solid fa-lock" style={{ marginRight: 6 }}></i>
                  Sign In Required: Please sign in or create an account to access the Business Console &amp; Dashboard.
                </div>
              )}

              <h2 className="rf-login-card-title">{regMode ? 'Create Your Business Account' : 'Business Login'}</h2>
              <p className="rf-login-card-sub">{regMode ? 'Create your business account in 30 seconds to get started.' : 'Enter your credentials to access your review dashboard'}</p>

              {regMode && selectedPlanForReg && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '9px 12px', fontSize: '0.78rem', color: '#166534', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span><i className="fa-solid fa-crown" style={{ color: '#16a34a', marginRight: 6 }}></i>Selected: <strong>{selectedPlanForReg.name} Plan ({selectedPlanForReg.period})</strong></span>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>Active Plan</span>
                </div>
              )}

              <form onSubmit={submitAuth}>
                {regMode ? (
                  <>
                    {/* Row 1: Full Name & Mobile Number (Screenshot 4) */}
                    <div className="rf-form-row-2col">
                      <div className="rf-login-form-group">
                        <label className="rf-login-label">FULL NAME</label>
                        <input
                          className="rf-login-input"
                          type="text"
                          required
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                      <div className="rf-login-form-group">
                        <label className="rf-login-label">MOBILE NUMBER</label>
                        <div className="rf-phone-input-group">
                          <select
                            className="rf-country-code-select"
                            value={mobileCode}
                            onChange={(e) => setMobileCode(e.target.value)}
                          >
                            <option value="+1">+1</option>
                            <option value="+91">+91</option>
                            <option value="+44">+44</option>
                            <option value="+61">+61</option>
                            <option value="+971">+971</option>
                            <option value="+65">+65</option>
                          </select>
                          <span className="rf-phone-divider"></span>
                          <input
                            className="rf-phone-number-input"
                            type="tel"
                            placeholder="9876543210"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Business Email */}
                    <div className="rf-login-form-group">
                      <label className="rf-login-label">BUSINESS EMAIL</label>
                      <input
                        className="rf-login-input"
                        type="email"
                        required
                        placeholder="name@business.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {/* Row 3: Password & Confirm Password (Screenshot 4) */}
                    <div className="rf-form-row-2col">
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
                      <div className="rf-login-form-group">
                        <label className="rf-login-label">CONFIRM PASSWORD</label>
                        <div className="rf-pwd-wrapper">
                          <input
                            className="rf-login-input rf-pwd-input"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength="6"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="rf-pwd-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label="Toggle password visibility"
                          >
                            <i className={showConfirmPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <button className="rf-login-submit-btn" type="submit">
                  {regMode ? 'Create Account ' : 'Sign In to Dashboard '}
                  <span className="rf-nav-arrow">→</span>
                </button>
              </form>

              {/* Divider */}
              <div className="rf-login-divider">
                <span>{regMode ? 'OR SIGN UP WITH' : 'OR CONTINUE WITH'}</span>
              </div>

              {/* Google Sign In / Sign Up */}
              <button
                type="button"
                className="rf-google-btn"
                onClick={handleGoogleAuth}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {regMode ? 'Sign up with Google' : 'Sign in with Google'}
              </button>

              {/* Switch Mode Link */}
              <div className="rf-login-switch-row">
                {regMode ? (
                  <>Already have an account? <button type="button" className="rf-login-switch-btn" onClick={() => { setRegMode(false); window.history.pushState({}, '', '/login'); }}>Sign In</button></>
                ) : (
                  <>Don't have an account? <button type="button" className="rf-login-switch-btn" onClick={() => { setRegMode(true); window.history.pushState({}, '', '/register'); }}>Create Account</button></>
                )}
              </div>

              {/* Security Strip (Screenshot 2 Match) */}
              <div className="rf-login-security-footer">
                <span>Instant Setup</span>
                <span>&bull;</span>
                <span><i className="fa-solid fa-bolt" style={{ color: '#16a34a', marginRight: 3 }}></i>Official API</span>
                <span>&bull;</span>
                <span><i className="fa-solid fa-lock" style={{ color: '#16a34a', marginRight: 3 }}></i>256-Bit SSL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          OTHER PAGES (ORIGINAL TOOLS)
          ==================================================================== */}
      {page === 'Privacy policy' && (
        <PrivacyPolicyPage navigate={navigate} />
      )}

      {page === 'Try the demo' && (
        <PageShell title="Review assistant demo" subtitle="Use an honest experience you could genuinely share. Drafts are editable examples, not published reviews.">
          <div className="tool-layout">
            <div className="panel form-panel sr-demo-form-panel">
              {/* Auto-detected business alert showing Gmail ID and Business Name */}
              <div className="sr-demo-auth-banner">
                <div className="sr-demo-auth-pill">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>
                    {demoEmail ? (
                      <>Account: <strong>{demoEmail}</strong> · Business: <strong>{business}</strong></>
                    ) : (
                      <>Connected Listing: <strong>{business}</strong></>
                    )}
                  </span>
                </div>
                <span className="sr-demo-rating-tag">⭐ 4.9 Verified</span>
              </div>

              {/* Business Name and Gmail ID Side-by-Side */}
              <div className="sr-demo-inputs-row">
                <div className="sr-demo-field-group">
                  <label htmlFor="sr-demo-biz-name" className="sr-demo-field-label">
                    <span>Business name</span>
                  </label>
                  <input
                    id="sr-demo-biz-name"
                    className="sr-demo-field-input"
                    value={business}
                    onChange={e => setBusiness(e.target.value)}
                    placeholder="e.g. Team Maruti InfoSoft"
                  />
                </div>
                <div className="sr-demo-field-group">
                  <label htmlFor="sr-demo-email" className="sr-demo-field-label">
                    <span>Connected Gmail ID</span>
                  </label>
                  <input
                    id="sr-demo-email"
                    type="email"
                    className="sr-demo-field-input"
                    value={demoEmail}
                    onChange={e => {
                      setDemoEmail(e.target.value);
                      try { localStorage.setItem('sr_email', e.target.value); } catch {}
                    }}
                    placeholder="e.g. marutiinfosoftteam@gmail.com"
                  />
                </div>
              </div>

              <label>
                How was your experience?
                <div className="sr-rating-select-row">
                  <div className="rating-select">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        className={rating >= n ? 'on' : ''}
                        onClick={() => handleRatingSelect(n)}
                        aria-label={`${n} stars`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="sr-rating-status-lbl">
                    {rating === 5 && '★★★★★ (5.0) - Outstanding Experience'}
                    {rating === 4 && '★★★★☆ (4.0) - Great Service'}
                    {rating === 3 && '★★★☆☆ (3.0) - Average Experience'}
                    {rating <= 2 && '★★☆☆☆ - Routed to Private Shield'}
                  </span>
                </div>
              </label>

              <label>
                Describe your real experience (Auto-typed on star click or customize)
                <div className="sr-quick-chips-wrapper">
                  <span className="sr-chips-label">Quick highlights (tap to add):</span>
                  <div className="sr-chips-container">
                    {[
                      'Fast & efficient service',
                      'Friendly & helpful staff',
                      'Clean & welcoming space',
                      'High quality work',
                      'Great value for money',
                      'Highly recommended!'
                    ].map(chip => {
                      const cleanCore = chip.toLowerCase().replace(/[!.]/g, '').trim();
                      const isAdded = experience.toLowerCase().includes(cleanCore);
                      return (
                        <button
                          key={chip}
                          type="button"
                          className={`sr-chip-tag ${isAdded ? 'active added' : ''}`}
                          onClick={() => {
                            if (isAdded) {
                              notify(`"${chip}" is already added to review.`);
                              return;
                            }
                            setExperience(prev => {
                              const trimmed = (prev || '').trim();
                              if (!trimmed) return `${chip}.`;
                              if (trimmed.endsWith('.') || trimmed.endsWith('!')) {
                                return `${trimmed} ${chip}.`;
                              }
                              return `${trimmed}, ${chip.toLowerCase()}.`;
                            });
                          }}
                          title={isAdded ? 'Already added to review' : `Tap to add "${chip}"`}
                        >
                          {isAdded ? `✓ ${chip}` : `+ ${chip}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <textarea
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                  rows="3"
                  placeholder="What did you appreciate?"
                />
              </label>

              <div className="sr-form-2col">
                <label>
                  Staff member (optional)
                  <input
                    value={staff}
                    onChange={e => setStaff(e.target.value)}
                    placeholder="e.g. Priya"
                  />
                </label>
                <label>
                  Service or keyword (optional)
                  <input
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    placeholder="e.g. quick appointment"
                  />
                </label>
              </div>

              <label>
                Language
                <select value={language} onChange={e => setLanguage(e.target.value)}>
                  {(cfg.languages || ['English', 'Hindi', 'Hinglish', 'Gujarati']).map(l => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="btn btn-dark full sr-generate-btn"
                onClick={generate}
                disabled={loading}
              >
                {loading ? 'Creating AI drafts…' : '✦ Generate drafts'}
              </button>
              <p className="tiny-note">Drafts are suggestions only. No review is ever posted automatically.</p>
            </div>

            <div className="panel drafts-panel sr-demo-drafts-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">YOUR SUGGESTIONS</div>
                  <h3>Drafts you can edit</h3>
                </div>
                <span className="demo-tag">DEMO MODE</span>
              </div>

              {drafts.length ? (
                <>
                  <div className="sr-drafts-list">
                    {drafts.map((d, i) => (
                      <div className="draft sr-enhanced-draft" key={i}>
                        <div className="draft-top">
                          <div className="sr-draft-title-badge">
                            <b>Option {i + 1}</b>
                            <span className="sr-draft-stars">★★★★★</span>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              className={`copy-btn ${copiedDraftIndex === i ? 'copied' : ''}`}
                              onClick={() => {
                                copy(d);
                                setCopiedDraftIndex(i);
                                setTimeout(() => setCopiedDraftIndex(null), 2500);
                              }}
                            >
                              {copiedDraftIndex === i ? '✓ Copied' : 'Copy'}
                            </button>
                            <button
                              type="button"
                              className="sr-preview-btn"
                              onClick={() => setPreviewGoogleDraft(d)}
                              title="Preview on Google Review Card"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                        <p>{d}</p>
                        <div className="sr-draft-meta-tags">
                          <span><i className="fa-solid fa-bolt"></i> Google Maps SEO Ready</span>
                          {staff && <span><i className="fa-solid fa-user-check"></i> Staff Mentioned</span>}
                          {keywords && <span><i className="fa-solid fa-tag"></i> Keyword Ranked</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Google Business Profile Review Mockup */}
                  <div className="sr-google-preview-box">
                    <div className="sr-google-box-head">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <b>Google Maps Review Simulator</b>
                      </div>
                      <span className="sr-verified-pill">Live Simulation</span>
                    </div>
                    <div className="sr-google-sim-card">
                      <div className="sr-sim-user">
                        <div className="sr-sim-avatar">
                          {demoEmail ? demoEmail[0].toUpperCase() : (business ? business[0].toUpperCase() : 'G')}
                        </div>
                        <div>
                          <div className="sr-sim-name">
                            {demoEmail ? demoEmail.split('@')[0] : (user?.name || 'Verified Customer')} · Local Guide
                          </div>
                          <div className="sr-sim-stars">★★★★★ · <span>just now</span></div>
                        </div>
                      </div>
                      <p className="sr-sim-text">
                        {previewGoogleDraft || drafts[0]}
                      </p>
                      <div className="sr-sim-footer">
                        <span>Posted on: <strong>{business}</strong></span>
                        <span className="sr-sim-verified-check">✓ Verified Google Places Listing</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">✦</div>
                  <h3>Your drafts will appear here</h3>
                  <p>Enter your business experience details on the left, then click <strong>Generate drafts</strong> to see instant AI suggestions.</p>
                  <div className="sr-sample-presets">
                    <span>Or try a quick demo sample:</span>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                      <button
                        type="button"
                        className="sr-chip-tag"
                        onClick={() => {
                          setBusiness('The Spice Garden Bistro');
                          setRating(5);
                          setExperience('Incredible dinner with rich authentic flavors and wonderful atmosphere');
                          setStaff('Rahul');
                          setKeywords('Butter Chicken & Naan');
                        }}
                      >
                        🍽️ Restaurant Sample
                      </button>
                      <button
                        type="button"
                        className="sr-chip-tag"
                        onClick={() => {
                          setBusiness('Apex Dental Care');
                          setRating(5);
                          setExperience('Gentle treatment, zero pain and super clean clinic');
                          setStaff('Dr. Ananya');
                          setKeywords('Teeth Whitening');
                        }}
                      >
                        🦷 Healthcare Sample
                      </button>
                      <button
                        type="button"
                        className="sr-chip-tag"
                        onClick={() => {
                          setBusiness('Luxe Spa & Salon');
                          setRating(5);
                          setExperience('Relaxing aromatherapy massage and polite reception');
                          setStaff('Sonia');
                          setKeywords('Deep Tissue Massage');
                        }}
                      >
                        💆 Salon & Spa Sample
                      </button>
                    </div>
                  </div>
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
            <button className="btn btn-dark">Submit inquiry →</button>
            {cfg.whatsappNumber && (
              <a className="btn btn-light" href={`https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent('Hi StarReview AI, I need help.')}`} target="_blank" rel="noreferrer">
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
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

      {['Frequently asked questions', 'Multi-business plan', 'Privacy policy', 'Terms of service', 'Cookie policy'].includes(page) && (
        <PageShell
          title={({ 'Frequently asked questions': 'Frequently asked questions', 'Source code': 'Source code and commercial licensing', 'Multi-business plan': 'Manage multiple business locations', 'Apply for agency': 'Agency partnerships', 'Privacy policy': 'Privacy policy', 'Terms of service': 'Terms of service', 'Cookie policy': 'Cookie policy' })[page]}
          subtitle={({ 'Frequently asked questions': 'Helpful answers about trials, plans, reviews, and payments.', 'Source code': 'Ask our team about source-code access and commercial licensing.', 'Multi-business plan': 'A scalable workflow for teams managing more than one location.', 'Apply for agency': 'Tell us about your agency and the businesses you support.', 'Privacy policy': 'We aim to collect only the information needed to provide the service.', 'Terms of service': 'Use the platform responsibly.', 'Cookie policy': 'Cookies and local storage may be used to support sign-in and core site functionality.' })[page]}
        >
          <div className="legal-content">
            {page === 'Frequently asked questions' ? (
              <>
                {[
                  ['How do I get started?', 'Simply sign in or message us on WhatsApp at +91 9904482945 to activate your business review kit in minutes.'],
                  ['How do paid plans work?', 'Starter and Pro are available monthly or yearly. Payments are processed through Razorpay when live keys are configured.'],
                  ['Does StarReview AI post reviews automatically?', 'No. Customers remain in control and must review, edit, and post their own feedback.'],
                  ['Can I manage multiple locations?', 'Contact us about the multi-business and agency options.'],
                  ['How can I contact support?', 'Use the Contact Support link or the inquiry form on this website.']
                ].map(([q, a]) => (
                  <details key={q}><summary>{q}</summary><p>{a}</p></details>
                ))}
              </>
            ) : (
              <>
                <p>StarReview AI helps local businesses create a clear customer feedback workflow, prepare editable review drafts, and understand feedback trends.</p>
                <a href="/contact" className="btn btn-dark" onClick={(e) => handleNavClick(e, 'Contact')}>Contact support →</a>
              </>
            )}
          </div>
        </PageShell>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
      
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
                    Open Dashboard →
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

      {/* Floating Circular WhatsApp Button for Public Website */}
      {!isConsoleView && page !== 'Review' && (
        <a
          href={`https://wa.me/${cfg.whatsappNumber || '919904482945'}?text=${encodeURIComponent('Hello StarReview AI Team! I would like to inquire about your Google review management platform and plans.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rf-floating-whatsapp-btn"
          title="Chat on WhatsApp (+91 9904482945)"
          aria-label="Chat on WhatsApp"
        >
          <span className="rf-whatsapp-halo"></span>
          <i className="fa-brands fa-whatsapp"></i>
        </a>
      )}
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
        ['AI SEO Analyzer', 'Features'],
        ['How It Works', 'How it works'],
        ['Growing Businesses', 'Features']
      ]
    },
    {
      title: 'Plans & Scale',
      items: [
          ['Pricing & Plans', 'Pricing'],
        ['Apply for Agency', 'Apply for agency'],
        ['Sign In to Account', 'Account'],
        ['Payment QR Demo', 'Payment QR Demo']
      ]
    },
    {
      title: 'Company',
      items: [
        ['About Us', 'About us'],
        ['Contact Support', 'Contact'],
        ['Frequently Asked Questions', 'Frequently asked questions'],
        ['Smart QR Funnels', 'QR flyer']
      ]
    },
    {
      title: 'Access',
      items: [
        ['Business Onboard', 'Business onboarding'],
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
          <a
            href="/"
            className="brand"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button !== 1) {
                e.preventDefault();
                navigate('Home');
              }
            }}
            style={{ textAlign: 'left', padding: 0 }}
            title="StarReview AI Homepage"
          >
            <span className="brand-mark">✦</span>
            <span>StarReview <b>AI</b></span>
          </a>
          <div className="footer-brand-motto">Helping customers share better reviews</div>
          <p className="footer-brand-tagline">
            AI-Powered Google Review Growth System — helping local businesses gather authentic 5-star reviews, resolve private feedback, and boost Google Maps rankings.
          </p>
          <div className="rf-footer-trust-badges">
            <span className="rf-footer-badge"><i className="fa-solid fa-shield-halved"></i> 100% Policy Safe</span>
            <span className="rf-footer-badge"><i className="fa-solid fa-bolt"></i> Instant Setup</span>
          </div>
          <div className="footer-powered-link">
            Powered by <strong>StarReview AI</strong>
          </div>
        </div>

        {/* 4 Nav Columns */}
        {groups.map(col => (
          <div className="footer-nav-col" key={col.title}>
            <h4>{col.title}</h4>
            {col.items.map(([label, target, badge]) => (
              <a
                key={label}
                href={slugMap[target] || '/'}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button !== 1) {
                    e.preventDefault();
                    navigate(target);
                  }
                }}
              >
                {label}
                {badge && <span className="rf-footer-col-badge">{badge}</span>}
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="wrap footer-bottom-bar">
        <span>© 2026 StarReview AI. All rights reserved.</span>
        <div>
          <a
            href="/terms"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button !== 1) {
                e.preventDefault();
                navigate('Terms of service');
              }
            }}
          >
            Terms of Service
          </a>
          <i>·</i>
          <a
            href="/cookies"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey && !e.shiftKey && e.button !== 1) {
                e.preventDefault();
                navigate('Cookie policy');
              }
            }}
          >
            Cookie Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
