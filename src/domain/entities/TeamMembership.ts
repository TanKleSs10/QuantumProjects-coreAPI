export type TeamRole = "owner" | "admin" | "member";

export class TeamMembership {
  constructor(
    public readonly teamId: string,
    public readonly userId: string,
    private _role: TeamRole,
  ) {}

  static createOwner(teamId: string, userId: string): TeamMembership {
    return new TeamMembership(teamId, userId, "owner");
  }

  static creteAdmin(teamId: string, userId: string): TeamMembership {
    return new TeamMembership(teamId, userId, "admin");
  }

  static createMember(teamId: string, userId: string): TeamMembership {
    return new TeamMembership(teamId, userId, "member");
  }

  get role(): TeamRole {
    return this._role;
  }

  promoteToAdmin(): void {
    if (this._role === "owner") return;
    this._role = "admin";
  }

  demoteToMember(): void {
    if (this._role === "owner") return;
    this._role = "member";
  }
}
