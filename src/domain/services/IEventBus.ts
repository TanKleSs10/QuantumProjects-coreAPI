import { DomainEvent } from "@src/domain/events/TaskEvents";

export interface IEventBus {
  publish(event: DomainEvent<unknown>): Promise<void>;
}
