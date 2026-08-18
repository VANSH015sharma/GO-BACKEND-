class IdempotencyStore {
  constructor() {
    this.records = new Map();
  }

  get(userId, key) {
    const value = this.records.get(`${userId}:${key}`);
    if (!value) return null;
    if (value.expiresAt < Date.now()) {
      this.records.delete(`${userId}:${key}`);
      return null;
    }
    return value.payload;
  }

  set(userId, key, payload, ttlMs = 10 * 60 * 1000) {
    this.records.set(`${userId}:${key}`, {
      payload,
      expiresAt: Date.now() + ttlMs,
    });
  }
}

export const idempotencyStore = new IdempotencyStore();
