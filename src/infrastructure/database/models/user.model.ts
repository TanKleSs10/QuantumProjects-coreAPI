import { Schema, model, Document } from 'mongoose';
import { UserEntity } from '../../../core/entities/UserEntity';

export interface UserDocument extends UserEntity, Document {}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    teamIds: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>('User', userSchema);
