import { Request, Response } from "express";
import { CreateProjectUseCase } from "@src/application/usecases/project/CreateProjectUseCase";
import { DeleteProjectUseCase } from "@src/application/usecases/project/DeleteProjectUseCase";
import { GetProjectByIdUseCase } from "@src/application/usecases/project/GetProjectByIdUseCase";
import { UpdateProjectUseCase } from "@src/application/usecases/project/UpdateProjectUseCase";
import { PauseProjectUseCase } from "@src/application/usecases/project/PauseProjectUseCase";
import { ResumeProjectUseCase } from "@src/application/usecases/project/ResumeProjectUseCase";
import { CompleteProjectUseCase } from "@src/application/usecases/project/CompleteProjectUseCase";
import { ArchiveProjectUseCase } from "@src/application/usecases/project/ArchiveProjectUseCase";
import { ListProjectsByTeamUseCase } from "@src/application/usecases/project/ListProjectsByTeamUseCase";
import { ListProjectsByUserUseCase } from "@src/application/usecases/project/ListProjectsByUserUseCase";
import { UnarchiveProjectUseCase } from "@src/application/usecases/project/UnarchiveProjectUseCase";
import { CreateProjectSchema } from "@src/domain/dtos/CreateProjectDTO";
import { UpdateProjectSchema } from "@src/domain/dtos/UpdateProjectDTO";
import { IProjectRepository } from "@src/domain/repositories/IProjectRepository";
import { ITeamRepository } from "@src/domain/repositories/ITeamRepository";
import { ILogger } from "@src/interfaces/Logger";
import { DomainError } from "@src/shared/errors/DomainError";

export class ProjectController {
  private readonly logger: ILogger;

  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly teamRepository: ITeamRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child("ProjectController");
  }

  createProject = async (req: Request, res: Response) => {
    try {
      const requesterId = req.userId ?? null;
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const teamId = req.params.teamId ?? req.body?.teamId;
      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: "Team ID is required",
        });
      }

      const parsed = CreateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid create project payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const project = await new CreateProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(parsed.data, teamId, requesterId);

      return res.status(201).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  listProjectsByTeam = async (req: Request, res: Response) => {
    try {
      const requesterId = req.userId ?? null;
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const teamId = req.params.teamId ?? null;

      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: "Team ID is required",
        });
      }

      const projects = await new ListProjectsByTeamUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(teamId, requesterId);

      return res.status(200).json({ success: true, data: projects });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  listProjectsByUser = async (req: Request, res: Response) => {
    try {
      const userId = req.userId ?? null;
      if (!userId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const projects = await new ListProjectsByUserUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(userId);

      return res.status(200).json({ success: true, data: projects });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getProjectById = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const project = await new GetProjectByIdUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsed = UpdateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid update project payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const project = await new UpdateProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  patchProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const parsed = UpdateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        this.logger.warn("Invalid patch project payload", {
          issues: parsed.error.message,
        });
        return res.status(400).json({
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid payload",
        });
      }

      const project = await new UpdateProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId, parsed.data);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  pauseProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const project = await new PauseProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  resumeProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const project = await new ResumeProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  completeProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const project = await new CompleteProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  archiveProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const project = await new ArchiveProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  unarchiveProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const project = await new UnarchiveProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteProject = async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      const requesterId = req.userId ?? null;
      if (!projectId) {
        return res
          .status(400)
          .json({ success: false, message: "Project ID is required" });
      }
      if (!requesterId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      await new DeleteProjectUseCase(
        this.projectRepository,
        this.teamRepository,
        this.logger,
      ).execute(projectId, requesterId);

      return res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: unknown) {
    if (error instanceof DomainError) {
      return res.status(400).json({ success: false, message: error.message });
    }

    this.logger.error("Unexpected project error", {
      error: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
