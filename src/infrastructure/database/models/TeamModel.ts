import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

export class TeamMembershipModel {
  @prop({ ref: "User", required: true })
  public user!: Ref<UserModel>;

  @prop({ required: true, enum: ["owner", "admin", "member"] })
  public role!: "owner" | "admin" | "member";
}

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
  public owner!: Ref<UserModel>;

  @prop({ default: false })
  public isPersonal!: boolean;

  @prop({ type: () => [TeamMembershipModel], default: [] })
  public members!: TeamMembershipModel[];
}

export const TeamMongoModel = getModelForClass(TeamModel);
