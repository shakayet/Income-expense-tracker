/* eslint-disable @typescript-eslint/no-explicit-any */
// middleware/rawBody.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.setEncoding('utf8');
  
  let data = '';
  req.on('data', (chunk) => {
    data += chunk;
  });
  
  req.on('end', () => {
    (req as any).rawBody = data;
    next();
  });
};