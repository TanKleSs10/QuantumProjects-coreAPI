import { Types } from 'mongoose';

/**
 * Domain entity representing a collaboration team.
 */
export interface TeamEntity {
  id: string | Types.ObjectId;
  name: string;
  memberIds: Array<string | Types.ObjectId>;
  projectIds: Array<string | Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}
