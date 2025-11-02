import { LoggerPort } from '../../core/interfaces/LoggerPort';

/**
 * Simple placeholder for outbound email delivery.
 */
export class MailService {
  constructor(private readonly logger: LoggerPort) {}

  async sendMail(_options: Record<string, unknown>): Promise<void> {
    // TODO: Integrate with transactional email provider.
    this.logger.info('MailService.sendMail invoked (placeholder)');
  }
}
