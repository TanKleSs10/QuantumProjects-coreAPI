import { TeamMembership, TeamRole } from "@src/domain/entities/TeamMembership";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITaskRepository } from "@src/domain/repositories/ITaskRepository";
import { ITeamMembershipRepository } from "@src/domain/repositories/ITeamMembershipRepository";

export class TaskPermissionService {
  constructor(
    private readonly membershipRepository: ITeamMembershipRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly taskRepository: ITaskRepository,
  ) {}

  private isProjectAdminRole(role?: TeamRole): boolean {
    return role === "owner" || role === "admin";
  }

  private async getMembershipForProject(
    userId: string,
    projectId: string,
  ): Promise<TeamMembership | null> {
    const project = await this.projectRepository.getProjectById(projectId);
    if (!project) return null;
    return this.membershipRepository.getMembership(project.teamId, userId);
  }

  private async isProjectAdmin(userId: string, projectId: string): Promise<boolean> {
    const membership = await this.getMembershipForProject(userId, projectId);
    return this.isProjectAdminRole(membership?.role);
  }

  async canCreateTask(userId: string, projectId: string): Promise<boolean> {
    return this.isProjectAdmin(userId, projectId);
  }

  async canAssignTask(userId: string, projectId: string): Promise<boolean> {
    return this.isProjectAdmin(userId, projectId);
  }

  async canViewTask(userId: string, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) return false;

    if (task.assignedToIds.includes(userId)) return true;

    return this.isProjectAdmin(userId, task.projectId);
  }

  async canUpdateTask(userId: string, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) return false;

    return task.assignedToIds.includes(userId);
  }

  async canDeleteTask(userId: string, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.getTaskById(taskId);
    if (!task) return false;

    return task.createdBy === userId;
  }
}
