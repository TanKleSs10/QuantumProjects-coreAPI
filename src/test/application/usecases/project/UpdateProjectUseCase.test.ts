import { UpdateProjectUseCase } from "@src/application/usecases/project/UpdateProjectUseCase";
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

describe("UpdateProjectUseCase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates project fields for owner", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new UpdateProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Old",
      "team-id",
      "owner-id",
      undefined,
      "desc",
      ["tag"],
    );

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(createTeam("owner-id"));
    projectRepository.saveProject.mockResolvedValueOnce(project);

    const result = await useCase.execute(
      "project-id",
      "owner-id",
      { name: "New", tags: ["updated"] },
    );

    expect(result.name).toBe("New");
    expect(result.tags).toEqual(["updated"]);
    expect(projectRepository.saveProject).toHaveBeenCalledWith(project);
  });

  it("throws when project is not found", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new UpdateProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(null);

    await expect(
      useCase.execute("project-id", "owner-id", { name: "New" }),
    ).rejects.toThrow(DomainError);
  });

  it("blocks non-admin members", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new UpdateProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Old",
      "team-id",
      "owner-id",
    );

    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createMember("member-id"));

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    await expect(
      useCase.execute("project-id", "member-id", { name: "New" }),
    ).rejects.toThrow(DomainError);
  });
});
