import { DomainError } from "@src/shared/errors/DomainError";

export const TaskStatusValues = [
  "todo",
  "in_progress",
  "blocked",
  "done",
] as const;

export type TaskStatusValue = (typeof TaskStatusValues)[number];

const transitions: Record<TaskStatusValue, TaskStatusValue[]> = {
  todo: ["in_progress", "blocked", "done"],
  in_progress: ["blocked", "done"],
  blocked: ["in_progress", "done"],
  done: [],
};

export class TaskStatus {
  public readonly value: TaskStatusValue;

  private constructor(value: TaskStatusValue) {
    this.value = value;
  }

  static from(value: string): TaskStatus {
    if (!TaskStatusValues.includes(value as TaskStatusValue)) {
      throw new DomainError("Invalid task status");
    }
    return new TaskStatus(value as TaskStatusValue);
  }

  static canTransition(from: TaskStatusValue, to: TaskStatusValue): boolean {
    return transitions[from]?.includes(to) ?? false;
  }
}
