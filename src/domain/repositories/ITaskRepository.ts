import { Task } from "@src/domain/entities/Task";
import { TaskPriorityValue } from "@src/domain/value-objects/TaskPriority";
import { TaskStatusValue } from "@src/domain/value-objects/TaskStatus";

export interface ITaskRepository {
  getTaskById(id: string): Promise<Task | null>;
  createTask(task: Task): Promise<Task>;
  saveTask(task: Task): Promise<Task>;
  listTasksByProject(
    projectId: string,
    filters?: {
      status?: TaskStatusValue;
      priority?: TaskPriorityValue;
      assigneeId?: string;
    },
  ): Promise<Task[]>;
  listTasksByUserId(userId: string): Promise<Task[]>;
}
