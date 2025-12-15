import { InfrastructureError } from "@src/shared/errors/InfrastructureError";
import { ITeamDatasource } from "@src/domain/datasources/ITeamDatasource";
import { CreateTeamDTO } from "@src/domain/dtos/CreateTeamDTO";
import { UpdateTeamDTO } from "@src/domain/dtos/UpdateTeamDTO";
import { Team } from "@src/domain/entities/Team";
import { TeamMembership } from "@src/domain/entities/TeamMembership";
import { TeamMongoModel } from "../database/models/TeamModel";
import { TeamMapper } from "../mappers/TeamMapper";

// filepath: c:\Users\diego\OneDrive\Escritorio\devzone\QuantumProjects-coreAPI\src\infrastructure\datasources\TeamDasource.ts

export class TeamDatasource implements ITeamDatasource {
    async createTeam(teamData: CreateTeamDTO): Promise<Team> {
        try {
            const created = await TeamMongoModel.create(teamData);
            return TeamMapper.toDomain(created);
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error creating team", { cause: error });
        }
    }

    async getTeamById(teamId: string): Promise<Team> {
        try {
            const found = await TeamMongoModel.findById(teamId);
            if (!found) throw new InfrastructureError("Team not found");
            return TeamMapper.toDomain(found);
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error retrieving team by id", { cause: error });
        }
    }

    async getTeamByName(name: string): Promise<Team> {
        try {
            const found = await TeamMongoModel.findOne({ name });
            if (!found) throw new InfrastructureError("Team not found");
            return TeamMapper.toDomain(found);
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error retrieving team by name", { cause: error });
        }
    }

    async updateTeam(teamId: string, data: UpdateTeamDTO): Promise<Team> {
        try {
            const updated = await TeamMongoModel.findByIdAndUpdate(
                teamId,
                { $set: data },
                { new: true },
            );
            if (!updated) throw new InfrastructureError("Team not found");
            return TeamMapper.toDomain(updated);
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error updating team", { cause: error });
        }
    }

    async deleteTeam(teamId: string): Promise<void> {
        try {
            const deleted = await TeamMongoModel.findByIdAndDelete(teamId);
            if (!deleted) throw new InfrastructureError("Team not found");
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error deleting team", { cause: error });
        }
    }

    async listMembers(teamId: string): Promise<ReadonlyArray<TeamMembership>> {
        try {
            const team = await TeamMongoModel.findById(teamId, { members: 1 });
            if (!team) throw new InfrastructureError("Team not found");
            const members = (team.members ?? []).map((m: any) =>
                TeamMapper.toDomain({ ...team.toObject(), members: [m] }).getMembers()[0]
            );
            return Object.freeze(members);
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error listing team members", { cause: error });
        }
    }

    async addMember(teamId: string, membership: TeamMembership): Promise<void> {
        try {
            const update = await TeamMongoModel.findByIdAndUpdate(
                teamId,
                { $addToSet: { members: membership } },
                { new: false },
            );
            if (!update) throw new InfrastructureError("Team not found");
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error adding team member", { cause: error });
        }
    }

    async removeMember(teamId: string, userId: string): Promise<void> {
        try {
            const update = await TeamMongoModel.findByIdAndUpdate(
                teamId,
                { $pull: { members: { userId } } },
                { new: false },
            );
            if (!update) throw new InfrastructureError("Team not found");
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error removing team member", { cause: error });
        }
    }

    async promoteMemberToAdmin(teamId: string, userId: string): Promise<void> {
        try {
            const updated = await TeamMongoModel.findOneAndUpdate(
                { _id: teamId, "members.userId": userId },
                { $set: { "members.$.role": "admin" } },
                { new: true },
            );
            if (!updated) throw new InfrastructureError("Team or member not found");
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error promoting member to admin", { cause: error });
        }
    }

    async demoteMemberToMember(teamId: string, userId: string): Promise<void> {
        try {
            const updated = await TeamMongoModel.findOneAndUpdate(
                { _id: teamId, "members.userId": userId },
                { $set: { "members.$.role": "member" } },
                { new: true },
            );
            if (!updated) throw new InfrastructureError("Team or member not found");
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error demoting member to member", { cause: error });
        }
    }

    async listTeamsByUser(userId: string): Promise<Team[]> {
        try {
            const teams = await TeamMongoModel.find({ "members.userId": userId });
            if (!teams) throw new InfrastructureError("Error querying teams");
            return teams.map((t) => TeamMapper.toDomain(t));
        } catch (error) {
            if (error instanceof InfrastructureError) throw error;
            throw new InfrastructureError("Error listing teams by user", { cause: error });
        }
    }
}