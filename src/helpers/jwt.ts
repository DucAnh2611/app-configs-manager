import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export const signJwt = <T extends JwtPayload>(
  payload: T,
  secret: string,
  options?: SignOptions
): string => {
  const mergedOptions: SignOptions = { algorithm: 'HS256', ...options };
  return jwt.sign(payload, secret, mergedOptions);
};

export const verifyJwt = <T extends JwtPayload>(token: string, secret: string): T | null => {
  try {
    return jwt.verify(token, secret) as T;
  } catch {
    return null;
  }
};

export const decodeJwt = <T extends JwtPayload>(token: string): T | null => {
  try {
    return jwt.decode(token) as T;
  } catch {
    return null;
  }
};
