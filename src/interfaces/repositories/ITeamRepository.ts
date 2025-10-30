import { CreateTeamDTO } from "@src/domain/dtos/CreateTeamDTO";
import { Team } from "@src/domain/entities/Team";

/**
 * Fields allowed to be updated on an existing team.
 */
export type UpdateTeamData = Partial<CreateTeamDTO> & {
  leaderId?: string;
};

/**
 * Contract that must be implemented by any persistence mechanism handling teams.
 */
export interface ITeamRepository {
  /**
   * Persists a new team.
   */
  create(data: CreateTeamDTO): Promise<Team>;

  /**
   * Retrieves a team by its identifier.
   */
  findById(id: string): Promise<Team | null>;

  /**
   * Lists teams led by a specific user.
   */
  findByLeader(leaderId: string): Promise<Team[]>;

  /**
   * Lists teams that include the provided member identifier.
   */
  findByMember(userId: string): Promise<Team[]>;

  /**
   * Updates a team entity.
   */
  update(id: string, updates: UpdateTeamData): Promise<Team | null>;

  /**
   * Deletes a team.
   */
  delete(id: string): Promise<boolean>;
}
