// Free business search across India using OpenStreetMap (Photon by Komoot, no key needed).
// Used when GOOGLE_PLACES_API_KEY is not set or Google search is unavailable.
// Every value comes from OpenStreetMap; nothing is invented when a field is missing.

const PHOTON_URL = 'https://photon.komoot.io/api/';
const INDIA_BBOX = '68.0,6.4,97.5,37.1';
// Roads, borders, rivers... are not businesses
const SKIP_KEYS = new Set(['highway', 'boundary', 'landuse', 'natural', 'waterway', 'railway', 'place', 'route']);

const titleCase = s => String(s || '').replace(/\b([a-z])/g, m => m.toUpperCase());

export function osmFeatureToBusiness(f) {
  const p = f?.properties || {};
  const [lng, lat] = f?.geometry?.coordinates || [];
  const placeId = `osm-${p.osm_type || 'N'}${p.osm_id}`;
  const street = [p.housenumber, p.street].filter(Boolean).join(' ');
  const area = p.locality || p.district || '';
  const city = titleCase(p.city || p.county || '');
  const address = [street, area, city, p.state, p.postcode, p.country].filter(Boolean)
    .filter((v, i, a) => a.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i)
    .join(', ');
  const mapsQuery = encodeURIComponent([p.name, address].filter(Boolean).join(', '));
  return {
    placeId,
    source: 'openstreetmap',
    name: p.name || '',
    address,
    shortAddress: [street, area, city].filter(Boolean).join(', '),
    area,
    city,
    district: p.county || '',
    state: p.state || '',
    country: p.country || '',
    countryCode: p.countrycode || '',
    postcode: p.postcode || '',
    latitude: typeof lat === 'number' ? lat : null,
    longitude: typeof lng === 'number' ? lng : null,
    category: p.osm_value ? titleCase(String(p.osm_value).replace(/_/g, ' ')) : '',
    rating: null,
    userRatingsTotal: null,
    phone: '',
    website: '',
    businessStatus: '',
    // Opens the business on Google Maps, where customers can tap "Write a review"
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    googleReviewUrl: `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`,
    isGoogleVerified: false
  };
}

export function osmResultsToBusinesses(data) {
  return (data?.features || [])
    .filter(f => f?.properties?.name && (f.properties.countrycode || 'IN') === 'IN' && !SKIP_KEYS.has(f.properties.osm_key))
    .map(osmFeatureToBusiness);
}

export async function searchIndiaOpenStreetMap(query) {
  const q = String(query || '').trim();
  if (q.length < 2) return { places: [], nextPageToken: '', source: 'openstreetmap' };
  const params = new URLSearchParams({ q, limit: '25', bbox: INDIA_BBOX, lang: 'en' });
  const r = await fetch(`${PHOTON_URL}?${params}`, {
    headers: { 'User-Agent': 'StarReviewAI/1.0 (marutiinfosoftteam@gmail.com)' },
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) throw new Error(`OpenStreetMap search failed (${r.status})`);
  return { places: osmResultsToBusinesses(await r.json()), nextPageToken: '', source: 'openstreetmap' };
}
