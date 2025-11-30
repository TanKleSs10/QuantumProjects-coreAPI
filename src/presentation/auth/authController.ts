import { Request, Response } from "express";
import z from "zod";

import { ILogger } from "@src/interfaces/Logger";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { VerifyEmailUseCase } from "@src/application/usecases/auth/VerifyEmailUseCase";
import { ResetPasswordUseCase } from "@src/application/usecases/auth/ResetPasswordUseCase";
import { InvalidTokenError } from "@src/shared/errors/InvalidTokenError";
import { ExpiredTokenError } from "@src/shared/errors/ExpiredTokenError";
import { DomainError } from "@src/shared/errors/DomainError";
import { LogInSchema } from "@src/domain/dtos/LogInDTO";
import { LogInUserUseCase } from "@src/application/usecases/auth/LogInUserUseCase";
import { envs } from "@src/config/envs";
import { RefreshTokenUseCase } from "@src/application/usecases/auth/RefreshTokenUseCase";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password is too long"),
});

export class AuthController {
  constructor(
    private readonly securityService: ISecurityService,
    private readonly userRepository: IUserRepository,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("AuthController");
  }

  verifyEmail = async (req: Request, res: Response) => {
    const token = req.params.token;

    if (!token) {
      res.status(400).json({ success: false, message: "Token is required" });
      this.logger.warn("Verify email called without token");
    }

    const useCase = new VerifyEmailUseCase(
      this.securityService,
      this.userRepository,
      this.logger.child("VerifyEmailUseCase"),
    );

    try {
      const user = await useCase.execute(token ?? "");
      res.status(200).json({
        success: true,
        message: "Email verified successfully",
        data: { id: user.id, email: user.email, isVerified: user.isVerified },
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      this.logger.warn("Invalid reset password payload", {
        issues: parsed.error.message,
      });
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
      });
    }

    const useCase = new ResetPasswordUseCase(
      this.securityService,
      this.userRepository,
      this.logger.child("ResetPasswordUseCase"),
    );

    try {
      await useCase.execute(parsed.data.token, parsed.data.password);
      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  logInUser = (req: Request, res: Response) => {
    const parsed = LogInSchema.safeParse(req.body);

    if (!parsed.success) {
      this.logger.warn("invalid login payload", {
        issues: parsed.error.message,
      });

      res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid payload",
        errors: parsed.error.issues,
      });

      return;
    }

    new LogInUserUseCase(this.userRepository, this.securityService)
      .execute(parsed.data!)
      .then(({ user, accessToken, refreshToken }) => {
        res
          .status(200)
          .json({
            success: true,
            data: { user },
            token: accessToken,
          })
          .cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: envs.ENVIRONMENT === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
      })
      .catch((error) => {
        this.handleError(res, error);
      });
  };

  refreshToken = (req: Request, res: Response) => {
    const refresh_token = req.cookies?.refresh_token;

    if (!refresh_token) {
      return res.status(401).json({
        success: false,
        code: "NO_REFRESH_TOKEN",
        message: "No refresh token provided",
      });
    }

    new RefreshTokenUseCase(this.securityService)
      .execute(refresh_token)
      .then(
        ({ accessToken: newAccessToken, refreshToken: newRefreshToken }) => {
          res
            .cookie("refresh_token", newRefreshToken, {
              httpOnly: true,
              secure: envs.ENVIRONMENT === "production",
              sameSite: "strict",
              maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
              success: true,
              accessToken: newAccessToken,
              message: "Token refreshed successfully",
            });
        },
      )
      .catch((error) => {
        return this.handleError(res, error);
      });
  };

  private handleError(res: Response, error: unknown) {
    if (error instanceof ExpiredTokenError) {
      return res.status(410).json({ success: false, message: error.message });
    }
    if (error instanceof InvalidTokenError) {
      return res.status(401).json({ success: false, message: error.message });
    }
    if (error instanceof DomainError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    this.logger.error("Unexpected auth error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
