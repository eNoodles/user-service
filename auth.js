import { redisClient, REDIS_PREFIX } from './redis.js';

const getSessionIdFromRequest = (req) => {
  if (req.body && typeof req.body.session === 'string') return req.body.session;
  if (req.query && typeof req.query.session === 'string') return req.query.session;
  return null;
};

/**
 * Authentication middleware:
 * - 401 if no session id
 * - 401 if session doesn't exist
 * - 401 if session isn't the active one for that user
 * - attaches req.session = { sessionId, userId }
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
export const isAuthenticated = async (req, res, next) => {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) return res.status(401).send('UNAUTHORIZED');

  try {
    // sessions:<sessionId> -> userId
    const userId = await redisClient.get(`${REDIS_PREFIX}:sessions:${sessionId}`);
    if (!userId) return res.status(401).send('UNAUTHORIZED');

    // userSessions:<userId> -> active sessionId
    const activeSessionId = await redisClient.get(`${REDIS_PREFIX}:userSessions:${userId}`);
    if (activeSessionId !== sessionId) return res.status(401).send('UNAUTHORIZED');

    req.session = { sessionId, userId };
    next();
  } 
  catch (err) {
    console.error('Authorization error:', err);
    return res.status(500).send('INTERNAL SERVER ERROR');
  }
};
