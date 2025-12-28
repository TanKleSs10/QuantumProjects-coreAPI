import { Task } from "@src/domain/entities/Task";
import { TaskPriorityValue } from "@src/domain/value-objects/TaskPriority";
import { TaskStatusValue } from "@src/domain/value-objects/TaskStatus";

export interface ITaskDatasource {
  createTask(task: Task): Promise<Task>;
  getTaskById(taskId: string): Promise<Task | null>;
  saveTask(task: Task): Promise<Task>;
  listTasksByProject(
    projectId: string,
    filters?: {
      status?: TaskStatusValue;
      priority?: TaskPriorityValue;
      assigneeId?: string;
    },
  ): Promise<Task[]>;
}
