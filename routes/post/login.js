import uuid4 from 'uuid4';
import { activeSessionIdByUserId, sessionsById, usersById, userIdByUsername, requireFields } from '../../state.js';

export const path = '/api/v1/login';

/**
 * Creates a session for the user provided, if the user exists and the password matches. Only one session 
 * may be active per user -- if the user logs in again, the old session must become invalid. 
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export function handler(req, res) {
  if (!requireFields(req.body, ['username', 'password'])) {
    return res.status(400).send('BAD REQUEST');
  }
  
  const { username, password } = req.body;

  const userId = userIdByUsername.get(username);
  if (!userId) return res.status(400).send('BAD REQUEST');

  const user = usersById.get(userId);
  if (!user) return res.status(400).send('BAD REQUEST');

  if (user.password !== password) return res.status(403).send('FORBIDDEN');

  // invalidate old session for this user (only one active session per user)
  const oldSessionId = activeSessionIdByUserId.get(userId);
  if (oldSessionId) sessionsById.delete(oldSessionId);

  const sessionId = uuid4(); // generate new session id
  sessionsById.set(sessionId, { sessionId, userId });
  activeSessionIdByUserId.set(userId, sessionId);

  return res.status(200).json({ 
    session: sessionId 
  });
}
