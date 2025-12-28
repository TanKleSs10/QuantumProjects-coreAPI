import { Task } from "@src/domain/entities/Task";
import { DomainError } from "@src/shared/errors/DomainError";

describe("Task entity", () => {
  it("requires a title", () => {
    expect(() => {
      new Task({
        id: "task-1",
        title: " ",
        projectId: "project-1",
        createdBy: "user-1",
      });
    }).toThrow(DomainError);
  });

  it("allows valid status transitions", () => {
    const task = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-1",
      createdBy: "user-1",
    });

    task.changeStatus("in_progress");

    expect(task.status).toBe("in_progress");
  });

  it("blocks invalid status transitions", () => {
    const task = new Task({
      id: "task-1",
      title: "Task",
      projectId: "project-1",
      createdBy: "user-1",
      status: "done",
    });

    expect(() => task.changeStatus("todo")).toThrow(DomainError);
  });
});
