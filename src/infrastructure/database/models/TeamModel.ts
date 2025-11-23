import { getModelForClass, modelOptions, prop, Ref } from "@typegoose/typegoose";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

export class TeamMembershipModel {
  @prop({ ref: "User", required: true })
  public user!: Ref<UserModel>;

  @prop({ required: true, enum: ["owner", "admin", "member"], type: () => String })
  public role!: "owner" | "admin" | "member";
}

@modelOptions({ schemaOptions: { timestamps: true, collection: "teams" }, options: { customName: "Team" } })
export class TeamModel {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ type: () => [TeamMembershipModel], default: [] })
  public members!: TeamMembershipModel[];

  @prop({ ref: "Project", default: [] })
  public projects!: Ref<ProjectModel>[];
}

export const TeamMongoModel = getModelForClass(TeamModel);
