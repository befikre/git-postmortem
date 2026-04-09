const cache = new Map();

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function set(key, value, ttl = 60000) {
  cache.set(key, {
    value,
    expires: Date.now() + ttl,
  });
}

module.exports = { get, set };
