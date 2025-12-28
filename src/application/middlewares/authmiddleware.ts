import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        success: false,
        code: "MISSING_AUTH_HEADER",
        message: "Missing Authorization header",
      });
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        code: "INVALID_AUTH_FORMAT",
        message: "Invalid Authorization format",
      });
    }

    let payload;

    try {
      // Intentamos verificar el token vía tu servicio
      payload = await securityService.verifyToken<{
        id: string;
        type: "access";
      }>(token, "access");
    } catch (err) {
      // Si fue un error propio de expiración JWT
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          code: "TOKEN_EXPIRED",
          message: "Access token expired",
        });
      }

      // Cualquier otro error → token inválido
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid or malformed token",
      });
    }

    if (!payload || payload.type !== "access" || !payload.id) {
      return res.status(401).json({
        success: false,
        code: "INVALID_PAYLOAD",
        message: "Token payload invalid",
      });
    }

    req.userId = payload.id;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }
};
