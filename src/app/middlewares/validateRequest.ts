import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

const validateRequest = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only validating req.body, no wrapping inside { body: req.body }
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errorMessages: error.errors?.map((err: any) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
  }
};

export default validateRequest;
