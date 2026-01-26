import { Task } from "@src/domain/entities/Task";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { ApplicationError } from "@src/shared/errors/ApplicationError";
import { DomainError } from "@src/shared/errors/DomainError";

export interface IListTasksByTeamUseCase {
  execute(teamId: string, requesterId: string): Promise<Task[]>;
}

export class ListTasksByTeamUseCase implements IListTasksByTeamUseCase {
  private readonly logger: ILogger;

  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ListTasksByTeamUseCase");
  }

  async execute(teamId: string, requesterId: string): Promise<Task[]> {
    try {
      this.logger.debug("Listing tasks by team", { teamId, requesterId });

      const team = await this.teamRepository.getTeamById(teamId);
      if (!team) {
        this.logger.warn("Team not found", { teamId });
        throw new DomainError("Team not found");
      }

      const requesterRole = this.getMemberRole(team, requesterId);
      if (!requesterRole) {
        this.logger.warn("Unauthorized team tasks list attempt", {
          teamId,
          requesterId,
        });
        throw new DomainError("Insufficient permissions");
      }

      const projects = await this.projectRepository.getProjectsByTeamId(teamId);
      if (!projects.length) {
        this.logger.info("No projects found for team", { teamId });
        return [];
      }

      const taskGroups = await Promise.all(
        projects.map((project) =>
          this.taskRepository.listTasksByProject(project.id),
        ),
      );
      const tasks = taskGroups.flat();
      const visibleTasks = this.filterTasksForRole(tasks, requesterId, requesterRole);

      this.logger.info("Tasks retrieved successfully", {
        teamId,
        count: visibleTasks.length,
      });
      return visibleTasks;
    } catch (error: any) {
      if (error instanceof DomainError) throw error;

      this.logger.error("Failed to list tasks by team", {
        teamId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ApplicationError("Failed to list tasks by team", {
        cause: error,
      });
    }
  }

  private getMemberRole(
    team: { ownerId: string; getMember(userId: string): { role: string } | undefined },
    userId: string,
  ): "owner" | "admin" | "member" | null {
    if (team.ownerId === userId) return "owner";
    return (team.getMember(userId)?.role as "admin" | "member") ?? null;
  }

  private filterTasksForRole(
    tasks: Task[],
    userId: string,
    role: "owner" | "admin" | "member",
  ): Task[] {
    if (role === "owner" || role === "admin") return tasks;
    return tasks.filter((task) => task.assigneeId === userId);
  }
}
