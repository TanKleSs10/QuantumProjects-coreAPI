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

jest.mock("@src/infrastructure/factories/taskRepositoryFactory", () => ({
  taskRepository: {
    createTask: jest.fn(),
    getTaskById: jest.fn(),
    saveTask: jest.fn(),
    listTasksByProject: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/projectRepositoryFactory", () => ({
  projectRepository: {
    getProjectById: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/teamRepositoryFactory", () => ({
  teamRepository: {
    getTeamById: jest.fn(),
  },
}));

jest.mock("@src/infrastructure/factories/eventBusFactory", () => ({
  eventBus: {
    publish: jest.fn(),
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
import { TaskRoutes } from "@src/presentation/task/taskRoutes";
import { Project } from "@src/domain/entities/Project";
import { Task } from "@src/domain/entities/Task";
import { ILogger } from "@src/interfaces/Logger";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/v1/projects/:projectId/tasks", TaskRoutes.projectRoutes);
  app.use("/api/v1/tasks", TaskRoutes.routes);
  return app;
};

const buildTeam = () => ({
  ownerId: "user-1",
  getMember: jest.fn(),
});

describe("Task endpoints", () => {
  let agent: ReturnType<typeof request>;

  const { taskRepository } = jest.requireMock(
    "@src/infrastructure/factories/taskRepositoryFactory",
  );
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
    projectRepository.getProjectById.mockResolvedValue(
      new Project("project-1", "Project", "team-1", "user-1"),
    );
    taskRepository.saveTask.mockImplementation(async (task: Task) => task);
    taskRepository.listTasksByProject.mockResolvedValue([]);
  });

  it("creates a task", async () => {
    taskRepository.createTask.mockImplementation(async (task: Task) => {
      return new Task({
        id: "task-1",
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        createdBy: task.createdBy,
        assigneeId: task.assigneeId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        tags: task.tags,
      });
    });

    const res = await agent.post("/api/v1/projects/project-1/tasks").send({
      title: "Task One",
      priority: "high",
      tags: ["mvp"],
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("task-1");
  });

  it("gets a task by id", async () => {
    taskRepository.getTaskById.mockResolvedValue(
      new Task({
        id: "task-1",
        title: "Task One",
        projectId: "project-1",
        createdBy: "user-1",
      }),
    );

    const res = await agent.get("/api/v1/tasks/task-1");

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe("task-1");
  });

  it("changes task status", async () => {
    taskRepository.getTaskById.mockResolvedValue(
      new Task({
        id: "task-1",
        title: "Task One",
        projectId: "project-1",
        createdBy: "user-1",
        assigneeId: "user-1",
      }),
    );

    const res = await agent.patch("/api/v1/tasks/task-1/status").send({
      status: "in_progress",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("in_progress");
  });

  it("lists tasks by project", async () => {
    taskRepository.listTasksByProject.mockResolvedValue([
      new Task({
        id: "task-1",
        title: "Task One",
        projectId: "project-1",
        createdBy: "user-1",
      }),
    ]);

    const res = await agent.get("/api/v1/projects/project-1/tasks");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
