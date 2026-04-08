import { describe, it, expect, beforeEach } from 'vitest';

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

globalThis.localStorage = new LocalStorageMock();
await import('../auth-utils.js');
const AuthUtils = globalThis.AuthUtils;

describe('AuthUtils', () => {
  beforeEach(() => {
    localStorage.clear();
    AuthUtils._resetForTests();
  });

  it('validates email format', () => {
    expect(AuthUtils.validateEmail('test@example.com')).toBe(true);
    expect(AuthUtils.validateEmail('bad-email')).toBe(false);
  });

  it('rejects signup when password is too short', () => {
    const result = AuthUtils.signup({
      name: 'Demo',
      email: 'demo@example.com',
      password: '123',
    });

    expect(result.ok).toBe(false);
    expect(result.error).toContain('at least 8');
  });

  it('creates account and session on signup', () => {
    const result = AuthUtils.signup({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
    });

    expect(result.ok).toBe(true);
    expect(AuthUtils.getSession().email).toBe('demo@example.com');
  });

  it('logs in with existing account credentials', () => {
    AuthUtils.signup({
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
    });
    AuthUtils.logout();

    const login = AuthUtils.login({
      email: 'demo@example.com',
      password: 'password123',
    });

    expect(login.ok).toBe(true);
    expect(AuthUtils.getSession().name).toBe('Demo User');
  });

  it('creates guest session', () => {
    const guest = AuthUtils.loginAsGuest();

    expect(guest.authType).toBe('guest');
    expect(AuthUtils.getSession().authType).toBe('guest');
  });
});
