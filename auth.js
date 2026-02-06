import { sessionsById, activeSessionIdByUserId } from './state.js';

const getSessionIdFromRequest = (req) => {
  if (req.body && typeof req.body.session === 'string') return req.body.session;
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
export const isAuthenticated = (req, res, next) => {
  const sessionId = getSessionIdFromRequest(req);
  if (!sessionId) return res.status(401).send('UNAUTHORIZED');

  const session = sessionsById.get(sessionId);
  if (!session) return res.status(401).send('UNAUTHORIZED');

  // enforce only one active session per user
  const active = activeSessionIdByUserId.get(session.userId);
  if (active !== sessionId) return res.status(401).send('UNAUTHORIZED');

  req.session = session;
  next();
};
