import { IMailAdapter } from "@src/domain/ports/IMailAdapter";
import { logger } from "@src/infrastructure/logs";
import nodemailer from "nodemailer";

export class NodemailerAdapter implements IMailAdapter {
  private readonly transporter: nodemailer.Transporter;
  private readonly smtpUser: string;

  constructor() {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === "true";

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      throw new Error(
        "SMTP configuration is incomplete. Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS",
      );
    }

    this.smtpUser = smtpUser;
    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.smtpUser,
        to,
        subject,
        html,
      });
    } catch (error) {
      logger.error("Error sending email", {
        error: error instanceof Error ? error.message : String(error),
        to,
        subject,
      });
      throw new Error(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
