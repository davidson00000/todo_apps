// sync.js — fetch/save app state to /api/state, with localStorage fallback.
// Persists: tasks, tweaks, view, variants.
// Auth: reads ?key=... from URL once and uses it for all requests.

(function () {
  const url = new URL(window.location.href);
  const APP_KEY = url.searchParams.get('key') || '';
  const LS_KEY = 'todoapp:state:v1';
  const LS_LAST_SYNC = 'todoapp:lastSync';

  // ── helpers ─────────────────────────────────────────────────
  function readLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeLocal(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  async function fetchRemote() {
    if (!APP_KEY) return { ok: false, reason: 'no-key' };
    try {
      const res = await fetch(`/api/state?key=${encodeURIComponent(APP_KEY)}`, {
        method: 'GET', cache: 'no-store',
      });
      if (!res.ok) {
        return { ok: false, reason: `http-${res.status}` };
      }
      const data = await res.json();
      return { ok: true, state: data.state || null };
    } catch (e) {
      return { ok: false, reason: 'network' };
    }
  }

  async function pushRemote(state) {
    if (!APP_KEY) return { ok: false, reason: 'no-key' };
    try {
      const res = await fetch(`/api/state?key=${encodeURIComponent(APP_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) {
        return { ok: false, reason: `http-${res.status}` };
      }
      const data = await res.json();
      try { localStorage.setItem(LS_LAST_SYNC, String(data.savedAt || Date.now())); } catch (e) {}
      return { ok: true };
    } catch (e) {
      return { ok: false, reason: 'network' };
    }
  }

  // ── debounce ────────────────────────────────────────────────
  let pushTimer = null;
  let lastQueued = null;
  function queuePush(state, opts = {}) {
    lastQueued = state;
    writeLocal(state);
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
      pushTimer = null;
      const s = lastQueued;
      lastQueued = null;
      const r = await pushRemote(s);
      if (window.__SYNC_LISTENERS__) {
        window.__SYNC_LISTENERS__.forEach(fn => { try { fn(r.ok ? 'synced' : 'offline', r); } catch (e) {} });
      }
    }, opts.delay || 1000);
  }

  // ── load order: remote → local → null ───────────────────────
  async function loadInitial() {
    const remote = await fetchRemote();
    if (remote.ok && remote.state) {
      writeLocal(remote.state);
      return { source: 'remote', state: remote.state };
    }
    const local = readLocal();
    if (local) return { source: 'local', state: local };
    return { source: 'empty', state: null, reason: remote.reason };
  }

  window.AppSync = {
    APP_KEY,
    hasKey: !!APP_KEY,
    loadInitial,
    queuePush,
    pushNow: pushRemote,
    fetchRemote,
    listen(fn) {
      window.__SYNC_LISTENERS__ = window.__SYNC_LISTENERS__ || [];
      window.__SYNC_LISTENERS__.push(fn);
    },
  };
})();
