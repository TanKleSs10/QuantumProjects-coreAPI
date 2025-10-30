/**
 * Enumerates the priorities supported by the task workflow.
 */
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

/**
 * Enumerates the lifecycle states of a task.
 */
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

/**
 * Properties required to create a {@link Task} domain entity.
 */
export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  assignedToId?: string;
  projectId: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain representation of a task attached to a project.
 */
export class Task {
  public readonly id: string;
  public title: string;
  public description?: string;
  public assignedToId?: string;
  public projectId: string;
  public status: TaskStatus;
  public priority: TaskPriority;
  public dueDate?: Date | null;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.assignedToId = props.assignedToId;
    this.projectId = props.projectId;
    this.status = props.status ?? TaskStatus.PENDING;
    this.priority = props.priority ?? TaskPriority.MEDIUM;
    this.dueDate = props.dueDate;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
