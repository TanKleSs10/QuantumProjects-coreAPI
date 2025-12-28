import { Types } from "mongoose";
import { DocumentType } from "@typegoose/typegoose";
import { Task } from "@src/domain/entities/Task";
import type { TaskPriorityValue } from "@src/domain/value-objects/TaskPriority";
import type { TaskStatusValue } from "@src/domain/value-objects/TaskStatus";
import {
  TaskModel,
  TaskPriority as TaskPriorityEnum,
  TaskStatus as TaskStatusEnum,
} from "@src/infrastructure/database/models/TaskModel";

export class TaskMapper {
  static toDomain(model: DocumentType<TaskModel>): Task {
    return new Task({
      id: model._id.toString(),
      title: model.title,
      description: model.description,
      status: model.status as TaskStatusValue,
      priority: model.priority as TaskPriorityValue,
      projectId: model.project.toString(),
      assigneeId: model.assignee ? model.assignee.toString() : null,
      createdBy: model.createdBy.toString(),
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      dueDate: model.dueDate,
      tags: model.tags ?? [],
    });
  }

  static toPersistence(task: Task): Partial<TaskModel> {
    return {
      title: task.title,
      description: task.description,
      project: new Types.ObjectId(task.projectId),
      createdBy: new Types.ObjectId(task.createdBy),
      assignee: task.assigneeId ? new Types.ObjectId(task.assigneeId) : undefined,
      status: task.status as TaskStatusEnum,
      priority: task.priority as TaskPriorityEnum,
      dueDate: task.dueDate,
      tags: task.tags,
    };
  }
}
