import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  BLOCKED = "blocked",
  DONE = "done",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

@modelOptions({
  schemaOptions: { timestamps: true, collection: "tasks" },
  options: { customName: "Task" },
})
export class TaskModel {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ ref: "User", index: true })
  public assignee?: Ref<UserModel>;

  @prop({ ref: "User", required: true })
  public createdBy!: Ref<UserModel>;

  @prop({ ref: "Project", required: true, index: true })
  public project!: Ref<ProjectModel>;

  @prop({
    enum: TaskStatus,
    type: () => String,
    default: TaskStatus.TODO,
    index: true,
  })
  public status!: TaskStatus;

  @prop({
    enum: TaskPriority,
    type: () => String,
    default: TaskPriority.MEDIUM,
  })
  public priority!: TaskPriority;

  @prop()
  public dueDate?: Date;

  @prop({ type: () => [String], default: [] })
  public tags!: string[];

  @prop()
  public createdAt?: Date;

  @prop()
  public updatedAt?: Date;
}

export const TaskMongoModel = getModelForClass(TaskModel);
