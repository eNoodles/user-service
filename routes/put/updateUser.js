import { isAuthenticated } from '../../auth.js';
import { requireFields } from '../../state.js';
import { users } from '../../mongo.js';
import { ObjectId } from 'mongodb';

export const path = '/api/v1/users/:id';
export const middleware = [isAuthenticated];

/**
 * Updates the specified user. Only the owner of the session may update itself; a user cannot update 
 * another user. 
 * If the caller's request is missing required information, this must return HTTP 400 BAD REQUEST. 
 * If the caller is not authenticated this must return HTTP 401 UNAUTHORIZED. 
 * If the caller is trying to edit another user, OR if the user requested does not exist, this must return HTTP 
 * 403 FORBIDDEN. 
 * Modifying the user’s username should NOT modify the user id!
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function handler(req, res) {
  const { id } = req.params;

  // only the owner can update itself
  if (req.session.userId !== id) return res.status(403).send('FORBIDDEN');

  if (!requireFields(req.body, ['username', 'password', 'avatar'])) {
    return res.status(400).send('BAD REQUEST');
  }

  let oid;
  try {
    oid = new ObjectId(id);
  } 
  catch (err) {
    return res.status(403).send('FORBIDDEN');
  }

  const { username, password, avatar } = req.body;

  try {
    const query = { _id: oid };
    const setCommand = { $set: { username, password, avatar } };
    const options = { upsert: false, returnDocument: 'after' };
    const doc = await users.findOneAndUpdate(query, setCommand, options);

    if (!doc) return res.status(403).send('FORBIDDEN');

    const user = {
      id: doc._id.toString(),
      username: doc.username,
      password: doc.password,
      avatar: doc.avatar
    };

    return res.status(200).json(user);
  } 
  catch (err) {
    if (err.code === 11000) // duplicate key error code
      return res.status(409).send('CONFLICT');

    console.error('Failed to update user:', err);
    return res.status(403).send('FORBIDDEN');
  }
}
