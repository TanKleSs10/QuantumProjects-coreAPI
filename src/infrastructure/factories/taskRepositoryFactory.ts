import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { MongoTaskDatasource } from "@src/infrastructure/datasources/MongoTaskDatasource";
import { TaskRepository } from "@src/infrastructure/repositories/TaskRepository";

const taskDatasource = new MongoTaskDatasource();

export const taskRepository: ITaskRepository = new TaskRepository(taskDatasource);
