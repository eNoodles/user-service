import { requireFields } from '../../state.js';
import { users } from '../../mongo.js';

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
export async function handler(req, res) {
  if (!requireFields(req.body, ['username', 'password', 'avatar'])) {
    return res.status(400).send('BAD REQUEST');
  }

  const { username, password, avatar } = req.body;
  
  try {
    const result = await users.insertOne({ username, password, avatar });
    const id = result.insertedId.toString();
    const user = { id, username, password, avatar };

    return res.status(200).json(user);
  } 
  catch (err) {
    if (err.code === 11000) // duplicate key error code
      return res.status(409).send('CONFLICT');

    console.error('Failed to create user:', err);
    return res.status(500).send('INTERNAL SERVER ERROR');
  }
}
