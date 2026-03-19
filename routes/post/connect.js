import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { isAuthenticated } from '../../auth.js';
import { isNonEmptyString } from '../../util.js';
import { users } from '../../mongo.js';

export const path = '/api/v1/connect';
export const middleware = [isAuthenticated];

/**
 * Returns connection information for the authenticated user.
 *
 * @param {*} req { session, game_type }
 * @param {*} res { username, avatar, game_port, token }
 */
export async function handler(req, res) {
  const gameType = req.body?.game_type;

  if (!isNonEmptyString(gameType)) return res.status(400).send('BAD REQUEST');

  let oid;
  try {
    oid = new ObjectId(req.session.userId);
  }
  catch {
    return res.status(401).send('UNAUTHORIZED');
  }

  try {
    const doc = await users.findOne({ _id: oid });
    if (!doc) return res.status(401).send('UNAUTHORIZED');

    const username = doc.username;
    const avatar = doc.avatar;
    const gamePort = Number.parseInt(process.env.GAME_PORT, 10) || 4200;
    const sharedSecret = process.env.SHARED_SECRET ?? '';

    const plaintextToken = username + avatar + gameType + sharedSecret;
    const token = crypto.createHash('sha256').update(plaintextToken).digest('base64');

    return res.status(200).json({
      username,
      avatar,
      game_port: gamePort,
      token
    });
  } catch (err) {
    console.error('Failed to connect:', err);
    return res.status(500).send('INTERNAL SERVER ERROR');
  }
}