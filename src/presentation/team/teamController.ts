import { Request, Response } from "express";
import { AddMemberUseCase } from "@src/application/usecases/team/AddMemberUseCase";
import { CreateTeamUseCase } from "@src/application/usecases/team/CreateTeamUseCase";
import { DemoteMemberUseCase } from "@src/application/usecases/team/DemoteMemberUseCase";
import { GetTeamByIdUseCase } from "@src/application/usecases/team/GetTeamByIdUseCase";
import { ListTeamsByUserUseCase } from "@src/application/usecases/team/ListTeamsByUserUseCase";
import { PromoteMemberUseCase } from "@src/application/usecases/team/PromoteMemberUseCase";
import { RemoveMemberUseCase } from "@src/application/usecases/team/RemoveMemberUseCase";
import { CreateTeamSchema } from "@src/domain/dtos/CreateTeamDTO";
import { InviteMemberSchema } from "@src/domain/dtos/InvitateMemberDTO";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";

export class TeamController {
  private readonly logger: ILogger;

  constructor(
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("TeamController");
  }

  createTeam = async (req: Request, res: Response) => {
    try {
      const ownerId = req.userId ? req.userId : null;
      if (!ownerId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsed = CreateTeamSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid create team payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const team = await new CreateTeamUseCase(
        this.teamRepository,
        this.logger,
      ).execute(parsed.data, ownerId);

      return res.status(201).json({ success: true, data: team });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getTeamById = async (req: Request, res: Response) => {
    try {
      const teamId = req.params.id;
      const requesterId = req.userId;
      if (!teamId) {
        return res
          .status(400)
          .json({ success: false, message: "Team ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const team = await new GetTeamByIdUseCase(
        this.teamRepository,
        this.logger,
      ).execute(teamId, requesterId);

      return res.status(200).json({ success: true, data: team });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  listTeamsByUser = async (req: Request, res: Response) => {
    try {
      const userId = req.userId ? req.userId : null;
      if (!userId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const teams = await new ListTeamsByUserUseCase(
        this.teamRepository,
        this.logger,
      ).execute(userId);

      return res.status(200).json({ success: true, data: teams });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  addMember = async (req: Request, res: Response) => {
    try {
      const teamId = req.params.id;
      const requesterId = req.userId;
      if (!teamId) {
        return res
          .status(400)
          .json({ success: false, message: "Team ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsed = InviteMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid add member payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const team = await new AddMemberUseCase(
        this.teamRepository,
        this.logger,
      ).execute(teamId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: team });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  removeMember = async (req: Request, res: Response) => {
    try {
      const teamId = req.params.id;
      const userId = req.params.userId;
      const requesterId = req.userId;

      if (!teamId || !userId) {
        return res.status(400).json({
          success: false,
          message: "Team ID and user ID are required",
        });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const team = await new RemoveMemberUseCase(
        this.teamRepository,
        this.logger,
      ).execute(teamId, requesterId, userId);

      return res.status(200).json({ success: true, data: team });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  promoteMember = async (req: Request, res: Response) => {
    try {
      const teamId = req.params.id;
      const userId = req.params.userId;
      const requesterId = req.userId;

      if (!teamId || !userId) {
        return res.status(400).json({
          success: false,
          message: "Team ID and user ID are required",
        });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const team = await new PromoteMemberUseCase(
        this.teamRepository,
        this.logger,
      ).execute(teamId, requesterId, userId);

      return res.status(200).json({ success: true, data: team });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  demoteMember = async (req: Request, res: Response) => {
    try {
      const teamId = req.params.id;
      const userId = req.params.userId;
      const requesterId = req.userId;

      if (!teamId || !userId) {
        return res.status(400).json({
          success: false,
          message: "Team ID and user ID are required",
        });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const team = await new DemoteMemberUseCase(
        this.teamRepository,
        this.logger,
      ).execute(teamId, requesterId, userId);

      return res.status(200).json({ success: true, data: team });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown) {
    if (error instanceof DomainError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    this.logger.error("Unexpected team error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
