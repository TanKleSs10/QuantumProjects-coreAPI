import { ITaskDatasource } from "@src/domain/datasources/ITaskDatasource";
import { Task } from "@src/domain/entities/Task";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { TaskPriorityValue } from "@src/domain/value-objects/TaskPriority";
import { TaskStatusValue } from "@src/domain/value-objects/TaskStatus";

export class TaskRepository implements ITaskRepository {
  constructor(
    private readonly taskDatasource: ITaskDatasource,
  ) {}

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskDatasource.getTaskById(id);
  }

  async createTask(task: Task): Promise<Task> {
    return this.taskDatasource.createTask(task);
  }

  async saveTask(task: Task): Promise<Task> {
    return this.taskDatasource.saveTask(task);
  }

  async listTasksByProject(
    projectId: string,
    filters?: { status?: TaskStatusValue; priority?: TaskPriorityValue; assigneeId?: string },
  ): Promise<Task[]> {
    return this.taskDatasource.listTasksByProject(projectId, filters);
  }

  async listTasksByUserId(userId: string): Promise<Task[]> {
    return this.taskDatasource.listTasksByUserId(userId);
  }
}
