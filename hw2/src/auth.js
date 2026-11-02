import crypto from 'node:crypto';
import { SESSION_TTL_MS } from './config.js';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, passwordHash };
}

export function verifyPassword(password, salt, passwordHash) {
  try {
    const expected = Buffer.from(passwordHash, 'hex');
    const actual = crypto.scryptSync(password, salt, 64);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function secureEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') {
    return false;
  }
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function createSessionStore({ ttlMs = SESSION_TTL_MS } = {}) {
  const sessions = new Map();

  function cleanup() {
    const now = Date.now();
    for (const [token, session] of sessions) {
      if (session.expiresAt <= now) {
        sessions.delete(token);
      }
    }
  }

  return {
    create(userId) {
      cleanup();
      const token = crypto.randomBytes(32).toString('hex');
      const csrf = crypto.randomBytes(24).toString('hex');
      const now = Date.now();
      const session = {
        userId,
        csrf,
        createdAt: now,
        expiresAt: now + ttlMs,
      };
      sessions.set(token, session);
      return { token, session };
    },
    get(token) {
      if (!token) return null;
      const session = sessions.get(token);
      if (!session) return null;
      if (session.expiresAt <= Date.now()) {
        sessions.delete(token);
        return null;
      }
      return session;
    },
    destroy(token) {
      if (token) sessions.delete(token);
    },
    destroyUser(userId) {
      for (const [token, session] of sessions) {
        if (session.userId === userId) {
          sessions.delete(token);
        }
      }
    },
    get size() {
      return sessions.size;
    },
  };
}
