import { Schema, model, Document } from 'mongoose';
import { ProjectEntity } from '../../../core/entities/ProjectEntity';

export interface ProjectDocument extends ProjectEntity, Document {}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
    taskIds: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  },
  { timestamps: true }
);

export const ProjectModel = model<ProjectDocument>('Project', projectSchema);
