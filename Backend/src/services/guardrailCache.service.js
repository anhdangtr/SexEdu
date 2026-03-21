const DEFAULT_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_SIZE = 500;

const cache = new Map();

const evictExpiredEntries = () => {
  const now = Date.now();

  for (const [key, value] of cache.entries()) {
    if (value.expiresAt <= now) {
      cache.delete(key);
    }
  }
};

const evictOldestEntry = () => {
  const oldestKey = cache.keys().next().value;
  if (oldestKey) {
    cache.delete(oldestKey);
  }
};

export const getGuardrailCache = (key) => {
  evictExpiredEntries();
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  return entry.value;
};

export const setGuardrailCache = (key, value, ttlMs = DEFAULT_TTL_MS) => {
  evictExpiredEntries();

  if (cache.size >= MAX_CACHE_SIZE) {
    evictOldestEntry();
  }

  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};
