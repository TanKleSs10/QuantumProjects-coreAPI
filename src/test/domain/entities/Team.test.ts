import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";

describe("Team aggregate", () => {
  const ownerId = "user-owner";

  const buildTeam = () =>
    new Team(
      "team-1",
      "Alpha",
      ownerId,
      [TeamMembership.createOwner(ownerId)],
      "Team description",
    );

  it("creates a team with owner membership", () => {
    const team = buildTeam();
    const owner = team.getMember(ownerId);

    expect(owner).toBeDefined();
    expect(owner?.role).toBe("owner");
  });

  it("adds a member and prevents duplicates", () => {
    const team = buildTeam();
    const member = TeamMembership.createMember("user-2");

    team.addMember(member);
    expect(team.getMembers()).toHaveLength(2);

    expect(() => team.addMember(member)).toThrow("User already belongs to team");
  });

  it("prevents removing the owner", () => {
    const team = buildTeam();
    expect(() => team.removeMember(ownerId)).toThrow("Owner cannot be removed");
  });

  it("promotes and demotes members, not owners", () => {
    const team = buildTeam();
    const memberId = "user-3";
    team.addMember(TeamMembership.createMember(memberId));

    team.promoteToAdmin(memberId);
    expect(team.getMember(memberId)?.role).toBe("admin");

    team.demoteToMember(memberId);
    expect(team.getMember(memberId)?.role).toBe("member");

    team.promoteToAdmin(ownerId);
    expect(team.getMember(ownerId)?.role).toBe("owner");
  });
});
