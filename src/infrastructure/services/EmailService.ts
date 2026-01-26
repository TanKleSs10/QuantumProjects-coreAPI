import { IMailAdapter } from "@src/domain/ports/IMailAdapter";
import { User } from "@src/domain/entities/User";
import { IEmailService } from "@src/domain/services/IEmailService";
import { envs } from "@src/config/envs";
import { logger } from "@src/infrastructure/logs";
import { renderTemplate, TemplateVariables } from "@src/infrastructure/email/templateEngine";
import { EmailSendingError } from "@src/shared/errors/EmailSendingError";

export class EmailService implements IEmailService {
  private readonly log = logger.child("EmailService");
  private readonly baseUrl = envs.FRONTEND_URL;

  constructor(private readonly mailAdapter: IMailAdapter) { }

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const link = this.buildLink("verify-email", token);
    await this.sendTemplatedEmail(user.email, "Verify your email", "verification", {
      username: user.name,
      link,
    });
  }

  async sendPasswordResetEmail(user: User, token: string): Promise<void> {
    const link = this.buildLink("reset-password", token);
    await this.sendTemplatedEmail(user.email, "Reset your password", "password-reset", {
      username: user.name,
      link,
    });
  }

  async sendNotificationEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    await this.sendTemplatedEmail(to, subject, "notification", {
      subject,
      content: htmlContent,
    });
  }

  private async sendTemplatedEmail(
    to: string,
    subject: string,
    templateName: string,
    variables: TemplateVariables,
  ): Promise<void> {
    try {
      const html = await renderTemplate(templateName, variables);
      this.log.info("Sending email", { to, subject, templateName });
      await this.mailAdapter.sendMail(to, subject, html);
    } catch (error) {
      this.log.error("Email delivery failed", {
        to,
        subject,
        templateName,
        error: error instanceof Error ? error.message : String(error),
      });
      if (error instanceof EmailSendingError) {
        throw error;
      }
      throw new EmailSendingError("Unable to send email", { cause: error });
    }
  }

  private buildLink(pathname: string, token: string): string {
    const normalizedBaseUrl = this.baseUrl.replace(/\/$/, "");
    const encodedToken = encodeURIComponent(token);
    return `${normalizedBaseUrl}/${pathname}/${encodedToken}`;
  }
}
