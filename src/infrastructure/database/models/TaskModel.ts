import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import { TaskState, TaskStates } from "@src/domain/entities/Task";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

@modelOptions({ schemaOptions: { timestamps: true, collection: "tasks" }, options: { customName: "Task" } })
export class TaskModel {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ ref: "User", type: () => [String], default: [] })
  public assignedToIds!: Ref<UserModel>[];

  @prop({ ref: "User", required: true })
  public createdBy!: Ref<UserModel>;

  @prop({ ref: "Project", required: true, index: true })
  public project!: Ref<ProjectModel>;

  @prop({ enum: TaskStates, type: () => String, default: "todo", index: true })
  public state!: TaskState;
}

export const TaskMongoModel = getModelForClass(TaskModel);
