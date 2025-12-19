import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'crypto';

const encodingStyle = 'hex';
const HMAC_LENGTH = 32; // SHA-256
const HKDF_SALT = Buffer.from('aes-ctr-iv');
const HKDF_INFO = Buffer.from('v1');
const CIPHER_ALGORITHM = 'aes-256-ctr';
const HMAC_ALGORITHM = 'sha256';

export const generateBytes = (length: number, prefix?: string) => {
  return `${prefix ? `${prefix}_` : ''}${randomBytes(length).toString(encodingStyle)}`;
};

export const hash = (
  data: string,
  { salt, length }: Partial<{ length: number; salt: string }> = {}
) => {
  let saltFinal = salt;
  if (!saltFinal) {
    saltFinal = generateBytes(length ?? 32);
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

function normalizeKey(secretKey: string, purpose: string) {
  return createHash(HMAC_ALGORITHM)
    .update(secretKey + purpose)
    .digest();
}

function hkdfSha256(
  ikm: Buffer,
  length: number,
  salt = Buffer.alloc(0),
  info = Buffer.alloc(0)
): Buffer {
  const prk = createHmac(HMAC_ALGORITHM, salt).update(ikm).digest();

  let t = Buffer.alloc(0);
  let okm = Buffer.alloc(0);
  let counter = 0;

  while (okm.length < length) {
    counter++;
    t = createHmac(HMAC_ALGORITHM, prk)
      .update(Buffer.concat([t, info, Buffer.from([counter])]))
      .digest();
    okm = Buffer.concat([okm, t]);
  }

  return okm.subarray(0, length);
}

export function encrypt(
  jsonData: Record<string, any> | string | number,
  secretKey: string,
  bytes: number
) {
  const rawIv = randomBytes(bytes);

  const iv = hkdfSha256(rawIv, 16, HKDF_SALT, HKDF_INFO);

  const encKey = normalizeKey(secretKey, 'enc');
  const macKey = normalizeKey(secretKey, 'mac');

  const cipher = createCipheriv(CIPHER_ALGORITHM, encKey, iv);
  const plaintext = JSON.stringify(jsonData);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);

  const hmac = createHmac(HMAC_ALGORITHM, macKey)
    .update(Buffer.concat([rawIv, ciphertext]))
    .digest();

  if (hmac.length !== HMAC_LENGTH) {
    throw new Error(`HMAC length mismatch during encryption: ${hmac.length} !== ${HMAC_LENGTH}`);
  }

  const payload = Buffer.concat([Buffer.from([rawIv.length]), rawIv, ciphertext, hmac]);

  return {
    encryptedPayload: payload.toString('base64'),
  };
}

export function decrypt<T>(encryptedPayload: string, secretKey: string): T {
  const data = Buffer.from(encryptedPayload, 'base64');
  const ivLen = data.readUInt8(0);
  const hmacStart = data.length - HMAC_LENGTH;

  const rawIv = data.subarray(1, 1 + ivLen);
  const ciphertext = data.subarray(1 + ivLen, hmacStart);
  const hmac = data.subarray(hmacStart);

  const iv = hkdfSha256(rawIv, 16, HKDF_SALT, HKDF_INFO);
  const encKey = normalizeKey(secretKey, 'enc');
  const macKey = normalizeKey(secretKey, 'mac');

  const expectedHmac = createHmac(HMAC_ALGORITHM, macKey)
    .update(Buffer.concat([rawIv, ciphertext]))
    .digest();

  if (!timingSafeEqual(hmac, expectedHmac)) {
    throw new Error('Authentication failed - HMAC mismatch');
  }

  const decipher = createDecipheriv(CIPHER_ALGORITHM, encKey, iv);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  return JSON.parse(plaintext.toString('utf8')) as T;
}
