export type TeamRole = "owner" | "admin" | "member";

export class TeamMembership {
  constructor(
    public readonly userId: string,
    private _role: TeamRole,
  ) {}

  static createOwner(userId: string): TeamMembership {
    return new TeamMembership(userId, "owner");
  }

  static createAdmin(userId: string): TeamMembership {
    return new TeamMembership(userId, "admin");
  }

  static createMember(userId: string): TeamMembership {
    return new TeamMembership(userId, "member");
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
