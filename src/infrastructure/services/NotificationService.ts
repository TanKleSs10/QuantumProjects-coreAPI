import { LoggerPort } from '../../core/interfaces/LoggerPort';

/**
 * Placeholder for internal notification delivery (e.g., Slack, in-app).
 */
export class NotificationService {
  constructor(private readonly logger: LoggerPort) {}

  async notify(_message: string, _metadata: Record<string, unknown> = {}): Promise<void> {
    // TODO: Implement notification channels.
    this.logger.info('NotificationService.notify invoked (placeholder)');
  }
}
