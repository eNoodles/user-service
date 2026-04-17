import redis from 'redis';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

export const REDIS_PREFIX = process.env.REDIS_PREFIX || 'default';
export const SESSION_EXPIRES_SEC = parseInt(process.env.SESSION_EXPIRES_SEC) || 10;
export const redisClient = redis.createClient({ url: `redis://:${process.env.REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}` });

try {
  await redisClient.connect();
} 
catch (error) {
  console.error('Failed to connect to redis:', error.message);
  console.error('(is redis running?)');
  process.exit(1);
}