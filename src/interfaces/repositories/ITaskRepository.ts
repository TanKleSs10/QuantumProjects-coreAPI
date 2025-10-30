import { CreateTaskDTO } from "@src/domain/dtos/CreateTaskDTO";
import { Task } from "@src/domain/entities/Task";
import { TaskStatus } from "@src/domain/entities/Task";

/**
 * Fields allowed to be updated on an existing task.
 */
export type UpdateTaskData = Partial<CreateTaskDTO> & {
  projectId?: string;
};

/**
 * Contract that must be implemented by any persistence mechanism handling tasks.
 */
export interface ITaskRepository {
  /**
   * Persists a new task.
   */
  create(data: CreateTaskDTO): Promise<Task>;

  /**
   * Retrieves a task by its identifier.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Lists all tasks associated with a project.
   */
  findByProject(projectId: string): Promise<Task[]>;

  /**
   * Lists tasks assigned to a specific user.
   */
  findByAssignee(userId: string): Promise<Task[]>;

  /**
   * Updates a task entity.
   */
  update(id: string, updates: UpdateTaskData): Promise<Task | null>;

  /**
   * Updates the status of a task returning the persisted entity.
   */
  updateStatus(id: string, status: TaskStatus): Promise<Task | null>;

  /**
   * Deletes a task.
   */
  delete(id: string): Promise<boolean>;
}
