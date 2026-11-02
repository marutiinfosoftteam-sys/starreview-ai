import React, { useState, useEffect, useRef } from 'react';
import { api } from './api.js';

const CATEGORY_OPTIONS = [
  'Restaurant & Cafe',
  'Dental Clinic & Healthcare',
  'Spa, Salon & Wellness',
  'Retail & Shopping',
  'Auto Repair & Service',
  'Real Estate & Construction',
  'Hotel, Travel & Hospitality',
  'Education & Coaching',
  'Gym & Fitness',
  'Professional & Legal Services',
  'Solar Rooftop & Clean Energy',
  'Home Services & Renovation',
  'Jewellery & Fashion',
  'Pharmacy & Medical Store',
  'Manufacturing & Fabrication',
  'Local Business & Services',
  'Other'
];

const pushStep = (step) => {
  try {
    const url = step === 1 ? '/business-onboard' : `/business-onboard?step=${step}`;
    window.history.pushState({ page: 'Business onboarding', step }, '', url);
  } catch (_) {}
};

export default function BusinessOnboarding({ user, business, setBusiness, notify, navigate }) {
  const [step, setStep] = useState(1); // 1: Search, 2: Confirm, 3: Done
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [placesList, setPlacesList] = useState([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [savedBusiness, setSavedBusiness] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [copiedPlaceId, setCopiedPlaceId] = useState(false);

  const bizObj = business && typeof business === 'object' ? business : {};
  const [manualName, setManualName] = useState(typeof business === 'string' ? business : (bizObj.name || ''));
  const [manualCategory, setManualCategory] = useState(bizObj.category || '');
  const [customManualCategory, setCustomManualCategory] = useState('');
  const [manualAddress, setManualAddress] = useState(bizObj.address || '');
  const [manualCity, setManualCity] = useState(bizObj.city || '');
  const [manualState, setManualState] = useState(bizObj.state || '');
  const [manualPostcode, setManualPostcode] = useState(bizObj.postcode || '');
  const [manualReviewUrl, setManualReviewUrl] = useState(bizObj.googleReviewUrl || '');
  const [manualPhone, setManualPhone] = useState(bizObj.phone || '');
  const [manualWebsite, setManualWebsite] = useState(bizObj.website || '');

  // A business this account already connected or entered (not the empty starter profile)
  const hasSavedBusiness = Boolean(bizObj.name && (bizObj.isGoogleVerified || bizObj.placeId || bizObj.address));

  const searchDebounceRef = useRef(null);
  const latestQueryRef = useRef('');

  // Browser back button moves between steps
  useEffect(() => {
    const handlePop = (e) => {
      if (e.state && e.state.step) setStep(e.state.step);
      else if (window.location.search.includes('step=2') && selectedPlace) setStep(2);
      else setStep(1);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [selectedPlace]);

  useEffect(() => () => clearTimeout(searchDebounceRef.current), []);

  const fetchPlaces = async (query) => {
    const q = (query || '').trim();
    latestQueryRef.current = q;
    setSearchError('');
    setNextPageToken('');
    if (q.length < 2) {
      setPlacesList([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const r = await api('GET', `/api/places/search?q=${encodeURIComponent(q)}`);
    // Ignore responses for an older query the user already typed past
    if (latestQueryRef.current !== q) return;

    setIsSearching(false);
    setHasSearched(true);
    if (r.ok && Array.isArray(r.data?.places)) {
      setPlacesList(r.data.places);
      setNextPageToken(r.data.nextPageToken || '');
    } else {
      setPlacesList([]);
      setSearchError(r.data?.error || 'Business search failed. Please try again.');
    }
  };

  const loadMorePlaces = async () => {
    const q = latestQueryRef.current;
    if (!nextPageToken || !q) return;
    setLoadingMore(true);
    const r = await api('GET', `/api/places/search?q=${encodeURIComponent(q)}&pageToken=${encodeURIComponent(nextPageToken)}`);
    setLoadingMore(false);
    if (latestQueryRef.current !== q) return;
    if (r.ok && Array.isArray(r.data?.places)) {
      setPlacesList(prev => {
        const seen = new Set(prev.map(p => p.placeId));
        return prev.concat(r.data.places.filter(p => !seen.has(p.placeId)));
      });
      setNextPageToken(r.data.nextPageToken || '');
    } else {
      setSearchError(r.data?.error || 'Could not load more results.');
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => fetchPlaces(val), 600);
  };

  const searchNow = () => {
    clearTimeout(searchDebounceRef.current);
    fetchPlaces(searchQuery);
  };

  // Search results already include the full address, PIN code and phone
  const selectPlace = (p) => {
    setSearchError('');
    setSelectedPlace(p);
    setStep(2);
    pushStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishWith = (savedBiz) => {
    setSavedBusiness(savedBiz);
    if (setBusiness && savedBiz) setBusiness(savedBiz);
    setStep(3);
    pushStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmConnectPlace = async () => {
    if (!selectedPlace) return;
    setIsConnecting(true);
    const p = selectedPlace;
    const r = await api('POST', '/api/business/connect-google-place', {
      source: p.source === 'openstreetmap' ? 'openstreetmap' : 'google',
      placeId: p.placeId,
      name: p.name,
      address: p.address,
      area: p.area,
      city: p.city,
      state: p.state,
      postcode: p.postcode,
      country: p.country,
      category: p.category,
      rating: p.rating,
      userRatingsTotal: p.userRatingsTotal,
      googleReviewUrl: p.googleReviewUrl,
      googleMapsUrl: p.googleMapsUrl,
      website: p.website,
      phone: p.phone
    });
    setIsConnecting(false);

    if (r.ok && r.data?.business) {
      notify('Business connected.');
      finishWith(r.data.business);
    } else {
      notify(r.data?.error || 'Could not save your business. Please try again.');
    }
  };

  const saveManualBusiness = async (e) => {
    e.preventDefault();
    const name = manualName.trim();
    if (!name) {
      notify('Please enter your business name.');
      return;
    }
    const pin = manualPostcode.trim();
    if (pin && !/^\d{6}$/.test(pin)) {
      notify('PIN code should be 6 digits.');
      return;
    }

    // A Place ID pasted on its own is turned into the review link
    let reviewUrl = manualReviewUrl.trim();
    let placeId = '';
    if (reviewUrl && !/^https?:\/\//i.test(reviewUrl)) {
      placeId = reviewUrl;
      reviewUrl = `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
    } else {
      const m = reviewUrl.match(/placeid=([^&]+)/i);
      if (m) placeId = decodeURIComponent(m[1]);
    }

    setIsConnecting(true);
    const r = await api('POST', '/api/business/connect-google-place', {
      source: 'manual',
      placeId,
      name,
      category: manualCategory === 'Other' ? (customManualCategory.trim() || 'Other') : manualCategory,
      address: manualAddress.trim(),
      city: manualCity.trim(),
      state: manualState.trim(),
      postcode: pin,
      country: 'India',
      googleReviewUrl: reviewUrl,
      phone: manualPhone.trim(),
      website: manualWebsite.trim()
    });
    setIsConnecting(false);

    if (r.ok && r.data?.business) {
      notify('Business profile saved.');
      finishWith(r.data.business);
    } else {
      notify(r.data?.error || 'Could not save your business. Please try again.');
    }
  };

  const copyPlaceId = (pid) => {
    navigator.clipboard?.writeText(pid);
    setCopiedPlaceId(true);
    notify('Place ID copied.');
    setTimeout(() => setCopiedPlaceId(false), 2000);
  };

  const locationLine = (p) => [p.area, p.city, p.state].filter((v, i, a) => v && a.indexOf(v) === i).join(', ');

  return (
    <div className="rf-onboard-wrap">

      {/* Header & progress */}
      <div className="rf-onboard-header">
        <div className="rf-onboard-badge">
          <i className="fa-solid fa-store" style={{ color: '#16a34a' }}></i>
          <span>Takes about a minute</span>
        </div>
        <h1 className="rf-onboard-title">Connect your business</h1>
        <p className="rf-onboard-sub">
          Search for your business and we'll fill in its address, PIN code, phone and review link for you.
        </p>

        <div className="rf-onboard-stepper">
          <div className={`rf-step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="rf-step-circle">{step > 1 ? '✓' : '1'}</div>
            <div className="rf-step-label">Find business</div>
          </div>
          <div className="rf-step-line"></div>
          <div className={`rf-step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>
            <div className="rf-step-circle">{step > 2 ? '✓' : '2'}</div>
            <div className="rf-step-label">Check details</div>
          </div>
          <div className="rf-step-line"></div>
          <div className={`rf-step-item ${step === 3 ? 'active done' : ''}`}>
            <div className="rf-step-circle">3</div>
            <div className="rf-step-label">Done</div>
          </div>
        </div>
      </div>

      {/* STEP 1: SEARCH */}
      {step === 1 && !manualMode && (
        <div className="rf-onboard-card">
          {hasSavedBusiness && (
            <div className="rf-existing-biz">
              <div className="rf-existing-biz-info">
                <span className="rf-existing-biz-label">Your business</span>
                <strong>{bizObj.name}</strong>
                {(bizObj.address || bizObj.city) && <small>{bizObj.address || bizObj.city}</small>}
              </div>
              <button type="button" className="btn btn-dark rf-existing-biz-btn" onClick={() => navigate('Dashboard')}>
                Continue to dashboard <i className="fa-solid fa-arrow-right"></i>
              </button>
              <p className="rf-existing-biz-note">Or search below to connect a different business.</p>
            </div>
          )}

          <div className="rf-search-box-wrap">
            <label className="rf-search-label" htmlFor="rf-business-search">
              <span>Business name</span>
            </label>
            <div className="rf-search-input-box">
              <div className="rf-search-field-inner">
                <i className="fa-solid fa-magnifying-glass rf-search-icon"></i>
                <input
                  id="rf-business-search"
                  type="text"
                  className="rf-search-input"
                  placeholder="Company, shop or branch name, e.g. Domino's Pizza Adajan Surat"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      searchNow();
                    }
                  }}
                  autoComplete="off"
                  autoFocus={!hasSavedBusiness}
                />
                {isSearching ? (
                  <i className="fa-solid fa-circle-notch fa-spin rf-search-status"></i>
                ) : searchQuery ? (
                  <button
                    type="button"
                    className="rf-search-clear"
                    aria-label="Clear search"
                    onClick={() => { setSearchQuery(''); fetchPlaces(''); }}
                  >
                    ✕
                  </button>
                ) : null}
              </div>
              <button type="button" className="rf-btn-search-go" onClick={searchNow}>
                <i className="fa-solid fa-magnifying-glass"></i> Search
              </button>
            </div>
            <p className="rf-search-hint">
              Search any company, shop, restaurant, clinic or branch across India. Adding the city or area gives better matches.
            </p>
          </div>

          <div className="rf-places-results">
            {searchError && (
              <div className="rf-search-error" role="alert">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>{searchError}</span>
              </div>
            )}

            {placesList.length > 0 && (
              <>
                <div className="rf-results-header">
                  <span>{placesList.length} {placesList.length === 1 ? 'business' : 'businesses'} found</span>
                </div>
                <div className="rf-places-list">
                  {placesList.map((p) => (
                    <button
                      type="button"
                      key={p.placeId}
                      className="rf-place-card"
                      onClick={() => selectPlace(p)}
                    >
                      <div className="rf-place-left">
                        <div className="rf-place-gpin">
                          <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                        </div>
                        <div className="rf-place-info">
                          <div className="rf-place-name-row">
                            <h4 className="rf-place-name">{p.name}</h4>
                            {p.category && <span className="rf-place-cat">{p.category}</span>}
                          </div>
                          {p.address && <p className="rf-place-addr">{p.address}</p>}
                          <div className="rf-place-stats">
                            {p.rating !== null && p.rating !== undefined && (
                              <span className="rf-star-badge">★ {Number(p.rating).toFixed(1)}</span>
                            )}
                            {p.userRatingsTotal ? (
                              <span className="rf-reviews-count">{p.userRatingsTotal.toLocaleString('en-IN')} reviews</span>
                            ) : null}
                            {p.postcode && (
                              <span className="rf-place-pincode-pill"><i className="fa-solid fa-map-pin"></i> {p.postcode}</span>
                            )}
                            {p.phone && (
                              <span className="rf-place-city-pill"><i className="fa-solid fa-phone"></i> {p.phone}</span>
                            )}
                            {p.businessStatus && p.businessStatus !== 'OPERATIONAL' && (
                              <span className="rf-place-closed-pill">Closed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="rf-place-action">
                        <span className="rf-btn-select">Select <i className="fa-solid fa-arrow-right"></i></span>
                      </div>
                    </button>
                  ))}
                </div>
                {nextPageToken && (
                  <button type="button" className="btn btn-light rf-load-more" onClick={loadMorePlaces} disabled={loadingMore}>
                    {loadingMore ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Loading…</> : 'Show more results'}
                  </button>
                )}
              </>
            )}

            {!searchError && placesList.length === 0 && (
              hasSearched && !isSearching ? (
                <div className="rf-no-results">
                  <i className="fa-solid fa-store-slash" style={{ fontSize: '2rem', color: '#94a3b8', marginBottom: 12 }}></i>
                  <h4>No businesses found for "{searchQuery}"</h4>
                  <p>Try a shorter name, add the city or area, or enter your details manually.</p>
                </div>
              ) : !isSearching && (
                <div className="rf-no-results" style={{ padding: '36px 16px' }}>
                  <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '2rem', color: '#16a34a', marginBottom: 12 }}></i>
                  <h4>Search for your business</h4>
                  <p>Start typing your business name to see matching businesses.</p>
                </div>
              )
            )}
          </div>

          <div className="rf-manual-toggle-strip">
            <p>Can't find your business?</p>
            <button type="button" className="rf-btn-text" onClick={() => setManualMode(true)}>
              <i className="fa-solid fa-pen-to-square"></i> Enter details manually
            </button>
          </div>
        </div>
      )}

      {/* STEP 1 (ALTERNATIVE): MANUAL ENTRY */}
      {step === 1 && manualMode && (
        <div className="rf-onboard-card">
          <div className="rf-manual-header">
            <div>
              <h3>Enter business details</h3>
              <p>You can link your Google listing later from Settings.</p>
            </div>
            <button type="button" className="btn btn-light" onClick={() => setManualMode(false)}>
              ← Back to search
            </button>
          </div>

          <form onSubmit={saveManualBusiness} className="rf-manual-form">
            <div className="rf-form-grid">
              <div className="rf-form-group">
                <label htmlFor="mb-name">Business name *</label>
                <input id="mb-name" type="text" required value={manualName} onChange={e => setManualName(e.target.value)} />
              </div>

              <div className="rf-form-group">
                <label htmlFor="mb-category">Category</label>
                <select id="mb-category" value={manualCategory} onChange={e => setManualCategory(e.target.value)}>
                  <option value="">Select a category</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="rf-form-group rf-form-group-wide">
                <label htmlFor="mb-address">Street address</label>
                <input id="mb-address" type="text" placeholder="Shop number, building, street" value={manualAddress} onChange={e => setManualAddress(e.target.value)} />
              </div>

              <div className="rf-form-group">
                <label htmlFor="mb-city">City *</label>
                <input id="mb-city" type="text" required value={manualCity} onChange={e => setManualCity(e.target.value)} />
              </div>

              <div className="rf-form-group">
                <label htmlFor="mb-state">State</label>
                <input id="mb-state" type="text" value={manualState} onChange={e => setManualState(e.target.value)} />
              </div>

              <div className="rf-form-group">
                <label htmlFor="mb-pin">PIN code</label>
                <input id="mb-pin" type="text" inputMode="numeric" maxLength={6} pattern="\d{6}" value={manualPostcode} onChange={e => setManualPostcode(e.target.value.replace(/\D/g, ''))} />
              </div>

              <div className="rf-form-group">
                <label htmlFor="mb-phone">Phone</label>
                <input id="mb-phone" type="tel" value={manualPhone} onChange={e => setManualPhone(e.target.value)} />
              </div>

              <div className="rf-form-group rf-form-group-wide">
                <label htmlFor="mb-review">
                  Google review link or Place ID
                  <span className="rf-label-help">Happy customers are sent here to post their review</span>
                </label>
                <input id="mb-review" type="text" placeholder="https://search.google.com/local/writereview?placeid=..." value={manualReviewUrl} onChange={e => setManualReviewUrl(e.target.value)} />
              </div>

              <div className="rf-form-group rf-form-group-wide">
                <label htmlFor="mb-website">Website</label>
                <input id="mb-website" type="url" placeholder="https://" value={manualWebsite} onChange={e => setManualWebsite(e.target.value)} />
              </div>
            </div>

            <div className="rf-form-actions">
              <button type="submit" className="btn btn-dark" disabled={isConnecting}>
                {isConnecting ? 'Saving…' : 'Save and continue'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: CONFIRM GOOGLE DETAILS */}
      {step === 2 && selectedPlace && (
        <div className="rf-onboard-card">
          <div className="rf-confirm-top">
            <div className="rf-confirm-badge">
              <i className="fa-solid fa-circle-check" style={{ color: '#16a34a' }}></i>
              <span>Business found</span>
            </div>
            <button type="button" className="btn btn-light" onClick={() => { setStep(1); pushStep(1); }}>
              ← Choose a different business
            </button>
          </div>

          {selectedPlace.businessStatus && selectedPlace.businessStatus !== 'OPERATIONAL' && (
            <div className="rf-search-error" role="alert">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>Google lists this business as {selectedPlace.businessStatus === 'CLOSED_PERMANENTLY' ? 'permanently closed' : 'temporarily closed'}.</span>
            </div>
          )}

          <div className="rf-verified-summary-card">
            <div className="rf-vsc-header">
              <div>
                {selectedPlace.category && <span className="rf-vsc-tag">{selectedPlace.category}</span>}
                <h2 className="rf-vsc-title">{selectedPlace.name}</h2>
              </div>
              {selectedPlace.rating !== null && selectedPlace.rating !== undefined && (
                <div className="rf-vsc-rating-box">
                  <div className="rf-vsc-stars">★ {Number(selectedPlace.rating).toFixed(1)}</div>
                  {selectedPlace.userRatingsTotal ? (
                    <small>{selectedPlace.userRatingsTotal.toLocaleString('en-IN')} Google reviews</small>
                  ) : null}
                </div>
              )}
            </div>

            <div className="rf-vsc-grid">
              <div className="rf-vsc-row">
                <span className="rf-vsc-label"><i className="fa-solid fa-location-dot"></i> Address</span>
                <span className="rf-vsc-val">{selectedPlace.address || '—'}</span>
              </div>

              {(locationLine(selectedPlace) || selectedPlace.postcode) && (
                <div className="rf-vsc-row">
                  <span className="rf-vsc-label"><i className="fa-solid fa-map"></i> City / State / PIN</span>
                  <span className="rf-vsc-val">
                    {[locationLine(selectedPlace), selectedPlace.postcode].filter(Boolean).join(' – ')}
                  </span>
                </div>
              )}

              {selectedPlace.phone && (
                <div className="rf-vsc-row">
                  <span className="rf-vsc-label"><i className="fa-solid fa-phone"></i> Phone</span>
                  <a className="rf-vsc-val" href={`tel:${selectedPlace.phone.replace(/\s/g, '')}`}>{selectedPlace.phone}</a>
                </div>
              )}

              {selectedPlace.website && (
                <div className="rf-vsc-row">
                  <span className="rf-vsc-label"><i className="fa-solid fa-globe"></i> Website</span>
                  <a className="rf-vsc-val rf-truncate-url" href={selectedPlace.website} target="_blank" rel="noreferrer">{selectedPlace.website}</a>
                </div>
              )}

              <div className="rf-vsc-row">
                <span className="rf-vsc-label"><i className="fa-solid fa-fingerprint"></i> {selectedPlace.source === 'openstreetmap' ? 'Map ID (OpenStreetMap)' : 'Google Place ID'}</span>
                <div className="rf-vsc-val-flex">
                  <code>{selectedPlace.placeId}</code>
                  <button type="button" className="rf-btn-copy" onClick={() => copyPlaceId(selectedPlace.placeId)}>
                    {copiedPlaceId ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="rf-vsc-row">
                <span className="rf-vsc-label"><i className="fa-solid fa-star"></i> Review link</span>
                <div className="rf-vsc-val-flex">
                  <span className="rf-truncate-url">{selectedPlace.googleReviewUrl}</span>
                  <a href={selectedPlace.googleReviewUrl} target="_blank" rel="noreferrer" className="rf-btn-test-link">
                    Open →
                  </a>
                </div>
              </div>
            </div>

            <div className="rf-vsc-footer">
              {selectedPlace.googleMapsUrl && (
                <a className="rf-security-note" href={selectedPlace.googleMapsUrl} target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-map-location-dot" style={{ color: '#16a34a' }}></i>
                  <span>View on Google Maps</span>
                </a>
              )}

              <button
                type="button"
                className="btn btn-dark rf-btn-confirm-connect"
                disabled={isConnecting}
                onClick={confirmConnectPlace}
              >
                {isConnecting
                  ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Saving…</>
                  : <>Use this business <i className="fa-solid fa-arrow-right"></i></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: DONE */}
      {step === 3 && (
        <div className="rf-onboard-card rf-success-step">
          <div className="rf-success-icon-wrap">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2>Your business is set up</h2>
          <p className="rf-success-sub">
            Your review page and QR code now use these details. You can change them any time from Settings.
          </p>

          <div className="rf-success-meta-box">
            <div>
              <span className="label">Business</span>
              <strong>{savedBusiness?.name || selectedPlace?.name || manualName}</strong>
            </div>
            <div>
              <span className="label">Location</span>
              <strong>{[savedBusiness?.city, savedBusiness?.postcode].filter(Boolean).join(' – ') || '—'}</strong>
            </div>
            <div>
              <span className="label">Source</span>
              <strong>{savedBusiness?.isGoogleVerified ? 'Verified listing' : String(savedBusiness?.placeId || '').startsWith('osm-') ? 'Found on map' : 'Entered manually'}</strong>
            </div>
          </div>

          <div className="rf-success-actions">
            <button type="button" className="btn btn-dark rf-btn-launch" onClick={() => navigate('Dashboard')}>
              Go to dashboard <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => {
                try { window.history.pushState({}, '', '/dashboard?tab=billing'); } catch (_) {}
                navigate('Dashboard');
              }}
            >
              See plans
            </button>
          </div>
        </div>
      )}

      {/* What you get */}
      <div className="rf-onboard-trust-strip">
        <div className="rf-trust-item">
          <i className="fa-solid fa-location-dot"></i>
          <div>
            <strong>Accurate details</strong>
            <span>Address, PIN code and phone are filled in for you</span>
          </div>
        </div>
        <div className="rf-trust-item">
          <i className="fa-solid fa-qrcode"></i>
          <div>
            <strong>Ready-to-print QR</strong>
            <span>Your review page and QR flyer are set up from these details</span>
          </div>
        </div>
        <div className="rf-trust-item">
          <i className="fa-solid fa-comment-dots"></i>
          <div>
            <strong>Private feedback first</strong>
            <span>1–3 star feedback comes to you before it reaches Google</span>
          </div>
        </div>
      </div>
    </div>
  );
}
