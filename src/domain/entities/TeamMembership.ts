export type TeamRole = "owner" | "admin" | "member";

export interface TeamMembershipProps {
  teamId: string;
  userId: string;
  role: TeamRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class TeamMembership {
  public readonly teamId: string;
  public readonly userId: string;
  public role: TeamRole;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: TeamMembershipProps) {
    this.teamId = props.teamId;
    this.userId = props.userId;
    this.role = props.role;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
