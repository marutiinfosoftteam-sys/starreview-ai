// Small fetch helper shared by all pages.
export const getToken = () => { try { return localStorage.getItem('starreview_token') || ''; } catch { return ''; } };
export const setToken = token => { try { token ? localStorage.setItem('starreview_token', token) : localStorage.removeItem('starreview_token'); } catch { /* storage unavailable */ } };

export async function api(method, url, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  try {
    const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const raw = await r.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { /* non-JSON response */ }
    if (!r.ok && !data.error) data.error = `Request failed (HTTP ${r.status}). Make sure the backend is running.`;
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'Cannot reach the server. Make sure the backend is running.' } };
  }
}
