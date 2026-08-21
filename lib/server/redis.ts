import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

// ioredis emits an 'error' event on every connection failure — with no
// listener attached, Node treats that as an unhandled error. Log instead of
// letting Redis being unreachable take the process down.
redis.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

export default redis;
