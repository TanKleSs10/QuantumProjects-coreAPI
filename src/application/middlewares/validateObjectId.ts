import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

export const validateObjectIdParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const value = req.params?.[paramName];
    if (!value || !Types.ObjectId.isValid(value)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
      });
    }
    return next();
  };
};
