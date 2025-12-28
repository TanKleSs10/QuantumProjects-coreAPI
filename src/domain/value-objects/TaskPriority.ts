import { DomainError } from "@src/shared/errors/DomainError";

export const TaskPriorityValues = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type TaskPriorityValue = (typeof TaskPriorityValues)[number];

export class TaskPriority {
  public readonly value: TaskPriorityValue;

  private constructor(value: TaskPriorityValue) {
    this.value = value;
  }

  static from(value: string): TaskPriority {
    if (!TaskPriorityValues.includes(value as TaskPriorityValue)) {
      throw new DomainError("Invalid task priority");
    }
    return new TaskPriority(value as TaskPriorityValue);
  }
}
