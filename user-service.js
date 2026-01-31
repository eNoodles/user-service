const port = 3100;

import express from 'express';

const app = express();
app.use(express.json());

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const isAuthenticated = (req, res, next) => {
  if (req.session) {
    // session is valid
    next();
  } 
  else {
    // non-authenticated
    res.status(401).send("UNAUTHORIZED");
  }
};

// Example of protecting a route
app.get('/profile', isAuthenticated, (req, res) => {
  res.send(`Welcome user ${req.session.userId}`);
});

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
