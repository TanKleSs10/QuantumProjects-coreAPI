import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { ProjectStatus } from "@src/domain/entities/Project";
import type { TaskModel } from "@src/infrastructure/database/models/TaskModel";
import type { TeamModel } from "@src/infrastructure/database/models/TeamModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

@modelOptions({
  schemaOptions: { timestamps: true, collection: "projects" },
  options: { customName: "Project" },
})
export class ProjectModel {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ ref: "User", required: true })
  public owner!: Ref<UserModel>;

  @prop({ ref: "Team" })
  public team?: Ref<TeamModel>;

  @prop({ ref: "Task", default: [] })
  public tasks!: Ref<TaskModel>[];

  @prop({
    enum: ProjectStatus,
    type: () => String,
    default: ProjectStatus.ACTIVE,
    index: true,
  })
  public status!: ProjectStatus;

  @prop({ type: () => [String], default: [] })
  public tags!: string[];

  @prop()
  public deadline?: Date;
}

export const ProjectMongoModel = getModelForClass(ProjectModel);
