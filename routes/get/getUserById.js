import { isAuthenticated } from '../../auth.js';
import { usersById, publicUserView } from '../../state.js';

export const path = '/api/v1/users/:id';
export const middleware = [isAuthenticated];

/**
 * Retrieves the specified user by ID (the generated value). The password is only provided if the user 
 * requested is the same as the owner of the session. The other fields are accessible for any user by any 
 * user. 
 * If the caller is not authenticated, this must return HTTP 401 UNAUTHORIZED. 
 * If the user does not exist, this must return HTTP 404 NOT FOUND.
 */
export function handler(req, res) {
  const { id } = req.params;

  const user = usersById.get(id);
  if (!user) return res.status(404).send('NOT FOUND');

  return res.status(200).json(
    publicUserView(user, req.session.userId)
  );
}
