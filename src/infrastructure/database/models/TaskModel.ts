import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { TaskPriority, TaskStatus } from "@src/domain/entities/Task";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

@modelOptions({ schemaOptions: { timestamps: true, collection: "tasks" }, options: { customName: "Task" } })
export class TaskModel {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ ref: "User" })
  public assignedTo?: Ref<UserModel>;

  @prop({ ref: "Project", required: true, index: true })
  public project!: Ref<ProjectModel>;

  @prop({ enum: TaskStatus, type: () => String, default: TaskStatus.PENDING, index: true })
  public status!: TaskStatus;

  @prop({ enum: TaskPriority, type: () => String, default: TaskPriority.MEDIUM })
  public priority!: TaskPriority;

  @prop()
  public dueDate?: Date;
}

export const TaskMongoModel = getModelForClass(TaskModel);
