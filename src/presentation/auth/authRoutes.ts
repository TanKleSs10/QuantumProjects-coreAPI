import { Router } from "express";

import { AuthController } from "./authController";
import { logger } from "@src/infrastructure/logs";
import { securityService } from "@src/infrastructure/factories/securityServiceFactory";
import { userRepository } from "@src/infrastructure/factories/userRepositoryFactory";
import { emailService } from "@src/infrastructure/factories/emailServiceFactory";
import rateLimit from "express-rate-limit";
import {
  loginLockoutMiddleware,
  resetLockoutMiddleware,
} from "@src/application/middlewares/lockoutMiddleware";
import { asyncHandler } from "@src/presentation/middlewares/asyncHandler";

export class AuthRoutes {
  static get routes() {
    const router = Router();

    const controller = new AuthController(
      securityService,
      userRepository,
      emailService,
      logger.child("AuthController"),
    );

    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many login attempts" },
    });

    const resetLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many reset attempts" },
    });

    router.post("/register", asyncHandler(controller.signUpUser));
    router.get("/verify-email/:token", asyncHandler(controller.verifyEmail));
    router.post(
      "/resend-verification",
      asyncHandler(controller.resendVerification),
    );
    router.post("/forgot-password", asyncHandler(controller.forgotPassword));
    router.post(
      "/login",
      loginLimiter,
      loginLockoutMiddleware,
      asyncHandler(controller.logInUser),
    );
    router.post(
      "/reset-password",
      resetLimiter,
      resetLockoutMiddleware,
      asyncHandler(controller.resetPassword),
    );
    router.post("/refresh", asyncHandler(controller.refreshToken));
    router.post("/logout", asyncHandler(controller.logOutUser));
    return router;
  }
}
