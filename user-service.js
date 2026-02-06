const port = 3100;

import express from 'express';
import base64url from 'base64url';
import uuid4 from 'uuid4';

const app = express();
app.use(express.json());

// STORAGE
/**
 * usersById: Map<string, {id, username, password, avatar}>
 * userId is deterministic at creation time and NEVER changes
 */
const usersById = new Map();
/** username -> userId (changes if username is updated) */
const userIdByUsername = new Map();

/** sessionId -> { sessionId, userId } */
const sessionsById = new Map();
/** userId -> sessionId (used to enforce one active session per user) */
const activeSessionIdByUserId = new Map();


// HELPERS
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);

const isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;

const requireFields = (obj, fields) => fields.every((f) => hasOwn(obj, f) && isNonEmptyString(obj[f]));

/**
 * Returns the session ID from the request
 */
const getSessionIdFromRequest = (req) => {
  if (req.body && typeof req.body.session === 'string') return req.body.session;

  return null;
};

/**
 * Format JSON response for a user, including the password only if the requester is the same as the user.
 * @param {*} user 
 * @param {*} requesterUserId 
 * @returns 
 */
const publicUserView = (user, requesterUserId) => {
  const base = { id: user.id, username: user.username, avatar: user.avatar };
  if (requesterUserId === user.id) return { ...base, password: user.password };
  return base;
};

/**
 * Authentication middleware
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const isAuthenticated = (req, res, next) => {
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

// ROUTES

/**
 * Create User
 * 
 * request body:
 * - username
 * - password
 * - avatar
 * 
 * response body:
 * - id
 * - username
 * - password
 * - avatar
 * 
 * Creates a new user, succeeding if that user did not already exist. 
 * If the request is missing required elements, this must return HTTP 400 BAD REQUEST. 
 * If the username is already in use, this must return HTTP 409 CONFLICT. 
 */
app.post('/api/v1/users/', (req, res) => {
  if (!requireFields(req.body, ['username', 'password', 'avatar'])) {
    return res.status(400).send('BAD REQUEST');
  }

  const { username, password, avatar } = req.body;

  if (userIdByUsername.has(username)) {
    return res.status(409).send('CONFLICT');
  }

  const id = base64url.encode(username); // deterministic
  const user = { id, username, password, avatar };

  usersById.set(id, user);
  userIdByUsername.set(username, id);

  return res.status(200).json(user);
});

/**
 * Update User
 * 
 * request body:
 * - username
 * - password
 * - avatar
 * 
 * response body:
 * - id
 * - username
 * - password
 * - avatar
 * 
 * Updates the specified user. Only the owner of the session may update itself; a user cannot update 
 * another user. 
 * If the caller's request is missing required information, this must return HTTP 400 BAD REQUEST. 
 * If the caller is not authenticated this must return HTTP 401 UNAUTHORIZED. 
 * If the caller is trying to edit another user, OR if the user requested does not exist, this must return HTTP 
 * 403 FORBIDDEN. 
 * Modifying the user’s username should NOT modify the user id!
 */
app.put('/api/v1/users/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;

  const user = usersById.get(id);
  if (!user) return res.status(403).send('FORBIDDEN');

  // Only the owner can update itself
  if (req.session.userId !== id) return res.status(403).send('FORBIDDEN');

  if (!requireFields(req.body, ['username', 'password', 'avatar'])) {
    return res.status(400).send('BAD REQUEST');
  }

  const { username: newUsername, password: newPassword, avatar: newAvatar } = req.body;

  // If changing username, it must not collide with another user's username.
  if (newUsername !== user.username) {
    const existingId = userIdByUsername.get(newUsername);
    if (existingId && existingId !== id) {
      return res.status(409).send('CONFLICT');
    }

    // Update username index
    userIdByUsername.delete(user.username);
    userIdByUsername.set(newUsername, id);

    user.username = newUsername;
  }

  user.password = newPassword;
  user.avatar = newAvatar;

  // user id remains unchanged.
  return res.status(200).json({ id: user.id, username: user.username, password: user.password, avatar: user.avatar });
});

/**
 * Get User
 * 
 * request body: none
 * 
 * response body:
 * - id
 * - username
 * - password (only if the user is the same as the owner of the session)
 * - avatar
 * 
 * Retrieves the specified user by ID (the generated value). The password is only provided if the user 
 * requested is the same as the owner of the session. The other fields are accessible for any user by any 
 * user. 
 * If the caller is not authenticated, this must return HTTP 401 UNAUTHORIZED. 
 * If the user does not exist, this must return HTTP 404 NOT FOUND.
 */
app.get('/api/v1/users/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;

  const user = usersById.get(id);
  if (!user) return res.status(404).send('NOT FOUND');

  return res.status(200).json(publicUserView(user, req.session.userId));
});

/**
 * Find User by Name
 * 
 * request body: none
 * 
 * response body:
 * - id
 * - username
 * - password (only if the user is the same as the owner of the session)
 * - avatar
 * 
 * Retrieves the specified user, searching by username. The password is only provided if the user 
 * requested is the same as the owner of the session. The other fields are accessible for any user by any 
 * user. 
 * Note that the username in question is passed on a query string, not in the request body.
 */
app.get('/api/v1/users/', isAuthenticated, (req, res) => {
  const username = req.query?.username;

  if (!isNonEmptyString(username)) {
    return res.status(400).send('BAD REQUEST');
  }

  const id = userIdByUsername.get(username);
  if (!id) return res.status(404).send('NOT FOUND');

  const user = usersById.get(id);
  if (!user) return res.status(404).send('NOT FOUND');

  return res.status(200).json(publicUserView(user, req.session.userId));
});

/**
 * Login
 * 
 * request body:
 * - username
 * - password
 * 
 * response body:
 * - session (id)
 * 
 * Creates a session for the user provided, if the user exists and the password matches. Only one session 
 * may be active per user -- if the user logs in again, the old session must become invalid. 
 */
app.post('/api/v1/login', (req, res) => {
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
  if (oldSessionId) {
    sessionsById.delete(oldSessionId);
  }

  const sessionId = uuid4();
  sessionsById.set(sessionId, { sessionId, userId });
  activeSessionIdByUserId.set(userId, sessionId);

  return res.status(200).json({ session: sessionId });
});

app.use((req, res) => {
  console.log(`UNMATCHED: ${req.method} ${req.path}`);
  res.status(404).send('NOT FOUND');
});

app.listen(port, () => {
  console.log(`User service listening on port ${port}`);
});

