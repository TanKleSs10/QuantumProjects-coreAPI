import { TeamMembership } from "./TeamMembership";

export class Team {
  private members: TeamMembership[];

  constructor(
    public readonly id: string,
    public name: string,
    public readonly ownerId: string,
    members: TeamMembership[] = [],
    public description?: string,
  ) {
    this.members = members;
  }

  getMembers(): readonly TeamMembership[] {
    return this.members;
  }

  addMember(membership: TeamMembership) {
    const exists = this.members.some((m) => m.userId === membership.userId);
    if (exists) {
      throw new Error("User already belongs to team");
    }
    this.members.push(membership);
  }

  removeMember(userId: string) {
    if (this.ownerId === userId) {
      throw new Error("Owner cannot be removed");
    }
    this.members = this.members.filter((m) => m.userId !== userId);
  }

  promoteToAdmin(userId: string) {
    const member = this.findMember(userId);
    member.promoteToAdmin();
  }

  demoteToMember(userId: string) {
    const member = this.findMember(userId);
    member.demoteToMember();
  }

  getMember(userId: string): TeamMembership | undefined {
    return this.members.find((m) => m.userId === userId);
  }

  private findMember(userId: string): TeamMembership {
    const member = this.members.find((m) => m.userId === userId);
    if (!member) throw new Error("Member not found");
    return member;
  }
}
