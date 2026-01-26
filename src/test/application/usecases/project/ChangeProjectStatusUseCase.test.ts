import { ArchiveProjectUseCase } from "@src/application/usecases/project/ArchiveProjectUseCase";
import { CompleteProjectUseCase } from "@src/application/usecases/project/CompleteProjectUseCase";
import { PauseProjectUseCase } from "@src/application/usecases/project/PauseProjectUseCase";
import { ResumeProjectUseCase } from "@src/application/usecases/project/ResumeProjectUseCase";
import { UnarchiveProjectUseCase } from "@src/application/usecases/project/UnarchiveProjectUseCase";
import { Project } from "@src/domain/entities/Project";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { ProjectStatus } from "@src/infrastructure/database/models/ProjectModel";

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

describe("Project status use cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pauses an active project", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new PauseProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Project",
      "team-id",
      "owner-id",
      ProjectStatus.ACTIVE,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(createTeam("owner-id"));
    projectRepository.saveProject.mockResolvedValueOnce(project);

    const result = await useCase.execute("project-id", "owner-id");

    expect(result.status).toBe(ProjectStatus.PAUSED);
    expect(projectRepository.saveProject).toHaveBeenCalledWith(project);
  });

  it("resumes a paused project", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new ResumeProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Project",
      "team-id",
      "owner-id",
      ProjectStatus.PAUSED,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(createTeam("owner-id"));
    projectRepository.saveProject.mockResolvedValueOnce(project);

    const result = await useCase.execute("project-id", "owner-id");

    expect(result.status).toBe(ProjectStatus.ACTIVE);
  });

  it("completes an active project", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new CompleteProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Project",
      "team-id",
      "owner-id",
      ProjectStatus.ACTIVE,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(createTeam("owner-id"));
    projectRepository.saveProject.mockResolvedValueOnce(project);

    const result = await useCase.execute("project-id", "owner-id");

    expect(result.status).toBe(ProjectStatus.COMPLETED);
  });

  it("archives a completed project", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new ArchiveProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Project",
      "team-id",
      "owner-id",
      ProjectStatus.COMPLETED,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(createTeam("owner-id"));
    projectRepository.saveProject.mockResolvedValueOnce(project);

    const result = await useCase.execute("project-id", "owner-id");

    expect(result.status).toBe(ProjectStatus.ARCHIVED);
  });

  it("unarchives an archived project", async () => {
    const projectRepository = {
      getProjectById: jest.fn(),
      saveProject: jest.fn(),
    };
    const teamRepository = {
      getTeamById: jest.fn(),
    };
    const logger = createLogger();

    const useCase = new UnarchiveProjectUseCase(
      projectRepository as any,
      teamRepository as any,
      logger as any,
    );

    const project = new Project(
      "project-id",
      "Project",
      "team-id",
      "owner-id",
      ProjectStatus.ARCHIVED,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(project);
    teamRepository.getTeamById.mockResolvedValueOnce(createTeam("owner-id"));
    projectRepository.saveProject.mockResolvedValueOnce(project);

    const result = await useCase.execute("project-id", "owner-id");

    expect(result.status).toBe(ProjectStatus.COMPLETED);
  });
});
