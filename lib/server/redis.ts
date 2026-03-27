import Redis from 'ioredis'

const redis = new Redis(`redis://${process.env.REDIS_DB_ADDRESS}:${process.env.REDIS_DB_PORT}`|| 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

export default redis;
