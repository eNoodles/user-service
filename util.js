export const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);

export const isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;

export const requireFields = (obj, fields) => fields.every((f) => hasOwn(obj, f) && isNonEmptyString(obj[f]));

/**
 * Returns a user object for API response
 * Includes the password only if the requester is the same user
 * 
 * @param {*} user 
 * @param {*} requesterUserId 
 * @returns 
 */
export const publicUserView = (user, requesterUserId) => {
  const base = { 
    id: user.id, 
    username: user.username, 
    avatar: user.avatar 
  };
  if (requesterUserId === user.id) base.password = user.password;

  return base;
};
