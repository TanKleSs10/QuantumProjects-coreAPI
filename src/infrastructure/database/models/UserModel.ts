import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import type { NotificationModel } from "@src/infrastructure/database/models/NotificationModel";
import type { ProjectModel } from "@src/infrastructure/database/models/ProjectModel";
import type { TeamModel } from "@src/infrastructure/database/models/TeamModel";

@modelOptions({
  schemaOptions: { timestamps: true, collection: "users" },
  options: { customName: "User" },
})
export class UserModel {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ trim: true })
  public avatarUrl?: string;

  @prop({ trim: true })
  public bio?: string;

  @prop({ default: false })
  public isVerified!: boolean;

  @prop({ ref: "Team", default: [] })
  public teams!: Ref<TeamModel>[];

  @prop({ ref: "Project", default: [] })
  public projects!: Ref<ProjectModel>[];

  @prop({ ref: "Notification", default: [] })
  public notifications!: Ref<NotificationModel>[];
}

export const UserMongoModel = getModelForClass(UserModel);
