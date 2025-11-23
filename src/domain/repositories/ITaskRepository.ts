import { Task } from "@src/domain/entities/Task";

export interface ITaskRepository {
  getTaskById(id: string): Promise<Task | null>;
}
