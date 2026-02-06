import { isAuthenticated } from '../../auth.js';
import { usersById, userIdByUsername, isNonEmptyString, publicUserView } from '../../state.js';

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
export function handler(req, res) {
  const username = req.query?.username;

  if (!isNonEmptyString(username)) return res.status(400).send('BAD REQUEST');

  const id = userIdByUsername.get(username);
  if (!id) return res.status(404).send('NOT FOUND');

  const user = usersById.get(id);
  if (!user) return res.status(404).send('NOT FOUND');

  return res.status(200).json(
    publicUserView(user, req.session.userId)
  );
}
