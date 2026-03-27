import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL|| `redis://${process.env.REDIS_DB_ADDRESS}:${process.env.REDIS_DB_PORT}`, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

export default redis;
