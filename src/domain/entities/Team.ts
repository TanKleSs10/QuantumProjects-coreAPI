import { TeamMembership } from "./TeamMembership";

/**
 * Properties required to create a {@link Team} domain entity.
 */
export interface TeamProps {
  id: string;
  name: string;
  description?: string;
  members?: TeamMembership[];
  projectIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain representation of a collaborative team.
 */
export class Team {
  public readonly id: string;
  public name: string;
  public description?: string;
  public members: TeamMembership[];
  public projectIds: string[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TeamProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.members = props.members ?? [];
    this.projectIds = props.projectIds ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
