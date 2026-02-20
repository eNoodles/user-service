import uuid4 from 'uuid4';
import { requireFields } from '../../util.js';
import { users } from '../../mongo.js';
import { redisClient, SESSION_EXPIRES_SEC } from '../../redis.js';

export const path = '/api/v1/login';

/**
 * Creates a session for the user provided, if the user exists and the password matches. Only one session 
 * may be active per user -- if the user logs in again, the old session must become invalid. 
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function handler(req, res) {
  if (!requireFields(req.body, ['username', 'password'])) {
    return res.status(400).send('BAD REQUEST');
  }
  
  const { username, password } = req.body;

  let doc;
  try {
    doc = await users.findOne({ username });
    if (!doc) return res.status(400).send('BAD REQUEST');
    if (doc.password !== password) return res.status(403).send('FORBIDDEN');
  } 
  catch (err) {
    console.error('Failed to find user by name:', err);
    return res.status(500).send('INTERNAL SERVER ERROR');
  }
  
  const userId = doc._id.toString();

  // invalidate old session for this user (only one active session per user)
  const oldSessionId = await redisClient.get(`userSessions:${userId}`);
  if (oldSessionId) await redisClient.del(`sessions:${oldSessionId}`);

  const sessionId = uuid4(); // generate new session id

  await redisClient.set(`sessions:${sessionId}`, userId);
  await redisClient.set(`userSessions:${userId}`, sessionId);

  await redisClient.expire(`sessions:${sessionId}`, SESSION_EXPIRES_SEC);
  await redisClient.expire(`userSessions:${userId}`, SESSION_EXPIRES_SEC);

  return res.status(200).json({ 
    session: sessionId 
  });
}
