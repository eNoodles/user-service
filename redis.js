import redis from 'redis';

export const redisClient = redis.createClient({ url: `redis://:${process.env.REDIS_PASS}@127.0.0.1:6379` });
export const SESSION_EXPIRES_SEC = parseInt(process.env.SESSION_EXPIRES_SEC) || 10;

try {
  await redisClient.connect();
} 
catch (error) {
  console.error('Failed to connect to redis:', error.message);
  console.error('(is redis running?)');
  process.exit(1);
}