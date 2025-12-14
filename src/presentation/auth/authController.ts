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
import { CreateUserSchema } from "@src/domain/dtos/CreateUserDTO";
import { CreateUserUseCase } from "@src/application/usecases/user/CreateUserUseCase";
import { REFRESH_TOKEN_COOKIE_NAME } from "@src/shared/constants";
import { IEmailService } from "@src/domain/services/IEmailService";

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
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {
    this.logger = logger.child("AuthController");
  }

  signUpUser = async (req: Request, res: Response) => {
    try {
      const parsed = CreateUserSchema.safeParse(req.body);

      if (!parsed.success) {
        this.logger.warn("Invalid signup payload", {
          payload: req.body,
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const user = await new CreateUserUseCase(
        this.userRepository,
        this.securityService,
        this.emailService,
        this.logger,
      ).execute(parsed.data);

      res.status(201).json({
        success: true,
        data: { user },
        message: "Check your email to verify your account",
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

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
    try {
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

      await new ResetPasswordUseCase(
        this.securityService,
        this.userRepository,
        this.logger,
      ).execute(parsed.data.token, parsed.data.password);

      res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  logInUser = async (req: Request, res: Response) => {
    try {
      const parsed = LogInSchema.safeParse(req.body);

      if (!parsed.success) {
        this.logger.warn("invalid login payload", {
          issues: parsed.error.message,
        });

        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
          errors: parsed.error.issues,
        });
      }

      const { user, accessToken, refreshToken } = await new LogInUserUseCase(
        this.userRepository,
        this.securityService,
        this.logger,
      ).execute(parsed.data!);

      res
        .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
          httpOnly: true,
          secure: envs.ENVIRONMENT === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .status(200)
        .json({
          success: true,
          data: { user },
          token: accessToken,
        });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as
        | string
        | undefined;

      if (!refreshToken) {
        this.logger.warn("Refresh token missing in request");
        return res
          .status(401)
          .json({ success: false, message: "Refresh token is required" });
      }

      const { accessToken, refreshToken: rotatedRefreshToken } =
        await new RefreshTokenUseCase(this.securityService, this.logger).execute(
          refreshToken,
        );

      res
        .cookie(REFRESH_TOKEN_COOKIE_NAME, rotatedRefreshToken, {
          httpOnly: true,
          secure: envs.ENVIRONMENT === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        .status(200)
        .json({
          success: true,
          token: accessToken,
        });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  logOutUser = (_req: Request, res: Response) => {
    res
      .clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: envs.ENVIRONMENT === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
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
