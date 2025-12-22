import { AddMemberUseCase } from "@src/application/usecases/team/AddMemberUseCase";
import { CreateTeamUseCase } from "@src/application/usecases/team/CreateTeamUseCase";
import { DemoteMemberUseCase } from "@src/application/usecases/team/DemoteMemberUseCase";
import { GetTeamByIdUseCase } from "@src/application/usecases/team/GetTeamByIdUseCase";
import { ListTeamsByUserUseCase } from "@src/application/usecases/team/ListTeamsByUserUseCase";
import { PromoteMemberUseCase } from "@src/application/usecases/team/PromoteMemberUseCase";
import { RemoveMemberUseCase } from "@src/application/usecases/team/RemoveMemberUseCase";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { DomainError } from "@src/shared/errors/DomainError";

const createLogger = () => {
  const childLogger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  return {
    child: jest.fn(() => childLogger),
  } as const;
};

const createTeam = (ownerId = "owner-id") =>
  new Team("team-id", "Test Team", ownerId, [
    TeamMembership.createOwner(ownerId),
  ]);

describe("Team use cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("CreateTeamUseCase creates a team", async () => {
    const teamRepository = {
      createTeam: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new CreateTeamUseCase(teamRepository as any, logger as any);

    const createdTeam = new Team(
      "team-id",
      "Design",
      "owner-id",
      [TeamMembership.createOwner("owner-id")],
      "desc",
    );

    teamRepository.createTeam.mockResolvedValueOnce(createdTeam);

    const result = await useCase.execute(
      { name: "Design", description: "desc" },
      "owner-id",
    );

    expect(result).toEqual(createdTeam);
    expect(teamRepository.createTeam).toHaveBeenCalledWith(expect.any(Team));
  });

  it("AddMemberUseCase adds member and saves team", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
      saveTeam: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new AddMemberUseCase(teamRepository as any, logger as any);

    const team = createTeam();
    teamRepository.getTeamById.mockResolvedValueOnce(team);
    teamRepository.saveTeam.mockResolvedValueOnce(team);

    const result = await useCase.execute("team-id", "owner-id", {
      userId: "member-id",
      role: "admin",
    });

    expect(result).toBe(team);
    expect(team.getMember("member-id")?.role).toBe("admin");
    expect(teamRepository.saveTeam).toHaveBeenCalledWith(team);
  });

  it("AddMemberUseCase blocks non-owner", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
      saveTeam: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new AddMemberUseCase(teamRepository as any, logger as any);

    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createMember("member-id"));
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    await expect(
      useCase.execute("team-id", "member-id", {
        userId: "new-user",
        role: "member",
      }),
    ).rejects.toThrow(DomainError);
  });

  it("RemoveMemberUseCase prevents removing owner", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
      saveTeam: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new RemoveMemberUseCase(teamRepository as any, logger as any);

    const team = createTeam("owner-id");
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    await expect(
      useCase.execute("team-id", "owner-id", "owner-id"),
    ).rejects.toThrow(DomainError);
  });

  it("PromoteMemberUseCase promotes member", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
      saveTeam: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new PromoteMemberUseCase(teamRepository as any, logger as any);

    const team = createTeam();
    team.addMember(TeamMembership.createMember("member-id"));

    teamRepository.getTeamById.mockResolvedValueOnce(team);
    teamRepository.saveTeam.mockResolvedValueOnce(team);

    const result = await useCase.execute("team-id", "owner-id", "member-id");

    expect(result.getMember("member-id")?.role).toBe("admin");
  });

  it("DemoteMemberUseCase demotes member", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
      saveTeam: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new DemoteMemberUseCase(teamRepository as any, logger as any);

    const team = createTeam();
    team.addMember(TeamMembership.createAdmin("member-id"));

    teamRepository.getTeamById.mockResolvedValueOnce(team);
    teamRepository.saveTeam.mockResolvedValueOnce(team);

    const result = await useCase.execute("team-id", "owner-id", "member-id");

    expect(result.getMember("member-id")?.role).toBe("member");
  });

  it("ListTeamsByUserUseCase returns empty list", async () => {
    const teamRepository = {
      listTeamsByUser: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new ListTeamsByUserUseCase(
      teamRepository as any,
      logger as any,
    );

    teamRepository.listTeamsByUser.mockResolvedValueOnce([]);

    const result = await useCase.execute("user-id");

    expect(result).toEqual([]);
  });

  it("GetTeamByIdUseCase throws when team not found", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new GetTeamByIdUseCase(teamRepository as any, logger as any);

    teamRepository.getTeamById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute("missing-id", "user-id"),
    ).rejects.toThrow(DomainError);
  });

  it("GetTeamByIdUseCase blocks non-member access", async () => {
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();
    const useCase = new GetTeamByIdUseCase(teamRepository as any, logger as any);

    const team = createTeam("owner-id");
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    await expect(
      useCase.execute("team-id", "outsider-id"),
    ).rejects.toThrow(DomainError);
  });
});
