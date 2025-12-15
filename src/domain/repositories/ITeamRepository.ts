import { CreateTeamDTO } from "../dtos/CreateTeamDTO";
import { UpdateTeamDTO } from "../dtos/UpdateTeamDTO";
import { Team } from "../entities/Team";
import { TeamMembership } from "../entities/TeamMembership";

// filepath: c:\Users\diego\OneDrive\Escritorio\devzone\QuantumProjects-coreAPI\src\domain\repositories\ITeamRepository.ts

export interface ITeamRepository {
    // Teams
    createTeam(teamData: CreateTeamDTO): Promise<Team>;
    getTeamById(teamId: string): Promise<Team>;
    getTeamByName(name: string): Promise<Team>;
    updateTeam(teamId: string, data: UpdateTeamDTO): Promise<Team>;
    deleteTeam(teamId: string): Promise<void>;

    // Memberships
    listMembers(teamId: string): Promise<ReadonlyArray<TeamMembership>>;
    addMember(teamId: string, membership: TeamMembership): Promise<void>;
    removeMember(teamId: string, userId: string): Promise<void>;
    promoteMemberToAdmin(teamId: string, userId: string): Promise<void>;
    demoteMemberToMember(teamId: string, userId: string): Promise<void>;

    // Queries
    listTeamsByUser(userId: string): Promise<Team[]>;
}