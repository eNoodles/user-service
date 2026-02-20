import { isAuthenticated } from '../../auth.js';
import { isNonEmptyString, publicUserView } from '../../state.js';
import { users } from '../../mongo.js';

export const path = '/api/v1/users/';
export const middleware = [isAuthenticated];

/**
 * Retrieves the specified user, searching by username. The password is only provided if the user 
 * requested is the same as the owner of the session. The other fields are accessible for any user by any 
 * user. 
 * Note that the username in question is passed on a query string, not in the request body.
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export async function handler(req, res) {
  const username = req.query?.username;

  if (!isNonEmptyString(username)) return res.status(400).send('BAD REQUEST');

  try {
    const doc = await users.findOne({ username });
    if (!doc) return res.status(404).send('NOT FOUND');

    const user = {
      id: doc._id.toString(),
      username: doc.username,
      password: doc.password,
      avatar: doc.avatar
    };

    return res.status(200).json(
      publicUserView(user, req.session.userId)
    );
  } 
  catch (err) {
    console.error('Failed to find user by name:', err);
    return res.status(500).send('INTERNAL SERVER ERROR');
  }
}
