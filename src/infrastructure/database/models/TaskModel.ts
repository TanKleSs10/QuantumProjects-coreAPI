import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

enum TaskState {
  TODO = "todo",
  IN_PROGRESS = "in_progress",
  BLOCKED = "blocked",
  DONE = "done",
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

  @prop({ ref: "User", default: [] })
  public assignedTo!: Ref<UserModel>[];

  @prop({ ref: "User", required: true })
  public createdBy!: Ref<UserModel>;

  @prop({ ref: "Project", required: true, index: true })
  public project!: Ref<ProjectModel>;

  @prop({
    enum: TaskState,
    type: () => String,
    default: TaskState.TODO,
    index: true,
  })
  public state!: TaskState;
}

export const TaskMongoModel = getModelForClass(TaskModel);
