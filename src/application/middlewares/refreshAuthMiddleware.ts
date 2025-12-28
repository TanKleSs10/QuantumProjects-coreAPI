import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { REFRESH_TOKEN_COOKIE_NAME } from "@src/shared/constants";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const refreshAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "MISSING_REFRESH_TOKEN",
        message: "Refresh token not provided",
      });
    }

    let payload;
    try {
      payload = await securityService.verifyToken<{
        id: string;
        type: "refresh";
      }>(refreshToken, "refresh");
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          code: "REFRESH_TOKEN_EXPIRED",
          message: "Refresh token has expired",
        });
      }

      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid refresh token",
      });
    }

    if (!payload || payload.type !== "refresh" || !payload.id) {
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_PAYLOAD",
        message: "Refresh token payload is invalid",
      });
    }

    req.userId = payload.id;
    return next();
  } catch (error) {
    res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized access",
    });
  }
};
