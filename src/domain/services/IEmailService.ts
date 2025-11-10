import { User } from "@src/domain/entities/User";

export interface IEmailService {
  sendVerificationEmail(user: User, token: string): Promise<void>;
  sendPasswordResetEmail(user: User, token: string): Promise<void>;
  sendNotificationEmail(to: string, subject: string, htmlContent: string): Promise<void>;
}
