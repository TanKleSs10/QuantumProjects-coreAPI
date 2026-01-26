// 👇 IMPORTA PRIMERO LOS MOCKS DE ENVS Y LOGGER
jest.mock("@src/config/envs", () => ({
  envs: {
    PORT: 3000,
    ENVIRONMENT: "test",
    LOKI_HOST: "http://localhost",
    URI_DB: "mongodb://test",
    JWT_SECRET: "secret123",
    REFRESH_JWT_SECRET: "refresh123",
    SMTP_HOST: "smtp.test.com",
    SMTP_PORT: 587,
    SMTP_USER: "test",
    SMTP_PASS: "test",
    SMTP_SECURE: false,
  },
}));

jest.mock("@src/infrastructure/logs/LoggerFactory", () => {
  const logger: ILogger = {
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    child: jest.fn().mockReturnThis(),
    getLevel: jest.fn().mockReturnValue("debug"),
  };

  return { createLogger: () => logger };
});

jest.mock("@src/infrastructure/factories/projectRepositoryFactory", () => ({
  projectRepository: {
    createProject: jest.fn(),
    getProjectById: jest.fn(),
    getProjectsByTeamId: jest.fn(),
    saveProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/teamRepositoryFactory", () => ({
  teamRepository: {
    getTeamById: jest.fn(),
  },
}));

jest.mock("@src/application/middlewares/authmiddleware", () => ({
  authMiddleware: (req: any, _res: any, next: any) => {
    req.userId = "user-1";
    next();
  },
}));

import express from "express";
import request from "supertest";
import { ProjectRoutes } from "@src/presentation/project/projectRoutes";
import { Project } from "@src/domain/entities/Project";
import { ProjectStatus } from "@src/infrastructure/database/models/ProjectModel";
import { ILogger } from "@src/interfaces/Logger";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/teams/:teamId/projects", ProjectRoutes.teamRoutes);
  app.use("/api/v1/projects", ProjectRoutes.routes);
  return app;
};

const PROJECT_ID = "507f1f77bcf86cd799439011";
const TEAM_ID = "507f1f77bcf86cd799439012";

const buildTeam = () => ({
  id: TEAM_ID,
  ownerId: "user-1",
  getMember: jest.fn(),
});

describe("Project endpoints", () => {
  let agent: ReturnType<typeof request>;

  const { projectRepository } = jest.requireMock(
    "@src/infrastructure/factories/projectRepositoryFactory",
  );
  const { teamRepository } = jest.requireMock(
    "@src/infrastructure/factories/teamRepositoryFactory",
  );

  beforeEach(() => {
    const app = createTestApp();
    agent = request(app);
    jest.clearAllMocks();

    teamRepository.getTeamById.mockResolvedValue(buildTeam());
    projectRepository.saveProject.mockImplementation(async (project: Project) => project);
    projectRepository.deleteProject.mockResolvedValue(undefined);
  });

  it("creates a project", async () => {
    projectRepository.createProject.mockImplementation(async (project: Project) => {
      return new Project(
        PROJECT_ID,
        project.name,
        project.teamId,
        project.createdBy,
        project.status,
        project.description,
        project.tags,
        project.deadline,
      );
    });

    const res = await agent.post("/api/v1/projects").send({
      name: "Project Alpha",
      description: "Test project",
      teamId: TEAM_ID,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(PROJECT_ID);
  });

  it("rejects invalid create payload", async () => {
    const res = await agent.post("/api/v1/projects").send({});
    expect(res.status).toBe(400);
  });

  it("gets a project by id", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    );

    const res = await agent.get(`/api/v1/projects/${PROJECT_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(PROJECT_ID);
  });

  it("updates a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    );

    const res = await agent.put(`/api/v1/projects/${PROJECT_ID}`).send({
      name: "Project Beta",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Project Beta");
  });

  it("lists projects by team", async () => {
    projectRepository.getProjectsByTeamId.mockResolvedValue([
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    ]);

    const res = await agent.get(`/api/v1/teams/${TEAM_ID}/projects`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("patches a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    );

    const res = await agent.patch(`/api/v1/projects/${PROJECT_ID}`).send({
      description: "Updated description",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe("Updated description");
  });

  it("pauses a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    );

    const res = await agent.patch(`/api/v1/projects/${PROJECT_ID}/pause`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.PAUSED);
  });

  it("resumes a project", async () => {
    const project = new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1");
    project.status = ProjectStatus.PAUSED;
    projectRepository.getProjectById.mockResolvedValue(project);

    const res = await agent.patch(`/api/v1/projects/${PROJECT_ID}/resume`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.ACTIVE);
  });

  it("completes a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    );

    const res = await agent.patch(`/api/v1/projects/${PROJECT_ID}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.COMPLETED);
  });

  it("archives a project", async () => {
    const project = new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1");
    project.status = ProjectStatus.COMPLETED;
    projectRepository.getProjectById.mockResolvedValue(project);

    const res = await agent.patch(`/api/v1/projects/${PROJECT_ID}/archive`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.ARCHIVED);
  });

  it("unarchives a project", async () => {
    const project = new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1");
    project.status = ProjectStatus.ARCHIVED;
    projectRepository.getProjectById.mockResolvedValue(project);

    const res = await agent.patch(`/api/v1/projects/${PROJECT_ID}/unarchive`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.COMPLETED);
  });

  it("deletes a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project(PROJECT_ID, "Project Alpha", TEAM_ID, "user-1"),
    );

    const res = await agent.delete(`/api/v1/projects/${PROJECT_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Project deleted successfully");
  });
});
