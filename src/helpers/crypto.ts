import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto';

const encodingStyle = 'hex';

export const generateBytes = (length: number, prefix?: string) => {
  return `${prefix ? `${prefix}_` : ''}${randomBytes(length).toString(encodingStyle)}`;
};

export const hash = (data: string, length: number, salt?: string) => {
  let saltFinal = salt;
  if (!saltFinal) {
    saltFinal = randomBytes(length).toString(encodingStyle);
  }

  const hashed = scryptSync(data, saltFinal, 64).toString(encodingStyle);
  return `${saltFinal}:${hashed}`;
};

export const verify = (data: string, storedHash: string) => {
  const [salt, key] = storedHash.split(':');

  const hashedBuffer = Buffer.from(
    scryptSync(data, salt, 64).toString(encodingStyle),
    encodingStyle
  );
  const keyBuffer = Buffer.from(key, encodingStyle);

  return timingSafeEqual(hashedBuffer, keyBuffer);
};

function normalizeKey(secretKey: string) {
  return createHash('sha256').update(secretKey).digest();
}

export function encrypt(jsonData: Record<string, any>, secretKey: string, bytes: number) {
  const iv = randomBytes(bytes);
  const key = normalizeKey(secretKey);
  const cipher = createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(JSON.stringify(jsonData)), cipher.final()]);

  const tag = cipher.getAuthTag();

  return {
    encryptedPayload: Buffer.concat([iv, tag, encrypted]).toString('base64'),
  };
}

export function decrypt(encryptedPayload: string, secretKey: string, bytes: number) {
  const data = Buffer.from(encryptedPayload, 'base64');
  const tagLength = 16;

  const iv = data.slice(0, bytes);
  const tag = data.slice(bytes, bytes + tagLength);
  const ciphertext = data.slice(bytes + tagLength);
  const key = normalizeKey(secretKey);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return JSON.parse(decrypted.toString());
}
