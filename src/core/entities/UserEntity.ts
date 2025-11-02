import { Types } from 'mongoose';

/**
 * Core representation of a system user.
 * Keep this entity free from infrastructure concerns.
 */
export interface UserEntity {
  id: string | Types.ObjectId;
  email: string;
  name: string;
  teamIds: Array<string | Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}
