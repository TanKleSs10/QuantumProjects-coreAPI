import nodemailer from "nodemailer";

import { IMailAdapter } from "@src/domain/ports/IMailAdapter";
import { envs } from "@src/config/envs";
import { logger } from "@src/infrastructure/logs";
import { EmailSendingError } from "@src/shared/errors/EmailSendingError";

export class NodemailerAdapter implements IMailAdapter {
  private readonly transporter: nodemailer.Transporter;
  private readonly smtpUser: string;
  private readonly log = logger.child("NodemailerAdapter");

  constructor() {
    this.smtpUser = envs.SMTP_USER;
    this.transporter = nodemailer.createTransport({
      host: envs.SMTP_HOST,
      port: envs.SMTP_PORT,
      auth: {
        user: envs.SMTP_USER,
        pass: envs.SMTP_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    this.log.debug("Preparing to send email", {
      host: envs.SMTP_HOST,
      user: envs.SMTP_USER,
      to,
      subject,
    });
    try {
      this.log.info("Sending email", { to, subject });
      await this.transporter.sendMail({
        from: this.smtpUser,
        to,
        subject,
        html,
      });
    } catch (error) {
      this.log.error("Error sending email", {
        error: error instanceof Error ? error.message : String(error),
        to,
        subject,
      });
      throw new EmailSendingError("Failed to deliver email", { cause: error });
    }
  }
}
