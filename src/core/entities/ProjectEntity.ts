import { Types } from 'mongoose';

/**
 * Domain entity representing a project.
 */
export interface ProjectEntity {
  id: string | Types.ObjectId;
  name: string;
  description?: string;
  ownerId: string | Types.ObjectId;
  teamId?: string | Types.ObjectId;
  taskIds: Array<string | Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}
