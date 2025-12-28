import { Task } from "@src/domain/entities/Task";
import { TaskRepository } from "@src/infrastructure/repositories/TaskRepository";

describe("TaskRepository", () => {
  it("delegates to datasource for list", async () => {
    const datasource = {
      listTasksByProject: jest.fn(),
    };
    const repository = new TaskRepository(datasource as any);
    const task = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-1",
      createdBy: "user-1",
    });

    datasource.listTasksByProject.mockResolvedValueOnce([task]);

    const result = await repository.listTasksByProject("project-1", {
      status: "todo",
    });

    expect(result).toHaveLength(1);
    expect(datasource.listTasksByProject).toHaveBeenCalledWith("project-1", {
      status: "todo",
    });
  });
});
