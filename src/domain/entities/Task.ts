import { TaskPriorityValue, TaskPriorityValues } from "@src/domain/value-objects/TaskPriority";
import {
  TaskStatus,
  TaskStatusValue,
  TaskStatusValues,
} from "@src/domain/value-objects/TaskStatus";
import { DomainError } from "@src/shared/errors/DomainError";

/**
 * Properties required to create a {@link Task} domain entity.
 */
export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  status?: TaskStatusValue;
  priority?: TaskPriorityValue;
  projectId: string;
  assigneeId?: string | null;
  createdBy: string;
  dueDate?: Date;
  tags?: string[];
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
  public projectId: string;
  public createdBy: string;
  public assigneeId?: string | null;
  public status: TaskStatusValue;
  public priority: TaskPriorityValue;
  public dueDate?: Date;
  public tags: string[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TaskProps) {
    const title = props.title?.trim();
    if (!title) {
      throw new DomainError("Task title is required");
    }

    const status = props.status ?? "todo";
    if (!TaskStatusValues.includes(status)) {
      throw new DomainError("Invalid task status");
    }

    const priority = props.priority ?? "medium";
    if (!TaskPriorityValues.includes(priority)) {
      throw new DomainError("Invalid task priority");
    }

    this.id = props.id;
    this.title = title;
    this.description = props.description;
    this.projectId = props.projectId;
    this.createdBy = props.createdBy;
    this.assigneeId = props.assigneeId ?? null;
    this.status = status;
    this.priority = priority;
    this.dueDate = props.dueDate;
    this.tags = props.tags ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  changeStatus(nextStatus: TaskStatusValue) {
    if (!TaskStatusValues.includes(nextStatus)) {
      throw new DomainError("Invalid task status");
    }
    if (!TaskStatus.canTransition(this.status, nextStatus)) {
      throw new DomainError("Invalid task status transition");
    }
    this.status = nextStatus;
  }

  assignTo(assigneeId: string) {
    if (!assigneeId.trim()) {
      throw new DomainError("Assignee is required");
    }
    this.assigneeId = assigneeId;
  }

  updateDetails(data: {
    title?: string;
    description?: string;
    priority?: TaskPriorityValue;
    dueDate?: Date;
    tags?: string[];
  }) {
    if (typeof data.title === "string") {
      const title = data.title.trim();
      if (!title) {
        throw new DomainError("Task title is required");
      }
      this.title = title;
    }

    if (typeof data.description === "string") {
      this.description = data.description;
    }

    if (data.priority) {
      if (!TaskPriorityValues.includes(data.priority)) {
        throw new DomainError("Invalid task priority");
      }
      this.priority = data.priority;
    }

    if (data.dueDate !== undefined) {
      this.dueDate = data.dueDate;
    }

    if (data.tags !== undefined) {
      this.tags = data.tags;
    }
  }
}
