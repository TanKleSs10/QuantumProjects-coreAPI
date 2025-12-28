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
  app.use("/api/v1/projects", ProjectRoutes.routes);
  return app;
};

const buildTeam = () => ({
  id: "team-1",
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
        "proj-1",
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
      teamId: "team-1",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("proj-1");
  });

  it("rejects invalid create payload", async () => {
    const res = await agent.post("/api/v1/projects").send({});
    expect(res.status).toBe(400);
  });

  it("gets a project by id", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project("proj-1", "Project Alpha", "team-1", "user-1"),
    );

    const res = await agent.get("/api/v1/projects/proj-1");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("proj-1");
  });

  it("updates a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project("proj-1", "Project Alpha", "team-1", "user-1"),
    );

    const res = await agent.put("/api/v1/projects/proj-1").send({
      name: "Project Beta",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Project Beta");
  });

  it("pauses a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project("proj-1", "Project Alpha", "team-1", "user-1"),
    );

    const res = await agent.patch("/api/v1/projects/proj-1/pause");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.PAUSED);
  });

  it("resumes a project", async () => {
    const project = new Project("proj-1", "Project Alpha", "team-1", "user-1");
    project.status = ProjectStatus.PAUSED;
    projectRepository.getProjectById.mockResolvedValue(project);

    const res = await agent.patch("/api/v1/projects/proj-1/resume");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.ACTIVE);
  });

  it("completes a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project("proj-1", "Project Alpha", "team-1", "user-1"),
    );

    const res = await agent.patch("/api/v1/projects/proj-1/complete");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.COMPLETED);
  });

  it("archives a project", async () => {
    const project = new Project("proj-1", "Project Alpha", "team-1", "user-1");
    project.status = ProjectStatus.COMPLETED;
    projectRepository.getProjectById.mockResolvedValue(project);

    const res = await agent.patch("/api/v1/projects/proj-1/archive");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe(ProjectStatus.ARCHIVED);
  });

  it("deletes a project", async () => {
    projectRepository.getProjectById.mockResolvedValue(
      new Project("proj-1", "Project Alpha", "team-1", "user-1"),
    );

    const res = await agent.delete("/api/v1/projects/proj-1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Project deleted successfully");
  });
});
