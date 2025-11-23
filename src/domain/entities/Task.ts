export const TaskStates = ["todo", "doing", "done"] as const;
export type TaskState = (typeof TaskStates)[number];

/**
 * Properties required to create a {@link Task} domain entity.
 */
export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  assignedToIds?: string[];
  projectId: string;
  state?: TaskState;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain representation of a task attached to a project.
 */
export class Task {
  public readonly id: string;
  public title: string;
  public description?: string;
  public createdBy: string;
  public assignedToIds: string[];
  public projectId: string;
  public state: TaskState;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.createdBy = props.createdBy;
    this.assignedToIds = props.assignedToIds ?? [];
    this.projectId = props.projectId;
    this.state = props.state ?? "todo";
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
