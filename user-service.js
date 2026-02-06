const port = 3100;

import express from 'express';
import base64url from 'base64url';
import uuid4 from 'uuid4';

const app = express();
app.use(express.json());

// STORAGE
/**
 * usersById: Map<string, {id, username, password, avatar}>
 * userId is deterministic (base64url(username)) at creation time and NEVER changes
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

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

const requireFields = (obj, fields) => fields.every((f) => hasOwn(obj, f) && isNonEmptyString(obj[f]));

/**
 * Returns the session ID from the request
 */
const getSessionIdFromRequest = (req) => {
  if (req.body && typeof req.body.session === 'string') return req.body.session;

  return null;
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
app.post('api/v1/users/', (req, res) => {

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
app.put('api/v1/users/:id', param('id').escape(), isAuthenticated, (req, res) => {

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
app.get('/api/v1/users/:id', param('id').escape(), isAuthenticated, (req, res) => {
  
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
app.get('/api/v1/users/?username=username', isAuthenticated, (req, res) => {

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
app.post('api/v1/login', (req, res) => {

});

app.listen(port, () => {
  console.log(`User service listening on port ${port}`);
});
