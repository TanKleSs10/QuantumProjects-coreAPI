import { IMailAdapter } from "@src/domain/ports/IMailAdapter";
import { envs } from "@src/config/envs";
import { logger } from "@src/infrastructure/logs";

export class EmailService {
  private readonly log = logger.child("EmailService");

  constructor(private mailAdapter: IMailAdapter) {}

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const subject = "Verify your email address";
    const html = `
      <h1>Email Verification</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${envs.FRONTEND_URL ?? "https://www.quantummd.com"}/verify-email?token=${token}">
        Verify Email
      </a>
      <p>If you did not request this email, please ignore it.</p>
    `;

    this.log.info("Sending verification email", { to });
    await this.mailAdapter.sendMail(to, subject, html);
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const subject = "Reset your password";
    const html = `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${envs.FRONTEND_URL ?? "https://www.quantummd.com"}/reset-password?token=${token}">
        Reset Password
      </a>
      <p>If you did not request this email, please ignore it.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    this.log.info("Sending password reset email", { to });
    await this.mailAdapter.sendMail(to, subject, html);
  }
}
