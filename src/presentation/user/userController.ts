import { Request, Response } from "express";
import { ILogger } from "@src/interfaces/Logger";
import { ISecurityService } from "@src/domain/services/ISecurityService";
import { IUserRepository } from "@src/domain/repositories/IUserRepository";
import { GetAllUsersUseCase } from "@src/application/usecases/user/GetAllUsersUseCase";
import { GetUserByIdUseCase } from "@src/application/usecases/user/GetUserByIdUseCase";
import { GetUserByEmailUseCase } from "@src/application/usecases/user/GetUserByEmailUseCase";
import { UpdateUserSchema } from "@src/domain/dtos/UpdateUserDTO";
import { DeleteUserUseCase } from "@src/application/usecases/user/DeleteUserUseCase";
import { UpdateUserUseCase } from "@src/application/usecases/user/UpdateUserUseCase";
import { ChangePassSchema } from "@src/domain/dtos/ChangePassDTO";
import { ChangePassUseCase } from "@src/application/usecases/user/ChangePassUseCase";

export class UserController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly securityService: ISecurityService,
    private readonly logger: ILogger,
  ) {}

  getUserById = async (req: Request, res: Response) => {
    try {
      const userId = req.userId ? req.userId : null;
      if (!userId) {
        this.logger.error("User ID is required");
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const user = await new GetUserByIdUseCase(
        this.userRepository,
        this.logger,
      ).execute(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getUserByEmail = async (req: Request, res: Response) => {
    try {
      const email = req.params.email;
      if (!email) {
        this.logger.error("Email is required");
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      }

      const user = await new GetUserByEmailUseCase(
        this.userRepository,
        this.logger,
      ).execute(email);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getAllUsers = async (_req: Request, res: Response) => {
    try {
      const users = await new GetAllUsersUseCase(
        this.userRepository,
        this.logger,
      ).execute();
      res.status(200).json({ success: true, data: users });
    } catch (error: any) {
      this.logger.error("Error fetching users", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const userId = req.userId ? req.userId : null;
      if (!userId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const updateData = UpdateUserSchema.safeParse(req.body);

      if (!updateData.success) {
        this.logger.error("Invalid update data");
        return res
          .status(400)
          .json({ success: false, message: "Invalid update data" });
      }

      const user = await new UpdateUserUseCase(
        this.userRepository,
        this.securityService,
        this.logger,
      ).execute(userId, updateData.data!);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  changePassword = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        this.logger.error("Unauthorized: No user ID found in request");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const { currentPassword, newPassword } = req.body;

      const parsed = ChangePassSchema.safeParse({
        userId,
        currentPassword,
        newPassword,
      });

      if (!parsed.success) {
        this.logger.error("Invalid change password data", {
          issues: parsed.error.message,
        });

        return res.status(400).json({
          success: false,
          message: "Invalid change password data",
          errors: parsed.error.message,
        });
      }

      await new ChangePassUseCase(
        this.userRepository,
        this.securityService,
        this.logger,
      ).execute(parsed.data);
      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error: any) {
      this.logger.error("Error changing password", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      await new DeleteUserUseCase(this.userRepository, this.logger).execute(
        userId,
      );
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      this.logger.error("Error deleting user", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
