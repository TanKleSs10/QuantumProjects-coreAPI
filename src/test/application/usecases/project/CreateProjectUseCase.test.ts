import { CreateProjectUseCase } from "@src/application/usecases/project/CreateProjectUseCase";
import { Project } from "@src/domain/entities/Project";
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
  new Team("team-id", "Team", ownerId, [TeamMembership.createOwner(ownerId)]);

describe("CreateProjectUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a project when requester is owner", async () => {
    const projectRepository = {
      createProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new CreateProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const team = createTeam("owner-id");
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    const created = new Project("project-id", "Quantum", "team-id", "owner-id");
    projectRepository.createProject.mockResolvedValueOnce(created);

    const result = await useCase.execute(
      { name: "Quantum", description: "desc", tags: ["mvp"] },
      "team-id",
      "owner-id",
    );

    expect(result).toBe(created);
    expect(projectRepository.createProject).toHaveBeenCalledWith(
      expect.any(Project),
    );
  });

  it("throws when team is not found", async () => {
    const projectRepository = {
      createProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new CreateProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    teamRepository.getTeamById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute({ name: "Quantum", tags: [] }, "team-id", "owner-id"),
    ).rejects.toThrow(DomainError);
  });

  it("blocks non-admin members", async () => {
    const projectRepository = {
      createProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new CreateProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createMember("member-id"));
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    await expect(
      useCase.execute({ name: "Quantum", tags: [] }, "team-id", "member-id"),
    ).rejects.toThrow(DomainError);
  });
});
