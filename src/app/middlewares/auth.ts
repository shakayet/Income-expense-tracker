import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;

      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        // verify token
        const verifyUser = jwtHelper.verifyToken(
          token,
          config.jwt.jwt_secret as Secret
        );

        // Normalize payload: jwt.verify can return string | JwtPayload
        const payload = verifyUser as unknown as {
          id?: string;
          eamil: string;
          name: string;
          _id?: string;
          role?: string;
        };

        // set user to request (only keep id for request.user as defined in global.d.ts)
        // req.user = { id: payload.id ?? payload._id };
        req.user = payload;
        if (roles.length && payload.role && !roles.includes(payload.role)) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this api"
          );
        }

        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
