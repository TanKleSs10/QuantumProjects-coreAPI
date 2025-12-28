export interface DomainEvent<TPayload> {
  readonly name: string;
  readonly payload: TPayload;
  readonly occurredAt: Date;
}

export interface TaskCreatedPayload {
  taskId: string;
  projectId: string;
  createdBy: string;
}

export interface TaskUpdatedPayload {
  taskId: string;
  projectId: string;
  updatedBy: string;
}

export interface TaskAssignedPayload {
  taskId: string;
  projectId: string;
  assigneeId: string;
  assignedBy: string;
}

export class TaskCreatedEvent implements DomainEvent<TaskCreatedPayload> {
  public readonly name = "TaskCreated";
  public readonly occurredAt = new Date();

  constructor(public readonly payload: TaskCreatedPayload) {}
}

export class TaskUpdatedEvent implements DomainEvent<TaskUpdatedPayload> {
  public readonly name = "TaskUpdated";
  public readonly occurredAt = new Date();

  constructor(public readonly payload: TaskUpdatedPayload) {}
}

export class TaskAssignedEvent implements DomainEvent<TaskAssignedPayload> {
  public readonly name = "TaskAssigned";
  public readonly occurredAt = new Date();

  constructor(public readonly payload: TaskAssignedPayload) {}
}
