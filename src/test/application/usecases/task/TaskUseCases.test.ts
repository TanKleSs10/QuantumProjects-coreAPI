import { AssignTaskUseCase } from "@src/application/usecases/task/AssignTaskUseCase";
import { ChangeTaskStatusUseCase } from "@src/application/usecases/task/ChangeTaskStatusUseCase";
import { CreateTaskUseCase } from "@src/application/usecases/task/CreateTaskUseCase";
import { UpdateTaskUseCase } from "@src/application/usecases/task/UpdateTaskUseCase";
import { Project } from "@src/domain/entities/Project";
import { Task } from "@src/domain/entities/Task";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { HttpError } from "@src/shared/errors/HttpError";

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

describe("Task use cases", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("creates a task when requester is owner", async () => {
    const taskRepository = { createTask: jest.fn() };
    const projectRepository = { getProjectById: jest.fn() };
    const teamRepository = { getTeamById: jest.fn() };
    const eventBus = { publish: jest.fn() };
    const logger = createLogger();

    const useCase = new CreateTaskUseCase(
      taskRepository as any,
      projectRepository as any,
      teamRepository as any,
      eventBus as any,
      logger as any,
    );

    projectRepository.getProjectById.mockResolvedValueOnce(
      new Project("project-id", "Project", "team-id", "owner-id"),
    );
    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createMember("user-1"));
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    const createdTask = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-id",
      createdBy: "owner-id",
    });
    taskRepository.createTask.mockResolvedValueOnce(createdTask);

    const result = await useCase.execute(
      { title: "Task", tags: [], status: "todo", priority: "medium" },
      "project-id",
      "owner-id",
    );

    expect(result).toBe(createdTask);
    expect(taskRepository.createTask).toHaveBeenCalledWith(expect.any(Task));
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it("rejects task creation for non-admin members", async () => {
    const taskRepository = { createTask: jest.fn() };
    const projectRepository = { getProjectById: jest.fn() };
    const teamRepository = { getTeamById: jest.fn() };
    const eventBus = { publish: jest.fn() };
    const logger = createLogger();

    const useCase = new CreateTaskUseCase(
      taskRepository as any,
      projectRepository as any,
      teamRepository as any,
      eventBus as any,
      logger as any,
    );

    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createMember("member-id"));

    projectRepository.getProjectById.mockResolvedValueOnce(
      new Project("project-id", "Project", "team-id", "owner-id"),
    );
    teamRepository.getTeamById.mockResolvedValueOnce(team);

    await expect(
      useCase.execute(
        { title: "Task", tags: [], status: "todo", priority: "medium" },
        "project-id",
        "member-id",
      ),
    ).rejects.toThrow(HttpError);
  });

  it("updates a task when requester is admin", async () => {
    const taskRepository = {
      getTaskById: jest.fn(),
      saveTask: jest.fn(),
    };
    const projectRepository = { getProjectById: jest.fn() };
    const teamRepository = { getTeamById: jest.fn() };
    const eventBus = { publish: jest.fn() };
    const logger = createLogger();

    const useCase = new UpdateTaskUseCase(
      taskRepository as any,
      projectRepository as any,
      teamRepository as any,
      eventBus as any,
      logger as any,
    );

    const task = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-id",
      createdBy: "owner-id",
      assigneeId: "user-1",
    });

    taskRepository.getTaskById.mockResolvedValueOnce(task);
    projectRepository.getProjectById.mockResolvedValueOnce(
      new Project("project-id", "Project", "team-id", "owner-id"),
    );
    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createAdmin("admin-id"));
    teamRepository.getTeamById.mockResolvedValueOnce(team);
    taskRepository.saveTask.mockImplementation(async (entity: Task) => entity);

    const result = await useCase.execute("task-1", "admin-id", { title: "Updated" });

    expect(result.title).toBe("Updated");
    expect(eventBus.publish).toHaveBeenCalled();
  });

  it("assigns a task when requester is admin", async () => {
    const taskRepository = {
      getTaskById: jest.fn(),
      saveTask: jest.fn(),
    };
    const projectRepository = { getProjectById: jest.fn() };
    const teamRepository = { getTeamById: jest.fn() };
    const eventBus = { publish: jest.fn() };
    const logger = createLogger();

    const useCase = new AssignTaskUseCase(
      taskRepository as any,
      projectRepository as any,
      teamRepository as any,
      eventBus as any,
      logger as any,
    );

    const task = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-id",
      createdBy: "owner-id",
    });

    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createAdmin("admin-id"));
    team.addMember(TeamMembership.createMember("assignee-id"));

    taskRepository.getTaskById.mockResolvedValueOnce(task);
    projectRepository.getProjectById.mockResolvedValueOnce(
      new Project("project-id", "Project", "team-id", "owner-id"),
    );
    teamRepository.getTeamById.mockResolvedValueOnce(team);
    taskRepository.saveTask.mockImplementation(async (entity: Task) => entity);

    const result = await useCase.execute("task-1", "admin-id", {
      assigneeId: "assignee-id",
    });

    expect(result.assigneeId).toBe("assignee-id");
  });

  it("changes task status when requester is assignee", async () => {
    const taskRepository = {
      getTaskById: jest.fn(),
      saveTask: jest.fn(),
    };
    const projectRepository = { getProjectById: jest.fn() };
    const teamRepository = { getTeamById: jest.fn() };
    const eventBus = { publish: jest.fn() };
    const logger = createLogger();

    const useCase = new ChangeTaskStatusUseCase(
      taskRepository as any,
      projectRepository as any,
      teamRepository as any,
      eventBus as any,
      logger as any,
    );

    const task = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-id",
      createdBy: "owner-id",
      assigneeId: "user-1",
    });

    taskRepository.getTaskById.mockResolvedValueOnce(task);
    projectRepository.getProjectById.mockResolvedValueOnce(
      new Project("project-id", "Project", "team-id", "owner-id"),
    );
    const team = createTeam("owner-id");
    team.addMember(TeamMembership.createMember("user-1"));
    teamRepository.getTeamById.mockResolvedValueOnce(team);
    taskRepository.saveTask.mockImplementation(async (entity: Task) => entity);

    const result = await useCase.execute("task-1", "user-1", { status: "in_progress" });

    expect(result.status).toBe("in_progress");
  });
});
