import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const createToken = (payload: object, secret: Secret, expireTime: string) => {
  return jwt.sign(payload, secret, { expiresIn: expireTime } as SignOptions);
};

const verifyToken = (token: string, secret: Secret): JwtPayload | string => {
  return jwt.verify(token, secret);
};

export const jwtHelper = { createToken, verifyToken };