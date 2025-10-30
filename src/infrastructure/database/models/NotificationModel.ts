import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";
import { NotificationType } from "@src/domain/entities/Notification";
import type { UserModel } from "@src/infrastructure/database/models/UserModel";

@modelOptions({
  schemaOptions: { timestamps: true, collection: "notifications" },
  options: { customName: "Notification" },
})
export class NotificationModel {
  @prop({ required: true, trim: true })
  public title!: string;

  @prop({ required: true, trim: true })
  public message!: string;

  @prop({ enum: NotificationType, type: () => String, required: true })
  public type!: NotificationType;

  @prop({ ref: "User", required: true, index: true })
  public user!: Ref<UserModel>;

  @prop({ default: false })
  public read!: boolean;
}

export const NotificationMongoModel = getModelForClass(NotificationModel);
