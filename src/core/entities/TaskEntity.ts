import { Types } from 'mongoose';

/**
 * Domain entity describing a single task within a project.
 */
export interface TaskEntity {
  id: string | Types.ObjectId;
  title: string;
  description?: string;
  projectId: string | Types.ObjectId;
  assigneeId?: string | Types.ObjectId;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
