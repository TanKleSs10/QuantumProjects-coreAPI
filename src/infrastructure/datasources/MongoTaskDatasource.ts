import { ITaskDatasource } from "@src/domain/datasources/ITaskDatasource";
import { Task } from "@src/domain/entities/Task";
import { TaskPriorityValue } from "@src/domain/value-objects/TaskPriority";
import { TaskStatusValue } from "@src/domain/value-objects/TaskStatus";
import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { TaskMongoModel } from "@src/infrastructure/database/models/TaskModel";
import { TaskMapper } from "@src/infrastructure/mappers/TaskMapper";

export class MongoTaskDatasource implements ITaskDatasource {
  async createTask(task: Task): Promise<Task> {
    try {
      const created = await TaskMongoModel.create(TaskMapper.toPersistence(task));
      return TaskMapper.toDomain(created);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error creating task", { cause: error });
    }
  }

  async getTaskById(taskId: string): Promise<Task | null> {
    try {
      const found = await TaskMongoModel.findById(taskId);
      if (!found) return null;
      return TaskMapper.toDomain(found);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error retrieving task by id", {
        cause: error,
      });
    }
  }

  async saveTask(task: Task): Promise<Task> {
    try {
      const updated = await TaskMongoModel.findByIdAndUpdate(
        task.id,
        { $set: TaskMapper.toPersistence(task) },
        { new: true },
      );
      if (!updated) throw new InfrastructureError("Task not found");
      return TaskMapper.toDomain(updated);
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error updating task", { cause: error });
    }
  }

  async listTasksByProject(
    projectId: string,
    filters?: { status?: TaskStatusValue; priority?: TaskPriorityValue; assigneeId?: string },
  ): Promise<Task[]> {
    try {
      const query: Record<string, unknown> = { project: projectId };
      if (filters?.status) query.status = filters.status;
      if (filters?.priority) query.priority = filters.priority;
      if (filters?.assigneeId) query.assignee = filters.assigneeId;

      const tasks = await TaskMongoModel.find(query);
      return tasks.map((task) => TaskMapper.toDomain(task));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error listing tasks by project", {
        cause: error,
      });
    }
  }

  async listTasksByUserId(userId: string): Promise<Task[]> {
    try {
      const tasks = await TaskMongoModel.find({
        $or: [{ assignee: userId }, { createdBy: userId }],
      });
      return tasks.map((task) => TaskMapper.toDomain(task));
    } catch (error) {
      if (error instanceof InfrastructureError) throw error;
      throw new InfrastructureError("Error listing tasks by user", {
        cause: error,
      });
    }
  }
}
