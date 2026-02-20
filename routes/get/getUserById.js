import { isAuthenticated } from '../../auth.js';
import { publicUserView } from '../../state.js';
import { users } from '../../mongo.js';
import { ObjectId } from 'mongodb';

export const path = '/api/v1/users/:id';
export const middleware = [isAuthenticated];

/**
 * Retrieves the specified user by ID (the generated value). The password is only provided if the user 
 * requested is the same as the owner of the session. The other fields are accessible for any user by any 
 * user. 
 * If the caller is not authenticated, this must return HTTP 401 UNAUTHORIZED. 
 * If the user does not exist, this must return HTTP 404 NOT FOUND.
 */
export async function handler(req, res) {
  const { id } = req.params;

  let oid;
  try {
    oid = new ObjectId(id);
  } 
  catch (err) {
    return res.status(404).send('NOT FOUND');
  }

  try {
    const doc = await users.findOne({ _id: oid });
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
    console.error('Failed to get user by id:', err);
    return res.status(500).send('INTERNAL SERVER ERROR');
  }
}
