import { CreateProjectDTO } from "@src/domain/dtos/CreateProjectDTO";
import { Project } from "@src/domain/entities/Project";
import { ProjectStatus } from "@src/domain/entities/Project";

/**
 * Fields allowed to be updated on an existing project.
 */
export type UpdateProjectData = Partial<CreateProjectDTO> & {
  ownerId?: string;
};

/**
 * Contract that must be implemented by any persistence mechanism handling projects.
 */
export interface IProjectRepository {
  /**
   * Persists a new project.
   */
  create(data: CreateProjectDTO): Promise<Project>;

  /**
   * Retrieves a project by its identifier.
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Lists projects created by a specific owner.
   */
  findByOwner(ownerId: string): Promise<Project[]>;

  /**
   * Lists projects assigned to a particular team.
   */
  findByTeam(teamId: string): Promise<Project[]>;

  /**
   * Lists projects filtered by their lifecycle status.
   */
  listByStatus(status: ProjectStatus): Promise<Project[]>;

  /**
   * Updates a project and returns the persisted entity.
   */
  update(id: string, updates: UpdateProjectData): Promise<Project | null>;

  /**
   * Deletes a project.
   */
  delete(id: string): Promise<boolean>;
}
