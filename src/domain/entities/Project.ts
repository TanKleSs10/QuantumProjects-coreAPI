/**
 * Enumerates the states a project can assume within the workspace.
 */
export enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

/**
 * Properties required to create a {@link Project} domain entity.
 */
export interface ProjectProps {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  teamId?: string;
  taskIds?: string[];
  status?: ProjectStatus;
  tags?: string[];
  deadline?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain representation of a project that groups tasks and teams.
 */
export class Project {
  public readonly id: string;
  public title: string;
  public description: string;
  public ownerId: string;
  public teamId?: string;
  public taskIds: string[];
  public status: ProjectStatus;
  public tags: string[];
  public deadline?: Date | null;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: ProjectProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.ownerId = props.ownerId;
    this.teamId = props.teamId;
    this.taskIds = props.taskIds ?? [];
    this.status = props.status ?? ProjectStatus.ACTIVE;
    this.tags = props.tags ?? [];
    this.deadline = props.deadline;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
