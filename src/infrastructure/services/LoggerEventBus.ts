import { DomainEvent } from "@src/domain/events/TaskEvents";
import { IEventBus } from "@src/domain/services/IEventBus";
import { ILogger } from "@src/interfaces/Logger";

export class LoggerEventBus implements IEventBus {
  private readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child("LoggerEventBus");
  }

  async publish(event: DomainEvent<unknown>): Promise<void> {
    this.logger.info("Domain event published", {
      event: event.name,
      payload: event.payload,
      occurredAt: event.occurredAt,
    });
  }
}
