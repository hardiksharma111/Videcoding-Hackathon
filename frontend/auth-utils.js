(function initAuthUtils(globalScope) {
  const USERS_KEY = 'vibehack-users-v1';
  const SESSION_KEY = 'vibehack-session-v1';

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

  function validateEmail(email) {
    const normalized = String(email || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  }

  function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
  }

  function signup(payload) {
    const name = String(payload?.name || '').trim();
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '');

    if (!name) {
      return { ok: false, error: 'Name is required.' };
    }
    if (!validateEmail(email)) {
      return { ok: false, error: 'Valid email is required.' };
    }
    if (!validatePassword(password)) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }

    const users = readUsers();
    if (users.some((user) => user.email === email)) {
      return { ok: false, error: 'Account already exists for this email.' };
    }

    users.push({
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    });
    writeUsers(users);

    const session = {
      name,
      email,
      authType: 'account',
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function login(payload) {
    const email = String(payload?.email || '').trim().toLowerCase();
    const password = String(payload?.password || '');

    if (!validateEmail(email)) {
      return { ok: false, error: 'Enter a valid email.' };
    }

    const users = readUsers();
    const user = users.find((entry) => entry.email === email && entry.password === password);
    if (!user) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const session = {
      name: user.name,
      email: user.email,
      authType: 'account',
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  }

  function loginAsGuest() {
    const id = Math.floor(Math.random() * 90000) + 10000;
    const session = {
      name: `Guest${id}`,
      email: `guest${id}@local.vibehack`,
      authType: 'guest',
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
    validateEmail,
    validatePassword,
    signup,
    login,
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
