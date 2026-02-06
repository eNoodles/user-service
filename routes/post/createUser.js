import base64url from 'base64url';
import { usersById, userIdByUsername, requireFields } from '../../state.js';

export const path = '/api/v1/users/';

/**
 * Creates a new user, succeeding if that user did not already exist. 
 * If the request is missing required elements, this must return HTTP 400 BAD REQUEST. 
 * If the username is already in use, this must return HTTP 409 CONFLICT. 
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export function handler(req, res) {
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
}
