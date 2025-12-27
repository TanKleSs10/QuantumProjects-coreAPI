import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import type { TeamModel } from "@src/infrastructure/database/models/TeamModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

export enum ProjectStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  ARCHIVED = "archived",
}

@modelOptions({ schemaOptions: { timestamps: true, collection: "projects" }, options: { customName: "Project" } })
export class ProjectModel {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ ref: "User", required: true })
  public createdBy!: Ref<UserModel>;

  @prop({ ref: "Team", required: true })
  public team!: Ref<TeamModel>;

  @prop({ enum: ProjectStatus, type: () => String, default: ProjectStatus.ACTIVE, index: true })
  public status!: ProjectStatus;

  @prop({ type: () => [String], default: [] })
  public tags!: string[];

  @prop()
  public deadline?: Date;
}

export const ProjectMongoModel = getModelForClass(ProjectModel);
