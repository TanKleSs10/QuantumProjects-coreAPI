import { EmailService } from "@src/infrastructure/services/EmailService";
import { NodemailerAdapter } from "@src/infrastructure/adapters/NodemailerAdapter";
import { IEmailService } from "@src/domain/services/IEmailService";

const mailAdapter = new NodemailerAdapter();

export const emailService: IEmailService = new EmailService(mailAdapter);
