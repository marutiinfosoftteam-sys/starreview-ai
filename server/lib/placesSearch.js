// Google Places API (New) client used by the business onboarding search.
// Docs: https://developers.google.com/maps/documentation/places/web-service/op-overview
//
// The API key stays on the server (GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY)
// and is never sent to the browser. Every value returned here comes straight
// from Google; nothing is invented when a field is missing.

const PLACES_BASE_URL = 'https://places.googleapis.com/v1';
const REQUEST_TIMEOUT_MS = 6000;


const SEARCH_UNAVAILABLE = 'Business search is not available right now. Please try again later or enter your details manually.';

export class PlacesApiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

export const getPlacesApiKey = () =>
  process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

async function callPlaces(path, { method = 'GET', body, fieldMask } = {}) {
  const apiKey = getPlacesApiKey();
  if (!apiKey) {
    console.warn('[Google Places] GOOGLE_PLACES_API_KEY is not set; business search is disabled.');
    throw new PlacesApiError(SEARCH_UNAVAILABLE, 503);
  }

  const headers = { 'X-Goog-Api-Key': apiKey };
  if (fieldMask) headers['X-Goog-FieldMask'] = fieldMask;
  if (body) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${PLACES_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (err) {
    throw new PlacesApiError('Business search is taking too long. Please try again.', 504);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data?.error?.message || `Google Places request failed (${response.status}).`;
    console.warn('[Google Places]', response.status, reason);
    if (response.status === 404) throw new PlacesApiError('This business could not be found.', 404);
    // Key, quota and billing problems are for the site owner; show customers a plain message
    throw new PlacesApiError(SEARCH_UNAVAILABLE, 502);
  }
  return data;
}

// India's bounding box. Text Search only returns places inside it.
const INDIA_BOUNDS = {
  rectangle: {
    low: { latitude: 6.4, longitude: 68.0 },
    high: { latitude: 37.1, longitude: 97.5 }
  }
};

const PLACE_FIELDS = [
  'id',
  'displayName',
  'formattedAddress',
  'shortFormattedAddress',
  'addressComponents',
  'location',
  'rating',
  'userRatingCount',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'websiteUri',
  'googleMapsUri',
  'primaryType',
  'primaryTypeDisplayName',
  'businessStatus'
];

const DETAILS_FIELD_MASK = PLACE_FIELDS.join(',');
const SEARCH_FIELD_MASK = PLACE_FIELDS.map(f => `places.${f}`).concat('nextPageToken').join(',');

const component = (components, type, key = 'longText') =>
  (components || []).find(c => (c.types || []).includes(type))?.[key] || '';

function toBusiness(p, fallbackId = '') {
  const id = p.id || fallbackId;
  const parts = p.addressComponents || [];
  return {
    placeId: id,
    name: p.displayName?.text || '',
    address: p.formattedAddress || '',
    shortAddress: p.shortFormattedAddress || '',
    area: component(parts, 'sublocality_level_1') || component(parts, 'sublocality') || component(parts, 'neighborhood'),
    city: component(parts, 'locality') || component(parts, 'administrative_area_level_3') || component(parts, 'administrative_area_level_2'),
    district: component(parts, 'administrative_area_level_2'),
    state: component(parts, 'administrative_area_level_1'),
    country: component(parts, 'country'),
    countryCode: component(parts, 'country', 'shortText'),
    postcode: component(parts, 'postal_code'),
    latitude: p.location?.latitude ?? null,
    longitude: p.location?.longitude ?? null,
    category: p.primaryTypeDisplayName?.text || (p.primaryType ? p.primaryType.replace(/_/g, ' ') : ''),
    rating: typeof p.rating === 'number' ? p.rating : null,
    userRatingsTotal: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
    website: p.websiteUri || '',
    businessStatus: p.businessStatus || '',
    googleMapsUrl: p.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(id)}`,
    googleReviewUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(id)}`,
    isGoogleVerified: true
  };
}

/**
 * Search businesses anywhere in India: companies, branches, shops, restaurants,
 * clinics, offices... Uses Text Search (New), up to 20 results per page and
 * 3 pages in total. Every result already carries the full address, PIN code,
 * phone and rating, so no extra details call is needed.
 */
export async function searchIndianBusinesses(query, pageToken) {
  const textQuery = String(query || '').trim();
  if (textQuery.length < 2) return { places: [], nextPageToken: '' };

  const body = {
    textQuery,
    languageCode: 'en',
    regionCode: 'IN',
    pageSize: 20,
    locationRestriction: INDIA_BOUNDS
  };
  if (pageToken) body.pageToken = pageToken;

  const data = await callPlaces('/places:searchText', { method: 'POST', body, fieldMask: SEARCH_FIELD_MASK });

  const places = (data.places || [])
    .map(p => toBusiness(p))
    // The box also touches neighbouring countries; keep Indian addresses only
    .filter(p => p.placeId && p.name && (!p.countryCode || p.countryCode === 'IN'));

  return { places, nextPageToken: data.nextPageToken || '' };
}

/**
 * Fresh details for one place (used to re-sync a saved business).
 */
export async function getPlaceDetails(placeId) {
  const id = String(placeId || '').trim();
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new PlacesApiError('Invalid Google Place ID.', 400);

  const params = new URLSearchParams({ languageCode: 'en', regionCode: 'in' });
  const p = await callPlaces(`/places/${encodeURIComponent(id)}?${params}`, { fieldMask: DETAILS_FIELD_MASK });
  return toBusiness(p, id);
}
