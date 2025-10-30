import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

@modelOptions({
  schemaOptions: { timestamps: true, collection: "teams" },
  options: { customName: "Team" },
})
export class TeamModel {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ ref: "User", required: true })
  public leader!: Ref<UserModel>;

  @prop({ ref: "User", default: [] })
  public members!: Ref<UserModel>[];

  @prop({ ref: "Project", default: [] })
  public projects!: Ref<ProjectModel>[];
}

export const TeamMongoModel = getModelForClass(TeamModel);
