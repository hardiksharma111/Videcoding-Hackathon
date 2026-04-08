(function initAuthUtils(globalScope) {
  const USERS_KEY = 'vibehack-users-v1';
  const SESSION_KEY = 'vibehack-session-v1';

  function getApiBase() {
    const fromWindow = String(globalScope.VIBEHACK_API_BASE || '').trim();
    const fromStorage = String(localStorage.getItem('vibehack-api-base') || '').trim();
    const base = fromWindow || fromStorage || '';
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }

  function setApiBase(value) {
    const normalized = String(value || '').trim();
    localStorage.setItem('vibehack-api-base', normalized);
    return normalized;
  }

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return fallback;
    }
  }

  function readUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? safeJsonParse(raw, []) : [];
    return Array.isArray(users) ? users : [];
  }

  function writeUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function validateUsername(username) {
    const normalized = String(username || '').trim();
    return /^[a-zA-Z0-9_]{3,24}$/.test(normalized);
  }

  function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
  }

  function signup(payload) {
    const username = String(payload?.username || '').trim();
    const password = String(payload?.password || '');

    if (!validateUsername(username)) {
      return { ok: false, error: 'Username must be 3-24 chars (letters, numbers, underscore).' };
    }
    if (!validatePassword(password)) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }

    const users = readUsers();
    if (users.some((user) => user.username === username)) {
      return { ok: false, error: 'Account already exists for this username.' };
    }

    users.push({
      username,
      password,
      createdAt: new Date().toISOString(),
    });
    writeUsers(users);

    const session = {
      name: username,
      username,
      authType: 'account',
      authSource: 'local',
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  async function signupRemote(payload) {
    const response = await fetch(`${getApiBase()}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: payload.username, password: payload.password }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body.detail || 'Registration failed.' };
    }

    const session = {
      name: payload.username,
      username: payload.username,
      authType: 'account',
      authSource: 'backend',
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  async function signupWithFallback(payload) {
    const apiBase = getApiBase();
    try {
      const remote = await signupRemote(payload);
      if (remote.ok) {
        return remote;
      }
      if (apiBase) {
        return remote;
      }
      return signup(payload);
    } catch (_error) {
      if (apiBase) {
        return { ok: false, error: 'Backend unreachable. Check VIBEHACK_API_BASE.' };
      }
      return signup(payload);
    }
  }

  function login(payload) {
    const username = String(payload?.username || '').trim();
    const password = String(payload?.password || '');

    if (!validateUsername(username)) {
      return { ok: false, error: 'Enter a valid username.' };
    }

    const users = readUsers();
    const user = users.find((entry) => entry.username === username && entry.password === password);
    if (!user) {
      return { ok: false, error: 'Invalid username or password.' };
    }

    const session = {
      name: user.name || user.username,
      username: user.username,
      authType: 'account',
      authSource: 'local',
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  async function loginRemote(payload) {
    const form = new URLSearchParams();
    form.set('username', String(payload.username || '').trim());
    form.set('password', String(payload.password || ''));

    const response = await fetch(`${getApiBase()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { ok: false, error: body.detail || 'Invalid username or password.' };
    }

    const session = {
      name: String(payload.username || 'User'),
      username: String(payload.username || '').trim(),
      authType: 'account',
      authSource: 'backend',
      token: (await response.json()).access_token,
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  async function loginWithFallback(payload) {
    const apiBase = getApiBase();
    try {
      const remote = await loginRemote(payload);
      if (remote.ok) {
        return remote;
      }
      if (apiBase) {
        return remote;
      }
      return login(payload);
    } catch (_error) {
      if (apiBase) {
        return { ok: false, error: 'Backend unreachable. Check VIBEHACK_API_BASE.' };
      }
      return login(payload);
    }
  }

  function loginAsGuest() {
    const id = Math.floor(Math.random() * 90000) + 10000;
    const session = {
      name: `Guest${id}`,
      username: `guest_${id}`,
      authType: 'guest',
      authSource: 'local',
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? safeJsonParse(raw, null) : null;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function _resetForTests() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  const api = {
    validateUsername,
    validatePassword,
    getApiBase,
    setApiBase,
    signup,
    signupRemote,
    signupWithFallback,
    login,
    loginRemote,
    loginWithFallback,
    loginAsGuest,
    getSession,
    logout,
    _resetForTests,
  };

  globalScope.AuthUtils = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
