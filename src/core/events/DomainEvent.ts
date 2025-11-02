/**
 * Base interface for domain events.
 * Events capture meaningful business changes for publication across modules.
 */
export interface DomainEvent {
  name: string;
  occurredOn: Date;
  payload: Record<string, unknown>;
}
