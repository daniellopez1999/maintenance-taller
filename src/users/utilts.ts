import * as crypto from 'crypto';
import { envs } from 'src/config';

const key = crypto
  .createHash('sha256')
  .update(String(envs.SECRET_KEY))
  .digest('base64')
  .substr(0, 32);

export function encryptToken(token: any): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encryptedToken = cipher.update(token, 'utf8', 'hex');
  encryptedToken += cipher.final('hex');
  return iv.toString('hex') + ':' + encryptedToken;
}

export function decryptToken(token: any): string {
  const textParts = token.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decryptedToken = decipher.update(encryptedText, 'hex', 'utf8');
  decryptedToken += decipher.final('utf8');
  return decryptedToken;
}
