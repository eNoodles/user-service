import { isAuthenticated } from '../../auth.js';
import { usersById, userIdByUsername, requireFields } from '../../state.js';

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
export function handler(req, res) {
  const { id } = req.params;

  const user = usersById.get(id);
  if (!user) return res.status(403).send('FORBIDDEN');

  // only the owner can update itself
  if (req.session.userId !== id) return res.status(403).send('FORBIDDEN');

  if (!requireFields(req.body, ['username', 'password', 'avatar'])) {
    return res.status(400).send('BAD REQUEST');
  }
  
  const newUsername = req.body.username;
  const newPassword = req.body.password;
  const newAvatar = req.body.avatar;

  // if changing username, check if it is not already in use
  if (newUsername !== user.username) {
    const existingId = userIdByUsername.get(newUsername);
    if (existingId && existingId !== id) return res.status(409).send('CONFLICT');

    // update username index
    userIdByUsername.delete(user.username);
    userIdByUsername.set(newUsername, id);

    user.username = newUsername;
  }

  user.password = newPassword;
  user.avatar = newAvatar;

  // user id remains unchanged
  return res.status(200).json({ 
    id: user.id, 
    username: user.username, 
    password: user.password, 
    avatar: user.avatar 
  });
}
